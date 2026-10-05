import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom';
import { Chip, Container, Box, Paper, Badge, Typography, Select, MenuItem, InputLabel, Card, CardContent, TextField, Button, IconButton, CircularProgress } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import UserRecipeTagsMenu from './UserRecipeTagsMenu';
import AddToMealPrep from './AddToMealPrep';
import FavoriteIcon from '@mui/icons-material/Favorite';
import RecipeCardsOptions from './RecipeCardsOptions';
import { useOutletContext } from "react-router-dom";

function RecipePage({ recipe, user, editRecipe, handleEditRecipe }) {
    const { backendUrl } = useOutletContext();
    const navigate = useNavigate();
    
    const [dimensions, setDimensions] = useState(1)
    
    const handleDimensions = (event) => {
        setDimensions(event.target.value)
    }

    // Check if reference is an Instagram URL and convert to embed format
    const isInstagramUrl = (url) => {
        if (!url) return false;
        return url.includes('instagram.com') || url.includes('instagr.am');
    };

    const getInstagramEmbedUrl = (url) => {
        if (!url) return null;
        
        // Extract shortcode from various Instagram URL formats
        // Examples:
        // https://www.instagram.com/p/ABC123/
        // https://www.instagram.com/reel/ABC123/
        // https://www.instagram.com/p/ABC123/?utm_source=...
        // https://instagr.am/p/ABC123/
        
        const patterns = [
            /instagram\.com\/p\/([A-Za-z0-9_-]+)/,
            /instagram\.com\/reel\/([A-Za-z0-9_-]+)/,
            /instagr\.am\/p\/([A-Za-z0-9_-]+)/,
        ];

        for (const pattern of patterns) {
            const match = url.match(pattern);
            if (match && match[1]) {
                const shortcode = match[1];
                // Check if it's a reel or post
                if (url.includes('/reel/')) {
                    return `https://www.instagram.com/reel/${shortcode}/embed/`;
                } else {
                    return `https://www.instagram.com/p/${shortcode}/embed/`;
                }
            }
        }
        
        return null;
    };

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/usertags`)
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, [backendUrl]);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const [userRecipeTags, setUserRecipeTags] = useState(recipe?.user_recipe_tags || []);

    useEffect(() => {
        if (recipe?.user_recipe_tags) {
            setUserRecipeTags(recipe.user_recipe_tags);
        }
    }, [recipe?.user_recipe_tags]);

    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null && user) {
            fetch(`${backendUrl}/api/userrecipetags`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then((response) => response.json())
            .then(data => {
                setUserRecipeTags(prev => [...prev, data]);
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        }
        handleClose();
    };

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`${backendUrl}/api/userrecipetags/${id}`, {
            method: "DELETE",
            credentials: 'include',
        })
        .then(() => {
            setUserRecipeTags(prev => prev.filter(tag => tag.id !== id));
        });
    };

    const handleDeleteRecipe = (event, id) => {
        event.preventDefault();
        const confirmed = window.confirm(
            "Are you sure you want to delete this item?"
        );
        if (confirmed) {
            fetch(`${backendUrl}/api/recipes/${id}`, {
                method: "DELETE",
                credentials: 'include',
            })
            .then(() => {
                alert("You have deleted the recipe");
                navigate('/recipes');
            });
        }
    };

    const formatDate = (instance) => {
        const d = instance.cooked_date || instance.created_at;
        if (!d) return "Recently cooked";
        return new Date(d).toLocaleDateString('en-US', { 
            weekday: 'long', month: 'short', day: 'numeric', year: 'numeric' 
        });
    };

    const [comment, setComment] = useState("");
    const [cookedDate, setCookedDate] = useState("");
    
    // Aggregate cooked instances from all user_recipes on this recipe
    const getInitialCookedInstances = (rec) => {
        return (rec?.user_recipes || []).flatMap(user_recipe => 
            (user_recipe.cooked_instances || []).map(ci => ({
                ...ci,
                user_name: user_recipe.user?.first_name 
                    ? `${user_recipe.user.first_name} ${user_recipe.user.last_name || ''}`.trim() 
                    : (user_recipe.user?.name || "Anonymous")
            }))
        );
    };

    const [cookedInstances, setCookedInstances] = useState(getInitialCookedInstances(recipe));

    useEffect(() => {
        if (recipe?.user_recipes) {
            setCookedInstances(getInitialCookedInstances(recipe));
        }
    }, [recipe?.user_recipes]);
    const [showForm, setShowForm] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        const newInstance = {
            recipe_id: recipe.id,
            user_id: user?.id,
            comment: comment,
            cooked_date: cookedDate ? new Date(cookedDate).toISOString() : new Date().toISOString(),
        };

        try {
            const response = await fetch(`${backendUrl}/api/cooked_instances`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: 'include',
                body: JSON.stringify(newInstance),
            });

            if (response.ok) {
                const newEntry = await response.json();
                const userName = user?.first_name 
                    ? `${user.first_name} ${user.last_name || ''}`.trim() 
                    : (user?.name || "You");
                setCookedInstances(prev => [...prev, { ...newEntry, user_name: userName }]);
                setComment("");
                setCookedDate("");
                setShowForm(false);
            } else {
                console.error("Failed to add cooked instance.");
            }
        } catch (error) {
            console.error("Error posting data:", error);
        }
    };
    
    if (!recipe || !recipe.id) {
        return (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh', width: '100%' }}>
                <CircularProgress color="secondary" size={60} />
            </Box>
        );
    }

    return (
        <Box key={recipe.id} >
            <Container disableGutters maxWidth={false}>
                <div style={{ display: 'flex', alignItems: 'center'}}>
                    <Typography variant="h1" color="secondary" >{recipe.name}</Typography>
                    {user && user.id === 2 && <RecipeCardsOptions handleDelete={handleDeleteRecipe} recipeId={recipe.id} editRecipe={editRecipe} handleEditRecipe={handleEditRecipe}/>}
                </div>
                <Badge badgeContent={recipe && recipe.user_recipes && recipe.user_recipes.length} color="primary">
                    <FavoriteIcon color="action" />
                </Badge>
            </Container>
            {recipe.source_category_id === 2 ? (
                <div>This recipe is from {recipe.source} and can be found on Page {recipe.reference}.</div>
            ) : isInstagramUrl(recipe.reference) ? (
                <div>
                    This recipe was sourced from {recipe.source}. 
                    <a href={recipe.reference} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px', color: '#1976d2' }}>
                        View original Instagram post
                    </a>
                </div>
            ) : (
                <div>This recipe was sourced from {recipe.source}</div>
            )}
            <Container disableGutters maxWidth={false}>
                {recipe.recipe_tags && recipe.recipe_tags.map(tag => {
                    if (tag && tag.tag) {
                        return <Chip key={tag.tag.id} label={tag.tag.name} color="primary" sx={{ margin: '1px',}}/>
                    }
                })}
                {userRecipeTags
                    .filter(user_recipe_tag => (user && user.id && (user_recipe_tag.user_id === user.id)))
                    .map(user_recipe_tag => (
                        user_recipe_tag && user_recipe_tag.id && user_recipe_tag.user_tag &&
                        <Chip
                            key={user_recipe_tag.id}
                            size="small"
                            label={user_recipe_tag.user_tag.name}
                            color="secondary"
                            sx={{ margin: '1px'}}
                            onDelete={(event) => handleDeleteUserTag(event, user_recipe_tag.id)}
                        />
                    ))
                }
                {user && <UserRecipeTagsMenu recipeId={recipe.id} tags={userTags} handleTagSelect={handleTagSelect} color="secondary"/>}
                <AddToMealPrep user={user} recipe={recipe}/>
            </Container>
            <Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
                <Paper>
                    {isInstagramUrl(recipe.reference) ? (
                        <Box sx={{ maxWidth: '500px' }}>
                            <iframe
                                src={getInstagramEmbedUrl(recipe.reference)}
                                title="Instagram video"
                                width="100%"
                                height="600"
                                frameBorder="0"
                                scrolling="no"
                                allowTransparency="true"
                                allow="encrypted-media"
                                style={{ 
                                    maxWidth: '500px',
                                    borderRadius: '8px',
                                    overflow: 'hidden'
                                }}
                            />
                            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: 'text.secondary' }}>
                                <a href={recipe.reference} target="_blank" rel="noopener noreferrer" style={{ color: 'inherit' }}>
                                    View on Instagram
                                </a>
                            </Typography>
                        </Box>
                    ) : (
                        <img src={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"} style={{ maxWidth: '500px' }}/>
                    )}
                </Paper>
                <Paper sx={{ marginLeft: '10px' }}>
                    <InputLabel id="dimensions-input-label">Dimensions</InputLabel>
                    <Select
                        labelId={`${recipe.id}`}
                        id={`${recipe.id}`}
                        label="Dimensions"
                        value={dimensions}
                        onChange={(event) => handleDimensions(event)}
                        size="small"
                    >
                        <MenuItem value=""></MenuItem>
                        <MenuItem value="0.5">0.5x</MenuItem>
                        <MenuItem value="1">1x</MenuItem>
                        <MenuItem value="2">2x</MenuItem>
                        <MenuItem value="5">5x</MenuItem>
                        <MenuItem value="10">10x</MenuItem>
                    </Select>
                    <div><strong>Ingredients</strong></div>
                    {recipe.recipe_ingredients && recipe.recipe_ingredients.map(ingredient => {
                        return <li key={ingredient.id}>{ingredient.ingredient_quantity === 0 ? "" : (ingredient.ingredient_quantity * dimensions)} {ingredient.ingredient_unit} {ingredient.ingredient_name} <em>{ingredient.ingredient_note && ingredient.ingredient_note}</em></li>
                    })}
                </Paper>
                <Paper sx={{ display: 'flex', flexWrap: 'wrap' }}>
                    <Container disableGutters maxWidth={false}><strong>Instructions</strong></Container>
                    {recipe.instructions && 
                        recipe.instructions.split(/\s\d+\.\s/).filter(instruction => instruction.trim() !== "").map((instruction, index) => {
                            return  <Container disableGutters maxWidth={false} key={index} sx={{ mt: 2 }}>{index + 1}. {instruction}</Container>;
                        })
                    }
                </Paper>
                <Paper sx={{ p: 2, minWidth: 320, maxWidth: 450 }}>
                    <Container disableGutters maxWidth={false} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="h6" fontWeight="bold">Comments & Cooked Log</Typography>
                        {user && !showForm && (
                            <IconButton 
                                onClick={() => setShowForm(true)} 
                                color="primary" 
                                sx={{ fontSize: 24, borderRadius: '50%', padding: '6px', backgroundColor: '#e6e6e6', boxShadow: 1 }}
                            >
                                <AddIcon />
                            </IconButton>
                        )}
                    </Container>

                    {/* Form */}
                    {user && showForm && (
                        <Box 
                            sx={{
                                padding: 2,
                                backgroundColor: '#fff',
                                borderRadius: '12px',
                                boxShadow: 2,
                                margin: '12px 0',
                            }}
                        >
                            <form onSubmit={handleSubmit}>
                                <TextField
                                    label="Cooked Date"
                                    type="date"
                                    InputLabelProps={{ shrink: true }}
                                    value={cookedDate}
                                    onChange={(e) => setCookedDate(e.target.value)}
                                    fullWidth
                                    size="small"
                                    sx={{ marginBottom: 1.5 }}
                                />
                                <TextField
                                    label="Comment / Note"
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    required
                                    fullWidth
                                    multiline
                                    minRows={2}
                                    size="small"
                                    sx={{ marginBottom: 1.5 }}
                                />
                                <Button type="submit" variant="contained" color="primary" fullWidth sx={{ borderRadius: 20 }}>
                                    Add Cooked Instance
                                </Button>
                                <Button 
                                    onClick={() => setShowForm(false)} 
                                    sx={{ color: 'red', textTransform: 'none', marginTop: 1, display: 'block', width: '100%' }}
                                >
                                    Cancel
                                </Button>
                            </form>
                        </Box>
                    )}

                    {/* Render Cooked Instances */}
                    <div>
                        {cookedInstances.length === 0 ? (
                            <Typography variant="body2" color="textSecondary" sx={{ fontStyle: 'italic', mt: 1 }}>
                                No comments or cooked logs yet.
                            </Typography>
                        ) : (
                            cookedInstances.map((instance) => (
                                <Card 
                                    key={instance.id || `${instance.user_name}-${instance.comment}`} 
                                    sx={{ 
                                        backgroundColor: '#f5f5f5',
                                        boxShadow: 1,
                                        margin: '8px 0',
                                        borderRadius: '8px',
                                        padding: '8px',
                                    }}
                                >
                                    <CardContent sx={{ padding: '4px 8px !important' }}>
                                        <Typography variant="body2" color="primary" fontWeight="bold">
                                            {formatDate(instance)}
                                        </Typography>
                                        <Typography variant="body2" color="textPrimary" sx={{ mt: 0.5 }}>
                                            {instance.comment}
                                        </Typography>
                                        <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 0.5, textAlign: 'right' }}>
                                            -- {instance.user_name || "Anonymous"}
                                        </Typography>
                                    </CardContent>
                                </Card>
                            ))
                        )}
                    </div>                  
                </Paper>
            </Box>
            <br/>
            <br/>
        </Box>
    )
}

export default RecipePage