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

    # Create the recipe entry for Crispy Chicken Wraps
    crispy_chicken_wraps = Recipe(
        name="Crispy Chicken Wraps",
        picture="",
        source_category_id=2,
        source="Starters and Sides Made Easy",
        reference="Leah Schapira & Victoria Dwek",
        instructions="""1. Heat oil in a sauté pan over medium heat. Add onion; sauté until soft and lightly golden, about 10 minutes. Set aside.
    2. Season chicken with ½ teaspoon salt and 2 garlic cloves.
    3. In a shallow dish, combine panko crumbs, chili powder, paprika, 3 garlic cloves, and ½ teaspoon salt. Lightly beat egg in a second shallow dish. Dredge chicken in egg, then coat in crumbs.
    4. Heat a thin layer of oil in a sauté pan over medium heat. When oil is hot, add chicken; cook for 3-4 minutes per side. Remove to a paper towel-lined plate. When cool enough to handle, cut chicken into strips.
    5. Prepare the red cabbage salad. In a small bowl, combine all ingredients.
    6. Prepare the honey-garlic dipping sauce. In a small bowl, whisk together all ingredients.
    7. Assemble the wraps. Spread a tablespoon of honey-garlic dipping sauce across the bottom-center of the wrap. Top with onions, chicken strips, and ¼ cup red cabbage. Make sure the filling is evenly distributed. Fold the bottom of the wrap over the filling and tuck under very tightly. Fold in the sides and continue to roll, egg roll-style, holding your fingers under the roll so that it remains very tight. Serve with remaining honey-garlic dipping sauce.

    YIELD: 4 sandwiches"""
    )

    # Add the recipe to the session
    db.session.add(crispy_chicken_wraps)
    db.session.commit()

    # Get the ID of the newly added recipe
    recipe_id = crispy_chicken_wraps.id

    # Create the ingredients entries
    ingredients = [
        {"name": "Oil, plus more for frying", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Onion, thinly sliced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Whole wheat wraps (8-inch)", "quantity": 4, "unit": "", "note": ""},
        {"name": "Boneless, skinless chicken breasts, thinly sliced", "quantity": 0.75, "unit": "lb", "note": ""},
        {"name": "Garlic cloves, minced, divided", "quantity": 5, "unit": "", "note": ""},
        {"name": "Kosher salt, divided", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Panko crumbs", "quantity": 0.75, "unit": "cup", "note": ""},
        {"name": "Chili powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Paprika", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Shredded red cabbage", "quantity": 1.25, "unit": "cups", "note": ""},
        {"name": "Vinegar", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Oil", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Sugar", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Kosher salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Mayonnaise", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Water", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Honey", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Garlic cloves, minced", "quantity": 2, "unit": "", "note": ""},
        {"name": "Paprika", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0, "unit": "", "note": ""}
    ]

    # Add each ingredient to the session
    for ing in ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Commit the session to save the ingredients
    db.session.commit()

    print("Crispy Chicken Wraps recipe and ingredients added successfully!")

    # db.session.commit()

print("seed complete")
