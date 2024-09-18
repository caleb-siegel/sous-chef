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

    # Recipe 9: Chunky Peanut Butter Cookies
    chunky_peanut_butter_cookies_recipe = Recipe(
        name="Chunky Peanut Butter Cookies",
        picture="/recipes/chunky_peanut_butter_cookies.jpeg",
        source_category_id=2,
        source="Sally's Baking Addiction",
        reference="105",
        instructions="""
    1. Whisk the flour, baking powder, and baking soda together in a large bowl. Set aside.
    2. Using a handheld or stand mixer fitted with a paddle attachment, beat the butter, brown sugar, and granulated sugar together in a large bowl on medium speed until creamed, about 2–3 minutes. Add the egg and vanilla. Beat on medium speed for 1 minute, scraping down the sides as needed. Add the peanut butter and beat for 1 minute. Slowly add the dry ingredients into the wet ingredients using the mixer on low speed until combined. Do not overmix. With a large spoon or rubber spatula, fold the peanuts into the dough. Cover the dough and chill for at least 2 hours (or up to 3 days).
    3. Remove the chilled dough from the refrigerator and allow to soften at room temperature for 10 minutes.
    4. Preheat the oven to 350°F (175°C). Line two large cookie sheets with parchment paper or silicone baking mats.
    5. Roll the dough into balls, about 2 tablespoons of dough each. Place on the cookie sheet about 3in (7.5cm) apart and, using a fork, lightly press down on the cookies, creating a criss-cross pattern on top.
    6. Bake each batch for 12–13 minutes, until lightly browned on the edges. The cookies will look very soft and underbaked. Allow to cool on the cookie sheet for 10 minutes before transferring to a wire rack to cool completely. The cookies will stay fresh in an airtight container at room temperature for up to 7 days.
    Sally Says: Making those iconic criss-cross patterns on top of these peanut butter cookies is much easier with chilled cookie dough; don’t forget to let the dough chill for at least 2 hours in the refrigerator first.
    """
    )

    db.session.add(chunky_peanut_butter_cookies_recipe)
    db.session.commit()

    chunky_peanut_butter_cookies_recipe_id = chunky_peanut_butter_cookies_recipe.id

    chunky_peanut_butter_cookies_ingredients = [
        {"name": "All-purpose flour", "quantity": 1.25, "unit": "cups", "note": "(160g)"},
        {"name": "Baking powder", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Baking soda", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Salted butter", "quantity": 0.5, "unit": "cup", "note": "(115g) softened to room temperature"},
        {"name": "Light or dark brown sugar", "quantity": 0.75, "unit": "cup", "note": "(150g)"},
        {"name": "Granulated sugar", "quantity": 0.25, "unit": "cup", "note": "(50g)"},
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Vanilla extract", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Crunchy peanut butter", "quantity": 0.5, "unit": "cup", "note": "(125g)"},
        {"name": "Salted peanuts or honey roasted peanuts", "quantity": 0.33, "unit": "cup", "note": "(85g)"}
    ]

    for ing in chunky_peanut_butter_cookies_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=chunky_peanut_butter_cookies_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=chunky_peanut_butter_cookies_recipe_id,
        tag_id=12
    )
    db.session.add(recipe_tag_entry)

    # Recipe 10: Cake Batter Chocolate Chip Cookies
    cake_batter_chocolate_chip_cookies_recipe = Recipe(
        name="Cake Batter Chocolate Chip Cookies",
        picture="/recipes/cake_batter_chocolate_chip_cookies.jpeg",
        source_category_id=2,
        source="Sally's Baking Addiction",
        reference="106",
        instructions="""
    1. In a large bowl, sift the flour, cake mix, and baking soda together. Set aside.
    2. Using a handheld or stand mixer fitted with a paddle attachment, beat the butter, granulated sugar, and brown sugar together in a large bowl on medium speed until creamed, about 2–3 minutes. Add the egg and vanilla. Beat on medium speed for 1 minute, scraping down the sides as needed. Using the mixer on low speed, slowly add the dry ingredients into the wet ingredients until combined. Do not overmix. With a large spoon or rubber spatula, fold the chocolate chips, white chocolate chips, and sprinkles into the dough. Cover the dough and chill for at least 2 hours (or up to 3 days).
    3. Remove the chilled dough from the refrigerator and allow to soften at room temperature for 10 minutes.
    4. Preheat the oven to 350°F (175°C). Line two large cookie sheets with parchment paper or silicone baking mats.
    5. Roll the dough into balls, about 1½ tablespoons of dough per cookie. Roll the cookie dough balls to be taller rather than wide. Place 3in (7.5cm) apart onto each cookie sheet and bake each batch for 10–12 minutes, or until the edges are slightly browned. The cookies will look very soft and underbaked. Remove from the oven and allow to cool on the cookie sheet for 5 minutes before transferring to a wire rack to cool completely. The cookies will stay fresh in an airtight container at room temperature for up to 7 days.
    Sally Says: Dry cake mix is used to replace flour in this recipe to give the cookies their distinct “cake batter” taste. Make sure you sift the dry cake mix in with the flour and baking soda—cake mix tends to be lumpy, and the last thing you want are powdery lumps in your baked cookies. Trust me, it’s not pretty!
    """
    )

    db.session.add(cake_batter_chocolate_chip_cookies_recipe)
    db.session.commit()

    cake_batter_chocolate_chip_cookies_recipe_id = cake_batter_chocolate_chip_cookies_recipe.id

    cake_batter_chocolate_chip_cookies_ingredients = [
        {"name": "All-purpose flour", "quantity": 1.25, "unit": "cups", "note": "(160g)"},
        {"name": "Yellow or white boxed dry cake mix", "quantity": 1.25, "unit": "cups", "note": "(190g)"},
        {"name": "Baking soda", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Butter", "quantity": 0.75, "unit": "cup", "note": "(170g) softened to room temperature"},
        {"name": "Granulated sugar", "quantity": 0.5, "unit": "cup", "note": "(100g)"},
        {"name": "Light brown sugar", "quantity": 0.5, "unit": "cup", "note": "(100g)"},
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Vanilla extract", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Semi-sweet chocolate chips", "quantity": 0.5, "unit": "cup", "note": "(90g)"},
        {"name": "White chocolate chips", "quantity": 0.5, "unit": "cup", "note": "(90g)"},
        {"name": "Sprinkles", "quantity": 0.5, "unit": "cup", "note": "(80g)"}
    ]

    for ing in cake_batter_chocolate_chip_cookies_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=cake_batter_chocolate_chip_cookies_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=cake_batter_chocolate_chip_cookies_recipe_id,
        tag_id=12
    )
    db.session.add(recipe_tag_entry)

    # Continue with other recipes in a similar structure...

    db.session.commit()



print("seed complete")
