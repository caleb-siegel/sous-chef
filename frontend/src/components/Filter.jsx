import React, { useState, useMemo } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Button,
    IconButton,
    TextField,
    Autocomplete,
    Chip,
    Box,
    Typography,
    Tabs,
    Tab,
    Grid,
    Paper,
    Divider,
    Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import KitchenIcon from '@mui/icons-material/Kitchen';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import InstagramIcon from '@mui/icons-material/Instagram';
import PublicIcon from '@mui/icons-material/Public';
import HomeIcon from '@mui/icons-material/Home';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import BlockIcon from '@mui/icons-material/Block';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import LayersIcon from '@mui/icons-material/Layers';
import { getRecipeSourceCategory, SOURCE_CATEGORIES, getSourceCategoryMeta } from '../utils/sourceCategory';

function Filter({
    open = false,
    onClose,
    includeUserTags = [],
    setIncludeUserTags,
    excludeUserTags = [],
    setExcludeUserTags,
    includeTags = [],
    setIncludeTags,
    excludeTags = [],
    setExcludeTags,
    includeSourceCategories = [],
    setIncludeSourceCategories,
    excludeSourceCategories = [],
    setExcludeSourceCategories,
    includeSources = [],
    setIncludeSources,
    excludeSources = [],
    setExcludeSources,
    includeIngredients = [],
    setIncludeIngredients,
    excludeIngredients = [],
    setExcludeIngredients,
    includeRecipeNames = [],
    setIncludeRecipeNames,
    excludeRecipeNames = [],
    setExcludeRecipeNames,
    tags = [],
    userTags = [],
    sourceCategories = [],
    recipes = [],
    user
}) {
    const [currentTab, setCurrentTab] = useState(0);
    const [ingIncludeInput, setIngIncludeInput] = useState('');
    const [ingExcludeInput, setIngExcludeInput] = useState('');
    const [nameIncludeInput, setNameIncludeInput] = useState('');
    const [nameExcludeInput, setNameExcludeInput] = useState('');
    const [sourceIncludeInput, setSourceIncludeInput] = useState('');
    const [sourceExcludeInput, setSourceExcludeInput] = useState('');

    const availableUserTagNames = useMemo(() => {
        return (userTags || []).map(ut => ut.name).filter(Boolean);
    }, [userTags]);

    const availableTagNames = useMemo(() => {
        return (tags || []).map(t => t.name).filter(Boolean);
    }, [tags]);

    // Unique recipe names for autocompleting title keywords
    const availableRecipeTitles = useMemo(() => {
        return Array.from(new Set((recipes || []).map(r => r.name).filter(Boolean))).sort();
    }, [recipes]);

    // Available source categories (Instagram, Life, Cookbook, Website, Restaurant)
    const availableSourceCategoryNames = useMemo(() => {
        const set = new Set(SOURCE_CATEGORIES.map(c => c.name));
        (sourceCategories || []).forEach(sc => {
            if (sc?.name) set.add(sc.name);
        });
        (recipes || []).forEach(r => {
            const cat = getRecipeSourceCategory(r);
            if (cat && cat !== 'Other') set.add(cat);
        });
        return Array.from(set);
    }, [sourceCategories, recipes]);

    // Recipe counts per source category in currently loaded recipes
    const sourceCategoryCounts = useMemo(() => {
        const counts = {};
        (recipes || []).forEach(r => {
            const cat = getRecipeSourceCategory(r);
            counts[cat] = (counts[cat] || 0) + 1;
        });
        return counts;
    }, [recipes]);

    // Unique specific source names (e.g. cookbooks, authors, handles)
    const availableSpecificSources = useMemo(() => {
        return Array.from(new Set((recipes || []).map(r => r.source).filter(Boolean))).sort();
    }, [recipes]);

    // Fast toggle helpers for 1-click chip clicking
    const toggleIncludeUserTag = (tag) => {
        if (includeUserTags.includes(tag)) {
            setIncludeUserTags(prev => prev.filter(t => t !== tag));
        } else {
            setIncludeUserTags(prev => [...prev, tag]);
            setExcludeUserTags(prev => prev.filter(t => t !== tag));
        }
    };

    const toggleExcludeUserTag = (tag) => {
        if (excludeUserTags.includes(tag)) {
            setExcludeUserTags(prev => prev.filter(t => t !== tag));
        } else {
            setExcludeUserTags(prev => [...prev, tag]);
            setIncludeUserTags(prev => prev.filter(t => t !== tag));
        }
    };

    const toggleIncludeTag = (tag) => {
        if (includeTags.includes(tag)) {
            setIncludeTags(prev => prev.filter(t => t !== tag));
        } else {
            setIncludeTags(prev => [...prev, tag]);
            setExcludeTags(prev => prev.filter(t => t !== tag));
        }
    };

    const toggleExcludeTag = (tag) => {
        if (excludeTags.includes(tag)) {
            setExcludeTags(prev => prev.filter(t => t !== tag));
        } else {
            setExcludeTags(prev => [...prev, tag]);
            setIncludeTags(prev => prev.filter(t => t !== tag));
        }
    };

    const toggleIncludeSourceCategory = (cat) => {
        if (!setIncludeSourceCategories) return;
        if (includeSourceCategories.includes(cat)) {
            setIncludeSourceCategories(prev => prev.filter(c => c !== cat));
        } else {
            setIncludeSourceCategories(prev => [...prev, cat]);
            if (setExcludeSourceCategories) {
                setExcludeSourceCategories(prev => prev.filter(c => c !== cat));
            }
        }
    };

    const toggleExcludeSourceCategory = (cat) => {
        if (!setExcludeSourceCategories) return;
        if (excludeSourceCategories.includes(cat)) {
            setExcludeSourceCategories(prev => prev.filter(c => c !== cat));
        } else {
            setExcludeSourceCategories(prev => [...prev, cat]);
            if (setIncludeSourceCategories) {
                setIncludeSourceCategories(prev => prev.filter(c => c !== cat));
            }
        }
    };

    const toggleIncludeSpecificSource = (src) => {
        if (!setIncludeSources) return;
        if (includeSources.includes(src)) {
            setIncludeSources(prev => prev.filter(s => s !== src));
        } else {
            setIncludeSources(prev => [...prev, src]);
            if (setExcludeSources) {
                setExcludeSources(prev => prev.filter(s => s !== src));
            }
        }
    };

    const toggleExcludeSpecificSource = (src) => {
        if (!setExcludeSources) return;
        if (excludeSources.includes(src)) {
            setExcludeSources(prev => prev.filter(s => s !== src));
        } else {
            setExcludeSources(prev => [...prev, src]);
            if (setIncludeSources) {
                setIncludeSources(prev => prev.filter(s => s !== src));
            }
        }
    };

    const handleAddIncludeIngredient = (valToAdd) => {
        const val = (valToAdd || ingIncludeInput).trim();
        if (val && !includeIngredients.some(i => i.toLowerCase() === val.toLowerCase())) {
            setIncludeIngredients(prev => [...prev, val]);
            setIngIncludeInput('');
            setExcludeIngredients(prev => prev.filter(i => i.toLowerCase() !== val.toLowerCase()));
        }
    };

    const handleAddExcludeIngredient = (valToAdd) => {
        const val = (valToAdd || ingExcludeInput).trim();
        if (val && !excludeIngredients.some(i => i.toLowerCase() === val.toLowerCase())) {
            setExcludeIngredients(prev => [...prev, val]);
            setIngExcludeInput('');
            setIncludeIngredients(prev => prev.filter(i => i.toLowerCase() !== val.toLowerCase()));
        }
    };

    const handleAddIncludeName = (valToAdd) => {
        const val = (valToAdd || nameIncludeInput).trim();
        if (val && !includeRecipeNames.some(n => n.toLowerCase() === val.toLowerCase())) {
            setIncludeRecipeNames(prev => [...prev, val]);
            setNameIncludeInput('');
            setExcludeRecipeNames(prev => prev.filter(n => n.toLowerCase() !== val.toLowerCase()));
        }
    };

    const handleAddExcludeName = (valToAdd) => {
        const val = (valToAdd || nameExcludeInput).trim();
        if (val && !excludeRecipeNames.some(n => n.toLowerCase() === val.toLowerCase())) {
            setExcludeRecipeNames(prev => [...prev, val]);
            setNameExcludeInput('');
            setIncludeRecipeNames(prev => prev.filter(n => n.toLowerCase() !== val.toLowerCase()));
        }
    };

    const handleAddIncludeSpecificSource = (valToAdd) => {
        const val = (valToAdd || sourceIncludeInput).trim();
        if (val && setIncludeSources && !includeSources.some(s => s.toLowerCase() === val.toLowerCase())) {
            setIncludeSources(prev => [...prev, val]);
            setSourceIncludeInput('');
            if (setExcludeSources) {
                setExcludeSources(prev => prev.filter(s => s.toLowerCase() !== val.toLowerCase()));
            }
        }
    };

    const handleAddExcludeSpecificSource = (valToAdd) => {
        const val = (valToAdd || sourceExcludeInput).trim();
        if (val && setExcludeSources && !excludeSources.some(s => s.toLowerCase() === val.toLowerCase())) {
            setExcludeSources(prev => [...prev, val]);
            setSourceExcludeInput('');
            if (setIncludeSources) {
                setIncludeSources(prev => prev.filter(s => s.toLowerCase() !== val.toLowerCase()));
            }
        }
    };

    const handleClearAll = () => {
        setIncludeUserTags([]);
        setExcludeUserTags([]);
        setIncludeTags([]);
        setExcludeTags([]);
        if (setIncludeSourceCategories) setIncludeSourceCategories([]);
        if (setExcludeSourceCategories) setExcludeSourceCategories([]);
        if (setIncludeSources) setIncludeSources([]);
        if (setExcludeSources) setExcludeSources([]);
        setIncludeIngredients([]);
        setExcludeIngredients([]);
        setIncludeRecipeNames([]);
        setExcludeRecipeNames([]);
        setIngIncludeInput('');
        setIngExcludeInput('');
        setNameIncludeInput('');
        setNameExcludeInput('');
        setSourceIncludeInput('');
        setSourceExcludeInput('');
    };

    const userTagCount = includeUserTags.length + excludeUserTags.length;
    const tagCount = includeTags.length + excludeTags.length;
    const sourceCategoryCount = includeSourceCategories.length + excludeSourceCategories.length;
    const specificSourceCount = includeSources.length + excludeSources.length;
    const totalSourceCount = sourceCategoryCount + specificSourceCount;
    const ingCount = includeIngredients.length + excludeIngredients.length;
    const nameCount = includeRecipeNames.length + excludeRecipeNames.length;
    const totalFilterCount = userTagCount + tagCount + totalSourceCount + ingCount + nameCount;

    // Real-time matching preview
    const matchingCount = useMemo(() => {
        if (!recipes || recipes.length === 0) return 0;
        if (totalFilterCount === 0) return recipes.length;

        return recipes.filter(recipe => {
            // Source Category Exclusions
            if (excludeSourceCategories.length > 0) {
                const rCat = getRecipeSourceCategory(recipe).toLowerCase();
                if (excludeSourceCategories.some(c => c.toLowerCase() === rCat)) {
                    return false;
                }
            }

            // Source Category Inclusions
            if (includeSourceCategories.length > 0) {
                const rCat = getRecipeSourceCategory(recipe).toLowerCase();
                if (!includeSourceCategories.some(c => c.toLowerCase() === rCat)) {
                    return false;
                }
            }

            // Specific Source Exclusions
            if (excludeSources.length > 0) {
                const rSource = (recipe.source || '').toLowerCase();
                if (excludeSources.some(s => rSource.includes(s.toLowerCase()))) {
                    return false;
                }
            }

            // Specific Source Inclusions
            if (includeSources.length > 0) {
                const rSource = (recipe.source || '').toLowerCase();
                if (!includeSources.some(s => rSource.includes(s.toLowerCase()))) {
                    return false;
                }
            }

            // Recipe Name Exclusions
            if (excludeRecipeNames.length > 0) {
                const rName = (recipe.name || '').toLowerCase();
                if (excludeRecipeNames.some(avoid => rName.includes(avoid.toLowerCase()))) {
                    return false;
                }
            }

            // Recipe Name Inclusions
            if (includeRecipeNames.length > 0) {
                const rName = (recipe.name || '').toLowerCase();
                if (!includeRecipeNames.every(req => rName.includes(req.toLowerCase()))) {
                    return false;
                }
            }

            // User Tag Exclusions
            if (excludeUserTags.length > 0) {
                const rUserTags = (recipe.user_recipe_tags || [])
                    .filter(urt => !user?.id || String(urt.user_id) === String(user.id) || !urt.user_id)
                    .map(urt => urt.user_tag?.name?.toLowerCase())
                    .filter(Boolean);
                if (excludeUserTags.some(avoid => rUserTags.includes(avoid.toLowerCase()))) {
                    return false;
                }
            }

            // User Tag Inclusions
            if (includeUserTags.length > 0) {
                const rUserTags = (recipe.user_recipe_tags || [])
                    .filter(urt => !user?.id || String(urt.user_id) === String(user.id) || !urt.user_id)
                    .map(urt => urt.user_tag?.name?.toLowerCase())
                    .filter(Boolean);
                if (!includeUserTags.every(req => rUserTags.includes(req.toLowerCase()))) {
                    return false;
                }
            }

            // Recipe Tag Exclusions
            if (excludeTags.length > 0) {
                const rTags = (recipe.recipe_tags || [])
                    .map(t => t.tag?.name?.toLowerCase())
                    .filter(Boolean);
                if (excludeTags.some(avoid => rTags.includes(avoid.toLowerCase()))) {
                    return false;
                }
            }

            // Recipe Tag Inclusions
            if (includeTags.length > 0) {
                const rTags = (recipe.recipe_tags || [])
                    .map(t => t.tag?.name?.toLowerCase())
                    .filter(Boolean);
                if (!includeTags.every(req => rTags.includes(req.toLowerCase()))) {
                    return false;
                }
            }

            // Ingredient Exclusions
            if (excludeIngredients.length > 0) {
                const rIngs = (recipe.recipe_ingredients || [])
                    .map(ing => (typeof ing === 'string' ? ing : ing.ingredient_name || '').toLowerCase());
                if (excludeIngredients.some(avoid => rIngs.some(i => i.includes(avoid.toLowerCase())))) {
                    return false;
                }
            }

            // Ingredient Inclusions
            if (includeIngredients.length > 0) {
                const rIngs = (recipe.recipe_ingredients || [])
                    .map(ing => (typeof ing === 'string' ? ing : ing.ingredient_name || '').toLowerCase());
                if (!includeIngredients.every(req => rIngs.some(i => i.includes(req.toLowerCase())))) {
                    return false;
                }
            }

            return true;
        }).length;
    }, [
        recipes,
        includeSourceCategories,
        excludeSourceCategories,
        includeSources,
        excludeSources,
        includeUserTags,
        excludeUserTags,
        includeTags,
        excludeTags,
        includeIngredients,
        excludeIngredients,
        includeRecipeNames,
        excludeRecipeNames,
        totalFilterCount,
        user
    ]);

    // Common quick ingredients suggestions
    const commonIncludeIngredients = ['chicken', 'salmon', 'garlic', 'onion', 'pasta', 'rice', 'spinach', 'tomato'];
    const commonExcludeIngredients = ['cilantro', 'dairy', 'nuts', 'gluten', 'pork', 'mushrooms', 'shellfish'];

    // Common quick name keywords suggestions
    const commonIncludeNames = ['chicken', 'salmon', 'salad', 'soup', 'pasta', 'bowl', 'pie', 'roast'];
    const commonExcludeNames = ['spicy', 'fried', 'liver', 'raw', 'bacon'];

    // Helper for rendering category icon/emoji
    const renderCategoryIcon = (categoryName) => {
        const meta = getSourceCategoryMeta(categoryName);
        if (categoryName.toLowerCase() === 'instagram') {
            return <InstagramIcon sx={{ fontSize: 16, color: '#E1306C' }} />;
        }
        if (categoryName.toLowerCase() === 'life') {
            return <HomeIcon sx={{ fontSize: 16, color: '#059669' }} />;
        }
        if (categoryName.toLowerCase() === 'cookbook') {
            return <MenuBookIcon sx={{ fontSize: 16, color: '#2563eb' }} />;
        }
        if (categoryName.toLowerCase() === 'website') {
            return <PublicIcon sx={{ fontSize: 16, color: '#d97706' }} />;
        }
        if (categoryName.toLowerCase() === 'restaurant') {
            return <RestaurantIcon sx={{ fontSize: 16, color: '#7c3aed' }} />;
        }
        return meta ? <span>{meta.emoji}</span> : null;
    };

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="md"
            fullWidth
            scroll="paper"
            PaperProps={{
                sx: {
                    borderRadius: 3.5,
                    maxHeight: '88vh',
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden',
                    boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25)'
                }
            }}
        >
            {/* Header */}
            <DialogTitle
                sx={{
                    m: 0,
                    p: { xs: 2, sm: 2.5 },
                    pb: 1.5,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderBottom: '1px solid #f1f5f9',
                    bgcolor: '#ffffff'
                }}
            >
                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box
                        sx={{
                            width: 42,
                            height: 42,
                            borderRadius: 2.5,
                            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(249, 115, 22, 0.15))',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: '#059669',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.03)'
                        }}
                    >
                        <FilterAltIcon fontSize="medium" />
                    </Box>
                    <Box>
                        <Typography variant="h6" fontWeight={800} color="#0f172a" sx={{ lineHeight: 1.2 }}>
                            Filter Recipes
                        </Typography>
                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                            Combine includes and excludes across tags, sources (Instagram vs Life), ingredients, and recipe names
                        </Typography>
                    </Box>
                </Box>
                <IconButton onClick={onClose} size="small" sx={{ color: '#64748b' }}>
                    <CloseIcon />
                </IconButton>
            </DialogTitle>

            {/* Navigation Tabs */}
            <Box sx={{ borderBottom: 1, borderColor: '#e2e8f0', bgcolor: '#f8fafc', px: 2.5 }}>
                <Tabs
                    value={currentTab}
                    onChange={(e, val) => setCurrentTab(val)}
                    variant="scrollable"
                    scrollButtons="auto"
                    sx={{
                        minHeight: 48,
                        '& .MuiTab-root': {
                            textTransform: 'none',
                            fontWeight: 700,
                            fontSize: '0.88rem',
                            minHeight: 48,
                            py: 1.2,
                            color: '#64748b',
                            '&.Mui-selected': {
                                color: '#059669'
                            }
                        },
                        '& .MuiTabs-indicator': {
                            bgcolor: '#059669',
                            height: 3,
                            borderRadius: '3px 3px 0 0'
                        }
                    }}
                >
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <PersonPinIcon sx={{ fontSize: 18 }} />
                                <span>User Tags</span>
                                {userTagCount > 0 && (
                                    <Chip label={userTagCount} size="small" color="success" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <LocalOfferIcon sx={{ fontSize: 18 }} />
                                <span>Course & Diet</span>
                                {tagCount > 0 && (
                                    <Chip label={tagCount} size="small" color="primary" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <AutoStoriesIcon sx={{ fontSize: 18 }} />
                                <span>Source</span>
                                {totalSourceCount > 0 && (
                                    <Chip label={totalSourceCount} size="small" color="info" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <KitchenIcon sx={{ fontSize: 18 }} />
                                <span>Ingredients</span>
                                {ingCount > 0 && (
                                    <Chip label={ingCount} size="small" color="warning" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <MenuBookIcon sx={{ fontSize: 18 }} />
                                <span>Recipe Name</span>
                                {nameCount > 0 && (
                                    <Chip label={nameCount} size="small" color="secondary" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                    <Tab
                        label={
                            <Box display="flex" alignItems="center" gap={1}>
                                <LayersIcon sx={{ fontSize: 18 }} />
                                <span>All Active</span>
                                {totalFilterCount > 0 && (
                                    <Chip label={totalFilterCount} size="small" color="error" sx={{ height: 18, fontSize: '0.7rem', fontWeight: 800 }} />
                                )}
                            </Box>
                        }
                    />
                </Tabs>
            </Box>

            {/* Content Body */}
            <DialogContent
                dividers
                sx={{
                    p: { xs: 2, sm: 2.5 },
                    bgcolor: '#fafafa',
                    flex: 1,
                    overflowY: 'auto'
                }}
            >
                {/* TAB 0: USER RECIPE TAGS */}
                {currentTab === 0 && (
                    <Box>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                Include recipes with specific personal tags (like <strong>eaten</strong>) and exclude unwanted ones (like <strong>not a reorder</strong>).
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* Column 1: Include User Tags */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: includeUserTags.length > 0 ? '#10b981' : '#e2e8f0',
                                        borderWidth: includeUserTags.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#065f46">
                                             Include User Tags (Must Have)
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableUserTagNames}
                                        value={includeUserTags}
                                        onChange={(e, val) => {
                                            setIncludeUserTags(val);
                                            setExcludeUserTags(prev => prev.filter(t => !val.includes(t)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={includeUserTags.length === 0 ? "Search or select tag to include..." : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    label={`+ ${option}`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick (Click to Include):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableUserTagNames.map(tag => {
                                            const isIncluded = includeUserTags.includes(tag);
                                            const isExcluded = excludeUserTags.includes(tag);
                                            return (
                                                <Chip
                                                    key={`pick-inc-${tag}`}
                                                    label={isIncluded ? `✓ ${tag}` : `+ ${tag}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleIncludeUserTag(tag)}
                                                    color={isIncluded ? "success" : "default"}
                                                    variant={isIncluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isIncluded ? 700 : 500,
                                                        opacity: isExcluded ? 0.4 : 1,
                                                        cursor: isExcluded ? 'not-allowed' : 'pointer'
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Column 2: Exclude User Tags */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: excludeUserTags.length > 0 ? '#f43f5e' : '#e2e8f0',
                                        borderWidth: excludeUserTags.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <BlockIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#9f1239">
                                            Exclude User Tags (Avoid / Skip)
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableUserTagNames}
                                        value={excludeUserTags}
                                        onChange={(e, val) => {
                                            setExcludeUserTags(val);
                                            setIncludeUserTags(prev => prev.filter(t => !val.includes(t)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={excludeUserTags.length === 0 ? "Search or select tag to avoid..." : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    label={`− ${option}`}
                                                    size="small"
                                                    color="error"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick (Click to Exclude):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableUserTagNames.map(tag => {
                                            const isIncluded = includeUserTags.includes(tag);
                                            const isExcluded = excludeUserTags.includes(tag);
                                            return (
                                                <Chip
                                                    key={`pick-exc-${tag}`}
                                                    label={isExcluded ? `✕ ${tag}` : `− ${tag}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleExcludeUserTag(tag)}
                                                    color={isExcluded ? "error" : "default"}
                                                    variant={isExcluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isExcluded ? 700 : 500,
                                                        opacity: isIncluded ? 0.4 : 1,
                                                        cursor: isIncluded ? 'not-allowed' : 'pointer'
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* TAB 1: COURSE & DIET RECIPE TAGS */}
                {currentTab === 1 && (
                    <Box>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                Filter by dietary standards (vegan, passover, healthy) or meal course (dinner, soup, dessert).
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* Column 1: Include Course/Diet Tags */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: includeTags.length > 0 ? '#10b981' : '#e2e8f0',
                                        borderWidth: includeTags.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#065f46">
                                            Include Tags (Must Have)
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableTagNames}
                                        value={includeTags}
                                        onChange={(e, val) => {
                                            setIncludeTags(val);
                                            setExcludeTags(prev => prev.filter(t => !val.includes(t)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={includeTags.length === 0 ? "Search tags to include..." : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    label={`+ ${option}`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick (Click to Include):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableTagNames.map(tag => {
                                            const isIncluded = includeTags.includes(tag);
                                            const isExcluded = excludeTags.includes(tag);
                                            return (
                                                <Chip
                                                    key={`pick-tag-inc-${tag}`}
                                                    label={isIncluded ? `✓ ${tag}` : `+ ${tag}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleIncludeTag(tag)}
                                                    color={isIncluded ? "success" : "default"}
                                                    variant={isIncluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isIncluded ? 700 : 500,
                                                        opacity: isExcluded ? 0.4 : 1
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Column 2: Exclude Course/Diet Tags */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: excludeTags.length > 0 ? '#f43f5e' : '#e2e8f0',
                                        borderWidth: excludeTags.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <BlockIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#9f1239">
                                            Exclude Tags (Avoid)
                                        </Typography>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableTagNames}
                                        value={excludeTags}
                                        onChange={(e, val) => {
                                            setExcludeTags(val);
                                            setIncludeTags(prev => prev.filter(t => !val.includes(t)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={excludeTags.length === 0 ? "Search tags to exclude..." : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    label={`− ${option}`}
                                                    size="small"
                                                    color="error"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick (Click to Exclude):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableTagNames.map(tag => {
                                            const isIncluded = includeTags.includes(tag);
                                            const isExcluded = excludeTags.includes(tag);
                                            return (
                                                <Chip
                                                    key={`pick-tag-exc-${tag}`}
                                                    label={isExcluded ? `✕ ${tag}` : `− ${tag}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleExcludeTag(tag)}
                                                    color={isExcluded ? "error" : "default"}
                                                    variant={isExcluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isExcluded ? 700 : 500,
                                                        opacity: isIncluded ? 0.4 : 1
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* TAB 2: RECIPE SOURCE (Instagram vs Life vs Cookbook vs Website vs Restaurant) */}
                {currentTab === 2 && (
                    <Box>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                Filter by recipe origin: search specifically for <strong>Instagram reels</strong>, <strong>Life recipes</strong>, <strong>Cookbooks</strong>, or <strong>Websites</strong>.
                            </Typography>
                        </Box>

                        {/* Section A: Origin Category (Instagram, Life, Cookbook, Website, Restaurant) */}
                        <Grid container spacing={2} mb={3}>
                            {/* Column 1: Include Source Type */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: includeSourceCategories.length > 0 ? '#10b981' : '#e2e8f0',
                                        borderWidth: includeSourceCategories.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={750} color="#065f46">
                                                Include Source Type (Must Be From)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Select one or more origins (e.g. Instagram or Life)
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableSourceCategoryNames}
                                        value={includeSourceCategories}
                                        onChange={(e, val) => {
                                            if (setIncludeSourceCategories) setIncludeSourceCategories(val);
                                            if (setExcludeSourceCategories) setExcludeSourceCategories(prev => prev.filter(c => !val.includes(c)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={includeSourceCategories.length === 0 ? "Select sources to include (Instagram, Life...)" : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    icon={renderCategoryIcon(option)}
                                                    label={`+ ${option}`}
                                                    size="small"
                                                    color="success"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick Origin (Click to Include):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableSourceCategoryNames.map(cat => {
                                            const isIncluded = includeSourceCategories.includes(cat);
                                            const isExcluded = excludeSourceCategories.includes(cat);
                                            const count = sourceCategoryCounts[cat] || 0;
                                            return (
                                                <Chip
                                                    key={`pick-sc-inc-${cat}`}
                                                    icon={renderCategoryIcon(cat)}
                                                    label={
                                                        <span>
                                                            <strong>{cat}</strong>{' '}
                                                            <span style={{ opacity: 0.75, fontSize: '0.74rem' }}>({count})</span>
                                                        </span>
                                                    }
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleIncludeSourceCategory(cat)}
                                                    color={isIncluded ? "success" : "default"}
                                                    variant={isIncluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isIncluded ? 700 : 500,
                                                        opacity: isExcluded ? 0.4 : 1,
                                                        cursor: isExcluded ? 'not-allowed' : 'pointer',
                                                        py: 1.8,
                                                        borderRadius: 2.5
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Column 2: Exclude Source Type */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: excludeSourceCategories.length > 0 ? '#f43f5e' : '#e2e8f0',
                                        borderWidth: excludeSourceCategories.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <BlockIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                                        <Box>
                                            <Typography variant="subtitle2" fontWeight={750} color="#9f1239">
                                                Exclude Source Type (Avoid / Skip)
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                                Hide recipes from unwanted source origins
                                            </Typography>
                                        </Box>
                                    </Box>

                                    <Autocomplete
                                        multiple
                                        size="small"
                                        options={availableSourceCategoryNames}
                                        value={excludeSourceCategories}
                                        onChange={(e, val) => {
                                            if (setExcludeSourceCategories) setExcludeSourceCategories(val);
                                            if (setIncludeSourceCategories) setIncludeSourceCategories(prev => prev.filter(c => !val.includes(c)));
                                        }}
                                        renderInput={(params) => (
                                            <TextField
                                                {...params}
                                                placeholder={excludeSourceCategories.length === 0 ? "Select sources to exclude..." : ""}
                                                size="small"
                                            />
                                        )}
                                        renderTags={(value, getTagProps) =>
                                            value.map((option, index) => (
                                                <Chip
                                                    {...getTagProps({ index })}
                                                    key={option}
                                                    icon={renderCategoryIcon(option)}
                                                    label={`− ${option}`}
                                                    size="small"
                                                    color="error"
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))
                                        }
                                        sx={{ mb: 2 }}
                                    />

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Quick Pick Origin (Click to Exclude):
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {availableSourceCategoryNames.map(cat => {
                                            const isIncluded = includeSourceCategories.includes(cat);
                                            const isExcluded = excludeSourceCategories.includes(cat);
                                            const count = sourceCategoryCounts[cat] || 0;
                                            return (
                                                <Chip
                                                    key={`pick-sc-exc-${cat}`}
                                                    icon={renderCategoryIcon(cat)}
                                                    label={
                                                        <span>
                                                            <strong>{cat}</strong>{' '}
                                                            <span style={{ opacity: 0.75, fontSize: '0.74rem' }}>({count})</span>
                                                        </span>
                                                    }
                                                    size="small"
                                                    clickable
                                                    onClick={() => toggleExcludeSourceCategory(cat)}
                                                    color={isExcluded ? "error" : "default"}
                                                    variant={isExcluded ? "filled" : "outlined"}
                                                    sx={{
                                                        fontWeight: isExcluded ? 700 : 500,
                                                        opacity: isIncluded ? 0.4 : 1,
                                                        cursor: isIncluded ? 'not-allowed' : 'pointer',
                                                        py: 1.8,
                                                        borderRadius: 2.5
                                                    }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>

                        {/* Section B: Specific Publication / Author / Cookbook Name */}
                        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                            <Box display="flex" alignItems="center" gap={1} mb={1}>
                                <MenuBookIcon sx={{ color: '#6366f1', fontSize: 20 }} />
                                <Typography variant="subtitle2" fontWeight={750} color="#1e1b4b">
                                    Specific Cookbook, Author, or Creator
                                </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary" mb={2} sx={{ display: 'block' }}>
                                Target or avoid specific book titles (e.g. <em>Dinner Done</em>) or creator handles.
                            </Typography>

                            <Grid container spacing={2}>
                                {/* Include Specific Source */}
                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" gap={1} mb={1.5}>
                                        <Autocomplete
                                            freeSolo
                                            size="small"
                                            fullWidth
                                            options={availableSpecificSources}
                                            value={sourceIncludeInput}
                                            onInputChange={(e, newVal) => setSourceIncludeInput(newVal)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Include author / book name..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddIncludeSpecificSource();
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleAddIncludeSpecificSource()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {includeSources.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeSources.map(src => (
                                                <Chip
                                                    key={`inc-src-${src}`}
                                                    label={`+ "${src}"`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeSources && setIncludeSources(prev => prev.filter(s => s !== src))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Grid>

                                {/* Exclude Specific Source */}
                                <Grid item xs={12} sm={6}>
                                    <Box display="flex" gap={1} mb={1.5}>
                                        <Autocomplete
                                            freeSolo
                                            size="small"
                                            fullWidth
                                            options={availableSpecificSources}
                                            value={sourceExcludeInput}
                                            onInputChange={(e, newVal) => setSourceExcludeInput(newVal)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Exclude author / book name..."
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddExcludeSpecificSource();
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleAddExcludeSpecificSource()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {excludeSources.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {excludeSources.map(src => (
                                                <Chip
                                                    key={`exc-src-${src}`}
                                                    label={`− "${src}"`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeSources && setExcludeSources(prev => prev.filter(s => s !== src))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}
                                </Grid>
                            </Grid>
                        </Paper>
                    </Box>
                )}

                {/* TAB 3: INGREDIENTS */}
                {currentTab === 3 && (
                    <Box>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                Filter recipes by pantry ingredients you have or allergens/dislikes you want to avoid.
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* Column 1: Include Ingredients */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: includeIngredients.length > 0 ? '#10b981' : '#e2e8f0',
                                        borderWidth: includeIngredients.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#065f46">
                                            Must Contain Ingredient
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} mb={1.5}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Type ingredient (e.g. chicken) & Enter"
                                            value={ingIncludeInput}
                                            onChange={(e) => setIngIncludeInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddIncludeIngredient();
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleAddIncludeIngredient()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {includeIngredients.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
                                            {includeIngredients.map(ing => (
                                                <Chip
                                                    key={`inc-ing-${ing}`}
                                                    label={`+ ${ing}`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeIngredients(prev => prev.filter(i => i !== ing))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Popular Ingredients:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {commonIncludeIngredients.map(ing => {
                                            const isIncluded = includeIngredients.some(i => i.toLowerCase() === ing.toLowerCase());
                                            return (
                                                <Chip
                                                    key={`pop-inc-${ing}`}
                                                    label={`+ ${ing}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => handleAddIncludeIngredient(ing)}
                                                    color={isIncluded ? "success" : "default"}
                                                    variant={isIncluded ? "filled" : "outlined"}
                                                    sx={{ fontWeight: isIncluded ? 700 : 500 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Column 2: Exclude Ingredients */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: excludeIngredients.length > 0 ? '#f43f5e' : '#e2e8f0',
                                        borderWidth: excludeIngredients.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <BlockIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#9f1239">
                                            Avoid Ingredient / Allergen
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} mb={1.5}>
                                        <TextField
                                            size="small"
                                            fullWidth
                                            placeholder="Type allergen (e.g. cilantro, nuts) & Enter"
                                            value={ingExcludeInput}
                                            onChange={(e) => setIngExcludeInput(e.target.value)}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter') {
                                                    e.preventDefault();
                                                    handleAddExcludeIngredient();
                                                }
                                            }}
                                        />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleAddExcludeIngredient()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {excludeIngredients.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
                                            {excludeIngredients.map(ing => (
                                                <Chip
                                                    key={`exc-ing-${ing}`}
                                                    label={`− ${ing}`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeIngredients(prev => prev.filter(i => i !== ing))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Common Allergens & Dislikes:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {commonExcludeIngredients.map(ing => {
                                            const isExcluded = excludeIngredients.some(i => i.toLowerCase() === ing.toLowerCase());
                                            return (
                                                <Chip
                                                    key={`pop-exc-${ing}`}
                                                    label={`− ${ing}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => handleAddExcludeIngredient(ing)}
                                                    color={isExcluded ? "error" : "default"}
                                                    variant={isExcluded ? "filled" : "outlined"}
                                                    sx={{ fontWeight: isExcluded ? 700 : 500 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* TAB 4: RECIPE NAME / TITLE */}
                {currentTab === 4 && (
                    <Box>
                        <Box mb={2}>
                            <Typography variant="body2" color="text.secondary">
                                Filter by words in the recipe title (e.g. require <strong>salmon</strong> or exclude <strong>spicy</strong>).
                            </Typography>
                        </Box>

                        <Grid container spacing={2}>
                            {/* Column 1: Include in Recipe Name */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: includeRecipeNames.length > 0 ? '#10b981' : '#e2e8f0',
                                        borderWidth: includeRecipeNames.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <CheckCircleOutlineIcon sx={{ color: '#059669', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#065f46">
                                            Recipe Name Must Contain
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} mb={1.5}>
                                        <Autocomplete
                                            freeSolo
                                            size="small"
                                            fullWidth
                                            options={availableRecipeTitles}
                                            value={nameIncludeInput}
                                            onInputChange={(e, newVal) => setNameIncludeInput(newVal)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Type name keyword (e.g. salmon) & Enter"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddIncludeName();
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="success"
                                            size="small"
                                            onClick={() => handleAddIncludeName()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {includeRecipeNames.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
                                            {includeRecipeNames.map(term => (
                                                <Chip
                                                    key={`inc-name-${term}`}
                                                    label={`+ "${term}"`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeRecipeNames(prev => prev.filter(n => n !== term))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Popular Title Keywords:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {commonIncludeNames.map(term => {
                                            const isIncluded = includeRecipeNames.some(n => n.toLowerCase() === term.toLowerCase());
                                            return (
                                                <Chip
                                                    key={`pop-name-inc-${term}`}
                                                    label={`+ ${term}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => handleAddIncludeName(term)}
                                                    color={isIncluded ? "success" : "default"}
                                                    variant={isIncluded ? "filled" : "outlined"}
                                                    sx={{ fontWeight: isIncluded ? 700 : 500 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>

                            {/* Column 2: Exclude from Recipe Name */}
                            <Grid item xs={12} md={6}>
                                <Paper
                                    variant="outlined"
                                    sx={{
                                        p: 2,
                                        borderRadius: 2.5,
                                        bgcolor: '#ffffff',
                                        borderColor: excludeRecipeNames.length > 0 ? '#f43f5e' : '#e2e8f0',
                                        borderWidth: excludeRecipeNames.length > 0 ? 1.5 : 1,
                                        display: 'flex',
                                        flexDirection: 'column',
                                        height: '100%'
                                    }}
                                >
                                    <Box display="flex" alignItems="center" gap={1} mb={1.5}>
                                        <BlockIcon sx={{ color: '#e11d48', fontSize: 20 }} />
                                        <Typography variant="subtitle2" fontWeight={750} color="#9f1239">
                                            Recipe Name Must NOT Contain
                                        </Typography>
                                    </Box>

                                    <Box display="flex" gap={1} mb={1.5}>
                                        <Autocomplete
                                            freeSolo
                                            size="small"
                                            fullWidth
                                            options={availableRecipeTitles}
                                            value={nameExcludeInput}
                                            onInputChange={(e, newVal) => setNameExcludeInput(newVal)}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    placeholder="Type word to exclude & Enter"
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') {
                                                            e.preventDefault();
                                                            handleAddExcludeName();
                                                        }
                                                    }}
                                                />
                                            )}
                                        />
                                        <Button
                                            variant="contained"
                                            color="error"
                                            size="small"
                                            onClick={() => handleAddExcludeName()}
                                            sx={{ textTransform: 'none', fontWeight: 700, px: 2 }}
                                        >
                                            Add
                                        </Button>
                                    </Box>

                                    {excludeRecipeNames.length > 0 && (
                                        <Box display="flex" flexWrap="wrap" gap={0.8} mb={2}>
                                            {excludeRecipeNames.map(term => (
                                                <Chip
                                                    key={`exc-name-${term}`}
                                                    label={`− "${term}"`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeRecipeNames(prev => prev.filter(n => n !== term))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    )}

                                    <Typography variant="caption" fontWeight={700} color="#64748b" mb={1} sx={{ display: 'block' }}>
                                        Common Exclusions:
                                    </Typography>
                                    <Box display="flex" flexWrap="wrap" gap={0.8}>
                                        {commonExcludeNames.map(term => {
                                            const isExcluded = excludeRecipeNames.some(n => n.toLowerCase() === term.toLowerCase());
                                            return (
                                                <Chip
                                                    key={`pop-name-exc-${term}`}
                                                    label={`− ${term}`}
                                                    size="small"
                                                    clickable
                                                    onClick={() => handleAddExcludeName(term)}
                                                    color={isExcluded ? "error" : "default"}
                                                    variant={isExcluded ? "filled" : "outlined"}
                                                    sx={{ fontWeight: isExcluded ? 700 : 500 }}
                                                />
                                            );
                                        })}
                                    </Box>
                                </Paper>
                            </Grid>
                        </Grid>
                    </Box>
                )}

                {/* TAB 5: ALL ACTIVE FILTERS OVERVIEW */}
                {currentTab === 5 && (
                    <Box>
                        {totalFilterCount === 0 ? (
                            <Box textAlign="center" py={5} color="#94a3b8">
                                <FilterAltIcon sx={{ fontSize: 48, opacity: 0.4, mb: 1 }} />
                                <Typography variant="h6" fontWeight={700} color="#64748b">
                                    No Active Filters
                                </Typography>
                                <Typography variant="body2" color="#94a3b8" mt={0.5}>
                                    Use the tabs above to select tags, sources (Instagram vs Life), ingredients, or recipe names to include and exclude.
                                </Typography>
                            </Box>
                        ) : (
                            <Box display="flex" flexDirection="column" gap={2}>
                                {totalSourceCount > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1}>
                                            Source & Origin Filters ({totalSourceCount})
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeSourceCategories.map(cat => (
                                                <Chip
                                                    key={`sum-inc-sc-${cat}`}
                                                    icon={renderCategoryIcon(cat)}
                                                    label={`+ Source: ${cat}`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => toggleIncludeSourceCategory(cat)}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeSourceCategories.map(cat => (
                                                <Chip
                                                    key={`sum-exc-sc-${cat}`}
                                                    icon={renderCategoryIcon(cat)}
                                                    label={`− Source: ${cat}`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => toggleExcludeSourceCategory(cat)}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {includeSources.map(src => (
                                                <Chip
                                                    key={`sum-inc-src-${src}`}
                                                    label={`+ Book/Author: "${src}"`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeSources && setIncludeSources(prev => prev.filter(s => s !== src))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeSources.map(src => (
                                                <Chip
                                                    key={`sum-exc-src-${src}`}
                                                    label={`− Book/Author: "${src}"`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeSources && setExcludeSources(prev => prev.filter(s => s !== src))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}

                                {userTagCount > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1}>
                                            User Tags ({userTagCount})
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeUserTags.map(tag => (
                                                <Chip
                                                    key={`sum-inc-ut-${tag}`}
                                                    label={`+ ${tag}`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeUserTags(prev => prev.filter(t => t !== tag))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeUserTags.map(tag => (
                                                <Chip
                                                    key={`sum-exc-ut-${tag}`}
                                                    label={`− ${tag}`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeUserTags(prev => prev.filter(t => t !== tag))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}

                                {tagCount > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1}>
                                            Course & Diet Tags ({tagCount})
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeTags.map(tag => (
                                                <Chip
                                                    key={`sum-inc-tag-${tag}`}
                                                    label={`+ ${tag}`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeTags(prev => prev.filter(t => t !== tag))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeTags.map(tag => (
                                                <Chip
                                                    key={`sum-exc-tag-${tag}`}
                                                    label={`− ${tag}`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeTags(prev => prev.filter(t => t !== tag))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}

                                {ingCount > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1}>
                                            Ingredients ({ingCount})
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeIngredients.map(ing => (
                                                <Chip
                                                    key={`sum-inc-ing-${ing}`}
                                                    label={`+ ${ing}`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeIngredients(prev => prev.filter(i => i !== ing))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeIngredients.map(ing => (
                                                <Chip
                                                    key={`sum-exc-ing-${ing}`}
                                                    label={`− ${ing}`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeIngredients(prev => prev.filter(i => i !== ing))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}

                                {nameCount > 0 && (
                                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2.5, bgcolor: '#ffffff' }}>
                                        <Typography variant="subtitle2" fontWeight={800} color="#0f172a" mb={1}>
                                            Recipe Name Keywords ({nameCount})
                                        </Typography>
                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {includeRecipeNames.map(term => (
                                                <Chip
                                                    key={`sum-inc-name-${term}`}
                                                    label={`+ "${term}"`}
                                                    size="small"
                                                    color="success"
                                                    onDelete={() => setIncludeRecipeNames(prev => prev.filter(n => n !== term))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                            {excludeRecipeNames.map(term => (
                                                <Chip
                                                    key={`sum-exc-name-${term}`}
                                                    label={`− "${term}"`}
                                                    size="small"
                                                    color="error"
                                                    onDelete={() => setExcludeRecipeNames(prev => prev.filter(n => n !== term))}
                                                    sx={{ fontWeight: 600 }}
                                                />
                                            ))}
                                        </Box>
                                    </Paper>
                                )}
                            </Box>
                        )}
                    </Box>
                )}
            </DialogContent>

            {/* Persistent Active Filter Chips Strip (Shows across all tabs) */}
            {totalFilterCount > 0 && currentTab !== 5 && (
                <Box
                    sx={{
                        px: 2.5,
                        py: 1,
                        bgcolor: '#f1f5f9',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        overflowX: 'auto',
                        whiteSpace: 'nowrap'
                    }}
                >
                    <Typography variant="caption" fontWeight={800} color="#64748b" sx={{ textTransform: 'uppercase', letterSpacing: '0.5px', flexShrink: 0 }}>
                        Active ({totalFilterCount}):
                    </Typography>
                    <Box display="flex" alignItems="center" gap={0.6} sx={{ flex: 1, overflowX: 'auto' }}>
                        {includeSourceCategories.map(cat => (
                            <Chip
                                key={`strip-inc-sc-${cat}`}
                                icon={renderCategoryIcon(cat)}
                                label={`+ Source: ${cat}`}
                                size="small"
                                color="success"
                                onDelete={() => toggleIncludeSourceCategory(cat)}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeSourceCategories.map(cat => (
                            <Chip
                                key={`strip-exc-sc-${cat}`}
                                icon={renderCategoryIcon(cat)}
                                label={`− Source: ${cat}`}
                                size="small"
                                color="error"
                                onDelete={() => toggleExcludeSourceCategory(cat)}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {includeSources.map(src => (
                            <Chip
                                key={`strip-inc-src-${src}`}
                                label={`+ From: "${src}"`}
                                size="small"
                                color="success"
                                onDelete={() => setIncludeSources && setIncludeSources(prev => prev.filter(s => s !== src))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeSources.map(src => (
                            <Chip
                                key={`strip-exc-src-${src}`}
                                label={`− From: "${src}"`}
                                size="small"
                                color="error"
                                onDelete={() => setExcludeSources && setExcludeSources(prev => prev.filter(s => s !== src))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {includeUserTags.map(tag => (
                            <Chip
                                key={`strip-inc-ut-${tag}`}
                                label={`+ User: ${tag}`}
                                size="small"
                                color="success"
                                onDelete={() => setIncludeUserTags(prev => prev.filter(t => t !== tag))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeUserTags.map(tag => (
                            <Chip
                                key={`strip-exc-ut-${tag}`}
                                label={`− User: ${tag}`}
                                size="small"
                                color="error"
                                onDelete={() => setExcludeUserTags(prev => prev.filter(t => t !== tag))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {includeTags.map(tag => (
                            <Chip
                                key={`strip-inc-tag-${tag}`}
                                label={`+ Tag: ${tag}`}
                                size="small"
                                color="success"
                                onDelete={() => setIncludeTags(prev => prev.filter(t => t !== tag))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeTags.map(tag => (
                            <Chip
                                key={`strip-exc-tag-${tag}`}
                                label={`− Tag: ${tag}`}
                                size="small"
                                color="error"
                                onDelete={() => setExcludeTags(prev => prev.filter(t => t !== tag))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {includeIngredients.map(ing => (
                            <Chip
                                key={`strip-inc-ing-${ing}`}
                                label={`+ Ing: ${ing}`}
                                size="small"
                                color="success"
                                onDelete={() => setIncludeIngredients(prev => prev.filter(i => i !== ing))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeIngredients.map(ing => (
                            <Chip
                                key={`strip-exc-ing-${ing}`}
                                label={`− Ing: ${ing}`}
                                size="small"
                                color="error"
                                onDelete={() => setExcludeIngredients(prev => prev.filter(i => i !== ing))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {includeRecipeNames.map(term => (
                            <Chip
                                key={`strip-inc-name-${term}`}
                                label={`+ Name: "${term}"`}
                                size="small"
                                color="success"
                                onDelete={() => setIncludeRecipeNames(prev => prev.filter(n => n !== term))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                        {excludeRecipeNames.map(term => (
                            <Chip
                                key={`strip-exc-name-${term}`}
                                label={`− Name: "${term}"`}
                                size="small"
                                color="error"
                                onDelete={() => setExcludeRecipeNames(prev => prev.filter(n => n !== term))}
                                sx={{ height: 22, fontSize: '0.75rem', fontWeight: 600 }}
                            />
                        ))}
                    </Box>
                    <Button
                        size="small"
                        color="error"
                        onClick={handleClearAll}
                        sx={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'none', py: 0, px: 1, minWidth: 'auto', flexShrink: 0 }}
                    >
                        Clear
                    </Button>
                </Box>
            )}

            {/* Footer */}
            <DialogActions
                sx={{
                    p: 2,
                    px: { xs: 2, sm: 2.5 },
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid #e2e8f0',
                    bgcolor: '#ffffff'
                }}
            >
                <Button
                    color="inherit"
                    size="small"
                    startIcon={<RestartAltIcon fontSize="small" />}
                    onClick={handleClearAll}
                    disabled={totalFilterCount === 0}
                    sx={{ textTransform: 'none', color: '#64748b', fontWeight: 700 }}
                >
                    Reset All
                </Button>

                <Box display="flex" alignItems="center" gap={1.5}>
                    <Box display="flex" alignItems="center" gap={0.8} sx={{ color: '#334155', fontSize: '0.88rem', fontWeight: 600 }}>
                        <span style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
                        <span>Matching <strong>{matchingCount}</strong> of <strong>{recipes.length}</strong></span>
                    </Box>

                    <Button
                        variant="contained"
                        onClick={onClose}
                        sx={{
                            borderRadius: '9999px',
                            textTransform: 'none',
                            fontWeight: 700,
                            px: 3,
                            py: 0.9,
                            bgcolor: '#059669',
                            boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
                            '&:hover': {
                                bgcolor: '#047857'
                            }
                        }}
                    >
                        View {matchingCount} Recipes
                    </Button>
                </Box>
            </DialogActions>
        </Dialog>
    );
}

export default Filter;