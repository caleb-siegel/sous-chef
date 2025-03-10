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
from helpers import get_recipe_dict
from db import db, app

load_dotenv()

app.secret_key = os.getenv('FLASK_SECRET_KEY')

CORS(app,
    supports_credentials=True, 
    resources={r"/*": {
        "origins": ["https://souschef2.vercel.app", "http://localhost:5173", "http://127.0.0.1:5555", "http://127.0.0.1:5173", "http://localhost:5555"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization", "Origin"],
        "supports_credentials": True,
    }},
)

app.config['SESSION_COOKIE_SAMESITE'] = 'None'  # Allows cross-origin cookies
app.config['SESSION_COOKIE_SECURE'] = False  # Ensures cookies are only sent over HTTPS (recommended for production)

bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

from models import User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category

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
        new_meal_prep = Meal_Prep(
            user_id=request.json.get("user_id"),
            recipe_id=request.json.get("recipe_id"),
            weekday=request.json.get("weekday"),
            meal=request.json.get("meal"),
        )

        db.session.add(new_meal_prep)
        db.session.commit()

        new_meal_prep_dict = new_meal_prep.to_dict()

        response = make_response(
            new_meal_prep_dict,
            201
        )

        return response
    
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
# return a list of the recipe ids

@app.route('/api/recipes/filter', methods=['GET'])
def filter_recipes():
    category = request.args.get('category')
    cookbook = request.args.get('cookbook')
    
    query = Recipe.query

    if category and category != 'all':
        if category == "chicken":
            query = query.filter(Recipe.recipe_ingredients.any(
                Recipe_Ingredient.ingredient_name.ilike("%chicken%")
            ))
        elif category == "fish":
            query = query.filter(Recipe.recipe_ingredients.any(
                or_(
                    Recipe_Ingredient.ingredient_name.ilike("%salmon%"),
                    Recipe_Ingredient.ingredient_name.ilike("%tilapia%"),
                    Recipe_Ingredient.ingredient_name.ilike("%crab%"),
                    Recipe_Ingredient.ingredient_name.ilike("%flounder%"),
                    Recipe_Ingredient.ingredient_name.ilike("%sea bass%"),
                    Recipe_Ingredient.ingredient_name.ilike("%tuna%"),
                    Recipe_Ingredient.ingredient_name.ilike("%snapper%"),
                    Recipe_Ingredient.ingredient_name.ilike("%fish%")
                )
            ))
        elif category == "other":
            query = query.filter(
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
            )
        else:
            tag = Tag.query.filter_by(name=category).first()
            if tag:
                query = query.filter(Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag.id))

    if cookbook:
        query = query.filter(Recipe.source == cookbook)

    recipes = query.order_by(Recipe.id.desc()).all()
    recipes_dict = get_recipe_dict(recipes)
    
    return make_response(recipes_dict, 200)

if __name__ == "__main__":
    app.run(port=5555, debug=True)