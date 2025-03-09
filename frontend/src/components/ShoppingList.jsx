import React from 'react'
import { Container, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material'

function ShoppingList({ mealPrep, user }) {
    return (
        <Container disableGutters maxWidth={false}>
            <Typography variant="h2">Shopping List</Typography>
            <FormGroup>
                {mealPrep.map(mealPrep => {
                    return (typeof mealPrep.recipe_id) === "number" ?
                        <div>
                            {user && user.id && (user.id === mealPrep.user_id) &&  
                            <div style={{ paddingTop: '16px' }}>
                                <strong>{mealPrep.recipe.name}</strong>
                            </div>}
                            {mealPrep.recipe.recipe_ingredients.map(ingredient => {
                                return (
                                    user && user.id && (user.id === mealPrep.user_id) &&  
                                    <div>
                                        <FormControlLabel 
                                            key={ingredient.id} 
                                            control={<Checkbox />} 
                                            label={`${ingredient.ingredient_quantity === 0 ? "" : ingredient.ingredient_quantity} ${ingredient.ingredient_unit} ${ingredient.ingredient_name}${(ingredient.ingredient_note === null || ingredient.ingredient_note === "") ? "" : ", " + ingredient.ingredient_note}`} 
                                        />
                                    </div>
                                )
                            })}
                        </div>
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