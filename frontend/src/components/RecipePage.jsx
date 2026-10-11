import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useOutletContext } from 'react-router-dom';
import {
    Box,
    Typography,
    Chip,
    Button,
    IconButton,
    TextField,
    CircularProgress,
    Snackbar,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Select,
    MenuItem,
    FormControl,
    InputLabel,
    Tooltip,
    Divider,
    LinearProgress
} from '@mui/material';

// Icons
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import LocalDiningIcon from '@mui/icons-material/LocalDining';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import TimerIcon from '@mui/icons-material/Timer';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import InstagramIcon from '@mui/icons-material/Instagram';
import LinkIcon from '@mui/icons-material/Link';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import KitchenIcon from '@mui/icons-material/Kitchen';
import EditIcon from '@mui/icons-material/Edit';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import WbSunnyIcon from '@mui/icons-material/WbSunny';

import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import RecipeCardsOptions from './RecipeCardsOptions';
import { useWakeLock } from '../utils/wakeLock';
import './RecipePage.css';

// Culinary fraction formatter
export function formatQuantity(qty, scale = 1) {
    if (qty === null || qty === undefined || qty === '' || Number(qty) === 0) return '';
    const val = Number(qty) * scale;
    if (isNaN(val)) return '';

    if (Math.abs(val - Math.round(val)) < 0.01) {
        return Math.round(val).toString();
    }

    const whole = Math.floor(val);
    const remainder = val - whole;

    const fractions = [
        { decimal: 0.125, fraction: '⅛' },
        { decimal: 0.25, fraction: '¼' },
        { decimal: 0.333, fraction: '⅓' },
        { decimal: 0.375, fraction: '⅜' },
        { decimal: 0.5, fraction: '½' },
        { decimal: 0.625, fraction: '⅝' },
        { decimal: 0.666, fraction: '⅔' },
        { decimal: 0.75, fraction: '¾' },
        { decimal: 0.875, fraction: '⅞' },
    ];

    let closest = fractions[0];
    let minDiff = Math.abs(remainder - fractions[0].decimal);
    for (let f of fractions) {
        const diff = Math.abs(remainder - f.decimal);
        if (diff < minDiff) {
            minDiff = diff;
            closest = f;
        }
    }

    if (minDiff < 0.04) {
        return whole > 0 ? `${whole} ${closest.fraction}` : closest.fraction;
    }

    return Number(val.toFixed(2)).toString();
}

// Parse scale input (supports decimals "0.25", fractions "1/4", "1/3", mixed "2 1/2", and integers "20" or "20x")
export function parseScaleInput(inputStr) {
    if (!inputStr || typeof inputStr !== 'string') return null;
    const str = inputStr.trim().replace(/[×x]$/i, '').trim();
    if (!str) return null;

    if (str.includes('/')) {
        const parts = str.split(/\s+/);
        if (parts.length === 2) {
            const whole = parseFloat(parts[0]);
            const fracParts = parts[1].split('/');
            if (fracParts.length === 2) {
                const num = parseFloat(fracParts[0]);
                const den = parseFloat(fracParts[1]);
                if (!isNaN(whole) && !isNaN(num) && !isNaN(den) && den > 0) {
                    return whole + (num / den);
                }
            }
        } else if (parts.length === 1) {
            const fracParts = str.split('/');
            if (fracParts.length === 2) {
                const num = parseFloat(fracParts[0]);
                const den = parseFloat(fracParts[1]);
                if (!isNaN(num) && !isNaN(den) && den > 0) {
                    return num / den;
                }
            }
        }
    }

    const val = parseFloat(str);
    return (!isNaN(val) && val > 0) ? val : null;
}

// Robust instruction step parser
export function parseInstructions(rawInstructions) {
    if (!rawInstructions || typeof rawInstructions !== 'string') return [];
    const text = rawInstructions.trim();
    if (!text) return [];

    const lines = text
        .split(/\r?\n/)
        .map(l => l.trim())
        .filter(l => {
            if (!l) return false;
            const lower = l.toLowerCase();
            return !(
                lower === 'recipe' ||
                lower === 'recipe:' ||
                lower === 'instructions' ||
                lower === 'instructions:' ||
                lower === 'directions' ||
                lower === 'directions:' ||
                lower === 'method:' ||
                lower === 'steps:'
            );
        });

    if (lines.length > 1) {
        return lines.map(line => {
            return line
                .replace(/^[-*•]\s+/, '')
                .replace(/^(?:step\s*\d+[:.]?\s*|\d+[\).]\s*)/i, '')
                .trim();
        }).filter(Boolean);
    }

    if (/\b\d+[\).]\s+/.test(text)) {
        const parts = text.split(/(?:^|\s+)\d+[\).]\s+/).map(p => p.trim()).filter(Boolean);
        if (parts.length > 1) {
            return parts;
        }
    }

    return [text];
}

// Web Audio API chime for kitchen timer
function playTimerChime() {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;

        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.frequency.setValueAtTime(587.33, now); // D5
        gain1.gain.setValueAtTime(0.25, now);
        gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start(now);
        osc1.stop(now + 0.5);

        const osc2 = ctx.createOscillator();
        const gain2 = ctx.createGain();
        osc2.frequency.setValueAtTime(880, now + 0.2); // A5
        gain2.gain.setValueAtTime(0.25, now + 0.2);
        gain2.gain.exponentialRampToValueAtTime(0.001, now + 1.2);
        osc2.connect(gain2);
        gain2.connect(ctx.destination);
        osc2.start(now + 0.2);
        osc2.stop(now + 1.2);
    } catch (e) {
        console.warn('Audio chime unsupported or blocked', e);
    }
}

function RecipePage({ recipe, user, editRecipe, handleEditRecipe }) {
    const context = useOutletContext() || {};
    const backendUrl = context.backendUrl || '';
    const navigate = useNavigate();

    // Screen Wake Lock
    const { isLocked: isWakeLocked } = useWakeLock();

    // Scale / Servings
    const [scale, setScale] = useState(1);
    const [scaleLabel, setScaleLabel] = useState('1×');
    const [isCustomScale, setIsCustomScale] = useState(false);
    const [showCustomScaleBar, setShowCustomScaleBar] = useState(false);
    const [customScaleText, setCustomScaleText] = useState('');
    const scalePresets = [0.5, 1, 1.5, 2, 3];

    const handleApplyCustomScale = (customValStr = customScaleText) => {
        const parsed = parseScaleInput(customValStr);
        if (parsed !== null) {
            setScale(parsed);
            setIsCustomScale(true);
            const cleanLabel = customValStr.trim().replace(/[×x]$/i, '') + '×';
            setScaleLabel(cleanLabel);
            setSnackbar({ open: true, message: `Recipe ingredients scaled to ${cleanLabel}! ⚖️`, severity: 'success' });
            setShowCustomScaleBar(false);
        } else {
            setSnackbar({ open: true, message: 'Please enter a valid scale (e.g. 1/4, 2.5, or 20)', severity: 'warning' });
        }
    };

    const handleSelectPreset = (preset) => {
        setScale(preset);
        setScaleLabel(`${preset}×`);
        setIsCustomScale(false);
        setShowCustomScaleBar(false);
        setCustomScaleText('');
    };

    // Checklist states
    const [checkedIngredients, setCheckedIngredients] = useState({});
    const [completedSteps, setCompletedSteps] = useState({});

    // Full-screen Cook Mode
    const [isCookMode, setIsCookMode] = useState(false);
    const [cookModeStep, setCookModeStep] = useState(0);

    // Kitchen Timer (seconds)
    const [timerSeconds, setTimerSeconds] = useState(0);
    const [timerRunning, setTimerRunning] = useState(false);
    const timerIntervalRef = useRef(null);

    // User tags
    const [userTags, setUserTags] = useState([]);
    const [userRecipeTags, setUserRecipeTags] = useState(recipe?.user_recipe_tags || []);

    // Favorites
    const [userRecipesList, setUserRecipesList] = useState(recipe?.user_recipes || []);
    const [isFavoriting, setIsFavoriting] = useState(false);

    // Meal Prep
    const [mealPrepsList, setMealPrepsList] = useState(recipe?.meal_preps || recipe?.meal_prep || []);
    const [mealPrepModalOpen, setMealPrepModalOpen] = useState(false);
    const [mealPrepDay, setMealPrepDay] = useState('Monday');
    const [mealPrepType, setMealPrepType] = useState('Dinner');
    const [isAddingMealPrep, setIsAddingMealPrep] = useState(false);

    // Cooked Instances & Reviews
    const getInitialCookedInstances = (rec) => {
        return (rec?.user_recipes || []).flatMap(user_recipe =>
            (user_recipe.cooked_instances || []).map(ci => ({
                ...ci,
                user_name: user_recipe.user?.first_name
                    ? `${user_recipe.user.first_name} ${user_recipe.user.last_name || ''}`.trim()
                    : (user_recipe.user?.name || 'Fellow Foodie')
            }))
        );
    };

    const [cookedInstances, setCookedInstances] = useState(getInitialCookedInstances(recipe));
    const [showCookedForm, setShowCookedForm] = useState(false);
    const [cookedComment, setCookedComment] = useState('');
    const [cookedDate, setCookedDate] = useState(() => new Date().toISOString().split('T')[0]);
    const [isSubmittingCooked, setIsSubmittingCooked] = useState(false);

    // Toast Notifications
    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

    // Fallback Image
    const [imgFailed, setImgFailed] = useState(false);

    // Synchronize props
    useEffect(() => {
        if (recipe?.user_recipes) {
            setUserRecipesList(recipe.user_recipes);
            setCookedInstances(getInitialCookedInstances(recipe));
        }
        if (recipe?.user_recipe_tags) {
            setUserRecipeTags(recipe.user_recipe_tags);
        }
        if (recipe?.meal_preps || recipe?.meal_prep) {
            setMealPrepsList(recipe.meal_preps || recipe.meal_prep);
        }
    }, [recipe]);

    // Fetch user tags
    useEffect(() => {
        if (backendUrl) {
            fetch(`${backendUrl}/api/usertags`)
                .then(r => r.json())
                .then(data => {
                    if (Array.isArray(data)) setUserTags(data);
                })
                .catch(err => console.warn('Could not fetch user tags', err));
        }
    }, [backendUrl]);

    // Kitchen timer tick
    useEffect(() => {
        if (timerRunning && timerSeconds > 0) {
            timerIntervalRef.current = setInterval(() => {
                setTimerSeconds(prev => {
                    if (prev <= 1) {
                        clearInterval(timerIntervalRef.current);
                        setTimerRunning(false);
                        playTimerChime();
                        setSnackbar({ open: true, message: '⏰ Kitchen Timer Finished!', severity: 'info' });
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        }
        return () => {
            if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        };
    }, [timerRunning, timerSeconds]);

    // Format timer MM:SS
    const formatTimer = (totalSeconds) => {
        const m = Math.floor(totalSeconds / 60);
        const s = totalSeconds % 60;
        return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const addTimerMinutes = (mins) => {
        setTimerSeconds(prev => prev + mins * 60);
        setTimerRunning(true);
    };

    const resetTimer = () => {
        setTimerRunning(false);
        setTimerSeconds(0);
    };

    // Instagram parser
    const isInstagramUrl = (url) => {
        if (!url) return false;
        return url.includes('instagram.com') || url.includes('instagr.am');
    };

    const getInstagramEmbedUrl = (url) => {
        if (!url) return null;
        const patterns = [
            /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
            /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
            /instagr\.am\/p\/([A-Za-z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                const shortcode = match[1];
                if (url.includes('/reel/')) {
                    return `https://www.instagram.com/reel/${shortcode}/embed/`;
                } else {
                    return `https://www.instagram.com/p/${shortcode}/embed/`;
                }
            }
        }
        return null;
    };

    // Favorite status
    const currentFavorite = user && userRecipesList.find(ur => ur.user_id === user.id);
    const isFavorite = Boolean(currentFavorite);

    const handleToggleFavorite = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please log in to save favorites!', severity: 'info' });
            return;
        }

        setIsFavoriting(true);
        if (isFavorite) {
            // Remove
            try {
                const res = await fetch(`${backendUrl}/api/userrecipes/${currentFavorite.id}`, {
                    method: 'DELETE',
                    credentials: 'include'
                });
                if (res.ok) {
                    setUserRecipesList(prev => prev.filter(ur => ur.id !== currentFavorite.id));
                    setSnackbar({ open: true, message: 'Removed from your favorites', severity: 'info' });
                }
            } catch (err) {
                console.error('Error removing favorite:', err);
            }
        } else {
            // Add
            try {
                const res = await fetch(`${backendUrl}/api/userrecipes`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                    body: JSON.stringify({
                        user_id: user.id,
                        recipe_id: recipe.id,
                        not_reorder: false,
                        comments: ''
                    })
                });
                if (res.ok) {
                    const data = await res.json();
                    setUserRecipesList(prev => [...prev, data]);
                    setSnackbar({ open: true, message: 'Saved to your favorites! ❤️', severity: 'success' });
                }
            } catch (err) {
                console.error('Error adding favorite:', err);
            }
        }
        setIsFavoriting(false);
    };

    // Delete Recipe
    const handleDeleteRecipe = (event, id) => {
        if (event && event.preventDefault) event.preventDefault();
        const confirmed = window.confirm('Are you sure you want to delete this recipe?');
        if (confirmed) {
            fetch(`${backendUrl}/api/recipes/${id}`, {
                method: 'DELETE',
                credentials: 'include',
            })
            .then(() => {
                navigate('/recipes');
            })
            .catch(err => {
                console.error('Failed to delete recipe:', err);
            });
        }
    };

    // Tags handlers
    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null && user) {
            fetch(`${backendUrl}/api/userrecipetags`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then(res => res.json())
            .then(data => {
                setUserRecipeTags(prev => [...prev, data]);
                setSnackbar({ open: true, message: 'Tag added!', severity: 'success' });
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        }
    };

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/userrecipetags/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        })
        .then(() => {
            setUserRecipeTags(prev => prev.filter(tag => tag.id !== id));
            setSnackbar({ open: true, message: 'Tag removed', severity: 'info' });
        });
    };

    // Checklist toggles
    const toggleIngredientCheck = (id) => {
        setCheckedIngredients(prev => ({
            ...prev,
            [id]: !prev[id]
        }));
    };

    const toggleStepComplete = (idx) => {
        setCompletedSteps(prev => ({
            ...prev,
            [idx]: !prev[idx]
        }));
    };

    // Share & Copy
    const handleShare = () => {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(window.location.href);
            setSnackbar({ open: true, message: 'Recipe link copied to clipboard! 🔗', severity: 'success' });
        }
    };

    const handleCopyIngredients = () => {
        if (!recipe?.recipe_ingredients) return;
        const text = recipe.recipe_ingredients
            .map(ing => {
                const q = formatQuantity(ing.ingredient_quantity, scale);
                const u = ing.ingredient_unit ? ` ${ing.ingredient_unit}` : '';
                const n = ing.ingredient_name || '';
                const note = ing.ingredient_note ? ` (${ing.ingredient_note})` : '';
                return `• ${q}${u} ${n}${note}`.trim();
            })
            .join('\n');

        if (navigator.clipboard) {
            navigator.clipboard.writeText(`${recipe.name} - Ingredients:\n${text}`);
            setSnackbar({ open: true, message: 'Ingredients list copied to clipboard! 📋', severity: 'success' });
        }
    };

    const handlePrint = () => {
        window.print();
    };

    // Meal Prep Submit
    const handleSaveMealPrep = async () => {
        if (!user) {
            setSnackbar({ open: true, message: 'Please log in to add to meal prep', severity: 'info' });
            return;
        }
        setIsAddingMealPrep(true);
        try {
            const res = await fetch(`${backendUrl}/api/mealprep`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipe.id,
                    weekday: mealPrepDay,
                    meal: mealPrepType,
                })
            });
            if (res.ok) {
                const data = await res.json();
                setMealPrepsList(prev => [...prev, data]);
                setMealPrepModalOpen(false);
                setSnackbar({ open: true, message: `Added to ${mealPrepDay} ${mealPrepType}! 📅`, severity: 'success' });
            }
        } catch (err) {
            console.error('Failed to add meal prep', err);
        } finally {
            setIsAddingMealPrep(false);
        }
    };

    // Cooked Instance Submit
    const handleCookedSubmit = async (e) => {
        e.preventDefault();
        if (!cookedComment.trim()) return;

        setIsSubmittingCooked(true);
        const newInstance = {
            recipe_id: recipe.id,
            user_id: user?.id,
            comment: cookedComment,
            cooked_date: cookedDate ? new Date(cookedDate).toISOString() : new Date().toISOString(),
        };

        try {
            const response = await fetch(`${backendUrl}/api/cooked_instances`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
                body: JSON.stringify(newInstance),
            });

            if (response.ok) {
                const newEntry = await response.json();
                const userName = user?.first_name
                    ? `${user.first_name} ${user.last_name || ''}`.trim()
                    : (user?.name || 'You');

                setCookedInstances(prev => [
                    { ...newEntry, user_name: userName },
                    ...prev
                ]);
                setCookedComment('');
                setShowCookedForm(false);
                setSnackbar({ open: true, message: 'Cook log & note posted! 🍳', severity: 'success' });
            }
        } catch (error) {
            console.error('Error posting cooked instance:', error);
        } finally {
            setIsSubmittingCooked(false);
        }
    };

    const formatDate = (instance) => {
        const d = instance.cooked_date || instance.created_at;
        if (!d) return 'Recently cooked';
        return new Date(d).toLocaleDateString('en-US', {
            weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'
        });
    };

    // Parsed instructions
    const instructionsList = parseInstructions(recipe?.instructions);
    const totalIngredients = recipe?.recipe_ingredients?.length || 0;
    const checkedIngredientsCount = Object.values(checkedIngredients).filter(Boolean).length;
    const completedStepsCount = Object.values(completedSteps).filter(Boolean).length;
    const progressPercent = instructionsList.length > 0
        ? Math.round((completedStepsCount / instructionsList.length) * 100)
        : 0;

    if (!recipe || !recipe.id) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <CircularProgress color="secondary" size={60} />
            </Box>
        );
    }

    return (
        <div className="recipe-page-root">
            {/* Top Navigation & Action Cluster */}
            <div className="recipe-top-nav">
                <button
                    className="recipe-back-btn"
                    onClick={() => navigate('/recipes')}
                    aria-label="Back to Recipe Directory"
                >
                    <ArrowBackIcon fontSize="small" />
                    <span>Back to Recipes</span>
                </button>

                <div className="recipe-action-cluster">
                    {/* Favorite Button */}
                    <button
                        className={`recipe-action-pill ${isFavorite ? 'active-favorite' : ''}`}
                        onClick={handleToggleFavorite}
                        disabled={isFavoriting}
                        title={isFavorite ? 'Saved to Favorites' : 'Save to Favorites'}
                    >
                        {isFavoriting ? (
                            <CircularProgress size={16} color="inherit" />
                        ) : isFavorite ? (
                            <FavoriteIcon fontSize="small" />
                        ) : (
                            <FavoriteBorderIcon fontSize="small" />
                        )}
                        <span>{isFavorite ? 'Favorited' : 'Favorite'}</span>
                        <span style={{ opacity: 0.7, fontSize: '0.8rem' }}>({userRecipesList.length})</span>
                    </button>

                    {/* Add to Meal Prep */}
                    <button
                        className="recipe-action-pill"
                        onClick={() => setMealPrepModalOpen(true)}
                        title="Add to Weekly Meal Prep"
                    >
                        <CalendarMonthIcon fontSize="small" />
                        <span>Meal Prep</span>
                    </button>

                    {/* Cook Mode Button */}
                    {instructionsList.length > 0 && (
                        <button
                            className="recipe-action-pill cook-mode-btn"
                            onClick={() => {
                                setIsCookMode(true);
                                setCookModeStep(0);
                            }}
                            title="Distraction-free kitchen cooking mode"
                        >
                            <LocalDiningIcon fontSize="small" />
                            <span>Cook Mode</span>
                        </button>
                    )}

                    {/* Share */}
                    <Tooltip title="Copy link to recipe">
                        <button className="recipe-action-pill" onClick={handleShare}>
                            <ShareIcon fontSize="small" />
                            <span>Share</span>
                        </button>
                    </Tooltip>

                    {/* Print */}
                    <Tooltip title="Print kitchen-friendly recipe card">
                        <button className="recipe-action-pill" onClick={handlePrint}>
                            <PrintIcon fontSize="small" />
                            <span>Print</span>
                        </button>
                    </Tooltip>

                    {/* Screen Wake Lock Indicator */}
                    <Tooltip title={isWakeLocked ? "Screen Stay-Awake active: your computer won't sleep or shut off while browsing recipes!" : "Screen Stay-Awake active"}>
                        <div
                            className="recipe-action-pill"
                            style={{
                                cursor: 'default',
                                background: 'var(--rc-primary-subtle)',
                                borderColor: 'rgba(63, 255, 194, 0.4)',
                                color: '#0d9488'
                            }}
                        >
                            <WbSunnyIcon fontSize="small" style={{ fontSize: 16, color: '#f59e0b' }} />
                            <span>Screen On</span>
                        </div>
                    </Tooltip>

                    {/* Edit & Delete for Admin / Author */}
                    {user && (user.id === 2 || user.id === recipe.created_by_user_id) && (
                        <RecipeCardsOptions
                            handleDelete={handleDeleteRecipe}
                            recipeId={recipe.id}
                            editRecipe={editRecipe}
                            handleEditRecipe={handleEditRecipe}
                        />
                    )}
                </div>
            </div>

            {/* Hero Header */}
            <header className="recipe-hero-header">
                {/* Meta Badges */}
                <div className="recipe-meta-badges">
                    {/* Tags */}
                    {recipe.recipe_tags && recipe.recipe_tags.map(tagItem => {
                        if (tagItem && tagItem.tag) {
                            return (
                                <Chip
                                    key={tagItem.tag.id}
                                    label={tagItem.tag.name}
                                    size="small"
                                    sx={{
                                        fontWeight: 700,
                                        fontSize: '0.78rem',
                                        backgroundColor: 'var(--rc-primary-subtle)',
                                        color: '#0d9488',
                                        border: '1px solid rgba(63, 255, 194, 0.4)'
                                    }}
                                />
                            );
                        }
                        return null;
                    })}

                    {/* User Personal Tags */}
                    {userRecipeTags
                        .filter(urt => (user && user.id && urt.user_id === user.id))
                        .map(urt => (
                            urt && urt.id && urt.user_tag && (
                                <Chip
                                    key={urt.id}
                                    size="small"
                                    label={`★ ${urt.user_tag.name}`}
                                    color="secondary"
                                    variant="outlined"
                                    onDelete={(e) => handleDeleteUserTag(e, urt.id)}
                                    sx={{ fontWeight: 600, fontSize: '0.78rem' }}
                                />
                            )
                        ))
                    }

                    {/* Add Tag Popover */}
                    {user && (
                        <UserRecipeTagsMenu
                            recipeId={recipe.id}
                            tags={userTags}
                            handleTagSelect={handleTagSelect}
                            color="secondary"
                        />
                    )}

                    {/* Source Attribution Badge */}
                    {recipe.source_category_id === 2 ? (
                        <div className="recipe-source-badge">
                            <MenuBookIcon fontSize="small" />
                            <span>From <strong>{recipe.source}</strong>, Page {recipe.reference || '—'}</span>
                        </div>
                    ) : isInstagramUrl(recipe.reference) ? (
                        <div className="recipe-source-badge">
                            <InstagramIcon fontSize="small" style={{ color: '#E1306C' }} />
                            <span>By <strong>{recipe.source || 'Instagram Creator'}</strong> • </span>
                            <a href={recipe.reference} target="_blank" rel="noopener noreferrer">
                                View Original Reel
                            </a>
                        </div>
                    ) : recipe.source ? (
                        <div className="recipe-source-badge">
                            <LinkIcon fontSize="small" />
                            <span>Source: <strong>{recipe.source}</strong></span>
                            {recipe.reference && recipe.reference.startsWith('http') && (
                                <a href={recipe.reference} target="_blank" rel="noopener noreferrer" style={{ marginLeft: 4 }}>
                                    Visit site
                                </a>
                            )}
                        </div>
                    ) : null}
                </div>

                {/* Recipe Title */}
                <h1 className="recipe-title">{recipe.name}</h1>

                {/* Quick Stats Ribbon */}
                <div className="recipe-stats-ribbon">
                    <div className="recipe-stat-item">
                        <KitchenIcon fontSize="small" style={{ color: 'var(--rc-primary-dark)' }} />
                        <span><strong>{totalIngredients}</strong> Ingredients</span>
                    </div>

                    <div className="recipe-stat-divider" />

                    <div className="recipe-stat-item">
                        <RestaurantMenuIcon fontSize="small" style={{ color: 'var(--rc-secondary)' }} />
                        <span><strong>{instructionsList.length}</strong> Steps</span>
                    </div>

                    <div className="recipe-stat-divider" />

                    <div className="recipe-stat-item">
                        <FastfoodIcon fontSize="small" style={{ color: '#f59e0b' }} />
                        <span>Cooked <strong>{cookedInstances.length}</strong> {cookedInstances.length === 1 ? 'time' : 'times'}</span>
                    </div>

                    {recipe.user && (
                        <>
                            <div className="recipe-stat-divider" />
                            <div className="recipe-stat-item">
                                <PersonOutlineIcon fontSize="small" style={{ color: 'var(--rc-text-muted)' }} />
                                <span>Added by <strong>{recipe.user.first_name || recipe.user.name || 'Community'}</strong></span>
                            </div>
                        </>
                    )}

                    {/* Meal Prep Chips if planned */}
                    {mealPrepsList.length > 0 && (
                        <>
                            <div className="recipe-stat-divider" />
                            <div className="recipe-stat-item">
                                <CalendarMonthIcon fontSize="small" style={{ color: '#8b5cf6' }} />
                                <span>Planned for: {mealPrepsList.filter(mp => !user || mp.user_id === user.id).map(mp => (
                                    <Chip
                                        key={mp.id}
                                        label={`${mp.weekday} ${mp.meal}`}
                                        size="small"
                                        variant="outlined"
                                        sx={{ ml: 0.5, fontSize: '0.72rem', height: 22 }}
                                    />
                                ))}</span>
                            </div>
                        </>
                    )}
                </div>
            </header>

            {/* Main Content Layout Grid */}
            <main className="recipe-layout-grid">
                {/* Left Column: Visual Media + Ingredients */}
                <div className="recipe-sidebar-col">
                    {/* Media Card */}
                    {isInstagramUrl(recipe.reference) ? (
                        <div className="recipe-instagram-frame">
                            <iframe
                                src={getInstagramEmbedUrl(recipe.reference)}
                                title="Instagram video"
                                width="100%"
                                height="560"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency="true"
                                allow="encrypted-media"
                                style={{
                                    width: '100%',
                                    borderRadius: '16px',
                                    border: 'none',
                                    display: 'block'
                                }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, textAlign: 'center', color: 'text.secondary' }}>
                                <a href={recipe.reference} target="_blank" rel="noopener noreferrer" style={{ color: '#2563eb', fontWeight: 600 }}>
                                    Open Post on Instagram ↗
                                </a>
                            </Typography>
                        </div>
                    ) : (
                        <div className="recipe-media-container">
                            {recipe.picture && !imgFailed ? (
                                <img
                                    src={recipe.picture}
                                    alt={recipe.name}
                                    className="recipe-hero-image"
                                    onError={() => setImgFailed(true)}
                                />
                            ) : (
                                <div className="recipe-hero-placeholder">
                                    <div className="recipe-placeholder-icon-wrap">
                                        <RestaurantMenuIcon style={{ fontSize: 44 }} />
                                    </div>
                                    <Typography variant="h6" fontWeight="bold" color="textPrimary" sx={{ mb: 0.5 }}>
                                        {recipe.name}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                        Homemade with love • Sous Chef
                                    </Typography>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Ingredients Card */}
                    <div className="recipe-card">
                        <div className="recipe-card-header">
                            <h2 className="recipe-section-title">
                                <span>Ingredients</span>
                                <span className="recipe-count-pill">
                                    {checkedIngredientsCount > 0 ? `${checkedIngredientsCount}/${totalIngredients}` : `${totalIngredients} items`}
                                </span>
                            </h2>

                            <Tooltip title="Copy scaled ingredients to clipboard">
                                <IconButton size="small" onClick={handleCopyIngredients} sx={{ color: 'var(--rc-text-muted)' }}>
                                    <ContentCopyIcon fontSize="small" />
                                </IconButton>
                            </Tooltip>
                        </div>

                        {/* Servings / Scale Controller */}
                        <div className="recipe-scaler-box">
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', flexWrap: 'wrap', gap: '0.5rem' }}>
                                <span className="recipe-scaler-label">
                                    Scale Servings: <strong>{scaleLabel || `${scale}×`}</strong>
                                </span>
                                <div className="recipe-scaler-options">
                                    {scalePresets.map(preset => (
                                        <button
                                            key={preset}
                                            type="button"
                                            className={`recipe-scale-chip ${scale === preset && !isCustomScale ? 'selected' : ''}`}
                                            onClick={() => handleSelectPreset(preset)}
                                        >
                                            {preset}×
                                        </button>
                                    ))}
                                    <button
                                        type="button"
                                        className={`recipe-scale-chip ${isCustomScale || showCustomScaleBar ? 'selected' : ''}`}
                                        onClick={() => setShowCustomScaleBar(prev => !prev)}
                                        title="Enter custom multiplier (e.g. 1/4, 20x)"
                                    >
                                        {isCustomScale ? `${scaleLabel} (Custom)` : 'Custom...'}
                                    </button>
                                </div>
                            </div>

                            {showCustomScaleBar && (
                                <div className="recipe-custom-scale-bar">
                                    <span style={{ fontSize: '0.8rem', color: 'var(--rc-text-muted)' }}>Multiplier:</span>
                                    <input
                                        type="text"
                                        className="recipe-custom-scale-input"
                                        placeholder="e.g. 1/4 or 20"
                                        value={customScaleText}
                                        onChange={(e) => setCustomScaleText(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault();
                                                handleApplyCustomScale();
                                            }
                                        }}
                                        autoFocus
                                    />
                                    <button
                                        type="button"
                                        className="recipe-scale-chip selected"
                                        onClick={() => handleApplyCustomScale()}
                                    >
                                        Apply
                                    </button>

                                    {/* Quick shortcut chips */}
                                    <div style={{ display: 'flex', gap: '0.25rem', alignItems: 'center', flexWrap: 'wrap' }}>
                                        {['1/4', '1/3', '5x', '10x', '20x'].map(shortcut => (
                                            <button
                                                key={shortcut}
                                                type="button"
                                                className="recipe-scale-chip"
                                                style={{ fontSize: '0.75rem', padding: '0.2rem 0.45rem' }}
                                                onClick={() => {
                                                    setCustomScaleText(shortcut);
                                                    handleApplyCustomScale(shortcut);
                                                }}
                                            >
                                                {shortcut}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Interactive Ingredients Checklist */}
                        <div className="recipe-ingredients-list">
                            {recipe.recipe_ingredients && recipe.recipe_ingredients.length > 0 ? (
                                recipe.recipe_ingredients.map(ing => {
                                    const isChecked = Boolean(checkedIngredients[ing.id]);
                                    const formattedQty = formatQuantity(ing.ingredient_quantity, scale);

                                    return (
                                        <div
                                            key={ing.id}
                                            className={`recipe-ingredient-row ${isChecked ? 'checked' : ''}`}
                                            onClick={() => toggleIngredientCheck(ing.id)}
                                            role="checkbox"
                                            aria-checked={isChecked}
                                            tabIndex={0}
                                            onKeyDown={(e) => {
                                                if (e.key === ' ' || e.key === 'Enter') {
                                                    e.preventDefault();
                                                    toggleIngredientCheck(ing.id);
                                                }
                                            }}
                                        >
                                            <div className="recipe-checkbox-circle">
                                                {isChecked ? <CheckCircleIcon sx={{ fontSize: 18 }} /> : null}
                                            </div>

                                            <div className="recipe-ingredient-content">
                                                {formattedQty && (
                                                    <span className="recipe-ingredient-qty">
                                                        {formattedQty} {ing.ingredient_unit}
                                                    </span>
                                                )}
                                                <span className="recipe-ingredient-name">
                                                    {ing.ingredient_name}
                                                </span>
                                                {ing.ingredient_note && (
                                                    <span className="recipe-ingredient-note">
                                                        ({ing.ingredient_note})
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', py: 2 }}>
                                    No ingredients listed for this recipe.
                                </Typography>
                            )}
                        </div>

                        {checkedIngredientsCount > 0 && (
                            <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button
                                    size="small"
                                    onClick={() => setCheckedIngredients({})}
                                    sx={{ textTransform: 'none', color: 'text.secondary', fontSize: '0.8rem' }}
                                >
                                    Reset Checklist
                                </Button>
                            </Box>
                        )}
                    </div>
                </div>

                {/* Right Column: Instructions + Cook Log / Reviews */}
                <div className="recipe-main-col">
                    {/* Instructions Card */}
                    <div className="recipe-card">
                        <div className="recipe-card-header">
                            <h2 className="recipe-section-title">
                                <span>Instructions</span>
                                <span className="recipe-count-pill">{instructionsList.length} steps</span>
                            </h2>

                            {completedStepsCount > 0 && (
                                <Typography variant="caption" sx={{ fontWeight: 700, color: 'var(--rc-secondary)' }}>
                                    {progressPercent}% Complete
                                </Typography>
                            )}
                        </div>

                        {/* Cooking Progress Bar */}
                        {instructionsList.length > 0 && (
                            <div className="recipe-progress-wrap">
                                <div className="recipe-progress-bar-bg">
                                    <div
                                        className="recipe-progress-bar-fill"
                                        style={{ width: `${progressPercent}%` }}
                                    />
                                </div>
                            </div>
                        )}

                        {/* Step Cards List */}
                        <div className="recipe-instructions-list">
                            {instructionsList.length > 0 ? (
                                instructionsList.map((stepText, idx) => {
                                    const isDone = Boolean(completedSteps[idx]);
                                    return (
                                        <div
                                            key={idx}
                                            className={`recipe-step-card ${isDone ? 'completed' : ''}`}
                                        >
                                            <div className="recipe-step-number-pill">
                                                {String(idx + 1).padStart(2, '0')}
                                            </div>

                                            <div className="recipe-step-body">
                                                <p className="recipe-step-text">{stepText}</p>
                                                <button
                                                    type="button"
                                                    className="recipe-step-done-btn"
                                                    onClick={() => toggleStepComplete(idx)}
                                                >
                                                    {isDone ? (
                                                        <>
                                                            <CheckCircleIcon sx={{ fontSize: 15 }} />
                                                            <span>Completed</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <RadioButtonUncheckedIcon sx={{ fontSize: 15 }} />
                                                            <span>Mark Done</span>
                                                        </>
                                                    )}
                                                </button>
                                            </div>
                                        </div>
                                    );
                                })
                            ) : (
                                <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', py: 2 }}>
                                    No step-by-step instructions available for this recipe.
                                </Typography>
                            )}
                        </div>
                    </div>

                    {/* Cook Log & Community Reviews Card */}
                    <div className="recipe-card recipe-comments-section">
                        <div className="recipe-card-header">
                            <div>
                                <h2 className="recipe-section-title">
                                    <span>Cook Log & Notes</span>
                                    <span className="recipe-count-pill">{cookedInstances.length}</span>
                                </h2>
                                <Typography variant="caption" color="textSecondary">
                                    Track cooking dates, notes, and tips from home chefs
                                </Typography>
                            </div>

                            {user && !showCookedForm && (
                                <Button
                                    variant="contained"
                                    color="secondary"
                                    size="small"
                                    startIcon={<AddIcon />}
                                    onClick={() => setShowCookedForm(true)}
                                    sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700 }}
                                >
                                    I Cooked This!
                                </Button>
                            )}
                        </div>

                        {/* Log a Cook Form */}
                        {user && showCookedForm && (
                            <Box
                                component="form"
                                onSubmit={handleCookedSubmit}
                                sx={{
                                    p: 2.5,
                                    mb: 3,
                                    borderRadius: 3,
                                    backgroundColor: 'var(--rc-surface-alt)',
                                    border: '1px solid var(--rc-border)',
                                }}
                            >
                                <Typography variant="subtitle2" fontWeight="bold" sx={{ mb: 1.5 }}>
                                    Log Your Cooking Experience
                                </Typography>

                                <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '180px 1fr' }, gap: 2, mb: 2 }}>
                                    <TextField
                                        label="Date Cooked"
                                        type="date"
                                        size="small"
                                        value={cookedDate}
                                        onChange={(e) => setCookedDate(e.target.value)}
                                        InputLabelProps={{ shrink: true }}
                                        fullWidth
                                    />
                                    <TextField
                                        label="Chef Notes / Tweaks"
                                        placeholder="How did it turn out? Any seasoning tweaks or ingredient swaps?"
                                        multiline
                                        minRows={2}
                                        size="small"
                                        value={cookedComment}
                                        onChange={(e) => setCookedComment(e.target.value)}
                                        required
                                        fullWidth
                                    />
                                </Box>

                                <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
                                    <Button
                                        size="small"
                                        onClick={() => setShowCookedForm(false)}
                                        sx={{ textTransform: 'none', color: 'text.secondary' }}
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        variant="contained"
                                        color="primary"
                                        size="small"
                                        disabled={isSubmittingCooked}
                                        sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700 }}
                                    >
                                        {isSubmittingCooked ? 'Saving...' : 'Save Log Entry'}
                                    </Button>
                                </Box>
                            </Box>
                        )}

                        {/* List of Cooked Instances */}
                        <div className="recipe-logs-feed">
                            {cookedInstances.length === 0 ? (
                                <Box sx={{ py: 3, textAlign: 'center', color: 'var(--rc-text-muted)' }}>
                                    <FastfoodIcon sx={{ fontSize: 40, opacity: 0.4, mb: 1 }} />
                                    <Typography variant="body2" sx={{ fontStyle: 'italic' }}>
                                        No cook logs or notes recorded yet. Be the first to cook this and share your tips!
                                    </Typography>
                                </Box>
                            ) : (
                                cookedInstances.map((ci, index) => {
                                    const initial = (ci.user_name || 'F')[0].toUpperCase();
                                    return (
                                        <div key={ci.id || index} className="recipe-log-item">
                                            <div className="recipe-log-avatar">{initial}</div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                                    <strong style={{ fontSize: '0.9rem', color: 'var(--rc-text-main)' }}>
                                                        {ci.user_name || 'Fellow Foodie'}
                                                    </strong>
                                                    <span style={{ fontSize: '0.78rem', color: 'var(--rc-text-muted)' }}>
                                                        {formatDate(ci)}
                                                    </span>
                                                </div>
                                                <p style={{ margin: 0, fontSize: '0.92rem', color: 'var(--rc-text-main)', lineHeight: 1.5 }}>
                                                    {ci.comment}
                                                </p>
                                            </div>
                                        </div>
                                    );
                                })
                            )}
                        </div>
                    </div>
                </div>
            </main>

            {/* Meal Prep Modal Dialog */}
            <Dialog
                open={mealPrepModalOpen}
                onClose={() => setMealPrepModalOpen(false)}
                maxWidth="xs"
                fullWidth
                PaperProps={{
                    sx: { borderRadius: 4, p: 1 }
                }}
            >
                <DialogTitle sx={{ fontWeight: 800, pb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                    <CalendarMonthIcon color="primary" />
                    <span>Add to Meal Prep</span>
                </DialogTitle>
                <DialogContent>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2.5 }}>
                        Plan <strong>{recipe.name}</strong> into your weekly menu schedule.
                    </Typography>

                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                        <InputLabel id="meal-prep-day-label">Day of Week</InputLabel>
                        <Select
                            labelId="meal-prep-day-label"
                            value={mealPrepDay}
                            label="Day of Week"
                            onChange={(e) => setMealPrepDay(e.target.value)}
                        >
                            {['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'].map(day => (
                                <MenuItem key={day} value={day}>{day}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>

                    <FormControl fullWidth size="small">
                        <InputLabel id="meal-prep-type-label">Meal</InputLabel>
                        <Select
                            labelId="meal-prep-type-label"
                            value={mealPrepType}
                            label="Meal"
                            onChange={(e) => setMealPrepType(e.target.value)}
                        >
                            {['Breakfast', 'Lunch', 'Dinner'].map(meal => (
                                <MenuItem key={meal} value={meal}>{meal}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions sx={{ px: 3, pb: 2 }}>
                    <Button onClick={() => setMealPrepModalOpen(false)} sx={{ textTransform: 'none' }}>
                        Cancel
                    </Button>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleSaveMealPrep}
                        disabled={isAddingMealPrep}
                        sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 700, px: 2.5 }}
                    >
                        {isAddingMealPrep ? 'Adding...' : 'Add to Schedule'}
                    </Button>
                </DialogActions>
            </Dialog>

            {/* Kitchen Cook Mode Fullscreen Interface */}
            {isCookMode && (
                <div className="cook-mode-overlay">
                    <div className="cook-mode-topbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <LocalDiningIcon style={{ color: 'var(--rc-primary)' }} />
                            <div>
                                <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800 }}>{recipe.name}</h3>
                                <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>
                                    Step {cookModeStep + 1} of {instructionsList.length}
                                </span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.8rem', color: '#3FFFC2', background: 'rgba(63, 255, 194, 0.12)', padding: '0.3rem 0.75rem', borderRadius: 9999, border: '1px solid rgba(63, 255, 194, 0.3)' }}>
                                <WbSunnyIcon style={{ fontSize: 15, color: '#f59e0b' }} />
                                <span>Screen Kept Awake</span>
                            </div>

                            <button className="cook-mode-close-btn" onClick={() => setIsCookMode(false)}>
                                ✕ Exit Cook Mode
                            </button>
                        </div>
                    </div>

                    <div className="cook-mode-content">
                        {/* Drawer with Ingredients */}
                        <aside className="cook-mode-ingredients-drawer">
                            <h4 style={{ margin: '0 0 1rem', fontSize: '1rem', color: 'var(--rc-primary)' }}>
                                Ingredients ({scaleLabel || `${scale}×`})
                            </h4>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                                {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ing => {
                                    const qty = formatQuantity(ing.ingredient_quantity, scale);
                                    const isDone = Boolean(checkedIngredients[ing.id]);
                                    return (
                                        <div
                                            key={ing.id}
                                            onClick={() => toggleIngredientCheck(ing.id)}
                                            style={{
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.65rem',
                                                padding: '0.4rem 0.6rem',
                                                borderRadius: '8px',
                                                background: isDone ? 'rgba(255,255,255,0.04)' : 'rgba(255,255,255,0.08)',
                                                cursor: 'pointer',
                                                opacity: isDone ? 0.5 : 1
                                            }}
                                        >
                                            <span style={{ color: 'var(--rc-primary)' }}>
                                                {isDone ? '✓' : '○'}
                                            </span>
                                            <span style={{ fontSize: '0.9rem', textDecoration: isDone ? 'line-through' : 'none' }}>
                                                {qty && <strong>{qty} {ing.ingredient_unit} </strong>}
                                                {ing.ingredient_name}
                                            </span>
                                        </div>
                                    );
                                })}
                            </div>
                        </aside>

                        {/* Step Stage */}
                        <div className="cook-mode-step-stage">
                            <div>
                                {/* Kitchen Timer Widget */}
                                <div className="kitchen-timer-card">
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                        <TimerIcon style={{ fontSize: 32, color: 'var(--rc-primary)' }} />
                                        <div>
                                            <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Kitchen Timer</div>
                                            <div className={`kitchen-timer-digits ${timerRunning ? 'pulsing' : ''}`}>
                                                {formatTimer(timerSeconds)}
                                            </div>
                                        </div>
                                    </div>

                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                                        <button className="recipe-scale-chip" onClick={() => addTimerMinutes(1)}>+1m</button>
                                        <button className="recipe-scale-chip" onClick={() => addTimerMinutes(3)}>+3m</button>
                                        <button className="recipe-scale-chip" onClick={() => addTimerMinutes(5)}>+5m</button>
                                        <button className="recipe-scale-chip" onClick={() => addTimerMinutes(10)}>+10m</button>

                                        {timerRunning ? (
                                            <IconButton onClick={() => setTimerRunning(false)} sx={{ color: '#f59e0b', bgcolor: 'rgba(245, 158, 11, 0.15)' }}>
                                                <PauseIcon />
                                            </IconButton>
                                        ) : (
                                            <IconButton onClick={() => setTimerRunning(true)} disabled={timerSeconds === 0} sx={{ color: 'var(--rc-primary)', bgcolor: 'rgba(63, 255, 194, 0.15)' }}>
                                                <PlayArrowIcon />
                                            </IconButton>
                                        )}

                                        <IconButton onClick={resetTimer} sx={{ color: '#94a3b8' }}>
                                            <RestartAltIcon />
                                        </IconButton>
                                    </div>
                                </div>

                                {/* Step Counter & Text */}
                                <div style={{ display: 'inline-block', padding: '0.35rem 0.85rem', borderRadius: 9999, background: 'rgba(255, 125, 69, 0.2)', color: 'var(--rc-secondary)', fontWeight: 800, fontSize: '0.9rem' }}>
                                    STEP {cookModeStep + 1} OF {instructionsList.length}
                                </div>

                                <div className="cook-mode-step-big-text">
                                    {instructionsList[cookModeStep]}
                                </div>
                            </div>

                            {/* Cook Mode Navigation Buttons */}
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 3, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                                <Button
                                    variant="outlined"
                                    disabled={cookModeStep === 0}
                                    onClick={() => setCookModeStep(prev => prev - 1)}
                                    sx={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)', borderRadius: 9999, textTransform: 'none', px: 3 }}
                                >
                                    ← Previous Step
                                </Button>

                                <Button
                                    variant="outlined"
                                    color="secondary"
                                    onClick={() => toggleStepComplete(cookModeStep)}
                                    sx={{ borderRadius: 9999, textTransform: 'none' }}
                                >
                                    {completedSteps[cookModeStep] ? '✓ Step Completed' : 'Mark Step Done'}
                                </Button>

                                <Button
                                    variant="contained"
                                    color="primary"
                                    disabled={cookModeStep === instructionsList.length - 1}
                                    onClick={() => setCookModeStep(prev => prev + 1)}
                                    sx={{ borderRadius: 9999, textTransform: 'none', px: 3, fontWeight: 700 }}
                                >
                                    Next Step →
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

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

export default RecipePage;