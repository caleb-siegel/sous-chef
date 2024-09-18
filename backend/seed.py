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

    # Recipe 7: Apple Cinnamon Raisin Breakfast Cookies
    apple_cinnamon_raisin_breakfast_cookies_recipe = Recipe(
        name="Apple Cinnamon Raisin Breakfast Cookies",
        picture="/recipes/apple_cinnamon_raisin_breakfast_cookies.jpeg",
        source_category_id=2,
        source="Sally's Baking Addiction",
        reference="161",
        instructions="""
    Preheat the oven to 325°F (160°C). Line a large cookie sheet with parchment paper or a silicone baking mat. Set aside.

    Combine all of the ingredients into a large bowl and mix by hand with a rubber spatula. Mix until all the ingredients are combined. The dough will be quite stiff.

    Take ¼ cup (35g) of dough, drop it onto the prepared cookie sheet and slightly flatten the top into the desired thickness. The cookies will not spread in the oven. Repeat with the remaining dough.

    Bake for 15-16 minutes, or until the edges are lightly brown. Allow to cool completely on the cookie sheets. The cookies will remain fresh in an airtight container at room temperature or in the refrigerator for 1 week. Cookies can be frozen up to 3 months.

    Sally says: Double this recipe and freeze your leftover cookies for a quick grab-and-go breakfast or snack. My freezer is stocked with them! Instead of raisins and apples, fill them with your other favorites like nuts, chocolate chips, pumpkin seeds, and coconut.
    """
    )

    db.session.add(apple_cinnamon_raisin_breakfast_cookies_recipe)
    db.session.commit()

    apple_cinnamon_raisin_breakfast_cookies_recipe_id = apple_cinnamon_raisin_breakfast_cookies_recipe.id

    apple_cinnamon_raisin_breakfast_cookies_ingredients = [
        {"name": "Quick-cooking oats (not whole oats)", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Ground cinnamon", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Peanut butter", "quantity": 0.75, "unit": "cup", "note": ""},
        {"name": "Pure maple syrup", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Apple butter", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Dried apples, diced", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Raisins", "quantity": 0.5, "unit": "cup", "note": ""}
    ]

    for ing in apple_cinnamon_raisin_breakfast_cookies_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=apple_cinnamon_raisin_breakfast_cookies_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=apple_cinnamon_raisin_breakfast_cookies_recipe_id,
        tag_id=12
    )
    db.session.add(recipe_tag_entry)

    # Recipe 8: Maple Pecan Granola
    maple_pecan_granola_recipe = Recipe(
        name="Maple Pecan Granola",
        picture="/recipes/maple_pecan_granola.jpeg",
        source_category_id=2,
        source="Sally's Baking Addiction",
        reference="166",
        instructions="""
    Preheat the oven to 300°F (145°C). Line a large baking sheet with parchment paper or a silicone baking mat.

    Combine all the ingredients in a large bowl and stir until all the oats are moistened.

    Spread onto the prepared baking sheet and bake for 45 minutes, stirring every 15 minutes. Allow to cool completely—the air will help the granola obtain a crunchy texture. Granola remains fresh in an airtight container at room temperature for up to 3 weeks.

    Sally says: No nuts for you? Try replacing the pecans with dried cranberries, dried cherries, raisins, or pumpkin seeds.
    """
    )

    db.session.add(maple_pecan_granola_recipe)
    db.session.commit()

    maple_pecan_granola_recipe_id = maple_pecan_granola_recipe.id

    maple_pecan_granola_ingredients = [
        {"name": "Old-fashioned oats", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Pure maple syrup", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Dark brown sugar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Chopped pecans", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Melted coconut or vegetable oil", "quantity": 2, "unit": "tbsp", "note": ""},
        {"name": "Ground cinnamon", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Salt", "quantity": 0, "unit": "pinch", "note": ""}
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

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=maple_pecan_granola_recipe_id,
        tag_id=12
    )
    db.session.add(recipe_tag_entry)

    # Recipe 9: Peanut Butter Chunk Oatmeal Bars
    peanut_butter_chunk_oatmeal_bars_recipe = Recipe(
        name="Peanut Butter Chunk Oatmeal Bars",
        picture="/recipes/peanut_butter_chunk_oatmeal_bars.jpeg",
        source_category_id=2,
        source="Sally's Baking Addiction",
        reference="169",
        instructions="""
    Preheat the oven to 350°F (175°C). Line the bottom and sides of an 8×8-in (20×20 cm) baking pan with aluminum foil, leaving an overhang on all sides. Set aside.

    In a large bowl using a handheld or stand mixer fitted with a paddle attachment, beat the brown sugar and 1 cup (265g) of peanut butter on medium speed until light in color and fluffy, about 2 minutes. Mix in the vanilla, scraping down the sides as needed.

    On low speed, add the flour, oats, salt, and baking soda. The dough will be very thick and clumpy. Slowly add the milk in a steady stream, mixing until a dough forms. With a large spoon or rubber spatula, fold in ½ cup (90g) chocolate chips and raisins.

    Press the dough lightly into the prepared baking dish. Bake for about 17-20 minutes, until the bars are lightly golden on top. Allow to cool completely. Lift the foil out of the pan using the overhang on the sides and cut into bars.

    In a small microwave-safe bowl, melt the remaining peanut butter and chocolate chips. Stir until smooth and drizzle over each bar. The bars will remain fresh stored, covered, at room temperature or in the refrigerator for up to 1 week.

    Sally says: Not a fan of raisins? Use your favorite add-ins instead like nuts, shredded coconut, seeds, dried fruits, or more chocolate chips.
    """
    )

    db.session.add(peanut_butter_chunk_oatmeal_bars_recipe)
    db.session.commit()

    peanut_butter_chunk_oatmeal_bars_recipe_id = peanut_butter_chunk_oatmeal_bars_recipe.id

    peanut_butter_chunk_oatmeal_bars_ingredients = [
        {"name": "Light brown sugar", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Peanut butter, divided", "quantity": 1.25, "unit": "cups", "note": ""},
        {"name": "Vanilla extract", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Whole wheat flour", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Old-fashioned oats", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Baking soda", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Milk", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Semi-sweet chocolate chips", "quantity": 1, "unit": "cup", "note": "or regular size"},
        {"name": "Raisins", "quantity": 0.5, "unit": "cup", "note": ""}
    ]

    for ing in peanut_butter_chunk_oatmeal_bars_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=peanut_butter_chunk_oatmeal_bars_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=peanut_butter_chunk_oatmeal_bars_recipe_id,
        tag_id=12
    )
    db.session.add(recipe_tag_entry)

    db.session.commit()



print("seed complete")
