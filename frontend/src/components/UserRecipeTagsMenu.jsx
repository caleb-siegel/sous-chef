// RecipePopover.js
import React, { useState } from 'react';
import { Chip, Menu, MenuItem } from '@mui/material';

function UserRecipeTagsMenu({ recipeId, tags, handleTagSelect, color }) {
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
        color={color}
        variant="outlined"
        onClick={handleClick}
      />
      <Menu
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        MenuListProps={{ 'aria-labelledby': '+Chip'}}
      >
        {tags && tags.map((tag) => (
          <MenuItem 
            key={tag.id} 
            value={tag.id} 
            onClick={(event) => {
              handleTagSelect(recipeId, event.target.value); 
              handleClose()
            }}
          >
            {tag.name}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};

export default UserRecipeTagsMenu;
