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

const FILTER_GROUPS = [
    {
        title: "User Tags",
        filters: [
            {
                key: 'includeUserTag',
                label: 'Include User Tags',
                badge: 'Include',
                badgeColor: 'success',
                icon: <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Require personal tags (e.g. eaten, interest)'
            },
            {
                key: 'excludeUserTag',
                label: 'Exclude User Tags',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <BlockIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude personal tags (e.g. not a reorder)'
            }
        ]
    },
    {
        title: "Categories",
        filters: [
            {
                key: 'includeCategory',
                label: 'Include Categories',
                badge: 'Include',
                badgeColor: 'success',
                icon: <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Require Breakfast, Chicken, Fish, etc.'
            },
            {
                key: 'excludeCategory',
                label: 'Exclude Categories',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <BlockIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude Breakfast, Chicken, Fish, etc.'
            }
        ]
    },
    {
        title: "Ingredients",
        filters: [
            {
                key: 'includeIngredient',
                label: 'Must Contain Ingredient',
                badge: 'Include',
                badgeColor: 'success',
                icon: <AddCircleOutlineIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Require specific ingredients (e.g. garlic, lemon)'
            },
            {
                key: 'excludeIngredient',
                label: 'Must NOT Contain Ingredient',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <RemoveCircleOutlineIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude unwanted ingredients (e.g. nuts, mushrooms)'
            }
        ]
    },
    {
        title: "System Tags",
        filters: [
            {
                key: 'includeTag',
                label: 'Include System Tags',
                badge: 'Include',
                badgeColor: 'success',
                icon: <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Require tags like vegan, passover, dinner'
            },
            {
                key: 'excludeTag',
                label: 'Exclude System Tags',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <BlockIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude tags like passover, dinner'
            }
        ]
    },
    {
        title: "Cookbooks & Sources",
        filters: [
            {
                key: 'includeCookbook',
                label: 'Include Cookbooks / Sources',
                badge: 'Include',
                badgeColor: 'success',
                icon: <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Filter by specific cookbooks or recipe sources'
            },
            {
                key: 'excludeCookbook',
                label: 'Exclude Cookbooks / Sources',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <BlockIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude specific cookbooks or sources'
            }
        ]
    },
    {
        title: "Source Types",
        filters: [
            {
                key: 'includeSourceCategory',
                label: 'Include Source Types',
                badge: 'Include',
                badgeColor: 'success',
                icon: <CheckCircleIcon sx={{ color: '#10b981' }} fontSize="small" />,
                description: 'Include Website, Cookbook, Instagram, Life'
            },
            {
                key: 'excludeSourceCategory',
                label: 'Exclude Source Types',
                badge: 'Exclude',
                badgeColor: 'error',
                icon: <BlockIcon sx={{ color: '#ef4444' }} fontSize="small" />,
                description: 'Exclude Website, Cookbook, Instagram, Life'
            }
        ]
    },
    {
        title: "Scope",
        filters: [
            {
                key: 'scope',
                label: 'Recipe Scope',
                badge: 'Scope',
                badgeColor: 'primary',
                icon: <PersonPinIcon color="primary" fontSize="small" />,
                description: 'Choose between All Recipes and My Saved Recipes'
            }
        ]
    }
];

const ALL_FILTER_DEFS = FILTER_GROUPS.flatMap(g => g.filters);

function RandomizeRecipe() {
    const { user, backendUrl } = useOutletContext();

    // Active filter modules list (order of addition)
    const [activeFilters, setActiveFilters] = useState([]);

    // Filter values state
    const [scope, setScope] = useState('all'); // 'all' | 'user'

    // Categories
    const [includeCategories, setIncludeCategories] = useState([]);
    const [excludeCategories, setExcludeCategories] = useState([]);

    // Cookbooks
    const [includeCookbooks, setIncludeCookbooks] = useState([]);
    const [excludeCookbooks, setExcludeCookbooks] = useState([]);

    // Source Categories
    const [includeSourceCategories, setIncludeSourceCategories] = useState([]);
    const [excludeSourceCategories, setExcludeSourceCategories] = useState([]);

    // System Tags
    const [includeTags, setIncludeTags] = useState([]);
    const [excludeTags, setExcludeTags] = useState([]);

    // User Tags
    const [includeUserTags, setIncludeUserTags] = useState([]);
    const [excludeUserTags, setExcludeUserTags] = useState([]);

    // Ingredients
    const [includeIngredients, setIncludeIngredients] = useState([]);
    const [excludeIngredients, setExcludeIngredients] = useState([]);
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

    // Build filter payload based on active filter modules
    const buildFilterPayload = useCallback((isCountOnly = false) => {
        return {
            scope: activeFilters.includes('scope') && scope === 'user' ? 'user' : 'all',
            user_id: user?.id,
            include_categories: activeFilters.includes('includeCategory') ? includeCategories : [],
            exclude_categories: activeFilters.includes('excludeCategory') ? excludeCategories : [],
            include_cookbooks: activeFilters.includes('includeCookbook') ? includeCookbooks : [],
            exclude_cookbooks: activeFilters.includes('excludeCookbook') ? excludeCookbooks : [],
            include_source_categories: activeFilters.includes('includeSourceCategory') ? includeSourceCategories : [],
            exclude_source_categories: activeFilters.includes('excludeSourceCategory') ? excludeSourceCategories : [],
            include_tags: activeFilters.includes('includeTag') ? includeTags : [],
            exclude_tags: activeFilters.includes('excludeTag') ? excludeTags : [],
            include_user_tags: activeFilters.includes('includeUserTag') ? includeUserTags : [],
            exclude_user_tags: activeFilters.includes('excludeUserTag') ? excludeUserTags : [],
            include_ingredients: activeFilters.includes('includeIngredient') ? includeIngredients : [],
            exclude_ingredients: activeFilters.includes('excludeIngredient') ? excludeIngredients : [],
            count_only: isCountOnly
        };
    }, [
        activeFilters,
        scope,
        user,
        includeCategories,
        excludeCategories,
        includeCookbooks,
        excludeCookbooks,
        includeSourceCategories,
        excludeSourceCategories,
        includeTags,
        excludeTags,
        includeUserTags,
        excludeUserTags,
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
            case 'includeCategory':
                setIncludeCategories([]);
                break;
            case 'excludeCategory':
                setExcludeCategories([]);
                break;
            case 'includeCookbook':
                setIncludeCookbooks([]);
                break;
            case 'excludeCookbook':
                setExcludeCookbooks([]);
                break;
            case 'includeSourceCategory':
                setIncludeSourceCategories([]);
                break;
            case 'excludeSourceCategory':
                setExcludeSourceCategories([]);
                break;
            case 'includeTag':
                setIncludeTags([]);
                break;
            case 'excludeTag':
                setExcludeTags([]);
                break;
            case 'includeUserTag':
                setIncludeUserTags([]);
                break;
            case 'excludeUserTag':
                setExcludeUserTags([]);
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
        setIncludeCategories([]);
        setExcludeCategories([]);
        setIncludeCookbooks([]);
        setExcludeCookbooks([]);
        setIncludeSourceCategories([]);
        setExcludeSourceCategories([]);
        setIncludeTags([]);
        setExcludeTags([]);
        setIncludeUserTags([]);
        setExcludeUserTags([]);
        setIncludeIngredients([]);
        setExcludeIngredients([]);
        setIncludeInput('');
        setExcludeInput('');
        setErrorMessage(null);
    };

    // Category toggle handlers (auto-remove from opposite list if selected)
    const toggleIncludeCategory = (catName) => {
        setIncludeCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
        setExcludeCategories(prev => prev.filter(c => c !== catName));
    };

    const toggleExcludeCategory = (catName) => {
        setExcludeCategories(prev =>
            prev.includes(catName) ? prev.filter(c => c !== catName) : [...prev, catName]
        );
        setIncludeCategories(prev => prev.filter(c => c !== catName));
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

    // Filters available to add in menu
    const availableFilterDefs = ALL_FILTER_DEFS.filter(def => !activeFilters.includes(def.key));

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

                    {/* Menu for Add Filter organized by groups */}
                    <Menu
                        anchorEl={menuAnchorEl}
                        open={Boolean(menuAnchorEl)}
                        onClose={() => setMenuAnchorEl(null)}
                        PaperProps={{
                            elevation: 4,
                            sx: { borderRadius: 2.5, minWidth: 290, maxHeight: 480, mt: 0.5 }
                        }}
                    >
                        <Typography variant="caption" sx={{ px: 2, py: 1, display: 'block', color: 'text.secondary', fontWeight: 800 }}>
                            SELECT A FILTER TO ADD
                        </Typography>
                        <Divider sx={{ my: 0.5 }} />

                        {FILTER_GROUPS.map((group) => {
                            const unaddedInGroup = group.filters.filter(f => !activeFilters.includes(f.key));
                            if (unaddedInGroup.length === 0) return null;

                            return (
                                <Box key={group.title}>
                                    <Typography
                                        variant="caption"
                                        sx={{
                                            px: 2,
                                            pt: 1,
                                            pb: 0.3,
                                            display: 'block',
                                            color: '#64748b',
                                            fontWeight: 700,
                                            letterSpacing: '0.4px',
                                            fontSize: '0.7rem'
                                        }}
                                    >
                                        {group.title.toUpperCase()}
                                    </Typography>
                                    {unaddedInGroup.map((def) => (
                                        <MenuItem
                                            key={def.key}
                                            onClick={() => handleAddFilter(def.key)}
                                            sx={{ py: 0.8, px: 2 }}
                                        >
                                            <ListItemIcon sx={{ minWidth: 32 }}>
                                                {def.icon}
                                            </ListItemIcon>
                                            <ListItemText
                                                primary={
                                                    <Box display="flex" alignItems="center" gap={1}>
                                                        <span>{def.label}</span>
                                                        <Chip
                                                            size="small"
                                                            label={def.badge}
                                                            color={def.badgeColor}
                                                            sx={{ height: 18, fontSize: '0.65rem', fontWeight: 700 }}
                                                        />
                                                    </Box>
                                                }
                                                secondary={def.description}
                                                primaryTypographyProps={{ fontWeight: 600, fontSize: '0.875rem' }}
                                                secondaryTypographyProps={{ fontSize: '0.75rem' }}
                                            />
                                        </MenuItem>
                                    ))}
                                    <Divider sx={{ my: 0.5 }} />
                                </Box>
                            );
                        })}
                    </Menu>
                </Box>
            </Box>

            {/* Quick Add Suggestions if no filters active */}
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
                        {[
                            { key: 'includeUserTag', label: '+ Include User Tags', color: 'success' },
                            { key: 'excludeUserTag', label: '- Exclude User Tags', color: 'error' },
                            { key: 'includeCategory', label: '+ Include Categories', color: 'primary' },
                            { key: 'includeIngredient', label: '+ Must Contain Ingredient', color: 'success' },
                            { key: 'excludeIngredient', label: '- Exclude Ingredient', color: 'error' },
                            { key: 'includeCookbook', label: '+ Include Cookbooks', color: 'primary' },
                        ].map(item => (
                            <Chip
                                key={item.key}
                                icon={<AddIcon fontSize="small" />}
                                label={item.label}
                                onClick={() => handleAddFilter(item.key)}
                                variant="outlined"
                                color={item.color}
                                sx={{ fontWeight: 600, cursor: 'pointer', borderRadius: 2 }}
                            />
                        ))}
                    </Box>
                </Paper>
            )}

            {/* Active Filters List (Modular Cards) */}
            <Stack spacing={2} mb={3}>
                {activeFilters.map(filterKey => {
                    switch (filterKey) {
                        /* 1. Include Categories */
                        case 'includeCategory':
                            return (
                                <Card
                                    key="includeCategory"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    Categories to Include
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {includeCategories.length > 0 && (
                                                    <Chip size="small" label={`${includeCategories.length} selected`} color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeCategory') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<BlockIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeCategory')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude Categories
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeCategory')} color="default">
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1.2}>
                                            Recipe must match ANY of the selected categories:
                                        </Typography>

                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {STANDARD_CATEGORIES.map(cat => {
                                                const isSelected = includeCategories.includes(cat.name);
                                                return (
                                                    <Chip
                                                        key={cat.name}
                                                        label={`${cat.icon} ${cat.label}`}
                                                        onClick={() => toggleIncludeCategory(cat.name)}
                                                        color={isSelected ? 'primary' : 'default'}
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
                            );

                        /* 2. Exclude Categories */
                        case 'excludeCategory':
                            return (
                                <Card
                                    key="excludeCategory"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BlockIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    Categories to Exclude
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {excludeCategories.length > 0 && (
                                                    <Chip size="small" label={`${excludeCategories.length} excluded`} color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeCategory') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeCategory')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include Categories
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeCategory')} color="default">
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1.2}>
                                            Recipe must NOT match ANY of the selected categories:
                                        </Typography>

                                        <Box display="flex" flexWrap="wrap" gap={0.8}>
                                            {STANDARD_CATEGORIES.map(cat => {
                                                const isSelected = excludeCategories.includes(cat.name);
                                                return (
                                                    <Chip
                                                        key={cat.name}
                                                        label={`${cat.icon} ${cat.label}`}
                                                        onClick={() => toggleExcludeCategory(cat.name)}
                                                        color={isSelected ? 'error' : 'default'}
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
                            );

                        /* 3. Must Contain Ingredient */
                        case 'includeIngredient':
                            return (
                                <Card
                                    key="includeIngredient"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <AddCircleOutlineIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    Must Contain Ingredient
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeIngredient') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<RemoveCircleOutlineIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeIngredient')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude Ingredient
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeIngredient')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
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
                            );

                        /* 4. Must NOT Contain Ingredient */
                        case 'excludeIngredient':
                            return (
                                <Card
                                    key="excludeIngredient"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <RemoveCircleOutlineIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    Must NOT Contain Ingredient
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeIngredient') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<AddCircleOutlineIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeIngredient')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include Ingredient
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeIngredient')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
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
                            );

                        /* 5. Include User Tags */
                        case 'includeUserTag':
                            return (
                                <Card
                                    key="includeUserTag"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    User Tags to Include
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {includeUserTags.length > 0 && (
                                                    <Chip size="small" label={`${includeUserTags.length} selected`} color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeUserTag') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<BlockIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeUserTag')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude User Tags
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeUserTag')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must have ANY of the selected user tags:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="include-user-tag-select"
                                            options={availableUserTags.map(ut => ut.name)}
                                            value={includeUserTags}
                                            onChange={(event, newValue) => {
                                                setIncludeUserTags(newValue);
                                                // Remove selected from exclude if present
                                                setExcludeUserTags(prev => prev.filter(t => !newValue.includes(t)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={includeUserTags.length === 0 ? "Select user tags to include (e.g. eaten, interest)..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`+ ${option}`}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 6. Exclude User Tags */
                        case 'excludeUserTag':
                            return (
                                <Card
                                    key="excludeUserTag"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BlockIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    User Tags to Exclude
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {excludeUserTags.length > 0 && (
                                                    <Chip size="small" label={`${excludeUserTags.length} excluded`} color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeUserTag') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeUserTag')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include User Tags
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeUserTag')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must NOT have ANY of the selected user tags:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="exclude-user-tag-select"
                                            options={availableUserTags.map(ut => ut.name)}
                                            value={excludeUserTags}
                                            onChange={(event, newValue) => {
                                                setExcludeUserTags(newValue);
                                                // Remove selected from include if present
                                                setIncludeUserTags(prev => prev.filter(t => !newValue.includes(t)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={excludeUserTags.length === 0 ? "Select user tags to exclude (e.g. not a reorder)..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`- ${option}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 7. Include System Tags */
                        case 'includeTag':
                            return (
                                <Card
                                    key="includeTag"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    System Tags to Include
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {includeTags.length > 0 && (
                                                    <Chip size="small" label={`${includeTags.length} selected`} color="primary" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeTag') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<BlockIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeTag')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude Tags
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeTag')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must match ANY of the selected system tags:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="include-tags-select"
                                            options={availableTags.map(t => t.name)}
                                            value={includeTags}
                                            onChange={(event, newValue) => {
                                                setIncludeTags(newValue);
                                                setExcludeTags(prev => prev.filter(t => !newValue.includes(t)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={includeTags.length === 0 ? "Select tags (e.g. vegan, passover, dinner)..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`+ ${option}`}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 8. Exclude System Tags */
                        case 'excludeTag':
                            return (
                                <Card
                                    key="excludeTag"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BlockIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    System Tags to Exclude
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                                {excludeTags.length > 0 && (
                                                    <Chip size="small" label={`${excludeTags.length} excluded`} color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 600 }} />
                                                )}
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeTag') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeTag')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include Tags
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeTag')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must NOT match ANY of the selected system tags:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="exclude-tags-select"
                                            options={availableTags.map(t => t.name)}
                                            value={excludeTags}
                                            onChange={(event, newValue) => {
                                                setExcludeTags(newValue);
                                                setIncludeTags(prev => prev.filter(t => !newValue.includes(t)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={excludeTags.length === 0 ? "Select tags to exclude..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`- ${option}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 9. Include Cookbooks */
                        case 'includeCookbook':
                            return (
                                <Card
                                    key="includeCookbook"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    Cookbooks / Sources to Include
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeCookbook') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<BlockIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeCookbook')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude Cookbooks
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeCookbook')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must be from ANY of the selected sources:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="include-cookbook-select"
                                            options={availableCookbooks}
                                            value={includeCookbooks}
                                            onChange={(event, newValue) => {
                                                setIncludeCookbooks(newValue);
                                                setExcludeCookbooks(prev => prev.filter(c => !newValue.includes(c)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={includeCookbooks.length === 0 ? "Select cookbooks or authors to include..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`+ ${option}`}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 10. Exclude Cookbooks */
                        case 'excludeCookbook':
                            return (
                                <Card
                                    key="excludeCookbook"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BlockIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    Cookbooks / Sources to Exclude
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeCookbook') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeCookbook')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include Cookbooks
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeCookbook')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must NOT be from ANY of the selected sources:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="exclude-cookbook-select"
                                            options={availableCookbooks}
                                            value={excludeCookbooks}
                                            onChange={(event, newValue) => {
                                                setExcludeCookbooks(newValue);
                                                setIncludeCookbooks(prev => prev.filter(c => !newValue.includes(c)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={excludeCookbooks.length === 0 ? "Select cookbooks or authors to exclude..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`- ${option}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 11. Include Source Category */
                        case 'includeSourceCategory':
                            return (
                                <Card
                                    key="includeSourceCategory"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #bbf7d0', bgcolor: '#f0fdf4', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <CheckCircleIcon sx={{ color: '#16a34a' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#15803d">
                                                    Source Types to Include
                                                </Typography>
                                                <Chip size="small" label="Include" color="success" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('excludeSourceCategory') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="error"
                                                        startIcon={<BlockIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('excludeSourceCategory')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#fca5a5' }}
                                                    >
                                                        + Exclude Source Types
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('includeSourceCategory')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must be from ANY of the selected source types:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="include-source-cat-select"
                                            options={availableSourceCategories.map(sc => sc.name)}
                                            value={includeSourceCategories}
                                            onChange={(event, newValue) => {
                                                setIncludeSourceCategories(newValue);
                                                setExcludeSourceCategories(prev => prev.filter(sc => !newValue.includes(sc)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={includeSourceCategories.length === 0 ? "Select source types (Website, Instagram, Cookbook)..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`+ ${option}`}
                                                        size="small"
                                                        color="primary"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 12. Exclude Source Category */
                        case 'excludeSourceCategory':
                            return (
                                <Card
                                    key="excludeSourceCategory"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #fecaca', bgcolor: '#fef2f2', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
                                    <CardContent sx={{ p: { xs: 2, sm: 2.5 }, pb: '16px !important' }}>
                                        <Box display="flex" justifyContent="space-between" alignItems="center" mb={1.5}>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                <BlockIcon sx={{ color: '#dc2626' }} fontSize="small" />
                                                <Typography variant="subtitle1" fontWeight={700} color="#b91c1c">
                                                    Source Types to Exclude
                                                </Typography>
                                                <Chip size="small" label="Exclude" color="error" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
                                            </Box>
                                            <Box display="flex" alignItems="center" gap={1}>
                                                {!activeFilters.includes('includeSourceCategory') && (
                                                    <Button
                                                        size="small"
                                                        variant="outlined"
                                                        color="success"
                                                        startIcon={<CheckCircleIcon sx={{ fontSize: 13 }} />}
                                                        onClick={() => handleAddFilter('includeSourceCategory')}
                                                        sx={{ textTransform: 'none', fontSize: '0.75rem', py: 0.3, px: 1, borderRadius: 1.5, borderColor: '#86efac' }}
                                                    >
                                                        + Include Source Types
                                                    </Button>
                                                )}
                                                <Tooltip title="Remove Filter">
                                                    <IconButton size="small" onClick={() => handleRemoveFilter('excludeSourceCategory')}>
                                                        <CloseIcon fontSize="small" />
                                                    </IconButton>
                                                </Tooltip>
                                            </Box>
                                        </Box>

                                        <Typography variant="caption" color="text.secondary" display="block" mb={1}>
                                            Recipe must NOT be from ANY of the selected source types:
                                        </Typography>

                                        <Autocomplete
                                            multiple
                                            id="exclude-source-cat-select"
                                            options={availableSourceCategories.map(sc => sc.name)}
                                            value={excludeSourceCategories}
                                            onChange={(event, newValue) => {
                                                setExcludeSourceCategories(newValue);
                                                setIncludeSourceCategories(prev => prev.filter(sc => !newValue.includes(sc)));
                                            }}
                                            renderInput={(params) => (
                                                <TextField
                                                    {...params}
                                                    variant="outlined"
                                                    size="small"
                                                    placeholder={excludeSourceCategories.length === 0 ? "Select source types to exclude..." : ""}
                                                    sx={{ bgcolor: '#ffffff', borderRadius: 1 }}
                                                />
                                            )}
                                            renderTags={(value, getTagProps) =>
                                                value.map((option, index) => (
                                                    <Chip
                                                        {...getTagProps({ index })}
                                                        key={option}
                                                        label={`- ${option}`}
                                                        size="small"
                                                        color="error"
                                                        sx={{ fontWeight: 600 }}
                                                    />
                                                ))
                                            }
                                        />
                                    </CardContent>
                                </Card>
                            );

                        /* 13. Scope */
                        case 'scope':
                            return (
                                <Card
                                    key="scope"
                                    variant="outlined"
                                    sx={{ borderRadius: 2.5, border: '1px solid #e2e8f0', boxShadow: '0 2px 8px rgba(0,0,0,0.04)' }}
                                >
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
                            );

                        default:
                            return null;
                    }
                })}
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