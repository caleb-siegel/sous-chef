import React, { useState, useEffect } from "react";
import AddRecipe from "./AddRecipe";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Card, CardContent, CardHeader, CardMedia, Container } from "@mui/material";
import Chip from "@mui/material/Chip";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Filter from "./Filter";
import FavoriteIcon from '@mui/icons-material/Favorite';
import IconButton from "@mui/material/IconButton";
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useOutletContext } from "react-router-dom";
import Alert from "@mui/material/Alert";
import Divider from '@mui/material/Divider';
import BottomNavigation from "@mui/material/BottomNavigation";
import BottomNavigationAction from "@mui/material/BottomNavigationAction";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import PersonIcon from '@mui/icons-material/Person';
import UserRecipeTagsPopover from "./UserRecipeTagsPopover";
import UserRecipeTagsMenu from "./UserRecipeTagsMenu";

function RecipeDirectory() {
    const {user} = useOutletContext();

    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/recipes")
        .then((response) => response.json())
        .then((data) => setRecipes(data));
    }, []);

    const [tags, setTags] = useState([]);
    useEffect(() => {
        fetch("/api/tags")
        .then((response) => response.json())
        .then((data) => setTags(data));
    }, []);

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch("/api/usertags")
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, []);
    
    const [userRecipes, setUserRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/userrecipes")
        .then((response) => response.json())
        .then((data) => setUserRecipes(data));
    }, []);

    const [toggleRecipes, setToggleRecipes] = useState("allrecipes");
    const handleToggleRecipes = (event) => {
        setToggleRecipes(event)
    }

    let recipelist;
    let allRecipesToggleButtonVariant;
    let yourRecipesToggleButtonVariant;
    let interestRecipesToggleButtonVariant;
    let notReorderRecipesToggleButtonVariant;
    if (toggleRecipes === "allrecipes") {
        allRecipesToggleButtonVariant = "outlined"
        yourRecipesToggleButtonVariant = "contained"
        interestRecipesToggleButtonVariant = "contained"
        notReorderRecipesToggleButtonVariant = "contained"
        recipelist = recipes
    } else if (toggleRecipes === "yourrecipes") {
        allRecipesToggleButtonVariant = "contained"
        yourRecipesToggleButtonVariant = "outlined"
        interestRecipesToggleButtonVariant = "contained"
        notReorderRecipesToggleButtonVariant = "contained"
        recipelist = recipes.filter(recipe => {
            return (
                recipe.user_recipes.some(userRecipe => userRecipe.user_id === user.id)
                &&
                recipe.user_recipe_tags.every(userRecipe => userRecipe.user_tag.name !== "not a reorder")    
            )
        })
    } else if (toggleRecipes === "interest") {
        allRecipesToggleButtonVariant = "contained"
        yourRecipesToggleButtonVariant = "contained"
        interestRecipesToggleButtonVariant = "outlined"
        notReorderRecipesToggleButtonVariant = "contained"
        recipelist = recipes.filter(recipe => {
            return (
                recipe.user_recipe_tags.some(user_recipe_tag => user_recipe_tag.user_tag.name === "interest")
                &&
                recipe.user_recipes.some(userRecipe => userRecipe.user_id === user.id)
            )
        })
    } else if (toggleRecipes === "notreorder") {
        allRecipesToggleButtonVariant = "contained"
        yourRecipesToggleButtonVariant = "contained"
        interestRecipesToggleButtonVariant = "contained"
        notReorderRecipesToggleButtonVariant = "outlined"
        recipelist = recipes.filter(recipe => {
            return (
                recipe.user_recipe_tags.some(user_recipe_tag => user_recipe_tag.user_tag.name === "not a reorder")
                &&
                recipe.user_recipes.some(userRecipe => userRecipe.user_id === user.id)
            )
        })    
    }

    const [addRecipe, setAddRecipe] = useState(false)
    let addRecipeButtonText;
    let variantAddRecipe;
    let startIconAddRecipe;
    if (addRecipe) {
        addRecipeButtonText = "Hide Recipe Form"
        variantAddRecipe = "outlined"
        startIconAddRecipe = <RemoveIcon />
    } else {
        addRecipeButtonText = "Add New Recipe"
        variantAddRecipe = "contained"
        startIconAddRecipe = <AddIcon />
    }

    const handleAddRecipe = (event) => {
        event.preventDefault();
        setAddRecipe(!addRecipe);
    };


    const [addFilter, setAddFilter] = useState(false)
    let filterButtonText;
    let variantFilter;
    if (addFilter) {
        filterButtonText = "Hide Filter"
        variantFilter = "outlined"
    } else {
        filterButtonText = "Filter Recipes"
        variantFilter = "contained"
    }
    const handleAddFilter = (event) => {
        event.preventDefault();
        setAddFilter(!addFilter);
    };

    const [filterType, setFilterType] = useState('include');
    const [filterBy, setFilterBy] = useState('recipeName');
    const [filterValue, setFilterValue] = useState('');

    const handleFilterTypeChange = (event) => {
        setFilterType(event.target.value);
    };
    const handleFilterByChange = (event) => {
        setFilterBy(event.target.value);
    };
    const handleFilterValueChange = (event) => {
        setFilterValue(event.target.value);
    };

    const filteredRecipes = recipelist.filter(recipe => {
        if (filterType === "include") {
            if (filterBy === "recipeName") {
                return (
                    recipe && 
                    recipe.name && 
                    recipe.name.toLowerCase().includes(filterValue.toLowerCase())
                );
            } else if (filterBy === "tag") {
                if (filterValue === "") {
                    return true
                } else {
                    return (
                        recipe &&
                        recipe.recipe_tags &&
                        recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === filterValue.toLowerCase()))
                    )
                }
            } else if (filterBy === "ingredients") {
                return (
                    recipe && 
                    recipe.name && 
                    recipe.recipe_ingredients.some(ingredient => (ingredient.name && ingredient.name.toLowerCase().includes(filterValue.toLowerCase())))
                );
            }
        } else if (filterType === "exclude") {
            if (filterValue === '') return true;
            if (filterBy === "recipeName") {
                return !recipe.name.toLowerCase().includes(filterValue.toLowerCase());
            } else if (filterBy === "tag") {
                return (
                        recipe &&
                        recipe.recipe_tags &&
                        !recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === filterValue.toLowerCase()))
                )
            } else if (filterBy === "ingredients") {
                return !recipe.recipe_ingredients.some(ingredient => (ingredient.name && ingredient.name.toLowerCase().includes(filterValue.toLowerCase())))            }
        }    
    });
    
    const handleFavorites = (event, recipeId) => {

        const isFavorite = userRecipes.some(userRecipe => userRecipe.recipe_id === recipeId);

        if (!isFavorite) {
            const userRecipeData = {
                user_id: user.id,
                recipe_id: recipeId,
                not_reorder: false,
                comments: ''
            };
    
            fetch("/api/userrecipes", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userRecipeData),
            })
            .then((response) => response.json())
            .then((newUserRecipe) => {
                setUserRecipes([...userRecipes, newUserRecipe]);
                setRecipes([...recipes, newUserRecipe]);
            })
            .catch((error) => {
                console.error("Error adding recipe to favorites:", error);
            });
        } else {
            const userRecipeIdToRemove = userRecipes.find(userRecipe => userRecipe.recipe_id === recipeId).id;

            fetch(`/api/userrecipes/${userRecipeIdToRemove}`, {
                method: "DELETE",
            })
            .then(() => {
                setUserRecipes(userRecipes.filter(userRecipe => userRecipe.id !== userRecipeIdToRemove));
                setRecipes(recipes.filter(recipe => recipe.id !== userRecipeIdToRemove));
            })
            .catch((error) => {
                console.error("Error removing recipe from favorites:", error);
            });
        }
    };

    // const [showAddUserRecipe, setShowAddUserRecipe] = useState(null);
    // const [selectedRecipeId, setSelectedRecipeId] = useState(null);

    // const handleAddUserTagsClick = (event) => {
    //     setShowAddUserRecipe(event.currentTarget)
    //     setSelectedRecipeId(recipeId);
    // };
    const [value, setValue] = useState(0);

    // const handleCloseUserRecipeTags = (recipeIdTag, userTagId) => {
    //     console.log(`this is the recipe id inside the function: ${recipeIdTag}`)
    //     setShowAddUserRecipe(null);
    //     if (userTagId !== null) {
    //         fetch('/api/userrecipetags', {
    //             method: 'POST',
    //             headers: {
    //                 'Content-Type': 'application/json',
    //             },
    //             body: JSON.stringify({
    //                 user_id: user.id,
    //                 recipe_id: recipeIdTag,
    //                 user_tag_id: userTagId,
    //             }),
    //         })
    //         .then((response) => response.json())
    //         .then(response => {
    //             console.log('User tag posted successfully:', response.data);
    //         })
    //         .catch(error => {
    //             console.error('Error posting user tag:', error);
    //         });
    //     };
    // }
    
    const [anchorEl, setAnchorEl] = useState(null);
    const [tagSelect, setTagSelect] = useState("")

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null) {
            fetch('/api/userrecipetags', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    user_id: user.id,
                    recipe_id: recipeIdTag,
                    user_tag_id: userTagId,
                }),
            })
            .then((response) => response.json())
            .then(response => {
                console.log('User tag posted successfully:', response.data);
            })
            .catch(error => {
                console.error('Error posting user tag:', error);
            });
        };        handleClose();
    };

    const open = Boolean(anchorEl);

    return (
        <Container>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Recipe Directory</h1>
                <Button variant={variantAddRecipe} color="primary" size="small" startIcon={startIconAddRecipe} value={addRecipe} onClick={(event) => handleAddRecipe(event)}>{addRecipeButtonText}</Button>
            </div>
            {addRecipe &&
                <AddRecipe recipes={recipes} setRecipes={setRecipes} handleAddRecipe={handleAddRecipe} tags={tags}/>
            }
            <br/>
            <Button variant={variantFilter} color="primary" size="small" startIcon={<FilterAltIcon />} value={addFilter} onClick={(event) => handleAddFilter(event)}>{filterButtonText}</Button>
            <br />
            {addFilter &&
                <Filter recipes={recipes} setRecipes={setRecipes} handleAddRecipe={handleAddRecipe} filterValue={filterValue} handleFilterValueChange={handleFilterValueChange} filterType={filterType} handleFilterTypeChange={handleFilterTypeChange} filterBy={filterBy} handleFilterByChange={handleFilterByChange} tags={tags}/>
            }
            <br/>
            <Container>
                <Button variant={allRecipesToggleButtonVariant} color="primary" size="small" value="allrecipes" onClick={(event) => handleToggleRecipes(event.target.value)}>All Recipes</Button>
                { user && <Button variant={yourRecipesToggleButtonVariant} color="primary" size="small" value="yourrecipes" onClick={(event) => handleToggleRecipes(event.target.value)}>Your Recipes</Button>}
                { user && <Button variant={interestRecipesToggleButtonVariant} color="primary" size="small" value="interest" onClick={(event) => handleToggleRecipes(event.target.value)}>Interest</Button>}
                { user && <Button variant={notReorderRecipesToggleButtonVariant} color="primary" size="small" value="notreorder" onClick={(event) => handleToggleRecipes(event.target.value)}>Not Reorders</Button>}
            </Container>
            <br/>
            <Container>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                >
                    <BottomNavigationAction label="All Recipes" icon={<AddIcon />} onClick={(event) => handleToggleRecipes("allrecipes")}/>
                    <BottomNavigationAction label="Your Recipes" icon={<PersonIcon />} onClick={(event) => handleToggleRecipes("yourrecipes")}/>
                    <BottomNavigationAction label="Interests" icon={<ThumbUpOffAltIcon />} onClick={(event) => handleToggleRecipes("interest")}/>
                    <BottomNavigationAction label="Not Reorder" icon={<ThumbDownOffAltIcon />} onClick={(event) => handleToggleRecipes("notreorder")}/>
                </BottomNavigation>
            </Container>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} sx={{ maxWidth: 345, margin: '10px', padding: '10px' }}>
                        <CardHeader
                        title={recipe.name}
                        action={
                            user && 
                                <IconButton size="small" sx={{ bgcolor:"primary" }} onClick={(event) => handleFavorites(event, recipe.id)}>
                                    {userRecipes.some(userRecipe => userRecipe.recipe_id === recipe.id) ? <FavoriteIcon color="primary"/> : <FavoriteBorderIcon color="primary"/>}
                                </IconButton>
                        }
                        // action={
                        //     <IconButton aria-label="settings">
                        //     <MoreVertIcon />
                        //     </IconButton>
                        // }
                        
                        // subheader=
                        />
                        {/* <Alert severity="error" onClose={handleCloseAlert} open={showAlert}>
                            Sign in to save recipe to your cookbook
                        </Alert> */}
                        <CardMedia
                        component="img"
                        height="194"
                        image={recipe.picture}
                        alt={recipe.name}
                        />
                        {/* <Divider /> */}
                        {recipe.recipe_tags.map(tag => {
                            if (tag && tag.tag) {
                                return <Chip key={tag.tag.id} size="small" label={tag.tag.name} color="primary" sx={{ margin: '1px'}}/>
                            }
                        })}
                        {recipe.user_recipe_tags.map(user_recipe_tag => {
                            if (user_recipe_tag) {
                                return <Chip key={user_recipe_tag.id} size="small" label={user_recipe_tag.user_tag.name} color="secondary" sx={{ margin: '1px'}}/>
                            }
                        })}
                        {user && <UserRecipeTagsPopover recipeId={recipe.id} userTags={userTags} handleTagSelect={handleTagSelect}/>}
                        {/* // <CardContent>
                        // <Typography variant="body2" color="text.secondary">
                        //     This impressive paella is a perfect party dish and a fun meal to cook
                        //     together with your guests. Add 1 cup of frozen peas along with the mussels,
                        //     if you like.
                        // </Typography>
                        // </CardContent>
                        // <CardActions disableSpacing>
                        // <IconButton aria-label="add to favorites">
                        //     <FavoriteIcon />
                        // </IconButton>
                        // <IconButton aria-label="share">
                        //     <ShareIcon />
                        // </IconButton>
                        // <ExpandMore
                        //     expand={expanded}
                        //     onClick={handleExpandClick}
                        //     aria-expanded={expanded}
                        //     aria-label="show more"
                        // >
                        //     <ExpandMoreIcon />
                        // </ExpandMore>
                        // </CardActions>
                        // <Collapse in={expanded} timeout="auto" unmountOnExit>
                        // <CardContent>
                        //     <Typography paragraph>Method:</Typography>
                        //     <Typography paragraph>
                        //     Heat 1/2 cup of the broth in a pot until simmering, add saffron and set
                        //     aside for 10 minutes.
                        //     </Typography>
                        //     <Typography paragraph>
                        //     Heat oil in a (14- to 16-inch) paella pan or a large, deep skillet over
                        //     medium-high heat. Add chicken, shrimp and chorizo, and cook, stirring
                        //     occasionally until lightly browned, 6 to 8 minutes. Transfer shrimp to a
                        //     large plate and set aside, leaving chicken and chorizo in the pan. Add
                        //     pimentón, bay leaves, garlic, tomatoes, onion, salt and pepper, and cook,
                        //     stirring often until thickened and fragrant, about 10 minutes. Add
                        //     saffron broth and remaining 4 1/2 cups chicken broth; bring to a boil.
                        //     </Typography>
                        //     <Typography paragraph>
                        //     Add rice and stir very gently to distribute. Top with artichokes and
                        //     peppers, and cook without stirring, until most of the liquid is absorbed,
                        //     15 to 18 minutes. Reduce heat to medium-low, add reserved shrimp and
                        //     mussels, tucking them down into the rice, and cook again without
                        //     stirring, until mussels have opened and rice is just tender, 5 to 7
                        //     minutes more. (Discard any mussels that don&apos;t open.)
                        //     </Typography>
                        //     <Typography>
                        //     Set aside off of the heat to let rest for 10 minutes, and then serve.
                        //     </Typography>
                        // </CardContent>
                        // </Collapse> */}
                    </Card>
                ))}
            </div>
        </Container>
    )
}

export default RecipeDirectory;