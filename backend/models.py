from db import db
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
import string
from datetime import date, time

class User(db.Model, SerializerMixin):
    __tablename__ = "user"
    
    serialize_rules = ["-user_recipes.user", "-user_recipe_tags.user", "-meal_preps", "-recipes.user", "-shopping_list.user"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)
    first_name = db.Column(db.String)
    last_name = db.Column(db.String)
    email = db.Column(db.String)
    password_hash = db.Column(db.String)

    user_recipes = db.relationship("User_Recipe", back_populates="user")
    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="user")
    meal_preps = db.relationship("Meal_Prep", back_populates="user")
    recipes = db.relationship("Recipe", back_populates="user")
    shopping_list = db.relationship("Shopping_List", back_populates="user")

class User_Tag(db.Model, SerializerMixin):
    __tablename__ = "user_tag"
    
    serialize_rules = ["-user_recipe_tags.user_tag"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)

    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="user_tag")

class User_Recipe(db.Model, SerializerMixin):
    __tablename__ = "user_recipe"
    
    serialize_rules = ["-user.user_recipes", "-recipe.user_recipes", "-cooked_instances.user_recipe"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    not_reorder = db.Column(db.Boolean)
    comments = db.Column(db.String)

    user = db.relationship("User", back_populates="user_recipes")
    recipe = db.relationship("Recipe", back_populates="user_recipes")
    cooked_instances = db.relationship("Cooked_Instance", back_populates="user_recipe")

class Cooked_Instance(db.Model, SerializerMixin):
    __tablename__ = "cooked_instance"

    serialize_rules = ["-user_recipe.cooked_instances"]

    id = db.Column(db.Integer, primary_key=True)
    user_recipe_id = db.Column(db.Integer, db.ForeignKey("user_recipe.id"))
    comment = db.Column(db.String)
    cooked_date = db.Column(db.DateTime, nullable=True)
    
    user_recipe = db.relationship("User_Recipe", back_populates="cooked_instances")

class User_Recipe_Tag(db.Model, SerializerMixin):
    __tablename__ = "user_recipe_tag"
    
    serialize_rules = ["-user", "-recipe", "-user_tag.user_recipe_tags"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    user_tag_id = db.Column(db.Integer, db.ForeignKey("user_tag.id"))

    user = db.relationship("User", back_populates="user_recipe_tags")
    recipe = db.relationship("Recipe", back_populates="user_recipe_tags")
    user_tag = db.relationship("User_Tag", back_populates="user_recipe_tags")

class Meal_Prep(db.Model, SerializerMixin):
    __tablename__ = "meal_prep"
    
    serialize_rules = ["-user", "-recipe.user_recipes", "-recipe.user_recipe_tags", "-recipe.meal_preps", "-recipe.source_category", "-recipe.recipe_ingredients.recipe", "-recipe.recipe_tags", "-shopping_list.meal_prep"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    weekday = db.Column(db.String)
    meal = db.Column(db.String)

    user = db.relationship("User", back_populates="meal_preps")
    recipe = db.relationship("Recipe", back_populates="meal_preps")
    shopping_list = db.relationship("Shopping_List", back_populates="meal_prep", cascade="all, delete-orphan")

class Recipe(db.Model, SerializerMixin):
    __tablename__ = "recipe"
    
    serialize_rules = ["-user_recipes.recipe", "-user_recipes.user.user_recipe_tags", "-user_recipe_tags.recipe", "-meal_preps.recipe", "-source_category.recipes", "-recipe_ingredients.recipe", "-recipe_tags.recipe", "-user.recipe"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    picture = db.Column(db.String)
    source_category_id = db.Column(db.Integer, db.ForeignKey("source_category.id"))
    source = db.Column(db.String)
    reference = db.Column(db.String)
    instructions = db.Column(db.String)
    created_by_user_id = db.Column(db.Integer, db.ForeignKey("user.id"))

    user_recipes = db.relationship("User_Recipe", back_populates="recipe")
    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="recipe")
    meal_preps = db.relationship("Meal_Prep", back_populates="recipe")
    source_category = db.relationship("Source_Category", back_populates="recipes")
    recipe_ingredients = db.relationship("Recipe_Ingredient", back_populates="recipe")
    recipe_tags = db.relationship("Recipe_Tag", back_populates="recipe")
    user = db.relationship("User", back_populates="recipes")

class Recipe_Ingredient(db.Model, SerializerMixin):
    __tablename__ = "recipe_ingredient"
    
    serialize_rules = ["-recipe.recipe_ingredients", "-shopping_list.recipe_ingredient"]
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    ingredient_name = db.Column(db.String)
    ingredient_quantity = db.Column(db.Float)
    ingredient_unit = db.Column(db.String)
    ingredient_note = db.Column(db.String)

    recipe = db.relationship("Recipe", back_populates="recipe_ingredients")
    shopping_list = db.relationship("Shopping_List", back_populates="recipe_ingredient")

class Tag(db.Model, SerializerMixin):
    __tablename__ = "tag"
    
    serialize_rules = ["-recipe_tags.tag"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)

    recipe_tags = db.relationship("Recipe_Tag", back_populates="tag")

class Recipe_Tag(db.Model, SerializerMixin):
    __tablename__ = "recipe_tag"
    
    serialize_rules = ["-recipe.recipe_tags", "-tag.recipe_tags"]
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    tag_id = db.Column(db.Integer, db.ForeignKey("tag.id"))

    recipe = db.relationship("Recipe", back_populates="recipe_tags")
    tag = db.relationship("Tag", back_populates="recipe_tags")

class Source_Category(db.Model, SerializerMixin):
    __tablename__ = "source_category"
    
    serialize_rules = ["-recipes.source_category"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String, unique=True)

    recipes = db.relationship("Recipe", back_populates="source_category")

class Shopping_List(db.Model, SerializerMixin):
    __tablename__ = "shopping_list"

    serialize_rules = [
        # '-user.user_recipes',
        # '-user.user_recipe_tags',
        # '-user.meal_preps',
        # '-user.recipes',
        # '-user.shopping_list',
        "-recipe_ingredient.shopping_list",
        "-recipe_ingredient.recipe.id",
        "-recipe_ingredient.recipe.picture",
        "-recipe_ingredient.recipe.source_category_id",
        "-recipe_ingredient.recipe.source",
        "-recipe_ingredient.recipe.reference",
        "-recipe_ingredient.recipe.instructions",
        "-recipe_ingredient.recipe.created_by_user_id",
        "-recipe_ingredient.recipe.user_recipes",
        "-recipe_ingredient.recipe.user_recipe_tags",
        "-recipe_ingredient.recipe.meal_preps",
        "-recipe_ingredient.recipe.source_category",
        "-recipe_ingredient.recipe.recipe_ingredients",
        "-recipe_ingredient.recipe.recipe_tags",
        "-recipe_ingredient.recipe.user",
        # "-meal_prep.user", 
        # "-meal_prep.recipe", 
        # "-meal_prep.shopping_list", 
        '-user',
        '-meal_prep',
        # '-recipe_ingredient',
        ]

    id = db.Column(db.Integer, primary_key=True)
    checked = db.Column(db.Boolean)
    ingredient_id = db.Column(db.Integer, db.ForeignKey("recipe_ingredient.id"))
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    mealprep_id = db.Column(db.Integer, db.ForeignKey("meal_prep.id", ondelete="CASCADE"))

    recipe_ingredient = db.relationship("Recipe_Ingredient", back_populates="shopping_list")
    user = db.relationship("User", back_populates="shopping_list")
    meal_prep = db.relationship("Meal_Prep", back_populates="shopping_list")
