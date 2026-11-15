import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Switch, FormControlLabel, Checkbox, 
    Button, IconButton, Tooltip, Snackbar, Alert, LinearProgress,
    Divider, Chip, TextField, Select, MenuItem, FormControl, 
    InputLabel, InputAdornment
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import { useOutletContext } from "react-router-dom";
import { consolidateUnits, formatQuantity } from '../utils/unitConverter';

function ShoppingList({ mealPrep = [], user, dayFilter = 'all', onSelectDay }) {
    const { backendUrl } = useOutletContext();

    const [shoppingList, setShoppingList] = useState([]);
    const [consolidate, setConsolidate] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Search and filter states
    const [searchQuery, setSearchQuery] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('all');
    const [recipeFilter, setRecipeFilter] = useState('all');

    const fetchShoppingList = () => {
        const url = user?.id ? `${backendUrl}/api/user_shopping_list?user_id=${user.id}` : `${backendUrl}/api/user_shopping_list`;
        fetch(url, { credentials: "include" })
        .then((response) => response.json())
        .then((data) => {
            setShoppingList(Array.isArray(data) ? data : []);
        })
        .catch(() => setShoppingList([]));
    };

    useEffect(() => {
        fetchShoppingList();
    }, [user, backendUrl, mealPrep]);

    const handleCheckboxChange = (event, itemId, checkedProp) => {
        const isChecked = event.target.checked;
        const itemIds = Array.isArray(itemId) ? itemId : [itemId];

        setShoppingList(prevList =>
            prevList.map(item =>
                itemIds.includes(item.id) ? { ...item, checked: isChecked } : item
            )
        );

        itemIds.forEach(id => {
            fetch(`${backendUrl}/api/user_shopping_list/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                credentials: "include",
                body: JSON.stringify({ checked: isChecked }),
            });
        });
    };

    const getCleanName = (name) => {
        if (!name) return "";
        return name.split(',')[0].split('(')[0].trim().toLowerCase();
    };

    const isFilteredByDay = Boolean(dayFilter && dayFilter !== 'all');

    // Matching meal prep IDs and recipe IDs for current day selection
    const dayMealPrepIds = useMemo(() => {
        if (!isFilteredByDay) return null;
        const matchingPreps = (mealPrep || []).filter(p => 
            (!user || !user.id || user.id === p.user_id) && 
            p.weekday === dayFilter
        );
        return new Set(matchingPreps.map(p => p.id));
    }, [mealPrep, dayFilter, user, isFilteredByDay]);

    const dayRecipeIds = useMemo(() => {
        if (!isFilteredByDay) return null;
        const matchingPreps = (mealPrep || []).filter(p => 
            (!user || !user.id || user.id === p.user_id) && 
            p.weekday === dayFilter
        );
        return new Set(matchingPreps.map(p => p.recipe?.id || p.recipe_id).filter(Boolean));
    }, [mealPrep, dayFilter, user, isFilteredByDay]);

    // Filter shopping list items by user AND dayFilter
    const filteredShoppingList = useMemo(() => {
        return shoppingList.filter(item => {
            if (user && user.id && user.id !== item.user_id) return false;

            if (isFilteredByDay) {
                if (dayMealPrepIds) {
                    if (item.mealprep_id) {
                        return dayMealPrepIds.has(item.mealprep_id);
                    }
                    const recId = item.recipe_ingredient?.recipe_id || item.recipe_ingredient?.recipe?.id;
                    if (recId && dayRecipeIds) {
                        return dayRecipeIds.has(recId);
                    }
                    return false;
                }
            }

            return true;
        });
    }, [shoppingList, user, isFilteredByDay, dayMealPrepIds, dayRecipeIds]);

    const mealPrepMap = useMemo(() => {
        return new Map((mealPrep || []).map(p => [p.id, p]));
    }, [mealPrep]);

    // Available categories and recipes for filters
    const availableCategories = useMemo(() => {
        const cats = new Set();
        filteredShoppingList.forEach(item => {
            const cat = item.recipe_ingredient?.ingredient?.category?.name || 'Other';
            if (cat) cats.add(cat);
        });
        return Array.from(cats).sort();
    }, [filteredShoppingList]);

    const availableRecipes = useMemo(() => {
        const recs = new Set();
        filteredShoppingList.forEach(item => {
            const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
            const rName = item.recipe_ingredient?.recipe?.name || prep?.recipe_name;
            if (rName) recs.add(rName);
        });
        return Array.from(recs).sort();
    }, [filteredShoppingList, mealPrepMap]);

    const getConsolidatedList = () => {
        const groups = {};
        
        filteredShoppingList.forEach(item => {
            const ingredient = item.recipe_ingredient;
            const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
            const originalName = ingredient?.ingredient_name || prep?.recipe_name;
            if (!originalName) return;

            const canonicalName = ingredient?.ingredient?.name;
            const cleanName = canonicalName ? canonicalName.toLowerCase() : getCleanName(originalName);
            const displayName = canonicalName || originalName;
            const categoryName = ingredient?.ingredient?.category?.name || 'Other';
            const categoryOrder = ingredient?.ingredient?.category?.sort_order ?? 99;

            const unit = (ingredient?.ingredient_unit || "").trim().toLowerCase();
            const quantity = ingredient?.ingredient_quantity || 0;

            if (!groups[cleanName]) {
                groups[cleanName] = {
                    displayName: displayName,
                    categoryName: categoryName,
                    categoryOrder: categoryOrder,
                    units: {},
                    itemIds: [],
                    allChecked: true,
                    notes: new Set(),
                    recipeNames: new Set()
                };
            }

            if (!groups[cleanName].units[unit]) {
                groups[cleanName].units[unit] = 0;
            }
            groups[cleanName].units[unit] += quantity;
            groups[cleanName].itemIds.push(item.id);
            if (!item.checked) {
                groups[cleanName].allChecked = false;
            }
            if (ingredient?.ingredient_note) {
                groups[cleanName].notes.add(ingredient.ingredient_note);
            }
            if (ingredient?.preparation) {
                groups[cleanName].notes.add(ingredient.preparation);
            }
            const rName = ingredient?.recipe?.name || prep?.recipe_name;
            if (rName && rName.toLowerCase() !== displayName.toLowerCase()) {
                groups[cleanName].recipeNames.add(rName);
            }
        });

        return Object.values(groups).sort((a, b) => {
            // Unchecked items first, checked items at the bottom
            if (a.allChecked !== b.allChecked) {
                return a.allChecked ? 1 : -1;
            }
            // Sort by supermarket aisle order
            if (a.categoryOrder !== b.categoryOrder) {
                return a.categoryOrder - b.categoryOrder;
            }
            return a.displayName.localeCompare(b.displayName);
        });
    };

    // Filtered consolidated items based on search and dropdown filters
    const displayedConsolidatedList = useMemo(() => {
        let list = getConsolidatedList();
        if (categoryFilter && categoryFilter !== 'all') {
            list = list.filter(g => g.categoryName.toLowerCase() === categoryFilter.toLowerCase());
        }
        if (recipeFilter && recipeFilter !== 'all') {
            list = list.filter(g => g.recipeNames.has(recipeFilter));
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(g => 
                g.displayName.toLowerCase().includes(q) ||
                g.categoryName.toLowerCase().includes(q) ||
                Array.from(g.notes).some(n => n.toLowerCase().includes(q)) ||
                Array.from(g.recipeNames).some(r => r.toLowerCase().includes(q))
            );
        }
        return list;
    }, [filteredShoppingList, mealPrepMap, categoryFilter, recipeFilter, searchQuery]);

    // Calculate progress and sort items (unchecked first, checked at bottom)
    const sortedUserItems = useMemo(() => {
        return [...filteredShoppingList].sort((a, b) => {
            if (Boolean(a.checked) !== Boolean(b.checked)) {
                return a.checked ? 1 : -1;
            }
            const prepA = a.mealprep_id ? mealPrepMap.get(a.mealprep_id) : null;
            const prepB = b.mealprep_id ? mealPrepMap.get(b.mealprep_id) : null;
            const nameA = a.recipe_ingredient?.ingredient_name || prepA?.recipe_name || '';
            const nameB = b.recipe_ingredient?.ingredient_name || prepB?.recipe_name || '';
            return nameA.localeCompare(nameB);
        });
    }, [filteredShoppingList, mealPrepMap]);

    // Filtered unconsolidated items based on search and dropdown filters
    const displayedUserItems = useMemo(() => {
        let items = sortedUserItems;
        if (categoryFilter && categoryFilter !== 'all') {
            items = items.filter(item => {
                const cat = item.recipe_ingredient?.ingredient?.category?.name || 'Other';
                return cat.toLowerCase() === categoryFilter.toLowerCase();
            });
        }
        if (recipeFilter && recipeFilter !== 'all') {
            items = items.filter(item => {
                const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                const rName = item.recipe_ingredient?.recipe?.name || prep?.recipe_name;
                return rName === recipeFilter;
            });
        }
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            items = items.filter(item => {
                const ing = item.recipe_ingredient;
                const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                const name = ing?.ingredient_name || prep?.recipe_name || '';
                const canonical = ing?.ingredient?.name || '';
                const cat = ing?.ingredient?.category?.name || '';
                const note = ing?.ingredient_note || '';
                const prepText = ing?.preparation || '';
                const rName = ing?.recipe?.name || prep?.recipe_name || '';
                return name.toLowerCase().includes(q) ||
                       canonical.toLowerCase().includes(q) ||
                       cat.toLowerCase().includes(q) ||
                       note.toLowerCase().includes(q) ||
                       prepText.toLowerCase().includes(q) ||
                       rName.toLowerCase().includes(q);
            });
        }
        return items;
    }, [sortedUserItems, mealPrepMap, categoryFilter, recipeFilter, searchQuery]);

    const totalItems = filteredShoppingList.length;
    const checkedItems = filteredShoppingList.filter(item => item.checked).length;
    const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    const hasActiveFilters = Boolean(searchQuery.trim() || categoryFilter !== 'all' || recipeFilter !== 'all');

    const handleClearFilters = () => {
        setSearchQuery('');
        setCategoryFilter('all');
        setRecipeFilter('all');
    };

    const handleCopyList = () => {
        let text = '';
        if (consolidate) {
            const list = displayedConsolidatedList;
            text = list
                .map(g => {
                    const status = g.allChecked ? '[x]' : '[ ]';
                    const qtyStr = consolidateUnits(g.units);
                    const categoryTag = g.categoryName && g.categoryName !== 'Other' ? ` (${g.categoryName})` : '';
                    return `${status} ${qtyStr ? qtyStr + ' ' : ''}${g.displayName}${categoryTag}`;
                })
                .join('\n');
        } else {
            text = displayedUserItems
                .map(item => {
                    const status = item.checked ? '[x]' : '[ ]';
                    const ing = item.recipe_ingredient;
                    const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                    if (!ing) return `${status} ${prep?.recipe_name || `Item #${item.id}`}`;
                    const qty = ing.ingredient_quantity ? `${formatQuantity(ing.ingredient_quantity)} ` : '';
                    const unit = ing.ingredient_unit ? `${ing.ingredient_unit} ` : '';
                    const name = ing.ingredient_name || prep?.recipe_name || '';
                    return `${status} ${qty}${unit}${name}`.trim();
                })
                .join('\n');
        }

        if (navigator.clipboard) {
            const titlePrefix = isFilteredByDay ? `🛒 Grocery Shopping List (${dayFilter}) (Sous-Chef):\n\n` : `🛒 Grocery Shopping List (Sous-Chef):\n\n`;
            navigator.clipboard.writeText(`${titlePrefix}${text}`);
            setSnackbar({ 
                open: true, 
                message: `Shopping list ${isFilteredByDay ? `for ${dayFilter} ` : ''}copied to clipboard! 📋`, 
                severity: 'success' 
            });
        }
    };

    const handleToggleAll = (targetChecked) => {
        const itemIds = filteredShoppingList.map(i => i.id);
        setShoppingList(prev => prev.map(i => itemIds.includes(i.id) ? { ...i, checked: targetChecked } : i));
        itemIds.forEach(id => {
            fetch(`${backendUrl}/api/user_shopping_list/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ checked: targetChecked }),
            });
        });
    };

    return (
        <div className="mealprep-shopping-card">
            {/* Header */}
            <div className="mealprep-shopping-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div className="emoji-badge" style={{ 
                        width: 38, height: 38, borderRadius: 10, 
                        background: 'rgba(63, 255, 194, 0.2)', display: 'flex', 
                        alignItems: 'center', justifyContent: 'center' 
                    }}>
                        <ShoppingBagIcon style={{ color: 'var(--mp-primary-dark)' }} />
                    </div>
                    <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                            <h2 className="mealprep-shopping-title">
                                {isFilteredByDay ? `${dayFilter}'s Grocery List` : 'Grocery Shopping List'}
                            </h2>
                            {isFilteredByDay && (
                                <Chip 
                                    label={dayFilter} 
                                    size="small" 
                                    color="primary" 
                                    variant="outlined"
                                    onDelete={onSelectDay ? () => onSelectDay('all') : undefined}
                                    sx={{ fontWeight: 700, height: 22, fontSize: '0.72rem' }}
                                />
                            )}
                        </div>
                        <Typography variant="caption" sx={{ color: 'var(--mp-text-muted)' }}>
                            {isFilteredByDay 
                                ? `Ingredients for recipes scheduled on ${dayFilter}` 
                                : 'Auto-generated from your planned recipes'}
                        </Typography>
                    </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Tooltip title="Copy list to clipboard">
                        <Button 
                            variant="outlined" 
                            size="small"
                            onClick={handleCopyList}
                            disabled={totalItems === 0}
                            startIcon={<ContentCopyIcon fontSize="small" />}
                            sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            Copy List
                        </Button>
                    </Tooltip>
                </div>
            </div>

            {/* Progress Bar & Controls */}
            {totalItems > 0 && (
                <Box sx={{ mb: 2, p: 1.5, bgcolor: 'var(--mp-surface-alt)', borderRadius: 2, border: '1px solid var(--mp-border)' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.75 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: 'var(--mp-text-main)' }}>
                            Shopping Progress: {checkedItems} of {totalItems} items ({progressPercent}%)
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                            <Button 
                                size="small" 
                                sx={{ textTransform: 'none', py: 0, fontSize: '0.75rem' }}
                                onClick={() => handleToggleAll(true)}
                            >
                                Check All
                            </Button>
                            <Button 
                                size="small" 
                                color="inherit"
                                sx={{ textTransform: 'none', py: 0, fontSize: '0.75rem' }}
                                onClick={() => handleToggleAll(false)}
                            >
                                Uncheck All
                            </Button>
                        </Box>
                    </Box>
                    <LinearProgress 
                        variant="determinate" 
                        value={progressPercent} 
                        sx={{ 
                            height: 8, 
                            borderRadius: 4, 
                            bgcolor: 'var(--mp-surface-subtle)',
                            '& .MuiLinearProgress-bar': {
                                bgcolor: progressPercent === 100 ? '#10b981' : 'var(--mp-primary-dark)',
                                borderRadius: 4
                            }
                        }} 
                    />
                </Box>
            )}

            {/* Search and Filters Bar */}
            {totalItems > 0 && (
                <Box sx={{ mb: 1.5, p: 1.25, bgcolor: 'var(--mp-surface-alt)', borderRadius: 2, border: '1px solid var(--mp-border)' }}>
                    <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 1 }}>
                        <TextField
                            size="small"
                            placeholder="Search ingredients, recipes, or notes..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            sx={{ 
                                flex: { xs: '1 1 100%', md: '2 1 auto' }, 
                                bgcolor: 'var(--mp-surface-subtle, #ffffff)', 
                                borderRadius: 1 
                            }}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon fontSize="small" sx={{ color: 'var(--mp-text-muted)' }} />
                                    </InputAdornment>
                                ),
                                endAdornment: searchQuery ? (
                                    <InputAdornment position="end">
                                        <IconButton size="small" onClick={() => setSearchQuery('')} edge="end">
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </InputAdornment>
                                ) : null
                            }}
                        />

                        <FormControl size="small" sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 140, bgcolor: 'var(--mp-surface-subtle, #ffffff)', borderRadius: 1 }}>
                            <InputLabel id="category-filter-select-label">Aisle / Category</InputLabel>
                            <Select
                                labelId="category-filter-select-label"
                                label="Aisle / Category"
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Aisles ({availableCategories.length})</MenuItem>
                                {availableCategories.map(cat => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <FormControl size="small" sx={{ flex: { xs: '1 1 100%', md: '1 1 auto' }, minWidth: 150, bgcolor: 'var(--mp-surface-subtle, #ffffff)', borderRadius: 1 }}>
                            <InputLabel id="recipe-filter-select-label">Filter by Recipe</InputLabel>
                            <Select
                                labelId="recipe-filter-select-label"
                                label="Filter by Recipe"
                                value={recipeFilter}
                                onChange={(e) => setRecipeFilter(e.target.value)}
                            >
                                <MenuItem value="all">All Recipes ({availableRecipes.length})</MenuItem>
                                {availableRecipes.map(r => (
                                    <MenuItem key={r} value={r}>{r}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>
                    </Box>

                    {hasActiveFilters && (
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1, pt: 0.75, borderTop: '1px dashed var(--mp-border)' }}>
                            <Typography variant="caption" sx={{ color: 'var(--mp-text-muted)', fontWeight: 600 }}>
                                Showing {consolidate ? displayedConsolidatedList.length : displayedUserItems.length} matching item{((consolidate ? displayedConsolidatedList.length : displayedUserItems.length) === 1 ? '' : 's')}
                            </Typography>
                            <Button
                                size="small"
                                onClick={handleClearFilters}
                                sx={{ textTransform: 'none', py: 0, px: 1, fontSize: '0.75rem', fontWeight: 600, color: 'var(--mp-primary-dark)' }}
                            >
                                Clear search & filters
                            </Button>
                        </Box>
                    )}
                </Box>
            )}

            {/* Options Bar */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={consolidate}
                            onChange={(e) => setConsolidate(e.target.checked)}
                            color="primary"
                            size="small"
                        />
                    }
                    label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Consolidate Matching Ingredients</Typography>}
                />
                <Chip 
                    label={`${hasActiveFilters ? (consolidate ? displayedConsolidatedList.length : displayedUserItems.length) + ' filtered / ' : ''}${totalItems} ${isFilteredByDay ? dayFilter.toLowerCase() : 'total'} items`} 
                    size="small" 
                    variant="outlined" 
                    sx={{ fontWeight: 600, color: 'var(--mp-text-muted)' }} 
                />
            </Box>

            <Divider sx={{ mb: 1.5, borderColor: 'var(--mp-border)' }} />

            {/* Items List */}
            {totalItems === 0 ? (
                <Box sx={{ py: 6, textAlign: 'center', color: 'var(--mp-text-muted)' }}>
                    <ShoppingBagIcon sx={{ fontSize: 44, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        {isFilteredByDay 
                            ? `No grocery items needed for ${dayFilter}!` 
                            : 'Your shopping list is clear!'}
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5, maxWidth: 380, mx: 'auto' }}>
                        {isFilteredByDay 
                            ? `Add recipes to ${dayFilter} in your planner to see ingredients here, or switch to view all days.`
                            : 'Add recipes to your meal plan above and their ingredients will automatically appear here.'}
                    </Typography>
                    {isFilteredByDay && onSelectDay && (
                        <Button 
                            variant="outlined" 
                            size="small" 
                            onClick={() => onSelectDay('all')}
                            sx={{ mt: 2, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                        >
                            View Entire Week
                        </Button>
                    )}
                </Box>
            ) : ((consolidate ? displayedConsolidatedList.length : displayedUserItems.length) === 0) ? (
                <Box sx={{ py: 5, textAlign: 'center', color: 'var(--mp-text-muted)' }}>
                    <SearchIcon sx={{ fontSize: 38, opacity: 0.3, mb: 1 }} />
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                        No ingredients match your search or filter criteria
                    </Typography>
                    <Typography variant="body2" sx={{ mt: 0.5 }}>
                        Try clearing or modifying your search keyword, category, or recipe filter.
                    </Typography>
                    <Button 
                        variant="outlined" 
                        size="small" 
                        onClick={handleClearFilters}
                        sx={{ mt: 1.5, borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        Reset All Filters
                    </Button>
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 600, overflowY: 'auto', pr: 0.5 }}>
                    {consolidate ? (
                        displayedConsolidatedList.map(group => {
                            const quantityStr = consolidateUnits(group.units);
                            const notesStr = Array.from(group.notes).join("; ");
                            const recipeSource = Array.from(group.recipeNames).join(", ");

                            return (
                                <div 
                                    key={group.displayName} 
                                    className={`mealprep-item-row ${group.allChecked ? 'is-checked' : ''}`}
                                    onClick={(e) => {
                                        // Toggle when clicking row if not clicked directly on checkbox
                                        if (e.target.tagName !== 'INPUT') {
                                            handleCheckboxChange({ target: { checked: !group.allChecked } }, group.itemIds);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <Checkbox
                                            checked={group.allChecked}
                                            onChange={(e) => handleCheckboxChange(e, group.itemIds)}
                                            size="small"
                                            sx={{
                                                p: 0.5,
                                                color: 'var(--mp-border-strong)',
                                                '&.Mui-checked': { color: 'var(--mp-primary-dark)' }
                                            }}
                                        />
                                        <div>
                                            <Typography variant="body2" className="item-name" sx={{ fontWeight: 600 }}>
                                                {quantityStr ? <span style={{ color: 'var(--mp-secondary-dark)', fontWeight: 700 }}>{quantityStr} </span> : null}
                                                {group.displayName}
                                                {group.categoryName && group.categoryName !== 'Other' && (
                                                    <span style={{ 
                                                        marginLeft: '0.4rem', 
                                                        fontSize: '0.72rem', 
                                                        padding: '0.1rem 0.4rem', 
                                                        borderRadius: '6px', 
                                                        background: 'rgba(63, 255, 194, 0.12)', 
                                                        color: 'var(--mp-primary-dark)',
                                                        fontWeight: 600 
                                                    }}>
                                                        {group.categoryName}
                                                    </span>
                                                )}
                                                {notesStr ? <span style={{ color: 'var(--mp-text-muted)', fontSize: '0.8rem' }}> ({notesStr})</span> : null}
                                            </Typography>
                                            {recipeSource && (
                                                <Typography variant="caption" sx={{ color: 'var(--mp-text-muted)', display: 'block' }}>
                                                    For: {recipeSource}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    ) : (
                        displayedUserItems.map(item => {
                            const ing = item.recipe_ingredient;
                            const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                            const formattedQty = ing?.ingredient_quantity ? `${formatQuantity(ing.ingredient_quantity)} ` : '';
                            const unitStr = ing?.ingredient_unit ? `${ing.ingredient_unit} ` : '';
                            const label = ing 
                                ? `${formattedQty}${unitStr}${ing.ingredient_name || ""}${ing.ingredient_note ? " (" + ing.ingredient_note + ")" : ""}`.trim()
                                : (prep?.recipe_name || `Custom item #${item.id}`);
                            const recipeName = ing?.recipe?.name || prep?.recipe_name;
                            const showRecipeSubtitle = recipeName && recipeName.toLowerCase() !== label.toLowerCase();

                            return (
                                <div 
                                    key={item.id} 
                                    className={`mealprep-item-row ${item.checked ? 'is-checked' : ''}`}
                                    onClick={(e) => {
                                        if (e.target.tagName !== 'INPUT') {
                                            handleCheckboxChange({ target: { checked: !item.checked } }, item.id);
                                        }
                                    }}
                                    style={{ cursor: 'pointer' }}
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                                        <Checkbox
                                            checked={item.checked}
                                            onChange={(e) => handleCheckboxChange(e, item.id)}
                                            size="small"
                                            sx={{
                                                p: 0.5,
                                                color: 'var(--mp-border-strong)',
                                                '&.Mui-checked': { color: 'var(--mp-primary-dark)' }
                                            }}
                                        />
                                        <div>
                                            <Typography variant="body2" className="item-name" sx={{ fontWeight: 600 }}>
                                                {label}
                                            </Typography>
                                            {showRecipeSubtitle && (
                                                <Typography variant="caption" sx={{ color: 'var(--mp-text-muted)' }}>
                                                    {recipeName}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </Box>
            )}

            {/* Toast Feedback */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={3000}
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
        </div>
    );
}

export default ShoppingList;