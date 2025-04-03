import React, { useState, useEffect } from 'react'
import { Container, FormGroup, FormControlLabel, Checkbox, Typography } from '@mui/material'
import { useOutletContext } from "react-router-dom";

function ShoppingList({ mealPrep, user }) {
    const { backendUrl } = useOutletContext();

    const [shoppingList, setShoppingList] = useState([]);

    useEffect(() => {
        fetch(`${backendUrl}/api/user_shopping_list`)
        .then((response) => response.json())
        .then((data) => {
            setShoppingList(data);
        });
    }, []);

    const handleCheckboxChange = (event, itemId, checkedProp) => {
      setShoppingList(prevList =>
          prevList.map(item =>
              item.id === itemId ? { ...item, checked: event.target.checked } : item
          )
      );
      // try {
        fetch(`${backendUrl}/api/user_shopping_list/${itemId}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({ checked: !checkedProp }), // Send updated checked state
        });

    //     if (!response.ok) {
    //         console.error("Failed to update backend");
    //         // If the request fails, revert the checkbox state
    //         setShoppingList(prevList =>
    //             prevList.map(item =>
    //                 item.id === itemId ? { ...item, checked: checked } : item
    //             )
    //         );
    //     }
    //   } catch (error) {
    //     console.error("Error updating backend:", error);
    //     // Revert checkbox state if request fails
    //     setShoppingList(prevList =>
    //         prevList.map(item =>
    //             item.id === itemId ? { ...item, checked: checked } : item
    //         )
    //     );
    // }
    };

    return (
        <Container disableGutters maxWidth={false}>
            <Typography variant="h2">Shopping List</Typography>
            <FormGroup>
                {shoppingList.map(item => {
                    return (typeof item.id) === "number" ?
                        <div key={item.id}>
                            {/* {
                              user && user.id && (user.id === item.user_id) &&  
                              <div style={{ paddingTop: '16px' }}>
                                  <strong>{mealPrep.recipe.name}</strong>
                              </div>
                            } */}
                            {
                            // mealPrep.recipe.recipe_ingredients.map(ingredient => {
                                // return (
                                    user && user.id && (user.id === item.user_id) &&  
                                    <div>
                                        <FormControlLabel 
                                            key={item.id} 
                                            control={
                                              <Checkbox
                                                checked={item.checked} // Controlled by state
                                                onChange={() => handleCheckboxChange(event, item.id, item.checked)} // Updates state
                                              />
                                            } 
                                            label={`${item.recipe_ingredient.ingredient_quantity === 0 ? "" : item.recipe_ingredient.ingredient_quantity} ${item.recipe_ingredient.ingredient_unit} ${item.recipe_ingredient.ingredient_name}${(item.recipe_ingredient.ingredient_note === null || item.recipe_ingredient.ingredient_note === "") ? "" : ", " + item.recipe_ingredient.ingredient_note} (${item.recipe_ingredient.recipe.name})`} 
                                        />
                                    </div>
                                // )
                            // })
                            }
                        </div>
                    : user && user.id && (user.id === item.user_id) &&
                        <FormControlLabel 
                            key={item.id} 
                            control={<Checkbox />} 
                            label={`${item.id}`} 
                        />
                })}
            </FormGroup>
        </Container>
    )
}

export default ShoppingList