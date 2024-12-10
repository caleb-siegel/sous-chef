import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Chip, Container, Box, Paper, Badge, Typography, Select, MenuItem, InputLabel } from '@mui/material';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import AddToMealPrep from './AddToMealPrep';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecipeCardsOptions from './RecipeCardsOptions';
import { useOutletContext } from "react-router-dom";

function RecipePage({ recipe, user, editRecipe, handleEditRecipe }) {
    const { backendUrl } = useOutletContext();
    const navigate = useNavigate();
    
    const [dimensions, setDimensions] = useState(1)
    
    const handleDimensions = (event) => {
        setDimensions(event.target.value)
    }

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/usertags`)
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, []);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null) {
            fetch(`${backendUrl}/api/userrecipetags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then((response) => response.json())
            .then(response => {
                console.log('User tag posted successfully:', response.data);
                recipe.user_recipe_tags.push(response.data)
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        };        
        handleClose();
    };

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/userrecipetags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {})
      };

    const handleDeleteRecipe = (event, id) => {
        event.preventDefault();
        const confirmed = window.confirm(
            "Are you sure you want to delete this item?"
        );
        if (confirmed) {
            fetch(`${backendUrl}/api/recipes/${id}`, {
                method: "DELETE",
            })
            .then((data) => {
                alert("You have deleted the recipe")
                navigate('/recipes')
            })
        }
    }

    const properComment = recipe.user_recipes && recipe.user_recipes.filter(comment => comment && user && comment.user_id === user.id);
    
    return (
        <Box key={recipe.id} >
            <Container disableGutters maxWidth={false}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <Typography variant="h1" color="secondary" >{recipe.name}</Typography>
                    {user && user.id === 2 && <RecipeCardsOptions handleDelete={handleDeleteRecipe} recipeId={recipe.id} editRecipe={editRecipe} handleEditRecipe={handleEditRecipe}/>}
                </div>
                <Badge badgeContent={recipe && recipe.user_recipes && recipe.user_recipes.length} color="primary">
                    <FavoriteIcon color="action" />
                </Badge>
            </Container>
            {recipe.source_category_id === 2 ? <div>This recipe is from {recipe.source} and can be found on Page {recipe.reference}.</div> : <div>This recipe was sourced from {recipe.source}</div>}
            <Container disableGutters maxWidth={false}>
                {recipe.recipe_tags && recipe.recipe_tags.map(tag => {
                    if (tag && tag.tag) {
                        return <Chip key={tag.tag.id} label={tag.tag.name} color="primary" sx={{ margin: '1px',}}/>
                    }
                })}
                {recipe.user_recipe_tags && recipe.user_recipe_tags
                    .filter(user_recipe_tag => (user && user.id && (user_recipe_tag.user_id === user.id)))
                    .map(user_recipe_tag => (
                        user_recipe_tag && user_recipe_tag.id && user_recipe_tag.user_tag &&
                        <Chip
                            key={user_recipe_tag.id}
                            size="small"
                            label={user_recipe_tag.user_tag.name}
                            color="secondary"
                            sx={{ margin: '1px'}}
                            onDelete={(event) => handleDeleteUserTag(event, user_recipe_tag.id)}
                        />
                    ))
                }
                {user && <UserRecipeTagsMenu recipeId={recipe.id} tags={userTags} handleTagSelect={handleTagSelect} color="secondary"/>}
                <AddToMealPrep user={user} recipeId={recipe.id}/>
            </Container>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
                <Paper>
                    <img src={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"} style={{ maxWidth: '500px' }}/>
                </Paper>
                <Paper sx={{ marginLeft: '10px' }}>
                    <InputLabel id="dimensions-input-label">Dimensions</InputLabel>
                    <Select
                        labelId={`${recipe.id}`}
                        id={`${recipe.id}`}
                        label="Dimensions"
                        value={dimensions}
                        onChange={(event) => handleDimensions(event)}
                        size="small"
                    >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="0.5">0.5x</MenuItem>
                        <MenuItem value="1">1x</MenuItem>
                        <MenuItem value="2">2x</MenuItem>
                        <MenuItem value="5">5x</MenuItem>
                        <MenuItem value="10">10x</MenuItem>
                    </Select>
                    <div><strong>Ingredients</strong></div>
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ingredient => {
                        return <li key={ingredient.id}>{ingredient.ingredient_quantity === 0 ? "" : (ingredient.ingredient_quantity * dimensions)} {ingredient.ingredient_unit} {ingredient.ingredient_name} <em>{ingredient.ingredient_note && ingredient.ingredient_note}</em></li>
                    })}
                </Paper>
                <Paper sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Container disableGutters maxWidth={false}><strong>Instructions</strong></Container>
                    {recipe.instructions && 
                        recipe.instructions.split(/\s\d+\.\s/).filter(instruction => instruction.trim() !== "").map((instruction, index) => {
                            return  <Container disableGutters maxWidth={false} key={index}>{index + 1}. {instruction}</Container>;
                        })
                    }
                </Paper>
                    <Paper>
                        <Container disableGutters maxWidth={false}><strong>Comments</strong></Container>
                        <Container disableGutters maxWidth={false} >{`${user && user.name}'s Comments: ${properComment && properComment[0] && properComment[0].comments}`}</Container>
                    </Paper>
            </Box>
            <br/>
            <br/>
        </Box>
    )
}

export default RecipePage