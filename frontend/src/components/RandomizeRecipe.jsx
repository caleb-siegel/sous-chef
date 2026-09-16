import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Container,
    Paper,
    Button,
    Box,
    Typography,
    Chip,
    Stack,
    TextField,
    Autocomplete,
    ToggleButton,
    ToggleButtonGroup,
    CircularProgress,
    Alert,
    IconButton,
    Tooltip,
    Divider,
    Card,
    CardContent,
    Menu,
    MenuItem,
    ListItemIcon,
    ListItemText
} from '@mui/material';
import CasinoIcon from '@mui/icons-material/Casino';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import BlockIcon from '@mui/icons-material/Block';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import CategoryIcon from '@mui/icons-material/Category';
import PersonPinIcon from '@mui/icons-material/PersonPin';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import ShuffleIcon from '@mui/icons-material/Shuffle';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import { useOutletContext } from "react-router-dom";
import RecipePage from './RecipePage';

const STANDARD_CATEGORIES = [
    { name: "breakfast", label: "Breakfast", icon: "🍳" },
    { name: "chicken", label: "Chicken", icon: "🍗" },
    { name: "meat", label: "Meat", icon: "🥩" },
    { name: "fish", label: "Fish", icon: "🐟" },
    { name: "dairy", label: "Dairy", icon: "🧀" },
    { name: "salad", label: "Salad", icon: "🥗" },
    { name: "soup", label: "Soup", icon: "🍲" },
    { name: "side", label: "Side Dish", icon: "🥔" },
    { name: "condiment", label: "Condiment / Sauce", icon: "🧂" },
    { name: "dessert", label: "Dessert", icon: "🍰" },
    { name: "drinks", label: "Drinks", icon: "🍹" },
    { name: "other", label: "Other", icon: "✨" }
];

const FILTER_DEFINITIONS = [
    { key: 'category', label: 'Category', icon: <CategoryIcon color="primary" fontSize="small" />, description: 'Filter by Breakfast, Chicken, Fish, Dessert, etc.' },
    { key: 'includeIngredient', label: 'Must Contain Ingredient', icon: <AddCircleOutlineIcon sx={{ color: '#10b981' }} fontSize="small" />, description: 'Require specific ingredients (e.g. garlic, lemon)' },
    { key: 'excludeIngredient', label: 'Must NOT Contain Ingredient', icon: <RemoveCircleOutlineIcon sx={{ color: '#ef4444' }} fontSize="small" />, description: 'Exclude unwanted ingredients (e.g. nuts, mushrooms)' },
    { key: 'cookbook', label: 'Cookbook / Source', icon: <MenuBookIcon color="primary" fontSize="small" />, description: 'Filter by specific cookbooks or recipe sources' },
    { key: 'sourceCategory', label: 'Source Type', icon: <CategoryIcon color="secondary" fontSize="small" />, description: 'Filter by Website, Cookbook, Instagram, Life' },
    { key: 'tag', label: 'System Tags', icon: <LocalOfferIcon color="primary" fontSize="small" />, description: 'Filter by vegan, passover, dinner, etc.' },
    { key: 'userTag', label: 'User Tags', icon: <PersonPinIcon color="secondary" fontSize="small" />, description: 'Filter by eaten, interest, not a reorder' },
    { key: 'scope', label: 'Recipe Scope', icon: <PersonPinIcon color="primary" fontSize="small" />, description: 'Choose between All Recipes and My Saved Recipes' },
];

function RandomizeRecipe() {
    const { user, backendUrl } = useOutletContext();

    // Active filter modules list
    const [activeFilters, setActiveFilters] = useState([]);

    // Filter values state
    const [scope, setScope] = useState('all'); // 'all' | 'user'
    const [categories, setCategories] = useState([]);
    const [categoryMode, setCategoryMode] = useState('include'); // 'include' | 'exclude'
    const [cookbooks, setCookbooks] = useState([]);
    const [cookbookMode, setCookbookMode] = useState('include');
    const [sourceCategories, setSourceCategories] = useState([]);
    const [sourceCategoryMode, setSourceCategoryMode] = useState('include');
    const [tags, setTags] = useState([]);
    const [tagMode, setTagMode] = useState('include');
    const [userTags, setUserTags] = useState([]);
    const [userTagMode, setUserTagMode] = useState('include');
    const [includeIngredients, setIncludeIngredients] = useState([]);
    const [excludeIngredients, setExcludeIngredients] = useState([]);

    // Ingredient input text
    const [includeInput, setIncludeInput] = useState('');
    const [excludeInput, setExcludeInput] = useState('');

    // Add Filter Menu anchor
    const [menuAnchorEl, setMenuAnchorEl] = useState(null);

    // Options from backend
    const [availableCookbooks, setAvailableCookbooks] = useState([]);
    const [availableSourceCategories, setAvailableSourceCategories] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [availableUserTags, setAvailableUserTags] = useState([]);

    // Results & loading states
    const [matchCount, setMatchCount] = useState(null);
    const [isCountLoading, setIsCountLoading] = useState(false);
    const [isLoadingRecipe, setIsLoadingRecipe] = useState(false);
    const [randomRecipe, setRandomRecipe] = useState(null);
    const [errorMessage, setErrorMessage] = useState(null);

    const recipeResultRef = useRef(null);

    // Fetch filter options on mount
    useEffect(() => {
        fetch(`${backendUrl}/api/cookbooks`)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setAvailableCookbooks(data.filter(Boolean)))
            .catch(err => console.error("Error fetching cookbooks:", err));

        fetch(`${backendUrl}/api/category_names`)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setAvailableSourceCategories(data))
            .catch(err => console.error("Error fetching source categories:", err));

        fetch(`${backendUrl}/api/tag_names`)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setAvailableTags(data))
            .catch(err => console.error("Error fetching tags:", err));

        fetch(`${backendUrl}/api/user_tag_names`)
            .then(res => res.json())
            .then(data => Array.isArray(data) && setAvailableUserTags(data))
            .catch(err => console.error("Error fetching user tags:", err));
    }, [backendUrl]);

    // Build filter payload based on only active filter modules
    const buildFilterPayload = useCallback((isCountOnly = false) => {
        const hasScope = activeFilters.includes('scope');
        const hasCategories = activeFilters.includes('category') && categories.length > 0;
        const hasCookbooks = activeFilters.includes('cookbook') && cookbooks.length > 0;
        const hasSourceCategories = activeFilters.includes('sourceCategory') && sourceCategories.length > 0;
        const hasTags = activeFilters.includes('tag') && tags.length > 0;
        const hasUserTags = activeFilters.includes('userTag') && userTags.length > 0;
        const hasIncludeIngs = activeFilters.includes('includeIngredient') && includeIngredients.length > 0;
        const hasExcludeIngs = activeFilters.includes('excludeIngredient') && excludeIngredients.length > 0;

        return {
            scope: hasScope && scope === 'user' ? 'user' : 'all',
            user_id: user?.id,
            categories: hasCategories ? categories : [],
            category_mode: categoryMode,
            cookbooks: hasCookbooks ? cookbooks : [],
            cookbook_mode: cookbookMode,
            source_categories: hasSourceCategories ? sourceCategories : [],
            source_category_mode: sourceCategoryMode,
            tags: hasTags ? tags : [],
            tag_mode: tagMode,
            user_tags: hasUserTags ? userTags : [],
            user_tag_mode: userTagMode,
            include_ingredients: hasIncludeIngs ? includeIngredients : [],
            exclude_ingredients: hasExcludeIngs ? excludeIngredients : [],
            count_only: isCountOnly
        };
    }, [
        activeFilters,
        scope,
        user,
        categories,
        categoryMode,
        cookbooks,
        cookbookMode,
        sourceCategories,
        sourceCategoryMode,
        tags,
        tagMode,
        userTags,
        userTagMode,
        includeIngredients,
        excludeIngredients
    ]);

    // Live update of match count whenever filters change
    useEffect(() => {
        setIsCountLoading(true);
        const timer = setTimeout(() => {
            const payload = buildFilterPayload(true);
            fetch(`${backendUrl}/api/random_recipe`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            })
                .then(res => res.json())
                .then(data => {
                    setMatchCount(data.total_matching ?? 0);
                    setIsCountLoading(false);
                })
                .catch(err => {
                    console.error("Error updating match count:", err);
                    setIsCountLoading(false);
                });
        }, 200);

        return () => clearTimeout(timer);
    }, [buildFilterPayload, backendUrl]);

    // Handle Randomize Button Click
    const handleRandomize = () => {
        setIsLoadingRecipe(true);
        setErrorMessage(null);

        const payload = buildFilterPayload(false);
        fetch(`${backendUrl}/api/random_recipe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json())
            .then(data => {
                setIsLoadingRecipe(false);
                if (data.recipe) {
                    setRandomRecipe(data.recipe);
                    setMatchCount(data.total_matching ?? 1);
                    setTimeout(() => {
                        recipeResultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 100);
                } else {
                    setRandomRecipe(null);
                    setErrorMessage(data.message || "No recipes found matching your filter criteria. Try loosening some filters!");
                }
            })
            .catch(err => {
                console.error("Error fetching random recipe:", err);
                setIsLoadingRecipe(false);
                setErrorMessage("An error occurred while randomizing. Please try again.");
            });
    };

    // Add a filter module
    const handleAddFilter = (filterKey) => {
        setMenuAnchorEl(null);
        if (!activeFilters.includes(filterKey)) {
            setActiveFilters(prev => [...prev, filterKey]);
        }
    };

    // Remove a filter module & reset its state
    const handleRemoveFilter = (filterKey) => {
        setActiveFilters(prev => prev.filter(k => k !== filterKey));
        switch (filterKey) {
            case 'category':
                setCategories([]);
                setCategoryMode('include');
                break;
            case 'cookbook':
                setCookbooks([]);
                setCookbookMode('include');
                break;
            case 'sourceCategory':
                setSourceCategories([]);
                setSourceCategoryMode('include');
                break;
            case 'tag':
                setTags([]);
                setTagMode('include');
                break;
            case 'userTag':
                setUserTags([]);
                setUserTagMode('include');
                break;
            case 'includeIngredient':
                setIncludeIngredients([]);
                setIncludeInput('');
                break;
            case 'excludeIngredient':
                setExcludeIngredients([]);
                setExcludeInput('');
                break;
            case 'scope':
                setScope('all');
                break;
            default:
                break;
        }
    };

    // Reset all filters
    const handleResetAll = () => {
        setActiveFilters([]);
        setScope('all');
        setCategories([]);
        setCategoryMode('include');
        setCookbooks([]);
        setCookbookMode('include');
        setSourceCategories([]);
        setSourceCategoryMode('include');
        setTags([]);
        setTagMode('include');
        setUserTags([]);
        setUserTagMode('include');
        setIncludeIngredients([]);
        setExcludeIngredients([]);
        setIncludeInput('');
        setExcludeInput('');
        setErrorMessage(null);
    };

    // Category helpers
    const toggleCategory = (catName) => {
        setCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
    };

    // Ingredient helpers
    const handleAddIncludeIngredient = () => {
        const trimmed = includeInput.trim();
        if (trimmed && !includeIngredients.includes(trimmed)) {
            setIncludeIngredients(prev => [...prev, trimmed]);
            setIncludeInput('');
        }
    };

    const handleAddExcludeIngredient = () => {
        const trimmed = excludeInput.trim();
        if (trimmed && !excludeIngredients.includes(trimmed)) {
            setExcludeIngredients(prev => [...prev, trimmed]);
            setExcludeInput('');
        }
    };

    // Filters available to add in the menu
    const availableFilterDefs = FILTER_DEFINITIONS.filter(def => !activeFilters.includes(def.key));

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Hero Header */}
            <Paper
                elevation={3}
                sx={{
                    background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                    color: '#ffffff',
                    borderRadius: 3,
                    p: { xs: 3, sm: 4 },
                    mb: 3,
                    textAlign: 'center',
                    border: '1px solid rgba(255, 255, 255, 0.1)'
                }}
            >
                <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={1}>
                    <CasinoIcon sx={{ fontSize: 38, color: '#3FFFC2' }} />
                    <Typography
                        variant="h1"
                        component="h1"
                        sx={{
                            fontSize: { xs: '1.85rem', md: '2.4rem' },
                            fontWeight: 800,
                            background: 'linear-gradient(45deg, #3FFFC2, #FF7D45)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            letterSpacing: '-0.5px'
                        }}
                    >
                        Recipe Roulette
                    </Typography>
                </Box>

                <Typography
                    variant="body1"
                    sx={{
                        color: '#94a3b8',
                        maxWidth: '560px',
                        mx: 'auto',
                        mb: 2.5,
                        fontSize: '1rem'
                    }}
                >
                    Add custom filters below to narrow down what you're craving, or leave it wide open to chance!
                </Typography>

                {/* Match Counter & Quick Stats */}
                <Box display="flex" justifyContent="center" alignItems="center" gap={1.5} mb={2.5}>
                    <Chip
                        icon={isCountLoading ? <CircularProgress size={14} color="inherit" /> : <RestaurantMenuIcon />}
                        label={
                            isCountLoading
                                ? "Counting..."
                                : matchCount === 0
                                    ? "0 matching recipes"
                                    : `${matchCount} recipe${matchCount === 1 ? '' : 's'} in pool`
                        }
                        sx={{
                            bgcolor: matchCount === 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(63, 255, 194, 0.15)',
                            color: matchCount === 0 ? '#fca5a5' : '#3FFFC2',
                            border: `1px solid ${matchCount === 0 ? '#ef4444' : '#3FFFC2'}`,
                            fontWeight: 600,
                            fontSize: '0.9rem',
                            py: 1.8
                        }}
                    />

                    {activeFilters.length > 0 && (
                        <Chip
                            label={`${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} applied`}
                            color="secondary"
                            size="small"
                            sx={{ fontWeight: 600 }}
                        />
                    )}
                </Box>

                {/* Primary Action Button */}
                <Box display="flex" justifyContent="center" gap={1.5}>
                    <Button
                        variant="contained"
                        color="secondary"
                        size="large"
                        disabled={isLoadingRecipe || matchCount === 0}
                        onClick={handleRandomize}
                        startIcon={isLoadingRecipe ? <CircularProgress size={22} color="inherit" /> : <ShuffleIcon sx={{ fontSize: 24 }} />}
                        sx={{
                            py: 1.4,
                            px: 4,
                            fontSize: '1.15rem',
                            fontWeight: 700,
                            borderRadius: 2.5,
                            textTransform: 'none',
                            boxShadow: '0 6px 20px rgba(255, 125, 69, 0.35)',
                            '&:hover': {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 10px 25px rgba(255, 125, 69, 0.45)',
                            },
                            transition: 'all 0.15s ease-in-out'
                        }}
                    >
                        {isLoadingRecipe ? "Rolling..." : randomRecipe ? "Spice It Up Again! 🎲" : "Spice It Up! 🎲"}
                    </Button>
                </Box>
            </Paper>

            {/* Error Message if 0 match */}
            {errorMessage && (
                <Alert
                    severity="warning"
                    action={
                        <Button color="inherit" size="small" onClick={handleResetAll}>
                            Clear Filters
                        </Button>
                    }
                    sx={{ mb: 3, borderRadius: 2 }}
                >
                    {errorMessage}
                </Alert>
            )}

            {/* Filter Section Header & Add Filter Button */}
            <Box
                display="flex"
                flexWrap="wrap"
                justifyContent="space-between"
                alignItems="center"
                gap={1.5}
                mb={2}
            >
                <Box display="flex" alignItems="center" gap={1}>
                    <FilterAltIcon color="primary" fontSize="small" />
                    <Typography variant="h6" fontWeight={700} color="#1e293b">
                        Filters
                    </Typography>
                </Box>

                <Box display="flex" alignItems="center" gap={1}>
                    {/* Add Filter Dropdown Button */}
                    <Button
                        variant="contained"
                        color="primary"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={(e) => setMenuAnchorEl(e.currentTarget)}
                        disabled={availableFilterDefs.length === 0}
                        sx={{
                            fontWeight: 700,
                            borderRadius: 2,
                            textTransform: 'none',
                            px: 2,
                            py: 0.7
                        }}
                    >
                        Add Filter
                    </Button>

                    {/* Reset All Button */}
                    {activeFilters.length > 0 && (
                        <Button
                            variant="outlined"
                            size="small"
                            color="inherit"
                            startIcon={<RestartAltIcon />}
                            onClick={handleResetAll}
                            sx={{
                                color: '#64748b',
                                borderColor: '#cbd5e1',
                                borderRadius: 2,
                                textTransform: 'none',
                                '&:hover': {
                                    borderColor: '#94a3b8',
                                    bgcolor: 'rgba(0, 0, 0, 0.03)'
                                }
                            }}
                        >
                            Clear All
                        </Button>
                    )}

                    {/* Menu for Add Filter */}
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={() => setMenuAnchorEl(null)}
                        PaperProps={{
                            elevation: 4,
                            sx: { borderRadius: 2, minWidth: 260, mt: 0.5 }
                        }}
                    >
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 700 }}>
                            CHOOSE A FILTER TO ADD
                        </Typography>
                        <Divider sx={{ my: 0.5 }} />
                        {availableFilterDefs.map((def) => (
                            <MenuItem
                                key={def.key}
                                onClick={() => handleAddFilter(def.key)}
                                sx={{ py: 1, px: 2 }}
                            >
                                <ListItemIcon sx={{ minWidth: 32 }}>
                                    {def.icon}
                                </ListItemIcon>
                                <ListItemText
                                    primary={def.label}
                                    secondary={def.description}
                                    primaryTypographyProps={{ fontWeight: 600, fontSize: '0.9rem' }}
                                    secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                />
                            </MenuItem>
                        ))}
                    </Menu>
                </Box>
            </Box>

            {/* Quick Add Suggestions if no filters or few filters active */}
            {activeFilters.length === 0 && (
                <Paper
                    variant="outlined"
                    sx={{
                        p: 3,
                        mb: 3,
                        textAlign: 'center',
                        borderRadius: 2.5,
                        bgcolor: '#f8fafc',
                        borderStyle: 'dashed',
                        borderColor: '#cbd5e1'
                    }}
                >
                    <Typography variant="subtitle1" fontWeight={600} color="#475569" mb={1}>
                        No filters applied yet
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mb={2}>
                        Randomizing from all {matchCount !== null ? matchCount : ''} recipes. Click below to add a filter:
                    </Typography>
                    <Box display="flex" flexWrap="wrap" justifyContent="center" gap={1}>
                        {FILTER_DEFINITIONS.slice(0, 4).map(def => (
                            <Chip
                                key={def.key}
                                icon={<AddIcon fontSize="small" />}
                                label={def.label}
                                onClick={() => handleAddFilter(def.key)}
                                variant="outlined"
                                color="primary"
                                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: 2 }}
                            />
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Active Filters List (Modular Cards) */}
            <Stack spacing={2} mb={3}>
                {/* 1. Category Filter Card */}
                {activeFilters.includes('category') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CategoryIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        Category
                                    </Typography>
                                    {categories.length > 0 && (
                                        <Chip size="small" label={`${categories.length} selected`} color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                    )}
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ToggleButtonGroup
                                        value={categoryMode}
                                        exclusive
                                        onChange={(e, val) => val && setCategoryMode(val)}
                                        size="small"
                                    >
                                        <ToggleButton value="include" color="success" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            <CheckCircleIcon sx={{ fontSize: 14, mr: 0.4 }} /> Include
                                        </ToggleButton>
                                        <ToggleButton value="exclude" color="error" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            <BlockIcon sx={{ fontSize: 14, mr: 0.4 }} /> Exclude
                                        </ToggleButton>
                                    </ToggleButtonGroup>

                                    <Tooltip title="Remove Filter">
                                        <IconButton size="small" onClick={() => handleRemoveFilter('category')} color="default">
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Typography variant="caption" color="text.secondary" display="block" mb={1.2}>
                                {categoryMode === 'include' ? "Must match ANY of the selected categories:" : "Must NOT match ANY of the selected categories:"}
                            </Typography>

                            <Box display="flex" flexWrap="wrap" gap={0.8}>
                                {STANDARD_CATEGORIES.map(cat => {
                                    const isSelected = categories.includes(cat.name);
                                    return (
                                        <Chip
                                            key={cat.name}
                                            label={`${cat.icon} ${cat.label}`}
                                            onClick={() => toggleCategory(cat.name)}
                                            color={isSelected ? (categoryMode === 'include' ? 'primary' : 'error') : 'default'}
                                            variant={isSelected ? 'filled' : 'outlined'}
                                            size="small"
                                            sx={{
                                                fontWeight: isSelected ? 700 : 500,
                                                borderRadius: 1.5,
                                                cursor: 'pointer',
                                                py: 1.6
                                            }}
                                        />
                                    );
                                })}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* 2. Must Contain Ingredients Card */}
                {activeFilters.includes('includeIngredient') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <AddCircleOutlineIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                        Must Contain Ingredient
                                    </Typography>
                                </Box>
                                <Tooltip title="Remove Filter">
                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeIngredient')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box display="flex" gap={1} mb={1.2}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Type an ingredient (e.g. garlic, chicken, lemon) and press Enter"
                                    value={includeInput}
                                    onChange={(e) => setIncludeInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddIncludeIngredient();
                                        }
                                    }}
                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    color="primary"
                                    size="small"
                                    onClick={handleAddIncludeIngredient}
                                    sx={{ fontWeight: 600, px: 2 }}
                                >
                                    Add
                                </Button>
                            </Box>

                            <Box display="flex" flexWrap="wrap" gap={0.8} minHeight="24px">
                                {includeIngredients.map(ing => (
                                    <Chip
                                        key={ing}
                                        label={`+ ${ing}`}
                                        color="primary"
                                        size="small"
                                        onDelete={() => setIncludeIngredients(prev => prev.filter(i => i !== ing))}
                                        sx={{ fontWeight: 600 }}
                                    />
                                ))}
                                {includeIngredients.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                        Type ingredient above and click Add.
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* 3. Must NOT Contain Ingredients Card */}
                {activeFilters.includes('excludeIngredient') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <RemoveCircleOutlineIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                        Must NOT Contain Ingredient
                                    </Typography>
                                </Box>
                                <Tooltip title="Remove Filter">
                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeIngredient')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <Box display="flex" gap={1} mb={1.2}>
                                <TextField
                                    size="small"
                                    fullWidth
                                    placeholder="Type an ingredient to exclude (e.g. cilantro, nuts, mushrooms)"
                                    value={excludeInput}
                                    onChange={(e) => setExcludeInput(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                            handleAddExcludeIngredient();
                                        }
                                    }}
                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                />
                                <Button
                                    variant="contained"
                                    color="error"
                                    size="small"
                                    onClick={handleAddExcludeIngredient}
                                    sx={{ fontWeight: 600, px: 2 }}
                                >
                                    Add
                                </Button>
                            </Box>

                            <Box display="flex" flexWrap="wrap" gap={0.8} minHeight="24px">
                                {excludeIngredients.map(ing => (
                                    <Chip
                                        key={ing}
                                        label={`- ${ing}`}
                                        color="error"
                                        size="small"
                                        onDelete={() => setExcludeIngredients(prev => prev.filter(i => i !== ing))}
                                        sx={{ fontWeight: 600 }}
                                    />
                                ))}
                                {excludeIngredients.length === 0 && (
                                    <Typography variant="caption" color="text.secondary">
                                        Type ingredient above to exclude.
                                    </Typography>
                                )}
                            </Box>
                        </CardContent>
                    </Card>
                )}

                {/* 4. Cookbook / Source Card */}
                {activeFilters.includes('cookbook') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <MenuBookIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        Cookbook / Source
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ToggleButtonGroup
                                        value={cookbookMode}
                                        exclusive
                                        onChange={(e, val) => val && setCookbookMode(val)}
                                        size="small"
                                    >
                                        <ToggleButton value="include" color="success" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Include
                                        </ToggleButton>
                                        <ToggleButton value="exclude" color="error" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Exclude
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Tooltip title="Remove Filter">
                                        <IconButton size="small" onClick={() => handleRemoveFilter('cookbook')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Autocomplete
                                multiple
                                id="cookbook-select"
                                options={availableCookbooks}
                                value={cookbooks}
                                onChange={(event, newValue) => setCookbooks(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder={cookbooks.length === 0 ? "Select cookbooks or authors..." : ""}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option}
                                            label={option}
                                            size="small"
                                            color={cookbookMode === 'include' ? 'primary' : 'error'}
                                        />
                                    ))
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 5. Source Category Card */}
                {activeFilters.includes('sourceCategory') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <CategoryIcon color="secondary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        Source Type
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ToggleButtonGroup
                                        value={sourceCategoryMode}
                                        exclusive
                                        onChange={(e, val) => val && setSourceCategoryMode(val)}
                                        size="small"
                                    >
                                        <ToggleButton value="include" color="success" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Include
                                        </ToggleButton>
                                        <ToggleButton value="exclude" color="error" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Exclude
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Tooltip title="Remove Filter">
                                        <IconButton size="small" onClick={() => handleRemoveFilter('sourceCategory')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Autocomplete
                                multiple
                                id="source-cat-select"
                                options={availableSourceCategories.map(sc => sc.name)}
                                value={sourceCategories}
                                onChange={(event, newValue) => setSourceCategories(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder={sourceCategories.length === 0 ? "Select source types (Website, Instagram, Cookbook)..." : ""}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option}
                                            label={option}
                                            size="small"
                                            color={sourceCategoryMode === 'include' ? 'primary' : 'error'}
                                        />
                                    ))
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 6. System Tags Card */}
                {activeFilters.includes('tag') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <LocalOfferIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        System Tags
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ToggleButtonGroup
                                        value={tagMode}
                                        exclusive
                                        onChange={(e, val) => val && setTagMode(val)}
                                        size="small"
                                    >
                                        <ToggleButton value="include" color="success" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Include
                                        </ToggleButton>
                                        <ToggleButton value="exclude" color="error" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Exclude
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Tooltip title="Remove Filter">
                                        <IconButton size="small" onClick={() => handleRemoveFilter('tag')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Autocomplete
                                multiple
                                id="system-tags-select"
                                options={availableTags.map(t => t.name)}
                                value={tags}
                                onChange={(event, newValue) => setTags(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder={tags.length === 0 ? "Select tags (e.g. vegan, passover, dinner)..." : ""}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option}
                                            label={option}
                                            size="small"
                                            color={tagMode === 'include' ? 'primary' : 'error'}
                                        />
                                    ))
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 7. User Tags Card */}
                {activeFilters.includes('userTag') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PersonPinIcon color="secondary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        User Tags
                                    </Typography>
                                </Box>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <ToggleButtonGroup
                                        value={userTagMode}
                                        exclusive
                                        onChange={(e, val) => val && setUserTagMode(val)}
                                        size="small"
                                    >
                                        <ToggleButton value="include" color="success" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Include
                                        </ToggleButton>
                                        <ToggleButton value="exclude" color="error" sx={{ px: 1.2, py: 0.3, fontSize: '0.75rem', fontWeight: 600 }}>
                                            Exclude
                                        </ToggleButton>
                                    </ToggleButtonGroup>
                                    <Tooltip title="Remove Filter">
                                        <IconButton size="small" onClick={() => handleRemoveFilter('userTag')}>
                                            <CloseIcon fontSize="small" />
                                        </IconButton>
                                    </Tooltip>
                                </Box>
                            </Box>

                            <Autocomplete
                                multiple
                                id="user-tag-select"
                                options={availableUserTags.map(ut => ut.name)}
                                value={userTags}
                                onChange={(event, newValue) => setUserTags(newValue)}
                                renderInput={(params) => (
                                    <TextField
                                        {...params}
                                        variant="outlined"
                                        size="small"
                                        placeholder={userTags.length === 0 ? "Select user tags (e.g. eaten, interest, not a reorder)..." : ""}
                                    />
                                )}
                                renderTags={(value, getTagProps) =>
                                    value.map((option, index) => (
                                        <Chip
                                            {...getTagProps({ index })}
                                            key={option}
                                            label={option}
                                            size="small"
                                            color={userTagMode === 'include' ? 'primary' : 'error'}
                                        />
                                    ))
                                }
                            />
                        </CardContent>
                    </Card>
                )}

                {/* 8. Scope Card */}
                {activeFilters.includes('scope') && (
                    <Card variant="outlined" sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}>
                        <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                            <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                <Box display="flex" alignItems="center" gap={1}>
                                    <PersonPinIcon color="primary" fontSize="small" />
                                    <Typography variant="subtitle1" fontWeight={700} color="#1e293b">
                                        Recipe Scope
                                    </Typography>
                                </Box>
                                <Tooltip title="Remove Filter">
                                    <IconButton size="small" onClick={() => handleRemoveFilter('scope')}>
                                        <CloseIcon fontSize="small" />
                                    </IconButton>
                                </Tooltip>
                            </Box>

                            <ToggleButtonGroup
                                value={scope}
                                exclusive
                                onChange={(e, val) => val && setScope(val)}
                                size="small"
                            >
                                <ToggleButton value="all" sx={{ px: 2.5, fontWeight: 600 }}>
                                    🌐 All Recipes
                                </ToggleButton>
                                <ToggleButton value="user" sx={{ px: 2.5, fontWeight: 600 }}>
                                    ⭐ My Saved Recipes Only
                                </ToggleButton>
                            </ToggleButtonGroup>
                        </CardContent>
                    </Card>
                )}
            </Stack>

            {/* Randomized Recipe Result */}
            <div ref={recipeResultRef}>
                {randomRecipe && (
                    <Box mt={4}>
                        <Paper
                            elevation={3}
                            sx={{
                                p: 2,
                                mb: 3,
                                display: 'flex',
                                flexWrap: 'wrap',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                gap: 2,
                                bgcolor: '#f8fafc',
                                borderRadius: 3,
                                border: '1px solid #e2e8f0'
                            }}
                        >
                            <Box display="flex" alignItems="center" gap={1}>
                                <CasinoIcon color="secondary" />
                                <Typography variant="h6" fontWeight={700} color="#1e293b">
                                    Your Randomized Pick
                                </Typography>
                            </Box>
                            <Box display="flex" gap={1.5}>
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    onClick={handleRandomize}
                                    disabled={isLoadingRecipe || matchCount === 0}
                                    startIcon={isLoadingRecipe ? <CircularProgress size={18} color="inherit" /> : <ShuffleIcon />}
                                    sx={{ textTransform: 'none', fontWeight: 700, borderRadius: 2 }}
                                >
                                    Roll Another Recipe
                                </Button>
                            </Box>
                        </Paper>

                        <RecipePage recipe={randomRecipe} user={user} />
                    </Box>
                )}
            </div>
        </Container>
    );
}

export default RandomizeRecipe;