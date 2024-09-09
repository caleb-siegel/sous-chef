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

    # Recipe 1: Butter Pecan Milkshakes
    butter_pecan_milkshakes_recipe = Recipe(
        name="Butter Pecan Milkshakes",
        picture="/recipes/butter_pecan_milkshakes.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="64",
        instructions="""
    Step 1
    In a blender or with an immersion blender, mix ice cream, milk, Viennese Crunch, caramel cream, and vanilla sugar.

    Step 2
    Prepare 2 large glasses: Drizzle caramel cream down the inside of each glass. Divide ice cream mixture between glasses. Garnish with toppings of choice.
    """
    )

    db.session.add(butter_pecan_milkshakes_recipe)
    db.session.commit()

    butter_pecan_milkshakes_recipe_id = butter_pecan_milkshakes_recipe.id

    butter_pecan_milkshakes_ingredients = [
        {"name": "Butter pecan ice cream", "quantity": 2.5, "unit": "cups", "note": ""},
        {"name": "Milk", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "White Viennese Crunch, crushed", "quantity": 3, "unit": "sticks", "note": ""},
        {"name": "Caramel cream", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Vanilla sugar", "quantity": 0.5, "unit": "Tbsp", "note": ""},
        {"name": "Optional toppings", "quantity": 0, "unit": "", "note": "whipped cream, caramel cream, chocolate syrup, Viennese Crunch crumbs"}
    ]

    for ing in butter_pecan_milkshakes_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=butter_pecan_milkshakes_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 2: Malawah Calzones
    malawah_calzones_recipe = Recipe(
        name="Malawah Calzones",
        picture="/recipes/malawah_calzones.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="48",
        instructions="""
    Step 1
    Prepare the filling: Heat butter in a medium skillet over medium-high heat. Add onion; sauté for 3 minutes, until softened. Add remaining vegetables. Season with 1 teaspoon sea salt and 1/4 teaspoon black pepper. Sauté for 7 minutes, stirring occasionally.

    Step 2
    Add shredded cheese; stir until cheese begins to melt. Add cottage cheese and cream cheese; stir until cheese mixture is completely smooth. Season with additional salt and pepper to taste; add garlic powder. Stir to combine. Remove pan from heat. Cool slightly.

    Step 3
    Prepare the calzones: Preheat oven to 400°F. Line a baking sheet with parchment paper.

    Step 4
    Place 1 malawah dough round on your workspace. Place 2-3 tablespoons of filling onto the center of the round. Fold dough in half; seal by pressing edges together. Reinforce the seal by pressing down around edges with a fork. Transfer calzone to prepared baking sheet. Repeat with remaining malawah rounds and filling.

    Step 5
    Brush each calzone with duck sauce. Garnish with sesame seeds if desired.

    Step 6
    Bake on center rack for 20-25 minutes, until golden. Serve hot.
    """
    )

    db.session.add(malawah_calzones_recipe)
    db.session.commit()

    malawah_calzones_recipe_id = malawah_calzones_recipe.id

    malawah_calzones_ingredients = [
        {"name": "Butter or olive oil", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Red onion, finely diced", "quantity": 1, "unit": "small", "note": ""},
        {"name": "Orange pepper, finely diced", "quantity": 0.5, "unit": "", "note": ""},
        {"name": "White mushrooms, sliced", "quantity": 4, "unit": "oz", "note": "or canned sliced mushrooms, drained"},
        {"name": "Frozen chopped spinach, defrosted and squeezed dry", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Shredded cheese", "quantity": 0.25, "unit": "cup", "note": "Muenster, mozzarella, or Mexican blend"},
        {"name": "Cottage cheese", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Cream cheese or sour cream", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Garlic powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Scallion, sliced", "quantity": 1, "unit": "clove", "note": ""},
        {"name": "Sea salt, divided", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Black pepper, divided", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Malawah dough", "quantity": 1, "unit": "package", "note": "6 rounds, defrosted"},
        {"name": "Duck sauce", "quantity": 3, "unit": "Tbsp", "note": "for brushing"},
        {"name": "Sesame seeds, optional", "quantity": 0, "unit": "", "note": "for garnish"}
    ]

    for ing in malawah_calzones_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=malawah_calzones_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 3: Maple Pecan Granola
    maple_pecan_granola_recipe = Recipe(
        name="Maple Pecan Granola",
        picture="/recipes/maple_pecan_granola.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="44",
        instructions="""
    Step 1
    Preheat oven to 350°F. Line a stainless steel baking sheet with parchment paper or coat with cooking spray.

    Step 2
    Combine all ingredients on prepared baking sheet. Toss gently to evenly coat. Spread into a single layer.

    Step 3
    Bake for 15 minutes, stirring once halfway through baking.

    Step 4
    Remove from oven; cool.

    Step 5
    Store in a resealable bag or airtight container.
    """
    )

    db.session.add(maple_pecan_granola_recipe)
    db.session.commit()

    maple_pecan_granola_recipe_id = maple_pecan_granola_recipe.id

    maple_pecan_granola_ingredients = [
        {"name": "Old-fashioned oats", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Coconut flakes (large chips)", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Chopped pecans", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Turbinado sugar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Dark brown sugar, packed", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Pure maple syrup", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Canola oil", "quantity": 2, "unit": "Tbsp", "note": ""}
    ]

    for ing in maple_pecan_granola_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=maple_pecan_granola_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 4: Sunny-Side-Up Boats
    sunny_side_up_boats_recipe = Recipe(
        name="Sunny-Side-Up Boats",
        picture="/recipes/sunny_side_up_boats.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="38",
        instructions="""
    Step 1
    Preheat oven to 350°F. Line a baking sheet with parchment paper.

    Step 2
    Cut a thin slice off the top of each roll. Carefully remove the center of each roll, leaving a 1/2-inch shell. (You can use the bread you remove for a stuffing or to make croutons.) Place sandwich boats onto the prepared baking sheet.

    Step 3
    Place 1 teaspoon diced onion inside a boat cavity; sprinkle with salt and pepper. Place 1/2 teaspoon butter into the center. Carefully crack an egg; pour it over the onion (without breaking the yolk). Sprinkle with additional salt and pepper and 1 teaspoon Parmesan cheese. Repeat with remaining boats.

    Step 4
    Bake for 15-17 minutes, until the egg whites are set and the yolks are still runny.

    Step 5
    Serve immediately.
    """
    )

    db.session.add(sunny_side_up_boats_recipe)
    db.session.commit()

    sunny_side_up_boats_recipe_id = sunny_side_up_boats_recipe.id

    sunny_side_up_boats_ingredients = [
        {"name": "Pretzel rolls or any hard bread rolls", "quantity": 8, "unit": "", "note": ""},
        {"name": "Onion, diced finely", "quantity": 1, "unit": "small", "note": ""},
        {"name": "Kosher salt, to taste", "quantity": 0, "unit": "", "note": ""},
        {"name": "Black pepper, to taste", "quantity": 0, "unit": "", "note": ""},
        {"name": "Butter", "quantity": 4, "unit": "tsp", "note": ""},
        {"name": "Eggs", "quantity": 8, "unit": "", "note": ""},
        {"name": "Parmesan cheese, for sprinkling", "quantity": 8, "unit": "tsp", "note": ""}
    ]

    for ing in sunny_side_up_boats_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=sunny_side_up_boats_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 5: Brussels Sprouts Fritters
    brussels_sprouts_fritters_recipe = Recipe(
        name="Brussels Sprouts Fritters",
        picture="/recipes/brussels_sprouts_fritters.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="226",
        instructions="""
    Step 1
    Prepare the fritters: In a medium bowl, mix seasoned breadcrumbs, onion powder, baking powder, and nondairy milk. Stir in grated Brussels sprouts and garlic.

    Step 2
    Prepare the batter: In a separate small bowl, whisk together flour and egg. Stir into Brussels sprouts mixture until well combined.

    Step 3
    Heat canola oil in a medium heat frying pan. Drop batter by tablespoonfuls into the pan. Fry each side until golden, about 4 minutes. Remove fritters and drain on paper towel.

    Step 4
    Sprinkle fritters with remaining 1/4 teaspoon salt and lemon juice. Serve with mayonnaise.
    """
    )

    db.session.add(brussels_sprouts_fritters_recipe)
    db.session.commit()

    brussels_sprouts_fritters_recipe_id = brussels_sprouts_fritters_recipe.id

    brussels_sprouts_fritters_ingredients = [
        {"name": "Seasoned breadcrumbs", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Onion powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Baking powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Nondairy milk", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Brussels sprouts, grated", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Garlic, crushed", "quantity": 1, "unit": "clove", "note": ""},
        {"name": "Flour", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Egg, beaten", "quantity": 1, "unit": "", "note": ""},
        {"name": "Canola oil, for frying", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Salt, divided", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Lemon juice", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Mayonnaise", "quantity": 0.25, "unit": "cup", "note": ""}
    ]

    for ing in brussels_sprouts_fritters_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=brussels_sprouts_fritters_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

print("seed complete")
