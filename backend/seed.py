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

    pizza_bubble_ring = Recipe(
        name="Pizza Bubble Ring",
        picture="/recipes/Pizza Bubble Ring.jpeg",
        source_category_id=2,
        source="Best of Kosher",
        reference="",
        instructions="""1. Preheat the oven to 350°F. Spray a 10-inch tube pan with nonstick cooking spray. Make sure to spray the outside of the tube as well. Set aside.
    2. In a bowl, combine butter, garlic, oregano, garlic powder, onion powder, salt, black pepper, and crushed red pepper flakes.
    3. With a sharp knife, carefully divide the dough into 40 small balls.
    4. Flatten one of the balls and place some of the mozzarella into the center. Roll the dough around the cheese to enclose it. Repeat with all 40 balls.
    5. Dip each ball into the butter/spice mixture; place into the prepared tube pan.
    6. Sprinkle Parmesan over the dough balls. Drizzle on any extra butter mixture. Place tube pan on a baking sheet to catch leaks. Bake for 45 minutes or until golden brown.
    7. Let cool for 5 minutes, then carefully lift the tube to remove base from the sides of the pan. Place the tube with the base on a serving plate.
    8. Warm pizza sauce in a small pot over medium heat. Serve pizza bubble ring warm with pizza sauce.
    TIP: If making your own dough, the Bistro Pizza Dough recipe on page 212 will yield 3 pounds of dough. Use 2/3 of the recipe to make the Pizza Bubble Ring.
    TIP: You can use less crushed red pepper if your kids prefer it less spicy.
    YIELD: 8 servings"""
    )

    db.session.add(pizza_bubble_ring)
    db.session.commit()

    recipe_id = pizza_bubble_ring.id

    ingredients = [
        {"name": "Butter, melted", "quantity": 0.5, "unit": "cup (1 stick)", "note": ""},
        {"name": "Garlic cloves, minced", "quantity": 2, "unit": "", "note": ""},
        {"name": "Oregano", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Onion powder", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Crushed red pepper flakes", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Fresh pizza dough", "quantity": 2, "unit": "lbs", "note": ""},
        {"name": "Mozzarella cheese, cut into 40 cubes", "quantity": 8, "unit": "oz", "note": ""},
        {"name": "Grated Parmesan cheese", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Pizza sauce, warmed", "quantity": 1, "unit": "cup", "note": ""}
    ]

    for ing in ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()

    print("Pizza Bubble Ring recipe and ingredients added successfully!")



    # db.session.commit()

print("seed complete")
