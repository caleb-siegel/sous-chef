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
        <div className="ar-ingredient-row">
            <TextField
                id={`quantity-${index}`}
                label="Qty"
                placeholder="1"
                variant="outlined"
                type="number"
                inputProps={{ step: "any", min: "0" }}
                size="small"
                value={ingredients[index].ingredient_quantity || ''}
                onChange={handleQuantityChange}
            />
            <Select
                id={`unit-${index}`}
                size="small"
                displayEmpty
                value={ingredients[index].ingredient_unit || ''}
                onChange={handleUnitChange}
            >
                <MenuItem value=""><em>Unit</em></MenuItem>
                <MenuItem value="Tsp">Tsp</MenuItem>
                <MenuItem value="Tbsp">Tbsp</MenuItem>
                <MenuItem value="Cup">Cup</MenuItem>
                <MenuItem value="Oz">Oz</MenuItem>
                <MenuItem value="Lb">Lb</MenuItem>
                <MenuItem value="G">g</MenuItem>
                <MenuItem value="Kg">kg</MenuItem>
                <MenuItem value="Ml">ml</MenuItem>
                <MenuItem value="Liter">L</MenuItem>
                <MenuItem value="Pinch">Pinch</MenuItem>
                <MenuItem value="Dash">Dash</MenuItem>
                <MenuItem value="Clove">Clove</MenuItem>
                <MenuItem value="Slice">Slice</MenuItem>
                <MenuItem value="Can">Can</MenuItem>
            </Select>
            <TextField
                id={`ingredient-${index}`}
                label="Ingredient Name"
                placeholder="e.g. Olive Oil"
                variant="outlined"
                size="small"
                value={ingredients[index].ingredient_name || ''}
                onChange={handleIngredientChange}
            />
            <TextField
                id={`note-${index}`}
                label="Prep / Note (opt)"
                placeholder="e.g. minced, room temp"
                variant="outlined"
                size="small"
                value={ingredients[index].ingredient_note || ''}
                onChange={handleIngredientNoteChange}
            />
            <IconButton 
                aria-label="delete ingredient"
                onClick={handleDeleteIngredient}
                size="small"
                className="ar-del-row-btn"
                title="Remove ingredient"
            >
                <DeleteIcon fontSize="small" />
            </IconButton>
        </div>
    );
};

export default Ingredients;