import React, { useState, useEffect } from "react";
import { Container, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom"
import { ImageList, ImageListItem, ListSubheader, ImageListItemBar } from "@mui/material";
import IconButton from '@mui/material/IconButton';
import InfoIcon from '@mui/icons-material/Info';
import { useOutletContext } from "react-router-dom";

function Home() {
    const {user} = useOutletContext();

    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/recipes")
        .then((response) => response.json())
        .then((data) => setRecipes(data));
    }, []);

    return (
        <Container>
            <Paper sx={{ bgcolor: "primary.main", padding: '50px' }}>
                <h1>Welcome to Sous Chef</h1>
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
            </Paper>
        </Container>
    )
}

export default Home;