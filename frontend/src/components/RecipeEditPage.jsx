import React, { useState, useEffect } from 'react'
import { Chip, Container, Box, Paper, Button, Select, MenuItem, InputLabel, TextField } from '@mui/material';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import Ingredients from './Ingredients';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import { useOutletContext } from "react-router-dom";

function RecipeEditPage({ recipe, user }) {
    const { backendUrl } = useOutletContext();

    const [name, setName] = useState(recipe.name);
    const [picture, setPicture] = useState(recipe.picture);
    const [sourceCategoryInput, setSourceCategoryInput] = useState(recipe.source_category.name);
    const [sourceName, setSourceName] = useState(recipe.source);
    const [reference, setReference] = useState(recipe.reference);
    const [recipeInstructions, setRecipeInstructions] = useState(recipe.instructions);
    const [ingredients, setIngredients] = useState(recipe.recipe_ingredients);
    const emptyIngredient = [{ quantity: 0, unit: '', name: '', note: '' }];
    const [newIngredient, setNewIngredient] = useState();
    
    const getComments = () => {
        if (!recipe.user_recipes || !user) return null;
    
        const userRecipe = recipe.user_recipes.find(comment => 
            comment && 
            comment.comments && 
            comment.user_id && 
            comment.user_id === user.id
        );
    
        return userRecipe ? userRecipe.comments : "";
    };
    
    const [comments, setComments] = useState(getComments());

    const [tags, setTags] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/tags`)
        .then((response) => response.json())
        .then((data) => setTags(data));
    }, []);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagSelect = (recipeIdTag, tagId) => {
        if (tagId !== null) {
            fetch(`${backendUrl}/api/recipetags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    recipe_id: recipeIdTag,
                    tag_id: tagId,
                }),
            })
            .then((response) => response.json())
            .then(response => {
                console.log('Tag posted successfully:', response.data);
            })
            .catch(error => {
                console.error('Error posting tag:', error);
            });
        };        
        handleClose();
        window.location.reload();
    };

    const handleDeleteTag = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/recipetags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {})
      };

    const [sourceCategories, setSourceCategories] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/sourcecategories`)
        .then((response) => response.json())
        .then((data) => setSourceCategories(data));
    }, []);

    const handleNameChange = (id, newName) => {
        setIngredients(ingredients.map(ingredient =>
          ingredient.id === id ? { ...ingredient, ingredient_name: newName } : ingredient
        ));
    };
    
    const handleQuantityChange = (id, newQuantity) => {
        setIngredients(ingredients.map(ingredient =>
            ingredient.id === id ? { ...ingredient, ingredient_quantity: newQuantity } : ingredient
        ));
    };

    const handleUnitChange = (id, newUnit) => {
        setIngredients(ingredients.map(ingredient =>
          ingredient.id === id ? { ...ingredient, ingredient_unit: newUnit } : ingredient
        ));
    };
    
    const handleNoteChange = (id, newNote) => {
        setIngredients(ingredients.map(ingredient =>
            ingredient.id === id ? { ...ingredient, ingredient_note: newNote } : ingredient
        ));
    };

    const handlePatch = (id) => {
        fetch(`${backendUrl}/api/recipes/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                Accept: "application/json",
            },
            body: JSON.stringify({
                name: name,
                picture: picture,
                reference: reference,
                source: sourceName,
                instructions: recipeInstructions,
                // source_category_id: sourceCategoryInput,
            }),
        })
        .then((response) => response.json())
        .then((data) => {})
        ingredients && ingredients.map(ingredient => {
            const ingredientData = {
                ingredient_name: ingredient.ingredient_name,
                ingredient_quantity: ingredient.ingredient_quantity,
                ingredient_unit: ingredient.ingredient_unit,
                ingredient_note: ingredient.ingredient_note
            };
            fetch(`${backendUrl}/api/recipeingredients/${ingredient.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify(ingredientData),
            })
            .then((response) => response.json())
            .then((newIngredientData) => {
                console.log("success")
            });
        });
        const commentInfo = {
            comments: comments
        }
        recipe.user_recipes && recipe.user_recipes.filter(userRecipe => {
            userRecipe.user_id === user.id &&
            fetch(`${backendUrl}/api/userrecipes/${userRecipe.id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "Application/JSON",
                },
                body: JSON.stringify(commentInfo),
            })
            .then((response) => response.json())
            .then((newCommentData) => {
                console.log("success")
            });
        })
        window.location.reload();
    }

    const handleSubmit = (event) => {
        event.preventDefault();
        const ingredientData = {
            recipe_id: recipe.id,
            ingredient_name: newIngredient[0].name,
            ingredient_quantity: newIngredient[0].quantity,
            ingredient_unit: newIngredient[0].unit,
            ingredient_note: newIngredient[0].note
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
            setNewIngredient();
            setIngredients([...ingredients, newIngredientData]);
        });
    };

    const handleDelete = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/recipeingredients/${id}`, {
            method: "DELETE",
        })
        .then((data) => {
            setIngredients(prevIng => prevIng.filter(ing => ing.id !== id));
        })
    };

    return (
        <Box key={recipe.id} >
            <Container disableGutters maxWidth={false}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <TextField id="outlined-basic" label="Name" variant="standard" value={name} onChange={(event) => setName(event.target.value)} fullWidth/>
                    <Button variant="contained" onClick={() => handlePatch(recipe.id)}>Submit</Button>
                </div>
            </Container>
            <TextField id="outlined-basic" label="Source Name" variant="standard" value={sourceName} onChange={(event) => setSourceName(event.target.value)}/>
            <br />
            <TextField id="outlined-basic" label="Reference" variant="standard" value={reference} onChange={(event) => setReference(event.target.value)}/>
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
            <Container disableGutters maxWidth={false}>
                {recipe.recipe_tags && recipe.recipe_tags.map(tag => {
                    if (tag && tag.tag) {
                        return <Chip key={tag.tag.id} label={tag.tag.name} color="primary" sx={{ margin: '1px',}} onDelete={(event) => handleDeleteTag(event, tag.id)}/>
                    }
                })}
                {user && <UserRecipeTagsMenu recipeId={recipe.id} tags={tags} handleTagSelect={handleTagSelect} color="primary"/>}
            </Container>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
                <Paper>
                    <TextField id="outlined-basic" label="Picture" variant="standard" value={picture} onChange={(event) => setPicture(event.target.value)} fullWidth/>
                    <img src={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"} style={{ maxWidth: '500px' }}/>
                </Paper>
                <Paper sx={{ marginLeft: '10px' }}>
                    <div><strong>Ingredients</strong></div>
                    {ingredients.map((ingredient) => {
                        return <Paper key={ingredient.id}>
                            <DeleteIcon onClick={(event) => handleDelete(event, ingredient.id)}></DeleteIcon>
                            <TextField
                                label="Quantity"
                                variant="standard"
                                type="number"
                                value={ingredient.ingredient_quantity}
                                onChange={(event) => handleQuantityChange(ingredient.id, event.target.value)}
                            />
                            <Select
                                label="Measurement Unit"
                                value={ingredient.ingredient_unit}
                                onChange={(event) => handleUnitChange(ingredient.id, event.target.value)}
                            >
                                <MenuItem value=""></MenuItem>
                                <MenuItem value="Tsp">Tsp</MenuItem>
                                <MenuItem value="Tbsp">Tbsp</MenuItem>
                                <MenuItem value="Cup">Cup</MenuItem>
                                <MenuItem value="Oz">Oz</MenuItem>
                                <MenuItem value="Lb">Lb</MenuItem>
                                <MenuItem value="Lb">Dash</MenuItem>
                                <MenuItem value="Lb">Pinch</MenuItem>
                            </Select>
                            <TextField
                                // id={`ingredient-${index}`}
                                label="Ingredient"
                                variant="standard"
                                value={ingredient.ingredient_name}
                                onChange={(event) => handleNameChange(ingredient.id, event.target.value)}
                            />
                            <TextField
                                label="Ingredient Note"
                                variant="standard"
                                value={ingredient.ingredient_note}
                                onChange={(event) => handleNoteChange(ingredient.id, event.target.value)}
                            />
                        </Paper>
                    })}
                    <Button variant="contained" color="primary" size="small" startIcon={<AddIcon/>} onClick={() => setNewIngredient(emptyIngredient)}>Add Ingredient</Button>
                    {newIngredient && 
                        <Paper>
                            <form onSubmit={handleSubmit}>
                                <Ingredients key={0} index={0} ingredients={newIngredient} setIngredients={setNewIngredient}/>
                                <Button variant="contained" color="primary" size="small" type="submit">Submit</Button>
                            </form>
                        </Paper>
                    }
                </Paper>
                <Paper>
                    <div><strong>Instructions</strong></div>
                    <TextField label="Recipe Instructions" variant="standard" multiline maxRows={20} value={recipeInstructions} onChange={(event) => setRecipeInstructions(event.target.value)} sx={{ display: 'flex' }}/>
                </Paper>
                <Paper>
                    <div><strong>Comments</strong></div>
                    <TextField label="Recipe Comments" variant="standard" multiline maxRows={20} value={comments} onChange={(event) => setComments(event.target.value)} sx={{ display: 'flex' }}/>
                </Paper>
            </Box>
            <br/>
            <br/>
        </Box>
    )
}

export default RecipeEditPage