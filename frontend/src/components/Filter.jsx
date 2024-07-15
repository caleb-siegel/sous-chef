import React from 'react';
import { Radio, RadioGroup, FormControlLabel, FormControl, FormLabel, TextField, Paper, InputLabel, MenuItem, Select } from '@mui/material';

function Filter({ filterValue, handleFilterValueChange, filterType, handleFilterTypeChange, filterBy, handleFilterByChange, tags, userTags }) {
  
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px', width: '450px'}}>
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
                    <FormControlLabel value="recipeName" control={<Radio />} label="Name" />
                    <FormControlLabel value="ingredients" control={<Radio />} label="Ingredients" />
                    <FormControlLabel value="tag" control={<Radio />} label="Tag" />
                    <FormControlLabel value="usertag" control={<Radio />} label="User Tag" />
                </RadioGroup>
                {(filterBy === "recipeName" || filterBy === "ingredients") && 
                    <TextField id="outlined-basic" label="Filter" variant="standard" value={filterValue} onChange={handleFilterValueChange}/>
                }
                {filterBy === "tag" &&
                    <div>
                        <InputLabel id="demo-simple-select-label"></InputLabel>
                        <Select
                            labelId="demo-simple-select-label"
                            id="demo-simple-select"
                            value={filterValue}
                            label="Tag"
                            onChange={handleFilterValueChange}
                        >
                            {tags.map(tag => {
                                return <MenuItem key={tag.id} value={tag.name}>{tag.name}</MenuItem>
                            })}
                        </Select>
                    </div>
                }
                {filterBy === "usertag" &&
                    <div>
                        <InputLabel id="user-tag"></InputLabel>
                        <Select
                            labelId="user-tag-select"
                            id="demo-simple-select-user-tag"
                            value={filterValue}
                            label="userTag"
                            onChange={handleFilterValueChange}
                        >
                            {userTags.map(tag => {
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