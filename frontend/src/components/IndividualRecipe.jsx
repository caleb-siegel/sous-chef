import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardMedia, Chip, Container, Divider, Box, Paper, Badge, IconButton } from '@mui/material';
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
                {recipe.name}
                <Badge badgeContent={recipe && recipe.user_recipes && recipe.user_recipes.length} color="primary">
                    <FavoriteIcon color="action" />
                </Badge>
            </Container>
            <Container>
                {recipe.recipe_tags && recipe.recipe_tags.map(tag => {
                    if (tag && tag.tag) {
                        return <Chip key={tag.tag.id} label={tag.tag.name} color="primary" sx={{ margin: '1px'}}/>
                    }
                })}
                {recipe.user_recipe_tags && recipe.user_recipe_tags.map(user_recipe_tag => {
                    if (user_recipe_tag) {
                        return <Chip key={user_recipe_tag.id} label={user_recipe_tag.user_tag.name} color="secondary" sx={{ margin: '1px'}}/>
                    }
                })}
                <AddToMealPrep user={user} recipeId={recipe.id}/>
            </Container>
            <Container>
                <img src={recipe.picture} style={{ maxWidth: '500px' }}/>
            </Container>
            <Paper>
                <Container>Ingredients</Container>
                {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ingredient => {
                    return <li key={ingredient.id}>{ingredient.ingredient_quantity} {ingredient.ingredient_unit} {ingredient.ingredient_name} <em>{ingredient.ingredient_note && ingredient.ingredient_note}</em></li>
                })}
            </Paper>
            <br/>
            <Container>
                <Container>Instructions</Container>
                {recipe.instructions && 
                    recipe.instructions.split(/\d+\./).map((instruction, index) => {
                        return <div key={index}>{index}.{instruction}</div>;
                    })
                }
            </Container>
        </Box>
    )
}

export default IndividualRecipe