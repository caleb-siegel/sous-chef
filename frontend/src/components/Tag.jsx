import React from 'react'
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import CheckBoxIcon from '@mui/icons-material/CheckBox';


function Tag({ tags, selectedTags, handleTagChange }) {
    
    const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
    const checkedIcon = <CheckBoxIcon fontSize="small" />;
    
    return (
        <Autocomplete
            multiple
            id="checkboxes-tags-demo"
            options={tags}
            disableCloseOnSelect
            getOptionLabel={(option) => option.name}
            value={selectedTags}
            onChange={handleTagChange}
            renderOption={(props, option, { selected }) => (
                <li {...props}>
                    <Checkbox
                        icon={icon}
                        checkedIcon={checkedIcon}
                        style={{ marginRight: 8 }}
                        checked={selected}
                    />
                    {option.name}
                </li>
            )}
            style={{ width: 200 }}
            renderInput={(params) => (
                <TextField {...params} label="tags" placeholder="tags" />
            )}
        />
    )
}

export default Tag;

