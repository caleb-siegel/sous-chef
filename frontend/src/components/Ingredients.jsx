import React, { useState } from 'react'
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { MenuItem, Paper, TextField } from '@mui/material';
import Select from '@mui/material/Select';

function Ingredients() {
    const [ingredients, setIngredients] = useState([])

    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px'}}>
            <TextField id="outlined-basic" label="Quantity" variant="standard" type="number"/>
            <Select
                labelId="demo-simple-select-label"
                id="demo-simple-select"
                label="Measurement Unit"
                value={ingredients}
            >
                <MenuItem value="Tsp">Tsp</MenuItem>
                <MenuItem value="Tsp">Tbsp</MenuItem>
                <MenuItem value="Tsp">Cup</MenuItem>
                <MenuItem value="Tsp">Oz</MenuItem>
                <MenuItem value="Tsp">Lb</MenuItem>
            </Select>
            <TextField id="outlined-basic" label="Ingredient" variant="standard"/>
        </Paper>
    )
}

export default Ingredients