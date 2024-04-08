import React from "react";
import { Container, Paper } from "@mui/material";
import Button from "@mui/material/Button";
import { Link } from "react-router-dom"

function Home() {
    return (
        <Container>
            <Paper sx={{ bgcolor: "primary.main", padding: '50px' }}>
                <h1>Welcome to Sous Chef</h1>
                <h2>Your all-in-one kitchen assistant</h2>
                <h4>Digital cookbook and meal prep guide</h4>
                <Link to="login">
                    <Button color="secondary" variant="contained">Log In</Button>
                </Link>            
            </Paper>
        </Container>
    )
}

export default Home;