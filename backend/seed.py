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

    # Create the recipe entry for Silan Salmon with Chickpea-Date Salad
    silan_salmon_chickpea_date_salad = Recipe(
        name="Silan Salmon with Chickpea-Date Salad",
        picture="/recipes/Silan Salmon with Chickpea-Date Salad.jpeg",
        source_category_id=2,
        source="Best of Kosher",
        reference="",
        instructions="""1. Preheat oven to 350°F. Line a baking sheet with parchment paper.
    2. Lay salmon fillets on prepared baking sheet. Brush each with a thin coat of silan on all surfaces. Bake, uncovered, for 12 minutes. Remove from oven; brush on a thicker coating of silan. Return salmon to the oven; bake for a final 5 minutes or until almost cooked in the center at the thickest part.
    3. Meanwhile, prepare the salad. Place chickpeas into a large bowl. Slice and dice dates; add to the bowl. Add celery, radishes, onion, and mint. Drizzle in olive oil. Sprinkle with salt, pepper, orange zest, juice, and parsley. Toss well to evenly dress.
    4. Scoop salad onto a serving platter or individual plates. Top with salmon. Drizzle a little olive oil and additional silan around the plate.

    TIP: To serve this in small portions, as shown in the photo, use salmon cubes instead of fillets, with 2-3 cubes per person. Reduce baking time.

    YIELD: 6-8 servings"""
    )

    # Add the recipe to the session
    db.session.add(silan_salmon_chickpea_date_salad)
    db.session.commit()

    # Get the ID of the newly added recipe
    recipe_id = silan_salmon_chickpea_date_salad.id

    # Create the ingredients entries
    ingredients = [
        {"name": "Salmon fillets", "quantity": 6, "unit": "(6-8 oz)", "note": ""},
        {"name": "Silan, for brushing plus additional for plating", "quantity": 0, "unit": "", "note": ""},
        {"name": "Chickpeas, drained and rinsed", "quantity": 1, "unit": "(15 oz) can", "note": ""},
        {"name": "Medjool dates, sliced into ⅓-inch pieces", "quantity": 1, "unit": "cup", "note": "(8-9 dates)"},
        {"name": "Celery stalk, cut into ¼-inch dice", "quantity": 1, "unit": "", "note": ""},
        {"name": "Red radishes, cut into ¼-inch dice", "quantity": 3, "unit": "", "note": ""},
        {"name": "Red onion, very thinly sliced", "quantity": 0.5, "unit": "small", "note": ""},
        {"name": "Mint leaves, finely chopped", "quantity": 6, "unit": "", "note": ""},
        {"name": "Olive oil, plus additional for plating", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Fine sea salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.125, "unit": "tsp", "note": ""},
        {"name": "Zest and juice of ½ orange", "quantity": 0, "unit": "", "note": ""},
        {"name": "Fresh parsley leaves, chopped", "quantity": 0.33, "unit": "cup", "note": ""}
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

    print("Silan Salmon with Chickpea-Date Salad recipe and ingredients added successfully!")

    # db.session.commit()

print("seed complete")
