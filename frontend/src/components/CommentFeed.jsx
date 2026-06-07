import React, { useState, useEffect } from "react";
import { 
    Container, Typography, Box, Card, CardContent, Avatar, 
    Rating, Chip, Stack, TextField, Button, ButtonGroup, 
    CircularProgress, Alert, Divider, useTheme
} from "@mui/material";
import { useOutletContext, Link } from "react-router-dom";
import RestaurantMenuIcon from '@mui/icons-material/RestaurantMenu';
import StorefrontIcon from '@mui/icons-material/Storefront';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import SearchIcon from '@mui/icons-material/Search';

// Generate consistent colors for user avatars based on user name
const stringToColor = (string) => {
    let hash = 0;
    for (let i = 0; i < string.length; i++) {
        hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = '#';
    for (let i = 0; i < 3; i++) {
        const value = (hash >> (i * 8)) & 0xff;
        // Make colors slightly pastel/brighter for better contrast
        const pastelValue = Math.floor((value + 150) / 2);
        color += `00${pastelValue.toString(16)}`.slice(-2);
    }
    return color;
};

function CommentFeed() {
    const { backendUrl } = useOutletContext();
    const theme = useTheme();
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // Filters and Search
    const [searchQuery, setSearchQuery] = useState("");
    const [activeTab, setActiveTab] = useState("all"); // "all", "cooked_instance", "restaurant_menu_item"

    useEffect(() => {
        const fetchComments = async () => {
            try {
                setLoading(true);
                const response = await fetch(`${backendUrl}/api/comments_feed`, {
                    credentials: 'include'
                });
                if (!response.ok) throw new Error("Failed to fetch comments feed");
                const data = await response.json();
                setComments(data);
            } catch (err) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchComments();
    }, [backendUrl]);

    // Filter logic
    const filteredComments = comments.filter(item => {
        // Tab filter
        if (activeTab !== "all" && item.type !== activeTab) {
            return false;
        }
        
        // Search query filter
        if (searchQuery.trim() === "") return true;
        
        const query = searchQuery.toLowerCase();
        const commentMatch = item.comment?.toLowerCase().includes(query);
        const userMatch = item.user_name?.toLowerCase().includes(query);
        const recipeMatch = item.recipe_name?.toLowerCase().includes(query);
        const restaurantMatch = item.restaurant_name?.toLowerCase().includes(query);
        const menuItemMatch = item.menu_item_name?.toLowerCase().includes(query);
        
        return commentMatch || userMatch || recipeMatch || restaurantMatch || menuItemMatch;
    });

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    const formatEventDate = (dateString) => {
        if (!dateString) return "";
        const options = { year: 'numeric', month: 'short', day: 'numeric' };
        return new Date(dateString).toLocaleDateString('en-US', options);
    };

    return (
        <Container maxWidth="md" sx={{ py: 4 }}>
            {/* Header Area */}
            <Box sx={{ 
                mb: 4, 
                p: 4, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                textAlign: 'center'
            }}>
                <Typography variant="h2" sx={{ fontWeight: '800', mb: 1, letterSpacing: '-0.5px' }}>
                    Foodie Feed
                </Typography>
                <Typography variant="body1" sx={{ opacity: 0.8, maxWidth: '600px', mx: 'auto' }}>
                    See what others are cooking in their kitchens and ordering at local restaurants.
                </Typography>
            </Box>

            {/* Controls: Search and Filters */}
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 4 }} alignItems="center" justifyContent="space-between">
                <ButtonGroup variant="outlined" color="primary" fullWidth sx={{ maxWidth: { sm: '400px' } }}>
                    <Button 
                        variant={activeTab === "all" ? "contained" : "outlined"}
                        onClick={() => setActiveTab("all")}
                        sx={{ textTransform: 'none', fontWeight: '600' }}
                    >
                        All
                    </Button>
                    <Button 
                        variant={activeTab === "cooked_instance" ? "contained" : "outlined"}
                        onClick={() => setActiveTab("cooked_instance")}
                        startIcon={<RestaurantMenuIcon />}
                        sx={{ textTransform: 'none', fontWeight: '600' }}
                    >
                        Recipes
                    </Button>
                    <Button 
                        variant={activeTab === "restaurant_menu_item" ? "contained" : "outlined"}
                        onClick={() => setActiveTab("restaurant_menu_item")}
                        startIcon={<StorefrontIcon />}
                        sx={{ textTransform: 'none', fontWeight: '600' }}
                    >
                        Restaurants
                    </Button>
                </ButtonGroup>

                <TextField
                    placeholder="Search comments, users, recipes..."
                    size="small"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    InputProps={{
                        startAdornment: <SearchIcon color="action" sx={{ mr: 1 }} />,
                    }}
                    sx={{ width: { xs: '100%', sm: '300px' } }}
                />
            </Stack>

            {/* Error and Loading States */}
            {error && (
                <Alert severity="error" sx={{ mb: 4, borderRadius: 2 }}>
                    Error loading feed: {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
                    <CircularProgress color="primary" size={50} />
                </Box>
            ) : (
                <Stack spacing={3}>
                    {filteredComments.length === 0 ? (
                        <Card sx={{ p: 4, textAlign: 'center', border: '1px dashed #ccc', borderRadius: 3 }}>
                            <ChatBubbleOutlineIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2, opacity: 0.5 }} />
                            <Typography variant="h6" color="text.secondary">
                                No comments found
                            </Typography>
                            <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                                Try adjusting your search query or filters.
                            </Typography>
                        </Card>
                    ) : (
                        filteredComments.map((item) => {
                            const isRecipe = item.type === "cooked_instance";
                            const avatarColor = stringToColor(item.user_name);
                            const initial = item.user_name ? item.user_name.charAt(0).toUpperCase() : "A";

                            return (
                                <Card 
                                    key={item.id} 
                                    sx={{ 
                                        borderRadius: 3, 
                                        transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
                                        '&:hover': { 
                                            transform: 'translateY(-4px)',
                                            boxShadow: '0 8px 24px rgba(0,0,0,0.12)'
                                        },
                                        border: '1px solid',
                                        borderColor: 'divider',
                                        overflow: 'hidden'
                                    }}
                                >
                                    {/* Accent banner depending on comment type */}
                                    <Box sx={{ 
                                        height: '6px', 
                                        bgcolor: isRecipe ? 'primary.main' : 'secondary.main' 
                                    }} />
                                    
                                    <CardContent sx={{ p: 3 }}>
                                        {/* User & Date Header */}
                                        <Box display="flex" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
                                            <Box display="flex" alignItems="center" gap={2}>
                                                <Avatar sx={{ bgcolor: avatarColor, color: '#fff', fontWeight: 'bold' }}>
                                                    {initial}
                                                </Avatar>
                                                <Box>
                                                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', lineHeight: 1.2 }}>
                                                        {item.user_name}
                                                    </Typography>
                                                    <Box display="flex" alignItems="center" gap={1} sx={{ mt: 0.5 }}>
                                                        <Chip 
                                                            size="small" 
                                                            icon={isRecipe ? <RestaurantMenuIcon style={{ fontSize: 14 }} /> : <StorefrontIcon style={{ fontSize: 14 }} />} 
                                                            label={isRecipe ? "Cooked" : "Dined"} 
                                                            color={isRecipe ? "primary" : "secondary"}
                                                            variant="outlined"
                                                            sx={{ height: 20, fontSize: '0.7rem', fontWeight: 'bold' }}
                                                        />
                                                        {item.event_date && (
                                                            <Typography variant="caption" color="text.secondary" display="flex" alignItems="center" gap={0.5}>
                                                                <CalendarTodayIcon sx={{ fontSize: 11 }} />
                                                                {formatEventDate(item.event_date)}
                                                            </Typography>
                                                        )}
                                                    </Box>
                                                </Box>
                                            </Box>
                                            
                                            <Typography variant="caption" color="text.secondary" sx={{ display: { xs: 'none', sm: 'block' } }}>
                                                {formatDate(item.created_at)}
                                            </Typography>
                                        </Box>

                                        {/* Rating (Restaurant only) */}
                                        {!isRecipe && item.rating && (
                                            <Box display="flex" alignItems="center" gap={1} sx={{ mb: 1.5 }}>
                                                <Rating value={item.rating} readOnly size="small" />
                                                <Typography variant="caption" sx={{ fontWeight: '600' }}>
                                                    ({item.rating}/5)
                                                </Typography>
                                            </Box>
                                        )}

                                        {/* Comment Body */}
                                        <Typography 
                                            variant="body1" 
                                            sx={{ 
                                                fontStyle: 'italic', 
                                                my: 2, 
                                                pl: 2, 
                                                borderLeft: '4px solid',
                                                borderColor: isRecipe ? 'primary.main' : 'secondary.main',
                                                color: 'text.primary',
                                                lineHeight: 1.6
                                            }}
                                        >
                                            "{item.comment}"
                                        </Typography>

                                        <Divider sx={{ my: 2 }} />

                                        {/* Context Link Footer */}
                                        <Box display="flex" justifyContent="space-between" alignItems="center">
                                            {isRecipe ? (
                                                <Box>
                                                    <Typography variant="caption" color="text.secondary" display="block">
                                                        Recipe
                                                    </Typography>
                                                    <Link 
                                                        to={`/recipes/${item.recipe_id}`} 
                                                        style={{ 
                                                            textDecoration: 'none', 
                                                            color: theme.palette.primary.main, 
                                                            fontWeight: '600' 
                                                        }}
                                                    >
                                                        {item.recipe_name}
                                                    </Link>
                                                </Box>
                                            ) : (
                                                <Box display="flex" gap={3}>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Restaurant
                                                        </Typography>
                                                        <Link 
                                                            to={`/restaurants/${item.restaurant_id}`} 
                                                            style={{ 
                                                                textDecoration: 'none', 
                                                                color: theme.palette.secondary.main, 
                                                                fontWeight: '600' 
                                                            }}
                                                        >
                                                            {item.restaurant_name}
                                                        </Link>
                                                    </Box>
                                                    <Box>
                                                        <Typography variant="caption" color="text.secondary" display="block">
                                                            Ordered Item
                                                        </Typography>
                                                        <Typography variant="body2" sx={{ fontWeight: '600' }}>
                                                            {item.menu_item_name}
                                                        </Typography>
                                                    </Box>
                                                </Box>
                                            )}
                                        </Box>
                                    </CardContent>
                                </Card>
                            );
                        })
                    )}
                </Stack>
            )}
        </Container>
    );
}

export default CommentFeed;
