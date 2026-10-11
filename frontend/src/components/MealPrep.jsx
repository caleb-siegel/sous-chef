import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Button, IconButton, Tooltip, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    Tabs, Tab, Chip, Snackbar, Alert, 
    Skeleton, CircularProgress, useTheme, useMediaQuery, 
    Divider, InputAdornment 
} from '@mui/material';
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import { useOutletContext, Link } from "react-router-dom";

// Icons
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ViewWeekIcon from '@mui/icons-material/ViewWeek';
import ViewSidebarIcon from '@mui/icons-material/ViewSidebar';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import FreeBreakfastIcon from '@mui/icons-material/FreeBreakfast';
import WbSunnyIcon from '@mui/icons-material/WbSunny';
import NightsStayIcon from '@mui/icons-material/NightsStay';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StarIcon from '@mui/icons-material/Star';
import CloseIcon from '@mui/icons-material/Close';

import ShoppingList from './ShoppingList';
import { getRecipeSlug } from '../utils/slugify';
import './MealPrep.css';

const WEEKDAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const MEAL_TYPES = ['Breakfast', 'Lunch', 'Dinner'];

// Meal Icon helper
const getMealIcon = (meal) => {
    switch (meal) {
        case 'Breakfast':
            return <FreeBreakfastIcon fontSize="inherit" style={{ color: 'var(--mp-breakfast)' }} />;
        case 'Lunch':
            return <WbSunnyIcon fontSize="inherit" style={{ color: 'var(--mp-lunch)' }} />;
        case 'Dinner':
            return <NightsStayIcon fontSize="inherit" style={{ color: 'var(--mp-dinner)' }} />;
        default:
            return <RestaurantMenuIcon fontSize="inherit" />;
    }
};

// ============================================================================
// Draggable Recipe Meal Chip Component
// ============================================================================
const DraggableMealCard = ({ prep, onDelete }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'recipe',
        item: { 
            id: prep.id, 
            recipe: prep.recipe, 
            recipe_name: prep.recipe_name, 
            weekday: prep.weekday, 
            meal: prep.meal 
        },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }), [prep]);

    const displayName = prep.recipe?.name || prep.recipe_name || 'Custom Meal';
    const slug = prep.recipe ? getRecipeSlug(prep.recipe) : null;

    return (
        <div 
            ref={drag}
            className={`mealprep-chip ${isDragging ? 'is-dragging' : ''}`}
            title="Drag to move to another day or meal"
        >
            {slug ? (
                <Link 
                    to={`/recipes/${slug}`} 
                    className="mealprep-chip-title"
                >
                    {displayName}
                </Link>
            ) : (
                <span className="mealprep-chip-title">
                    {displayName}
                </span>
            )}

            <button 
                type="button" 
                className="mealprep-chip-delete-btn"
                title="Remove meal"
                onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onDelete(e, prep.id);
                }}
            >
                <CloseIcon sx={{ fontSize: 16 }} />
            </button>
        </div>
    );
};

// ============================================================================
// Droppable Meal Slot Component
// ============================================================================
const DroppableMealSlot = ({ weekday, meal, mealsForSlot, onDrop, onQuickAdd, onDelete }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'recipe',
        drop: (item) => onDrop(item, weekday, meal),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }), [weekday, meal]);

    return (
        <div 
            ref={drop} 
            className={`mealprep-slot ${isOver ? 'is-hovered' : ''}`}
        >
            <div className="mealprep-slot-header">
                <span className={`mealprep-slot-title ${meal.toLowerCase()}`}>
                    {getMealIcon(meal)}
                    <span>{meal}</span>
                </span>
                <button 
                    type="button" 
                    className="mealprep-slot-quick-add"
                    title={`Add ${meal} on ${weekday}`}
                    onClick={() => onQuickAdd(weekday, meal)}
                >
                    <AddIcon sx={{ fontSize: 15 }} />
                </button>
            </div>

            {mealsForSlot.length > 0 && (
                <div className="mealprep-slot-content">
                    {mealsForSlot.map(prep => (
                        <DraggableMealCard 
                            key={prep.id} 
                            prep={prep} 
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// ============================================================================
// Main MealPrep Component
// ============================================================================
function MealPrep() {
    const { user, backendUrl } = useOutletContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const isTablet = useMediaQuery(theme.breakpoints.down('md'));

    // State
    const [mealPrep, setMealPrep] = useState([]);
    const [allRecipes, setAllRecipes] = useState([]);
    const [userFavorites, setUserFavorites] = useState({});
    const [loading, setLoading] = useState(true);
    const [viewMode, setViewMode] = useState('board'); // 'board' | 'split' | 'shopping'
    const [dayFilter, setDayFilter] = useState('all');

    // Dialog & Interaction State
    const [dialogOpen, setDialogOpen] = useState(false);
    const [dialogWeekday, setDialogWeekday] = useState('Monday');
    const [dialogMeal, setDialogMeal] = useState('Dinner');
    const [dialogTab, setDialogTab] = useState(0); // 0 = Recipes, 1 = Custom Meal
    const [searchQuery, setSearchQuery] = useState('');
    const [filterFavoritesOnly, setFilterFavoritesOnly] = useState(false);
    const [customMealName, setCustomMealName] = useState('');
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Today's Day Name
    const todayName = useMemo(() => {
        return new Date().toLocaleDateString('en-US', { weekday: 'long' });
    }, []);

    // Set document title
    useEffect(() => {
        document.title = 'Weekly Meal Planner | Sous-Chef';
    }, []);

    // Fetch meal prep items
    const fetchMealPrep = () => {
        const url = user?.id ? `${backendUrl}/api/mealprep?user_id=${user.id}` : `${backendUrl}/api/mealprep`;
        fetch(url, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                setMealPrep(Array.isArray(data) ? data : []);
                setLoading(false);
            })
            .catch(() => {
                setMealPrep([]);
                setLoading(false);
            });
    };

    // Fetch all recipes for picker
    const fetchRecipes = () => {
        fetch(`${backendUrl}/api/recipes`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAllRecipes(data);
                }
            })
            .catch(err => console.warn('Could not load recipes for picker:', err));
    };

    // Fetch user favorites
    const fetchFavorites = () => {
        if (!user?.id) return;
        fetch(`${backendUrl}/api/userrecipes`, { credentials: "include" })
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const favMap = {};
                    data.forEach(ur => {
                        if (ur.recipe_id) favMap[ur.recipe_id] = ur.id;
                    });
                    setUserFavorites(favMap);
                }
            })
            .catch(err => console.warn('Could not load favorites:', err));
    };

    useEffect(() => {
        fetchMealPrep();
        fetchRecipes();
        fetchFavorites();
    }, [user, backendUrl]);

    // Delete single meal
    const handleDelete = async (event, id) => {
        if (event && event.preventDefault) event.preventDefault();
        try {
            await fetch(`${backendUrl}/api/mealprep/${id}`, {
                method: "DELETE",
                credentials: "include",
            });
            setMealPrep(prev => prev.filter(p => p.id !== id));
            setSnackbar({ open: true, message: 'Meal removed from planner! 🗑️', severity: 'info' });
        } catch (err) {
            console.error('Delete meal error:', err);
        }
    };

    // Drag-and-drop or move handler
    const handleDrop = async (item, newWeekday, newMeal) => {
        if (item.weekday === newWeekday && item.meal === newMeal) return;

        // Optimistic UI update: preserve item id, just update weekday and meal
        setMealPrep(prev => prev.map(p => 
            p.id === item.id 
                ? { ...p, weekday: newWeekday, meal: newMeal } 
                : p
        ));

        try {
            const res = await fetch(`${backendUrl}/api/mealprep/${item.id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    weekday: newWeekday,
                    meal: newMeal,
                }),
            });

            if (res.ok) {
                const persisted = await res.json();
                setMealPrep(prev => prev.map(p => p.id === item.id ? { ...p, ...persisted } : p));
                const recipeTitle = item.recipe?.name || item.recipe_name || 'Meal';
                setSnackbar({ open: true, message: `Moved "${recipeTitle}" to ${newWeekday} ${newMeal}! 🍲`, severity: 'success' });
            } else {
                fetchMealPrep(); // revert on non-ok response
            }
        } catch (err) {
            console.error('Error repositioning meal:', err);
            fetchMealPrep(); // revert on failure
        }
    };

    // Quick Add from slot button
    const handleOpenQuickAdd = (weekday, meal) => {
        setDialogWeekday(weekday);
        setDialogMeal(meal);
        setSearchQuery('');
        setCustomMealName('');
        setDialogOpen(true);
    };

    // Submit Recipe to Meal Plan
    const handleSelectRecipeToAdd = async (recipe) => {
        setDialogOpen(false);
        try {
            const res = await fetch(`${backendUrl}/api/mealprep`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: user ? user.id : null,
                    recipe_id: recipe.id,
                    weekday: dialogWeekday,
                    meal: dialogMeal,
                }),
            });
            if (res.ok) {
                const newPrep = await res.json();
                // Ensure the recipe object is attached for instant display
                newPrep.recipe = recipe;
                setMealPrep(prev => [...prev, newPrep]);
                setSnackbar({ open: true, message: `Added "${recipe.name}" to ${dialogWeekday} ${dialogMeal}! ✨`, severity: 'success' });
            }
        } catch (err) {
            console.error('Failed to add meal prep:', err);
            setSnackbar({ open: true, message: 'Failed to add meal', severity: 'error' });
        }
    };

    // Submit Custom Meal
    const handleSubmitCustomMeal = async () => {
        if (!customMealName.trim()) return;
        const mealTitle = customMealName.trim();
        setDialogOpen(false);
        try {
            const res = await fetch(`${backendUrl}/api/mealprep`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: user ? user.id : null,
                    recipe_id: null,
                    recipe_name: mealTitle,
                    weekday: dialogWeekday,
                    meal: dialogMeal,
                }),
            });
            if (res.ok) {
                const newPrep = await res.json();
                if (!newPrep.recipe_name) {
                    newPrep.recipe_name = mealTitle;
                }
                setMealPrep(prev => [...prev, newPrep]);
                setCustomMealName('');
                setSnackbar({ open: true, message: `Added "${mealTitle}" to ${dialogWeekday} ${dialogMeal}! 🍽️`, severity: 'success' });
            }
        } catch (err) {
            console.error('Failed to add custom meal:', err);
        }
    };

    // Filter recipes for dialog picker
    const filteredRecipes = useMemo(() => {
        let list = allRecipes;
        if (filterFavoritesOnly) {
            list = list.filter(r => Boolean(userFavorites[r.id]));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(r => 
                (r.name && r.name.toLowerCase().includes(q)) ||
                (r.source && r.source.toLowerCase().includes(q))
            );
        }
        return list.slice(0, 48); // limit for swift rendering
    }, [allRecipes, searchQuery, filterFavoritesOnly, userFavorites]);

    // Statistics
    const totalMealsCount = mealPrep.filter(p => !user || !user.id || user.id === p.user_id).length;

    // Display weekdays based on filter
    const displayedWeekdays = useMemo(() => {
        if (dayFilter === 'all') return WEEKDAYS;
        return WEEKDAYS.filter(d => d === dayFilter);
    }, [dayFilter]);

    return (
        <DndProvider backend={HTML5Backend}>
            <main className="mealprep-root">
                {/* Header */}
                <header className="mealprep-header">
                    <div className="mealprep-title-area">
                        <h1>
                            <span className="emoji-badge">📅</span>
                            <span>Weekly Meal Planner</span>
                        </h1>
                        <p className="mealprep-subtitle">
                            Organize your delicious weekly culinary journey, drag & drop meals, and generate your unified grocery shopping list.
                        </p>
                    </div>
                </header>

                {/* Toolbar */}
                <div className="mealprep-toolbar">
                    <div className="mealprep-toolbar-left">
                        {/* View Switcher */}
                        <div className="mealprep-view-switcher">
                            <button 
                                type="button" 
                                className={`mealprep-view-btn ${viewMode === 'board' ? 'active' : ''}`}
                                onClick={() => setViewMode('board')}
                            >
                                <ViewWeekIcon fontSize="small" />
                                <span>Weekly Board</span>
                            </button>
                            <button 
                                type="button" 
                                className={`mealprep-view-btn ${viewMode === 'split' ? 'active' : ''}`}
                                onClick={() => setViewMode('split')}
                            >
                                <ViewSidebarIcon fontSize="small" />
                                <span>Split View</span>
                            </button>
                            <button 
                                type="button" 
                                className={`mealprep-view-btn ${viewMode === 'shopping' ? 'active' : ''}`}
                                onClick={() => setViewMode('shopping')}
                            >
                                <ShoppingBagIcon fontSize="small" />
                                <span>Grocery List</span>
                            </button>
                        </div>
                    </div>

                    <div className="mealprep-toolbar-right">
                        {/* Quick Plan Button */}
                        <button 
                            type="button" 
                            className="mealprep-btn-primary"
                            onClick={() => {
                                setDialogWeekday(todayName);
                                setDialogMeal('Dinner');
                                setDialogOpen(true);
                            }}
                        >
                            <AddIcon fontSize="small" />
                            <span>Plan a Meal</span>
                        </button>
                    </div>
                </div>

                {/* Day Filter Bar (Mobile / Focused View) */}
                <div className="mealprep-day-filter-bar">
                    <button
                        type="button"
                        className={`mealprep-day-filter-chip ${dayFilter === 'all' ? 'active' : ''}`}
                        onClick={() => setDayFilter('all')}
                    >
                        <span>All Days</span>
                        <span className="chip-count">{totalMealsCount}</span>
                    </button>
                    {WEEKDAYS.map(day => {
                        const countForDay = mealPrep.filter(p => (!user || !user.id || user.id === p.user_id) && p.weekday === day).length;
                        const isCurrentDay = day === todayName;
                        return (
                            <button
                                key={day}
                                type="button"
                                className={`mealprep-day-filter-chip ${dayFilter === day ? 'active' : ''} ${isCurrentDay ? 'is-today' : ''}`}
                                onClick={() => setDayFilter(day)}
                            >
                                <span>{isMobile ? day.slice(0, 3) : day}</span>
                                {isCurrentDay && <span style={{ color: 'var(--mp-secondary)', fontSize: '0.7rem' }}>•</span>}
                                {countForDay > 0 && <span className="chip-count">{countForDay}</span>}
                            </button>
                        );
                    })}
                </div>

                {/* Main Content Area */}
                {loading ? (
                    <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 2, py: 4 }}>
                        {WEEKDAYS.map(day => (
                            <Skeleton key={day} variant="rounded" height={360} sx={{ borderRadius: 3 }} />
                        ))}
                    </Box>
                ) : (
                    <>
                        {viewMode === 'board' && (
                            <div className="mealprep-calendar-grid">
                                {displayedWeekdays.map(weekday => {
                                    const isToday = weekday === todayName;
                                    return (
                                        <div 
                                            key={weekday} 
                                            className={`mealprep-day-card ${isToday ? 'is-today' : ''} ${dayFilter === weekday ? 'is-selected' : ''}`}
                                        >
                                            <div 
                                                className="mealprep-day-header clickable"
                                                onClick={() => setDayFilter(dayFilter === weekday ? 'all' : weekday)}
                                                title={dayFilter === weekday ? "Click to view all days" : `Click to filter recipes and groceries to ${weekday}`}
                                            >
                                                <h3 className="mealprep-day-title">
                                                    <span>{weekday}</span>
                                                    {isToday && <span className="today-badge">Today</span>}
                                                </h3>
                                            </div>

                                            <div className="mealprep-day-body">
                                                {MEAL_TYPES.map(meal => {
                                                    const mealsForSlot = mealPrep.filter(p => 
                                                        (!user || !user.id || user.id === p.user_id) && 
                                                        p.weekday === weekday && 
                                                        p.meal === meal
                                                    );

                                                    return (
                                                        <DroppableMealSlot 
                                                            key={`${weekday}-${meal}`}
                                                            weekday={weekday}
                                                            meal={meal}
                                                            mealsForSlot={mealsForSlot}
                                                            onDrop={handleDrop}
                                                            onQuickAdd={handleOpenQuickAdd}
                                                            onDelete={handleDelete}
                                                        />
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {viewMode === 'split' && (
                            <div className="mealprep-split-view">
                                <div className="mealprep-calendar-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
                                    {displayedWeekdays.map(weekday => {
                                        const isToday = weekday === todayName;
                                        return (
                                            <div 
                                                key={weekday} 
                                                className={`mealprep-day-card ${isToday ? 'is-today' : ''} ${dayFilter === weekday ? 'is-selected' : ''}`}
                                            >
                                                <div 
                                                    className="mealprep-day-header clickable"
                                                    onClick={() => setDayFilter(dayFilter === weekday ? 'all' : weekday)}
                                                    title={dayFilter === weekday ? "Click to view all days" : `Click to filter recipes and groceries to ${weekday}`}
                                                >
                                                    <h3 className="mealprep-day-title">
                                                        <span>{weekday}</span>
                                                        {isToday && <span className="today-badge">Today</span>}
                                                    </h3>
                                                </div>

                                                <div className="mealprep-day-body">
                                                    {MEAL_TYPES.map(meal => {
                                                        const mealsForSlot = mealPrep.filter(p => 
                                                            (!user || !user.id || user.id === p.user_id) && 
                                                            p.weekday === weekday && 
                                                            p.meal === meal
                                                        );

                                                        return (
                                                            <DroppableMealSlot 
                                                                key={`${weekday}-${meal}`}
                                                                weekday={weekday}
                                                                meal={meal}
                                                                mealsForSlot={mealsForSlot}
                                                                onDrop={handleDrop}
                                                                onQuickAdd={handleOpenQuickAdd}
                                                                onDelete={handleDelete}
                                                            />
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                <div className="mealprep-split-side">
                                    <ShoppingList 
                                        mealPrep={mealPrep} 
                                        user={user} 
                                        dayFilter={dayFilter}
                                        onSelectDay={setDayFilter}
                                    />
                                </div>
                            </div>
                        )}

                        {viewMode === 'shopping' && (
                            <div style={{ maxWidth: 960, margin: '0 auto' }}>
                                <ShoppingList 
                                    mealPrep={mealPrep} 
                                    user={user} 
                                    dayFilter={dayFilter}
                                    onSelectDay={setDayFilter}
                                />
                            </div>
                        )}
                    </>
                )}

                {/* Plan a Meal Dialog */}
                <Dialog 
                    open={dialogOpen} 
                    onClose={() => setDialogOpen(false)}
                    maxWidth="md"
                    fullWidth
                    PaperProps={{
                        sx: { borderRadius: 4, overflow: 'hidden' }
                    }}
                >
                    <DialogTitle sx={{ 
                        m: 0, p: 2.5, 
                        bgcolor: 'var(--mp-surface-alt)', 
                        borderBottom: '1px solid var(--mp-border)',
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center' 
                    }}>
                        <div>
                            <Typography variant="h6" sx={{ fontWeight: 800 }}>
                                🍽️ Plan a Meal
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'var(--mp-text-muted)' }}>
                                Choose a recipe or enter a custom meal for your planner
                            </Typography>
                        </div>
                        <IconButton onClick={() => setDialogOpen(false)} size="small">
                            <CloseIcon fontSize="small" />
                        </IconButton>
                    </DialogTitle>

                    <DialogContent sx={{ p: 2.5 }}>
                        {/* Day & Meal Selector Row */}
                        <Box sx={{ mb: 2.5, p: 2, bgcolor: 'var(--mp-surface-alt)', borderRadius: 3, border: '1px solid var(--mp-border)' }}>
                            <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--mp-text-muted)', display: 'block', mb: 1 }}>
                                1. SELECT DAY & MEAL TIME:
                            </Typography>
                            <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap', mb: 1.5 }}>
                                {WEEKDAYS.map(day => (
                                    <Chip 
                                        key={day}
                                        label={day}
                                        clickable
                                        color={dialogWeekday === day ? "primary" : "default"}
                                        variant={dialogWeekday === day ? "filled" : "outlined"}
                                        onClick={() => setDialogWeekday(day)}
                                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                                    />
                                ))}
                            </Box>

                            <Box sx={{ display: 'flex', gap: 0.75 }}>
                                {MEAL_TYPES.map(m => (
                                    <Chip 
                                        key={m}
                                        icon={getMealIcon(m)}
                                        label={m}
                                        clickable
                                        color={dialogMeal === m ? "secondary" : "default"}
                                        variant={dialogMeal === m ? "filled" : "outlined"}
                                        onClick={() => setDialogMeal(m)}
                                        sx={{ fontWeight: 600, fontSize: '0.8rem' }}
                                    />
                                ))}
                            </Box>
                        </Box>

                        {/* Tabs: Browse Recipes vs Custom Meal */}
                        <Tabs 
                            value={dialogTab} 
                            onChange={(e, v) => setDialogTab(v)}
                            sx={{ mb: 2, borderBottom: '1px solid var(--mp-border)' }}
                        >
                            <Tab label="Browse Recipes" sx={{ textTransform: 'none', fontWeight: 700 }} />
                            <Tab label="Custom Meal / Leftovers" sx={{ textTransform: 'none', fontWeight: 700 }} />
                        </Tabs>

                        {/* Tab 0: Browse Recipes */}
                        {dialogTab === 0 && (
                            <div>
                                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                                    <TextField 
                                        placeholder="Search recipes by name or source..."
                                        size="small"
                                        fullWidth
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        InputProps={{
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <SearchIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                                </InputAdornment>
                                            )
                                        }}
                                    />
                                    {user?.id && (
                                        <Chip 
                                            icon={<StarIcon sx={{ fontSize: 16 }} />}
                                            label="Favorites"
                                            clickable
                                            color={filterFavoritesOnly ? "primary" : "default"}
                                            onClick={() => setFilterFavoritesOnly(!filterFavoritesOnly)}
                                            sx={{ height: 40, borderRadius: 2, fontWeight: 600 }}
                                        />
                                    )}
                                </Box>

                                <div className="recipe-dialog-grid">
                                    {filteredRecipes.length > 0 ? (
                                        filteredRecipes.map(recipe => (
                                            <div 
                                                key={recipe.id}
                                                className="recipe-dialog-card"
                                                onClick={() => handleSelectRecipeToAdd(recipe)}
                                            >
                                                {recipe.picture ? (
                                                    <img 
                                                        src={recipe.picture} 
                                                        alt={recipe.name} 
                                                        style={{ width: 44, height: 44, borderRadius: 8, objectFit: 'cover' }}
                                                        onError={(e) => { e.target.style.display = 'none'; }}
                                                    />
                                                ) : (
                                                    <div style={{ 
                                                        width: 44, height: 44, borderRadius: 8, 
                                                        background: 'var(--mp-surface-subtle)', 
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '1.2rem'
                                                    }}>
                                                        🥘
                                                    </div>
                                                )}
                                                <div style={{ flex: 1, minWidth: 0 }}>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {recipe.name}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                                                        {recipe.source || 'Sous-Chef Kitchen'}
                                                    </Typography>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <Box sx={{ gridColumn: '1 / -1', py: 4, textAlign: 'center', color: 'text.secondary' }}>
                                            <Typography variant="body2">
                                                No recipes found matching "{searchQuery}".
                                            </Typography>
                                        </Box>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Tab 1: Custom Meal */}
                        {dialogTab === 1 && (
                            <Box sx={{ py: 2 }}>
                                <Typography variant="body2" sx={{ color: 'text.secondary', mb: 2 }}>
                                    Planning takeout, dining out, or leftovers? Enter a custom meal title below:
                                </Typography>
                                <TextField 
                                    label="Custom Meal Name"
                                    placeholder="e.g. Grandma's Sunday Roast, Takeout Thai Curry, Sourdough Pizza"
                                    fullWidth
                                    value={customMealName}
                                    onChange={(e) => setCustomMealName(e.target.value)}
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleSubmitCustomMeal();
                                        }
                                    }}
                                />
                                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
                                    <Button 
                                        variant="contained" 
                                        color="primary"
                                        onClick={handleSubmitCustomMeal}
                                        disabled={!customMealName.trim()}
                                        sx={{ borderRadius: 2, fontWeight: 700 }}
                                    >
                                        Add to {dialogWeekday} {dialogMeal}
                                    </Button>
                                </Box>
                            </Box>
                        )}
                    </DialogContent>
                </Dialog>



                {/* Toast Snackbar */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={3500}
                    onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                    anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                >
                    <Alert 
                        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
                        severity={snackbar.severity}
                        variant="filled"
                        sx={{ width: '100%', borderRadius: 3, fontWeight: 600 }}
                    >
                        {snackbar.message}
                    </Alert>
                </Snackbar>
            </main>
        </DndProvider>
    );
}

export default MealPrep;