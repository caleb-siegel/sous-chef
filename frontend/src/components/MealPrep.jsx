import React, { useState, useEffect } from 'react'
import { Container, Card, CardHeader, Divider, Chip } from '@mui/material'
import MealPrepCalendar from './MealPrepCalendar'
import DeleteIcon from '@mui/icons-material/Delete';

function MealPrep() {
    const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mealOptions = ['Breakfast', 'Lunch', 'Dinner']

    const [mealPrep, setMealPrep] = useState([]);
    useEffect(() => {
        fetch("/api/mealprep")
        .then((response) => response.json())
        .then((data) => setMealPrep(data));
    }, []);

    const handleDelete = (id) => {
        fetch(`/api/mealprep/${id}`, {
            method: "DELETE",
        })
        .then((data) => {
            setMealPrep(mealPrep.filter(prep => {(data.id !== prep.id) && (data.weekday !== prep.weekday) && (data.meal !== prep.meal)}))
        })
      };

    return (
    <Container>
        <MealPrepCalendar/>
        <Container style={{ display: 'flex', flexWrap: 'wrap' }}>
            {weekdayOptions.map((weekday) => {
                return (
                    <Card key={weekday} sx={{ maxWidth: 345, margin: '10px', padding: '10px' }}>
                        <CardHeader title={weekday}/>
                        <Divider/>
                        {mealOptions.map((meal) => {
                            return (
                                <Card key={meal} size="small" sx={{margin: "5px" }}>
                                    <CardHeader title={meal}/>
                                    {mealPrep.map(prep => {
                                        return prep && (prep.meal === meal) && (prep.weekday === weekday) && 
                                            <Chip key={prep.id} color="primary" label={prep.recipe.name} onDelete={() => handleDelete(prep.id)}></Chip>
                                    })}
                                </Card>
                            )
                        })}
                    </Card>
                )
            })}
            {mealPrep.map(mealPrep => {
                return <div key={mealPrep.id}>{mealPrep.recipe.recipe_ingredients.map(ingredient => {
                    return ingredient.ingredient_name
                })}</div>
            })}
        </Container>
    </Container>
  )
}

export default MealPrep