// RecipePopover.js
import React, { useState } from 'react';
import Popover from '@mui/material/Popover';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { Chip } from '@mui/material';

function UserRecipeTagsPopover({ recipeId, userTags, handleTagSelect }) {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const open = Boolean(anchorEl);

  return (
    <>
      <Chip
        size="small"
        label="+"
        color="secondary"
        variant="outlined"
        onClick={handleClick}
      />
      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <Select value="" onChange={(event) => handleTagSelect(recipeId, event.target.value)}>
          {userTags.map((userTag) => (
            <MenuItem key={userTag.id} value={userTag.id}>
              {userTag.name}
            </MenuItem>
          ))}
        </Select>
      </Popover>
    </>
  );
}

export default UserRecipeTagsPopover;
