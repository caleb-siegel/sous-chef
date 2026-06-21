import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Tag from "./Tag";
import Ingredients from "./Ingredients";
import { 
    Button, TextField, InputLabel, MenuItem, Select, Paper, 
    CircularProgress, Alert, Box, Dialog, DialogTitle, DialogContent, 
    DialogActions, Typography, Grid, Divider, ToggleButton, ToggleButtonGroup 
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InstagramIcon from '@mui/icons-material/Instagram';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ContentPasteIcon from '@mui/icons-material/ContentPaste';

function AddRecipe({ setRecipes, recipes, handleAddRecipe, tags }) {
    const { backendUrl } = useOutletContext();
    
    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [sourceCategoryInput, setSourceCategoryInput] = useState("");
    const [sourceName, setSourceName] = useState("");
    const [reference, setReference] = useState("");
    const [recipeInstructions, setRecipeInstructions] = useState("");
    const {user} = useOutletContext();
    const emptyIngredient = { ingredient_quantity: 0, ingredient_unit: '', ingredient_name: '', ingredient_note: '' };
    const [ingredients, setIngredients] = useState([emptyIngredient]);

    const [sourceCategories, setSourceCategories] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/category_names`)
        .then((response) => response.json())
        .then((data) => setSourceCategories(data));
    }, []);

    const [selectedTags, setSelectedTags] = useState([]);
    const [instagramUrl, setInstagramUrl] = useState("");
    const [isParsing, setIsParsing] = useState(false);
    const [isParsingImage, setIsParsingImage] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);
    const [parseError, setParseError] = useState(null);
    const [imageError, setImageError] = useState(null);
    const [importMethod, setImportMethod] = useState('manual');

    const handleImportMethodChange = (event, newMethod) => {
        if (newMethod !== null) {
            setImportMethod(newMethod);
            setParseError(null);
        }
    };

    const handleTagChange = (event, newValue) => {
        event.preventDefault();
        setSelectedTags(newValue);
    };

    const handleParseInstagram = async (event) => {
        event.preventDefault();
        if (!instagramUrl || !instagramUrl.trim()) {
            setParseError("Please enter an Instagram URL");
            return;
        }

        setIsParsing(true);
        setParseError(null);

        try {
            console.log("Parsing Instagram URL:", instagramUrl.trim());
            console.log("Backend URL:", backendUrl);
            
            const response = await fetch(`${backendUrl}/api/parse-instagram-recipe`, {
                method: "POST",
                credentials: 'include', // Important for CORS
                headers: {
                    "Content-Type": "application/json",
                    "Accept": "application/json",
                },
                body: JSON.stringify({ instagram_url: instagramUrl.trim() }),
            });

            console.log("Response status:", response.status);
            console.log("Response ok:", response.ok);

            if (!response.ok) {
                // Try to get error message from response
                let errorMessage = "Failed to parse Instagram video";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.error || errorMessage;
                    console.error("Error response:", errorData);
                } catch (e) {
                    console.error("Could not parse error response:", e);
                    errorMessage = `Server error: ${response.status} ${response.statusText}`;
                }
                throw new Error(errorMessage);
            }

            const data = await response.json();
            console.log("Parsed recipe data:", data);

            // Populate form fields with parsed data
            if (data.name) setName(data.name);
            if (data.instructions) setRecipeInstructions(data.instructions);
            if (data.ingredients && data.ingredients.length > 0) {
                const formattedIngredients = data.ingredients.map(ing => ({
                    ingredient_name: ing.ingredient_name || '',
                    ingredient_quantity: ing.ingredient_quantity || 0,
                    ingredient_unit: ing.ingredient_unit || '',
                    ingredient_note: ing.ingredient_note || ''
                }));
                setIngredients(formattedIngredients);
            }

            // Set source category to Instagram and source name to the account name
            setSourceCategoryInput("Instagram");
            setSourceName(data.source || "Instagram");
            setReference(instagramUrl.trim());

            // Clear the Instagram URL field
            setInstagramUrl("");
        } catch (error) {
            console.error("Error parsing Instagram:", error);
            
            // Provide more specific error messages
            let errorMessage = "Failed to parse Instagram video. ";
            
            if (error.name === 'TypeError' && error.message.includes('fetch')) {
                errorMessage += "Could not connect to the server. Please check if the backend is running and the URL is correct.";
            } else if (error.message) {
                errorMessage += error.message;
            } else {
                errorMessage += "Please check the URL and try again.";
            }
            
            setParseError(errorMessage);
        } finally {
            setIsParsing(false);
        }
    };

    const handleImagePaste = async (event, type) => {
        // type can be 'ai' (for data extraction) or 'display' (for recipe image)
        const items = event.clipboardData.items;
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

    const handleImageUpload = (event, type) => {
        const file = event.target.files[0];
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

    const processAIImage = async (base64Image) => {
        setIsParsingImage(true);
        setParseError(null);
        try {
            const response = await fetch(`${backendUrl}/api/parse-recipe-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ image: base64Image }),
            });
            if (!response.ok) throw new Error("Failed to parse image");
            const data = await response.json();
            
            if (data.name) setName(data.name);
            if (data.instructions) setRecipeInstructions(data.instructions);
            if (data.reference) setReference(data.reference);
            if (data.ingredients) {
                setIngredients(data.ingredients.map(ing => ({
                    ingredient_name: ing.ingredient_name || '',
                    ingredient_quantity: ing.ingredient_quantity || 0,
                    ingredient_unit: ing.ingredient_unit || '',
                    ingredient_note: ing.ingredient_note || ''
                })));
            }
        } catch (error) {
            setParseError("Error parsing recipe from image: " + error.message);
        } finally {
            setIsParsingImage(false);
        }
    };

    const uploadDisplayImage = async (base64Image) => {
        setIsUploadingImage(true);
        setImageError(null);
        try {
            const response = await fetch(`${backendUrl}/api/upload-recipe-image`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    image: base64Image,
                    name: name // Send the current recipe name if available
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

    const handleSubmit = (event) => {
        event.preventDefault();
        let sourceCategoryId = 0;
        sourceCategories.map((source_category) => {
            if (source_category.name === sourceCategoryInput) {
                sourceCategoryId = source_category.id;
            }
            return sourceCategoryId;
        })    

        const recipeData = {
            name: name,
            picture: picture,
            source_category_id: sourceCategoryId,
            source: sourceName,
            reference: reference,
            instructions: recipeInstructions
        };
        fetch(`${backendUrl}/api/recipes`, {
            method: "POST",
            headers: {
                "Content-Type": "Application/JSON",
            },
            body: JSON.stringify(recipeData),
            })
            .then((response) => response.json())
            .then((newRecipeData) => {
                setName("");
                setPicture("");
                setSourceCategoryInput("");
                setSourceName("");
                setReference("");
                setRecipeInstructions("");
                selectedTags && selectedTags.length > 0 && selectedTags.map(tag => {
                    const tagData = {
                        recipe_id: newRecipeData.id,
                        tag_id: tag.id,
                    };
                    fetch(`${backendUrl}/api/recipetags`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "Application/JSON",
                        },
                        body: JSON.stringify(tagData),
                    })
                    .then((response) => response.json())
                    .then((newTagData) => {
                        // console.log("success")
                        setSelectedTags([]);
                    });
                });
                ingredients && ingredients.map(ingredient => {
                    const ingredientData = {
                        recipe_id: newRecipeData.id,
                        ingredient_name: ingredient.ingredient_name,
                        ingredient_quantity: ingredient.ingredient_quantity,
                        ingredient_unit: ingredient.ingredient_unit,
                        ingredient_note: ingredient.ingredient_note
                    };
                    fetch(`${backendUrl}/api/recipeingredients`, {
                        method: "POST",
                        headers: {
                            "Content-Type": "Application/JSON",
                        },
                        body: JSON.stringify(ingredientData),
                    })
                    .then((response) => response.json())
                    .then((newIngredientData) => {
                        // console.log("success")
                        setIngredients([emptyIngredient]);
                    });
                });
                setRecipes([newRecipeData, ...recipes]);
                handleAddRecipe(event);
            });
    };    
    
    return (
        <Dialog open={true} onClose={() => handleAddRecipe({preventDefault: () => {}})} fullWidth maxWidth="md">
            <DialogTitle sx={{ bgcolor: 'primary.main', color: 'primary.contrastText' }}>
                <Typography variant="h4">Add New Recipe</Typography>
            </DialogTitle>
            <DialogContent sx={{ mt: 2 }}>
                <Box sx={{ mb: 3, display: 'flex', justifyContent: 'center' }}>
                    <ToggleButtonGroup
                        value={importMethod}
                        exclusive
                        onChange={handleImportMethodChange}
                        aria-label="import method"
                        color="primary"
                        size="small"
                    >
                        <ToggleButton value="manual">Manual Entry</ToggleButton>
                        <ToggleButton value="instagram" sx={{ gap: 1 }}>
                            <InstagramIcon fontSize="small" /> Instagram
                        </ToggleButton>
                        <ToggleButton value="ai" sx={{ gap: 1 }}>
                            <AutoFixHighIcon fontSize="small" /> AI Image Parser
                        </ToggleButton>
                    </ToggleButtonGroup>
                </Box>

                {importMethod === 'instagram' && (
                    <Box sx={{ mb: 4, p: 3, border: '1px dashed #FF7D45', borderRadius: 2, bgcolor: 'rgba(255, 125, 69, 0.05)' }}>
                        <Typography variant="h6" gutterBottom color="secondary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <InstagramIcon /> Instagram Quick Add
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 2, alignItems: 'flex-start' }}>
                            <TextField 
                                fullWidth
                                label="Instagram Video URL" 
                                variant="outlined" 
                                value={instagramUrl} 
                                onChange={(event) => {
                                    setInstagramUrl(event.target.value);
                                    setParseError(null);
                                }}
                                placeholder="https://www.instagram.com/reel/..."
                                disabled={isParsing}
                            />
                            <Button 
                                variant="contained" 
                                color="secondary" 
                                onClick={handleParseInstagram}
                                disabled={isParsing || !instagramUrl.trim()}
                                sx={{ py: 1.5, px: 3 }}
                            >
                                {isParsing ? <CircularProgress size={20} /> : "Parse"}
                            </Button>
                        </Box>
                        {parseError && <Alert severity="error" sx={{ mt: 2 }}>{parseError}</Alert>}
                    </Box>
                )}

                {importMethod === 'ai' && (
                    <Box sx={{ mb: 4, p: 3, border: '1px dashed #3FFFC2', borderRadius: 2, bgcolor: 'rgba(63, 255, 194, 0.05)', cursor: 'pointer', transition: 'all 0.2s', '&:hover': { bgcolor: 'rgba(63, 255, 194, 0.1)' } }}
                        onPaste={(e) => handleImagePaste(e, 'ai')}
                    >
                        <Typography variant="h6" gutterBottom color="primary" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <AutoFixHighIcon /> AI Data Extractor
                        </Typography>
                        <Box sx={{ textAlign: 'center', py: 2 }}>
                            {isParsingImage ? (
                                <CircularProgress size={40} />
                            ) : (
                                <>
                                    <Typography variant="body1" color="textPrimary" gutterBottom>
                                        Paste an image containing ingredients and instructions
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                        The AI will automatically fill out the form for you
                                    </Typography>
                                    <Button component="label" variant="outlined" startIcon={<ContentPasteIcon />}>
                                        Select Image File
                                        <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'ai')} />
                                    </Button>
                                </>
                            )}
                        </Box>
                        {parseError && <Alert severity="error" sx={{ mt: 2 }}>{parseError}</Alert>}
                    </Box>
                )}

                <Grid container spacing={3}>
                    <Grid item xs={12} md={6}>
                        <TextField fullWidth label="Recipe Name" variant="outlined" value={name} onChange={(event) => setName(event.target.value)} sx={{ mb: 2 }}/>
                        
                        <Paper 
                            sx={{ p: 2, mb: 2, border: '1px dashed #ccc', textAlign: 'center', bgcolor: picture ? 'transparent' : '#f5f5f5', position: 'relative' }}
                            onPaste={(e) => handleImagePaste(e, 'display')}
                        >
                            {picture ? (
                                <Box sx={{ position: 'relative' }}>
                                    <img src={picture} alt="Recipe Preview" style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} />
                                    <Button 
                                        size="small" 
                                        color="error" 
                                        sx={{ position: 'absolute', top: 5, right: 5, bgcolor: 'rgba(255,255,255,0.8)' }}
                                        onClick={() => setPicture("")}
                                    >
                                        Remove
                                    </Button>
                                </Box>
                            ) : (
                                <Box sx={{ py: 2 }}>
                                    {isUploadingImage ? <CircularProgress size={24} /> : (
                                        <>
                                            <PhotoCameraIcon color="disabled" sx={{ fontSize: 40 }} />
                                            <Typography variant="body2">Paste or Upload Recipe Image</Typography>
                                            <Button component="label" size="small">
                                                Select File
                                                <input type="file" hidden accept="image/*" onChange={(e) => handleImageUpload(e, 'display')} />
                                            </Button>
                                        </>
                                    )}
                                </Box>
                            )}
                            {imageError && <Alert severity="error" size="small">{imageError}</Alert>}
                        </Paper>

                        <TextField fullWidth label="Picture URL (manual)" variant="outlined" value={picture} onChange={(event) => setPicture(event.target.value)} sx={{ mb: 2 }} size="small"/>
                        
                        <Box sx={{ mb: 2 }}>
                            <InputLabel id="category-label">Source Category</InputLabel>
                            <Select
                                labelId="category-label"
                                fullWidth
                                value={sourceCategoryInput}
                                onChange={(event) => setSourceCategoryInput(event.target.value)}
                            >
                                {sourceCategories.map(cat => <MenuItem key={cat.id} value={cat.name}>{cat.name}</MenuItem>)}
                            </Select>
                        </Box>
                        
                        <TextField fullWidth label="Source (e.g. Cookbook Name)" variant="outlined" value={sourceName} onChange={(event) => setSourceName(event.target.value)} sx={{ mb: 2 }}/>
                        <TextField fullWidth label="Reference (URL/Page #)" variant="outlined" value={reference} onChange={(event) => setReference(event.target.value)} sx={{ mb: 2 }}/>
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <TextField 
                            fullWidth 
                            label="Instructions" 
                            variant="outlined" 
                            multiline 
                            rows={10} 
                            value={recipeInstructions} 
                            onChange={(event) => setRecipeInstructions(event.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" gutterBottom>Tags</Typography>
                        <Tag tags={tags} selectedTags={selectedTags} handleTagChange={handleTagChange}/>
                    </Grid>

                    <Grid item xs={12}>
                        <Divider sx={{ my: 1 }} />
                        <Typography variant="h6" gutterBottom>Ingredients</Typography>
                        {ingredients.map((_, index) => (
                            <Ingredients key={index} index={index} ingredients={ingredients} setIngredients={setIngredients}/>
                        ))}
                        <Button variant="outlined" startIcon={<AddIcon/>} onClick={() => setIngredients([...ingredients, emptyIngredient])} sx={{ mt: 1 }}>
                            Add Ingredient
                        </Button>
                    </Grid>
                </Grid>
            </DialogContent>
            <DialogActions sx={{ p: 3, bgcolor: '#f9f9f9' }}>
                <Button onClick={handleAddRecipe}>Cancel</Button>
                <Button variant="contained" color="primary" onClick={handleSubmit} size="large" sx={{ px: 4 }}>
                    Save Recipe
                </Button>
            </DialogActions>
        </Dialog>
    )
}

export default AddRecipe;