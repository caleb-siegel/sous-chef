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
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import FormatListBulletedIcon from '@mui/icons-material/FormatListBulleted';
import ShoppingList from './ShoppingList';
import { useOutletContext } from "react-router-dom";
import AddToMealPrep from './AddToMealPrep';

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
                                <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', gap: 1 }}>
                                    {mealPrep.map(prep => {
                                        if (user?.id === prep.user_id && prep.meal === meal && prep.weekday === weekday) {
                                            if (typeof prep.recipe_id === "number") {
                                                return (
                                                    <a href={`/recipes/${prep.recipe.id}`} key={prep.recipe.id} style={{ textDecoration: 'none' }}>
                                                        <Tooltip title={prep.recipe.name}>
                                                            <Chip
                                                                key={prep.id}
                                                                color="primary"
                                                                label={prep.recipe.name}
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
                                                    </a>
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
                                </Box>
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
    )
}

export default MealPrep