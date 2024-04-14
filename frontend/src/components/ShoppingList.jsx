import { Container, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material'
import React from 'react'

function ShoppingList({ mealPrep, user }) {
  return (
    <Container>
      <Typography variant="h2">Shopping List</Typography>
      <FormGroup>
        {mealPrep.map(mealPrep => {
          return mealPrep.recipe.recipe_ingredients.map(ingredient => {
              return (
                user && user.id && (user.id === mealPrep.user_id) && 
                <FormControlLabel 
                  key={ingredient.id} 
                  control={<Checkbox />} 
                  label={`${ingredient.ingredient_quality > 0 ? ingredient.ingredient_quantity : ""} ${ingredient.ingredient_unit} ${ingredient.ingredient_name}, ${ingredient.ingredient_note}`} 
                />
              )
          })
        })}
      </FormGroup>
    </Container>
  )
}

export default ShoppingList