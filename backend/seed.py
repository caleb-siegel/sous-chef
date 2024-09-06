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


    # Recipe 1: Candied Beef Fry and Potatoes Au Gratin
    candied_beef_fry_and_potatoes_au_gratin_recipe = Recipe(
        name="Candied Beef Fry and Potatoes Au Gratin",
        picture="/recipes/candied_beef_fry_and_potatoes_au_gratin.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="232",
        instructions="""
    Step 1
    Preheat oven to 350°F. Line a baking sheet with parchment paper. Coat a 9x13-inch oven-to-table casserole dish with cooking spray, set aside.

    Step 2
    Prepare the candied beef fry: In a small bowl, combine sugar, maple syrup, and pepper.

    Step 3
    Place beef fry slices on prepared baking sheet. Cut 4 slices into 1/4-inch pieces (for garnish). Brush both sides of beef fry with half of the brown sugar mixture. Bake for 10 minutes.

    Step 4
    Remove from oven; turn slices over. Brush with remaining sugar mixture. Bake 10-15 minutes until beef fry is caramelized. Set aside to cool. Cut larger pieces into a smaller crumble for garnish. Beef fry is easiest to cut while warm.

    Step 5
    Prepare the caramelized onions: In a skillet over medium heat, heat olive oil. Add onions, salt, and pepper; sauté for at least 20-30 minutes, until onions have softened. Raise heat; slightly caramelize (brown) the onion, stirring constantly, for about 3 minutes. Remove from heat.

    Step 6
    Prepare the potatoes: In a large bowl, combine potatoes, olive oil, garlic, soy sauce, vinegar, herbs, and spices. Toss to coat potatoes.

    Step 7
    Assemble the au gratin: Place a thin layer of caramelized onions into prepared casserole dish, to just cover the bottom. Layer half the potatoes in 3 slightly overlapping rows. Reserve 1/2 cup caramelized onions. Spread remaining caramelized onions over potato layer. Arrange candied beef fry slices over onions.

    Step 8
    Layer remaining potatoes in 3 slightly overlapping rows over onions. Sprinkle with reserved caramelized onions and chopped beef fry.

    Step 9
    Cover casserole dish with foil. Bake for 1 hour 15 minutes. Remove from oven; check that potatoes are soft. Add additional bake time if necessary.

    Step 10
    Uncover; bake additional 10-15 minutes.
    """
    )

    db.session.add(candied_beef_fry_and_potatoes_au_gratin_recipe)
    db.session.commit()

    candied_beef_fry_and_potatoes_au_gratin_recipe_id = candied_beef_fry_and_potatoes_au_gratin_recipe.id

    candied_beef_fry_and_potatoes_au_gratin_ingredients = [
        {"name": "Beef fry", "quantity": 2, "unit": "6-8 oz packages", "note": ""},
        {"name": "Brown sugar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Pure maple syrup", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Spanish onions, halved", "quantity": 4, "unit": "large", "note": "Caramelized onions"},
        {"name": "Olive oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Kosher salt", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Red potatoes", "quantity": 2, "unit": "lb", "note": "Peeled and sliced into 1/4-inch rounds"},
        {"name": "Garlic, crushed", "quantity": 4, "unit": "cloves", "note": ""},
        {"name": "Soy sauce", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Red wine vinegar", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Dried rosemary", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Dried basil", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Dried parsley flakes", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Kosher salt", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""}
    ]

    for ing in candied_beef_fry_and_potatoes_au_gratin_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=candied_beef_fry_and_potatoes_au_gratin_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)


    # Recipe 2: Honey Mustard Potatoes
    honey_mustard_potatoes_recipe = Recipe(
        name="Honey Mustard Potatoes",
        picture="/recipes/honey_mustard_potatoes.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="230",
        instructions="""
    Step 1
    Preheat oven to 400°F. Coat a 9x13-inch baking pan with cooking spray.

    Step 2
    Rinse potatoes; place potatoes into a medium pot. Cover with water; bring to a boil for 10 minutes; drain. This step ensures that potatoes are completely baked.

    Step 3
    Place potatoes in a single layer in prepared baking pan. In a small bowl mix together potatoes, toss to coat, honey, and onion soup mix.

    Step 4
    Bake uncovered, for 55-60 minutes, tossing occasionally. Serve warm.
    """
    )

    db.session.add(honey_mustard_potatoes_recipe)
    db.session.commit()

    honey_mustard_potatoes_recipe_id = honey_mustard_potatoes_recipe.id

    honey_mustard_potatoes_ingredients = [
        {"name": "Pebble (mini) potatoes", "quantity": 2, "unit": "lb", "note": ""},
        {"name": "Yellow mustard", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Honey", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Onion soup mix", "quantity": 1, "unit": "Tbsp", "note": ""}
    ]

    for ing in honey_mustard_potatoes_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=honey_mustard_potatoes_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

print("seed complete")
