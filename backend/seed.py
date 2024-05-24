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

    # Create the recipe entry for Lemon-Maple Glazed Salmon
    lemon_maple_glazed_salmon = Recipe(
        name="Lemon-Maple Glazed Salmon",
        picture="/recipes/Lemon-Maple Glazed Salmon.jpeg",
        source_category_id=2,
        source="Simply Gourmet",
        reference="",
        instructions="""1. Prepare the lemon maple glaze. In a small bowl, whisk together all glaze ingredients until relatively smooth. Set aside.
    2. Prepare the salmon. Preheat oven to 400°F. Line a baking sheet with parchment paper; coat with nonstick cooking spray.
    3. Place salmon, skin-side down, on prepared baking sheet. Dab salmon with a dry paper towel; this helps the seasoning stick. Sprinkle with listed spices or your favorite seafood seasonings. Brush a generous amount of glaze onto fish. Allow to rest for 10 minutes.
    4. Bake, uncovered, on the middle rack for 10 minutes. Remove baking sheet from oven, baste fish with a generous brushing of glaze. Return pan to oven for an additional 5-7 minutes.
    5. Serve warm or at room temperature. Garnish with dill, if desired.

    MAKE AHEAD: The glaze can be prepared ahead and frozen; thaw before use.

    TIP! If preparing a whole side of salmon, bake for 30-35 minutes, basting every 10 minutes.
    TIP! Instead of preparing a spice mix for the fish, you can also use any ready-made fish seasoning mix.

    Yield: 6-8 servings"""
    )

    # Add the recipe to the session
    db.session.add(lemon_maple_glazed_salmon)
    db.session.commit()

    # Get the ID of the newly added recipe
    recipe_id = lemon_maple_glazed_salmon.id

    # Create the ingredients entries
    ingredients = [
        {"name": "Salmon fillets", "quantity": 6-8, "unit": "1½-inch", "note": ""},
        {"name": "Sea salt", "quantity": 0, "unit": "", "note": "for sprinkling"},
        {"name": "Paprika", "quantity": 0, "unit": "", "note": "for sprinkling"},
        {"name": "Onion powder", "quantity": 0, "unit": "", "note": "for sprinkling"},
        {"name": "Garlic powder", "quantity": 0, "unit": "", "note": "for sprinkling"},
        {"name": "Maple syrup", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Lemon juice", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Ketchup", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Garlic cloves", "quantity": 3, "unit": "", "note": "minced"},
        {"name": "Fresh dill", "quantity": 1, "unit": "Tbsp", "note": "chopped or 1½ tsp dried dill"},
        {"name": "Kosher salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Dill fronds", "quantity": 0, "unit": "", "note": "for garnish, optional"}
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

    print("Lemon-Maple Glazed Salmon recipe and ingredients added successfully!")


    # db.session.commit()

print("seed complete")
