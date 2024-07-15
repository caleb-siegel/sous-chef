import React from 'react';
import { MenuItem, Paper, TextField, Select } from '@mui/material';

function Ingredients({ index, ingredients, setIngredients }) {
    
    const handleQuantityChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].quantity = event.target.value;
        setIngredients(newIngredients);
    };

    const handleUnitChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].unit = event.target.value;
        setIngredients(newIngredients);
    };

    const handleIngredientChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].name = event.target.value;
        setIngredients(newIngredients);
    };

    const handleIngredientNoteChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].note = event.target.value;
        setIngredients(newIngredients);
    };
    
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px', margin: '10px 0' }}>
            <TextField
                id={`quantity-${index}`}
                label="Quantity"
                variant="standard"
                type="number"
                value={ingredients[index].quantity}
                onChange={(event) => handleQuantityChange(event, index)}
            />
            <Select
                labelId={`unit-label-${index}`}
                id={`unit-${index}`}
                label="Measurement Unit"
                value={ingredients[index].unit}
                onChange={(event) => handleUnitChange(event, index)}
            >
                <MenuItem value=""></MenuItem>
                <MenuItem value="Tsp">Tsp</MenuItem>
                <MenuItem value="Tbsp">Tbsp</MenuItem>
                <MenuItem value="Cup">Cup</MenuItem>
                <MenuItem value="Oz">Oz</MenuItem>
                <MenuItem value="Lb">Lb</MenuItem>
                <MenuItem value="Dash">Dash</MenuItem>
                <MenuItem value="Pinch">Pinch</MenuItem>
            </Select>
            <TextField
                id={`ingredient-${index}`}
                label="Ingredient"
                variant="standard"
                value={ingredients[index].name}
                onChange={(event) => handleIngredientChange(event, index)}
            />
            <TextField
                id={`note-${index}`}
                label="Ingredient Note"
                variant="standard"
                value={ingredients[index].note}
                onChange={(event) => handleIngredientNoteChange(event, index)}
            />
        </Paper>
    );
};

export default Ingredients;