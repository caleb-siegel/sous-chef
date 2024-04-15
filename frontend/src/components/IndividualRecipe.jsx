import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardMedia, Chip, Container, Divider, Box, Paper, Badge, IconButton, Typography } from '@mui/material';
import UserRecipeTagsPopover from './UserRecipeTagsPopover';
import AddToMealPrep from './AddToMealPrep';
import { useOutletContext } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';


function IndividualRecipe() {
    const {user} = useOutletContext();
    const { id } = useParams();
    
    const [recipe, setRecipe] = useState([]);
    useEffect(() => {
        fetch(`/api/recipes/${id}`)
        .then((response) => response.json())
        .then((data) => setRecipe(data));
    }, []);
  
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
                        />
                    ))
                }
                <AddToMealPrep user={user} recipeId={recipe.id}/>
            </Container>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
                <Paper>
                    <img src={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"} style={{ maxWidth: '500px' }}/>
                </Paper>
                <Paper sx={{ marginLeft: '10px' }}>
                    <Container>Ingredients</Container>
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ingredient => {
                        return <li key={ingredient.id}>{ingredient.ingredient_quantity} {ingredient.ingredient_unit} {ingredient.ingredient_name} <em>{ingredient.ingredient_note && ingredient.ingredient_note}</em></li>
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

export default IndividualRecipe