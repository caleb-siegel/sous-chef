from flask import Flask, make_response, jsonify, request, session, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_, and_
from flask_migrate import Migrate
from flask_cors import CORS
from dotenv import dotenv_values, load_dotenv
from flask_bcrypt import Bcrypt
import json
import os
import random
import logging
from helpers import get_recipe_dict
from db import db, app
from google.oauth2 import id_token
from google.auth.transport import requests

load_dotenv()

# Configure logging
logging.basicConfig(
    level=logging.DEBUG,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

app.secret_key = os.getenv('FLASK_SECRET_KEY')
google_client_id = os.getenv('GOOGLE_CLIENT_SECRET')

CORS(app,
    supports_credentials=True, 
    resources={r"/*": {
        "origins": ["https://souschef2.vercel.app", "http://localhost:5173", "http://127.0.0.1:5555", "http://127.0.0.1:5173", "http://localhost:5555", "http://127.0.0.1:5174"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization", "Origin"],
        "supports_credentials": True,
    }},
)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Allows cross-origin cookies
app.config['SESSION_COOKIE_SECURE'] = False  # Ensures cookies are only sent over HTTPS (recommended for production)
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')

bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

from models import User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category, Cooked_Instance, Shopping_List

@app.route("/")
def root():
    return "<h1>Welcome to the json server for Sous Chef<h1>"

@app.get('/api/check_session')
def check_session():
    user = db.session.get(User, session.get('user_id'))
    print(f'check session {session.get("user_id")}')
    if user:
        return user.to_dict(rules=['-password_hash']), 200
    else:
        return {"message": "No user logged in"}, 401

@app.delete('/api/logout')
def logout():
    session.pop('user_id')
    return { "message": "Logged out"}, 200

@app.route('/api/login', methods=['POST', 'OPTIONS'])
def login():
    if request.method == 'OPTIONS':
        # Handle the CORS preflight request
        print("handling preflight")
        response = jsonify({"message": "CORS preflight handled"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    if request.method == 'POST':
        print("attempting login")
        data = request.json
        user = db.session.query(User.id, User.name, User.password_hash).filter(User.name == data.get('name')).first()
        if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
            session["user_id"] = user.id
            return {
                "id": user.id,
                "name": user.name,
            }, 200
        else:
            return { "error": "Invalid username or password" }, 401
        
@app.route('/api/user', methods=['GET', 'POST'])
def user():
    if request.method == 'GET':
        users = [user.to_dict() for user in User.query.all()]
        return make_response( users, 200 )
    
    elif request.method == 'POST':
        data = request.json
        try:
            new_user = User(
                name= data.get("name"),
                password_hash= bcrypt.generate_password_hash(data.get("password_hash"))
            )
            db.session.add(new_user)
            db.session.commit()
            return new_user.to_dict(), 201
        except Exception as e:
            print(e)
            return {"error": f"could not post user: {e}"}, 405

@app.route('/api/auth/google', methods=['POST'])
def google_auth():
    data = request.json
    user_info = data.get('userInfo')
    
    try:
        if user_info:
            email = user_info.get('email')
            name = user_info.get('name')
            
            # Check if user exists
            user = User.query.filter_by(email=email).first()
            
            if not user:
                # Create new user
                names = name.split(' ', 1)
                first_name = names[0]
                last_name = names[1] if len(names) > 1 else ''
                
                user = User(
                    first_name=first_name,
                    last_name=last_name,
                    email=email,
                )
                db.session.add(user)
                db.session.commit()
            
            # Set session
            session.permanent = True
            session["user_id"] = user.id
            
            return jsonify({
                'success': True,
                'user': user.to_dict()
            })
            
        return jsonify({'error': 'Invalid user info'}), 400
        
    except Exception as e:
        print(f"Error in google_auth: {str(e)}")
        return jsonify({'error': 'Authentication failed'}), 400

@app.route('/api/sourcecategories')
def get_source_categories():
    source_categories = [source_categories.to_dict() for source_categories in Source_Category.query.all()]
    return make_response( source_categories, 200 )

@app.route('/api/tags')
def get_tags():
    tags = [tag.to_dict() for tag in Tag.query.all()]
    return make_response( tags, 200 )

@app.route('/api/usertags', methods=['GET', 'POST'])
def user_tags():
    if request.method == 'GET':
        user_tags = [user_tag.to_dict() for user_tag in User_Tag.query.all()]
        return make_response( user_tags, 200 )
    
    elif request.method == 'POST':
        new_user_tag = User_Tag(
            name=request.json.get("name"),
        )
        db.session.add(new_user_tag)
        db.session.commit()
        new_user_tag_dict = new_user_tag.to_dict()
        response = make_response(
            new_user_tag_dict,
            201
        )
        return response
    
@app.route('/api/usertags/<int:id>', methods=['DELETE'])
def delete_user_tags(id):
    user_tag = db.session.get(User_Tag, id)
    if not user_tag:
        return {"error": f"User Tag with id {id} not found"}, 404
    db.session.delete(user_tag)
    db.session.commit()
    return {}, 202

@app.route('/api/userrecipetags', methods=['GET', 'POST'])
def user_recipe_tags():
    if request.method == 'GET':
        user_recipe_tags = [user_recipe_tag.to_dict() for user_recipe_tag in User_Recipe_Tag.query.all()]
        return make_response( user_recipe_tags, 200 )
   
    elif request.method == 'POST':
        new_user_recipe_tag = User_Recipe_Tag(
            user_id=request.json.get("user_id"),
            recipe_id=request.json.get("recipe_id"),
            user_tag_id=request.json.get("user_tag_id"),
        )

        db.session.add(new_user_recipe_tag)
        db.session.commit()
        
        new_user_recipe_tag_dict = new_user_recipe_tag.to_dict()

        response = make_response(
            new_user_recipe_tag_dict,
            201
        )

        return response
    
@app.route('/api/userrecipetags/<int:id>', methods=['GET', 'POST', 'DELETE', 'OPTIONS'])
def delete_user_recipe_tags(id):
    user_recipe_tag = db.session.get(User_Recipe_Tag, id)
    if not user_recipe_tag:
        return {"error": f"User Recipe Tag with id {id} not found"}, 404
    db.session.delete(user_recipe_tag)
    db.session.commit()
    return {}, 202

@app.route('/api/recipes', methods=['GET', 'POST'])
def recipes():
    if request.method == 'GET':
        recipes = []
        for recipe in Recipe.query.order_by(Recipe.id.desc()).all():
            recipe_dict = recipe.to_dict()
            recipes.append(recipe_dict)

        response = make_response(
            recipes,
            200
        )

        return response

    elif request.method == 'POST':
        new_recipe = Recipe(
            name=request.json.get("name"),
            picture=request.json.get("picture"),
            source_category_id=request.json.get("source_category_id"),
            source=request.json.get("source"),
            reference=request.json.get("reference"),
            instructions=request.json.get("instructions"),
        )

        db.session.add(new_recipe)
        db.session.commit()
        
        db.session.add(User_Recipe(user_id=session.get('user_id'),recipe=new_recipe,comments="", not_reorder=False))
        db.session.commit()
        
        new_recipe_dict = new_recipe.to_dict()

        response = make_response(
            new_recipe_dict,
            201
        )

        return response

@app.route('/api/parse-instagram-recipe', methods=['POST', 'OPTIONS'])
def parse_instagram_recipe():
    """
    Parse an Instagram video URL and extract recipe information.
    Expects JSON with 'instagram_url' field.
    Returns recipe data including name, instructions, and ingredients.
    """
    if request.method == 'OPTIONS':
        # Handle the CORS preflight request
        logger.debug("Handling CORS preflight for parse-instagram-recipe")
        response = jsonify({"message": "CORS preflight handled"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Origin")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200
    
    logger.info("=== Instagram recipe parsing endpoint called ===")
    
    try:
        data = request.json
        logger.debug(f"Request data: {data}")
        
        instagram_url = data.get('instagram_url')
        logger.info(f"Received Instagram URL: {instagram_url}")
        
        if not instagram_url:
            logger.warning("No instagram_url provided in request")
            return {"error": "instagram_url is required"}, 400
        
        # Validate Instagram URL format
        if 'instagram.com' not in instagram_url and 'instagr.am' not in instagram_url:
            logger.warning(f"Invalid Instagram URL format: {instagram_url}")
            return {"error": "Invalid Instagram URL"}, 400
        
        # Import here to avoid circular imports
        from instagram_parser import parse_instagram_recipe as parse_recipe
        
        # Parse the Instagram video
        logger.info("Calling parse_recipe function...")
        recipe_data = parse_recipe(instagram_url)
        logger.info(f"Successfully parsed recipe: {recipe_data.get('name', 'Unknown')}")
        
        return jsonify(recipe_data), 200
        
    except Exception as e:
        logger.error(f"Error in parse_instagram_recipe endpoint: {str(e)}", exc_info=True)
        print(f"Error parsing Instagram recipe: {str(e)}")
        return {"error": f"Failed to parse Instagram recipe: {str(e)}"}, 500
    
@app.route('/api/random_recipe')
def random_recipe():
    if session.get('user_id'):
        all_recipes = User_Recipe.query.filter_by(user_id=session.get('user_id')).all()
    else:
        all_recipes = User_Recipe.query.all()
    random.shuffle(all_recipes)

    random_recipe_dict = all_recipes[0].to_dict()

    response = make_response(
        random_recipe_dict,
        200
    )

    return response
    
@app.route('/api/recipes/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def recipe_id(id):
    if request.method == 'GET':
        recipe_id = db.session.get(Recipe, id)
        if not recipe_id:
            return {"error": f"recipe with id {id} not found"}, 404
        return recipe_id.to_dict()
    
    elif request.method == 'DELETE':
        recipe_id = db.session.get(Recipe, id)
        if not recipe_id:
            return {"error": f"Recipe with id {id} not found"}, 404
        db.session.delete(recipe_id)
        db.session.commit()
        return {}, 202
    
    elif request.method == 'PATCH':
        recipe = db.session.get(Recipe, id)
        if not recipe:
            return {"error": f"recipe for id {id} not found"}, 404
        try:
            data = request.json
            for key in data:
                setattr(recipe, key, data[key])
            db.session.add(recipe)
            db.session.commit()
            return recipe.to_dict(), 200
        except Exception as e:
            return {"error": f'{e}'}



@app.route('/api/userrecipes', methods=['GET', 'POST'])
def user_recipes():
    if request.method == 'GET':
        user_recipes = []
        for user_recipe in User_Recipe.query.filter_by(user_id=session.get('user_id')).order_by(User_Recipe.id.desc()).all():
            user_recipe_dict = user_recipe.to_dict()
            user_recipes.append(user_recipe_dict)

        response = make_response(
            user_recipes,
            200
        )

        return response

    elif request.method == 'POST':
        new_user_recipe = User_Recipe(
            user_id=request.json.get("user_id"),
            recipe_id=request.json.get("recipe_id"),
            not_reorder=request.json.get("not_reorder"),
            comments=request.json.get("comments"),
        )

        db.session.add(new_user_recipe)
        db.session.commit()
        
        new_user_recipe_dict = new_user_recipe.to_dict()

        response = make_response(
            new_user_recipe_dict,
            201
        )

        return response

@app.route('/api/userrecipes/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def user_recipe_id(id):
    if request.method == 'GET':
        user_recipe = db.session.get(User_Recipe, id)
        if not user_recipe:
            return {"error": f"user recipe with id {id} not found"}, 404
        return user_recipe.to_dict()
    
    elif request.method == 'PATCH':
        user_recipe = db.session.get(User_Recipe, id)
        if not user_recipe:
            return {"error": f"user recipe with id {id} not found"}, 404
        try:
            data = request.json
            for key in data:
                setattr(user_recipe, key, data[key])
            db.session.add(user_recipe)
            db.session.commit()
            return user_recipe.to_dict(), 200
        except Exception as e:
            return {"error": f'{e}'}

    elif request.method == 'DELETE':
        user_recipe = db.session.get(User_Recipe, id)
        if not user_recipe:
            return {"error": f"User Recipe with id {id} not found"}, 404
        db.session.delete(user_recipe)
        db.session.commit()
        return {}, 202

@app.route('/api/recipetags', methods=['GET', 'POST'])
def recipe_tags():
    if request.method == 'GET':
        recipe_tags = []
        for recipe_tag in Recipe_Tag.query.all():
            recipe_tag_dict = recipe_tag.to_dict()
            recipe_tags.append(recipe_tag_dict)

        response = make_response(
            recipe_tags,
            200
        )
        return response

    elif request.method == 'POST':
        new_recipe_tag = Recipe_Tag(
            recipe_id=request.json.get("recipe_id"),
            tag_id=request.json.get("tag_id"),
        )

        db.session.add(new_recipe_tag)
        db.session.commit()

        new_recipe_tag_dict = new_recipe_tag.to_dict()

        response = make_response(
            new_recipe_tag_dict,
            201
        )

        return response

@app.route('/api/recipetags/<int:id>', methods=['GET', 'POST', 'DELETE'])
def delete_recipe_tags(id):
    if request.method == 'DELETE':
        recipe_tag = db.session.get(Recipe_Tag, id)
        if not recipe_tag:
            return {"error": f"Recipe Tag with id {id} not found"}, 404
        db.session.delete(recipe_tag)
        db.session.commit()
        return {}, 202
    elif request.method == 'GET':
        recipe_tag = db.session.get(Recipe_Tag, id)
        if not recipe_tag:
            return {"error": f"recipe tag with id {id} not found"}, 404
        return recipe_tag.to_dict()

@app.route('/api/recipeingredients', methods=['GET', 'POST'])
def recipe_ingredients():
    if request.method == 'GET':
        recipe_ingredients = []
        for recipe_ingredient in Recipe_Ingredient.query.order_by(Recipe_Ingredient.id.desc()).all():
            recipe_ingredient_dict = recipe_ingredient.to_dict()
            recipe_ingredients.append(recipe_ingredient_dict)

        response = make_response(
            recipe_ingredients,
            200
        )

        return response

    elif request.method == 'POST':
        new_ingredient = Recipe_Ingredient(
            recipe_id=request.json.get("recipe_id"),
            ingredient_name=request.json.get("ingredient_name"),
            ingredient_quantity= request.json.get("ingredient_quantity"),
            ingredient_unit= request.json.get("ingredient_unit"),
            ingredient_note= request.json.get("ingredient_note"),
        )

        db.session.add(new_ingredient)
        db.session.commit()
        
        new_recipe_ingredient_dict = new_ingredient.to_dict()

        response = make_response(
            new_recipe_ingredient_dict,
            201
        )

        return response

@app.route('/api/recipeingredients/<int:id>/', methods=['GET', 'PATCH', 'DELETE'])
def recipe_ingredient(id):
    if request.method == 'GET':
        ingredient_id = db.session.get(Recipe_Ingredient, id)
        if not ingredient_id:
            return {"error": f"ingredient with id {id} not found"}, 404
        return ingredient_id.to_dict()
    
    elif request.method == 'PATCH':
        ingredient = db.session.get(Recipe_Ingredient, id)
        if not ingredient:
            return {"error": f"ingredient with id {id} not found"}, 404
        try:
            data = request.json
            for key in data:
                setattr(ingredient, key, data[key])
            db.session.add(ingredient)
            db.session.commit()
            return ingredient.to_dict(), 200
        except Exception as e:
            return {"error": f'{e}'}
        
    elif request.method == 'DELETE':
        ingredient = db.session.get(Recipe_Ingredient, id)
        if not ingredient:
            return {"error": f"Ingredient with id {id} not found"}, 404
        db.session.delete(ingredient)
        db.session.commit()
        return {}, 202


@app.route('/api/mealprep', methods=['GET', 'POST'])
def meal_prep():
    if request.method == 'GET':
        meal_preps = []
        for meal_prep in Meal_Prep.query.all():
            meal_prep_dict = meal_prep.to_dict()
            meal_preps.append(meal_prep_dict)

        response = make_response(
            meal_preps,
            200
        )

        return response

    elif request.method == 'POST':

        recipe_id = request.json.get("recipe_id"),
        new_meal_prep = Meal_Prep(
            user_id=request.json.get("user_id"),
            recipe_id=recipe_id,
            weekday=request.json.get("weekday"),
            meal=request.json.get("meal"),
        )

        db.session.add(new_meal_prep)
        db.session.flush()

        recipe_id = request.json.get("recipe_id")
        print(f'recipe id: {recipe_id}')
        recipe = Recipe.query.filter_by(id=recipe_id).first()
        rd = recipe.to_dict()
        print(f'recipe ingredients: {rd}')

        if recipe:
            for ingredient in recipe.recipe_ingredients:
                new_shopping_list_entry = Shopping_List(
                    checked=False,
                    ingredient_id=ingredient.id,
                    user_id=request.json.get("user_id"),
                    mealprep_id=new_meal_prep.id
                )
                db.session.add(new_shopping_list_entry)

        db.session.commit()

        new_meal_prep_dict = new_meal_prep.to_dict()

        response = make_response(
            new_meal_prep_dict,
            201
        )

        return response

@app.route('/api/shopping_list', methods=['GET', 'POST'])
def shopping_list():
    if request.method == 'GET':
        shopping_list = []
        for item in Shopping_List.query.all():
            item_dict = item.to_dict()
            shopping_list.append(item_dict)

        response = make_response(
            shopping_list,
            200
        )

        return response

@app.route('/api/user_shopping_list')
def user_shopping_list():
    shopping_list = Shopping_List.query.all()
    returned_shopping_list = []
    for item in shopping_list:
        item_dict = item.to_dict()
        returned_shopping_list.append(item_dict)

    response = make_response(
        returned_shopping_list,
        200
    )
    return response
    
@app.route('/api/user_shopping_list/<int:id>', methods=['GET', 'PATCH'])
def edit_user_shopping_list(id):
    if request.method == 'PATCH':
        shopping_list_item = db.session.get(Shopping_List, id)
        if not shopping_list_item:
            return {"error": f"shopping_list_item for id {id} not found"}, 404
        try:
            data = request.json
            for key in data:
                setattr(shopping_list_item, key, data[key])
            db.session.add(shopping_list_item)
            db.session.commit()
            return shopping_list_item.to_dict(), 200
        except Exception as e:
            return {"error": f'{e}'}

    
@app.route('/api/mealprep/<int:id>', methods=['GET', 'DELETE'])
def meal_prep_id(id):
    if request.method == 'GET':
        meal_prep = db.session.get(Meal_Prep, id)
        if not meal_prep:
            return {"error": f"meal prep with id {id} not found"}, 404
        return meal_prep.to_dict()

    elif request.method == 'DELETE':
        meal_prep = db.session.get(Meal_Prep, id)
        if not meal_prep:
            return {"error": f"Meal prep with id {id} not found"}, 404
        db.session.delete(meal_prep)
        db.session.commit()
        return {}, 202
    
@app.route('/api/cookbooks', methods=['GET'])
def cookbooks():
    distinct_recipes = Recipe.query.with_entities(Recipe.source).distinct().all()
    # Extract the sources from the result and format them as a list
    cookbooks = [recipe.source for recipe in distinct_recipes]

    # Return the response as JSON
    return jsonify(cookbooks), 200

@app.route('/api/category_names')
def category_names():
    distinct_categories = Source_Category.query.all()
    categories = []
    for category in distinct_categories:
        category_dict = {
            "id": category.id,
            "name": category.name
        }
        categories.append(category_dict)
    return jsonify(categories), 200

@app.route('/api/tag_names')
def tag_names():
    distinct_tags = Tag.query.all()
    tags = []
    for tag in distinct_tags:
        tag_dict = {
            "id": tag.id,
            "name": tag.name
        }
        tags.append(tag_dict)

    return jsonify(tags), 200

@app.route('/api/user_tag_names')
def user_tag_names():
    distinct_user_tags = User_Tag.query.all()
    user_tags = []
    for user_tag in distinct_user_tags:
        user_tag_dict = {
            "id": user_tag.id,
            "name": user_tag.name
        }
        user_tags.append(user_tag_dict)

    return jsonify(user_tags), 200

@app.route('/api/recipe_info')
def recipe_info():
    recipes = Recipe.query.order_by(Recipe.id.desc()).all()
    recipes_dict = get_recipe_dict(recipes)
    response = make_response(recipes_dict, 200)
    return response

@app.route('/api/category_button/<string:category>')
def category_button(category):
    if category == "all":
        recipes = Recipe.query.order_by(Recipe.id.desc()).all()
    elif category in ["breakfast", "dairy", "salad", "soup", "side", "condiment", "dessert", "drinks"]:
        tag = Tag.query.filter_by(name=category).first().id
        recipes = Recipe.query.filter(Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag)).order_by(Recipe.id.desc()).all()
    elif category == "fish":
        fish_terms = ["salmon", "tilapia", "crab", "flounder", "sea bass", "tuna", "snapper", "fish"]
        fish_conditions = or_(Recipe_Ingredient.ingredient_name.ilike(f"%{term}%") for term in fish_terms)
        exclude_fish_free = ~Recipe_Ingredient.ingredient_name.ilike("%fish-free%")
        recipes = Recipe.query.filter(Recipe.recipe_ingredients.any(and_(fish_conditions, exclude_fish_free))).order_by(Recipe.id.desc()).all()
    elif category == "meat":
        tag = Tag.query.filter_by(name="meat").first().id
        recipes = Recipe.query.filter(Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag), ~Recipe.recipe_ingredients.any(Recipe_Ingredient.ingredient_name.ilike("%chicken%"))).order_by(Recipe.id.desc()).all()
    elif category == "chicken":
        recipes = Recipe.query.filter(Recipe.recipe_ingredients.any(Recipe_Ingredient.ingredient_name.ilike("%chicken%"))).order_by(Recipe.id.desc()).all()
    else:  # If no category matches, return all recipes that do not belong to the above categories.
        recipes = Recipe.query.filter(
            ~or_(
                Recipe.recipe_tags.any(
                    Recipe_Tag.tag_id == Tag.query.filter_by(name=tag).first().id
                ) for tag in [
                    "breakfast", "dairy", "salad", "soup", "side", "condiment", "dessert", "drinks", "meat"
                ]
            ),
            ~Recipe.recipe_ingredients.any(
                or_(
                    Recipe_Ingredient.ingredient_name.ilike("%chicken%"),
                    Recipe_Ingredient.ingredient_name.ilike("%salmon%"),
                    Recipe_Ingredient.ingredient_name.ilike("%tilapia%"),
                    Recipe_Ingredient.ingredient_name.ilike("%crab%"),
                    Recipe_Ingredient.ingredient_name.ilike("%flounder%"),
                    Recipe_Ingredient.ingredient_name.ilike("%sea bass%"),
                    Recipe_Ingredient.ingredient_name.ilike("%tuna%"),
                    Recipe_Ingredient.ingredient_name.ilike("%snapper%"),
                    Recipe_Ingredient.ingredient_name.ilike("%fish%")
                )
            )
        ).order_by(Recipe.id.desc()).all()
        
    recipes_dict = get_recipe_dict(recipes)
    response = make_response(recipes_dict, 200)
    return response

# get all userrecipes for the signed in user
@app.route('/api/user_recipe_ids/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def user_recipe_ids(id):
    if request.method == 'GET':
        user_recipes = User_Recipe.query.filter_by(user_id=id).all()

        if not user_recipes:
            return {"error": f"user recipe with id {id} not found"}, 404
        
        user_recipes_dict = {}
        for recipe in user_recipes:
            if recipe.recipe_id is None:
                continue
            user_recipes_dict[recipe.recipe_id] = recipe.id
        return user_recipes_dict


@app.route('/api/recipes/filter', methods=['GET'])
def filter_recipes():
    category = request.args.get('category')
    cookbook = request.args.get('cookbook')
    
    # Start with a base query
    query = Recipe.query

    # Build filters list
    filters = []
    
    # Add category filter if specified
    if category and category != 'all':
        if category == "chicken":
            filters.append(Recipe.recipe_ingredients.any(
                Recipe_Ingredient.ingredient_name.ilike("%chicken%")
            ))
        elif category == "fish":
            fish_terms = ["salmon", "tilapia", "crab", "flounder", "sea bass", "tuna", "snapper", "fish"]
            fish_conditions = or_(*[Recipe_Ingredient.ingredient_name.ilike(f"%{term}%") for term in fish_terms])
            filters.append(Recipe.recipe_ingredients.any(fish_conditions))
        elif category == "meat":
            tag = Tag.query.filter_by(name="meat").first()
            if tag:
                filters.extend([
                    Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag.id),
                    ~Recipe.recipe_ingredients.any(Recipe_Ingredient.ingredient_name.ilike("%chicken%"))
                ])
        elif category == "other":
            excluded_tags = ["breakfast", "dairy", "salad", "soup", "side", "condiment", "dessert", "drinks", "meat"]
            excluded_tag_filters = [
                ~Recipe.recipe_tags.any(
                    Recipe_Tag.tag_id == Tag.query.filter_by(name=tag).first().id
                ) for tag in excluded_tags
            ]
            excluded_ingredients = [
                "chicken", "salmon", "tilapia", "crab", "flounder", 
                "sea bass", "tuna", "snapper", "fish"
            ]
            excluded_ingredient_filters = [
                ~Recipe.recipe_ingredients.any(
                    or_(*[Recipe_Ingredient.ingredient_name.ilike(f"%{term}%") for term in excluded_ingredients])
                )
            ]
            filters.extend(excluded_tag_filters + excluded_ingredient_filters)
        else:
            tag = Tag.query.filter_by(name=category).first()
            if tag:
                filters.append(Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag.id))

    # Add cookbook filter if specified
    if cookbook:
        filters.append(Recipe.source == cookbook)

    # Apply all filters at once
    if filters:
        query = query.filter(and_(*filters))

    # Get results
    recipes = query.order_by(Recipe.id.desc()).all()
    recipes_dict = get_recipe_dict(recipes)
    
    return make_response(recipes_dict, 200)

@app.route('/api/cooked_instances', methods=['GET', 'POST'])
def cooked_instances():
    if request.method == 'GET':
        cooked_instances = [cooked_instance.to_dict() for cooked_instance in Cooked_Instance.query.all()]
        return make_response( cooked_instances, 200 )
    
    elif request.method == 'POST':
        new_cooked_instance = Cooked_Instance(
            user_recipe_id=request.json.get("user_recipe_id"),
            comment=request.json.get("comment"),
            cooked_date=request.json.get("cooked_date"),
        )
        db.session.add(new_cooked_instance)
        db.session.commit()
        new_cooked_instance_dict = new_cooked_instance.to_dict()
        response = make_response(
            new_cooked_instance_dict,
            201
        )
        return response

if __name__ == "__main__":
    app.run(port=5555, debug=True)