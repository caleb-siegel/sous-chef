import React, { useState, useEffect } from 'react'
import { Container, Card, CardHeader, Divider, Chip, FormGroup, FormControlLabel, Checkbox, Tooltip } from '@mui/material'
// import MealPrepCalendar from './MealPrepCalendar'
import DeleteIcon from '@mui/icons-material/Delete';
import ShoppingList from './ShoppingList';
import { useOutletContext } from "react-router-dom";

function MealPrep() {
    const {user} = useOutletContext();

    const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mealOptions = ['Breakfast', 'Lunch', 'Dinner']

    const [mealPrep, setMealPrep] = useState([]);
    useEffect(() => {
        fetch("/api/mealprep")
        .then((response) => response.json())
        .then((data) => setMealPrep(data));
    }, []);

    const handleDelete = (event, id) => {
        event.preventDefault();
        fetch(`/api/mealprep/${id}`, {
            method: "DELETE",
        })
        .then((data) => {
            setMealPrep(mealPrep.filter(prep => {(data.id !== prep.id) && (data.weekday !== prep.weekday) && (data.meal !== prep.meal)}))
        })
      };

    return (
    <Container>
        {/* <MealPrepCalendar/> */}
        <Container style={{ display: 'flex'}}>
            {weekdayOptions.map((weekday) => {
                return (
                    <Card key={weekday} sx={{ maxWidth: 345,  padding: '10px', border: '1px solid #3FFFC2' }}>
                        <CardHeader title={weekday} titleTypographyProps={{ sx: { fontSize: 14 } }}/>
                        <Divider/>
                        {mealOptions.map((meal) => {
                            return (
                                <Card key={meal} size="small" sx={{margin: "5px" }}>
                                    <CardHeader title={meal} titleTypographyProps={{ sx: { fontSize: 14 } }}/>
                                    {mealPrep.map(prep => {
                                        return user && user.id && prep.user_id === user.id && prep && (prep.meal === meal) && (prep.weekday === weekday) && 
                                        <a href={`/recipes/${prep.recipe.id}`} key={prep.recipe.id} style={{ textDecoration: 'none' }}>
                                            <Tooltip title={prep.recipe.name}>
                                                <Chip key={prep.id} color="primary" label={prep.recipe.name} onDelete={(event) => handleDelete(event, prep.id)}></Chip>
                                            </Tooltip>
                                        </a>
                                    })}
                                </Card>
                            )
                        })}
                    </Card>
                )
            })}
        </Container>
        <br/>
        <ShoppingList mealPrep={mealPrep} user={user}/>
    </Container>
  )
}

export default MealPrep