import React, { useState, useEffect } from "react";
import AddRecipe from "./AddRecipe";
import UserRecipeTagsMenu from "./UserRecipeTagsMenu";
import AddToMealPrep from "./AddToMealPrep";
import RecipeSkeleton from "./RecipeSkeleton";
import SearchBar from "./SearchBar";
import Filter from "./Filter";
import { Button, Card, CardHeader, CardMedia, Container, Chip, IconButton, Divider, BottomNavigation, BottomNavigationAction, Typography, CardContent } from "@mui/material";
import FilterAltIcon from '@mui/icons-material/FilterAlt';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ThumbUpOffAltIcon from '@mui/icons-material/ThumbUpOffAlt';
import ThumbDownOffAltIcon from '@mui/icons-material/ThumbDownOffAlt';
import PersonIcon from '@mui/icons-material/Person';
import { useOutletContext } from "react-router-dom";

function RecipeDirectory() {
    const {user} = useOutletContext();
    const { backendUrl } = useOutletContext();

    const [loading, setLoading] = useState(false);
    const [recipes, setRecipes] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/recipe_info`)
        .then((response) => response.json())
        .then((data) => {
            setRecipes(data);
            setLoading(false);
        });
    }, []);

    const [tags, setTags] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/tag_names`)
        .then((response) => response.json())
        .then((data) => setTags(data));
    }, []);

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch(`${backendUrl}/api/user_tag_names`)
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, []);

    const [userRecipes, setUserRecipes] = useState({});
    useEffect(() => {
        user && user.id &&
        fetch(`${backendUrl}/api/user_recipe_ids/${user.id}`)
        .then((response) => response.json())
        .then((data) => {
            setUserRecipes(data)
        });
    }, []);

    const [toggleRecipes, setToggleRecipes] = useState("allrecipes");
    const handleToggleRecipes = (event) => {
        setToggleRecipes(event)
    }

    const [cookbooks, setCookbooks] = useState([]);
    const [chosenCookbook, setChosenCookbook] = useState("")
    useEffect(() => {
        fetch(`${backendUrl}/api/cookbooks`)
        .then((response) => response.json())
        .then((data) => {
            setCookbooks(data);
        });
    }, []);

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
    const handleCategorizationButtons = (category) => {
        setCategorizationButtons(category)
        fetch(`${backendUrl}/api/category_button/${category}`)
        .then((response) => response.json())
        .then((data) => {
            setRecipes(data)
        });
        
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

    recipeList = recipeList.filter(recipe => {
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
                            ingredient.toLowerCase().includes(filterValue.toLowerCase())
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

        if (!userRecipes.hasOwnProperty(recipeId)) {
            const userRecipeData = {
                user_id: user.id,
                recipe_id: recipeId,
                not_reorder: false,
                comments: ''
            };
            fetch(`${backendUrl}/api/userrecipes`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userRecipeData),
            })
            .then((response) => response.json())
            .then((newUserRecipe) => {
                setUserRecipes((prevUserRecipes) => ({
                    ...prevUserRecipes,
                    [newUserRecipe.recipe_id]: newUserRecipe.id,
                }));
                // setRecipes([...recipes, newUserRecipe]);
            })
            .catch((error) => {
                console.error("Error adding recipe to favorites:", error);
            });
        } else {
            fetch(`${backendUrl}/api/userrecipes/${userRecipes[recipeId]}`, {
                method: "DELETE",
            })
            .then(() => {
                setUserRecipes((prevUserRecipes) => {
                    // Create a new object without the key that matches recipeId
                    const { [recipeId]: _, ...updatedRecipes } = prevUserRecipes;
                    return updatedRecipes;
                });
                // setRecipes(recipes.filter(recipe => recipe.id !== userRecipeIdToRemove));
            })
            .catch((error) => {
                console.error("Error removing recipe from favorites:", error);
            });
        }
    };

    const [value, setValue] = useState(0);
    
    const [anchorEl, setAnchorEl] = useState(null);

    const handleClose = () => {
        setAnchorEl(null);
    };

    const handleTagSelect = (recipeIdTag, userTagId) => {
        if (userTagId !== null) {
            fetch(`${backendUrl}/api/userrecipetags`, {
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
        fetch(`${backendUrl}/api/userrecipetags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {})
      };

    return (
        <Container disableGutters maxWidth={false} sx={{ paddingBottom: '50px'}}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                {/* <h1>Recipe Directory</h1> */}
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
            {!loading ? 
                <Typography variant="h3" color="secondary" >There are {recipeList.length} results.</Typography> 
            : 
                <Typography variant="h3" color="secondary" >Recipes are loading...</Typography>
            }
            <br/>
            <Container disableGutters maxWidth={false}>
                <Button variant={categorizationButtons === "all" ? "outlined" : "contained"} color="primary" size="small" value="all" onClick={(event) => handleCategorizationButtons(event.target.value)}>All Recipes</Button>
                <Button variant={categorizationButtons === "breakfast" ? "outlined" : "contained"} color="primary" size="small" value="breakfast" onClick={(event) => handleCategorizationButtons(event.target.value)}>Breakfast</Button>
                <Button variant={categorizationButtons === "chicken" ? "outlined" : "contained"} color="primary" size="small" value="chicken" onClick={(event) => handleCategorizationButtons(event.target.value)}>Chicken</Button>
                <Button variant={categorizationButtons === "meat" ? "outlined" : "contained"} color="primary" size="small" value="meat" onClick={(event) => handleCategorizationButtons(event.target.value)}>Meat</Button>
                <Button variant={categorizationButtons === "fish" ? "outlined" : "contained"} color="primary" size="small" value="fish" onClick={(event) => handleCategorizationButtons(event.target.value)}>Fish</Button>
                <Button variant={categorizationButtons === "dairy" ? "outlined" : "contained"} color="primary" size="small" value="dairy" onClick={(event) => handleCategorizationButtons(event.target.value)}>Dairy</Button>
                <Button variant={categorizationButtons === "salad" ? "outlined" : "contained"} color="primary" size="small" value="salad" onClick={(event) => handleCategorizationButtons(event.target.value)}>Salad</Button>
                <Button variant={categorizationButtons === "soup" ? "outlined" : "contained"} color="primary" size="small" value="soup" onClick={(event) => handleCategorizationButtons(event.target.value)}>Soup</Button>
                <Button variant={categorizationButtons === "side" ? "outlined" : "contained"} color="primary" size="small" value="side" onClick={(event) => handleCategorizationButtons(event.target.value)}>Side</Button>
                <Button variant={categorizationButtons === "condiment" ? "outlined" : "contained"} color="primary" size="small" value="condiment" onClick={(event) => handleCategorizationButtons(event.target.value)}>Condiment</Button>
                <Button variant={categorizationButtons === "dessert" ? "outlined" : "contained"} color="primary" size="small" value="dessert" onClick={(event) => handleCategorizationButtons(event.target.value)}>Dessert</Button>
                <Button variant={categorizationButtons === "drinks" ? "outlined" : "contained"} color="primary" size="small" value="drinks" onClick={(event) => handleCategorizationButtons(event.target.value)}>Drinks</Button>
                <Button variant={categorizationButtons === "other" ? "outlined" : "contained"} color="primary" size="small" value="other" onClick={(event) => handleCategorizationButtons(event.target.value)}>Other</Button>
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
            {user &&
                <BottomNavigation
                    showLabels
                    value={value}
                    onChange={(event, newValue) => {setValue(newValue)}}
                >
                    <BottomNavigationAction label="All Recipes" icon={<AddIcon />} onClick={(event) => handleToggleRecipes("allrecipes")}/>
                    <BottomNavigationAction label="Your Recipes" icon={<PersonIcon />} onClick={(event) => handleToggleRecipes("yourrecipes")}/>
                    <BottomNavigationAction label="Likes" icon={<ThumbUpOffAltIcon />} onClick={(event) => handleToggleRecipes("interest")}/>
                    <BottomNavigationAction label="Dislikes" icon={<ThumbDownOffAltIcon />} onClick={(event) => handleToggleRecipes("notreorder")}/>
                </BottomNavigation>
            }
            </Container>
            {!loading ?
                <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                    {recipeList?.map((recipe) => (
                        <a href={`/recipes/${recipe.id}`} key={recipe.id} style={{ textDecoration: 'none' }}>
                            <Card key={recipe.id} sx={{ maxWidth: 345, margin: '10px', padding: '10px', borderRadius: "1rem" }}>
                                <CardHeader
                                title={recipe.name}
                                action={
                                    user && 
                                        <Container sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                                            <IconButton size="small" onClick={(event) => {handleFavorites(event, recipe.id)}}>
                                                {userRecipes && userRecipes[recipe.id] > 0 ? <FavoriteIcon color="primary"/> : <FavoriteBorderIcon color="primary"/>}
                                            </IconButton>
                                        </Container>
                                }
                                />
                                <CardMedia
                                component="img"
                                height="194"
                                image={recipe.picture !== "" ? recipe.picture : "/favicon3.jpeg"}
                                alt="Image not available"
                                />
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
                                <AddToMealPrep user={user} recipe={recipe}/>
                                <Divider/>                                
                            </Card>
                        </a>
                    ))}
                </div>
                
            :
                <Container disableGutters maxWidth={false}>
                    <RecipeSkeleton />
                </Container>
            }
        </Container>
    )
}

export default RecipeDirectory;