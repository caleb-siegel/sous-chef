import React, { useState, useEffect } from "react";
import { 
    Button, Card, CardHeader, CardMedia, Container, TextField, 
    Typography, CircularProgress, Alert, Box, IconButton,
    Dialog, DialogTitle, DialogContent, DialogActions,
    CardContent, Divider
} from "@mui/material";
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import { useOutletContext, Link } from "react-router-dom";

function RestaurantDirectory() {
    const { user, backendUrl } = useOutletContext();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [restaurants, setRestaurants] = useState([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [externalResults, setExternalResults] = useState([]);
    const [openDialog, setOpenDialog] = useState(false);
    const [newRestaurantData, setNewRestaurantData] = useState({ name: "", address: "", website: "" });
    const [isExternalSearch, setIsExternalSearch] = useState(false);
    const [externalSearchLoading, setExternalSearchLoading] = useState(false);
    const [apiConfigError, setApiConfigError] = useState(null);

    const fetchRestaurants = async (query = "") => {
        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/api/restaurants?search=${query}`, {
                credentials: 'include'
            });
            if (!response.ok) throw new Error("Failed to fetch restaurants");
            const data = await response.json();
            setRestaurants(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRestaurants();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setApiConfigError(null);
        if (isExternalSearch) {
            try {
                setExternalSearchLoading(true);
                const response = await fetch(`${backendUrl}/api/restaurants/search-external?query=${searchQuery}`, {
                    credentials: 'include'
                });
                const data = await response.json();
                console.log("DEBUG: External Search Response:", data);
                if (data.message && (data.message.includes("not configured") || data.message.includes("Google API Error"))) {
                    setApiConfigError(data.message);
                }
                setExternalResults(data); // Store full data object to access error_details
            } catch (err) {
                setError("External search failed");
            } finally {
                setExternalSearchLoading(false);
            }
        } else {
            fetchRestaurants(searchQuery);
            setExternalResults([]);
        }
    };

    const handleAddRestaurant = async (restaurantData) => {
        try {
            setLoading(true);
            const response = await fetch(`${backendUrl}/api/restaurants`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(restaurantData)
            });
            if (!response.ok) throw new Error("Failed to save restaurant");
            const newRestaurant = await response.json();
            setRestaurants(prev => [newRestaurant, ...prev]);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container sx={{ py: 4 }}>
            <Typography variant="h2" gutterBottom color="primary">
                Foodie's Log: Restaurants
            </Typography>

            <Box component="form" onSubmit={handleSearch} sx={{ mb: 4 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                    <TextField 
                        fullWidth 
                        label={isExternalSearch ? "Search Google for restaurants..." : "Search your saved restaurants..."}
                        variant="outlined" 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <Button variant="contained" type="submit" startIcon={<SearchIcon />} disabled={externalSearchLoading}>
                        {externalSearchLoading ? "Searching..." : "Search"}
                    </Button>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Typography variant="body2">Search mode:</Typography>
                    <Button 
                        size="small" 
                        variant={!isExternalSearch ? "contained" : "outlined"} 
                        onClick={() => setIsExternalSearch(false)}
                    >
                        My List
                    </Button>
                    <Button 
                        size="small" 
                        variant={isExternalSearch ? "contained" : "outlined"} 
                        onClick={() => setIsExternalSearch(true)}
                    >
                        Google Places
                    </Button>
                </Box>
            </Box>

            {apiConfigError && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{apiConfigError}</Typography>
                    {externalResults?.error_details && (
                        <Typography variant="body2" sx={{ my: 1, p: 1, bgcolor: 'rgba(0,0,0,0.05)', borderRadius: 1 }}>
                            {externalResults.error_details}
                        </Typography>
                    )}
                    <Typography variant="caption" display="block" sx={{ mt: 1 }}>
                        To enable this, ensure <code>GOOGLE_PLACES_API_KEY</code> is in your <code>.env</code> and the Places API is enabled in your Google Cloud Console.
                    </Typography>
                </Alert>
            )}

            {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

            {/* External Search Results */}
            {isExternalSearch && Array.isArray(externalResults?.results) && externalResults.results.length > 0 && (
                <Box sx={{ mb: 6 }}>
                    <Typography variant="h5" gutterBottom color="secondary">External Results</Typography>
                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                        {externalResults.results.map((result) => (
                            <Card key={result.external_id} sx={{ width: 300, display: 'flex', flexDirection: 'column' }}>
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={result.picture || "/favicon3.jpeg"}
                                    alt={result.name}
                                />
                                <CardContent sx={{ flexGrow: 1 }}>
                                    <Typography variant="h6">{result.name}</Typography>
                                    <Typography variant="body2" color="text.secondary" noWrap>
                                        {result.address}
                                    </Typography>
                                    <Typography variant="caption" display="block">
                                        Rating: {result.rating || 'N/A'} ⭐
                                    </Typography>
                                </CardContent>
                                <Box sx={{ p: 1, textAlign: 'center' }}>
                                    <Button 
                                        fullWidth 
                                        variant="outlined" 
                                        startIcon={<AddIcon />}
                                        onClick={() => handleAddRestaurant(result)}
                                    >
                                        Save to My List
                                    </Button>
                                </Box>
                            </Card>
                        ))}
                    </Box>
                    <Divider sx={{ my: 4 }} />
                </Box>
            )}

            {/* My Restaurants */}
            <Typography variant="h5" gutterBottom color="primary">My Saved Restaurants</Typography>

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {restaurants.length === 0 && !loading && (
                        <Typography variant="body1">No restaurants found. Try adding one!</Typography>
                    )}
                    {restaurants.map((restaurant) => (
                        <Link to={`/restaurants/${restaurant.id}`} key={restaurant.id} style={{ textDecoration: 'none' }}>
                            <Card sx={{ width: 300, height: '100%', borderRadius: 2, '&:hover': { boxShadow: 6 } }}>
                                <CardHeader title={restaurant.name} subheader={restaurant.address} />
                                <CardMedia
                                    component="img"
                                    height="140"
                                    image={restaurant.picture || "/favicon3.jpeg"}
                                    alt={restaurant.name}
                                />
                                <Box sx={{ p: 2 }}>
                                    <Typography variant="body2" color="text.secondary">
                                        {restaurant.menu_items?.length || 0} items ordered
                                    </Typography>
                                </Box>
                            </Card>
                        </Link>
                    ))}
                    
                    {/* Add New Quick Entry */}
                    <Card sx={{ width: 300, display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px dashed #ccc', cursor: 'pointer' }}
                        onClick={() => setOpenDialog(true)}
                    >
                        <Box sx={{ textAlign: 'center', p: 4 }}>
                            <AddIcon fontSize="large" color="disabled" />
                            <Typography color="text.secondary">Add Restaurant</Typography>
                        </Box>
                    </Card>
                </Box>
            )}

            {/* Add Restaurant Dialog */}
            <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth maxWidth="sm">
                <DialogTitle>Add New Restaurant</DialogTitle>
                <DialogContent>
                    <Box sx={{ pt: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <TextField
                            label="Restaurant Name"
                            fullWidth
                            value={newRestaurantData.name}
                            onChange={(e) => setNewRestaurantData({ ...newRestaurantData, name: e.target.value })}
                            autoFocus
                        />
                        <TextField
                            label="Address (Optional)"
                            fullWidth
                            value={newRestaurantData.address}
                            onChange={(e) => setNewRestaurantData({ ...newRestaurantData, address: e.target.value })}
                        />
                        <TextField
                            label="Website URL (Optional)"
                            fullWidth
                            value={newRestaurantData.website}
                            onChange={(e) => setNewRestaurantData({ ...newRestaurantData, website: e.target.value })}
                        />
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                    <Button 
                        variant="contained" 
                        onClick={() => {
                            handleAddRestaurant(newRestaurantData);
                            setOpenDialog(false);
                            setNewRestaurantData({ name: "", address: "", website: "" });
                        }}
                        disabled={!newRestaurantData.name}
                    >
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Container>
    );
}

export default RestaurantDirectory;
