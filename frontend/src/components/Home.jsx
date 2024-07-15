import React, { useState, useEffect } from "react";
import { Container, Paper, Button, Stack, Avatar, Typography } from "@mui/material";
import { Link } from "react-router-dom"
import { useOutletContext } from "react-router-dom";
import HomeSkeleton from "./HomeSkeleton";

function Home() {
    const {user} = useOutletContext();
    const [loading, setLoading] = useState(true);

    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/recipes")
        .then((response) => response.json())
        .then((data) => {
            setRecipes(data)
            setLoading(false);
        })
    }, []);

    const dimension = 150

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

            {!loading ? (
                <Container disableGutters maxWidth={false} sx={{ padding: "10px" }}>
                    <Typography variant="h1" color="secondary">Check out our recipes:</Typography>
                    <Stack direction="row" sx={{ display: 'flex', flexWrap: 'wrap' }}>
                        {recipes.map(recipe => {
                            return recipe.picture !== "" && 
                            <a href={`/recipes/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                                <Avatar alt={recipe.name} src={recipe.picture} sx={{ width: dimension, height: dimension }}/>
                            </a>
                        })}
                    </Stack>
                </Container>
            )
            :
            <Container disableGutters maxWidth={false}>
                <HomeSkeleton dimension={dimension}/>
            </Container>
            }
        </Container>
    )
}

export default Home;