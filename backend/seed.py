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

    artichoke_chicken_recipe = Recipe(
        name="Artichoke Chicken",
        picture="/recipes/artichoke chicken.jpeg",
        source_category_id=2,
        source="Peas Love and Carrots",
        reference="Page 172",
        instructions="""
    1. If using frozen artichokes, defrost, cut away any rough parts, and skip to preparing the chicken.
    2. For fresh artichokes, cover with water and add lemon juice from 1/2 lemon. Bring to a boil, reduce heat, and simmer for 2 hours.
    3. When artichokes are tender, reduce heat and simmer for 30 minutes until cool enough to handle.
    4. Bring artichokes and set aside for 30 minutes until completely cool.
    5. Peel leaves off the artichoke to expose the heart (don't discard the leaves; they make the best dip into any salad dressing or dip and eaten).
    6. Cut hearts into 4 pieces. Set aside.
    7. Preheat oven to 350°F / 180°C. Coat a 9x13 inch pan with nonstick cooking spray.
    8. In a large bowl, combine flour, salt, and pepper; toss with chicken.
    9. In a large frying pan, heat oil on medium high heat and brown chicken cutlets on both sides (1.5-2 minutes per side, chicken will still be a little raw inside).
    10. Transfer to prepared pan.
    11. In the same skillet, sauté artichoke heart pieces, garlic, and crushed red pepper flakes for 1 minute, being careful not to burn the garlic.
    12. Add white wine while scraping all the bits off the bottom of the pan. Allow alcohol to cook off for 2-3 minutes.
    13. Add chicken stock; season with salt and pepper to taste.
    14. Pour sauce over chicken; bake for 30 minutes.
    15. If adding fresh parsley, sprinkle on top during the last 2 minutes of baking.
        """
    )

    db.session.add(artichoke_chicken_recipe)
    db.session.commit()

    artichoke_chicken_id = artichoke_chicken_recipe.id

    artichoke_chicken_ingredients = [
        {"name": "Frozen artichokes", "quantity": 1, "unit": "bag", "note": "defrosted"},
        {"name": "Lemon", "quantity": 0.5, "unit": "", "note": "juice of"},
        {"name": "Chicken cutlets", "quantity": 12, "unit": "", "note": ""},
        {"name": "Flour", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Kosher salt", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Coarsely ground black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Canola oil", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Garlic", "quantity": 2, "unit": "Tbsp", "note": "minced"},
        {"name": "Crushed red pepper flakes", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Dry white wine", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Chicken stock", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Fresh parsley", "quantity": 1, "unit": "handful", "note": "for garnish (optional)"}
    ]

    for ing in artichoke_chicken_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=artichoke_chicken_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()


    # db.session.commit()

print("seed complete")
