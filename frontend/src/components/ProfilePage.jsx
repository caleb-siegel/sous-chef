import React, { useState, useEffect } from 'react';
import { useOutletContext, Link, useNavigate } from "react-router-dom";
import { 
    Container, Box, Typography, Paper, Avatar, Grid, Card, CardContent, 
    Button, Chip, Divider, List, ListItem, ListItemText, Stack, CircularProgress 
} from '@mui/material';
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import StorefrontIcon from '@mui/icons-material/Storefront';
import PersonIcon from '@mui/icons-material/Person';
import EmailIcon from '@mui/icons-material/Email';

function ProfilePage() {
    const { user, backendUrl, logout } = useOutletContext();
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        recipesCount: 0,
        mealPrepsCount: 0,
        notesCount: 0
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user || !user.id) {
            setLoading(false);
            return;
        }

        const fetchUserStats = async () => {
            try {
                const [recipesRes, mealPrepRes, notesRes] = await Promise.all([
                    fetch(`${backendUrl}/api/user_recipe_ids/${user.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : {}),
                    fetch(`${backendUrl}/api/mealprep?user_id=${user.id}`, { credentials: 'include' }).then(r => r.ok ? r.json() : []),
                    fetch(`${backendUrl}/api/user_restaurant_notes`, { credentials: 'include' }).then(r => r.ok ? r.json() : [])
                ]);

                const recipesCount = typeof recipesRes === 'object' && !recipesRes.error ? Object.keys(recipesRes).length : 0;
                const mealPrepsCount = Array.isArray(mealPrepRes) ? mealPrepRes.length : 0;
                const notesCount = Array.isArray(notesRes) ? notesRes.length : 0;

                setStats({
                    recipesCount,
                    mealPrepsCount,
                    notesCount
                });
            } catch (err) {
                console.error("Error fetching profile stats:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchUserStats();
    }, [user, backendUrl]);

    if (!user) {
        return (
            <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
                <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2 }}>
                    <PersonIcon sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                    <Typography variant="h5" gutterBottom>
                        You are not signed in
                    </Typography>
                    <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
                        Sign in to view your profile, saved recipes, and meal plans.
                    </Typography>
                    <Button variant="contained" color="primary" onClick={() => navigate('/login')}>
                        Go to Login
                    </Button>
                </Paper>
            </Container>
        );
    }

    const displayName = user.first_name 
        ? `${user.first_name} ${user.last_name || ''}`.trim() 
        : (user.name || "Sous Chef User");

    const initials = displayName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2) || "U";

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Profile Header */}
            <Paper sx={{ p: 4, borderRadius: 3, boxShadow: 2, mb: 4, background: 'linear-gradient(135deg, #1e293b 0%, #334155 100%)', color: 'white' }}>
                <Grid container spacing={3} alignItems="center">
                    <Grid item>
                        <Avatar sx={{ width: 80, height: 80, bgcolor: 'secondary.main', color: 'white', fontSize: 28, fontWeight: 'bold' }}>
                            {initials}
                        </Avatar>
                    </Grid>
                    <Grid item xs>
                        <Typography variant="h4" fontWeight="bold">
                            {displayName}
                        </Typography>
                        {user.email && (
                            <Typography variant="body2" sx={{ opacity: 0.85, display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                                <EmailIcon fontSize="small" /> {user.email}
                            </Typography>
                        )}
                        <Typography variant="caption" sx={{ opacity: 0.7, display: 'block', mt: 0.5 }}>
                            User ID: #{user.id}
                        </Typography>
                    </Grid>
                    <Grid item>
                        <Button 
                            variant="outlined" 
                            color="inherit" 
                            size="small" 
                            onClick={logout}
                            sx={{ borderColor: 'rgba(255,255,255,0.5)' }}
                        >
                            Log Out
                        </Button>
                    </Grid>
                </Grid>
            </Paper>

            {/* Quick Stats */}
            <Grid container spacing={3} sx={{ mb: 4 }}>
                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1, textAlign: 'center', p: 2 }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                            <RestaurantMenuIcon color="primary" sx={{ fontSize: 36, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="primary">
                                {loading ? <CircularProgress size={24} /> : stats.recipesCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Saved Recipes
                            </Typography>
                            <Button component={Link} to="/recipes" size="small" sx={{ mt: 1 }}>
                                View Recipes
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1, textAlign: 'center', p: 2 }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                            <CalendarMonthIcon color="secondary" sx={{ fontSize: 36, mb: 1 }} />
                            <Typography variant="h4" fontWeight="bold" color="secondary">
                                {loading ? <CircularProgress size={24} /> : stats.mealPrepsCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Planned Meals
                            </Typography>
                            <Button component={Link} to="/mealprep" size="small" color="secondary" sx={{ mt: 1 }}>
                                Open Meal Prep
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>

                <Grid item xs={12} sm={4}>
                    <Card sx={{ borderRadius: 2, boxShadow: 1, textAlign: 'center', p: 2 }}>
                        <CardContent sx={{ pb: '16px !important' }}>
                            <StorefrontIcon sx={{ fontSize: 36, mb: 1, color: '#f59e0b' }} />
                            <Typography variant="h4" fontWeight="bold" sx={{ color: '#f59e0b' }}>
                                {loading ? <CircularProgress size={24} /> : stats.notesCount}
                            </Typography>
                            <Typography variant="body2" color="textSecondary">
                                Restaurant Reviews
                            </Typography>
                            <Button component={Link} to="/restaurants" size="small" sx={{ mt: 1, color: '#f59e0b' }}>
                                View Restaurants
                            </Button>
                        </CardContent>
                    </Card>
                </Grid>
            </Grid>

            {/* Navigation Shortcuts */}
            <Paper sx={{ p: 3, borderRadius: 2, boxShadow: 1 }}>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                    Quick Actions
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    <Button component={Link} to="/recipes" variant="contained" color="primary" fullWidth>
                        Browse Recipes
                    </Button>
                    <Button component={Link} to="/mealprep" variant="contained" color="secondary" fullWidth>
                        Plan Meals & Shopping
                    </Button>
                    <Button component={Link} to="/feed" variant="outlined" fullWidth>
                        Community Foodie Feed
                    </Button>
                    <Button component={Link} to="/random" variant="outlined" color="secondary" fullWidth>
                        Spice It Up Randomizer
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}

export default ProfilePage;