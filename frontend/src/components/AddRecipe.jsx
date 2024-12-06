import React, { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import Tag from "./Tag";
import Ingredients from "./Ingredients";
import { Button, TextField, InputLabel, MenuItem, Select, Paper } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

function AddRecipe({ setRecipes, recipes, handleAddRecipe, tags }) {
    const [name, setName] = useState("");
    const [picture, setPicture] = useState("");
    const [sourceCategoryInput, setSourceCategoryInput] = useState("");
    const [sourceName, setSourceName] = useState("");
    const [reference, setReference] = useState("");
    const [recipeInstructions, setRecipeInstructions] = useState("");
    const {user} = useOutletContext();
    const emptyIngredient = { quantity: 0, unit: '', name: '', note: '' };
    const [ingredients, setIngredients] = useState([emptyIngredient]);

    const [sourceCategories, setSourceCategories] = useState([]);
    useEffect(() => {
        fetch("/api/category_names")
        .then((response) => response.json())
        .then((data) => setSourceCategories(data));
    }, []);

    const [selectedTags, setSelectedTags] = useState([]);

    const handleTagChange = (event, newValue) => {
        event.preventDefault();
        setSelectedTags(newValue);
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
        fetch("/api/recipes", {
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
                    fetch("/api/recipetags", {
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
                        ingredient_name: ingredient.name,
                        ingredient_quantity: ingredient.quantity,
                        ingredient_unit: ingredient.unit,
                        ingredient_note: ingredient.note
                    };
                    fetch("/api/recipeingredients", {
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