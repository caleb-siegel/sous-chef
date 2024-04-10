from flask import Flask, make_response, jsonify, request, session, g
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category
from dotenv import dotenv_values
from flask_bcrypt import Bcrypt
import json
config = dotenv_values(".env")

app = Flask(__name__)
app.secret_key = config['FLASK_SECRET_KEY']
CORS(app)
app.config["SQLALCHEMY_DATABASE_URI"] = "sqlite:///app.db"
app.config["SQLALCHEMY_TRACK_MODIFICATIONS"] = False
app.json.compact = False
bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

db.init_app(app)

@app.route("/")
def root():
    return "<h1>Welcome to the simple json server<h1>"

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

@app.post('/api/login')
def login():
    print('login')
    data = request.json
    user = User.query.filter(User.name == data.get('name')).first()
    if user and bcrypt.check_password_hash(user.password_hash, data.get('password')):
        session["user_id"] = user.id
        print("success")
        return user.to_dict(), 200
    else:
        return { "error": "Invalid username or password" }, 401
    
@app.post('/api/user')
def post_user():
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

@app.route('/api/usertags')
def get_user_tags():
    user_tags = [user_tag.to_dict() for user_tag in User_Tag.query.all()]
    return make_response( user_tags, 200 )
   
@app.route('/api/userrecipetags', methods=['GET', 'POST'])
def get_user_recipe_tags():
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

# @app.route('/filterrecipes', methods=['GET'])
# def filter_recipes():
#     # Extract filter parameters from the request
#     filter_type = request.args.get('filterType')
#     filter_by = request.args.get('filterBy')
#     filter_text = request.args.get('filterText')

#     # Filter recipes based on the selected options
#     filtered_recipes = []
#     for recipe in recipes:
#         if filter_type == 'include':
#             if filter_by == 'recipeName' and filter_text.lower() in recipe['name'].lower():
#                 filtered_recipes.append(recipe)
#             elif filter_by == 'tag' and filter_text.lower() in [tag.lower() for tag in recipe['tags']]:
#                 filtered_recipes.append(recipe)
#             elif filter_by == 'ingredients' and filter_text.lower() in [ingredient.lower() for ingredient in recipe['ingredients']]:
#                 filtered_recipes.append(recipe)
#         elif filter_type == 'exclude':
#             # Implement exclusion logic if needed
#             pass

#     # Return the filtered recipes as a JSON response
#     return jsonify(filtered_recipes)

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

@app.route('/api/userrecipes/<int:id>', methods=['GET', 'DELETE'])
def user_recipe_id(id):
    if request.method == 'GET':
        user_recipe = db.session.get(User_Recipe, id)
        if not user_recipe:
            return {"error": f"user recipe with id {id} not found"}, 404
        return user_recipe.to_dict()

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
        )

        db.session.add(new_ingredient)
        db.session.commit()
        
        new_recipe_ingredient_dict = new_ingredient.to_dict()

        response = make_response(
            new_recipe_ingredient_dict,
            201
        )

        return response
    
if __name__ == "__main__":
    app.run(port=5555, debug=True)