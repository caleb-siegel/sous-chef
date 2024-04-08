from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import MetaData
from sqlalchemy.orm import validates
from sqlalchemy.ext.associationproxy import association_proxy
from sqlalchemy_serializer import SerializerMixin
import string

metadata = MetaData(
    naming_convention={
        "ix": "ix_%(column_0_label)s",
        "uq": "uq_%(table_name)s_%(column_0_name)s",
        "ck": "ck_%(table_name)s_%(constraint_name)s",
        "fk": "fk_%(table_name)s_%(column_0_name)s_%(referred_table_name)s",
        "pk": "pk_%(table_name)s",
    }
)
db = SQLAlchemy(metadata=metadata)

class User(db.Model, SerializerMixin):
    __tablename__ = "user"
    
    serialize_rules = ["-user_recipes.user", "-user_recipe_tags.user", "-meal_preps.user"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    password_hash = db.Column(db.String)

    user_recipes = db.relationship("User_Recipe", back_populates="user")
    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="user")
    meal_preps = db.relationship("Meal_Prep", back_populates="user")

class User_Tag(db.Model, SerializerMixin):
    __tablename__ = "user_tag"
    
    serialize_rules = ["-user_recipe_tags.user_tag"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="user_tag")

class User_Recipe(db.Model, SerializerMixin):
    __tablename__ = "user_recipe"
    
    serialize_rules = ["-user.user_recipes", "-recipe.user_recipes"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    not_reorder = db.Column(db.Boolean)
    comments = db.Column(db.String)

    user = db.relationship("User", back_populates="user_recipes")
    recipe = db.relationship("Recipe", back_populates="user_recipes")


class User_Recipe_Tag(db.Model, SerializerMixin):
    __tablename__ = "user_recipe_tag"
    
    serialize_rules = ["-user.user_recipe_tags", "-recipe.user_recipe_tags", "-user_tag.user_recipe_tags"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    user_tag_id = db.Column(db.Integer, db.ForeignKey("user_tag.id"))

    user = db.relationship("User", back_populates="user_recipe_tags")
    recipe = db.relationship("Recipe", back_populates="user_recipe_tags")
    user_tag = db.relationship("User_Tag", back_populates="user_recipe_tags")

class Meal_Prep(db.Model, SerializerMixin):
    __tablename__ = "meal_prep"
    
    serialize_rules = ["-user.meal_preps", "-recipe.meal_preps"]
    
    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey("user.id"))
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    weekday = db.Column(db.String)
    meal = db.Column(db.String)

    user = db.relationship("User", back_populates="meal_preps")
    recipe = db.relationship("Recipe", back_populates="meal_preps")

class Recipe(db.Model, SerializerMixin):
    __tablename__ = "recipe"
    
    serialize_rules = ["-user_recipes.recipe", "-user_recipe_tags.recipe", "meal_preps.recipe", "-source_category.recipes", "recipe_ingredients.recipe", "-recipe_tags.recipe"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)
    picture = db.Column(db.String)
    source_category_id = db.Column(db.Integer, db.ForeignKey("source_category.id"))
    source = db.Column(db.String)
    reference = db.Column(db.String)
    instructions = db.Column(db.String)

    user_recipes = db.relationship("User_Recipe", back_populates="recipe")
    user_recipe_tags = db.relationship("User_Recipe_Tag", back_populates="recipe")
    meal_preps = db.relationship("Meal_Prep", back_populates="recipe")
    source_category = db.relationship("Source_Category", back_populates="recipes")
    recipe_ingredients = db.relationship("Recipe_Ingredient", back_populates="recipe")
    recipe_tags = db.relationship("Recipe_Tag", back_populates="recipe")

class Recipe_Ingredient(db.Model, SerializerMixin):
    __tablename__ = "recipe_ingredient"
    
    serialize_rules = ["-recipe.recipe_ingredients"]
    
    id = db.Column(db.Integer, primary_key=True)
    recipe_id = db.Column(db.Integer, db.ForeignKey("recipe.id"))
    ingredient_name = db.Column(db.String)
    ingredient_value = db.Column(db.Float)
    inredient_unit = db.Column(db.String)

    recipe = db.relationship("Recipe", back_populates="recipe_ingredients")

class Tag(db.Model, SerializerMixin):
    __tablename__ = "tag"
    
    serialize_rules = ["-recipe_tags.tag"]
    
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String)

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
    name = db.Column(db.String)

    recipes = db.relationship("Recipe", back_populates="source_category")