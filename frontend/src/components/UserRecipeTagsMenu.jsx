import React, { useState } from 'react'
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";

function UserRecipeTagsMenu({recipeId}) {
    const [showAddUserRecipe, setShowAddUserRecipe] = useState(null);
    const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    const handleAddUserTagsClick = (event) => {
        setShowAddUserRecipe(event.currentTarget)
        setSelectedRecipeId(recipeId);
    };

    const handleCloseUserRecipeTags = (recipeIdTag, userTagId) => {
        console.log(`this is the recipe id inside the function: ${recipeIdTag}`)
        setShowAddUserRecipe(null);
        if (userTagId !== null) {
            fetch('/api/userrecipetags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then((response) => response.json())
            .then(response => {
                console.log('User tag posted successfully:', response.data);
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        };
    }
    return (
    <Menu
        anchorEl={showAddUserRecipe}
        open={Boolean(showAddUserRecipe)}
        onClose={handleCloseUserRecipeTags}
    >
        {userTags.map(userTag => {
            console.log(recipe.id)
            return <MenuItem key={userTag.id} onClick={() => handleCloseUserRecipeTags(recipe.id, userTag.id)}>{userTag.name} {recipe.id}</MenuItem>
        })}
    </Menu>
  )
}

export default UserRecipeTagsMenu