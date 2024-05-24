import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardMedia, Chip, Container, Divider, Box, Paper, Badge, IconButton, Typography } from '@mui/material';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import AddToMealPrep from './AddToMealPrep';
import { useOutletContext } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecipePage from './RecipePage';
import RecipeEditPage from './RecipeEditPage';


function IndividualRecipe() {
    const {user} = useOutletContext();
    const { id } = useParams();
    
    const [recipe, setRecipe] = useState([]);
    useEffect(() => {
        fetch(`/api/recipes/${id}`)
        .then((response) => response.json())
        .then((data) => setRecipe(data));
    }, []);

    const [editRecipe, setEditRecipe] = useState(false)

    const handleEditRecipe = () => {
        setEditRecipe(!editRecipe)
    }
  
    return (
        !editRecipe ? <RecipePage recipe={recipe} user={user} id={id} editRecipe={editRecipe} handleEditRecipe={handleEditRecipe}/> : <RecipeEditPage recipe={recipe} user={user} id={id} editRecipe={editRecipe} setEditRecipe={setEditRecipe}/>
    )
}

export default IndividualRecipe