// RecipePopover.js
import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Button, Chip, Divider, TextField, Menu } from '@mui/material';

function UserRecipeTagsPopover({ recipeId, userTags, handleTagSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    event.preventDefault();
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Chip
        id='+Chip'
        size="small"
        label="+"
        color="secondary"
        variant="outlined"
        onClick={handleClick}
      />
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': '+Chip'}}
      >
        {/* <Select value="" onChange={(event) => handleTagSelect(recipeId, event.target.value)}> */}
          {userTags.map((userTag) => (
            <MenuItem 
              key={userTag.id} 
              value={userTag.id} 
              onClick={(event) => {
                handleTagSelect(recipeId, event.target.value); 
                handleClose()
              }}
            >
              {userTag.name}
            </MenuItem>
          ))}
        {/* </Select> */}
      </Menu>
    </>
  );
}

export default UserRecipeTagsPopover;
