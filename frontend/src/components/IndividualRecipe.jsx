import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom';
import { useOutletContext } from "react-router-dom";
import { Box, CircularProgress, Container, Alert } from '@mui/material';
import RecipePage from './RecipePage';
import RecipeEditPage from './RecipeEditPage';

function IndividualRecipe() {
    const { user, backendUrl } = useOutletContext();
    const { id } = useParams();
    
    const [recipe, setRecipe] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [editRecipe, setEditRecipe] = useState(false);

    useEffect(() => {
        setLoading(true);
        setError(null);
        fetch(`${backendUrl}/api/recipes/${id}`)
        .then((response) => {
            if (!response.ok) {
                throw new Error(`Failed to load recipe (status: ${response.status})`);
            }
            return response.json();
        })
        .then((data) => {
            setRecipe(data);
            setLoading(false);
        })
        .catch((err) => {
            console.error("Error fetching recipe:", err);
            setError(err.message || "Error loading recipe");
            setLoading(false);
        });
    }, [backendUrl, id]);

    const handleEditRecipe = () => {
        setEditRecipe(!editRecipe)
    }

    if (loading) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
                <CircularProgress color="secondary" size={60} />
            </Box>
        );
    }

    if (error) {
        return (
            <Container sx={{ py: 4 }}>
                <Alert severity="error">{error}</Alert>
            </Container>
        );
    }

    if (!recipe || !recipe.id) {
        return null;
    }

    return (
        !editRecipe ? 
        <RecipePage 
            key={recipe.id}
            recipe={recipe} 
            user={user} 
            id={id} 
            editRecipe={editRecipe} 
            handleEditRecipe={handleEditRecipe}
        /> 
        : <RecipeEditPage 
            key={recipe.id}
            recipe={recipe} 
            user={user} 
            id={id} 
            editRecipe={editRecipe} 
            setEditRecipe={setEditRecipe}
        />
    )
}

export default IndividualRecipe