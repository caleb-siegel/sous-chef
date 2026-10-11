import React, { useState, useEffect, useMemo } from "react";
import { 
    Box, Typography, Button, IconButton, Tooltip, Dialog, 
    DialogTitle, DialogContent, DialogActions, TextField, 
    Autocomplete, Skeleton, Alert, Select, MenuItem, FormControl, 
    InputLabel, useMediaQuery, useTheme 
} from "@mui/material";
import { Link } from "react-router-dom";

// Icons
import AddIcon from '@mui/icons-material/Add';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import SearchIcon from '@mui/icons-material/Search';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import FilterAltOffIcon from '@mui/icons-material/FilterAltOff';
import GridViewIcon from '@mui/icons-material/GridView';
import ViewListIcon from '@mui/icons-material/ViewList';
import CloseIcon from '@mui/icons-material/Close';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SortIcon from '@mui/icons-material/Sort';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import ThumbDownAltIcon from '@mui/icons-material/ThumbDownAlt';
import PersonIcon from '@mui/icons-material/Person';
import ClearIcon from '@mui/icons-material/Clear';

import AddRecipe from "./AddRecipe";
import UserRecipeTagsMenu from "./UserRecipeTagsMenu";
import AddToMealPrep from "./AddToMealPrep";
import Filter from "./Filter";
import { useOutletContext } from "react-router-dom";
import { getRecipeSlug } from "../utils/slugify";
import "./RecipeDirectory.css";

// Category options with modern emoji identifiers
const CATEGORIES = [
    { id: 'all', label: 'All Recipes', emoji: '🍽️' },
    { id: 'breakfast', label: 'Breakfast', emoji: '🍳' },
    { id: 'chicken', label: 'Chicken', emoji: '🍗' },
    { id: 'meat', label: 'Meat', emoji: '🥩' },
    { id: 'fish', label: 'Fish', emoji: '🐟' },
    { id: 'dairy', label: 'Dairy', emoji: '🧀' },
    { id: 'salad', label: 'Salad', emoji: '🥗' },
    { id: 'soup', label: 'Soup', emoji: '🍲' },
    { id: 'side', label: 'Side', emoji: '🥔' },
    { id: 'condiment', label: 'Condiment', emoji: '🍯' },
    { id: 'dessert', label: 'Dessert', emoji: '🍰' },
    { id: 'drinks', label: 'Drinks', emoji: '🍹' },
    { id: 'other', label: 'Other', emoji: '✨' },
];

function RecipeDirectory() {
    const { user, backendUrl } = useOutletContext();
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    // Core Data
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [cookbooks, setCookbooks] = useState([]);
    const [chosenCookbook, setChosenCookbook] = useState("");
    const [tags, setTags] = useState([]);
    const [userTags, setUserTags] = useState([]);
    const [userRecipes, setUserRecipes] = useState({});

    // Filter & Search Controls
    const [categorizationButtons, setCategorizationButtons] = useState("all");
    const [userCollectionFilter, setUserCollectionFilter] = useState("allrecipes"); // allrecipes | yourrecipes | interest | notreorder
    const [searchQuery, setSearchQuery] = useState("");
    const [sortBy, setSortBy] = useState("created-desc"); // created-desc | created-asc | name-asc | name-desc | ingredients-fewest | ingredients-most
    const [viewMode, setViewMode] = useState("grid"); // grid | list
    const [addRecipeOpen, setAddRecipeOpen] = useState(false);
    const [advancedFilterOpen, setAdvancedFilterOpen] = useState(false);

    // Advanced include/exclude state (preserving Filter component capabilities)
    const [filterType, setFilterType] = useState('include');
    const [filterBy, setFilterBy] = useState('recipeName');
    const [filterValue, setFilterValue] = useState('');

    // Fetch recipes by category
    const fetchRecipes = async (category = "all") => {
        try {
            setLoading(true);
            setError(null);
            
            const url = new URL(`${backendUrl}/api/recipes/filter`);
            if (category && category !== 'all') {
                url.searchParams.append('category', category);
            }
                
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setRecipes(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            setError(`Error getting recipes. Please try again.`);
        } finally {
            setLoading(false);
        }
    };

    // Load cookbooks (sorted alphabetically)
    useEffect(() => {
        fetch(`${backendUrl}/api/cookbooks`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    const sorted = [...data.filter(Boolean)].sort((a, b) => a.localeCompare(b));
                    setCookbooks(sorted);
                }
            })
            .catch(err => console.warn("Could not load cookbooks:", err));
    }, [backendUrl]);

    // Initial load and re-fetch when category changes
    useEffect(() => {
        fetchRecipes(categorizationButtons);
    }, [categorizationButtons]);

    // Load tag names
    useEffect(() => {
        fetch(`${backendUrl}/api/tag_names`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setTags(data);
            })
            .catch(() => setTags([]));
    }, [backendUrl]);

    // Load user tag names
    useEffect(() => {
        fetch(`${backendUrl}/api/user_tag_names`)
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) setUserTags(data);
            })
            .catch(() => setUserTags([]));
    }, [backendUrl]);

    // Load user favorites map
    const fetchUserFavorites = () => {
        if (user && user.id) {
            fetch(`${backendUrl}/api/user_recipe_ids/${user.id}`, { credentials: "include" })
                .then(res => res.json())
                .then(data => {
                    setUserRecipes(typeof data === 'object' && data !== null && !data.error ? data : {});
                })
                .catch(() => setUserRecipes({}));
        } else {
            setUserRecipes({});
        }
    };

    useEffect(() => {
        fetchUserFavorites();
    }, [user, backendUrl]);

    // Favorite toggle handler
    const handleFavorites = (event, recipeId) => {
        event.preventDefault();
        event.stopPropagation();

        if (!user || !user.id) {
            return;
        }

        const isFavorited = Boolean(userRecipes[recipeId]);

        if (!isFavorited) {
            // Optimistic update
            setUserRecipes(prev => ({ ...prev, [recipeId]: 999999 }));

            fetch(`${backendUrl}/api/userrecipes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeId,
                    not_reorder: false,
                    comments: ''
                }),
            })
            .then(res => res.json())
            .then(newUserRecipe => {
                if (newUserRecipe?.id) {
                    setUserRecipes(prev => ({
                        ...prev,
                        [newUserRecipe.recipe_id]: newUserRecipe.id,
                    }));
                }
            })
            .catch(() => {
                // Revert
                setUserRecipes(prev => {
                    const { [recipeId]: _, ...rest } = prev;
                    return rest;
                });
            });
        } else {
            const favId = userRecipes[recipeId];
            setUserRecipes(prev => {
                const { [recipeId]: _, ...rest } = prev;
                return rest;
            });

            if (favId && favId !== 999999) {
                fetch(`${backendUrl}/api/userrecipes/${favId}`, {
                    method: "DELETE",
                    credentials: "include",
                }).catch(() => {
                    fetchUserFavorites();
                });
            }
        }
    };

    // User Tag attachment handler
    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null && user && user.id) {
            fetch(`${backendUrl}/api/userrecipetags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: "include",
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then(res => res.json())
            .then(newTag => {
                // Update recipe local tag state
                setRecipes(prev => prev.map(r => {
                    if (r.id === recipeIdTag) {
                        const existingTags = r.user_recipe_tags || [];
                        return { ...r, user_recipe_tags: [...existingTags, newTag] };
                    }
                    return r;
                }));
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        }
    };

    // Delete user tag
    const handleDeleteUserTag = (event, userRecipeTagId, recipeId) => {
        event.preventDefault();
        event.stopPropagation();
        
        setRecipes(prev => prev.map(r => {
            if (r.id === recipeId) {
                return {
                    ...r,
                    user_recipe_tags: (r.user_recipe_tags || []).filter(t => t.id !== userRecipeTagId)
                };
            }
            return r;
        }));

        fetch(`${backendUrl}/api/userrecipetags/${userRecipeTagId}`, {
            method: "DELETE",
            credentials: "include",
        }).catch(err => console.error("Error deleting user tag:", err));
    };

    // User Collection Counts
    const collectionCounts = useMemo(() => {
        if (!user || !user.id) return { all: recipes.length, favs: 0, likes: 0, dislikes: 0 };

        let favs = 0;
        let likes = 0;
        let dislikes = 0;

        recipes.forEach(recipe => {
            const isFav = recipe.user_recipes?.some(ur => ur.user_id === user.id) &&
                (!recipe.user_recipe_tags || recipe.user_recipe_tags.every(urt => urt.user_tag?.name !== "not a reorder"));
            if (isFav || Boolean(userRecipes[recipe.id])) favs++;

            const isLiked = recipe.user_recipe_tags?.some(urt => urt.user_tag?.name === "interest" && urt.user_id === user.id);
            if (isLiked) likes++;

            const isDisliked = recipe.user_recipe_tags?.some(urt => urt.user_tag?.name === "not a reorder" && urt.user_id === user.id);
            if (isDisliked) dislikes++;
        });

        return { all: recipes.length, favs, likes, dislikes };
    }, [recipes, user, userRecipes]);

    // Computed filtered & sorted recipes list
    const filteredRecipes = useMemo(() => {
        let list = [...recipes];

        // 1. User collection filter
        if (userCollectionFilter === "yourrecipes" && user?.id) {
            list = list.filter(recipe => {
                const isTaggedFav = recipe.user_recipes?.some(ur => ur.user_id === user.id) &&
                    (!recipe.user_recipe_tags || recipe.user_recipe_tags.every(urt => urt.user_tag?.name !== "not a reorder"));
                return isTaggedFav || Boolean(userRecipes[recipe.id]);
            });
        } else if (userCollectionFilter === "interest" && user?.id) {
            list = list.filter(recipe => {
                return recipe.user_recipe_tags?.some(urt => urt.user_tag?.name === "interest" && urt.user_id === user.id);
            });
        } else if (userCollectionFilter === "notreorder" && user?.id) {
            list = list.filter(recipe => {
                return recipe.user_recipe_tags?.some(urt => urt.user_tag?.name === "not a reorder" && urt.user_id === user.id);
            });
        }

        // 1.5. Cookbook filter (instant client-side filter)
        if (chosenCookbook && chosenCookbook.trim()) {
            list = list.filter(recipe => recipe.source === chosenCookbook);
        }

        // 2. Real-time search query (recipe name, source, ingredients, tags)
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(recipe => {
                const nameMatch = recipe.name && recipe.name.toLowerCase().includes(q);
                const sourceMatch = recipe.source && recipe.source.toLowerCase().includes(q);
                const ingMatch = recipe.recipe_ingredients && recipe.recipe_ingredients.some(ing => {
                    const iName = typeof ing === 'string' ? ing : ing.ingredient_name;
                    return iName && iName.toLowerCase().includes(q);
                });
                const tagMatch = recipe.recipe_tags && recipe.recipe_tags.some(t => t.tag?.name && t.tag.name.toLowerCase().includes(q));
                return nameMatch || sourceMatch || ingMatch || tagMatch;
            });
        }

        // 3. Advanced Filter component filters (if applied)
        if (filterValue.trim()) {
            const fVal = filterValue.toLowerCase().trim();
            list = list.filter(recipe => {
                if (filterType === "include") {
                    if (filterBy === "recipeName") {
                        return recipe.name && recipe.name.toLowerCase().includes(fVal);
                    } else if (filterBy === "tag") {
                        return recipe.recipe_tags?.some(t => t.tag?.name && t.tag.name.toLowerCase() === fVal);
                    } else if (filterBy === "usertag" && user?.id) {
                        return recipe.user_recipe_tags?.some(t => t.user_tag?.name && t.user_tag.name.toLowerCase() === fVal && t.user_id === user.id);
                    } else if (filterBy === "ingredients") {
                        return recipe.recipe_ingredients?.some(ing => {
                            const iName = typeof ing === 'string' ? ing : ing.ingredient_name;
                            return iName && iName.toLowerCase().includes(fVal);
                        });
                    }
                } else if (filterType === "exclude") {
                    if (filterBy === "recipeName") {
                        return !recipe.name || !recipe.name.toLowerCase().includes(fVal);
                    } else if (filterBy === "tag") {
                        return !recipe.recipe_tags?.some(t => t.tag?.name && t.tag.name.toLowerCase() === fVal);
                    } else if (filterBy === "usertag" && user?.id) {
                        return !recipe.user_recipe_tags?.some(t => t.user_tag?.name && t.user_tag.name.toLowerCase() === fVal && t.user_id === user.id);
                    } else if (filterBy === "ingredients") {
                        return !recipe.recipe_ingredients?.some(ing => {
                            const iName = typeof ing === 'string' ? ing : ing.ingredient_name;
                            return iName && iName.toLowerCase().includes(fVal);
                        });
                    }
                }
                return true;
            });
        }

        // 4. Sorting
        list.sort((a, b) => {
            if (sortBy === "created-desc") {
                const parseDate = (d) => {
                    if (!d) return 0;
                    const t = new Date(d).getTime();
                    return isNaN(t) ? 0 : t;
                };
                const timeA = parseDate(a.created_at);
                const timeB = parseDate(b.created_at);
                if (timeB !== timeA) {
                    return timeB - timeA;
                }
                return (b.id || 0) - (a.id || 0);
            } else if (sortBy === "created-asc") {
                const parseDate = (d) => {
                    if (!d) return 0;
                    const t = new Date(d).getTime();
                    return isNaN(t) ? 0 : t;
                };
                const timeA = parseDate(a.created_at);
                const timeB = parseDate(b.created_at);
                if (timeA !== timeB) {
                    return timeA - timeB;
                }
                return (a.id || 0) - (b.id || 0);
            } else if (sortBy === "name-asc") {
                return (a.name || '').localeCompare(b.name || '');
            } else if (sortBy === "name-desc") {
                return (b.name || '').localeCompare(a.name || '');
            } else if (sortBy === "ingredients-fewest") {
                return (a.recipe_ingredients?.length || 0) - (b.recipe_ingredients?.length || 0);
            } else if (sortBy === "ingredients-most") {
                return (b.recipe_ingredients?.length || 0) - (a.recipe_ingredients?.length || 0);
            }
            return 0;
        });

        return list;
    }, [recipes, userCollectionFilter, user, userRecipes, searchQuery, chosenCookbook, filterValue, filterType, filterBy, sortBy]);

    // Progressive rendering (infinite scroll batching) to prevent DOM bloat with ~1000 recipes
    const INITIAL_BATCH = 48;
    const BATCH_SIZE = 36;
    const [displayLimit, setDisplayLimit] = useState(INITIAL_BATCH);

    // Reset displayLimit whenever any filter, search, or sort changes
    useEffect(() => {
        setDisplayLimit(INITIAL_BATCH);
    }, [searchQuery, userCollectionFilter, categorizationButtons, chosenCookbook, filterValue, filterType, filterBy, sortBy]);

    // Infinite scroll listener to smoothly load more recipes as user scrolls down
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 800) {
                setDisplayLimit(prev => {
                    if (prev < filteredRecipes.length) {
                        return Math.min(prev + BATCH_SIZE, filteredRecipes.length);
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [filteredRecipes.length]);

    const visibleRecipes = filteredRecipes.slice(0, displayLimit);

    const handleClearFilters = () => {
        setSearchQuery("");
        setCategorizationButtons("all");
        setUserCollectionFilter("allrecipes");
        setChosenCookbook("");
        setFilterValue("");
        setAdvancedFilterOpen(false);
    };

    const hasActiveFilters = Boolean(
        searchQuery.trim() || 
        categorizationButtons !== "all" || 
        userCollectionFilter !== "allrecipes" || 
        chosenCookbook || 
        filterValue.trim()
    );

    return (
        <div className="recipe-directory-root">
            {/* Header Area */}
            <header className="rd-header">
                <div className="rd-title-area">
                    <h1>
                        <span className="emoji-badge">📖</span>
                        <span>Recipe Directory</span>
                    </h1>
                    <p className="rd-subtitle">
                        Explore and organize your personal culinary catalog, discover curated cookbooks, and schedule meals seamlessly.
                    </p>
                </div>

                <div className="rd-header-actions">
                    <button 
                        type="button" 
                        className="rd-btn-primary"
                        onClick={() => setAddRecipeOpen(true)}
                    >
                        <AddIcon fontSize="small" />
                        <span>Add Recipe</span>
                    </button>
                </div>
            </header>

            {/* User Collection Segmented Tabs (Replaces awkward fixed bottom nav) */}
            {user && (
                <div className="rd-user-tabs">
                    <button 
                        type="button" 
                        className={`rd-user-tab-btn ${userCollectionFilter === "allrecipes" ? "active" : ""}`}
                        onClick={() => setUserCollectionFilter("allrecipes")}
                    >
                        <RestaurantMenuIcon fontSize="inherit" />
                        <span>All Catalog</span>
                        <span className="tab-count">{collectionCounts.all}</span>
                    </button>

                    <button 
                        type="button" 
                        className={`rd-user-tab-btn ${userCollectionFilter === "yourrecipes" ? "active" : ""}`}
                        onClick={() => setUserCollectionFilter("yourrecipes")}
                    >
                        <FavoriteIcon fontSize="inherit" style={{ color: '#ef4444' }} />
                        <span>My Favorites</span>
                        {collectionCounts.favs > 0 && <span className="tab-count">{collectionCounts.favs}</span>}
                    </button>

                    <button 
                        type="button" 
                        className={`rd-user-tab-btn ${userCollectionFilter === "interest" ? "active" : ""}`}
                        onClick={() => setUserCollectionFilter("interest")}
                    >
                        <ThumbUpAltIcon fontSize="inherit" style={{ color: 'var(--rd-primary-dark)' }} />
                        <span>Liked</span>
                        {collectionCounts.likes > 0 && <span className="tab-count">{collectionCounts.likes}</span>}
                    </button>

                    <button 
                        type="button" 
                        className={`rd-user-tab-btn ${userCollectionFilter === "notreorder" ? "active" : ""}`}
                        onClick={() => setUserCollectionFilter("notreorder")}
                    >
                        <ThumbDownAltIcon fontSize="inherit" style={{ color: 'var(--rd-text-muted)' }} />
                        <span>Disliked</span>
                        {collectionCounts.dislikes > 0 && <span className="tab-count">{collectionCounts.dislikes}</span>}
                    </button>
                </div>
            )}

            {/* Category Filter Pills (Horizontal Scrollable) */}
            <div className="rd-categories-bar">
                {CATEGORIES.map(cat => {
                    const isActive = categorizationButtons === cat.id;
                    return (
                        <button
                            key={cat.id}
                            type="button"
                            className={`rd-cat-chip ${isActive ? 'active' : ''}`}
                            onClick={() => setCategorizationButtons(cat.id)}
                        >
                            <span className="cat-emoji">{cat.emoji}</span>
                            <span>{cat.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Main Interactive Toolbar */}
            <div className="rd-toolbar">
                <div className="rd-toolbar-top">
                    {/* Real-time search box */}
                    <div className="rd-search-box">
                        <SearchIcon sx={{ color: 'var(--rd-text-muted)', fontSize: 20 }} />
                        <input 
                            type="text" 
                            placeholder="Search recipes, ingredients, tags..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <IconButton size="small" onClick={() => setSearchQuery("")} sx={{ p: 0.2 }}>
                                <ClearIcon sx={{ fontSize: 16 }} />
                            </IconButton>
                        )}
                    </div>

                    {/* Controls on Right */}
                    <div className="rd-toolbar-controls">
                        {/* Cookbook Filter Dropdown */}
                        <Autocomplete
                            size="small"
                            options={cookbooks}
                            value={chosenCookbook}
                            onChange={(event, newValue) => setChosenCookbook(newValue || "")}
                            renderInput={(params) => (
                                <TextField 
                                    {...params} 
                                    placeholder="All Cookbooks" 
                                    sx={{ width: { xs: 150, sm: 190 } }}
                                />
                            )}
                            clearOnBlur={false}
                        />

                        {/* Sort Selector */}
                        <FormControl size="small" sx={{ minWidth: 150 }}>
                            <Select
                                value={sortBy}
                                onChange={(e) => setSortBy(e.target.value)}
                                displayEmpty
                                sx={{ borderRadius: 2.5 }}
                                MenuProps={{
                                    disableScrollLock: true,
                                    PaperProps: {
                                        sx: { maxHeight: 320 }
                                    }
                                }}
                            >
                                <MenuItem value="created-desc">Sort: Newest First</MenuItem>
                                <MenuItem value="created-asc">Sort: Oldest First</MenuItem>
                                <MenuItem value="name-asc">Sort: A to Z</MenuItem>
                                <MenuItem value="name-desc">Sort: Z to A</MenuItem>
                                <MenuItem value="ingredients-fewest">Fewest Ingredients</MenuItem>
                                <MenuItem value="ingredients-most">Most Ingredients</MenuItem>
                            </Select>
                        </FormControl>

                        {/* Advanced Filter Toggle */}
                        <Tooltip title={advancedFilterOpen ? "Hide advanced filters" : "Show advanced filters"}>
                            <button
                                type="button"
                                className={`rd-cat-chip ${advancedFilterOpen || filterValue ? 'active' : ''}`}
                                onClick={() => setAdvancedFilterOpen(prev => !prev)}
                                style={{ padding: '0.45rem 0.8rem' }}
                            >
                                <FilterAltIcon fontSize="small" />
                                {!isMobile && <span>Filters</span>}
                                {filterValue && <span style={{ color: 'var(--rd-primary-dark)', fontWeight: 800 }}>•</span>}
                            </button>
                        </Tooltip>

                        {/* View Switcher (Grid vs List) */}
                        <div className="rd-view-toggle">
                            <button 
                                type="button" 
                                className={`rd-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                                onClick={() => setViewMode('grid')}
                                title="Grid View"
                            >
                                <GridViewIcon fontSize="small" />
                            </button>
                            <button 
                                type="button" 
                                className={`rd-view-btn ${viewMode === 'list' ? 'active' : ''}`}
                                onClick={() => setViewMode('list')}
                                title="List View"
                            >
                                <ViewListIcon fontSize="small" />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Sub-toolbar row with results count & active filters clear button */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--rd-text-muted)' }}>
                        {loading 
                            ? "Loading recipes..." 
                            : `Showing ${filteredRecipes.length} of ${recipes.length} recipes`}
                    </Typography>

                    {hasActiveFilters && (
                        <Button 
                            size="small" 
                            color="inherit"
                            startIcon={<CloseIcon fontSize="inherit" />}
                            onClick={handleClearFilters}
                            sx={{ textTransform: 'none', fontWeight: 600, fontSize: '0.8rem', py: 0 }}
                        >
                            Reset Filters
                        </Button>
                    )}
                </div>

                {/* Collapsible Advanced Filter Drawer */}
                {advancedFilterOpen && (
                    <div className="rd-advanced-filter-panel">
                        <Filter 
                            recipes={recipes} 
                            setRecipes={setRecipes} 
                            handleAddRecipe={() => {}} 
                            filterValue={filterValue} 
                            handleFilterValueChange={(e) => setFilterValue(e.target.value)} 
                            filterType={filterType} 
                            handleFilterTypeChange={(e) => setFilterType(e.target.value)} 
                            filterBy={filterBy} 
                            handleFilterByChange={(e) => setFilterBy(e.target.value)} 
                            tags={tags} 
                            userTags={userTags}
                        />
                    </div>
                )}
            </div>

            {/* Error Message */}
            {error && (
                <Alert 
                    severity="error" 
                    sx={{ mb: 3, borderRadius: 3 }}
                    action={
                        <Button color="inherit" size="small" onClick={() => fetchRecipes(categorizationButtons, chosenCookbook)}>
                            RETRY
                        </Button>
                    }
                >
                    {error}
                </Alert>
            )}

            {/* Recipe Content Area */}
            {loading ? (
                /* Sleek Animated Skeletons */
                <div className="rd-grid">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                        <div key={i} className="rd-card" style={{ height: 350 }}>
                            <Skeleton variant="rectangular" height={200} />
                            <div style={{ padding: '1rem' }}>
                                <Skeleton variant="text" height={28} width="80%" />
                                <Skeleton variant="text" height={18} width="40%" sx={{ mb: 2 }} />
                                <Skeleton variant="rounded" height={24} width="60%" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredRecipes.length === 0 ? (
                /* Empty State */
                <div className="rd-empty-state">
                    <div className="rd-empty-icon">🍳</div>
                    <h3 className="rd-empty-title">No recipes found</h3>
                    <p className="rd-empty-desc">
                        We couldn't find any recipes matching your current search or filter criteria. Try adjusting your query or resetting all filters.
                    </p>
                    <Button 
                        variant="contained" 
                        color="primary"
                        onClick={handleClearFilters}
                        sx={{ borderRadius: 2.5, textTransform: 'none', fontWeight: 700 }}
                    >
                        Reset All Filters
                    </Button>
                </div>
            ) : viewMode === "grid" ? (
                /* Grid View */
                <div className="rd-grid">
                    {visibleRecipes.map((recipe) => {
                        const slug = getRecipeSlug(recipe);
                        const isFav = Boolean(userRecipes[recipe.id]);
                        const recipeTags = recipe.recipe_tags || [];
                        const userRecipeTags = (recipe.user_recipe_tags || []).filter(
                            urt => user && user.id && urt.user_id === user.id
                        );
                        const imgUrl = recipe.picture && recipe.picture.trim() !== "" 
                            ? recipe.picture 
                            : "/favicon3.jpeg";

                        return (
                            <div key={recipe.id} className="rd-card">
                                {/* Card Media */}
                                <div className="rd-card-media">
                                    <Link to={`/recipes/${slug}`} style={{ display: 'block', width: '100%', height: '100%' }}>
                                        <img 
                                            src={imgUrl} 
                                            alt={recipe.name} 
                                            className="rd-card-img" 
                                            loading="lazy" 
                                        />
                                    </Link>

                                    {/* Source Badge */}
                                    {recipe.source && (
                                        <div className="rd-card-badge" title={recipe.source}>
                                            {recipe.source}
                                        </div>
                                    )}

                                    {/* Floating Favorite Heart */}
                                    {user && (
                                        <button 
                                            type="button" 
                                            className={`rd-favorite-btn ${isFav ? 'is-fav' : ''}`}
                                            onClick={(e) => handleFavorites(e, recipe.id)}
                                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            {isFav ? (
                                                <FavoriteIcon sx={{ fontSize: 20 }} />
                                            ) : (
                                                <FavoriteBorderIcon sx={{ fontSize: 20 }} />
                                            )}
                                        </button>
                                    )}
                                </div>

                                {/* Card Body */}
                                <div className="rd-card-body">
                                    <Link to={`/recipes/${slug}`} className="rd-card-title-link">
                                        <h3 className="rd-card-title" title={recipe.name}>
                                            {recipe.name}
                                        </h3>
                                    </Link>

                                    {recipe.reference && (
                                        <div className="rd-card-source">
                                            <span>{recipe.reference}</span>
                                        </div>
                                    )}

                                    {/* Tags Row */}
                                    <div className="rd-card-tags">
                                        {recipeTags.slice(0, 3).map(tagItem => (
                                            tagItem?.tag && (
                                                <span key={tagItem.tag.id} className="rd-tag-chip">
                                                    {tagItem.tag.name}
                                                </span>
                                            )
                                        ))}

                                        {userRecipeTags.map(userTagItem => (
                                            userTagItem?.user_tag && (
                                                <span key={userTagItem.id} className="rd-user-tag-chip">
                                                    <span>{userTagItem.user_tag.name}</span>
                                                    <button 
                                                        type="button" 
                                                        className="rd-user-tag-delete"
                                                        onClick={(e) => handleDeleteUserTag(e, userTagItem.id, recipe.id)}
                                                        title="Remove tag"
                                                    >
                                                        ×
                                                    </button>
                                                </span>
                                            )
                                        ))}

                                        {user && (
                                            <UserRecipeTagsMenu 
                                                recipeId={recipe.id} 
                                                tags={userTags} 
                                                handleTagSelect={handleTagSelect} 
                                                color="secondary"
                                            />
                                        )}
                                    </div>
                                </div>

                                {/* Card Footer with Quick Meal Prep scheduling */}
                                <div className="rd-card-footer">
                                    <AddToMealPrep user={user} recipe={recipe} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                /* Compact List View */
                <div className="rd-list">
                    {visibleRecipes.map((recipe) => {
                        const slug = getRecipeSlug(recipe);
                        const isFav = Boolean(userRecipes[recipe.id]);
                        const imgUrl = recipe.picture && recipe.picture.trim() !== "" 
                            ? recipe.picture 
                            : "/favicon3.jpeg";

                        return (
                            <div key={recipe.id} className="rd-list-card">
                                <Link to={`/recipes/${slug}`} className="rd-list-img-wrapper">
                                    <img src={imgUrl} alt={recipe.name} className="rd-list-img" loading="lazy" />
                                </Link>

                                <div className="rd-list-content">
                                    <Link to={`/recipes/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                        <h3 className="rd-list-title" title={recipe.name}>
                                            {recipe.name}
                                        </h3>
                                    </Link>
                                    <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', fontSize: '0.8rem', color: 'var(--rd-text-muted)' }}>
                                        {recipe.source && <span>📚 {recipe.source}</span>}
                                        {recipe.recipe_ingredients && (
                                            <span>🥘 {recipe.recipe_ingredients.length} ingredients</span>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                    <AddToMealPrep user={user} recipe={recipe} />
                                    {user && (
                                        <button 
                                            type="button" 
                                            className={`rd-favorite-btn ${isFav ? 'is-fav' : ''}`}
                                            style={{ position: 'static' }}
                                            onClick={(e) => handleFavorites(e, recipe.id)}
                                            title={isFav ? "Remove from favorites" : "Add to favorites"}
                                        >
                                            {isFav ? <FavoriteIcon sx={{ fontSize: 18 }} /> : <FavoriteBorderIcon sx={{ fontSize: 18 }} />}
                                        </button>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* Load More Button when more recipes are available */}
            {displayLimit < filteredRecipes.length && (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                    <Button
                        variant="outlined"
                        color="inherit"
                        size="small"
                        onClick={() => setDisplayLimit(prev => Math.min(prev + BATCH_SIZE, filteredRecipes.length))}
                        sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 600, color: 'text.secondary' }}
                    >
                        Showing {visibleRecipes.length} of {filteredRecipes.length} recipes • Load more
                    </Button>
                </Box>
            )}

            {/* Add Recipe Dialog (Modal instead of pushing entire page down) */}
            <Dialog 
                open={addRecipeOpen} 
                onClose={() => setAddRecipeOpen(false)}
                maxWidth="md"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontWeight: 800 }}>
                    <span>Create a New Recipe 🍳</span>
                    <IconButton size="small" onClick={() => setAddRecipeOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers>
                    <AddRecipe 
                        recipes={recipes} 
                        setRecipes={setRecipes} 
                        handleAddRecipe={() => setAddRecipeOpen(false)} 
                        tags={tags}
                    />
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default RecipeDirectory;