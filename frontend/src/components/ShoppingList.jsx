import { Container, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material'
import React from 'react'

function ShoppingList({ mealPrep, user }) {
  const ingredientsObject = {};

  return (
    <Container disableGutters maxWidth={false}>
      <Typography variant="h2">Shopping List</Typography>
      <FormGroup>
        {mealPrep.map(mealPrep => {
          return (typeof mealPrep.recipe_id) === "number" ?
          mealPrep.recipe.recipe_ingredients.map(ingredient => {
              // {
              //   if ((!(ingredient.ingredient_name in ingredientsObject)) && ingredient.ingredient_name && ingredient.ingredient_quantity) {
              //     ingredientsObject[ingredient.ingredient_name] = ingredient.ingredient_quantity

              //   } else {
              //     ingredientsObject[ingredient.ingredient_name] += ingredient.ingredient_quantity
              //   }
              // }
              return (
                user && user.id && (user.id === mealPrep.user_id) &&
                <FormControlLabel 
                  key={ingredient.id} 
                  control={<Checkbox />} 
                  label={`${ingredient.ingredient_quantity === 0 ? "" : ingredient.ingredient_quantity} ${ingredient.ingredient_unit} ${ingredient.ingredient_name}${(ingredient.ingredient_note === null || ingredient.ingredient_note === "") ? "" : ", " + ingredient.ingredient_note}`} 
                />
              )
          })
          : user && user.id && (user.id === mealPrep.user_id) &&
            <FormControlLabel 
              key={mealPrep.recipe_id} 
              control={<Checkbox />} 
              label={`${mealPrep.recipe_id}`} 
            />
        })}
      </FormGroup>
    </Container>
  )
}

export default ShoppingList