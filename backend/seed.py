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

    miso_vegetable_soup_recipe = Recipe(
        name="Miso Vegetable Soup",
        picture="/recipes/miso vegetable soup.jpeg",
        source_category_id=2,
        source="Peas Love and Carrots",
        reference="Page 100",
        instructions="""
    1. In a medium bowl, combine dried mushrooms and boiling water. Cover with plastic wrap; set aside.
    2. Heat a large pot over medium high heat. Add oils, tofu, and 1 tablespoon soy sauce. Stir often for 8-10 minutes so that tofu edges can crisp up. Transfer crisped tofu to a plate; set aside.
    3. Add onion, leek, carrots, and celery to the pot. Cook, stirring often, for 12-14 minutes until onions and leeks begin to brown. Add cremini mushrooms; stir to combine. Cook for 6-8 minutes; stir in zucchini and scallions. Return tofu to the pot.
    4. Add miso to the center of all the vegetables, exposing the bottom of the pot; stir in miso and gochujang.
    5. Add vinegar, soy sauce, and black pepper. Stir so that all the flavors are evenly distributed among the vegetables.
    6. Strain dried mushroom liquid into a bowl, discard the rehydrated mushrooms, and add the mushroom liquid to the pot along with stock or water. Stir to combine.
    7. Bring soup to a boil. Reduce heat to low and cover the pot. Allow soup to simmer over low heat for 2-3 hours. Serve hot and enjoy!
        """
    )

    db.session.add(miso_vegetable_soup_recipe)
    db.session.commit()

    miso_vegetable_soup_id = miso_vegetable_soup_recipe.id

    miso_vegetable_soup_ingredients = [
        {"name": "Dried mushrooms", "quantity": 1.0, "unit": "cup", "note": ""},
        {"name": "Boiling water", "quantity": 4.0, "unit": "cups", "note": ""},
        {"name": "Avocado oil", "quantity": 1.0, "unit": "tbsp", "note": ""},
        {"name": "Toasted sesame oil", "quantity": 1.0, "unit": "tsp", "note": ""},
        {"name": "Firm tofu", "quantity": 10.5, "unit": "oz/300 g", "note": "cut into ½ inch cubes"},
        {"name": "Soy sauce", "quantity": 2.0, "unit": "tbsp", "note": "divided"},
        {"name": "Onion", "quantity": 1.0, "unit": "", "note": "diced"},
        {"name": "Leek", "quantity": 1.0, "unit": "", "note": "white and light green diced"},
        {"name": "Carrots", "quantity": 3.0, "unit": "", "note": "peeled and diced"},
        {"name": "Celery stalks", "quantity": 5.0, "unit": "", "note": "peeled and diced"},
        {"name": "Cremini mushrooms", "quantity": 3.0, "unit": "cups", "note": "sliced"},
        {"name": "Kosher salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Zucchini", "quantity": 2.0, "unit": "", "note": "diced"},
        {"name": "Scallions", "quantity": 5.0, "unit": "", "note": "chopped"},
        {"name": "White miso", "quantity": 3.0, "unit": "tbsp", "note": ""},
        {"name": "Gochujang", "quantity": 2.0, "unit": "tbsp", "note": ""},
        {"name": "Seasoned rice vinegar", "quantity": 1.0, "unit": "tbsp", "note": ""},
        {"name": "Soy sauce", "quantity": 1.0, "unit": "tbsp", "note": ""},
        {"name": "Coarsely ground black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Vegetable stock or water", "quantity": 6.0, "unit": "cups", "note": ""}
    ]

    for ing in miso_vegetable_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=miso_vegetable_soup_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()



    # db.session.commit()

print("seed complete")
