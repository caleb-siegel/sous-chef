import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Tag from "./Tag";
import Ingredients from "./Ingredients";
import { 
    Button, TextField, InputLabel, MenuItem, Select, FormControl,
    CircularProgress, Alert, Box, Dialog, DialogContent, 
    Typography, IconButton, Tooltip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import LinkIcon from '@mui/icons-material/Link';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import './AddRecipe.css';

function AddRecipe({ 
    open = true, 
    onClose, 
    handleAddRecipe, 
    recipes, 
    setRecipes, 
    tags 
}) {
    const context = useOutletContext() || {};
    const backendUrl = context.backendUrl || '';
    const user = context.user;
    
    // Form fields
    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [sourceCategoryInput, setSourceCategoryInput] = useState("");
    const [sourceName, setSourceName] = useState("");
    const [reference, setReference] = useState("");
    const [recipeInstructions, setRecipeInstructions] = useState("");
    
    // Ingredients state
    const emptyIngredient = { ingredient_quantity: 0, ingredient_unit: '', ingredient_name: '', ingredient_note: '' };
    const [ingredients, setIngredients] = useState([
        { ingredient_quantity: '', ingredient_unit: '', ingredient_name: '', ingredient_note: '' }
    ]);

    // Categories
    const [sourceCategories, setSourceCategories] = useState([]);
    useEffect(() => {
        if (!backendUrl) return;
        fetch(`${backendUrl}/api/category_names`)
            .then((response) => response.json())
            .then((data) => {
                if (Array.isArray(data)) setSourceCategories(data);
            })
            .catch((err) => console.warn("Could not load categories:", err));
    }, [backendUrl]);

    // Tags & Import methods
    const [selectedTags, setSelectedTags] = useState([]);
    const [instagramUrl, setInstagramUrl] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isParsingImage, setIsParsingImage] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [parseError, setParseError] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);
    const [importMethod, setImportMethod] = useState('manual'); // 'manual' | 'instagram' | 'ai'
    const [showManualUrlInput, setShowManualUrlInput] = useState(false);

    const handleModalClose = () => {
        if (onClose) {
            onClose();
        } else if (handleAddRecipe) {
            handleAddRecipe({ preventDefault: () => {} });
        }
    };

    const handleTagChange = (event, newValue) => {
        if (event && event.preventDefault) event.preventDefault();
        setSelectedTags(newValue || []);
    };

    // Instagram URL parsing
    const handleParseInstagram = async (event) => {
        if (event && event.preventDefault) event.preventDefault();
        if (!instagramUrl || !instagramUrl.trim()) {
            setParseError("Please enter an Instagram video or reel URL");
            return;
        }

        setIsParsing(true);
        setParseError(null);

        try {
            const response = await fetch(`${backendUrl}/api/parse-instagram-recipe`, {
                method: "POST",
                credentials: 'include',
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ instagram_url: instagramUrl.trim() }),
            });

            if (!response.ok) {
                let errorMessage = "Failed to parse Instagram video";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                } catch {
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();

            // Populate form fields
            if (data.name) setName(data.name);
            if (data.instructions) setRecipeInstructions(data.instructions);
            if (data.ingredients && data.ingredients.length > 0) {
                const formattedIngredients = data.ingredients.map(ing => ({
                    ingredient_name: ing.ingredient_name || '',
                    ingredient_quantity: ing.ingredient_quantity || '',
                    ingredient_unit: ing.ingredient_unit || '',
                    ingredient_note: ing.ingredient_note || ''
                }));
                setIngredients(formattedIngredients);
            }

            setSourceCategoryInput("Instagram");
            setSourceName(data.source || "Instagram");
            setReference(instagramUrl.trim());
            setInstagramUrl("");
            setSuccessMessage("Instagram recipe imported! You can refine the ingredients and steps below. 🚀");
            setTimeout(() => setSuccessMessage(null), 6000);
        } catch (error) {
            console.error("Error parsing Instagram:", error);
            setParseError(error.message || "Failed to parse Instagram video. Please check the URL.");
        } finally {
            setIsParsing(false);
        }
    };

    // Image clipboard paste
    const handleImagePaste = async (event, type) => {
        const items = event.clipboardData?.items;
        if (!items) return;

        for (let i = 0; i < items.length; i++) {
            if (items[i].type.indexOf("image") !== -1) {
                const blob = items[i].getAsFile();
                const reader = new FileReader();
                reader.onload = async (e) => {
                    const base64Image = e.target.result;
                    if (type === 'ai') {
                        processAIImage(base64Image);
                    } else {
                        uploadDisplayImage(base64Image);
                    }
                };
                reader.readAsDataURL(blob);
                break;
            }
        }
    };

    // Image file upload
    const handleImageUpload = (event, type) => {
        const file = event.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = async (e) => {
                const base64Image = e.target.result;
                if (type === 'ai') {
                    processAIImage(base64Image);
                } else {
                    uploadDisplayImage(base64Image);
                }
            };
            reader.readAsDataURL(file);
        }
    };

    // AI image recipe parsing
    const processAIImage = async (base64Image) => {
        setIsParsingImage(true);
        setParseError(null);
        try {
            const response = await fetch(`${backendUrl}/api/parse-recipe-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });
            if (!response.ok) throw new Error("Failed to parse recipe from image");
            const data = await response.json();
            
            if (data.name) setName(data.name);
            if (data.instructions) setRecipeInstructions(data.instructions);
            if (data.reference) setReference(data.reference);
            if (data.ingredients && data.ingredients.length > 0) {
                setIngredients(data.ingredients.map(ing => ({
                    ingredient_name: ing.ingredient_name || '',
                    ingredient_quantity: ing.ingredient_quantity || '',
                    ingredient_unit: ing.ingredient_unit || '',
                    ingredient_note: ing.ingredient_note || ''
                })));
            }
            setSuccessMessage("AI successfully extracted recipe data! Review the details below. ✨");
            setTimeout(() => setSuccessMessage(null), 6000);
        } catch (error) {
            setParseError("Error parsing recipe from image: " + error.message);
        } finally {
            setIsParsingImage(false);
        }
    };

    // Display image upload
    const uploadDisplayImage = async (base64Image) => {
        setIsUploadingImage(true);
        setImageError(null);
        try {
            const response = await fetch(`${backendUrl}/api/upload-recipe-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image: base64Image,
                    name: name
                }),
            });
            if (!response.ok) throw new Error("Failed to upload image");
            const data = await response.json();
            setPicture(data.url);
        } catch (error) {
            setImageError("Error uploading display image: " + error.message);
        } finally {
            setIsUploadingImage(false);
        }
    };

    // Form submit
    const handleSubmit = async (event) => {
        if (event && event.preventDefault) event.preventDefault();

        if (!name.trim()) {
            setParseError("Please provide a recipe name.");
            return;
        }

        setIsSaving(true);
        setParseError(null);

        let sourceCategoryId = 0;
        sourceCategories.forEach((cat) => {
            if (cat.name === sourceCategoryInput) {
                sourceCategoryId = cat.id;
            }
        });

        const recipeData = {
            name: name.trim(),
            picture: picture.trim(),
            source_category_id: sourceCategoryId || null,
            source: sourceName.trim(),
            reference: reference.trim(),
            instructions: recipeInstructions.trim(),
            user_id: user?.id,
            created_by_user_id: user?.id
        };

        try {
            const response = await fetch(`${backendUrl}/api/recipes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(recipeData),
            });

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                throw new Error(errData.error || `Failed to create recipe (${response.status})`);
            }

            const newRecipeData = await response.json();

            // Save tags concurrently
            if (selectedTags && selectedTags.length > 0) {
                await Promise.all(
                    selectedTags.map(tag => 
                        fetch(`${backendUrl}/api/recipetags`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                recipe_id: newRecipeData.id,
                                tag_id: tag.id,
                            }),
                        }).catch(e => console.warn("Tag link error", e))
                    )
                );
            }

            // Save ingredients concurrently
            const validIngredients = ingredients.filter(ing => ing.ingredient_name && ing.ingredient_name.trim());
            if (validIngredients.length > 0) {
                await Promise.all(
                    validIngredients.map(ing => 
                        fetch(`${backendUrl}/api/recipeingredients`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            credentials: "include",
                            body: JSON.stringify({
                                recipe_id: newRecipeData.id,
                                ingredient_name: ing.ingredient_name.trim(),
                                ingredient_quantity: parseFloat(ing.ingredient_quantity) || 0,
                                ingredient_unit: ing.ingredient_unit || '',
                                ingredient_note: ing.ingredient_note || ''
                            }),
                        }).catch(e => console.warn("Ingredient link error", e))
                    )
                );
            }

            // Update recipe list
            if (setRecipes) {
                setRecipes(prev => [newRecipeData, ...(prev || [])]);
            }

            // Reset form
            setName("");
            setPicture("");
            setSourceCategoryInput("");
            setSourceName("");
            setReference("");
            setRecipeInstructions("");
            setSelectedTags([]);
            setIngredients([emptyIngredient]);

            handleModalClose();
        } catch (error) {
            console.error("Error creating recipe:", error);
            setParseError(error.message || "Failed to save recipe. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <Dialog 
            open={open} 
            onClose={handleModalClose} 
            fullWidth 
            maxWidth="md"
            PaperProps={{
                className: "add-recipe-dialog-paper"
            }}
        >
            {/* Modal Header */}
            <div className="ar-header">
                <div className="ar-header-title-box">
                    <span className="ar-header-badge">🍳</span>
                    <div className="ar-header-text">
                        <h2>Create New Recipe</h2>
                        <p>Add to your cookbook manually or import with Instagram / AI</p>
                    </div>
                </div>
                <IconButton 
                    size="small" 
                    onClick={handleModalClose} 
                    className="ar-close-btn"
                    title="Close modal"
                >
                    <CloseIcon />
                </IconButton>
            </div>

            {/* Modal Content */}
            <DialogContent className="ar-content">
                {/* Method Switcher Tabs */}
                <div className="ar-method-selector-wrap">
                    <div className="ar-method-pill-group">
                        <button 
                            type="button"
                            className={`ar-method-btn ${importMethod === 'manual' ? 'active' : ''}`}
                            onClick={() => { setImportMethod('manual'); setParseError(null); }}
                        >
                            ✍️ Manual Entry
                        </button>
                        <button 
                            type="button"
                            className={`ar-method-btn instagram ${importMethod === 'instagram' ? 'active' : ''}`}
                            onClick={() => { setImportMethod('instagram'); setParseError(null); }}
                        >
                            <InstagramIcon fontSize="small" /> Instagram Reel
                        </button>
                        <button 
                            type="button"
                            className={`ar-method-btn ai ${importMethod === 'ai' ? 'active' : ''}`}
                            onClick={() => { setImportMethod('ai'); setParseError(null); }}
                        >
                            <AutoFixHighIcon fontSize="small" /> AI Smart Scan
                        </button>
                    </div>
                </div>

                {/* Notifications & Success Banners */}
                {successMessage && (
                    <Alert severity="success" icon={<CheckCircleOutlineIcon />} sx={{ mb: 3, borderRadius: 3 }}>
                        {successMessage}
                    </Alert>
                )}

                {parseError && (
                    <Alert severity="error" sx={{ mb: 3, borderRadius: 3 }} onClose={() => setParseError(null)}>
                        {parseError}
                    </Alert>
                )}

                {/* Instagram Quick Import Panel */}
                {importMethod === 'instagram' && (
                    <div className="ar-smart-panel instagram">
                        <div className="ar-smart-header instagram">
                            <InstagramIcon />
                            <span>Instagram Reel & Video Quick Add</span>
                        </div>
                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                            Paste a reel or video URL — our chef engine extracts the title, ingredients, and instructions directly into the form.
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'stretch' }}>
                            <TextField 
                                fullWidth
                                label="Instagram Video URL" 
                                variant="outlined" 
                                size="small"
                                value={instagramUrl} 
                                onChange={(e) => setInstagramUrl(e.target.value)}
                                placeholder="https://www.instagram.com/reel/..."
                                disabled={isParsing}
                            />
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={handleParseInstagram}
                                disabled={isParsing || !instagramUrl.trim()}
                                sx={{ borderRadius: 9999, px: 3, textTransform: 'none', fontWeight: 700 }}
                            >
                                {isParsing ? <CircularProgress size={20} color="inherit" /> : "Extract"}
                            </Button>
                        </Box>
                    </div>
                )}

                {/* AI Image Extractor Panel */}
                {importMethod === 'ai' && (
                    <div 
                        className="ar-smart-panel ai"
                        onPaste={(e) => handleImagePaste(e, 'ai')}
                    >
                        <div className="ar-smart-header ai">
                            <AutoFixHighIcon />
                            <span>AI Recipe Image Extractor</span>
                        </div>
                        <Box sx={{ textAlign: 'center', py: 1.5 }}>
                            {isParsingImage ? (
                                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1.5, py: 2 }}>
                                    <CircularProgress size={36} color="primary" />
                                    <Typography variant="body2" color="primary.main" fontWeight="bold">
                                        Analyzing recipe image and extracting ingredients...
                                    </Typography>
                                </Box>
                            ) : (
                                <>
                                    <Typography variant="body1" fontWeight="600" sx={{ mb: 0.5 }}>
                                        Paste (Ctrl+V / Cmd+V) a screenshot or photo of any recipe
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        AI reads printed cookbooks, handwritten cards, or food blogs and fills out the fields automatically.
                                    </Typography>
                                    <Button 
                                        component="label" 
                                        variant="outlined" 
                                        color="primary"
                                        startIcon={<ContentPasteIcon />}
                                        sx={{ borderRadius: 9999, textTransform: 'none', fontWeight: 600 }}
                                    >
                                        Browse Image File
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'ai')} />
                                    </Button>
                                </>
                            )}
                        </Box>
                    </div>
                )}

                {/* Section 1: Recipe Essentials */}
                <div className="ar-section-card">
                    <h3 className="ar-section-title">
                        <span>🍳 Recipe Essentials</span>
                        <span className="badge">Required</span>
                    </h3>

                    <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1.2fr 1fr' }, gap: 2.5, mb: 2.5 }}>
                        {/* Recipe Name & Source Meta */}
                        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                            <TextField 
                                fullWidth 
                                label="Recipe Name" 
                                placeholder="e.g. Crispy Honey Garlic Salmon"
                                variant="outlined" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)} 
                                required
                            />

                            <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' }, gap: 1.5 }}>
                                <FormControl fullWidth size="small">
                                    <InputLabel id="category-select-label">Category</InputLabel>
                                    <Select
                                        labelId="category-select-label"
                                        label="Category"
                                        value={sourceCategoryInput}
                                        onChange={(e) => setSourceCategoryInput(e.target.value)}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {sourceCategories.map(cat => (
                                            <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>

                                <TextField 
                                    fullWidth 
                                    size="small"
                                    label="Source / Cookbook" 
                                    placeholder="e.g. Dinner in One"
                                    variant="outlined" 
                                    value={sourceName} 
                                    onChange={(e) => setSourceName(e.target.value)}
                                />
                            </Box>

                            <TextField 
                                fullWidth 
                                size="small"
                                label="Reference (Page # or Web Link)" 
                                placeholder="e.g. Page 142 or https://..."
                                variant="outlined" 
                                value={reference} 
                                onChange={(e) => setReference(e.target.value)}
                                InputProps={{
                                    startAdornment: <LinkIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 18 }} />
                                }}
                            />
                        </Box>

                        {/* Recipe Photo Uploader / Preview */}
                        <Box>
                            {picture ? (
                                <div className="ar-photo-preview-wrap">
                                    <img src={picture} alt="Recipe Preview" className="ar-photo-preview-img" />
                                    <button
                                        type="button"
                                        className="ar-photo-remove-btn"
                                        onClick={() => setPicture("")}
                                        title="Remove photo"
                                    >
                                        <CloseIcon fontSize="small" />
                                    </button>
                                </div>
                            ) : (
                                <div 
                                    className="ar-photo-uploader"
                                    onPaste={(e) => handleImagePaste(e, 'display')}
                                >
                                    {isUploadingImage ? (
                                        <Box sx={{ py: 3, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                            <CircularProgress size={28} />
                                            <Typography variant="caption">Uploading image...</Typography>
                                        </Box>
                                    ) : (
                                        <Box sx={{ py: 1.5, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5 }}>
                                            <PhotoCameraIcon sx={{ fontSize: 36, color: 'var(--ar-text-muted)', mb: 0.5 }} />
                                            <Typography variant="body2" fontWeight="600">
                                                Upload or Paste Photo
                                            </Typography>
                                            <Typography variant="caption" color="textSecondary" sx={{ mb: 1 }}>
                                                Drop image or press Ctrl+V / Cmd+V
                                            </Typography>
                                            <Button 
                                                component="label" 
                                                size="small" 
                                                variant="outlined"
                                                sx={{ borderRadius: 9999, textTransform: 'none' }}
                                            >
                                                Choose File
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'display')} />
                                            </Button>
                                        </Box>
                                    )}
                                </div>
                            )}

                            {imageError && <Alert severity="error" sx={{ mt: 1, py: 0 }}>{imageError}</Alert>}

                            {/* Optional Manual URL Link toggle */}
                            <Box sx={{ mt: 1, display: 'flex', justifyContent: 'flex-end' }}>
                                <Button 
                                    size="small" 
                                    onClick={() => setShowManualUrlInput(prev => !prev)}
                                    sx={{ textTransform: 'none', fontSize: '0.78rem', color: 'text.secondary' }}
                                >
                                    {showManualUrlInput ? "Hide image URL field" : "Or enter image URL"}
                                </Button>
                            </Box>

                            {showManualUrlInput && (
                                <TextField 
                                    fullWidth 
                                    label="Image URL" 
                                    placeholder="https://example.com/image.jpg"
                                    variant="outlined" 
                                    size="small" 
                                    value={picture} 
                                    onChange={(e) => setPicture(e.target.value)} 
                                    sx={{ mt: 1 }}
                                />
                            )}
                        </Box>
                    </Box>
                </div>

                {/* Section 2: Ingredients Builder */}
                <div className="ar-section-card">
                    <h3 className="ar-section-title">
                        <span>🥘 Ingredients</span>
                        <span className="badge">{ingredients.filter(i => i.ingredient_name).length} items</span>
                    </h3>

                    <div className="ar-ingredients-container">
                        {ingredients.map((_, index) => (
                            <Ingredients 
                                key={index} 
                                index={index} 
                                ingredients={ingredients} 
                                setIngredients={setIngredients}
                            />
                        ))}

                        <Button 
                            variant="outlined" 
                            color="primary"
                            startIcon={<AddIcon />} 
                            onClick={() => setIngredients(prev => [...prev, { ingredient_quantity: '', ingredient_unit: '', ingredient_name: '', ingredient_note: '' }])}
                            className="ar-add-ing-btn"
                        >
                            Add Ingredient Row
                        </Button>
                    </div>
                </div>

                {/* Section 3: Instructions & Method */}
                <div className="ar-section-card">
                    <h3 className="ar-section-title">
                        <span>📝 Cooking Instructions</span>
                    </h3>
                    <TextField 
                        fullWidth 
                        placeholder={"Step 1: Preheat oven to 400°F...\nStep 2: Season salmon with salt and pepper...\nStep 3: Sear skin-side down for 4 minutes..."}
                        variant="outlined" 
                        multiline 
                        minRows={6} 
                        value={recipeInstructions} 
                        onChange={(e) => setRecipeInstructions(e.target.value)}
                    />
                </div>

                {/* Section 4: Tags & Dietary Attributes */}
                <div className="ar-section-card">
                    <h3 className="ar-section-title">
                        <span>🏷️ Recipe Tags</span>
                    </h3>
                    <Tag 
                        tags={tags} 
                        selectedTags={selectedTags} 
                        handleTagChange={handleTagChange}
                    />
                </div>
            </DialogContent>

            {/* Modal Actions Footer */}
            <div className="ar-footer">
                <Button 
                    onClick={handleModalClose}
                    sx={{ textTransform: 'none', color: 'text.secondary', fontWeight: 600 }}
                >
                    Cancel
                </Button>
                <Button 
                    variant="contained" 
                    color="secondary" 
                    onClick={handleSubmit} 
                    disabled={isSaving || !name.trim()}
                    className="ar-submit-btn"
                >
                    {isSaving ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <CircularProgress size={18} color="inherit" />
                            <span>Saving Recipe...</span>
                        </Box>
                    ) : (
                        "Save Recipe 🍳"
                    )}
                </Button>
            </div>
        </Dialog>
    );
}

export default AddRecipe;