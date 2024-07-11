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

    vietnamese_beef_bahn_mi_recipe = Recipe(
        name="Vietnamese Beef Bahn Mi",
        picture="/recipes/vietnamese beef bahn mi.jpeg",
        source_category_id=2,
        source="Peas Love and Carrots",
        reference="Page 248",
        instructions="""
    PICKLED VEGETABLES
    1. In a food processor fitted with the grater with the largest holes, or using a knife, cut carrots into matchsticks. Slice radishes very thinly.
    2. Place carrots and radishes into jars. (You can combine in one jar or separately.)
    3. In a large bowl, combine all the remaining pickling ingredients. Whisk until sugar and salt have dissolved.
    4. Pour pickling liquid into the jars until the vegetables are covered.
    5. Cover and shake to combine. Allow vegetables to sit in pickling liquid for 1 hour before using.

    SOY-LIME MAYONNAISE
    6. Place egg, mustard, lime juice, salt, and pepper in a very tall, narrow 4 cup (1 liter) container.
    7. Using an immersion blender, blend until well combined, 30-45 seconds.
    (Alternatively, this can be done in a food processor.)
    8. Continue to blend while you begin streaming in the oil very slowly and evenly at first, then increasing speed.
    9. As the mayo begins to emulsify and thicken toward the bottom of the cup, you may need to pull the blender up and down to ensure that the oil is being incorporated. The mixture should be thick and mayo-like.
    10. Add soy sauce, gently folding in with a spatula. Refrigerate mayo for at least 2 hours before serving.

    MEAT
    11. Add all marinade ingredients to a ziploc bag. Shake bag to combine. Add meat; shake again to distribute the marinade all over the meat. Marinate for 1 hour.
    12. Preheat a skillet over high heat till it is very hot. Add 1 teaspoon oil to the pan to prevent meat from sticking.
    13. Working in small batches, add ¼ of the meat to the pan, stirring constantly to prevent sticking. Since the meat is sliced very thinly it will only take 1-2 minutes to cook. Once the meat is cooked, remove from the pan, set aside.
    14. Continue to cook the rest of the meat in the same way.

    TO ASSEMBLE
    15. Slice baguettes in half lengthwise. Spread bottom half with a nice amount of Soy-Lime Mayonnaise.
    16. Add a layer of meat; top with pickled vegetables.
    17. Top vegetables with a few leaves of cilantro and some chili slices. Eat right away and enjoy!
        """
    )

    db.session.add(vietnamese_beef_bahn_mi_recipe)
    db.session.commit()

    vietnamese_beef_bahn_mi_id = vietnamese_beef_bahn_mi_recipe.id

    vietnamese_beef_bahn_mi_ingredients = [
        # Pickled Vegetables
        {"name": "Large carrots, peeled and tops cut off", "quantity": 4, "unit": "", "note": ""},
        {"name": "Radishes, washed", "quantity": 8, "unit": "", "note": ""},
        {"name": "Warm water", "quantity": 3, "unit": "cups", "note": ""},
        {"name": "Rice vinegar", "quantity": 0.5, "unit": "cup", "note": "depending on how sweet you like your pickles"},
        {"name": "Sugar", "quantity": 2.5, "unit": "Tbsp", "note": ""},
        {"name": "Kosher salt", "quantity": 2, "unit": "tsp", "note": ""},
        
        # Soy-Lime Mayonnaise
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Dijon mustard", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Lime juice, fresh", "quantity": 1, "unit": "Tbsp", "note": "juice of ½ lime"},
        {"name": "Kosher salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Coarsely ground black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Soy sauce", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Soy oil", "quantity": 1, "unit": "cup", "note": ""},

        # Meat
        {"name": "Very thinly sliced beef", "quantity": 1.5, "unit": "lb", "note": "600 g"},
        {"name": "Soy sauce", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Sugar", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Garlic, minced", "quantity": 3, "unit": "cloves", "note": ""},
        {"name": "Sesame oil", "quantity": 1.5, "unit": "tsp", "note": ""},
        {"name": "Canola oil", "quantity": 4, "unit": "Tbsp", "note": ""},
        
        # For Serving
        {"name": "Baguettes", "quantity": 6, "unit": "", "note": ""},
        {"name": "Cilantro leaves", "quantity": 0, "unit": "", "note": "to taste"},
        {"name": "Thai chilies, thinly sliced", "quantity": 0, "unit": "", "note": "to taste"}
    ]

    for ing in vietnamese_beef_bahn_mi_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=vietnamese_beef_bahn_mi_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    db.session.commit()


    # db.session.commit()

print("seed complete")
