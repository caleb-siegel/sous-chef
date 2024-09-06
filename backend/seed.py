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


    # Recipe 1: General Tso's Chicken and Broccoli Bake
    general_tsos_chicken_and_broccoli_bake_recipe = Recipe(
        name="General Tso's Chicken and Broccoli Bake",
        picture="/recipes/general_tsos_chicken_and_broccoli_bake.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="168",
        instructions="""
    Step 1
    Preheat oven to 350°F. Coat a 9x13-inch baking pan with cooking spray.

    Step 2
    Place chicken strips, flour, salt, and pepper into a resealable bag. Seal bag; shake until all chicken strips are well coated. Remove strips from flour. Shake off the excess flour; place chicken strips into prepared baking pan.

    Step 3
    Prepare the General Tso's sauce: In a small saucepan, whisk together sugar and cornstarch. Whisk in water. Add remaining ingredients; whisk until smooth. Bring to a boil over medium-high heat, stirring constantly. Lower heat to a simmer and allow sauce to thicken until it lightly coats the back of a spoon. Remove from heat. Alternatively, place mixture into a microwave-safe bowl or container. Microwave on high for 1 minute; stir well. Repeat this two more times for a total of 3 minutes in the microwave. Mixture will be smooth and thickened.

    Step 4
    Pour half the sauce over the chicken strips. Cover pan with foil; bake for 30 minutes.

    Step 5
    Remove pan from oven. Place broccoli florets over the chicken strips. Pour remaining sauce over the broccoli. Cover; bake an additional 15-20 minutes.

    Step 6
    Before serving, sprinkle with glazed cashews and sesame seeds, if using.
    """
    )

    db.session.add(general_tsos_chicken_and_broccoli_bake_recipe)
    db.session.commit()

    general_tsos_chicken_and_broccoli_bake_recipe_id = general_tsos_chicken_and_broccoli_bake_recipe.id

    general_tsos_chicken_and_broccoli_bake_ingredients = [
        {"name": "Chicken cutlets, cut into strips", "quantity": 1.5, "unit": "lb", "note": ""},
        {"name": "Flour", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Kosher salt", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Frozen broccoli florets, defrosted", "quantity": 24, "unit": "oz", "note": ""},
        {"name": "Honey-glazed cashews", "quantity": 0.5, "unit": "cup", "note": "Optional"},
        {"name": "Black and white sesame seeds", "quantity": 0, "unit": "", "note": "Optional, for sprinkling"},
        {"name": "Sugar", "quantity": 0.5, "unit": "cup", "note": "General Tso's Sauce"},
        {"name": "Cornstarch", "quantity": 2, "unit": "Tbsp", "note": "General Tso's Sauce"},
        {"name": "Water", "quantity": 0.5, "unit": "cup", "note": "General Tso's Sauce"},
        {"name": "Rice vinegar", "quantity": 0.5, "unit": "cup", "note": "General Tso's Sauce"},
        {"name": "Low sodium soy sauce", "quantity": 0.5, "unit": "cup", "note": "General Tso's Sauce"},
        {"name": "Hoisin sauce", "quantity": 1.5, "unit": "Tbsp", "note": "General Tso's Sauce"},
        {"name": "Garlic, crushed", "quantity": 4, "unit": "cloves", "note": "General Tso's Sauce"},
        {"name": "Ground ginger", "quantity": 0.5, "unit": "tsp", "note": "General Tso's Sauce"},
        {"name": "Crushed red pepper flakes", "quantity": 0.25, "unit": "tsp", "note": "General Tso's Sauce"}
    ]

    for ing in general_tsos_chicken_and_broccoli_bake_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=general_tsos_chicken_and_broccoli_bake_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 2: Sweet Chili-Glazed Chicken Wings
    sweet_chili_glazed_chicken_wings_recipe = Recipe(
        name="Sweet Chili-Glazed Chicken Wings",
        picture="/recipes/sweet_chili_glazed_chicken_wings.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="158",
        instructions="""
    Step 1
    Preheat oven to 450°F. Set out a baking sheet.

    Step 2
    Pat wings dry with a paper towel (this will help crisp the skin). Place wings on prepared baking sheet. Drizzle with olive oil; sprinkle with salt and pepper. Turn wings to coat evenly.

    Step 3
    Bake skin-side up, uncovered, for 20 minutes.

    Step 4
    Prepare the sweet chili glaze: In a small bowl, combine glaze ingredients.

    Step 5
    Remove wings from oven. Pour off any liquid. Turn wings over. Pour glaze over wings. Bake for 15 minutes. Brush wings with glaze from the baking sheet. Bake for another 15 minutes.

    Step 6
    Turn wings skin-side up. Brush wings once again with glaze. Raise oven temperature to 500°F. Bake an additional 10-15 minutes. Wings will have a fabulous BBQ look.
    """
    )

    db.session.add(sweet_chili_glazed_chicken_wings_recipe)
    db.session.commit()

    sweet_chili_glazed_chicken_wings_recipe_id = sweet_chili_glazed_chicken_wings_recipe.id

    sweet_chili_glazed_chicken_wings_ingredients = [
        {"name": "Chicken wings", "quantity": 2, "unit": "lb", "note": ""},
        {"name": "Olive oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Kosher salt", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Honey", "quantity": 0.5, "unit": "cup", "note": "Sweet Chili Glaze"},
        {"name": "Sweet chili sauce", "quantity": 0.5, "unit": "cup", "note": "Sweet Chili Glaze"},
        {"name": "Garlic, crushed", "quantity": 5, "unit": "cloves", "note": "Sweet Chili Glaze"},
        {"name": "Low sodium soy sauce", "quantity": 3, "unit": "Tbsp", "note": "Sweet Chili Glaze"},
        {"name": "Apple cider vinegar", "quantity": 3, "unit": "Tbsp", "note": "Sweet Chili Glaze"},
        {"name": "Crushed red pepper flakes", "quantity": 0.25, "unit": "tsp", "note": "Sweet Chili Glaze"}
    ]

    for ing in sweet_chili_glazed_chicken_wings_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=sweet_chili_glazed_chicken_wings_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 3: Savory Herb-Rubbed Chicken
    savory_herb_rubbed_chicken_recipe = Recipe(
        name="Savory Herb-Rubbed Chicken",
        picture="/recipes/savory_herb_rubbed_chicken.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="156",
        instructions="""
    Step 1 (Optional)
    Brine the chicken: Fill a large container with brining liquid ingredients. Mix all together. Add chicken; marinate, covered, in refrigerator for at least one hour or overnight.

    Step 2
    Prepare the savory herb rub: In a small bowl, mix together rub ingredients.

    Step 3
    Preheat oven to 350°F. Prepare a 9x13-inch baking pan.

    Step 4
    Remove chicken from brine, if using. Pat chicken dry; coat generously with rub. Cover; bake for 1 hour 15 minutes. Uncover, drizzle with honey. Broil for five minutes.
    """
    )

    db.session.add(savory_herb_rubbed_chicken_recipe)
    db.session.commit()

    savory_herb_rubbed_chicken_recipe_id = savory_herb_rubbed_chicken_recipe.id

    savory_herb_rubbed_chicken_ingredients = [
        {"name": "Chickens, cut into quarters or eighths", "quantity": 6, "unit": "lb", "note": ""},
        {"name": "Honey", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Dark brown sugar (packed)", "quantity": 9, "unit": "Tbsp", "note": "Savory Herb Rub"},
        {"name": "Sweet or smoked paprika", "quantity": 6, "unit": "Tbsp", "note": "Savory Herb Rub"},
        {"name": "Chili powder", "quantity": 4.5, "unit": "Tbsp", "note": "Savory Herb Rub"},
        {"name": "Kosher salt", "quantity": 3, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Garlic powder", "quantity": 3, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Black pepper", "quantity": 1.5, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Cumin", "quantity": 1.5, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Crushed red pepper flakes", "quantity": 1, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Nutmeg", "quantity": 0.5, "unit": "tsp", "note": "Savory Herb Rub"},
        {"name": "Water", "quantity": 4, "unit": "cups", "note": "Optional Brining Liquid"},
        {"name": "Dark brown sugar", "quantity": 0.5, "unit": "cup", "note": "Optional Brining Liquid"},
        {"name": "Kosher salt", "quantity": 0.5, "unit": "cup", "note": "Optional Brining Liquid"},
        {"name": "Vinegar", "quantity": 0.5, "unit": "cup", "note": "Optional Brining Liquid"}
    ]

    for ing in savory_herb_rubbed_chicken_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=savory_herb_rubbed_chicken_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

print("seed complete")
