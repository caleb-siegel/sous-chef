from flask import Flask, make_response, jsonify, request, session, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category
from dotenv import dotenv_values
from flask_bcrypt import Bcrypt
import json
import random
config = dotenv_values(".env")

app = Flask(__name__)
app.secret_key = config['FLASK_SECRET_KEY']
CORS(app, supports_credentials=True, resources={r"/*": {"origins": ["https://souschef2.vercel.app", "http://localhost:5173"]}})
app.config["SQLALCHEMY_DATABASE_URI"] = config.get("SQLALCHEMY_DATABASE_URI")
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.json.compact = False
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

db.init_app(app)

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
        response = make_response()
        response.headers["Access-Control-Allow-Origin"] = "https://souschef2.vercel.app"
        response.headers["Access-Control-Allow-Methods"] = "POST"
        response.headers["Access-Control-Allow-Headers"] = "Content-Type, Accept, Accepts"
        response.headers["Access-Control-Allow-Credentials"] = "true"
        return response
    
    elif request.method == 'POST':
        print('login')
        data = request.json
        user = User.query.filter(User.name == data.get('name')).first()
        if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
            session["user_id"] = user.id
            print("success")
            return user.to_dict(), 200
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
    
@app.route('/api/usertags/<int:id>/', methods=['DELETE'])
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
    
@app.route('/api/userrecipetags/<int:id>/', methods=['GET', 'POST', 'DELETE'])
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
    all_recipes = User_Recipe.query.filter_by(user_id=session.get('user_id')).all()
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

@app.route('/api/recipetags/<int:id>/', methods=['GET', 'POST', 'DELETE'])
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

if __name__ == "__main__":
    app.run(port=5555, debug=True)