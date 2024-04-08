import React from "react";
import Navbar from "./Navbar";
import { Container } from "@mui/material";

function Error() {
    return (
        <Container>
            <Navbar /> 
            <h1>The page you are looking for doesn't exist. Please try again.</h1>
        </Container>
    )
}

export default Error;