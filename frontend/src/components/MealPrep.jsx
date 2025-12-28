import React, { useState, useEffect } from 'react'
import { 
    Container, 
    Card, 
    CardHeader, 
    Divider, 
    Chip, 
    Tooltip, 
    Skeleton, 
    Box, 
    useTheme, 
    useMediaQuery,
    ToggleButtonGroup,
    ToggleButton
} from '@mui/material'
import { DndProvider, useDrag, useDrop } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ShoppingList from './ShoppingList';
import { useOutletContext } from "react-router-dom";
import AddToMealPrep from './AddToMealPrep';

// Draggable Recipe component
const DraggableRecipe = ({ prep, onDelete }) => {
    const [{ isDragging }, drag] = useDrag(() => ({
        type: 'recipe',
        item: { id: prep.id, recipe: prep.recipe, weekday: prep.weekday, meal: prep.meal },
        collect: (monitor) => ({
            isDragging: monitor.isDragging(),
        }),
    }));

    return (
        <div ref={drag}>
            <a href={`/recipes/${prep.recipe.id}`} style={{ textDecoration: 'none', opacity: isDragging ? 0.5 : 1 }}>
                <Tooltip title={prep.recipe.name}>
                    <Chip
                        color="primary"
                        label={prep.recipe.name}
                        onDelete={(event) => {
                            event.preventDefault();
                            onDelete(event, prep.id);
                        }}
                        sx={{
                            width: '100%',
                            height: 'auto',
                            cursor: 'grab',
                            '& .MuiChip-label': {
                                whiteSpace: 'normal',
                                padding: '8px 4px'
                            }
                        }}
                    />
                </Tooltip>
            </a>
        </div>
    );
};

// Droppable Meal Slot component
const DroppableMealSlot = ({ weekday, meal, children, onDrop }) => {
    const [{ isOver }, drop] = useDrop(() => ({
        accept: 'recipe',
        drop: (item) => onDrop(item, weekday, meal),
        collect: (monitor) => ({
            isOver: monitor.isOver(),
        }),
    }));

    return (
        <Box
            ref={drop}
            sx={{
                p: 1,
                display: 'flex',
                flexDirection: 'column',
                gap: 1,
                transition: 'background-color 0.2s ease',
                backgroundColor: isOver ? 'rgba(63, 255, 194, 0.05)' : 'transparent',
                minHeight: '50px'
            }}
        >
            {children}
        </Box>
    );
};

function MealPrep() {
    const {user} = useOutletContext();
    const { backendUrl } = useOutletContext();
    const [loading, setLoading] = useState(true);
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    const [mobileView, setMobileView] = useState('calendar');

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

    const handleDrop = async (item, newWeekday, newMeal) => {
        // If dropping in the same slot, do nothing
        if (item.weekday === newWeekday && item.meal === newMeal) {
            return;
        }

        // Delete the old meal prep
        await fetch(`${backendUrl}/api/mealprep/${item.id}`, {
            method: "DELETE",
        });

        // Create new meal prep in the new slot
        const response = await fetch(`${backendUrl}/api/mealprep`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                user_id: user.id,
                recipe_id: item.recipe.id,
                weekday: newWeekday,
                meal: newMeal,
            }),
        });

        const newMealPrep = await response.json();

        // Update the state
        setMealPrep(prevMealPrep => [
            ...prevMealPrep.filter(prep => prep.id !== item.id),
            newMealPrep
        ]);
    };

    const handleViewChange = (event, newView) => {
        if (newView !== null) {
            setMobileView(newView);
        }
    };

    const MealPrepCalendar = () => (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(7, 1fr)'
            },
            gap: 2,
            width: '100%'
        }}>
            {weekdayOptions.map((weekday) => (
                <Card 
                    key={weekday} 
                    elevation={2}
                    sx={{
                        border: `1px solid ${theme.palette.primary.light}`,
                        borderRadius: 2,
                        height: '100%'
                    }}
                >
                    <CardHeader 
                        title={weekday}
                        sx={{
                            bgcolor: 'primary.light',
                            color: 'primary.contrastText',
                            '& .MuiCardHeader-title': {
                                fontSize: '1rem',
                                fontWeight: 'bold',
                                textAlign: 'center'
                            }
                        }}
                    />
                    <Box sx={{ p: 2 }}>
                        {mealOptions.map((meal) => (
                            <Card 
                                key={`${weekday}${meal}`}
                                variant="outlined"
                                sx={{
                                    mb: 2,
                                    '&:last-child': { mb: 0 }
                                }}
                            >
                                <CardHeader 
                                    title={meal}
                                    sx={{
                                        bgcolor: 'grey.100',
                                        p: 1,
                                        '& .MuiCardHeader-title': {
                                            fontSize: '0.875rem',
                                            fontWeight: 500
                                        }
                                    }}
                                />
                                <DroppableMealSlot weekday={weekday} meal={meal} onDrop={handleDrop}>
                                    {mealPrep.map(prep => {
                                        if (user?.id === prep.user_id && prep.meal === meal && prep.weekday === weekday) {
                                            if (typeof prep.recipe_id === "number") {
                                                return (
                                                    <DraggableRecipe 
                                                        key={prep.id} 
                                                        prep={prep} 
                                                        onDelete={handleDelete}
                                                    />
                                                );
                                            } else {
                                                return (
                                                    <Tooltip key={prep.id} title={prep.recipe_id}>
                                                        <Chip
                                                            color="primary"
                                                            label={prep.recipe_id}
                                                            onDelete={(event) => handleDelete(event, prep.id)}
                                                            sx={{
                                                                width: '100%',
                                                                height: 'auto',
                                                                '& .MuiChip-label': {
                                                                    whiteSpace: 'normal',
                                                                    padding: '8px 4px'
                                                                }
                                                            }}
                                                        />
                                                    </Tooltip>
                                                );
                                            }
                                        }
                                        return null;
                                    })}
                                </DroppableMealSlot>
                            </Card>
                        ))}
                    </Box>
                </Card>
            ))}
        </Box>
    );

    const LoadingSkeleton = () => (
        <Box sx={{
            display: 'grid',
            gridTemplateColumns: {
                xs: '1fr',
                sm: 'repeat(2, 1fr)',
                md: 'repeat(4, 1fr)',
                lg: 'repeat(7, 1fr)'
            },
            gap: 2
        }}>
            {weekdayOptions.map((weekday) => (
                <Card key={weekday} sx={{ p: 2, border: `1px solid ${theme.palette.primary.light}` }}>
                    <CardHeader title={weekday} />
                    <Divider />
                    <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <Skeleton variant="rounded" height={40} />
                        <Skeleton variant="rounded" height={40} />
                        <Skeleton variant="rounded" height={40} />
                    </Box>
                </Card>
            ))}
        </Box>
    );

    return (
        <DndProvider backend={HTML5Backend}>
            <Container maxWidth="xl" sx={{ py: 3 }}>
                <Box sx={{ mb: 3 }}>
                    <AddToMealPrep user={user} />
                </Box>
                
                {isMobile && (
                    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
                        <ToggleButtonGroup
                            value={mobileView}
                            exclusive
                            onChange={handleViewChange}
                            aria-label="view selector"
                            sx={{
                                '& .MuiToggleButton-root': {
                                    px: 3,
                                    py: 1,
                                }
                            }}
                        >
                            <ToggleButton value="calendar" aria-label="calendar view">
                                <CalendarMonthIcon sx={{ mr: 1 }} /> Calendar
                            </ToggleButton>
                            <ToggleButton value="shopping" aria-label="shopping list view">
                                <FormatListBulletedIcon sx={{ mr: 1 }} /> Shopping List
                            </ToggleButton>
                        </ToggleButtonGroup>
                    </Box>
                )}

                {!loading ? (
                    <>
                        {(!isMobile || mobileView === 'calendar') && <MealPrepCalendar />}
                        {(!isMobile || mobileView === 'shopping') && (
                            <Box sx={{ mt: isMobile ? 0 : 4 }}>
                                <ShoppingList mealPrep={mealPrep} user={user}/>
                            </Box>
                        )}
                    </>
                ) : (
                    <LoadingSkeleton />
                )}
            </Container>
        </DndProvider>
    )
}

export default MealPrep