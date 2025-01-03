import React, { useState, useEffect } from 'react'
import { Container, Card, CardHeader, Divider, Chip, Tooltip, Skeleton } from '@mui/material'
import ShoppingList from './ShoppingList';
import { useOutletContext } from "react-router-dom";
import AddToMealPrep from './AddToMealPrep';

function MealPrep() {
    const {user} = useOutletContext();
    const { backendUrl } = useOutletContext();
    const [loading, setLoading] = useState(true);

    const weekdayOptions = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const mealOptions = ['Breakfast', 'Lunch', 'Dinner']

    const [mealPrep, setMealPrep] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/mealprep`)
        .then((response) => response.json())
        .then((data) => {
            setMealPrep(data);
            setLoading(false);
        });
    }, []);

    const handleDelete = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/mealprep/${id}`, {
            method: "DELETE",
        })
        .then((data) => {
            setMealPrep(prevMealPrep => prevMealPrep.filter(prep => prep.id !== id));
        })
    };

    return (
    <Container disableGutters maxWidth={false}>
        <AddToMealPrep user={user} />
        {!loading ? (
            <Container disableGutters maxWidth={false} style={{ display: 'flex'}}>
                {weekdayOptions.map((weekday) => {
                    return (
                        <Card key={weekday} sx={{ maxWidth: 345,  padding: '10px', border: '1px solid #3FFFC2' }}>
                            <CardHeader title={weekday} titleTypographyProps={{ sx: { fontSize: 14 } }}/>
                            <Divider/>
                            {mealOptions.map((meal) => {
                                return (
                                    <Card key={`${weekday}${meal}`} size="small" sx={{margin: "5px" }}>
                                        <CardHeader title={meal} titleTypographyProps={{ sx: { fontSize: 14 } }}/>
                                        {mealPrep.map(prep => {
                                            return user && user.id && prep.user_id === user.id && prep && (prep.meal === meal) && (prep.weekday === weekday) && 
                                            typeof prep.recipe_id === "number" ?
                                                <a href={`/recipes/${prep.recipe.id}`} key={prep.recipe.id} style={{ textDecoration: 'none' }}>
                                                    <Tooltip title={prep.recipe.name}>
                                                        <Chip key={prep.id} color="primary" label={prep.recipe.name} onDelete={(event) => handleDelete(event, prep.id)}></Chip>
                                                    </Tooltip>
                                                </a>
                                            : user && user.id && prep.user_id === user.id && prep && (prep.meal === meal) && (prep.weekday === weekday) && typeof prep.recipe_id === "string" &&
                                                <Tooltip title={prep.recipe_id}>
                                                    <Chip key={prep.recipe_id} color="primary" label={prep.recipe_id} onDelete={(event) => handleDelete(event, prep.id)}></Chip>
                                                </Tooltip>
                                        })}
                                    </Card>
                                )
                            })}
                        </Card>
                    )
                })}
            </Container>
        )
        :
            <Container disableGutters maxWidth={false} style={{ display: 'flex'}}>
                {weekdayOptions.map((weekday) => {
                    return (
                        <Card key={weekday} sx={{ maxWidth: 345,  padding: '10px', border: '1px solid #3FFFC2' }}>
                            <CardHeader title={weekday} titleTypographyProps={{ sx: { fontSize: 14 } }}/>
                            <Divider/>
                            <Skeleton variant="circular" width={30} height={30} />
                            <br/><br/>
                            <Skeleton variant="circular" width={30} height={30} />
                            <br/><br/>
                            <Skeleton variant="circular" width={30} height={30} />
                            <br/><br/>
                        </Card>
                    )
                })}
            </Container>
        }
        <br/>
        <ShoppingList mealPrep={mealPrep} user={user}/>
    </Container>
    )
}

export default MealPrep