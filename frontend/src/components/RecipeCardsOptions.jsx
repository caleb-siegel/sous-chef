import React, { useState } from 'react'
import { IconButton, Popover, Select, MenuItem, Menu } from "@mui/material";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';

function RecipeCardsOptions({ handleDelete, recipeId }) {
    const [recipeOptionsAnchorEl, setRecipeOptionsAnchorEl] = useState(null);

    const handleClick = (event) => {
        event.preventDefault();
        setRecipeOptionsAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setRecipeOptionsAnchorEl(null);
    };

    const open = Boolean(recipeOptionsAnchorEl);

    return (
        <div>
            <IconButton onClick={handleClick} id="icon-button">
                <MoreVertIcon/>
            </IconButton>
            <Menu
                id="basic-menu"
                anchorEl={recipeOptionsAnchorEl}
                open={open}
                onClose={handleClose}
                MenuListProps={{
                'aria-labelledby': 'icon-button',
                }}
            >
                <MenuItem key="edit" value="edit"><EditIcon/></MenuItem>
                <MenuItem key="delete" value="delete" onClick={(event) => handleDelete(event, recipeId)}><DeleteIcon/></MenuItem>
            </Menu>
        </div>
    )
}

export default RecipeCardsOptions