import React, { useState, useEffect } from "react";
import AddRecipe from "./AddRecipe";
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import { Button, Card, CardContent, CardHeader, CardMedia, Container, Icon, Chip, IconButton, Alert, Divider, BottomNavigation, BottomNavigationAction } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import Filter from "./Filter";
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import { useOutletContext } from "react-router-dom";
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import PersonIcon from '@mui/icons-material/Person';
import UserRecipeTagsMenu from "./UserRecipeTagsMenu";
import AddToMealPrep from "./AddToMealPrep";
import RecipeSkeleton from "./RecipeSkeleton";
import SearchBar from "./SearchBar";
import RecipeCardsOptions from "./RecipeCardsOptions";

function RecipeDirectory() {
    const {user} = useOutletContext();

    const [loading, setLoading] = useState(true);
    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch("/api/recipes")
        .then((response) => response.json())
        .then((data) => {
            setRecipes(data);
            setLoading(false);
        });
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

    const [cookbooks, setCookbooks] = useState([]);
    const [chosenCookbook, setChosenCookbook] = useState("")
    useEffect(() => {
        fetch("/api/recipes")
        .then((response) => response.json())
        .then((data) => {
            const uniqueCookbooks = [];
            data.forEach(cookbook => {
                if (!uniqueCookbooks.includes(cookbook.source)) {
                    uniqueCookbooks.push(cookbook.source);
                }
            });
            setCookbooks(uniqueCookbooks);
        });
    }, []);

    // const [users, setUsers] = useState([])
    // useEffect(() => {
    //     fetch("/api/users")
    //     .then((response) => response.json())
    //     .then((data) => {
    //         data.forEach(user => {
    //             uniqueCookbooks.push(user.name);
    //         });
    //         setCookbooks(uniqueCookbooks);
    //     });
    // }, []);

    let recipeList = recipes;
    if (chosenCookbook) {
        recipeList = recipeList.filter(recipe => chosenCookbook === recipe.source)
    }

    if (toggleRecipes === "allrecipes") {
        recipeList = recipeList
    } else if (toggleRecipes === "yourrecipes") {
        recipeList = recipeList.filter(recipe => {
            return (
                recipe.user_recipes.some(userRecipe => userRecipe.user_id === user.id)
                &&
                recipe.user_recipe_tags.every(userRecipe => userRecipe.user_tag.name !== "not a reorder")    
            )
        })
    } else if (toggleRecipes === "interest") {
        recipeList = recipeList.filter(recipe => {
            return (
                recipe.user_recipe_tags.some(user_recipe_tag => {
                    return (
                        user_recipe_tag.user_tag.name === "interest" &&
                        user_recipe_tag.user_id === user.id
                    )
                })
            )
        })
    } else if (toggleRecipes === "notreorder") {
        recipeList = recipeList.filter(recipe => {
            return (
                recipe.user_recipe_tags.some(user_recipe_tag => {
                    return (
                        user_recipe_tag.user_tag.name === "not a reorder" &&
                        user_recipe_tag.user_id === user.id
                    )
                })
            )
        })    
    }


    const [categorizationButtons, setCategorizationButtons] = useState("allrecipes");
    const handleCategorizationButtons = (event) => {
        setCategorizationButtons(event)
    }

    let outlinedVariant;
    if (categorizationButtons === "allrecipes") {
        outlinedVariant = "allrecipes"
        recipeList = recipeList
    } else if (categorizationButtons === "breakfast") {
        outlinedVariant = "breakfast"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "breakfast"))
            )
        })
    } else if (categorizationButtons === "chicken") {
        outlinedVariant = "chicken"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe && 
                recipe.recipe_ingredients &&
                recipe.recipe_ingredients.some(ingredient => {
                    return (
                        ingredient &&
                        ingredient.ingredient_name.toLowerCase().includes("chicken")
                        // && !ingredient.ingredient_name.toLowerCase().includes("chicken stock")
                    )
                })
            );
        })
    } else if (categorizationButtons === "meat") {
        outlinedVariant = "meat"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "meat")) &&
                !recipe.recipe_ingredients.some(ingredient => {
                    return (
                        ingredient &&
                        ingredient.ingredient_name.toLowerCase().includes("chicken")
                    )
                })
            )
        })    
    } else if (categorizationButtons === "fish") {
        outlinedVariant = "fish"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe && 
                recipe.recipe_ingredients &&
                recipe.recipe_ingredients.some(ingredient => {
                    return (
                        ingredient &&
                        (
                            ingredient.ingredient_name.toLowerCase().includes("salmon") ||
                            ingredient.ingredient_name.toLowerCase().includes("tilapia") ||
                            ingredient.ingredient_name.toLowerCase().includes("flounder") ||
                            ingredient.ingredient_name.toLowerCase().includes("sea bass") ||
                            ingredient.ingredient_name.toLowerCase().includes("tuna")
                        )
                    )
                })
            );
        })
    } else if (categorizationButtons === "dairy") {
        outlinedVariant = "dairy"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "dairy"))
            )
        })    
    } else if (categorizationButtons === "salad") {
        outlinedVariant = "salad"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "salad"))
            )
        })    
    } else if (categorizationButtons === "soup") {
        outlinedVariant = "soup"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "soup"))
            )
        })    
    } else if (categorizationButtons === "sides") {
        outlinedVariant = "sides"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "side"))
            )
        })    
    } else if (categorizationButtons === "condiments") {
        outlinedVariant = "condiments"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "condiment"))
            )
        })    
    } else if (categorizationButtons === "dessert") {
        outlinedVariant = "dessert"
        recipeList = recipeList.filter(recipe => {
            return (
                recipe &&
                recipe.recipe_tags &&
                recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === "dessert"))
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

    const filteredRecipes = recipeList.filter(recipe => {
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
            } else if (filterBy === "usertag") {
                if (filterValue === "") {
                    return true
                } else {
                    return (
                        recipe &&
                        recipe.user_recipe_tags &&
                        recipe.user_recipe_tags.some(tag => {
                            return (
                                tag.user_tag && 
                                tag.user_tag.name.toLowerCase() === filterValue.toLowerCase() &&
                                tag.user_id === user.id
                            )
                        })
                    )
                }
            } else if (filterBy === "ingredients") {
                return (
                    recipe && 
                    recipe.recipe_ingredients &&
                    recipe.recipe_ingredients.some(ingredient => {
                        return (
                            ingredient &&
                            ingredient.ingredient_name.toLowerCase().includes(filterValue.toLowerCase())
                        )
                    })
                );
            }
        } else if (filterType === "exclude") {
            if (filterValue === '') return true;
            if (filterBy === "recipeName") {
                return !recipe.name.toLowerCase().includes(filterValue.toLowerCase());
            } else if (filterBy === "tag") {
                return (
                        recipe &&
                        recipe.user_recipe_tags &&
                        !recipe.recipe_tags.some(tag => (tag.tag && tag.tag.name.toLowerCase() === filterValue.toLowerCase()))
                )
            } else if (filterBy === "usertag") {
                return (
                        recipe &&
                        recipe.recipe_tags &&
                        !recipe.user_recipe_tags.some(tag => (tag.user_tag && tag.user_tag.name.toLowerCase() === filterValue.toLowerCase()))
                )
            } else if (filterBy === "ingredients") {
                return !recipe.recipe_ingredients.some(ingredient => (ingredient && ingredient.ingredient_name.toLowerCase().includes(filterValue.toLowerCase())))            
            }
        }    
    });
    
    const handleFavorites = (event, recipeId) => {
        event.preventDefault();
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

    const [value, setValue] = useState(0);
    
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
        };        
        handleClose();
    };

    const open = Boolean(anchorEl);

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`/api/userrecipetags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {})
      };

    return (
        <Container disableGutters maxWidth={false} sx={{ paddingBottom: '50px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <h1>Recipe Directory</h1>
                <SearchBar cookbooks={cookbooks} chosenCookbook={chosenCookbook} setChosenCookbook={setChosenCookbook}/>
                <Button variant={variantAddRecipe} color="primary" size="small" startIcon={startIconAddRecipe} value={addRecipe} onClick={(event) => handleAddRecipe(event)}>{addRecipeButtonText}</Button>
            </div>
            {addRecipe &&
                <AddRecipe recipes={recipes} setRecipes={setRecipes} handleAddRecipe={handleAddRecipe} tags={tags}/>
            }
            <br/>
            <Button variant={variantFilter} color="primary" size="small" startIcon={<FilterAltIcon />} value={addFilter} onClick={(event) => handleAddFilter(event)}>{filterButtonText}</Button>
            <br />
            {addFilter &&
                <Filter recipes={recipes} setRecipes={setRecipes} handleAddRecipe={handleAddRecipe} filterValue={filterValue} handleFilterValueChange={handleFilterValueChange} filterType={filterType} handleFilterTypeChange={handleFilterTypeChange} filterBy={filterBy} handleFilterByChange={handleFilterByChange} tags={tags} userTags={userTags}/>
            }
            <br/>
            <Container disableGutters maxWidth={false}>
                <Button variant={outlinedVariant === "allrecipes" ? "outlined" : "contained"} color="primary" size="small" value="allrecipes" onClick={(event) => handleCategorizationButtons(event.target.value)}>All Recipes</Button>
                { user && <Button variant={outlinedVariant === "breakfast" ? "outlined" : "contained"} color="primary" size="small" value="breakfast" onClick={(event) => handleCategorizationButtons(event.target.value)}>Breakfast</Button>}
                { user && <Button variant={outlinedVariant === "chicken" ? "outlined" : "contained"} color="primary" size="small" value="chicken" onClick={(event) => handleCategorizationButtons(event.target.value)}>Chicken</Button>}
                { user && <Button variant={outlinedVariant === "meat" ? "outlined" : "contained"} color="primary" size="small" value="meat" onClick={(event) => handleCategorizationButtons(event.target.value)}>Meat</Button>}
                { user && <Button variant={outlinedVariant === "fish" ? "outlined" : "contained"} color="primary" size="small" value="fish" onClick={(event) => handleCategorizationButtons(event.target.value)}>Fish</Button>}
                { user && <Button variant={outlinedVariant === "dairy" ? "outlined" : "contained"} color="primary" size="small" value="dairy" onClick={(event) => handleCategorizationButtons(event.target.value)}>Dairy</Button>}
                { user && <Button variant={outlinedVariant === "salad" ? "outlined" : "contained"} color="primary" size="small" value="salad" onClick={(event) => handleCategorizationButtons(event.target.value)}>Salad</Button>}
                { user && <Button variant={outlinedVariant === "soup" ? "outlined" : "contained"} color="primary" size="small" value="soup" onClick={(event) => handleCategorizationButtons(event.target.value)}>Soup</Button>}
                { user && <Button variant={outlinedVariant === "sides" ? "outlined" : "contained"} color="primary" size="small" value="sides" onClick={(event) => handleCategorizationButtons(event.target.value)}>Sides</Button>}
                { user && <Button variant={outlinedVariant === "condiments" ? "outlined" : "contained"} color="primary" size="small" value="condiments" onClick={(event) => handleCategorizationButtons(event.target.value)}>Condiments</Button>}
                { user && <Button variant={outlinedVariant === "dessert" ? "outlined" : "contained"} color="primary" size="small" value="dessert" onClick={(event) => handleCategorizationButtons(event.target.value)}>Dessert</Button>}
            </Container>
            <br/>
            <Container style={{
                position: 'fixed',
                bottom: 0,
                left: '50%',
                transform: 'translateX(-50%)',
                width: '100%',
                zIndex: 1000,
            }}>
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {
                        setValue(newValue);
                    }}
                >
                    <BottomNavigationAction label="All Recipes" icon={<AddIcon />} onClick={(event) => handleToggleRecipes("allrecipes")}/>
                    <BottomNavigationAction label="Your Recipes" icon={<PersonIcon />} onClick={(event) => handleToggleRecipes("yourrecipes")}/>
                    <BottomNavigationAction label="Likes" icon={<ThumbUpOffAltIcon />} onClick={(event) => handleToggleRecipes("interest")}/>
                    <BottomNavigationAction label="Dislikes" icon={<ThumbDownOffAltIcon />} onClick={(event) => handleToggleRecipes("notreorder")}/>
                </BottomNavigation>
            </Container>
            {!loading ? (
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {filteredRecipes.map((recipe) => (
                        <a href={`/recipes/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                            <Card key={recipe.id} sx={{ maxWidth: 345, margin: '10px', padding: '10px' }}>
                                <CardHeader
                                title={recipe.name}
                                action={
                                    user && 
                                        <Container sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton size="small" onClick={(event) => {handleFavorites(event, recipe.id)}}>
                                                {userRecipes.some(userRecipe => userRecipe.recipe_id === recipe.id) ? <FavoriteIcon color="primary"/> : <FavoriteBorderIcon color="primary"/>}
                                            </IconButton>
                                        </Container>
                                        
                                        
                                    // <IconButton aria-label="settings">
                                    // </IconButton>
                                }
                                
                                // subheader=
                                />
                                {/* <Alert severity="error" onClose={handleCloseAlert} open={showAlert}>
                                    Sign in to save recipe to your cookbook
                                </Alert> */}
                                <CardMedia
                                component="img"
                                height="194"
                                image={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"}
                                alt={recipe.name}
                                />
                                {/* <Divider /> */}
                                {recipe.recipe_tags.map(tag => {
                                    if (tag && tag.tag) {
                                        return <Chip key={tag.tag.id} size="small" label={tag.tag.name} color="primary" sx={{ margin: '1px'}}/>
                                    }
                                })}
                                {recipe.user_recipe_tags
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
                                <Divider/>
                                <AddToMealPrep user={user} recipeId={recipe.id}/>
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
                        </a>
                    ))}
                </div>
                
            ): (
                <Container disableGutters maxWidth={false}>
                    <RecipeSkeleton />
                </Container>
)}
        </Container>
    )
}

export default RecipeDirectory;