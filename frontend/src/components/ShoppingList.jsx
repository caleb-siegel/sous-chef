import { Container, FormGroup, FormControlLabel, Checkbox } from '@mui/material'
import React from 'react'

function ShoppingList({ mealPrep }) {
  return (
    <Container>
        <h1>Shopping List</h1>
        <FormGroup>
                {mealPrep.map(mealPrep => {
                    return mealPrep.recipe.recipe_ingredients.map(ingredient => {
                        return <FormControlLabel key={ingredient.id} control={<Checkbox />} label={`${ingredient.ingredient_quantity} ${ingredient.ingredient_unit} ${ingredient.ingredient_name}`} />
                    })
                })}
        </FormGroup>
    </Container>
  )
}

export default ShoppingList