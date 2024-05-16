import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { Card, CardHeader, CardMedia, Chip, Container, Divider, Box, Paper, Badge, IconButton, Typography } from '@mui/material';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import AddToMealPrep from './AddToMealPrep';
import { useOutletContext } from "react-router-dom";
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecipePage from './RecipePage';


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
        <RecipePage recipe={recipe} user={user} id={id}/>
    )
}

export default IndividualRecipe