import React from 'react'
import { Checkbox, TextField, Autocomplete } from '@mui/material';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


function Tag({ tags, selectedTags, handleTagChange }) {
    
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    
    return (
        <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={tags || []}
            disableCloseOnSelect
            getOptionLabel={(option) => (typeof option === 'string' ? option : option.name || '')}
            value={selectedTags || []}
            onChange={handleTagChange}
            renderOption={(props, option, { selected }) => (
                <li {...props} key={option.id || option.name}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option.name}
                </li>
            )}
            fullWidth
            renderInput={(params) => (
                <TextField 
                    {...params} 
                    label="Recipe Tags" 
                    placeholder="Choose tags (e.g. Dinner, Quick, Healthy)..." 
                    size="small"
                />
            )}
        />
    )
}

export default Tag;