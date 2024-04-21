import React, { useState, useEffect } from 'react'
import { Container, Paper, Link, Button } from '@mui/material'
import { useOutletContext } from "react-router-dom";
import RecipePage from './RecipePage';

function RandomizeRecipe() {
    const {user} = useOutletContext();

    const [showRecipe, setShowRecipe] = useState(false)
    const [randomRecipe, setRandomRecipe] = useState([]);

    const handleRandom = () => {
        setShowRecipe(true)
        fetch(`/api/random_recipe`)
            .then((response) => response.json())
            .then((data) => setRandomRecipe(data))
    }
  
    return (
        <Container>
            <Paper sx={{ bgcolor: "primary.main", padding: '50px' }}>
                <h1>Don't Know What To Cook?</h1>
                <h2>Let Us Decide For You</h2>
                <h4>Click Button Below</h4>
                <Button color="secondary" variant="contained" onClick={handleRandom}>Random</Button>
            </Paper>
            {showRecipe && randomRecipe.recipe ? <RecipePage recipe={randomRecipe.recipe} user={user}/> : ""}
            
        </Container>
    )
}

export default RandomizeRecipe