import React, { useState, useEffect } from "react";
import { Container, Paper, Button, Stack, Avatar, Skeleton, Box, Typography } from "@mui/material";
import { Link } from "react-router-dom"
import { ImageList, ImageListItem, ListSubheader, ImageListItemBar } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
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
            {/* <div style={{ width: '100%', maxWidth: '100%'  }}>
                <div style={{ position: 'relative' }}>
                    <img style={{ maxWidth: '100vw' }} src="https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?cs=srgb&dl=pexels-ella-olsson-572949-1640774.jpg&fm=jpg" alt="Your image" />
                    <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', textAlign: 'center', color: 'primary' }}>
                        <h2>Welcome to Sous Chef</h2>
                        <h2>Your all-in-one kitchen assistant</h2>
                        <h4>Digital cookbook and meal prep guide</h4>
                        {!user ?
                            <Link to="login">
                                <Button color="primary" variant="contained">Log In</Button>
                            </Link>
                        : 
                            <Link to="recipes">
                                <Button color="primary" variant="contained">See Recipes</Button>
                            </Link>
                        }
                    </div>
                </div>
            </div> */}

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