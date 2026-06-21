import React from 'react';
import { MenuItem, Paper, TextField, Select, IconButton } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Ingredients({ index, ingredients, setIngredients }) {
    
    const handleQuantityChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].ingredient_quantity = parseFloat(event.target.value);
        setIngredients(newIngredients);
    };

    const handleUnitChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].ingredient_unit = event.target.value;
        setIngredients(newIngredients);
    };

    const handleIngredientChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].ingredient_name = event.target.value;
        setIngredients(newIngredients);
    };

    const handleIngredientNoteChange = (event) => {
        const newIngredients = [...ingredients];
        newIngredients[index].ingredient_note = event.target.value;
        setIngredients(newIngredients);
    };

    const handleDeleteIngredient = () => {
        const newIngredients = ingredients.filter((_, idx) => idx !== index);
        setIngredients(newIngredients);
    };
    
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px', margin: '10px 0', position: 'relative' }}>
            <IconButton 
                aria-label="delete ingredient"
                onClick={handleDeleteIngredient}
                sx={{ 
                    position: 'absolute', 
                    top: 8, 
                    right: 8, 
                    color: 'rgba(0, 0, 0, 0.54)',
                    '&:hover': {
                        color: '#d32f2f',
                        backgroundColor: 'rgba(211, 47, 47, 0.04)'
                    }
                }}
            >
                <DeleteIcon />
            </IconButton>
            
            <TextField
                id={`quantity-${index}`}
                label="Quantity"
                variant="standard"
                type="number"
                value={ingredients[index].ingredient_quantity}
                onChange={handleQuantityChange}
                sx={{ mr: 2, width: '100px' }}
            />
            <Select
                labelId={`unit-label-${index}`}
                id={`unit-${index}`}
                label="Measurement Unit"
                value={ingredients[index].ingredient_unit}
                onChange={handleUnitChange}
                sx={{ mr: 2, minWidth: '100px', verticalAlign: 'bottom' }}
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
                value={ingredients[index].ingredient_name}
                onChange={handleIngredientChange}
                sx={{ mr: 2, minWidth: '200px' }}
            />
            <TextField
                id={`note-${index}`}
                label="Ingredient Note"
                variant="standard"
                value={ingredients[index].ingredient_note}
                onChange={handleIngredientNoteChange}
                sx={{ minWidth: '200px' }}
            />
        </Paper>
    );
};

export default Ingredients;