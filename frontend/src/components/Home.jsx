import React, { useState, useEffect } from "react";
import { Container, Paper, Button, Stack, Avatar, Typography, Alert, CircularProgress, ButtonGroup, Box } from "@mui/material";
import { Link } from "react-router-dom"
import { useOutletContext } from "react-router-dom";
import HomeSkeleton from "./HomeSkeleton";

function Home() {
    const {user} = useOutletContext();
    const { backendUrl } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [recipes, setRecipes] = useState([]);
    const [category, setCategory] = useState('dessert');

    const fetchRecipes = async (selectedCategory) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching recipes for category:', selectedCategory); // Debug log
            
            const url = selectedCategory === 'all' 
                ? `${backendUrl}/api/recipes`
                : `${backendUrl}/api/recipes?category=${selectedCategory}`;
            
            console.log('Fetching from URL:', url); // Debug log
            
            const response = await fetch(url, {
                credentials: 'include', // This is important for CORS
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            console.log('Received data:', data); // Debug log
            setRecipes(data);
        } catch (err) {
            console.error("Error fetching recipes:", err);
            setError(err.message || 'Failed to fetch recipes');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRecipes('all');
    }, [backendUrl]);

    const handleCategoryChange = (newCategory) => {
        setCategory(newCategory);
        fetchRecipes(newCategory);
    };

    const dimension = 150;

    return (
        <Container disableGutters maxWidth={false}>
            <Paper sx={{ bgcolor: "primary.main", width: '100%', maxWidth: '100%'  }}>
                <div style={{ padding: '10px' }}>
                    <h2>Welcome to Sous Chef</h2>
                    <h2>Your all-in-one kitchen assistant</h2>
                    <h4>Digital cookbook and meal prep guide</h4>
                    {!user ?
                        <Link to="login">
                            <Button color="secondary" variant="contained">Log In</Button>
                        </Link>
                    :
                        <Link to="recipes">
                            <Button color="secondary" variant="contained">See Recipes</Button>
                        </Link>
                    }
                </div>
            </Paper>

            <Container disableGutters maxWidth={false} sx={{ padding: "20px" }}>
                <Stack spacing={2}>
                    <ButtonGroup variant="contained" color="secondary">
                        <Button 
                            onClick={() => handleCategoryChange('all')}
                            variant={category === 'all' ? 'contained' : 'outlined'}
                            disabled={loading}
                        >
                            All
                        </Button>
                        <Button 
                            onClick={() => handleCategoryChange('breakfast')}
                            variant={category === 'breakfast' ? 'contained' : 'outlined'}
                            disabled={loading}
                        >
                            Breakfast
                        </Button>
                        <Button 
                            onClick={() => handleCategoryChange('lunch')}
                            variant={category === 'lunch' ? 'contained' : 'outlined'}
                            disabled={loading}
                        >
                            Lunch
                        </Button>
                        <Button 
                            onClick={() => handleCategoryChange('dinner')}
                            variant={category === 'dinner' ? 'contained' : 'outlined'}
                            disabled={loading}
                        >
                            Dinner
                        </Button>
                    </ButtonGroup>

                    {/* Loading indicator */}
                    {loading && (
                        <Box sx={{ 
                            display: 'flex', 
                            alignItems: 'center', 
                            gap: 2,
                            bgcolor: 'rgba(0, 0, 0, 0.05)',
                            p: 2,
                            borderRadius: 1
                        }}>
                            <CircularProgress size={24} color="secondary" />
                            <Typography variant="body1">Loading recipes for {category}...</Typography>
                        </Box>
                    )}

                    {/* Error message */}
                    {error && (
                        <Alert 
                            severity="error" 
                            sx={{ mt: 2 }}
                            action={
                                <Button 
                                    color="inherit" 
                                    size="small"
                                    onClick={() => fetchRecipes(category)}
                                >
                                    RETRY
                                </Button>
                            }
                        >
                            {error}
                        </Alert>
                    )}

                    {/* Recipes grid */}
                    <div>
                        <Typography variant="h4" color="secondary" gutterBottom>
                            {loading ? 'Current recipes:' : 'Check out our recipes:'}
                        </Typography>
                        <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mt: 2 }}>
                            {recipes.map(recipe => {
                                return recipe.picture !== "" && 
                                <a href={`/recipes/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                                    <Avatar alt={recipe.name} src={recipe.picture} sx={{ width: dimension, height: dimension }}/>
                                </a>
                            })}
                        </Stack>
                    </div>
                </Stack>
            </Container>
        </Container>
    )
}

export default Home;