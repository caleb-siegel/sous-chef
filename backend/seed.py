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

    vegan_pesto_pasta_salad_recipe = Recipe(
        name="Vegan Pesto Pasta Salad",
        picture="/recipes/vegan_pesto_pasta_salad.jpeg",
        source_category_id=2,
        source="Unknown Source",
        reference="Unknown Reference",
        instructions="""
    Step 1
    Bring a large pot of salted water to a boil. Add the pasta and cook until tender. Drain the pasta, rinse under cold water until cool to the touch, then shake dry.

    Step 2
    Transfer the tomatoes and a big pinch of salt to a large bowl. Stir to combine and set aside.
    Make the pesto: Add the pistachios, capers, and garlic to a food processor and pulse until coarsely chopped. Add the basil and a pinch of salt and pepper. Pulse until finely chopped. Add the lemon juice. While the motor is running, gradually drizzle in the olive oil until well blended, scraping down the sides as needed. Scrape the pesto into the bowl of tomatoes.

    Step 3
    Add the pasta to the pesto and tomatoes, stir until well coated. Let cool slightly (about 5 minutes), then stir in the arugula and a few torn basil leaves. Season to taste with salt.

    The salad can sit for up to 2 hours, or be refrigerated for up to 2 days. Refresh with salt, lemon juice, and oil as needed.
    """
    )

    db.session.add(vegan_pesto_pasta_salad_recipe)
    db.session.commit()

    vegan_pesto_pasta_salad_id = vegan_pesto_pasta_salad_recipe.id

    vegan_pesto_pasta_salad_ingredients = [
        {"name": "Salt", "quantity": None, "unit": "", "note": ""},
        {"name": "Fusilli or other twirly noodles", "quantity": 1, "unit": "lb", "note": ""},
        {"name": "Cherry tomatoes, halved", "quantity": 1, "unit": "pint", "note": ""},
        {"name": "Raw pistachios, slivered almonds, or pine nuts", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Capers, rinsed", "quantity": 0.33, "unit": "cup", "note": ""},
        {"name": "Garlic clove, peeled", "quantity": 1, "unit": "", "note": ""},
        {"name": "Basil leaves", "quantity": 2, "unit": "packed cups", "note": "plus more for serving"},
        {"name": "Black pepper", "quantity": None, "unit": "", "note": ""},
        {"name": "Lemon juice", "quantity": 2, "unit": "tbsp", "note": ""},
        {"name": "Extra-virgin olive oil", "quantity": 0.33, "unit": "cup", "note": ""},
        {"name": "Arugula", "quantity": 2, "unit": "big handfuls", "note": ""}
    ]

    for ing in vegan_pesto_pasta_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=vegan_pesto_pasta_salad_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()



    # db.session.commit()

print("seed complete")
