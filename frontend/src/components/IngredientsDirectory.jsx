import React, { useState, useEffect, useMemo } from 'react';
import { useOutletContext, Link } from 'react-router-dom';
import {
    Box, Typography, Button, IconButton, TextField, Dialog, DialogTitle,
    DialogContent, DialogActions, Select, MenuItem, FormControl, InputLabel,
    Chip, Tooltip, CircularProgress, Alert, Snackbar
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import KitchenIcon from '@mui/icons-material/Kitchen';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import SortIcon from '@mui/icons-material/Sort';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import './IngredientsDirectory.css';

// Helper to get category style class
function getCategoryBadgeClass(categoryName) {
    if (!categoryName) return 'cat-other';
    const cat = categoryName.toLowerCase();
    if (cat.includes('produce')) return 'cat-produce';
    if (cat.includes('meat') || cat.includes('poultry')) return 'cat-meat';
    if (cat.includes('seafood')) return 'cat-seafood';
    if (cat.includes('dairy') || cat.includes('egg')) return 'cat-dairy';
    if (cat.includes('bakery') || cat.includes('bread')) return 'cat-bakery';
    if (cat.includes('spice') || cat.includes('seasoning')) return 'cat-spices';
    if (cat.includes('oil') || cat.includes('vinegar') || cat.includes('condiment')) return 'cat-oils';
    if (cat.includes('baking')) return 'cat-baking';
    if (cat.includes('canned') || cat.includes('jarred')) return 'cat-canned';
    if (cat.includes('frozen')) return 'cat-frozen';
    if (cat.includes('beverage')) return 'cat-beverages';
    if (cat.includes('pantry')) return 'cat-pantry';
    return 'cat-other';
}

function IngredientsDirectory() {
    const { backendUrl } = useOutletContext();

    const [ingredients, setIngredients] = useState([]);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // Filters & Search
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('all');
    const [sortBy, setSortBy] = useState('popular-desc'); // popular-desc | name-asc | name-desc | popular-asc

    // Incremental DOM rendering for high performance
    const BATCH_SIZE = 48;
    const [displayLimit, setDisplayLimit] = useState(BATCH_SIZE);

    // Reset displayLimit on filter change
    useEffect(() => {
        setDisplayLimit(BATCH_SIZE);
    }, [searchQuery, selectedCategory, sortBy]);

    // Recipe Inspector Modal
    const [activeIngredient, setActiveIngredient] = useState(null);
    const [activeRecipes, setActiveRecipes] = useState([]);
    const [loadingRecipes, setLoadingRecipes] = useState(false);
    const [recipesDialogOpen, setRecipesDialogOpen] = useState(false);

    // Create / Edit Modal
    const [formDialogOpen, setFormDialogOpen] = useState(false);
    const [editingIngredient, setEditingIngredient] = useState(null);
    const [formData, setFormData] = useState({ name: '', category_id: '', default_unit: '' });
    const [submitting, setSubmitting] = useState(false);

    // Notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // 1. Fetch categories & ingredients
    const fetchData = async () => {
        try {
            setLoading(true);
            setError(null);

            const [catRes, ingRes] = await Promise.all([
                fetch(`${backendUrl}/api/ingredient_categories`, { credentials: 'include' }),
                fetch(`${backendUrl}/api/ingredients`, { credentials: 'include' })
            ]);

            if (!catRes.ok || !ingRes.ok) {
                throw new Error('Failed to load ingredients or categories');
            }

            const [catData, ingData] = await Promise.all([catRes.json(), ingRes.json()]);
            setCategories(Array.isArray(catData) ? catData : []);
            setIngredients(Array.isArray(ingData) ? ingData : []);
        } catch (err) {
            console.error('Error fetching ingredients:', err);
            setError('Could not load ingredients. Please make sure the server is running.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [backendUrl]);

    // 2. Open Recipe Inspector
    const handleViewRecipes = async (ingredient) => {
        setActiveIngredient(ingredient);
        setRecipesDialogOpen(true);
        setLoadingRecipes(true);
        try {
            const res = await fetch(`${backendUrl}/api/ingredients/${ingredient.id}`, { credentials: 'include' });
            if (res.ok) {
                const data = await res.json();
                setActiveRecipes(data.recipes || []);
            } else {
                setActiveRecipes([]);
            }
        } catch (e) {
            console.warn('Error loading recipes for ingredient:', e);
            setActiveRecipes([]);
        } finally {
            setLoadingRecipes(false);
        }
    };

    // 3. Open Create/Edit Dialog
    const handleOpenCreate = () => {
        setEditingIngredient(null);
        setFormData({ name: '', category_id: categories[0]?.id || '', default_unit: '' });
        setFormDialogOpen(true);
    };

    const handleOpenEdit = (ingredient, e) => {
        if (e) e.stopPropagation();
        setEditingIngredient(ingredient);
        setFormData({
            name: ingredient.name || '',
            category_id: ingredient.category_id || (ingredient.category?.id || ''),
            default_unit: ingredient.default_unit || ''
        });
        setFormDialogOpen(true);
    };

    // 4. Save Ingredient
    const handleSaveIngredient = async (e) => {
        e.preventDefault();
        if (!formData.name.trim()) return;

        setSubmitting(true);
        try {
            const isEdit = Boolean(editingIngredient);
            const url = isEdit
                ? `${backendUrl}/api/ingredients/${editingIngredient.id}`
                : `${backendUrl}/api/ingredients`;

            const res = await fetch(url, {
                method: isEdit ? 'PATCH' : 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(formData)
            });

            if (!res.ok) {
                const errData = await res.json().catch(() => ({}));
                throw new Error(errData.error || 'Failed to save ingredient');
            }

            const saved = await res.json();

            setIngredients(prev => {
                if (isEdit) {
                    return prev.map(item => item.id === saved.id ? { ...item, ...saved, category: categories.find(c => c.id === saved.category_id) } : item);
                } else {
                    return [...prev, { ...saved, category: categories.find(c => c.id === saved.category_id), recipe_count: 0 }];
                }
            });

            setSnackbar({
                open: true,
                message: isEdit ? `Updated "${saved.name}"` : `Added "${saved.name}" to catalog`,
                severity: 'success'
            });
            setFormDialogOpen(false);
        } catch (err) {
            setSnackbar({ open: true, message: err.message, severity: 'error' });
        } finally {
            setSubmitting(false);
        }
    };

    // Compute category counts
    const categoryCounts = useMemo(() => {
        const counts = { all: ingredients.length };
        ingredients.forEach(ing => {
            const catName = ing.category?.name || 'Other';
            counts[catName] = (counts[catName] || 0) + 1;
        });
        return counts;
    }, [ingredients]);

    // Filter and Sort Ingredients
    const filteredIngredients = useMemo(() => {
        let list = [...ingredients];

        // Search filter
        if (searchQuery.trim()) {
            const q = searchQuery.toLowerCase().trim();
            list = list.filter(ing => ing.name.toLowerCase().includes(q));
        }

        // Category filter
        if (selectedCategory !== 'all') {
            list = list.filter(ing => {
                const cName = ing.category?.name || 'Other';
                return cName.toLowerCase() === selectedCategory.toLowerCase();
            });
        }

        // Sort
        list.sort((a, b) => {
            if (sortBy === 'popular-desc') {
                return (b.recipe_count || 0) - (a.recipe_count || 0);
            }
            if (sortBy === 'popular-asc') {
                return (a.recipe_count || 0) - (b.recipe_count || 0);
            }
            if (sortBy === 'name-desc') {
                return b.name.localeCompare(a.name);
            }
            return a.name.localeCompare(b.name);
        });

        return list;
    }, [ingredients, searchQuery, selectedCategory, sortBy]);

    // Progressive loading listener (auto-loads next batch as user scrolls near bottom)
    useEffect(() => {
        const handleScroll = () => {
            if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 600) {
                setDisplayLimit(prev => {
                    if (prev < filteredIngredients.length) {
                        return Math.min(prev + BATCH_SIZE, filteredIngredients.length);
                    }
                    return prev;
                });
            }
        };
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [filteredIngredients.length]);

    const visibleIngredients = filteredIngredients.slice(0, displayLimit);

    return (
        <div className="ing-dir-container">
            {/* Header */}
            <div className="ing-header">
                <div className="ing-title-group">
                    <h1>
                        <span>🥘 Ingredients Catalog</span>
                        <span className="ing-badge-count">{ingredients.length} total</span>
                    </h1>
                    <p className="ing-subtitle">
                        Canonical pantry source of truth mapped across all recipes and grocery aisles.
                    </p>
                </div>
                <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
                    <Button
                        variant="outlined"
                        component={Link}
                        to="/ingredient-mapping"
                        sx={{
                            color: '#0f172a',
                            borderColor: '#cbd5e1',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 2.5,
                            px: 2,
                            py: 0.9,
                            bgcolor: '#ffffff',
                            '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                        }}
                    >
                        Mapping Studio 🛠️
                    </Button>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreate}
                        sx={{
                            background: '#3FFFC2',
                            color: '#0f172a',
                            fontWeight: 700,
                            textTransform: 'none',
                            borderRadius: 2.5,
                            px: 2.5,
                            py: 1,
                            boxShadow: '0 4px 14px rgba(63, 255, 194, 0.4)',
                            '&:hover': { background: '#2adca3' }
                        }}
                    >
                        Add Ingredient
                    </Button>
                </Box>
            </div>

            {/* Controls Bar */}
            <div className="ing-controls-bar">
                <div className="ing-search-row">
                    <div className="ing-search-input-wrapper">
                        <SearchIcon className="ing-search-icon" />
                        <input
                            type="text"
                            className="ing-search-input"
                            placeholder="Search ingredients (e.g. Garlic, Lemon, Salt, Paprika)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        {searchQuery && (
                            <IconButton
                                size="small"
                                onClick={() => setSearchQuery('')}
                                sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)' }}
                            >
                                <CloseIcon fontSize="small" />
                            </IconButton>
                        )}
                    </div>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel id="ing-sort-label">Sort by</InputLabel>
                        <Select
                            labelId="ing-sort-label"
                            value={sortBy}
                            label="Sort by"
                            onChange={(e) => setSortBy(e.target.value)}
                            sx={{ borderRadius: 2.5 }}
                        >
                            <MenuItem value="popular-desc">🔥 Most Used in Recipes</MenuItem>
                            <MenuItem value="name-asc">🔤 Alphabetical (A - Z)</MenuItem>
                            <MenuItem value="name-desc">🔤 Alphabetical (Z - A)</MenuItem>
                            <MenuItem value="popular-asc">🌱 Least Used</MenuItem>
                        </Select>
                    </FormControl>
                </div>

                {/* Category Pills */}
                <div className="ing-category-scroll">
                    <div
                        className={`ing-category-chip ${selectedCategory === 'all' ? 'active' : ''}`}
                        onClick={() => setSelectedCategory('all')}
                    >
                        <span>All Categories</span>
                        <span className="ing-category-count">{categoryCounts.all || 0}</span>
                    </div>

                    {categories.map(cat => (
                        <div
                            key={cat.id}
                            className={`ing-category-chip ${selectedCategory === cat.name ? 'active' : ''}`}
                            onClick={() => setSelectedCategory(cat.name)}
                        >
                            <span>{cat.name}</span>
                            <span className="ing-category-count">{categoryCounts[cat.name] || 0}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Error / Loading State */}
            {loading ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 8 }}>
                    <CircularProgress sx={{ color: '#3FFFC2', mb: 2 }} />
                    <Typography color="text.secondary">Loading ingredients catalog...</Typography>
                </Box>
            ) : error ? (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 3 }}>{error}</Alert>
            ) : filteredIngredients.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 8, background: '#ffffff', borderRadius: 4, p: 4, border: '1px dashed #cbd5e1' }}>
                    <KitchenIcon sx={{ fontSize: 48, color: '#94a3b8', mb: 1 }} />
                    <Typography variant="h6" fontWeight={700}>No ingredients found</Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, mb: 2 }}>
                        {searchQuery ? `No results matching "${searchQuery}"` : 'No ingredients in this category.'}
                    </Typography>
                    <Button variant="outlined" size="small" onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }}>
                        Clear Filters
                    </Button>
                </Box>
            ) : (
                /* Cards Grid */
                <>
                    <div className="ing-cards-grid">
                        {visibleIngredients.map(ing => {
                            const catName = ing.category?.name || 'Other';
                            const badgeClass = getCategoryBadgeClass(catName);

                            return (
                                <div key={ing.id} className="ing-card">
                                    <div>
                                        <div className="ing-card-header">
                                            <h3 className="ing-card-name">{ing.name}</h3>
                                            <span className={`ing-cat-badge ${badgeClass}`}>
                                                {catName}
                                            </span>
                                        </div>

                                        <div className="ing-card-meta">
                                            <span>
                                                🍳 Used in <strong>{ing.recipe_count || 0}</strong> {ing.recipe_count === 1 ? 'recipe' : 'recipes'}
                                            </span>
                                            {ing.default_unit && (
                                                <span>• Unit: {ing.default_unit}</span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="ing-card-actions">
                                        <button
                                            type="button"
                                            className="ing-recipes-btn"
                                            onClick={() => handleViewRecipes(ing)}
                                        >
                                            View Recipes ({ing.recipe_count || 0})
                                        </button>

                                        <Tooltip title="Edit Ingredient">
                                            <IconButton
                                                size="small"
                                                onClick={(e) => handleOpenEdit(ing, e)}
                                                sx={{ color: '#94a3b8', '&:hover': { color: '#0f172a' } }}
                                            >
                                                <EditIcon fontSize="small" />
                                            </IconButton>
                                        </Tooltip>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    {/* Progressive Load More Button */}
                    {displayLimit < filteredIngredients.length && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4, mb: 2 }}>
                            <Button
                                variant="outlined"
                                onClick={() => setDisplayLimit(prev => Math.min(prev + BATCH_SIZE, filteredIngredients.length))}
                                sx={{
                                    borderRadius: 3,
                                    textTransform: 'none',
                                    fontWeight: 700,
                                    px: 4,
                                    py: 1.2,
                                    borderColor: '#cbd5e1',
                                    color: '#334155',
                                    '&:hover': { bgcolor: '#f8fafc', borderColor: '#94a3b8' }
                                }}
                            >
                                Showing {visibleIngredients.length} of {filteredIngredients.length} ingredients • Load More
                            </Button>
                        </Box>
                    )}
                </>
            )}

            {/* Recipes Dialog */}
            <Dialog
                open={recipesDialogOpen}
                onClose={() => setRecipesDialogOpen(false)}
                maxWidth="sm"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
            >
                <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <Typography variant="h6" fontWeight={800}>
                            {activeIngredient?.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                            Recipes using this ingredient ({activeRecipes.length})
                        </Typography>
                    </div>
                    <IconButton size="small" onClick={() => setRecipesDialogOpen(false)}>
                        <CloseIcon />
                    </IconButton>
                </DialogTitle>
                <DialogContent dividers sx={{ maxHeight: 420 }}>
                    {loadingRecipes ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                            <CircularProgress size={32} sx={{ color: '#3FFFC2' }} />
                        </Box>
                    ) : activeRecipes.length === 0 ? (
                        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>
                            No recipes currently use this ingredient.
                        </Typography>
                    ) : (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                            {activeRecipes.map(r => (
                                <Link
                                    key={r.id}
                                    to={`/recipes/${r.id}`}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '0.65rem 0.85rem',
                                        borderRadius: '10px',
                                        border: '1px solid #e2e8f0',
                                        textDecoration: 'none',
                                        color: 'inherit',
                                        background: '#f8fafc',
                                        transition: 'background 0.15s ease'
                                    }}
                                    className="ing-recipe-link"
                                >
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                        {r.picture ? (
                                            <img
                                                src={r.picture}
                                                alt={r.name}
                                                style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }}
                                            />
                                        ) : (
                                            <div style={{ width: 40, height: 40, borderRadius: 8, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <RestaurantMenuIcon sx={{ color: '#94a3b8' }} />
                                            </div>
                                        )}
                                        <div>
                                            <Typography variant="body2" fontWeight={700}>
                                                {r.name}
                                            </Typography>
                                            {(r.quantity > 0 || r.unit || r.preparation) && (
                                                <Typography variant="caption" color="text.secondary">
                                                    Calls for: {r.quantity > 0 ? r.quantity : ''} {r.unit || ''} {r.preparation ? `(${r.preparation})` : ''}
                                                </Typography>
                                            )}
                                        </div>
                                    </div>
                                    <ArrowForwardIcon fontSize="small" sx={{ color: '#94a3b8' }} />
                                </Link>
                            ))}
                        </div>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setRecipesDialogOpen(false)} sx={{ textTransform: 'none', fontWeight: 600 }}>
                        Close
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Create / Edit Dialog */}
            <Dialog
                open={formDialogOpen}
                onClose={() => setFormDialogOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{ sx: { borderRadius: 3.5, p: 1 } }}
            >
                <form onSubmit={handleSaveIngredient}>
                    <DialogTitle sx={{ fontWeight: 800 }}>
                        {editingIngredient ? 'Edit Ingredient' : 'New Canonical Ingredient'}
                    </DialogTitle>
                    <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
                        <TextField
                            label="Ingredient Name"
                            required
                            fullWidth
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                            placeholder="e.g. Garlic, Lemon, Olive Oil"
                            autoFocus
                        />

                        <FormControl fullWidth required>
                            <InputLabel id="dialog-cat-select">Grocery Category / Aisle</InputLabel>
                            <Select
                                labelId="dialog-cat-select"
                                label="Grocery Category / Aisle"
                                value={formData.category_id}
                                onChange={(e) => setFormData(prev => ({ ...prev, category_id: e.target.value }))}
                            >
                                {categories.map(cat => (
                                    <MenuItem key={cat.id} value={cat.id}>
                                        {cat.name}
                                    </MenuItem>
                                ))}
                            </Select>
                        </FormControl>

                        <TextField
                            label="Default Unit (Optional)"
                            fullWidth
                            value={formData.default_unit}
                            onChange={(e) => setFormData(prev => ({ ...prev, default_unit: e.target.value }))}
                            placeholder="e.g. clove, whole, oz, bunch"
                        />
                    </DialogContent>
                    <DialogActions sx={{ px: 3, pb: 2 }}>
                        <Button
                            onClick={() => setFormDialogOpen(false)}
                            disabled={submitting}
                            sx={{ textTransform: 'none', fontWeight: 600 }}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            variant="contained"
                            disabled={submitting || !formData.name.trim()}
                            sx={{
                                background: '#3FFFC2',
                                color: '#0f172a',
                                fontWeight: 700,
                                textTransform: 'none',
                                borderRadius: 2,
                                '&:hover': { background: '#2adca3' }
                            }}
                        >
                            {submitting ? 'Saving...' : editingIngredient ? 'Save Changes' : 'Create Ingredient'}
                        </Button>
                    </DialogActions>
                </form>
            </Dialog>

            {/* Snackbar */}
            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert severity={snackbar.severity} sx={{ borderRadius: 3, fontWeight: 600 }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </div>
    );
}

export default IngredientsDirectory;
