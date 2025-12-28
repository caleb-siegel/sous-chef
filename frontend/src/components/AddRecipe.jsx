import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Tag from "./Tag";
import Ingredients from "./Ingredients";
import { Button, TextField, InputLabel, MenuItem, Select, Paper, CircularProgress, Alert, Box } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import InstagramIcon from '@mui/icons-material/Instagram';

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
    const [parseError, setParseError] = useState(null);

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

            // Set source name to Instagram
            setSourceName("Instagram");
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
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px'}}>
            <h1> Add New Recipe</h1>
            
            {/* Instagram URL Parser Section */}
            <Box sx={{ mb: 3, p: 2, backgroundColor: '#f5f5f5', borderRadius: 1 }}>
                <h3 style={{ marginTop: 0 }}>Quick Add from Instagram</h3>
                <Box sx={{ display: 'flex', gap: 1, alignItems: 'flex-start' }}>
                    <TextField 
                        fullWidth
                        id="instagram-url" 
                        label="Instagram Video URL" 
                        variant="outlined" 
                        value={instagramUrl} 
                        onChange={(event) => {
                            setInstagramUrl(event.target.value);
                            setParseError(null);
                        }}
                        placeholder="https://www.instagram.com/reel/..."
                        disabled={isParsing}
                        size="small"
                    />
                    <Button 
                        variant="contained" 
                        color="secondary" 
                        onClick={handleParseInstagram}
                        disabled={isParsing || !instagramUrl.trim()}
                        startIcon={isParsing ? <CircularProgress size={20} /> : <InstagramIcon />}
                        sx={{ minWidth: 150 }}
                    >
                        {isParsing ? "Parsing..." : "Parse Recipe"}
                    </Button>
                </Box>
                {parseError && (
                    <Alert severity="error" sx={{ mt: 1 }}>
                        {parseError}
                    </Alert>
                )}
            </Box>

            <form onSubmit={handleSubmit}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                        <TextField id="outlined-basic" label="Name" variant="standard" value={name} onChange={(event) => setName(event.target.value)}/>
                        <br />
                        <TextField id="outlined-basic" label="Picture" variant="standard" value={picture} onChange={(event) => setPicture(event.target.value)}/>
                        <br />
                        <br />
                        <InputLabel id="demo-simple-select-label">Source Category</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={sourceCategoryInput}
                            label="Source Category"
                            onChange={(event) => setSourceCategoryInput(event.target.value)}
                        >
                            {sourceCategories.map(sourceCategory => {
                                return <MenuItem key={sourceCategory.id} value={sourceCategory.name}>{sourceCategory.name}</MenuItem>
                            })}
                        </Select>
                        <br />
                        <TextField id="outlined-basic" label="Source Name" variant="standard" value={sourceName} onChange={(event) => setSourceName(event.target.value)}/>
                        <br />
                        <TextField id="outlined-basic" label="Reference" variant="standard" value={reference} onChange={(event) => setReference(event.target.value)}/>
                        <br />
                        <TextField label="Recipe Instructions" variant="standard" multiline maxRows={20} value={recipeInstructions} onChange={(event) => setRecipeInstructions(event.target.value)} sx={{ display: 'flex' }}/>
                        <br />
                        <br />
                        <Tag tags={tags} selectedTags={selectedTags} handleTagChange={handleTagChange}/>
                        <br/>
                        {ingredients && ingredients.map((ingredient, index) => (
                            <Ingredients key={index} index={index} ingredients={ingredients} setIngredients={setIngredients}/>                        
                        ))}
                        <Button variant="contained" color="primary" size="small" startIcon={<AddIcon/>} onClick={() => setIngredients([...ingredients, emptyIngredient])}>Add Ingredient</Button>
                    </div>
                </div>
                <br />
                <Button variant="contained" color="primary" size="small" type="submit">Submit</Button>
            </form>
        </Paper>
    )
}

export default AddRecipe;