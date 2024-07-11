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

    chipotle_bbq_broiled_skirt_steak_recipe = Recipe(
        name="Chipotle Barbecue Broiled Skirt Steak",
        picture="/recipes/chipotle bbq broiled skirt steak.jpeg",
        source_category_id=2,
        source="Peas Love and Carrots",
        reference="Page 250",
        instructions="""
    Cut skirt steak into 2-3 inch pieces.
    Place in a bowl. Cover with cold water and vinegar.
    Soak meat for 30 minutes, then rinse and pat dry.

    In a bowl, combine remaining ingredients; add steak. 
    Marinate for 30 minutes or up to overnight in the fridge.

    Set oven to broil. Line a baking sheet with parchment paper.

    Place skirt steaks on prepared baking sheet. Reserve marinade.
    Broil for 6 minutes on one side.
    Remove from oven; brush with reserved marinade.
    Flip steaks over, brush the second side with marinade.
    Return baking sheet to oven. Broil for 4-5 minutes.

    Remove from oven and enjoy.

    (To cook more well done, after broiling, set oven to 350°F / 180°C, cover pan tightly with foil, and bake for 15 minutes.)

    Slice meat AGAINST the grain and enjoy!
    """
    )

    db.session.add(chipotle_bbq_broiled_skirt_steak_recipe)
    db.session.commit()

    chipotle_bbq_broiled_skirt_steak_id = chipotle_bbq_broiled_skirt_steak_recipe.id

    chipotle_bbq_broiled_skirt_steak_ingredients = [
        {"name": "Skirt steak", "quantity": 3, "unit": "lb", "note": "1.3 kg"},
        {"name": "Apple cider vinegar", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Fave BBQ sauce", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Chipotles in adobo, mashed with a fork", "quantity": 2, "unit": "", "note": ""},
        {"name": "Adobo sauce", "quantity": 2, "unit": "Tbsp", "note": ""}
    ]

    for ing in chipotle_bbq_broiled_skirt_steak_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=chipotle_bbq_broiled_skirt_steak_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()


    # db.session.commit()

print("seed complete")
