import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardMedia, Chip, Container, Divider, Box, Paper, Badge, IconButton, Typography, Select, MenuItem, InputLabel } from '@mui/material';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import AddToMealPrep from './AddToMealPrep';
import { useOutletContext } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecipeCardsOptions from './RecipeCardsOptions';

function RecipePage({ recipe, user, id }) {
    const [dimensions, setDimensions] = useState(1)
    
    const handleDimensions = (event) => {
        setDimensions(event.target.value)
    }

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch("/api/usertags")
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, []);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null) {
            fetch('/api/userrecipetags', {
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
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        };        
        handleClose();
    };

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`/api/userrecipetags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {})
      };

    return (
        <Box key={recipe.id} >
            <Container>
                <Typography variant="h1" color="secondary" >{recipe.name}</Typography>
                <Badge badgeContent={recipe && recipe.user_recipes && recipe.user_recipes.length} color="primary">
                    <FavoriteIcon color="action" />
                </Badge>
            </Container>
            <Container>
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
                {user && <UserRecipeTagsMenu recipeId={recipe.id} userTags={userTags} handleTagSelect={handleTagSelect}/>}
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
                    <Container>Ingredients</Container>
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ingredient => {
                        return <li key={ingredient.id}>{ingredient.ingredient_quantity === 0 ? "" : (ingredient.ingredient_quantity * dimensions)} {ingredient.ingredient_unit} {ingredient.ingredient_name} <em>{ingredient.ingredient_note && ingredient.ingredient_note}</em></li>
                    })}
                </Paper>
                <Paper sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Container>Instructions</Container>
                    {recipe.instructions && 
                        recipe.instructions.split(/\d+\./).filter(instruction => instruction.trim() !== "").map((instruction, index) => {
                            return <div key={index}>{index + 1}.{instruction}</div>;
                        })
                    }
                </Paper>
            </Box>
            <br/>
            <br/>
        </Box>
    )
}

export default RecipePage