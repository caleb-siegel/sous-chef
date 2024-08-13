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

    ultimate_kale_salad_recipe = Recipe(
        name="Ultimate Kale Salad",
        picture="/recipes/ultimate_kale_salad.jpeg",
        source_category_id=2,
        source="Unknown Source",
        reference="Unknown Reference",
        instructions="""
    1. Prepare the roasted butternut squash: Preheat oven to 400°F. Line a rimmed baking sheet with parchment paper. Place the cubed butternut squash on prepared baking sheet in a single layer. Spray or drizzle with olive oil; season with salt and pepper. Roast for 25-28 minutes.

    2. Prepare the sautéed mushrooms: Heat oil in a frying pan over medium heat. Add mushrooms, sauté until soft, about 5 minutes. Season with salt. Stir; set aside.

    3. Prepare the creamy apple cider dressing: In a glass jar, combine all dressing ingredients; whisk or shake until emulsified. Taste; adjust seasonings, if necessary.

    4. To assemble: Place a bed of kale onto a large platter or into a large bowl. Top with roasted butternut squash, sautéed mushrooms, peppers, cherry tomatoes, avocado, dried cranberries, and candied pecans.

    5. Immediately before serving, drizzle with dressing and toss to coat.
    """
    )

    db.session.add(ultimate_kale_salad_recipe)
    db.session.commit()

    ultimate_kale_salad_id = ultimate_kale_salad_recipe.id

    ultimate_kale_salad_ingredients = [
        {"name": "Kale, chopped", "quantity": 4, "unit": "oz", "note": ""},
        {"name": "Sweet mini peppers, cut into rounds", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Cherry tomatoes, halved", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Avocado, sliced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Dried cranberries", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Chopped candied pecans", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Butternut squash, peeled and cubed", "quantity": 0.5, "unit": "lb", "note": "for roasted butternut squash"},
        {"name": "Olive oil or olive oil spray", "quantity": 2, "unit": "tbsp", "note": "for roasted butternut squash"},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": "for roasted butternut squash"},
        {"name": "Black pepper", "quantity": None, "unit": "pinch", "note": "for roasted butternut squash"},
        {"name": "Olive oil", "quantity": 1.5, "unit": "tbsp", "note": "for sautéed mushrooms"},
        {"name": "White mushrooms, sliced", "quantity": 1, "unit": "8-oz container", "note": "for sautéed mushrooms"},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": "for sautéed mushrooms"},
        {"name": "Apple cider vinegar", "quantity": 0.25, "unit": "cup", "note": "for creamy apple cider dressing"},
        {"name": "Honey", "quantity": 3, "unit": "tbsp", "note": "for creamy apple cider dressing"},
        {"name": "Extra-virgin olive oil", "quantity": 2, "unit": "tbsp", "note": "for creamy apple cider dressing"},
        {"name": "Mayonnaise", "quantity": 1, "unit": "tbsp", "note": "for creamy apple cider dressing"},
        {"name": "Ground mustard", "quantity": 0.5, "unit": "tsp", "note": "for creamy apple cider dressing"},
        {"name": "Garlic powder", "quantity": 0.25, "unit": "tsp", "note": "for creamy apple cider dressing"},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": "for creamy apple cider dressing"},
        {"name": "Black pepper", "quantity": 0.125, "unit": "tsp", "note": "for creamy apple cider dressing"}
    ]

    for ing in ultimate_kale_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=ultimate_kale_salad_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()



    # db.session.commit()

print("seed complete")
