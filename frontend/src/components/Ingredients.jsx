import React from 'react';
import { MenuItem, TextField, Select, IconButton, Autocomplete, Box } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

function Ingredients({ index, ingredients, setIngredients, canonicalIngredients = [] }) {
    
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

    const handleIngredientNameChange = (val, option) => {
        const newIngredients = [...ingredients];
        if (option && typeof option === 'object' && option.name) {
            newIngredients[index].ingredient_name = option.name;
            newIngredients[index].ingredient_id = option.id;
            if (option.default_unit && !newIngredients[index].ingredient_unit) {
                newIngredients[index].ingredient_unit = option.default_unit;
            }
        } else {
            const strVal = typeof val === 'string' ? val : (option?.name || '');
            newIngredients[index].ingredient_name = strVal;
            const match = canonicalIngredients.find(
                ci => ci.name && ci.name.toLowerCase() === strVal.trim().toLowerCase()
            );
            newIngredients[index].ingredient_id = match ? match.id : null;
            if (match && match.default_unit && !newIngredients[index].ingredient_unit) {
                newIngredients[index].ingredient_unit = match.default_unit;
            }
        }
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

            <Autocomplete
                id={`ingredient-${index}`}
                freeSolo
                options={canonicalIngredients}
                getOptionLabel={(option) => {
                    if (typeof option === 'string') return option;
                    return option?.name || '';
                }}
                value={ingredients[index].ingredient_name || ''}
                onChange={(event, newValue) => {
                    if (typeof newValue === 'string') {
                        handleIngredientNameChange(newValue, null);
                    } else if (newValue && newValue.name) {
                        handleIngredientNameChange(newValue.name, newValue);
                    } else {
                        handleIngredientNameChange('', null);
                    }
                }}
                onInputChange={(event, newInputValue, reason) => {
                    if (reason === 'input') {
                        handleIngredientNameChange(newInputValue, null);
                    }
                }}
                renderInput={(params) => (
                    <TextField
                        {...params}
                        label="Ingredient Name"
                        placeholder="e.g. Olive Oil, Garlic"
                        variant="outlined"
                        size="small"
                    />
                )}
                renderOption={(props, option) => (
                    <li {...props} key={option.id || option.name}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
                            <span style={{ fontWeight: 600 }}>{option.name}</span>
                            {option.category && (
                                <span style={{ 
                                    fontSize: '0.72rem', 
                                    padding: '2px 8px', 
                                    borderRadius: '6px', 
                                    backgroundColor: 'rgba(63, 255, 194, 0.12)', 
                                    color: '#059669',
                                    fontWeight: 600 
                                }}>
                                    {option.category.name}
                                </span>
                            )}
                        </Box>
                    </li>
                )}
                sx={{ flex: 2, minWidth: 180 }}
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