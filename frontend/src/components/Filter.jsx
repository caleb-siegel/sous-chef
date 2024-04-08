import React, { useState } from 'react';
import Radio from '@mui/material/Radio';
import RadioGroup from '@mui/material/RadioGroup';
import FormControlLabel from '@mui/material/FormControlLabel';
import FormControl from '@mui/material/FormControl';
import FormLabel from '@mui/material/FormLabel';
import { Container } from '@mui/material';
import TextField from '@mui/material/TextField';
import Paper from '@mui/material/Paper';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';


function Filter({ filterValue, handleFilterValueChange, filterType, handleFilterTypeChange, filterBy, handleFilterByChange, tags }) {
  
    const handleAddFilter = () => {

    }
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px', width: '250px'}}>
            <FormControl>
            <FormLabel id="demo-row-radio-buttons-group-label">Filter:</FormLabel>
            <RadioGroup
                row
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
                value={filterType}
                onChange={handleFilterTypeChange}
            >
                <FormControlLabel value="include" control={<Radio />} label="Include" />
                <FormControlLabel value="exclude" control={<Radio />} label="Exclude" />
            </RadioGroup>
            </FormControl>
            <br />
            <FormControl>
                <FormLabel id="demo-row-radio-buttons-group-label">Filter by:</FormLabel>
                <RadioGroup
                    row
                    aria-labelledby="demo-row-radio-buttons-group-label"
                    name="row-radio-buttons-group"
                    value={filterBy}
                    onChange={handleFilterByChange}
                >
                    <FormControlLabel value="recipeName" control={<Radio />} label="Recipe Name" />
                    <FormControlLabel value="tag" control={<Radio />} label="Tag" />
                    <FormControlLabel value="ingredients" control={<Radio />} label="Ingredients" />
                </RadioGroup>
                {(filterBy === "recipeName" || filterBy === "ingredients") && 
                    <TextField id="outlined-basic" label="Filter" variant="standard" value={filterValue} onChange={handleFilterValueChange}/>
                }
                {filterBy === "tag" &&
                    <div>
                        <InputLabel id="demo-simple-select-label">Tag</InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filterValue}
                            label="Source Category"
                            onChange={handleFilterValueChange}
                        >
                            {tags.map(tag => {
                                return <MenuItem key={tag.id} value={tag.name}>{tag.name}</MenuItem>

                            })}
                        </Select>
                    </div>
                }
            </FormControl>
            <br />
            {/* <br />
            <Button variant="contained" color="primary" startIcon={<AddIcon/>} onClick={handleAddFilter}>Add Another Filter</Button> */}
        </Paper>
    );
}

export default Filter;