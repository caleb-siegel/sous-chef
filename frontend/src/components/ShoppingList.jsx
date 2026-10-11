import React, { useState, useEffect, useMemo } from 'react';
import { 
    Box, Typography, Switch, FormControlLabel, Checkbox, 
    Button, IconButton, Tooltip, Snackbar, Alert, LinearProgress,
    Divider, Chip
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useOutletContext } from "react-router-dom";

function ShoppingList({ mealPrep = [], user, dayFilter = 'all', onSelectDay }) {
    const { backendUrl } = useOutletContext();

    const [shoppingList, setShoppingList] = useState([]);
    const [consolidate, setConsolidate] = useState(true);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

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

    const getConsolidatedList = () => {
        const groups = {};
        
        filteredShoppingList.forEach(item => {
            const ingredient = item.recipe_ingredient;
            const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
            const originalName = ingredient?.ingredient_name || prep?.recipe_name;
            if (!originalName) return;

            const cleanName = getCleanName(originalName);
            const unit = (ingredient?.ingredient_unit || "").trim().toLowerCase();
            const quantity = ingredient?.ingredient_quantity || 0;

            if (!groups[cleanName]) {
                groups[cleanName] = {
                    displayName: originalName,
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
            const rName = ingredient?.recipe?.name || prep?.recipe_name;
            if (rName && rName.toLowerCase() !== originalName.toLowerCase()) {
                groups[cleanName].recipeNames.add(rName);
            }
        });

        return Object.values(groups).sort((a, b) => {
            // Unchecked items first, checked items at the bottom
            if (a.allChecked !== b.allChecked) {
                return a.allChecked ? 1 : -1;
            }
            return a.displayName.localeCompare(b.displayName);
        });
    };

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

    const totalItems = filteredShoppingList.length;
    const checkedItems = filteredShoppingList.filter(item => item.checked).length;
    const progressPercent = totalItems > 0 ? Math.round((checkedItems / totalItems) * 100) : 0;

    const handleCopyList = () => {
        let text = '';
        if (consolidate) {
            const list = getConsolidatedList();
            text = list
                .map(g => {
                    const status = g.allChecked ? '[x]' : '[ ]';
                    const unitStrings = Object.entries(g.units)
                        .map(([unit, qty]) => `${qty > 0 ? qty : ""} ${unit}`.trim())
                        .filter(Boolean);
                    const qtyStr = unitStrings.join(', ');
                    return `${status} ${qtyStr ? qtyStr + ' ' : ''}${g.displayName}`;
                })
                .join('\n');
        } else {
            text = sortedUserItems
                .map(item => {
                    const status = item.checked ? '[x]' : '[ ]';
                    const ing = item.recipe_ingredient;
                    const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                    if (!ing) return `${status} ${prep?.recipe_name || `Item #${item.id}`}`;
                    const qty = ing.ingredient_quantity ? `${ing.ingredient_quantity} ` : '';
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
                    label={`${totalItems} ${isFilteredByDay ? dayFilter.toLowerCase() : 'total'} items`} 
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
            ) : (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, maxHeight: 600, overflowY: 'auto', pr: 0.5 }}>
                    {consolidate ? (
                        getConsolidatedList().map(group => {
                            const unitStrings = Object.entries(group.units)
                                .map(([unit, qty]) => `${qty > 0 ? qty : ""} ${unit}`.trim())
                                .filter(s => s !== "");
                            const quantityStr = unitStrings.join(", ");
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
                        sortedUserItems.map(item => {
                            const ing = item.recipe_ingredient;
                            const prep = item.mealprep_id ? mealPrepMap.get(item.mealprep_id) : null;
                            const label = ing 
                                ? `${ing.ingredient_quantity || ""} ${ing.ingredient_unit || ""} ${ing.ingredient_name || ""}${ing.ingredient_note ? " (" + ing.ingredient_note + ")" : ""}`.trim()
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