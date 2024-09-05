from random import choice as rc
import random
import math

# from faker import Faker

from app import app
from models import db, User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe_Tag, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category, Recipe
from flask_bcrypt import Bcrypt

# fake = Faker()

with app.app_context():

    bcrypt = Bcrypt(app)
    data = {}

    # Source_Category.query.delete()
    # source_category_instances = []
    # source_categories = ["Website", "Cookbook", "Life", "Instagram"]
    # for source_category in source_categories:
    #     category_instance = Source_Category(name=source_category)
    #     source_category_instances.append(category_instance)
    # db.session.add_all(source_category_instances)

    # Tag.query.delete()
    # tag_instances = []
    # tags = ["passover", "vegan", "salad", "soup", "breakfast", "lunch", "dinner", "meat", "dairy", "pareve", "side", "dessert", "condiment", "drinks"]
    # for tag in tags:
    #     tag_instance = Tag(name=tag)
    #     tag_instances.append(tag_instance)
    # db.session.add_all(tag_instances)

    # User_Tag.query.delete()
    # user_tag_instances = []
    # user_tags = ["eaten", "interest", "not a reorder", "shabbos hosting"]
    # for user_tag in user_tags:
    #     user_tag_instance = User_Tag(name=user_tag)
    #     user_tag_instances.append(user_tag_instance)
    # db.session.add_all(user_tag_instances)


    # db.session.add(User(name="a", password_hash=bcrypt.generate_password_hash("a")))

    # Recipe.query.delete()
    
    # User_Recipe.query.delete()

    # Recipe_Ingredient.query.delete()

    # Recipe_Tag.query.delete()

    # User_Recipe.query.delete()

    # User_Recipe_Tag.query.delete()

    # db.session.commit()


    # Recipe: White Chocolate Chunk Cookies
    white_chocolate_chunk_cookies_recipe = Recipe(
        name="White Chocolate Chunk Cookies",
        picture="/recipes/white_chocolate_chunk_cookies.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="298",
        instructions="""
    Step 1
    Preheat oven to 350°F. Line 2 baking sheets with parchment paper; set aside.

    Step 2
    In a medium mixing bowl, combine flour, baking powder, and baking soda. Set aside.

    Step 3
    To a second mixing bowl, add butter. Using a hand mixer, beat for 1 minute.

    Step 4
    Add sugar and brown sugar; continue beating until creamy.

    Step 5
    Add egg and vanilla; beat until incorporated. Stir in dry ingredients until well incorporated.

    Step 6
    Stir most of the white chocolate pieces into the dough, reserving some for the top. Mix well. Cover bowl; chill for 30 minutes.

    Step 7
    Using an ice cream scoop, scoop 12-15 balls of dough onto prepared baking sheets, spaced about 2 inches apart. Slightly flatten each ball. Top with reserved white chocolate pieces.

    Step 8
    Bake for 8-10 minutes, or until the edges are slightly golden but cookies are still soft. They will continue to set as they cool.
    """
    )

    db.session.add(white_chocolate_chunk_cookies_recipe)
    db.session.commit()

    white_chocolate_chunk_cookies_recipe_id = white_chocolate_chunk_cookies_recipe.id

    white_chocolate_chunk_cookies_ingredients = [
        {"name": "All-purpose flour", "quantity": 1.5, "unit": "cups", "note": ""},
        {"name": "Baking powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Baking soda", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Butter, at room temperature", "quantity": 7, "unit": "Tbsp", "note": ""},
        {"name": "Sugar", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Brown sugar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Pure vanilla extract", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "White chocolate bars, roughly chopped", "quantity": 7, "unit": "oz", "note": "Two 3.5-oz bars"}
    ]

    for ing in white_chocolate_chunk_cookies_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=white_chocolate_chunk_cookies_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

print("seed complete")
