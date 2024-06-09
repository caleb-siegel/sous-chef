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
    # tags = ["passover", "vegan", "salad", "soup", "breakfast", "lunch", "dinner", "meat", "dairy", "pareve", "side", "dessert", "condiment"]
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

    chili_lime_potatoes_and_onions = Recipe(
        name="Chili Lime Potatoes and Onions",
        picture="/recipes/Chili Lime Potatoes and Onions.jpeg",
        source_category_id=2,
        source="Best of Kosher",
        reference="",
        instructions="""1. Preheat oven to 400°F. Line a baking sheet with parchment paper.
    2. In a large bowl, toss potatoes and onions with oil, maple syrup, salt, chili powder, pepper, garlic powder, onion powder, and lime zest. Spread evenly on prepared baking sheet.
    3. Bake, uncovered, for about 1 hour, or until tender crisp. Drizzle with lime juice before serving.
    YIELD: 4-6 servings"""
    )

    db.session.add(chili_lime_potatoes_and_onions)
    db.session.commit()

    recipe_id = chili_lime_potatoes_and_onions.id

    ingredients = [
        {"name": "Potatoes, cut into chunks (do not peel)", "quantity": 6, "unit": "", "note": ""},
        {"name": "Sweet potato, cut into chunks (do not peel)", "quantity": 1, "unit": "", "note": ""},
        {"name": "Onions, cut into chunks", "quantity": 2, "unit": "", "note": ""},
        {"name": "Oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Maple syrup", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Kosher salt", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Chili powder, or to taste", "quantity": 1.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Onion powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Zest of 2 limes", "quantity": 0, "unit": "", "note": ""},
        {"name": "Juice of 1 lime", "quantity": 0, "unit": "", "note": ""}
    ]

    for ing in ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

    print("Chili Lime Potatoes and Onions recipe and ingredients added successfully!")



    # db.session.commit()

print("seed complete")
