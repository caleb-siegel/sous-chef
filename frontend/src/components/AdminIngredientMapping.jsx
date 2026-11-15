import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    Box, Typography, Button, IconButton, TextField, Autocomplete,
    Select, MenuItem, FormControl, InputLabel, Chip, Tooltip,
    CircularProgress, Alert, Snackbar, Tabs, Tab, Dialog,
    DialogTitle, DialogContent, DialogActions, InputAdornment,
    createFilterOptions
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import RefreshIcon from '@mui/icons-material/Refresh';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import KitchenIcon from '@mui/icons-material/Kitchen';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { formatQuantity } from '../utils/unitConverter';
import { getRecipeSlug } from '../utils/slugify';
import './AdminIngredientMapping.css';

const COMMON_UNITS = [
    '', 'cloves', 'heads', 'cups', 'tbsp', 'tsp', 'oz', 'lb',
    'grams', 'kg', 'ml', 'liters', 'slices', 'cans', 'bunches',
    'stalks', 'sprigs', 'pieces', 'pinch', 'dash'
];

const filterOptions60 = createFilterOptions({ limit: 60 });

function AdminIngredientMapping() {
    const { backendUrl } = useOutletContext();

    // Data lists
    const [recipes, setRecipes] = useState([]);
    const [canonicalIngredients, setCanonicalIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loadingInit, setLoadingInit] = useState(true);

    // Active mode & selection
    const [activeTab, setActiveTab] = useState('by-recipe'); // 'by-recipe' | 'by-ingredient' | 'unmapped'
    const [selectedRecipe, setSelectedRecipe] = useState(null);
    const [selectedCanonical, setSelectedCanonical] = useState(null);

    // Current rows being edited
    const [recipeIngredients, setRecipeIngredients] = useState([]);
    const [loadingRows, setLoadingRows] = useState(false);

    // Track local row edits: { [id]: { ingredient_id, ingredient_quantity, ingredient_unit, preparation, ingredient_note, ingredient_name } }
    const [editedRows, setEditedRows] = useState({});
    const [saving, setSaving] = useState(false);

    // Quick creation modal
    const [createDialogOpen, setCreateDialogOpen] = useState(false);
    const [newIngData, setNewIngData] = useState({ name: '', category_id: '', default_unit: '' });
    const [creatingIng, setCreatingIng] = useState(false);

    // Notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // 1. Fetch initial metadata
    const fetchInitialData = async () => {
        try {
            setLoadingInit(true);
            const [recRes, ingRes, catRes] = await Promise.all([
                fetch(`${backendUrl}/api/recipes/dropdown`, { credentials: 'include' })
                    .then(r => r.ok ? r : fetch(`${backendUrl}/api/recipe_info`, { credentials: 'include' }))
                    .catch(() => fetch(`${backendUrl}/api/recipe_info`, { credentials: 'include' })),
                fetch(`${backendUrl}/api/ingredients`, { credentials: 'include' }),
                fetch(`${backendUrl}/api/ingredient_categories`, { credentials: 'include' })
            ]);

            const [recData, ingData, catData] = await Promise.all([
                recRes.json(),
                ingRes.json(),
                catRes.json()
            ]);

            const recList = Array.isArray(recData) ? recData : [];
            setRecipes(recList);
            setCanonicalIngredients(Array.isArray(ingData) ? ingData : []);
            setCategories(Array.isArray(catData) ? catData : []);

            if (recList.length > 0) {
                setSelectedRecipe(recList[0]);
            }
        } catch (err) {
            console.error('Failed to load initial admin data:', err);
            setSnackbar({ open: true, message: 'Could not load recipe data from server', severity: 'error' });
        } finally {
            setLoadingInit(false);
        }
    };

    useEffect(() => {
        fetchInitialData();
    }, [backendUrl]);

    // 2. Load recipe ingredients when selectedRecipe or activeTab changes
    const fetchRows = async () => {
        setLoadingRows(true);
        setEditedRows({});
        try {
            let url = '';
            if (activeTab === 'by-recipe') {
                if (!selectedRecipe) {
                    setRecipeIngredients([]);
                    setLoadingRows(false);
                    return;
                }
                url = `${backendUrl}/api/admin/recipe_ingredients?recipe_id=${selectedRecipe.id}`;
            } else if (activeTab === 'by-ingredient') {
                if (!selectedCanonical) {
                    setRecipeIngredients([]);
                    setLoadingRows(false);
                    return;
                }
                url = `${backendUrl}/api/admin/recipe_ingredients?ingredient_id=${selectedCanonical.id}`;
            } else if (activeTab === 'unmapped') {
                url = `${backendUrl}/api/admin/recipe_ingredients?unmapped=true`;
            }

            const res = await fetch(url, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setRecipeIngredients(Array.isArray(data) ? data : []);
            } else {
                setRecipeIngredients([]);
            }
        } catch (e) {
            console.warn('Error fetching recipe ingredients:', e);
            setRecipeIngredients([]);
        } finally {
            setLoadingRows(false);
        }
    };

    useEffect(() => {
        fetchRows();
    }, [selectedRecipe, selectedCanonical, activeTab]);

    // 3. Edit handling
    const handleFieldChange = (rowId, field, value) => {
        setEditedRows(prev => {
            const originalRow = recipeIngredients.find(r => r.id === rowId) || {};
            const currentRow = prev[rowId] || {
                id: rowId,
                ingredient_id: originalRow.ingredient_id,
                ingredient_name: originalRow.ingredient_name,
                ingredient_quantity: originalRow.ingredient_quantity,
                ingredient_unit: originalRow.ingredient_unit,
                preparation: originalRow.preparation,
                ingredient_note: originalRow.ingredient_note
            };
            return {
                ...prev,
                [rowId]: {
                    ...currentRow,
                    [field]: value
                }
            };
        });
    };

    // Revert edits for a single row
    const handleRevertRow = (rowId) => {
        setEditedRows(prev => {
            const next = { ...prev };
            delete next[rowId];
            return next;
        });
    };

    // Save a single row
    const handleSaveRow = async (rowId) => {
        const rowEdits = editedRows[rowId];
        if (!rowEdits) return;

        try {
            const res = await fetch(`${backendUrl}/api/recipeingredients/${rowId}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(rowEdits)
            });

            if (!res.ok) throw new Error('Save failed');

            const updatedRow = await res.json();

            // Update in list
            setRecipeIngredients(prev => prev.map(r => r.id === rowId ? { ...r, ...updatedRow } : r));

            // Remove from edited state
            setEditedRows(prev => {
                const next = { ...prev };
                delete next[rowId];
                return next;
            });

            setSnackbar({ open: true, message: `Updated ingredient row #${rowId} successfully!`, severity: 'success' });
        } catch (err) {
            console.error('Save error:', err);
            setSnackbar({ open: true, message: `Failed to save ingredient row: ${err.message}`, severity: 'error' });
        }
    };

    // Save all dirty rows in batch
    const handleSaveAll = async () => {
        const dirtyList = Object.values(editedRows);
        if (dirtyList.length === 0) return;

        setSaving(true);
        try {
            const res = await fetch(`${backendUrl}/api/admin/recipe_ingredients/bulk_update`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(dirtyList)
            });

            if (!res.ok) throw new Error('Bulk update failed');

            const resData = await res.json();

            // Refresh table
            await fetchRows();
            setSnackbar({ 
                open: true, 
                message: resData.message || `Saved all ${dirtyList.length} ingredient changes!`, 
                severity: 'success' 
            });
        } catch (err) {
            console.error('Bulk save error:', err);
            setSnackbar({ open: true, message: 'Failed to save all changes', severity: 'error' });
        } finally {
            setSaving(false);
        }
    };

    // 4. Create new canonical ingredient on the fly
    const handleCreateCanonical = async (e) => {
        e.preventDefault();
        if (!newIngData.name.trim()) return;

        setCreatingIng(true);
        try {
            const res = await fetch(`${backendUrl}/api/ingredients`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newIngData)
            });

            if (!res.ok) throw new Error('Failed to create ingredient');
            const created = await res.json();

            setCanonicalIngredients(prev => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
            setCreateDialogOpen(false);
            setNewIngData({ name: '', category_id: categories[0]?.id || '', default_unit: '' });
            setSnackbar({ open: true, message: `Created canonical ingredient "${created.name}"!`, severity: 'success' });
        } catch (err) {
            console.error('Create error:', err);
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setCreatingIng(false);
        }
    };

    const dirtyRowCount = Object.keys(editedRows).length;

    // Helper map of canonical ingredients
    const canonicalMap = useMemo(() => {
        return new Map(canonicalIngredients.map(ci => [ci.id, ci]));
    }, [canonicalIngredients]);

    return (
        <div className="aim-container">
            {/* Header */}
            <div className="aim-header">
                <div>
                    <h1 className="aim-header-title">
                        <KitchenIcon sx={{ color: '#059669', fontSize: 36 }} />
                        <span>Ingredient Mapping Studio</span>
                        <span className="aim-header-badge">Admin Studio</span>
                    </h1>
                    <p className="aim-header-subtitle">
                        Inspect, remap, and correct ingredient quantities, units (e.g. heads vs cloves),
                        and canonical relationships across any recipe in the database.
                    </p>
                </div>

                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
                    <Button
                        variant="outlined"
                        startIcon={<AddIcon />}
                        onClick={() => {
                            setNewIngData({ name: '', category_id: categories[0]?.id || '', default_unit: '' });
                            setCreateDialogOpen(true);
                        }}
                        sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
                    >
                        New Master Ingredient
                    </Button>
                    <Button
                        variant="contained"
                        component={Link}
                        to="/ingredients"
                        sx={{ 
                            borderRadius: 2, 
                            textTransform: 'none', 
                            fontWeight: 600,
                            bgcolor: '#059669',
                            '&:hover': { bgcolor: '#047857' }
                        }}
                    >
                        View Public Catalog
                    </Button>
                </Box>
            </div>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2.5 }}>
                <Tabs 
                    value={activeTab} 
                    onChange={(e, val) => setActiveTab(val)}
                    textColor="primary"
                    indicatorColor="primary"
                >
                    <Tab label="Map by Recipe" value="by-recipe" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.95rem' }} />
                    <Tab label="Map by Ingredient" value="by-ingredient" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.95rem' }} />
                    <Tab label="Review Unmapped Ingredients" value="unmapped" sx={{ textTransform: 'none', fontWeight: 700, fontSize: '0.95rem' }} />
                </Tabs>
            </Box>

            {/* Selector Card */}
            <div className="aim-card">
                {activeTab === 'by-recipe' && (
                    <div className="aim-selector-bar">
                        <Autocomplete
                            options={recipes}
                            filterOptions={filterOptions60}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedRecipe}
                            onChange={(e, val) => setSelectedRecipe(val)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search or select a recipe to review"
                                    placeholder="Type recipe name (e.g. Hannah's Garleek Dip, Salmon, Noodle Soup...)"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#059669' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 0.5, width: '100%' }}>
                                        {option.picture ? (
                                            <img 
                                                src={option.picture} 
                                                alt="" 
                                                style={{ width: 36, height: 36, borderRadius: 6, objectFit: 'cover' }} 
                                            />
                                        ) : (
                                            <Box sx={{ width: 36, height: 36, borderRadius: 1, bgcolor: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <RestaurantMenuIcon fontSize="small" sx={{ color: '#64748b' }} />
                                            </Box>
                                        )}
                                        <Box sx={{ flex: 1 }}>
                                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                                            <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                {option.source || 'Sous-Chef'} • #{option.id}
                                            </Typography>
                                        </Box>
                                    </Box>
                                </li>
                            )}
                        />

                        {/* Quick Picks for Testing */}
                        <div className="aim-quick-chips">
                            <span className="aim-quick-chip-label">Quick Jump:</span>
                            {recipes
                                .filter(r => r.name && ['garleek', 'noodle soup', 'salmon', 'chicken', 'pasta'].some(k => r.name.toLowerCase().includes(k)))
                                .slice(0, 6)
                                .map(rec => (
                                    <button
                                        key={rec.id}
                                        type="button"
                                        className={`aim-quick-pill ${selectedRecipe?.id === rec.id ? 'is-active' : ''}`}
                                        onClick={() => setSelectedRecipe(rec)}
                                    >
                                        {rec.name}
                                    </button>
                                ))
                            }
                        </div>
                    </div>
                )}

                {activeTab === 'by-ingredient' && (
                    <div className="aim-selector-bar">
                        <Autocomplete
                            options={canonicalIngredients}
                            filterOptions={filterOptions60}
                            getOptionLabel={(option) => option.name || ''}
                            value={selectedCanonical}
                            onChange={(e, val) => setSelectedCanonical(val)}
                            renderInput={(params) => (
                                <TextField
                                    {...params}
                                    label="Search canonical ingredient to inspect usage"
                                    placeholder="Type ingredient (e.g. Garlic, Olive Oil, Kosher Salt...)"
                                    InputProps={{
                                        ...params.InputProps,
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <SearchIcon sx={{ color: '#059669' }} />
                                            </InputAdornment>
                                        )
                                    }}
                                />
                            )}
                            renderOption={(props, option) => (
                                <li {...props} key={option.id}>
                                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', py: 0.5 }}>
                                        <Typography variant="body2" sx={{ fontWeight: 600 }}>{option.name}</Typography>
                                        {option.category && (
                                            <span className="aim-cat-badge">{option.category.name}</span>
                                        )}
                                    </Box>
                                </li>
                            )}
                        />
                    </div>
                )}

                {activeTab === 'unmapped' && (
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                Unmapped Ingredients Queue
                            </Typography>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                                Displays any recipe ingredients in the system that do not yet have a linked canonical ingredient.
                            </Typography>
                        </Box>
                        <Button 
                            variant="outlined" 
                            startIcon={<RefreshIcon />}
                            onClick={fetchRows}
                            size="small"
                            sx={{ borderRadius: 2 }}
                        >
                            Refresh
                        </Button>
                    </Box>
                )}
            </div>

            {/* Recipe Information Header (When in by-recipe mode) */}
            {activeTab === 'by-recipe' && selectedRecipe && (
                <div className="aim-recipe-summary">
                    <div className="aim-recipe-meta">
                        {selectedRecipe.picture ? (
                            <img src={selectedRecipe.picture} alt="" className="aim-recipe-thumb" />
                        ) : (
                            <div className="aim-recipe-thumb-fallback">
                                <RestaurantMenuIcon />
                            </div>
                        )}
                        <div>
                            <Typography variant="h6" sx={{ fontWeight: 800, color: '#0f172a', lineHeight: 1.2 }}>
                                {selectedRecipe.name}
                            </Typography>
                            <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mt: 0.25 }}>
                                Source: {selectedRecipe.source || 'Sous-Chef'} • Recipe ID: #{selectedRecipe.id} • {recipeIngredients.length} ingredients
                            </Typography>
                        </div>
                    </div>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            variant="text"
                            component={Link}
                            to={`/recipes/${getRecipeSlug(selectedRecipe)}`}
                            target="_blank"
                            endIcon={<ArrowForwardIcon fontSize="small" />}
                            size="small"
                            sx={{ textTransform: 'none', fontWeight: 600, color: '#059669' }}
                        >
                            Open Recipe Page
                        </Button>
                    </Box>
                </div>
            )}

            {/* Editable Ingredients Table */}
            <div className="aim-card" style={{ padding: 0 }}>
                {loadingRows ? (
                    <Box sx={{ py: 8, textAlign: 'center' }}>
                        <CircularProgress sx={{ color: '#059669', mb: 1.5 }} />
                        <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
                            Loading ingredient rows...
                        </Typography>
                    </Box>
                ) : recipeIngredients.length === 0 ? (
                    <Box sx={{ py: 8, textAlign: 'center', color: '#64748b' }}>
                        <WarningAmberIcon sx={{ fontSize: 44, opacity: 0.4, mb: 1 }} />
                        <Typography variant="body1" sx={{ fontWeight: 700 }}>
                            {activeTab === 'unmapped' ? 'All ingredients are cleanly mapped!' : 'No ingredients found'}
                        </Typography>
                        <Typography variant="body2" sx={{ mt: 0.5 }}>
                            {activeTab === 'unmapped' 
                                ? 'There are currently zero orphan or unlinked ingredient records in the system.'
                                : 'Select a recipe or ingredient above to inspect its mapping.'}
                        </Typography>
                    </Box>
                ) : (
                    <div className="aim-table-wrapper">
                        <table className="aim-table">
                            <thead>
                                <tr>
                                    {activeTab !== 'by-recipe' && <th>Recipe</th>}
                                    <th style={{ width: '22%' }}>Raw Recipe String</th>
                                    <th style={{ width: '12%' }}>Quantity</th>
                                    <th style={{ width: '15%' }}>Unit</th>
                                    <th style={{ width: '18%' }}>Prep / Notes</th>
                                    <th style={{ width: '22%' }}>Mapped Master Ingredient</th>
                                    <th style={{ width: '11%', textAlign: 'center' }}>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {recipeIngredients.map(row => {
                                    const edits = editedRows[row.id] || {};
                                    const isDirty = Boolean(editedRows[row.id]);

                                    const currentQty = edits.ingredient_quantity !== undefined ? edits.ingredient_quantity : row.ingredient_quantity;
                                    const currentUnit = edits.ingredient_unit !== undefined ? edits.ingredient_unit : (row.ingredient_unit || '');
                                    const currentNote = edits.ingredient_note !== undefined ? edits.ingredient_note : (row.ingredient_note || '');
                                    const currentPrep = edits.preparation !== undefined ? edits.preparation : (row.preparation || '');
                                    const currentIngId = edits.ingredient_id !== undefined ? edits.ingredient_id : row.ingredient_id;

                                    const activeCanonical = currentIngId ? canonicalMap.get(currentIngId) : (row.ingredient || null);

                                    return (
                                        <tr key={row.id} className={isDirty ? 'is-dirty' : ''}>
                                            {activeTab !== 'by-recipe' && (
                                                <td>
                                                    <Typography variant="body2" sx={{ fontWeight: 700, color: '#0f172a' }}>
                                                        {row.recipe_name || `Recipe #${row.recipe_id}`}
                                                    </Typography>
                                                    <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                                                        Row #{row.id}
                                                    </Typography>
                                                </td>
                                            )}

                                            {/* Raw Ingredient Text */}
                                            <td>
                                                <Typography variant="body2" sx={{ fontWeight: 600, color: '#1e293b' }}>
                                                    {row.ingredient_name || '—'}
                                                </Typography>
                                                <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                                    ID: #{row.id}
                                                </Typography>
                                            </td>

                                            {/* Quantity Field */}
                                            <td>
                                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                                    <input
                                                        type="number"
                                                        step="any"
                                                        min="0"
                                                        className="aim-input-sm"
                                                        value={currentQty ?? ''}
                                                        onChange={(e) => handleFieldChange(row.id, 'ingredient_quantity', e.target.value === '' ? null : parseFloat(e.target.value))}
                                                        style={{ width: '65px' }}
                                                    />
                                                    {currentQty > 0 && (
                                                        <span style={{ fontSize: '0.78rem', color: '#059669', fontWeight: 700 }}>
                                                            ({formatQuantity(currentQty)})
                                                        </span>
                                                    )}
                                                </Box>
                                            </td>

                                            {/* Unit Field (Combobox text + select) */}
                                            <td>
                                                <Autocomplete
                                                    freeSolo
                                                    size="small"
                                                    options={COMMON_UNITS}
                                                    value={currentUnit}
                                                    onChange={(e, newVal) => handleFieldChange(row.id, 'ingredient_unit', newVal || '')}
                                                    onInputChange={(e, newVal, reason) => {
                                                        if (reason === 'input') {
                                                            handleFieldChange(row.id, 'ingredient_unit', newVal);
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            placeholder="e.g. heads, cloves, cups"
                                                            sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                        />
                                                    )}
                                                />
                                            </td>

                                            {/* Prep / Notes */}
                                            <td>
                                                <input
                                                    type="text"
                                                    className="aim-input-sm"
                                                    placeholder="e.g. roasted, minced"
                                                    value={currentNote || currentPrep || ''}
                                                    onChange={(e) => {
                                                        handleFieldChange(row.id, 'ingredient_note', e.target.value);
                                                        handleFieldChange(row.id, 'preparation', e.target.value);
                                                    }}
                                                />
                                            </td>

                                            {/* Canonical Ingredient Mapping */}
                                            <td>
                                                <Autocomplete
                                                    size="small"
                                                    options={canonicalIngredients}
                                                    filterOptions={filterOptions60}
                                                    getOptionLabel={(option) => {
                                                        if (typeof option === 'string') return option;
                                                        return option?.name || '';
                                                    }}
                                                    value={activeCanonical || null}
                                                    onChange={(e, newVal) => {
                                                        if (newVal && newVal.id) {
                                                            handleFieldChange(row.id, 'ingredient_id', newVal.id);
                                                            // If unit is blank, suggest default unit
                                                            if (!currentUnit && newVal.default_unit) {
                                                                handleFieldChange(row.id, 'ingredient_unit', newVal.default_unit);
                                                            }
                                                        } else {
                                                            handleFieldChange(row.id, 'ingredient_id', null);
                                                        }
                                                    }}
                                                    renderInput={(params) => (
                                                        <TextField
                                                            {...params}
                                                            size="small"
                                                            placeholder="Select canonical ingredient..."
                                                            sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                        />
                                                    )}
                                                    renderOption={(props, option) => (
                                                        <li {...props} key={option.id}>
                                                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                                                                <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{option.name}</span>
                                                                {option.category && (
                                                                    <span className="aim-cat-badge">{option.category.name}</span>
                                                                )}
                                                            </Box>
                                                        </li>
                                                    )}
                                                />
                                                {activeCanonical?.category && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <span className="aim-cat-badge">
                                                            Aisle: {activeCanonical.category.name}
                                                        </span>
                                                    </Box>
                                                )}
                                                {!activeCanonical && (
                                                    <Box sx={{ mt: 0.5 }}>
                                                        <span className="aim-cat-badge cat-unmapped">
                                                            ⚠️ Unmapped
                                                        </span>
                                                    </Box>
                                                )}
                                            </td>

                                            {/* Row Actions */}
                                            <td style={{ textAlign: 'center' }}>
                                                {isDirty ? (
                                                    <Box sx={{ display: 'flex', gap: 0.5, justifyContent: 'center' }}>
                                                        <Tooltip title="Save row">
                                                            <IconButton
                                                                size="small"
                                                                color="primary"
                                                                onClick={() => handleSaveRow(row.id)}
                                                                sx={{ bgcolor: 'rgba(16, 185, 129, 0.1)' }}
                                                            >
                                                                <SaveIcon fontSize="small" sx={{ color: '#059669' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                        <Tooltip title="Discard changes">
                                                            <IconButton
                                                                size="small"
                                                                onClick={() => handleRevertRow(row.id)}
                                                            >
                                                                <RefreshIcon fontSize="small" sx={{ color: '#64748b' }} />
                                                            </IconButton>
                                                        </Tooltip>
                                                    </Box>
                                                ) : (
                                                    <Tooltip title="Saved & Synced">
                                                        <CheckCircleOutlineIcon fontSize="small" sx={{ color: '#10b981', opacity: 0.7 }} />
                                                    </Tooltip>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Sticky Unsaved Changes Floating Banner */}
            {dirtyRowCount > 0 && (
                <div className="aim-unsaved-banner">
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <WarningAmberIcon sx={{ color: '#f59e0b' }} />
                        <div>
                            <Typography variant="body2" sx={{ fontWeight: 700 }}>
                                You have {dirtyRowCount} unsaved ingredient modification{dirtyRowCount === 1 ? '' : 's'}
                            </Typography>
                            <Typography variant="caption" sx={{ color: '#94a3b8' }}>
                                Changes are highlighted in yellow. Click Save All to apply directly to the database.
                            </Typography>
                        </div>
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                        <Button
                            variant="outlined"
                            size="small"
                            onClick={() => setEditedRows({})}
                            sx={{ color: '#cbd5e1', borderColor: '#475569', textTransform: 'none' }}
                        >
                            Discard All
                        </Button>
                        <Button
                            variant="contained"
                            size="small"
                            onClick={handleSaveAll}
                            disabled={saving}
                            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                            sx={{
                                bgcolor: '#10b981',
                                '&:hover': { bgcolor: '#059669' },
                                textTransform: 'none',
                                fontWeight: 700,
                                px: 2.5
                            }}
                        >
                            Save All Changes
                        </Button>
                    </Box>
                </div>
            )}

            {/* Modal: Create Master Canonical Ingredient */}
            <Dialog 
                open={createDialogOpen} 
                onClose={() => setCreateDialogOpen(false)}
                maxWidth="xs"
                fullWidth
            >
                <form onSubmit={handleCreateCanonical}>
                    <DialogTitle sx={{ fontWeight: 800 }}>Create Master Canonical Ingredient</DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Ingredient Name"
                            placeholder="e.g. Garlic Heads, Sirloin Steak"
                            value={newIngData.name}
                            onChange={(e) => setNewIngData({ ...newIngData, name: e.target.value })}
                            required
                            fullWidth
                            size="small"
                            autoFocus
                        />

                        <FormControl size="small" fullWidth required>
                            <InputLabel id="category-select-label">Supermarket Aisle</InputLabel>
                            <Select
                                labelId="category-select-label"
                                label="Supermarket Aisle"
                                value={newIngData.category_id}
                                onChange={(e) => setNewIngData({ ...newIngData, category_id: e.target.value })}
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Default Unit (optional)"
                            placeholder="e.g. head, clove, cup, oz"
                            value={newIngData.default_unit}
                            onChange={(e) => setNewIngData({ ...newIngData, default_unit: e.target.value })}
                            fullWidth
                            size="small"
                        />
                    </DialogContent>
                    <DialogActions sx={{ p: 2 }}>
                        <Button onClick={() => setCreateDialogOpen(false)} sx={{ textTransform: 'none' }}>
                            Cancel
                        </Button>
                        <Button 
                            type="submit" 
                            variant="contained" 
                            disabled={creatingIng || !newIngData.name.trim()}
                            sx={{ bgcolor: '#059669', '&:hover': { bgcolor: '#047857' }, textTransform: 'none', fontWeight: 700 }}
                        >
                            {creatingIng ? 'Creating...' : 'Create Ingredient'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Notification Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar({ ...snackbar, open: false })}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default AdminIngredientMapping;
