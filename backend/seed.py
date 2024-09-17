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

    # Recipe entry for "Chinese Eggplant with Spicy Garlic Sauce"
    chinese_eggplant_recipe = Recipe(
        name="Chinese Eggplant with Spicy Garlic Sauce",
        picture="/recipes/chinese_eggplant.jpeg",
        source_category_id=2,
        source="Chloe Flavor",
        reference="169",
        instructions="""
    In a small bowl, whisk together the water, tamari, vinegar, maple syrup, garlic, sriracha, red pepper flakes, and cornstarch until the cornstarch has dissolved.
    In a large nonstick skillet, heat the oil over medium-high heat. When it shimmers, add the eggplant and scallions. Cook, stirring often, for about 10 minutes, until the eggplant is nicely browned.
    Add the sauce to the pan and reduce the heat to medium. Cook for 10 to 15 minutes, until the eggplant is soft and the sauce is thick. Taste and adjust the seasoning. Serve over rice. Garnish with scallions and sesame seeds.
    """
    )

    db.session.add(chinese_eggplant_recipe)
    db.session.commit()

    chinese_eggplant_recipe_id = chinese_eggplant_recipe.id

    chinese_eggplant_ingredients = [
        {"name": "Water", "quantity": 0.33, "unit": "cup", "note": ""},
        {"name": "Tamari", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Seasoned rice vinegar", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Pure maple syrup", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Garlic cloves", "quantity": 4, "unit": "", "note": "minced"},
        {"name": "Sriracha", "quantity": 1.5, "unit": "teaspoons", "note": ""},
        {"name": "Crushed red pepper flakes", "quantity": 0.25, "unit": "teaspoon", "note": ""},
        {"name": "Cornstarch", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Vegetable oil", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Asian eggplants or American eggplant", "quantity": 3, "unit": "", "note": "cut into bite-size cubes"},
        {"name": "Scallions", "quantity": 2, "unit": "", "note": "thinly sliced, plus more for garnish"},
        {"name": "Steamed rice", "quantity": 0, "unit": "", "note": "for serving"},
        {"name": "Sesame seeds", "quantity": 0, "unit": "", "note": "for garnish"}
    ]

    for ing in chinese_eggplant_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=chinese_eggplant_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=chinese_eggplant_recipe_id,
        tag_id=2
    )
    db.session.add(recipe_tag_entry)


    # Recipe entry for "California Nachos"
    california_nachos_recipe = Recipe(
        name="California Nachos",
        picture="/recipes/california_nachos.jpeg",
        source_category_id=2,
        source="Chloe Flavor",
        reference="172",
        instructions="""
    Preheat the oven to 425°F. Use gluten-free tortilla chips and replace the seitan with tempeh.
    Pile the chips into a 9 x 13-inch baking dish. Add the black beans. Bake for 10 to 15 minutes, until the beans are warmed through.
    Meanwhile, in a large skillet, heat the olive oil over medium heat. When it shimmers, add the seitan, taco seasoning, smoked paprika, and chipotle powder and cook for about 5 minutes, until the seitan is heated through. Add water as needed if the skillet seems dry. Season with salt. Remove the skillet from the heat.
    In a small bowl, mash together the avocado and lime juice. Season with salt.
    Remove the baking dish from the oven and add the Cashew Queso. Scatter over the seitan. Top off the nachos with the mashed avocado and any additional toppings you desire. Serve immediately.
    """
    )

    db.session.add(california_nachos_recipe)
    db.session.commit()

    california_nachos_recipe_id = california_nachos_recipe.id

    california_nachos_ingredients = [
        {"name": "Tortilla chips", "quantity": 1, "unit": "large bag", "note": ""},
        {"name": "Black beans", "quantity": 15, "unit": "ounce", "note": "can, drained and rinsed"},
        {"name": "Olive oil", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Ground seitan", "quantity": 8, "unit": "ounces", "note": "see Tip, page 31"},
        {"name": "Taco seasoning", "quantity": 1, "unit": "tablespoon", "note": ""},
        {"name": "Smoked paprika", "quantity": 0.5, "unit": "teaspoon", "note": ""},
        {"name": "Chipotle powder", "quantity": 0.5, "unit": "teaspoon", "note": ""},
        {"name": "Sea salt", "quantity": 0, "unit": "", "note": ""},
        {"name": "Avocado", "quantity": 1, "unit": "", "note": "diced"},
        {"name": "Lime juice", "quantity": 2, "unit": "teaspoons", "note": ""},
        {"name": "Cashew queso", "quantity": 0, "unit": "", "note": "see page 119"},
        {"name": "Fresh tomato salsa", "quantity": 0.5, "unit": "cup", "note": "optional"},
        {"name": "Lime Sour Cream", "quantity": 0, "unit": "", "note": "optional, page 36"},
        {"name": "Red cabbage", "quantity": 0, "unit": "", "note": "finely chopped, optional"},
        {"name": "Jalapeño", "quantity": 0, "unit": "", "note": "thinly sliced, optional"},
        {"name": "Fresh cilantro", "quantity": 0, "unit": "", "note": "chopped, optional"},
        {"name": "Pickled Red Onion", "quantity": 0, "unit": "", "note": "optional, page 115"}
    ]

    for ing in california_nachos_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=california_nachos_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=california_nachos_recipe_id,
        tag_id=2
    )
    db.session.add(recipe_tag_entry)


    # Recipe entry for "Firehouse Chili with Cornbread Muffins"
    firehouse_chili_recipe = Recipe(
        name="Firehouse Chili with Cornbread Muffins",
        picture="/recipes/firehouse_chili.jpeg",
        source_category_id=2,
        source="Chloe Flavor",
        reference="174",
        instructions="""
    In a small bowl, combine the chili powder, paprika, garlic powder, onion powder, oregano, cumin, black pepper, and salt.
    In a large saucepan, heat the olive oil over medium-high heat. When it shimmers, add the onion and bell pepper and cook, stirring frequently, for about 10 minutes, until very soft. Add the garlic and the spice mixture and cook for about 1 minute more, until fragrant.
    Add the water, tomato paste, diced tomatoes with their juices, kidney beans, and brown sugar. Reduce the heat to medium and cook, stirring often, for about 15 minutes, until the flavors come together.
    If desired, top each serving with Lime Sour Cream, red onion, cilantro, and a lime wedge. Serve with Cornbread Muffins and Whipped Maple Butter.
    """
    )

    db.session.add(firehouse_chili_recipe)
    db.session.commit()

    firehouse_chili_recipe_id = firehouse_chili_recipe.id

    firehouse_chili_ingredients = [
        {"name": "Chili powder", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Paprika", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Garlic powder", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Onion powder", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Oregano", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Ground cumin", "quantity": 1, "unit": "teaspoon", "note": ""},
        {"name": "Black pepper", "quantity": 1, "unit": "teaspoon", "note": "freshly ground"},
        {"name": "Sea salt", "quantity": 2, "unit": "teaspoons", "note": ""},
        {"name": "Olive oil", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Onion", "quantity": 1, "unit": "large", "note": "diced"},
        {"name": "Green bell pepper", "quantity": 1, "unit": "medium", "note": "diced"},
        {"name": "Garlic cloves", "quantity": 4, "unit": "", "note": "minced"},
        {"name": "Water", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Tomato paste", "quantity": 2, "unit": "tablespoons", "note": ""},
        {"name": "Diced tomatoes", "quantity": 28, "unit": "ounce", "note": "with their juices"},
        {"name": "Red kidney beans", "quantity": 30, "unit": "ounce", "note": "cans, drained and rinsed"},
        {"name": "Brown sugar", "quantity": 1, "unit": "tablespoon", "note": "or pure maple syrup"},
        {"name": "Cornbread Muffins", "quantity": 0, "unit": "", "note": "for serving (recipe follows)"},
        {"name": "Whipped Maple Butter", "quantity": 0, "unit": "", "note": "for serving (page 165)"}
    ]

    for ing in firehouse_chili_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=firehouse_chili_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=firehouse_chili_recipe_id,
        tag_id=2
    )
    db.session.add(recipe_tag_entry)


    # Recipe entry for "Cornbread Muffins"
    cornbread_muffins_recipe = Recipe(
        name="Cornbread Muffins",
        picture="/recipes/cornbread_muffins.jpeg",
        source_category_id=2,
        source="Chloe Flavor",
        reference="176",
        instructions="""
    Preheat the oven to 350°F. Line a 12-cup muffin pan with paper liners and lightly grease the liners with cooking spray.
    In a large bowl, whisk together the flour, cornmeal, sugar, baking powder, and salt. In a small bowl, whisk together the almond milk, oil, and vinegar. Add the wet ingredients to the dry and stir to combine. Do not overmix. Fold in the corn.
    Fill the prepared muffin pan with the batter, filling each muffin cup about two-thirds of the way full. Bake for about 20 minutes, until golden. Remove from the oven and serve warm.
    """
    )

    db.session.add(cornbread_muffins_recipe)
    db.session.commit()

    cornbread_muffins_recipe_id = cornbread_muffins_recipe.id

    cornbread_muffins_ingredients = [
        {"name": "All-purpose flour", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Cornmeal", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Sugar", "quantity": 0.75, "unit": "cup", "note": ""},
        {"name": "Baking powder", "quantity": 2, "unit": "teaspoons", "note": ""},
        {"name": "Sea salt", "quantity": 0.5, "unit": "teaspoon", "note": ""},
        {"name": "Almond milk", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Vegetable oil", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Apple cider vinegar", "quantity": 1, "unit": "tablespoon", "note": ""},
        {"name": "Corn kernels", "quantity": 0.5, "unit": "cup", "note": "fresh or frozen"}
    ]

    for ing in cornbread_muffins_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=cornbread_muffins_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Add tag to the recipe
    recipe_tag_entry = Recipe_Tag(
        recipe_id=cornbread_muffins_recipe_id,
        tag_id=2
    )
    db.session.add(recipe_tag_entry)    
    db.session.commit()



print("seed complete")
