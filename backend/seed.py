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

    # Recipe 1: Cornbread Funnel Cakes
    cornbread_funnel_cakes_recipe = Recipe(
        name="Cornbread Funnel Cakes",
        picture="/recipes/cornbread_funnel_cakes.jpeg",
        source_category_id=2,
        source="Millennial Kosher",
        reference="280",
        instructions="""
    1. In a mixing bowl, combine flour, cornmeal, sugar, salt, and baking powder. Add eggs and milk; stir to combine. Place the batter into a piping or ziplock bag with one corner snipped off.
    2. Heat a few inches of oil in a deep skillet. Squeeze a bit of batter into the oil to test for readiness. If batter rises to the top, the oil is hot enough.
    3. Pipe about ⅓ cup batter into the hot oil in a circular motion to create a spiral pattern. Fry until golden; flip to fry the other side. Drain on paper towels. Repeat with remaining batter.
    4. Dust funnel cakes with powdered sugar; serve immediately, with maple syrup for dipping.
        """,
    )

    db.session.add(cornbread_funnel_cakes_recipe)
    db.session.commit()

    cornbread_funnel_cakes_recipe_id = cornbread_funnel_cakes_recipe.id

    cornbread_funnel_cakes_ingredients = [
        {"name": "Flour", "quantity": 1.25, "unit": "cups", "note": ""},
        {"name": "Cornmeal", "quantity": 0.75, "unit": "cup", "note": ""},
        {"name": "Sugar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Kosher salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Baking powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Eggs", "quantity": 2, "unit": "", "note": "lightly beaten"},
        {"name": "Whole milk or nondairy milk", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Canola oil", "quantity": 0, "unit": "", "note": "for frying"},
        {"name": "Powdered sugar", "quantity": 0, "unit": "", "note": "for dusting"},
        {"name": "Pure maple syrup", "quantity": 0, "unit": "", "note": "for dipping"},
    ]

    for ing in cornbread_funnel_cakes_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=cornbread_funnel_cakes_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 2: Ice Cream Cone Bark
    ice_cream_cone_bark_recipe = Recipe(
        name="Ice Cream Cone Bark",
        picture="/recipes/ice_cream_cone_bark.jpeg",
        source_category_id=2,
        source="Millennial Kosher",
        reference="296",
        instructions="""
    1. Melt chocolate over a double boiler; using an offset spatula, spread it into an even layer on a parchment-lined baking sheet. Sprinkle chocolate with colored sprinkles and crushed sugar cones; chill until set.
    2. Break chocolate into pieces. Store in an airtight container for up to two weeks.
        """,
    )

    db.session.add(ice_cream_cone_bark_recipe)
    db.session.commit()

    ice_cream_cone_bark_recipe_id = ice_cream_cone_bark_recipe.id

    ice_cream_cone_bark_ingredients = [
        {"name": "Dairy white chocolate", "quantity": 12, "unit": "oz", "note": ""},
        {"name": "Colored sprinkles", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Sugar cones", "quantity": 3, "unit": "", "note": "crushed"},
    ]

    for ing in ice_cream_cone_bark_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=ice_cream_cone_bark_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 3: Roasted Chickpeas, Three Ways
    roasted_chickpeas_three_ways_recipe = Recipe(
        name="Roasted Chickpeas, Three Ways",
        picture="/recipes/roasted_chickpeas_three_ways.jpeg",
        source_category_id=2,
        source="Millennial Kosher",
        reference="304",
        instructions="""
    1. Preheat oven to 400°F. Spread chickpeas on a baking sheet; toss with oil and desired spice mix.
    2. Bake for about 40-45 minutes, shaking the pan once or twice during baking, until crispy.
    3. Before serving, cool for a few minutes to crisp.

    Note: For best results, do not line baking sheet with parchment paper.
        """,
    )

    db.session.add(roasted_chickpeas_three_ways_recipe)
    db.session.commit()

    roasted_chickpeas_three_ways_recipe_id = roasted_chickpeas_three_ways_recipe.id

    roasted_chickpeas_three_ways_ingredients = [
        {"name": "Chickpeas", "quantity": 1, "unit": "can", "note": "15-oz, drained, rinsed, and patted dry"},
        {"name": "Olive oil", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Flavoring of choice", "quantity": 0, "unit": "", "note": "see below"},
        # Taco Spice Mix (Pareve)
        {"name": "Chili powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Cumin", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Smoked paprika", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Cayenne pepper", "quantity": 1, "unit": "pinch", "note": ""},
        {"name": "Kosher salt", "quantity": 0, "unit": "", "note": "to taste"},
        # Falafel Spice Mix (Pareve)
        {"name": "Cumin", "quantity": 1.5, "unit": "tsp", "note": ""},
        {"name": "Coriander", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Onion powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Kosher salt", "quantity": 0, "unit": "", "note": "to taste"},
        # Pizza Spice Mix (Dairy or Pareve)
        {"name": "Parmesan cheese or nutritional yeast", "quantity": 1, "unit": "Tbsp", "note": "plus more for dusting"},
        {"name": "Oregano", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Tomato paste", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Freshly ground black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Kosher salt", "quantity": 0, "unit": "", "note": "to taste"},
    ]

    for ing in roasted_chickpeas_three_ways_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=roasted_chickpeas_three_ways_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)
    
    db.session.commit()



print("seed complete")
