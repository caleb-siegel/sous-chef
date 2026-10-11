import React, { useState, useEffect } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import { getRecipeSlug } from '../utils/slugify';
import {
    Box,
    Typography,
    TextField,
    Button,
    IconButton,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Chip,
    CircularProgress,
    Snackbar,
    Alert,
    Tooltip,
    Divider,
    InputAdornment,
    Autocomplete
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import SaveIcon from '@mui/icons-material/Save';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import NotesIcon from '@mui/icons-material/Notes';
import LabelIcon from '@mui/icons-material/Label';
import LocalOfferOutlinedIcon from '@mui/icons-material/LocalOfferOutlined';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import ImageIcon from '@mui/icons-material/Image';

import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import { parseInstructions } from './RecipePage';
import './Tag.css';
import './RecipeEditPage.css';

const UNIT_OPTIONS = [
    { value: '', label: '— None (pieces) —' },
    { value: 'Tsp', label: 'Tsp (Teaspoon)' },
    { value: 'Tbsp', label: 'Tbsp (Tablespoon)' },
    { value: 'Cup', label: 'Cup' },
    { value: 'Oz', label: 'Oz (Ounce)' },
    { value: 'Lb', label: 'Lb (Pound)' },
    { value: 'Grams', label: 'Grams (g)' },
    { value: 'Kg', label: 'Kg (Kilogram)' },
    { value: 'Ml', label: 'Ml (Milliliter)' },
    { value: 'Liter', label: 'Liter' },
    { value: 'Dash', label: 'Dash' },
    { value: 'Pinch', label: 'Pinch' },
    { value: 'Clove', label: 'Clove' },
    { value: 'Can', label: 'Can' },
    { value: 'Packet', label: 'Packet' },
    { value: 'Slice', label: 'Slice' },
];

function RecipeEditPage({ recipe, user, editRecipe, setEditRecipe, setRecipe }) {
    const context = useOutletContext() || {};
    const backendUrl = context.backendUrl || '';
    const navigate = useNavigate();

    // Form fields
    const [name, setName] = useState(recipe?.name || '');
    const [picture, setPicture] = useState(recipe?.picture || '');
    const [sourceCategoryId, setSourceCategoryId] = useState(recipe?.source_category_id || 1);
    const [sourceName, setSourceName] = useState(recipe?.source || '');
    const [reference, setReference] = useState(recipe?.reference || '');
    const [instructions, setInstructions] = useState(recipe?.instructions || '');

    // Ingredients
    const [ingredients, setIngredients] = useState(() => {
        return (recipe?.recipe_ingredients || []).map(ing => ({
            ...ing,
            ingredient_quantity: ing.ingredient_quantity ?? 0,
            ingredient_unit: ing.ingredient_unit || '',
            ingredient_name: ing.ingredient_name || '',
            ingredient_note: ing.ingredient_note || '',
            isNew: false
        }));
    });
    const [deletedIngredientIds, setDeletedIngredientIds] = useState([]);

    // Recipe Tags
    const [recipeTags, setRecipeTags] = useState(recipe?.recipe_tags || []);
    const [availableTags, setAvailableTags] = useState([]);
    const [selectedTagToAdd, setSelectedTagToAdd] = useState('');

    // User Personal Tags
    const [userRecipeTags, setUserRecipeTags] = useState(recipe?.user_recipe_tags || []);
    const [userTags, setUserTags] = useState([]);

    // Categories
    const [availableCategories, setAvailableCategories] = useState([]);

    // User Recipe Comments
    const getUserComments = () => {
        if (!recipe?.user_recipes || !user) return '';
        const ur = recipe.user_recipes.find(r => r && r.user_id === user.id);
        return ur?.comments || '';
    };
    const [userComments, setUserComments] = useState(getUserComments());

    // Instructions Tab
    const [instructionsTab, setInstructionsTab] = useState('edit');

    // Saving & Feedback
    const [isSaving, setIsSaving] = useState(false);
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
    const [imgError, setImgError] = useState(false);

    // Fetch tags and categories
    useEffect(() => {
        if (backendUrl) {
            fetch(`${backendUrl}/api/tag_names`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setAvailableTags(data);
                })
                .catch(err => console.warn('Could not fetch tags:', err));

            fetch(`${backendUrl}/api/user_tag_names`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setUserTags(data);
                })
                .catch(err => console.warn('Could not fetch user tags:', err));

            fetch(`${backendUrl}/api/category_names`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setAvailableCategories(data);
                })
                .catch(err => console.warn('Could not fetch categories:', err));
        }
    }, [backendUrl]);

    // Handle back / cancel
    const handleCancel = () => {
        if (setEditRecipe) {
            setEditRecipe(false);
        } else {
            navigate(-1);
        }
    };

    // Ingredient Row Modifications
    const handleIngredientChange = (index, field, value) => {
        setIngredients(prev => {
            const updated = [...prev];
            updated[index] = {
                ...updated[index],
                [field]: value
            };
            return updated;
        });
    };

    const handleAddIngredient = () => {
        setIngredients(prev => [
            ...prev,
            {
                id: `new_${Date.now()}_${Math.random()}`,
                ingredient_quantity: 1,
                ingredient_unit: '',
                ingredient_name: '',
                ingredient_note: '',
                isNew: true
            }
        ]);
    };

    const handleDeleteIngredient = (index) => {
        const ing = ingredients[index];
        if (!ing.isNew && ing.id) {
            setDeletedIngredientIds(prev => [...prev, ing.id]);
        }
        setIngredients(prev => prev.filter((_, idx) => idx !== index));
    };

    // Tag Operations
    const handleAddTag = async (tagId) => {
        if (!tagId) return;
        try {
            const res = await fetch(`${backendUrl}/api/recipetags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    recipe_id: recipe.id,
                    tag_id: Number(tagId)
                })
            });
            if (res.ok) {
                const newTagData = await res.json();
                setRecipeTags(prev => [...prev, newTagData]);
                setSelectedTagToAdd('');
                setSnackbar({ open: true, message: 'Tag added!', severity: 'success' });
            }
        } catch (err) {
            console.error('Failed to add tag:', err);
        }
    };

    const handleDeleteTag = async (recipeTagId) => {
        try {
            const res = await fetch(`${backendUrl}/api/recipetags/${recipeTagId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setRecipeTags(prev => prev.filter(t => t.id !== recipeTagId));
                setSnackbar({ open: true, message: 'Tag removed', severity: 'info' });
            }
        } catch (err) {
            console.error('Failed to delete tag:', err);
        }
    };

    // User Personal Tag Handlers
    const handleUserTagSelect = async (recId, tagId) => {
        if (!tagId || !user) return;
        try {
            const res = await fetch(`${backendUrl}/api/userrecipetags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recId,
                    user_tag_id: Number(tagId)
                })
            });
            if (res.ok) {
                const newURT = await res.json();
                setUserRecipeTags(prev => [...prev, newURT]);
                setSnackbar({ open: true, message: 'Personal tag added!', severity: 'success' });
            }
        } catch (err) {
            console.error('Failed to add personal tag:', err);
        }
    };

    const handleDeleteUserTag = async (urtId) => {
        try {
            const res = await fetch(`${backendUrl}/api/userrecipetags/${urtId}`, {
                method: 'DELETE',
                credentials: 'include'
            });
            if (res.ok) {
                setUserRecipeTags(prev => prev.filter(urt => urt.id !== urtId));
                setSnackbar({ open: true, message: 'Personal tag removed', severity: 'info' });
            }
        } catch (err) {
            console.error('Failed to delete personal tag:', err);
        }
    };

    // Save All Changes
    const handleSave = async (e) => {
        if (e && e.preventDefault) e.preventDefault();
        if (!name.trim()) {
            setSnackbar({ open: true, message: 'Recipe name cannot be empty', severity: 'warning' });
            return;
        }

        setIsSaving(true);
        try {
            const promises = [];

            // 1. Update Core Recipe Details
            const recipePromise = fetch(`${backendUrl}/api/recipes/${recipe.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json'
                },
                credentials: 'include',
                body: JSON.stringify({
                    name: name.trim(),
                    picture: picture.trim(),
                    source: sourceName.trim(),
                    reference: reference.trim(),
                    instructions: instructions.trim(),
                    source_category_id: sourceCategoryId
                })
            }).then(r => {
                if (!r.ok) throw new Error('Failed to update recipe details');
                return r.json();
            });
            promises.push(recipePromise);

            // 2. Delete Removed Ingredients
            deletedIngredientIds.forEach(delId => {
                const delPromise = fetch(`${backendUrl}/api/recipeingredients/${delId}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                promises.push(delPromise);
            });

            // 3. Update or Add Ingredients
            ingredients.forEach(ing => {
                const ingData = {
                    ingredient_name: ing.ingredient_name.trim(),
                    ingredient_quantity: parseFloat(ing.ingredient_quantity) || 0,
                    ingredient_unit: ing.ingredient_unit.trim(),
                    ingredient_note: ing.ingredient_note.trim()
                };

                // Skip completely blank rows
                if (!ingData.ingredient_name && ingData.ingredient_quantity === 0) return;

                if (ing.isNew) {
                    // Create new ingredient
                    const postPromise = fetch(`${backendUrl}/api/recipeingredients`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            recipe_id: recipe.id,
                            ...ingData
                        })
                    }).then(r => {
                        if (!r.ok) throw new Error('Failed to add new ingredient');
                        return r.json();
                    });
                    promises.push(postPromise);
                } else {
                    // Patch existing ingredient
                    const patchPromise = fetch(`${backendUrl}/api/recipeingredients/${ing.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify(ingData)
                    }).then(r => {
                        if (!r.ok) throw new Error(`Failed to update ingredient ${ing.id}`);
                        return r.json();
                    });
                    promises.push(patchPromise);
                }
            });

            // 4. Update Personal User Comments
            if (user) {
                const userRecipe = (recipe.user_recipes || []).find(r => r && r.user_id === user.id);
                if (userRecipe) {
                    const commentPromise = fetch(`${backendUrl}/api/userrecipes/${userRecipe.id}`, {
                        method: 'PATCH',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({ comments: userComments })
                    });
                    promises.push(commentPromise);
                } else if (userComments.trim()) {
                    const commentPromise = fetch(`${backendUrl}/api/userrecipes`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        credentials: 'include',
                        body: JSON.stringify({
                            user_id: user.id,
                            recipe_id: recipe.id,
                            not_reorder: false,
                            comments: userComments
                        })
                    });
                    promises.push(commentPromise);
                }
            }

            await Promise.all(promises);

            // Fetch fresh recipe data to update parent view
            const freshRes = await fetch(`${backendUrl}/api/recipes/${recipe.id}`);
            if (freshRes.ok) {
                const freshRecipe = await freshRes.json();
                if (setRecipe) {
                    setRecipe(freshRecipe);
                }
            }

            setSnackbar({ open: true, message: 'Recipe changes saved! ✨', severity: 'success' });

            // Transition back to recipe view
            setTimeout(() => {
                const targetSlug = getRecipeSlug(name || recipe.name);
                if (window.history && window.history.replaceState && targetSlug) {
                    window.history.replaceState(null, '', `/recipes/${targetSlug}`);
                }
                if (setEditRecipe) {
                    setEditRecipe(false);
                } else {
                    navigate(`/recipes/${targetSlug || recipe.id}`);
                }
            }, 600);
        } catch (error) {
            console.error('Error saving recipe:', error);
            setSnackbar({ open: true, message: `Save error: ${error.message}`, severity: 'error' });
        } finally {
            setIsSaving(false);
        }
    };

    // Instagram check
    const isInstagram = reference && (reference.includes('instagram.com') || reference.includes('instagr.am'));

    // Parsed preview for instructions
    const previewSteps = parseInstructions(instructions);

    return (
        <div className="recipe-edit-root">
            {/* Sticky Action Navigation Bar */}
            <header className="recipe-edit-topbar">
                <div className="recipe-edit-nav-left">
                    <button
                        type="button"
                        className="recipe-back-btn"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        <ArrowBackIcon fontSize="small" />
                        <span>Cancel</span>
                    </button>
                    <div className="recipe-edit-title-group">
                        <h1>Edit Recipe</h1>
                        <span>Editing: {recipe.name}</span>
                    </div>
                </div>

                <div className="recipe-edit-nav-actions">
                    <button
                        type="button"
                        className="recipe-edit-btn-cancel"
                        onClick={handleCancel}
                        disabled={isSaving}
                    >
                        Discard
                    </button>

                    <button
                        type="button"
                        className="recipe-edit-btn-save"
                        onClick={handleSave}
                        disabled={isSaving}
                    >
                        {isSaving ? (
                            <>
                                <CircularProgress size={16} color="inherit" />
                                <span>Saving Changes...</span>
                            </>
                        ) : (
                            <>
                                <SaveIcon fontSize="small" />
                                <span>Save Recipe</span>
                            </>
                        )}
                    </button>
                </div>
            </header>

            {/* Main Edit Layout */}
            <main className="recipe-edit-grid">
                {/* Left Column: Core Info, Source, Tags & Notes */}
                <div className="recipe-edit-col">
                    {/* Basic Info & Source */}
                    <div className="recipe-edit-card">
                        <div className="recipe-edit-card-header">
                            <h2 className="recipe-edit-card-title">
                                <RestaurantMenuIcon style={{ color: 'var(--rc-secondary)' }} />
                                <span>Recipe Details</span>
                            </h2>
                        </div>

                        <div className="recipe-edit-field-group">
                            <TextField
                                label="Recipe Name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="e.g. Steak Salad with Herb Vinaigrette"
                                required
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />

                            <div className="recipe-edit-row">
                                <FormControl fullWidth variant="outlined">
                                    <InputLabel id="category-select-label" shrink>Source Category</InputLabel>
                                    <Select
                                        labelId="category-select-label"
                                        label="Source Category"
                                        value={sourceCategoryId}
                                        onChange={(e) => setSourceCategoryId(Number(e.target.value))}
                                    >
                                        {availableCategories.map(cat => (
                                            <MenuItem key={cat.id} value={cat.id}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField
                                    label="Source / Creator Name"
                                    value={sourceName}
                                    onChange={(e) => setSourceName(e.target.value)}
                                    placeholder="e.g. NYT Cooking, Joy of Cooking"
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                />
                            </div>

                            <TextField
                                label="Reference (Page number or URL)"
                                value={reference}
                                onChange={(e) => setReference(e.target.value)}
                                placeholder="e.g. Page 142 or https://instagram.com/p/..."
                                fullWidth
                                variant="outlined"
                                InputLabelProps={{ shrink: true }}
                            />

                            <div>
                                <TextField
                                    label="Photo Image URL"
                                    value={picture}
                                    onChange={(e) => {
                                        setPicture(e.target.value);
                                        setImgError(false);
                                    }}
                                    placeholder="https://... or /recipes/..."
                                    fullWidth
                                    variant="outlined"
                                    InputLabelProps={{ shrink: true }}
                                    InputProps={{
                                        startAdornment: (
                                            <InputAdornment position="start">
                                                <ImageIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                                            </InputAdornment>
                                        ),
                                    }}
                                />

                                {/* Live Preview of Picture or Instagram */}
                                <div className="recipe-edit-media-preview">
                                    {picture && !imgError ? (
                                        <img
                                            src={picture}
                                            alt="Preview"
                                            onError={() => setImgError(true)}
                                        />
                                    ) : isInstagram ? (
                                        <Box sx={{ p: 3, textAlign: 'center' }}>
                                            <InstagramIcon sx={{ fontSize: 40, color: '#E1306C', mb: 1 }} />
                                            <Typography variant="body2" fontWeight="bold">
                                                Instagram Reel / Post Detected
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary">
                                                Will render responsive embedded player
                                            </Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ p: 3, textAlign: 'center', color: 'text.secondary' }}>
                                            <RestaurantMenuIcon sx={{ fontSize: 36, opacity: 0.4, mb: 1 }} />
                                            <Typography variant="caption" display="block">
                                                {imgError ? 'Image failed to load — fallback culinary art will be displayed' : 'Enter a photo URL above to preview image'}
                                            </Typography>
                                        </Box>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Recipe Tags & Personal Tags Card */}
                    <div className="recipe-edit-card">
                        <div className="recipe-edit-card-header">
                            <h2 className="recipe-edit-card-title">
                                <LabelIcon style={{ color: 'var(--rc-primary-dark)' }} />
                                <span>Categories & Tags</span>
                            </h2>
                            <span style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--rd-text-muted)' }}>
                                {recipeTags.length} category tag{recipeTags.length === 1 ? '' : 's'}
                            </span>
                        </div>

                        {/* Current Category Tags Chips */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
                            {recipeTags.length > 0 ? (
                                recipeTags.map(rt => {
                                    if (!rt || !rt.tag) return null;
                                    return (
                                        <Chip
                                            key={rt.id}
                                            label={rt.tag.name}
                                            size="small"
                                            icon={<LocalOfferOutlinedIcon sx={{ fontSize: '13px !important', color: '#059669 !important' }} />}
                                            onDelete={() => handleDeleteTag(rt.id)}
                                            sx={{
                                                fontWeight: 600,
                                                fontSize: '0.78rem',
                                                bgcolor: 'rgba(63, 255, 194, 0.18)',
                                                color: '#047857',
                                                border: '1px solid rgba(5, 150, 105, 0.28)',
                                                borderRadius: '9999px',
                                                '& .MuiChip-deleteIcon': {
                                                    color: '#059669',
                                                    '&:hover': { color: '#b91c1c' }
                                                }
                                            }}
                                        />
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.85rem' }}>
                                    No category tags assigned yet. Select from below to add.
                                </Typography>
                            )}
                        </Box>

                        {/* Modern Tag Autocomplete Selector */}
                        <Box sx={{ mt: 1 }}>
                            <Autocomplete
                                id="recipe-edit-add-tag-autocomplete"
                                options={availableTags.filter(t => !recipeTags.some(rt => rt.tag && rt.tag.id === t.id))}
                                getOptionLabel={(option) => (option && option.name) ? option.name : ''}
                                value={null}
                                onChange={(event, newValue) => {
                                    if (newValue && newValue.id) {
                                        handleAddTag(newValue.id);
                                    }
                                }}
                                fullWidth
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        size="small"
                                        placeholder="Search or select a tag to add..."
                                        InputProps={{
                                            ...params.InputProps,
                                            startAdornment: (
                                                <InputAdornment position="start">
                                                    <LocalOfferOutlinedIcon sx={{ fontSize: 16, color: '#059669', ml: 0.5 }} />
                                                </InputAdornment>
                                            ),
                                            sx: {
                                                borderRadius: '12px',
                                                backgroundColor: '#ffffff',
                                                '&:hover fieldset': {
                                                    borderColor: 'var(--rc-primary-dark, #059669)',
                                                },
                                                '&.Mui-focused fieldset': {
                                                    borderColor: 'var(--rc-primary-dark, #059669)',
                                                    borderWidth: '2px',
                                                },
                                            }
                                        }}
                                    />
                                )}
                                renderOption={(props, option) => (
                                    <li {...props} key={option.id}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', py: 0.5 }}>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <span style={{ color: '#059669', fontWeight: 700 }}>#</span>
                                                <span style={{ fontWeight: 500, fontSize: '0.85rem' }}>{option.name}</span>
                                            </Box>
                                            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: '#059669' }}>
                                                + Add
                                            </span>
                                        </Box>
                                    </li>
                                )}
                                slotProps={{
                                    paper: {
                                        sx: {
                                            borderRadius: '14px',
                                            mt: 0.5,
                                            border: '1px solid rgba(226, 232, 240, 0.9)',
                                            boxShadow: '0 12px 30px -4px rgba(15, 23, 42, 0.14)',
                                        }
                                    }
                                }}
                            />
                        </Box>

                        {/* Quick-Add Popular Tag Suggestions */}
                        {availableTags.filter(t => !recipeTags.some(rt => rt.tag && rt.tag.id === t.id)).slice(0, 6).length > 0 && (
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.75, alignItems: 'center', mt: 1.5 }}>
                                <Typography variant="caption" sx={{ color: 'text.secondary', fontWeight: 700, mr: 0.25, letterSpacing: '0.04em' }}>
                                    QUICK ADD:
                                </Typography>
                                {availableTags
                                    .filter(t => !recipeTags.some(rt => rt.tag && rt.tag.id === t.id))
                                    .slice(0, 6)
                                    .map(tag => (
                                        <button
                                            key={tag.id}
                                            type="button"
                                            className="tag-suggestion-pill"
                                            onClick={() => handleAddTag(tag.id)}
                                        >
                                            <AddIcon sx={{ fontSize: 12, color: '#059669' }} />
                                            <span>{tag.name}</span>
                                        </button>
                                    ))
                                }
                            </Box>
                        )}

                        {/* Personal Tags Section */}
                        {user && (
                            <Box sx={{ mt: 3, pt: 2.5, borderTop: '1px dashed #e2e8f0' }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1e293b', fontSize: '0.88rem' }}>
                                            ★ My Personal Tags
                                        </Typography>
                                        <span style={{ fontSize: '0.72rem', color: 'var(--rd-text-muted)', fontWeight: 500 }}>
                                            (Visible only to you)
                                        </span>
                                    </Box>
                                    <UserRecipeTagsMenu
                                        recipeId={recipe.id}
                                        tags={userTags}
                                        existingTagIds={userRecipeTags.filter(urt => urt.user_id === user.id).map(urt => urt.user_tag_id || urt.user_tag?.id)}
                                        handleTagSelect={handleUserTagSelect}
                                        label="+ Add Personal Tag"
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                                    {userRecipeTags.filter(urt => urt.user_id === user.id && urt.user_tag).length > 0 ? (
                                        userRecipeTags.filter(urt => urt.user_id === user.id && urt.user_tag).map(urt => (
                                            <Chip
                                                key={urt.id}
                                                label={`★ ${urt.user_tag.name}`}
                                                size="small"
                                                onDelete={() => handleDeleteUserTag(urt.id)}
                                                sx={{
                                                    fontWeight: 600,
                                                    fontSize: '0.78rem',
                                                    bgcolor: 'rgba(255, 125, 69, 0.12)',
                                                    color: '#c2410c',
                                                    border: '1px solid rgba(255, 125, 69, 0.35)',
                                                    borderRadius: '9999px',
                                                    '& .MuiChip-deleteIcon': {
                                                        color: '#ea580c',
                                                        fontSize: '16px',
                                                        '&:hover': { color: '#b91c1c' }
                                                    }
                                                }}
                                            />
                                        ))
                                    ) : (
                                        <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', fontSize: '0.82rem' }}>
                                            No personal tags added to this recipe yet. Click "+ Add Personal Tag" above.
                                        </Typography>
                                    )}
                                </Box>
                            </Box>
                        )}
                    </div>

                    {/* Personal Chef Notes */}
                    <div className="recipe-edit-card">
                        <div className="recipe-edit-card-header">
                            <h2 className="recipe-edit-card-title">
                                <NotesIcon style={{ color: '#f59e0b' }} />
                                <span>My Chef Notes</span>
                            </h2>
                        </div>

                        <TextField
                            label="Personal Notes & Tweaks"
                            placeholder="Add your personal tips, ingredient substitutions, or timing adjustments..."
                            value={userComments}
                            onChange={(e) => setUserComments(e.target.value)}
                            multiline
                            minRows={3}
                            maxRows={6}
                            fullWidth
                            variant="outlined"
                            InputLabelProps={{ shrink: true }}
                        />
                    </div>
                </div>

                {/* Right Column: Ingredients Table + Instructions Editor */}
                <div className="recipe-edit-col">
                    {/* Ingredients Editor Card */}
                    <div className="recipe-edit-card">
                        <div className="recipe-edit-card-header">
                            <div>
                                <h2 className="recipe-edit-card-title">
                                    <LocalDiningIcon style={{ color: 'var(--rc-primary-dark)' }} />
                                    <span>Ingredients</span>
                                </h2>
                                <Typography variant="caption" color="textSecondary">
                                    {ingredients.length} {ingredients.length === 1 ? 'ingredient' : 'ingredients'} listed
                                </Typography>
                            </div>

                            <Button
                                size="small"
                                variant="outlined"
                                color="secondary"
                                startIcon={<AddIcon />}
                                onClick={handleAddIngredient}
                                sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700 }}
                            >
                                Add Row
                            </Button>
                        </div>

                        {/* Ingredients Table Header */}
                        <div className="recipe-edit-ingredients-header">
                            <span>Qty</span>
                            <span>Unit</span>
                            <span>Ingredient</span>
                            <span>Notes / Prep</span>
                            <span></span>
                        </div>

                        {/* Ingredients Rows */}
                        <div className="recipe-edit-ingredients-list">
                            {ingredients.map((ing, index) => (
                                <div key={ing.id || index} className="recipe-edit-ingredient-row">
                                    {/* Quantity */}
                                    <TextField
                                        size="small"
                                        type="number"
                                        inputProps={{ step: 'any', min: '0' }}
                                        placeholder="1"
                                        value={ing.ingredient_quantity === 0 ? '' : ing.ingredient_quantity}
                                        onChange={(e) => handleIngredientChange(index, 'ingredient_quantity', e.target.value)}
                                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    />

                                    {/* Unit */}
                                    <FormControl size="small" fullWidth sx={{ bgcolor: 'background.paper', borderRadius: 1 }}>
                                        <Select
                                            value={ing.ingredient_unit}
                                            onChange={(e) => handleIngredientChange(index, 'ingredient_unit', e.target.value)}
                                            displayEmpty
                                        >
                                            {UNIT_OPTIONS.map(opt => (
                                                <MenuItem key={opt.value} value={opt.value}>{opt.label}</MenuItem>
                                            ))}
                                        </Select>
                                    </FormControl>

                                    {/* Ingredient Name */}
                                    <TextField
                                        size="small"
                                        placeholder="e.g. Sirloin steak"
                                        value={ing.ingredient_name}
                                        onChange={(e) => handleIngredientChange(index, 'ingredient_name', e.target.value)}
                                        required
                                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    />

                                    {/* Ingredient Note */}
                                    <TextField
                                        size="small"
                                        placeholder="e.g. Grass fed, minced"
                                        value={ing.ingredient_note}
                                        onChange={(e) => handleIngredientChange(index, 'ingredient_note', e.target.value)}
                                        sx={{ bgcolor: 'background.paper', borderRadius: 1 }}
                                    />

                                    {/* Delete Button */}
                                    <Tooltip title="Remove ingredient">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteIngredient(index)}
                                            sx={{
                                                color: 'text.secondary',
                                                '&:hover': { color: 'error.main', bgcolor: 'error.light' }
                                            }}
                                        >
                                            <DeleteOutlineIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </div>
                            ))}
                        </div>

                        <button
                            type="button"
                            className="recipe-edit-add-ing-btn"
                            onClick={handleAddIngredient}
                        >
                            <AddIcon fontSize="small" />
                            <span>Add Another Ingredient</span>
                        </button>
                    </div>

                    {/* Instructions Editor Card */}
                    <div className="recipe-edit-card">
                        <div className="recipe-edit-card-header">
                            <div>
                                <h2 className="recipe-edit-card-title">
                                    <MenuBookIcon style={{ color: 'var(--rc-secondary)' }} />
                                    <span>Instructions</span>
                                </h2>
                                <Typography variant="caption" color="textSecondary">
                                    Format numbered steps or bullet lines
                                </Typography>
                            </div>

                            {/* View Switcher Tabs */}
                            <div className="recipe-edit-tabs">
                                <button
                                    type="button"
                                    className={`recipe-edit-tab-btn ${instructionsTab === 'edit' ? 'active' : ''}`}
                                    onClick={() => setInstructionsTab('edit')}
                                >
                                    Edit Text
                                </button>
                                <button
                                    type="button"
                                    className={`recipe-edit-tab-btn ${instructionsTab === 'preview' ? 'active' : ''}`}
                                    onClick={() => setInstructionsTab('preview')}
                                >
                                    Live Preview ({previewSteps.length})
                                </button>
                            </div>
                        </div>

                        {instructionsTab === 'edit' ? (
                            <div>
                                <TextField
                                    placeholder="1. Preheat the oven to 400°F.
2. Season steaks on each side with salt and pepper.
3. Sear for two minutes per side on high heat..."
                                    value={instructions}
                                    onChange={(e) => setInstructions(e.target.value)}
                                    multiline
                                    minRows={8}
                                    maxRows={24}
                                    fullWidth
                                    variant="outlined"
                                    sx={{
                                        fontFamily: 'monospace',
                                        fontSize: '0.95rem',
                                        lineHeight: 1.6,
                                        bgcolor: 'var(--rc-surface-alt, #f8fafc)'
                                    }}
                                />
                                <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                                    💡 <strong>Tip:</strong> You can enter steps with numbers (<code>1.</code> <code>2.</code>), dashes (<code>-</code>), or new lines. Sous Chef will automatically convert each into interactive cooking step cards.
                                </Typography>
                            </div>
                        ) : (
                            <div className="recipe-instructions-list">
                                {previewSteps.length > 0 ? (
                                    previewSteps.map((stepText, idx) => (
                                        <div key={idx} className="recipe-step-card">
                                            <div className="recipe-step-number-pill">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>
                                            <div className="recipe-step-body">
                                                <p className="recipe-step-text">{stepText}</p>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>
                                        <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                            No steps entered yet. Switch to "Edit Text" to add instructions.
                                        </Typography>
                                    </Box>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Toast Feedback */}
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
        </div>
    );
}

export default RecipeEditPage;