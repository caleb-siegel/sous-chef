import { Container, Chip, InputLabel, Select, MenuItem, Button, Stack, TextField } from '@mui/material'
import React, { useState, useEffect } from 'react'

function AddToMealPrep({ user, recipeId = "" }) {
    const [showAddMealPrepForm, setShowAddMealPrepForm] = useState(false)
  
    const [weekday, setWeekday] = useState("")
    const [meal, setMeal] = useState("")

    const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mealOptions = ['Breakfast', 'Lunch', 'Dinner']

    const [addedRecipe, setAddedRecipe] = useState("")

    const [mealPrep, setMealPrep] = useState([]);
    useEffect(() => {
        fetch("/api/mealprep")
        .then((response) => response.json())
        .then((data) => setMealPrep(data));
    }, []);

    const handleShowAddMealPrepForm = (event) => {
        event.preventDefault();
        setShowAddMealPrepForm(!showAddMealPrepForm)
    }

    const handleSubmitMealPrep = (event) => {
        event.preventDefault();
        const mealPrepData = {
            user_id: user ? user.id : "",
            recipe_id: recipeId ? recipeId : addedRecipe,
            weekday: weekday,
            meal: meal,
        }
        fetch("/api/mealprep", {
            method: "POST",
            headers: {
                "Content-Type": "Application/JSON",
            },
            body: JSON.stringify(mealPrepData),
        })
        .then((response) => response.json())
        .then((newMealPrepData) => {
            setWeekday("")
            setMeal("")
            setShowAddMealPrepForm(!showAddMealPrepForm)
            window.location.reload();
        })
    }

    return (
    <Container disableGutters maxWidth={false} sx={{ paddingTop: '5px' }}>
        {mealPrep && mealPrep.map(prep => {
            return (
                (prep.recipe_id === recipeId) && (user && user.id && prep.user_id && (user.id === prep.user_id)) &&
                <Chip key={prep.id} size="small" variant="outlined" label={`${prep.weekday} ${prep.meal}`}></Chip> 
            )
        })}
        <Chip
            size="small"
            label=" + Add to Meal Prep"
            // color="primary"
            variant="filled"
            onClick={handleShowAddMealPrepForm}
            sx={{ padding: '5px'}}
        />
        {showAddMealPrepForm &&
            <form onSubmit={(event) => handleSubmitMealPrep(event)}>
                <Stack direction="row">
                    {recipeId === "" && 
                    <TextField id="text-field-recipe-meal-prep-form" label="Recipe" variant="standard" value={addedRecipe} onChange={(event) => setAddedRecipe(event.target.value)} />
                    }
                    <InputLabel id="demo-simple-select-label">Weekday</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={weekday}
                        label="Weekday"
                        onChange={(event) => setWeekday(event.target.value)}
                    >
                        {weekdayOptions.map(weekday => {
                            return <MenuItem key={weekday} value={weekday}>{weekday}</MenuItem>
                        })}
                    </Select>
                    <br />
                    <InputLabel id="demo-simple-select-label">Meal</InputLabel>
                    <Select
                        labelId="demo-simple-select-label"
                        id="demo-simple-select"
                        value={meal}
                        label="Meal"
                        onChange={(event) => setMeal(event.target.value)}
                    >
                        {mealOptions.map(meal => {
                            return <MenuItem key={meal} value={meal}>{meal}</MenuItem>
                        })}
                    </Select>
                    <br />
                    <Button variant="contained" color="primary" size="small" type="submit">Submit</Button>
                </Stack>
            </form>
        }
    </Container>
  )
}

export default AddToMealPrep;