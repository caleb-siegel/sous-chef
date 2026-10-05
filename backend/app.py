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
import uuid
import base64

# Apply monkey-patch directly on Pydantic BaseModel to handle by_alias=None
# This fixes compatibility between certain versions of Pydantic V2 and OpenAI's SDK
try:
    from pydantic import BaseModel
    _original_model_dump = BaseModel.model_dump
    
    def _patched_model_dump(self, *args, **kwargs):
        if 'by_alias' in kwargs and kwargs['by_alias'] is None:
            kwargs['by_alias'] = False
        return _original_model_dump(self, *args, **kwargs)
        
    BaseModel.model_dump = _patched_model_dump
    logging.getLogger(__name__).info("Successfully monkey-patched Pydantic BaseModel.model_dump")
except Exception as patch_err:
    logging.getLogger(__name__).warning(f"Failed to apply Pydantic monkey-patch: {patch_err}")

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
        "origins": ["https://souschef2.vercel.app", "https://souschef.vercel.app", "http://localhost:5173", "http://127.0.0.1:5555", "http://127.0.0.1:5173", "http://localhost:5555", "http://127.0.0.1:5174", "http://localhost:5174", "http://localhost:5175", "http://127.0.0.1:5175", "http://localhost:5176", "http://127.0.0.1:5176", "http://localhost:5177"],
        "methods": ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
        "allow_headers": ["Content-Type", "Accept", "Authorization", "Origin"],
        "supports_credentials": True,
    }},
)

from datetime import timedelta
app.permanent_session_lifetime = timedelta(days=31)
is_production = os.getenv('FLASK_ENV') == 'production' or bool(os.getenv('VERCEL')) or os.getenv('ENV') == 'production'
app.config['SESSION_COOKIE_SAMESITE'] = 'None' if is_production else 'Lax'
app.config['SESSION_COOKIE_SECURE'] = is_production
app.config['SESSION_COOKIE_HTTPONLY'] = True
app.config['SESSION_PERMANENT'] = True
app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('SQLALCHEMY_DATABASE_URI')

bcrypt = Bcrypt(app)
migrate = Migrate(app, db)

from models import User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category, Cooked_Instance, Shopping_List, Restaurant, Restaurant_Menu_Item, User_Restaurant_Note

@app.route("/")
def root():
    return "<h1>Welcome to the json server for Sous Chef<h1>"

@app.get('/api/check_session')
def check_session():
    user_id = session.get('user_id')
    print(f'check session user_id={user_id}')
    if user_id:
        user = db.session.get(User, user_id)
        if user:
            return user.to_dict(rules=['-password_hash']), 200
    return {"message": "No user logged in"}, 401

@app.delete('/api/logout')
def logout():
    session.pop('user_id', None)
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
            session.permanent = True
            session["user_id"] = user.id
            full_user = db.session.get(User, user.id)
            return full_user.to_dict(rules=['-password_hash']), 200
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

@app.route('/api/auth/google', methods=['POST', 'OPTIONS'])
def google_auth():
    if request.method == 'OPTIONS':
        # Handle the CORS preflight request
        response = jsonify({"message": "CORS preflight handled"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

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
    source_categories = [c.to_dict(rules=('-recipes',)) for c in Source_Category.query.all()]
    return make_response( source_categories, 200 )

@app.route('/api/tags')
def get_tags():
    tags = [t.to_dict(rules=('-recipe_tags',)) for t in Tag.query.all()]
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
        user_id = session.get('user_id') or request.json.get('created_by_user_id') or request.json.get('user_id')
        new_recipe = Recipe(
            name=request.json.get("name"),
            picture=request.json.get("picture"),
            source_category_id=request.json.get("source_category_id"),
            source=request.json.get("source"),
            reference=request.json.get("reference"),
            instructions=request.json.get("instructions"),
            created_by_user_id=user_id,
        )

        db.session.add(new_recipe)
        db.session.commit()
        
        if user_id:
            db.session.add(User_Recipe(user_id=user_id, recipe=new_recipe, comments="", not_reorder=False))
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

@app.route('/api/parse-recipe-image', methods=['POST', 'OPTIONS'])
def parse_recipe_image_route():
    """
    Parse a recipe image using AI and return structured data.
    Does NOT save the image to disk.
    """
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight handled"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Origin")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        data = request.json
        image_base64 = data.get('image')
        
        if not image_base64:
            return {"error": "Image data is required"}, 400
            
        # Strip data URL prefix if present
        if ',' in image_base64:
            image_base64 = image_base64.split(',')[1]
            
        from recipe_image_parser import parse_recipe_image
        recipe_data = parse_recipe_image(image_base64)
        
        return jsonify(recipe_data), 200
        
    except Exception as e:
        logger.error(f"Error in parse-recipe-image: {str(e)}")
        return {"error": str(e)}, 500

@app.route('/api/upload-recipe-image', methods=['POST', 'OPTIONS'])
def upload_recipe_image():
    """
    Upload a recipe display image and save it to the frontend public folder.
    Returns the public URL.
    """
    if request.method == 'OPTIONS':
        response = jsonify({"message": "CORS preflight handled"})
        response.headers.add("Access-Control-Allow-Origin", request.headers.get("Origin"))
        response.headers.add("Access-Control-Allow-Methods", "POST, OPTIONS")
        response.headers.add("Access-Control-Allow-Headers", "Content-Type, Accept, Authorization, Origin")
        response.headers.add("Access-Control-Allow-Credentials", "true")
        return response, 200

    try:
        data = request.json
        image_data = data.get('image')
        recipe_name = data.get('name', '').strip()
        
        if not image_data:
            return {"error": "Image data is required"}, 400
            
        # Strip data URL prefix if present
        header, encoded = image_data.split(",", 1)
        extension = header.split(";")[0].split("/")[1]
        if extension == 'jpeg': extension = 'jpg'
        
        # Determine filename
        if recipe_name:
            # Sanitize filename: remove characters that aren't alphanumeric, space, or hyphen/underscore
            import re
            clean_name = re.sub(r'[^\w\s-]', '', recipe_name).strip()
            filename = f"{clean_name}.{extension}"
        else:
            filename = f"{uuid.uuid4()}.{extension}"
            
        # Try to save locally (works in local development)
        try:
            save_path = os.path.join(os.getcwd(), '..', 'frontend', 'public', 'recipes', filename)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(save_path), exist_ok=True)
            
            with open(save_path, "wb") as f:
                f.write(base64.b64decode(encoded))
                
            return jsonify({"url": f"/recipes/{filename}"}), 201
        except Exception as write_err:
            logger.info(f"Local file write failed (expected in serverless production). Falling back to returning base64 data: {str(write_err)}")
            return jsonify({"url": image_data}), 201
        
    except Exception as e:
        logger.error(f"Error uploading image: {str(e)}")
        return {"error": str(e)}, 500
    
def get_category_filter(cat_name):
    cat = (cat_name or "").lower().strip()
    if not cat:
        return None
    if cat == "chicken":
        return Recipe.recipe_ingredients.any(Recipe_Ingredient.ingredient_name.ilike("%chicken%"))
    elif cat == "fish":
        fish_terms = ["salmon", "tilapia", "crab", "flounder", "sea bass", "tuna", "snapper", "fish", "cod", "halibut", "shrimp", "trout"]
        return Recipe.recipe_ingredients.any(or_(*[Recipe_Ingredient.ingredient_name.ilike(f"%{term}%") for term in fish_terms]))
    elif cat == "meat":
        meat_tag = Tag.query.filter_by(name="meat").first()
        if meat_tag:
            return and_(
                Recipe.recipe_tags.any(Recipe_Tag.tag_id == meat_tag.id),
                ~Recipe.recipe_ingredients.any(Recipe_Ingredient.ingredient_name.ilike("%chicken%"))
            )
        return Recipe.recipe_ingredients.any(or_(
            Recipe_Ingredient.ingredient_name.ilike("%beef%"),
            Recipe_Ingredient.ingredient_name.ilike("%steak%"),
            Recipe_Ingredient.ingredient_name.ilike("%pork%"),
            Recipe_Ingredient.ingredient_name.ilike("%lamb%")
        ))
    elif cat == "other":
        excluded_tags = ["breakfast", "dairy", "salad", "soup", "side", "condiment", "dessert", "drinks", "meat"]
        tag_ids = [t.id for t in Tag.query.filter(Tag.name.in_(excluded_tags)).all()]
        excluded_ingredients = [
            "chicken", "salmon", "tilapia", "crab", "flounder", 
            "sea bass", "tuna", "snapper", "fish"
        ]
        conds = []
        if tag_ids:
            conds.append(~Recipe.recipe_tags.any(Recipe_Tag.tag_id.in_(tag_ids)))
        conds.append(~Recipe.recipe_ingredients.any(or_(*[Recipe_Ingredient.ingredient_name.ilike(f"%{term}%") for term in excluded_ingredients])))
        return and_(*conds)
    else:
        tag = Tag.query.filter_by(name=cat).first()
        if tag:
            return Recipe.recipe_tags.any(Recipe_Tag.tag_id == tag.id)
        return None

@app.route('/api/random_recipe', methods=['GET', 'POST', 'OPTIONS'])
def random_recipe():
    if request.method == 'OPTIONS':
        return make_response('', 200)

    # Parse parameters from JSON body or query args
    data = {}
    if request.method == 'POST' and request.is_json:
        data = request.get_json() or {}
    else:
        # Support query params in GET
        data = request.args.to_dict(flat=False)
        # Flatten single items unless they're list params
        data = {k: v if len(v) > 1 else v[0] for k, v in data.items()}

    def to_list(val):
        if not val:
            return []
        if isinstance(val, list):
            return [str(v).strip() for v in val if str(v).strip()]
        if isinstance(val, str):
            return [v.strip() for v in val.split(',') if v.strip()]
        return [str(val)]

    categories = to_list(data.get('categories') or data.get('category'))
    category_mode = data.get('category_mode', 'include').lower() # 'include' or 'exclude'
    cookbooks = to_list(data.get('cookbooks') or data.get('cookbook'))
    cookbook_mode = data.get('cookbook_mode', 'include').lower()
    source_categories = to_list(data.get('source_categories') or data.get('source_category'))
    source_category_mode = data.get('source_category_mode', 'include').lower()
    tags = to_list(data.get('tags') or data.get('tag'))
    tag_mode = data.get('tag_mode', 'include').lower()
    user_tags = to_list(data.get('user_tags') or data.get('user_tag'))
    user_tag_mode = data.get('user_tag_mode', 'include').lower()
    include_ingredients = to_list(data.get('include_ingredients') or data.get('ingredient'))
    exclude_ingredients = to_list(data.get('exclude_ingredients') or data.get('exclude_ingredient'))
    scope = data.get('scope', 'all').lower() # 'all' or 'user' / 'my_recipes'
    
    # Determine user_id if scope is user
    user_id = data.get('user_id') or session.get('user_id')
    try:
        user_id = int(user_id) if user_id else None
    except (ValueError, TypeError):
        user_id = None

    count_only = str(data.get('count_only', '')).lower() in ('true', '1')

    query = Recipe.query

    # Apply scope filter
    if scope in ('user', 'my_recipes', 'saved') and user_id:
        query = query.join(User_Recipe).filter(User_Recipe.user_id == user_id)

    filters = []

    # Category filters
    if categories:
        cat_conds = [get_category_filter(c) for c in categories]
        cat_conds = [c for c in cat_conds if c is not None]
        if cat_conds:
            if category_mode == 'exclude':
                # Exclude recipes matching any of these categories
                filters.append(and_(*[~c for c in cat_conds]))
            else:
                # Include recipes matching any of these categories (OR)
                filters.append(or_(*cat_conds))

    # Cookbook / Source filters
    if cookbooks:
        if cookbook_mode == 'exclude':
            filters.append(~Recipe.source.in_(cookbooks))
        else:
            filters.append(Recipe.source.in_(cookbooks))

    # Source Category filters
    if source_categories:
        sc_ids = []
        sc_names = []
        for sc in source_categories:
            if sc.isdigit():
                sc_ids.append(int(sc))
            else:
                sc_names.append(sc.lower())
        
        sc_obj_ids = [s.id for s in Source_Category.query.all() if s.name.lower() in sc_names]
        all_sc_ids = list(set(sc_ids + sc_obj_ids))
        if all_sc_ids:
            if source_category_mode == 'exclude':
                filters.append(~Recipe.source_category_id.in_(all_sc_ids))
            else:
                filters.append(Recipe.source_category_id.in_(all_sc_ids))

    # Tag filters
    if tags:
        tag_ids = []
        tag_names = []
        for t in tags:
            if t.isdigit():
                tag_ids.append(int(t))
            else:
                tag_names.append(t.lower())
        
        tag_obj_ids = [t.id for t in Tag.query.all() if t.name.lower() in tag_names]
        all_tag_ids = list(set(tag_ids + tag_obj_ids))
        if all_tag_ids:
            if tag_mode == 'exclude':
                filters.append(~Recipe.recipe_tags.any(Recipe_Tag.tag_id.in_(all_tag_ids)))
            else:
                filters.append(Recipe.recipe_tags.any(Recipe_Tag.tag_id.in_(all_tag_ids)))

    # User Tag filters
    if user_tags:
        ut_ids = []
        ut_names = []
        for ut in user_tags:
            if ut.isdigit():
                ut_ids.append(int(ut))
            else:
                ut_names.append(ut.lower())
        
        ut_obj_ids = [u.id for u in User_Tag.query.all() if u.name.lower() in ut_names]
        all_ut_ids = list(set(ut_ids + ut_obj_ids))
        if all_ut_ids:
            ut_cond = Recipe_Tag.tag_id.in_(all_ut_ids)
            if user_id:
                user_tag_filter = Recipe.user_recipe_tags.any(
                    and_(User_Recipe_Tag.user_tag_id.in_(all_ut_ids), User_Recipe_Tag.user_id == user_id)
                )
            else:
                user_tag_filter = Recipe.user_recipe_tags.any(User_Recipe_Tag.user_tag_id.in_(all_ut_ids))
            
            if user_tag_mode == 'exclude':
                filters.append(~user_tag_filter)
            else:
                filters.append(user_tag_filter)

    # Ingredient inclusion filters
    if include_ingredients:
        for ing in include_ingredients:
            if ing:
                filters.append(Recipe.recipe_ingredients.any(
                    Recipe_Ingredient.ingredient_name.ilike(f"%{ing}%")
                ))

    # Ingredient exclusion filters
    if exclude_ingredients:
        for ing in exclude_ingredients:
            if ing:
                filters.append(~Recipe.recipe_ingredients.any(
                    Recipe_Ingredient.ingredient_name.ilike(f"%{ing}%")
                ))

    if filters:
        query = query.filter(and_(*filters))

    matching_recipes = query.all()

    if count_only:
        return make_response(jsonify({
            "total_matching": len(matching_recipes)
        }), 200)

    if not matching_recipes:
        return make_response(jsonify({
            "recipe": None,
            "total_matching": 0,
            "message": "No recipes found matching the selected filters"
        }), 200)

    selected_recipe = random.choice(matching_recipes)
    recipe_dict = selected_recipe.to_dict()

    response_data = {
        "recipe": recipe_dict,
        "total_matching": len(matching_recipes),
        "message": "Success",
        **recipe_dict
    }

    return make_response(jsonify(response_data), 200)
    
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

@app.route('/api/recipeingredients/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
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
        user_id = session.get('user_id') or request.args.get('user_id')
        if user_id:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                user_id = None
        if user_id:
            meal_preps = [mp.to_dict() for mp in Meal_Prep.query.filter_by(user_id=user_id).all()]
        else:
            meal_preps = []

        response = make_response(
            meal_preps,
            200
        )

        return response

    elif request.method == 'POST':
        recipe_val = request.json.get("recipe_id")
        recipe_id = None
        recipe_name = None

        if isinstance(recipe_val, int):
            recipe_id = recipe_val
        elif isinstance(recipe_val, str):
            recipe_name = recipe_val

        user_id = request.json.get("user_id") or session.get("user_id")

        new_meal_prep = Meal_Prep(
            user_id=user_id,
            recipe_id=recipe_id,
            recipe_name=recipe_name,
            weekday=request.json.get("weekday"),
            meal=request.json.get("meal"),
        )

        db.session.add(new_meal_prep)
        db.session.flush()

        recipe = None
        if recipe_id:
            recipe = Recipe.query.filter_by(id=recipe_id).first()
            if recipe:
                rd = recipe.to_dict()
                print(f'recipe ingredients: {rd}')

                for ingredient in recipe.recipe_ingredients:
                    new_shopping_list_entry = Shopping_List(
                        checked=False,
                        ingredient_id=ingredient.id,
                        user_id=user_id,
                        mealprep_id=new_meal_prep.id
                    )
                    db.session.add(new_shopping_list_entry)
        elif recipe_name:
            # Create a standalone Recipe_Ingredient for the manual mealprep item
            new_ingredient = Recipe_Ingredient(
                ingredient_name=recipe_name,
                recipe_id=None
            )
            db.session.add(new_ingredient)
            db.session.flush()

            # Link it to the shopping list
            new_shopping_list_entry = Shopping_List(
                checked=False,
                ingredient_id=new_ingredient.id,
                user_id=user_id,
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
        user_id = session.get('user_id') or request.args.get('user_id')
        if user_id:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                user_id = None
        if user_id:
            items = [item.to_dict() for item in Shopping_List.query.filter_by(user_id=user_id).all()]
        else:
            items = []

        response = make_response(
            items,
            200
        )

        return response

@app.route('/api/user_shopping_list')
def user_shopping_list():
    user_id = session.get('user_id') or request.args.get('user_id')
    if user_id:
        try:
            user_id = int(user_id)
        except (ValueError, TypeError):
            user_id = None
    if user_id:
        shopping_list = Shopping_List.query.filter_by(user_id=user_id).all()
    else:
        shopping_list = []
    returned_shopping_list = [item.to_dict() for item in shopping_list]

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
        data = request.json or {}
        user_id = session.get('user_id') or data.get('user_id')
        recipe_id = data.get('recipe_id')
        user_recipe_id = data.get('user_recipe_id')

        if user_id:
            try:
                user_id = int(user_id)
            except (ValueError, TypeError):
                pass

        if user_id and recipe_id and not user_recipe_id:
            user_recipe = User_Recipe.query.filter_by(user_id=user_id, recipe_id=recipe_id).first()
            if not user_recipe:
                user_recipe = User_Recipe(user_id=user_id, recipe_id=recipe_id, comments="", not_reorder=False)
                db.session.add(user_recipe)
                db.session.flush()
            user_recipe_id = user_recipe.id
        elif user_id and user_recipe_id:
            ur = db.session.get(User_Recipe, user_recipe_id)
            if ur and ur.user_id != user_id:
                user_recipe = User_Recipe.query.filter_by(user_id=user_id, recipe_id=ur.recipe_id).first()
                if not user_recipe:
                    user_recipe = User_Recipe(user_id=user_id, recipe_id=ur.recipe_id, comments="", not_reorder=False)
                    db.session.add(user_recipe)
                    db.session.flush()
                user_recipe_id = user_recipe.id

        cooked_date_val = data.get("cooked_date")
        cooked_date = None
        if cooked_date_val:
            from datetime import datetime
            try:
                if isinstance(cooked_date_val, str):
                    cooked_date = datetime.fromisoformat(cooked_date_val.replace('Z', '+00:00'))
                else:
                    cooked_date = cooked_date_val
            except Exception:
                cooked_date = None

        new_cooked_instance = Cooked_Instance(
            user_recipe_id=user_recipe_id,
            comment=data.get("comment"),
            cooked_date=cooked_date,
        )
        db.session.add(new_cooked_instance)
        db.session.commit()
        new_cooked_instance_dict = new_cooked_instance.to_dict()
        return make_response(new_cooked_instance_dict, 201)

@app.route('/api/comments_feed', methods=['GET'])
def comments_feed():
    try:
        # Get cooked instance comments
        cooked_instances = Cooked_Instance.query.filter(
            Cooked_Instance.comment.isnot(None),
            Cooked_Instance.comment != ''
        ).all()
        
        feed_items = []
        for ci in cooked_instances:
            user_recipe = ci.user_recipe
            user = user_recipe.user if user_recipe else None
            recipe = user_recipe.recipe if user_recipe else None
            
            user_name = "Anonymous"
            if user:
                user_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.name or "Anonymous"
                
            feed_items.append({
                "id": f"cooked_{ci.id}",
                "type": "cooked_instance",
                "comment": ci.comment,
                "created_at": ci.created_at.isoformat() if ci.created_at else None,
                "event_date": ci.cooked_date.isoformat() if ci.cooked_date else (ci.created_at.isoformat() if ci.created_at else None),
                "user_name": user_name,
                "recipe_id": recipe.id if recipe else None,
                "recipe_name": recipe.name if recipe else "Unknown Recipe",
                "rating": None,
                "restaurant_id": None,
                "restaurant_name": None,
                "menu_item_id": None,
                "menu_item_name": None
            })
            
        # Get restaurant menu item comments
        restaurant_notes = User_Restaurant_Note.query.filter(
            User_Restaurant_Note.note.isnot(None),
            User_Restaurant_Note.note != '',
            User_Restaurant_Note.menu_item_id.isnot(None)
        ).all()
        
        for rn in restaurant_notes:
            user = rn.user
            restaurant = rn.restaurant
            menu_item = rn.menu_item
            
            user_name = "Anonymous"
            if user:
                user_name = f"{user.first_name or ''} {user.last_name or ''}".strip() or user.name or "Anonymous"
                
            feed_items.append({
                "id": f"restaurant_{rn.id}",
                "type": "restaurant_menu_item",
                "comment": rn.note,
                "created_at": rn.created_at.isoformat() if rn.created_at else None,
                "event_date": rn.date_eaten.isoformat() if rn.date_eaten else (rn.created_at.isoformat() if rn.created_at else None),
                "user_name": user_name,
                "recipe_id": None,
                "recipe_name": None,
                "rating": rn.rating,
                "restaurant_id": restaurant.id if restaurant else None,
                "restaurant_name": restaurant.name if restaurant else "Unknown Restaurant",
                "menu_item_id": menu_item.id if menu_item else None,
                "menu_item_name": menu_item.name if menu_item else "Unknown Item"
            })
            
        # Sort chronologically, most recent first.
        feed_items.sort(key=lambda x: x["created_at"] or "", reverse=True)
        return jsonify(feed_items), 200
    except Exception as e:
        logger.error(f"Error in comments_feed endpoint: {str(e)}", exc_info=True)
        return {"error": f"Failed to fetch comments feed: {str(e)}"}, 500

@app.route('/api/restaurants', methods=['GET', 'POST'])
def restaurants():
    if request.method == 'GET':
        search_query = request.args.get('search')
        if search_query:
            restaurants = Restaurant.query.filter(Restaurant.name.ilike(f"%{search_query}%")).all()
        else:
            restaurants = Restaurant.query.all()
        return jsonify([r.to_dict() for r in restaurants]), 200
    
    elif request.method == 'POST':
        data = request.json
        # Check if restaurant with this external_id already exists
        if data.get('external_id'):
            existing = Restaurant.query.filter_by(external_id=data.get('external_id')).first()
            if existing:
                return jsonify(existing.to_dict()), 200
        
        new_restaurant = Restaurant(
            name=data.get('name'),
            address=data.get('address'),
            external_id=data.get('external_id'),
            website=data.get('website'),
            phone=data.get('phone'),
            picture=data.get('picture')
        )
        db.session.add(new_restaurant)
        db.session.commit()
        return jsonify(new_restaurant.to_dict()), 201

@app.route('/api/restaurants/<int:id>', methods=['GET', 'PATCH', 'DELETE'])
def restaurant_by_id(id):
    restaurant = db.session.get(Restaurant, id)
    if not restaurant:
        return {"error": "Restaurant not found"}, 404
    
    if request.method == 'GET':
        return jsonify(restaurant.to_dict()), 200
    
    elif request.method == 'PATCH':
        data = request.json
        for key, value in data.items():
            if hasattr(restaurant, key):
                setattr(restaurant, key, value)
        db.session.commit()
        return jsonify(restaurant.to_dict()), 200
    
    elif request.method == 'DELETE':
        db.session.delete(restaurant)
        db.session.commit()
        return {}, 202

@app.route('/api/restaurants/<int:id>/menu-items', methods=['GET', 'POST'])
def restaurant_menu_items(id):
    restaurant = db.session.get(Restaurant, id)
    if not restaurant:
        return {"error": "Restaurant not found"}, 404
        
    if request.method == 'GET':
        return jsonify([item.to_dict() for item in restaurant.menu_items]), 200
    
    elif request.method == 'POST':
        data = request.json
        new_item = Restaurant_Menu_Item(
            restaurant_id=id,
            name=data.get('name'),
            description=data.get('description')
        )
        db.session.add(new_item)
        db.session.commit()
        return jsonify(new_item.to_dict()), 201

@app.route('/api/user_restaurant_notes', methods=['GET', 'POST'])
def user_restaurant_notes():
    user_id = session.get('user_id')
    print(f"DEBUG: Session keys: {list(session.keys())}")
    print(f"DEBUG: Session user_id: {user_id}")
    if not user_id:
        return {"error": "Unauthorized"}, 401
        
    if request.method == 'GET':
        restaurant_id = request.args.get('restaurant_id')
        query = User_Restaurant_Note.query.filter_by(user_id=user_id)
        if restaurant_id:
            query = query.filter_by(restaurant_id=restaurant_id)
        
        notes = query.order_by(User_Restaurant_Note.date_eaten.desc()).all()
        return jsonify([note.to_dict() for note in notes]), 200
    
    elif request.method == 'POST':
        data = request.json
        new_note = User_Restaurant_Note(
            user_id=user_id,
            restaurant_id=data.get('restaurant_id'),
            menu_item_id=data.get('menu_item_id'),
            note=data.get('note'),
            rating=data.get('rating'),
            date_eaten=data.get('date_eaten')
        )
        db.session.add(new_note)
        db.session.commit()
        return jsonify(new_note.to_dict()), 201

@app.route('/api/user_restaurant_notes/<int:id>', methods=['PATCH', 'DELETE'])
def user_restaurant_note_by_id(id):
    user_id = session.get('user_id')
    note = db.session.get(User_Restaurant_Note, id)
    if not note or note.user_id != user_id:
        return {"error": "Note not found or unauthorized"}, 404
        
    if request.method == 'PATCH':
        data = request.json
        for key, value in data.items():
            if hasattr(note, key):
                setattr(note, key, value)
        db.session.commit()
        return jsonify(note.to_dict()), 200
    
    elif request.method == 'DELETE':
        db.session.delete(note)
        db.session.commit()
        return {}, 202

@app.route('/api/restaurants/search-external', methods=['GET'])
def search_external_restaurants():
    query = request.args.get('query')
    if not query:
        return {"error": "Query required"}, 400
    
    api_key = os.getenv('GOOGLE_PLACES_API_KEY')
    print(f"DEBUG: Search query: {query}")
    print(f"DEBUG: API Key found: {'Yes' if api_key else 'No'}")
    
    if not api_key:
        return jsonify({"message": "Google Places API key not configured", "results": []}), 200
        
    import requests
    url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?query={query}&type=restaurant&key={api_key}"
    
    try:
        response = requests.get(url)
        data = response.json()
        print(f"DEBUG: Google API Status: {data.get('status')}")
        
        # Check for Google API level errors (e.g. REQUEST_DENIED, etc.)
        if data.get('status') not in ['OK', 'ZERO_RESULTS']:
            return jsonify({
                "message": f"Google API Error: {data.get('status')}",
                "error_details": data.get('error_message'),
                "results": []
            }), 200

        results = []
        for place in data.get('results', []):
            results.append({
                "name": place.get('name'),
                "address": place.get('formatted_address'),
                "external_id": place.get('place_id'),
                "rating": place.get('rating'),
                "picture": f"https://maps.googleapis.com/maps/api/place/photo?maxwidth=400&photoreference={place['photos'][0]['photo_reference']}&key={api_key}" if place.get('photos') else None
            })
            
        return jsonify({"results": results, "count": len(results)}), 200
    except Exception as e:
        return {"error": str(e)}, 500

if __name__ == "__main__":
    app.run(port=5555, debug=True)