import React, { useState, useEffect } from "react";
import { 
    Button, Container, TextField, Typography, CircularProgress, 
    Alert, Box, Card, CardContent, Divider, Rating, IconButton
} from "@mui/material";
import { useParams, useOutletContext, useNavigate } from "react-router-dom";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import SaveIcon from '@mui/icons-material/Save';

function RestaurantPage() {
    const { id } = useParams();
    const { user, backendUrl } = useOutletContext();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [restaurant, setRestaurant] = useState(null);
    const [menuItems, setMenuItems] = useState([]);
    const [notes, setNotes] = useState([]);
    
    // Form states
    const [newItemName, setNewItemName] = useState("");
    const [newNote, setNewNote] = useState("");
    const [newRating, setNewRating] = useState(3);
    const [activeMenuItemId, setActiveMenuItemId] = useState(null);

    const fetchData = async () => {
        try {
            setLoading(true);
            const [resData, itemsData, notesData] = await Promise.all([
                fetch(`${backendUrl}/api/restaurants/${id}`, { credentials: 'include' }).then(r => r.json()),
                fetch(`${backendUrl}/api/restaurants/${id}/menu-items`, { credentials: 'include' }).then(r => r.json()),
                fetch(`${backendUrl}/api/user_restaurant_notes?restaurant_id=${id}`, { credentials: 'include' }).then(r => r.json())
            ]);
            
            setRestaurant(resData);
            setMenuItems(Array.isArray(itemsData) ? itemsData : []);
            setNotes(Array.isArray(notesData) ? notesData : []);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, [id]);

    const handleAddItem = async (e) => {
        e.preventDefault();
        if (!newItemName) return;
        
        try {
            const response = await fetch(`${backendUrl}/api/restaurants/${id}/menu-items`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({ name: newItemName })
            });
            const data = await response.json();
            setMenuItems(prev => [...prev, data]);
            setNewItemName("");
        } catch (err) {
            setError("Failed to add item");
        }
    };

    const handleSaveNote = async (menuItemId = null) => {
        try {
            const response = await fetch(`${backendUrl}/api/user_restaurant_notes`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify({
                    restaurant_id: id,
                    menu_item_id: menuItemId,
                    note: newNote,
                    rating: newRating,
                    date_eaten: new Date().toISOString()
                })
            });
            const data = await response.json();
            if (response.ok) {
                setNotes(prev => [data, ...(Array.isArray(prev) ? prev : [])]);
                setNewNote("");
                setActiveMenuItemId(null);
            } else {
                setError(data.error || "Failed to save note");
            }
        } catch (err) {
            setError("Failed to save note");
        }
    };

    if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}><CircularProgress /></Box>;
    if (error) return <Container><Alert severity="error">{error}</Alert></Container>;

    return (
        <Container sx={{ py: 4 }}>
            <Box sx={{ 
                mb: 4, 
                p: 4, 
                borderRadius: 4, 
                background: 'linear-gradient(135deg, #102A43 0%, #243B53 100%)',
                color: 'white',
                boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
            }}>
                <Button 
                    startIcon={<ArrowBackIcon />} 
                    onClick={() => navigate("/restaurants")} 
                    sx={{ mb: 2, color: 'white', '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' } }}
                >
                    Back to Restaurants
                </Button>
                
                <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
                    {restaurant?.name}
                </Typography>
                <Typography variant="h6" sx={{ opacity: 0.8, display: 'flex', alignItems: 'center', gap: 1 }}>
                    📍 {restaurant?.address || "No address provided"}
                </Typography>
            </Box>

            <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 4 }}>
                    {/* Left side: Menu Items / Orders */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom>What have you ordered?</Typography>
                    <Box component="form" onSubmit={handleAddItem} sx={{ mb: 3, display: 'flex', gap: 1 }}>
                        <TextField 
                            size="small" 
                            label="Add an item you tried..." 
                            fullWidth 
                            value={newItemName}
                            onChange={(e) => setNewItemName(e.target.value)}
                        />
                        <Button variant="outlined" type="submit" startIcon={<AddIcon />}>Add</Button>
                    </Box>

                    {Array.isArray(menuItems) && menuItems.map(item => (
                        <Card key={item.id} sx={{ mb: 2, bgcolor: activeMenuItemId === item.id ? 'action.hover' : 'background.paper' }}>
                            <CardContent>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                    <Typography variant="h6">{item.name}</Typography>
                                    <Button size="small" onClick={() => setActiveMenuItemId(item.id)}>Add Note</Button>
                                </Box>
                                
                                {activeMenuItemId === item.id && (
                                    <Box sx={{ mt: 2, p: 2, border: '1px solid #eee', borderRadius: 1 }}>
                                        <TextField 
                                            fullWidth 
                                            multiline 
                                            rows={2} 
                                            placeholder="What did you think?" 
                                            value={newNote}
                                            onChange={(e) => setNewNote(e.target.value)}
                                            sx={{ mb: 1 }}
                                        />
                                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                            <Rating value={newRating} onChange={(e, v) => setNewRating(v)} />
                                            <Button variant="contained" startIcon={<SaveIcon />} onClick={() => handleSaveNote(item.id)}>
                                                Save
                                            </Button>
                                        </Box>
                                    </Box>
                                )}

                                {/* Show notes for this specific item */}
                                {Array.isArray(notes) && notes.filter(n => n.menu_item_id === item.id).map(note => (
                                    <Box key={note.id} sx={{ mt: 1, pl: 2, borderLeft: '2px solid orange' }}>
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                            <Rating value={note.rating} readOnly size="small" />
                                            <Typography variant="caption" color="text.secondary">
                                                {new Date(note.date_eaten).toLocaleDateString()}
                                            </Typography>
                                        </Box>
                                        <Typography variant="body2">{note.note}</Typography>
                                    </Box>
                                ))}
                            </CardContent>
                        </Card>
                    ))}
                </Box>

                {/* Right side: General Experience / Timeline */}
                <Box sx={{ flex: 1 }}>
                    <Typography variant="h5" gutterBottom>General Notes</Typography>
                    <Box sx={{ p: 2, bgcolor: 'background.paper', borderRadius: 2, border: '1px dashed #ccc', mb: 3 }}>
                        <TextField 
                            fullWidth 
                            multiline 
                            rows={3} 
                            placeholder="General thoughts on the restaurant..." 
                            value={activeMenuItemId === null ? newNote : ""}
                            onChange={(e) => {setActiveMenuItemId(null); setNewNote(e.target.value)}}
                            sx={{ mb: 1 }}
                        />
                        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Rating value={newRating} onChange={(e, v) => setNewRating(v)} />
                            <Button variant="contained" onClick={() => handleSaveNote(null)}>Save Gen. Note</Button>
                        </Box>
                    </Box>

                    {Array.isArray(notes) && notes.filter(n => !n.menu_item_id).map(note => (
                        <Box key={note.id} sx={{ mb: 2, p: 2, bgcolor: 'background.paper', borderRadius: 2 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                                <Rating value={note.rating} readOnly size="small" />
                                <Typography variant="caption" color="text.secondary">
                                    {new Date(note.date_eaten).toLocaleDateString()}
                                </Typography>
                            </Box>
                            <Typography variant="body2">{note.note}</Typography>
                        </Box>
                    ))}
                </Box>
            </Box>
        </Container>
    );
}

export default RestaurantPage;
