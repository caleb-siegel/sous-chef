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


    # Recipe 19: Zucchini Dill Soup
    zucchini_dill_soup_recipe = Recipe(
        name="Zucchini Dill Soup",
        picture="/recipes/zucchini_dill_soup.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="92",
        instructions="""
    Step 1
    In a saucepan, heat olive oil over medium heat.

    Step 2
    Add onion, celery, leeks, and garlic; sauté for 8-10 minutes, or until veggies soften. Add zucchini, potato, and sweet potato. Stir to combine.

    Step 3
    Add veggie broth, chicken soup mix, salt, and white pepper. Stir well; bring to a boil. Lower heat; simmer for 20 minutes, uncovered.

    Step 4
    Remove from heat; blend with an immersion blender until smooth. Add dill, stirring well. Taste; adjust seasoning if necessary.
    """
    )

    db.session.add(zucchini_dill_soup_recipe)
    db.session.commit()

    zucchini_dill_soup_recipe_id = zucchini_dill_soup_recipe.id

    zucchini_dill_soup_ingredients = [
        {"name": "Olive oil", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Onion, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Celery, diced", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Leeks, diced", "quantity": 2, "unit": "", "note": "light green and white part only"},
        {"name": "Garlic cloves, minced", "quantity": 3, "unit": "", "note": ""},
        {"name": "Zucchini, peeled and chopped", "quantity": 3, "unit": "", "note": ""},
        {"name": "Potato, peeled and cubed", "quantity": 1, "unit": "", "note": ""},
        {"name": "Sweet potato, peeled and cubed", "quantity": 1, "unit": "", "note": ""},
        {"name": "Veggie broth", "quantity": 32, "unit": "oz", "note": ""},
        {"name": "Chicken soup mix", "quantity": 2, "unit": "Tbsp", "note": "pareve"},
        {"name": "Sea salt", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "White pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Chopped dill", "quantity": 0.25, "unit": "cup", "note": "stems discarded"}
    ]

    for ing in zucchini_dill_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=zucchini_dill_soup_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 20: Really Good Lentil Soup
    really_good_lentil_soup_recipe = Recipe(
        name="Really Good Lentil Soup",
        picture="/recipes/really_good_lentil_soup.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="96",
        instructions="""
    Step 1
    In a large saucepan, heat olive oil over medium heat.

    Step 2
    Add lentils; sauté for 3 minutes. Add 10-12 cups water; bring to a rolling boil.

    Step 3
    Place celery into a mesh cooking bag; place the onions, garlic, and jalapeño into a second bag.

    Step 4
    To the pot, add potatoes, cilantro cubes, butter, chicken soup mix, salt, and pepper. Stir well. Add mesh cooking bags.

    Step 5
    Reduce heat to medium; cook for 1 hour, uncovered. Remove and discard bags with their contents. Optional: Mash garlic with a fork and stir into the soup.
    """
    )

    db.session.add(really_good_lentil_soup_recipe)
    db.session.commit()

    really_good_lentil_soup_recipe_id = really_good_lentil_soup_recipe.id

    really_good_lentil_soup_ingredients = [
        {"name": "Olive oil", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Lentils, rinsed", "quantity": 1, "unit": "lb", "note": ""},
        {"name": "Celery heart, leaves discarded, roughly chopped", "quantity": 1, "unit": "", "note": ""},
        {"name": "Onion, peeled", "quantity": 1, "unit": "", "note": ""},
        {"name": "Garlic cloves", "quantity": 3, "unit": "4-5", "note": ""},
        {"name": "Jalapeño pepper, whole", "quantity": 1, "unit": "", "note": ""},
        {"name": "Yukon gold potatoes, peeled and diced", "quantity": 2, "unit": "medium", "note": ""},
        {"name": "Cilantro cubes or fresh cilantro", "quantity": 4, "unit": "", "note": ""},
        {"name": "Butter or margarine", "quantity": 4, "unit": "Tbsp", "note": ""},
        {"name": "Chicken soup mix", "quantity": 1, "unit": "Tbsp", "note": "pareve"},
        {"name": "Sea salt", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""}
    ]

    for ing in really_good_lentil_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=really_good_lentil_soup_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 21: Meatball Noodle Soup
    meatball_noodle_soup_recipe = Recipe(
        name="Meatball Noodle Soup",
        picture="/recipes/meatball_noodle_soup.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="98",
        instructions="""
    Step 1
    In a bowl, mix ground beef, onion, parsley, allspice, salt, and pepper until just combined. Form 25 mini meatballs, approximately the size of a quarter.

    Step 2
    Heat a saucepan over medium-high heat. Add oil; sear meatballs on both sides, 1-2 minutes per side. Transfer meatballs to a plate.

    Step 3
    Reduce heat to medium. Add noodles; sauté for 30 seconds. Add garlic and tomato paste, stirring well. Cook for 1 minute, stirring constantly.

    Step 4
    Add chicken broth, water, bouillon cube, garlic powder, salt, and pepper. Stir well. Add meatballs; bring to a boil.

    Step 5
    Reduce heat to low; simmer, uncovered, for 20 minutes. Garnish with parsley before serving.
    """
    )

    db.session.add(meatball_noodle_soup_recipe)
    db.session.commit()

    meatball_noodle_soup_recipe_id = meatball_noodle_soup_recipe.id

    meatball_noodle_soup_ingredients = [
        {"name": "Ground beef", "quantity": 1, "unit": "lb", "note": ""},
        {"name": "Small onion, minced", "quantity": 0.5, "unit": "", "note": "about 1/4 cup"},
        {"name": "Fresh parsley, chopped", "quantity": 2-3, "unit": "Tbsp", "note": ""},
        {"name": "Allspice", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Oil", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Egg noodles, lightly crushed", "quantity": 1.25, "unit": "cups", "note": ""},
        {"name": "Garlic cloves, minced", "quantity": 3, "unit": "", "note": ""},
        {"name": "Tomato paste", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Chicken broth", "quantity": 32, "unit": "oz", "note": ""},
        {"name": "Water", "quantity": 3, "unit": "cups", "note": ""},
        {"name": "Chicken bouillon cube", "quantity": 1, "unit": "", "note": ""},
        {"name": "Garlic powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Fresh parsley, chopped, for garnish", "quantity": 0, "unit": "", "note": "optional"}
    ]

    for ing in meatball_noodle_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=meatball_noodle_soup_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 22: Weekday Chicken Soup
    weekday_chicken_soup_recipe = Recipe(
        name="Weekday Chicken Soup",
        picture="/recipes/weekday_chicken_soup.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="100",
        instructions="""
    Step 1
    To a large pot, add chicken and 12 cups water. Cook, uncovered, over medium-low heat for 1 hour; skim off and discard foam that rises to the surface.

    Step 2
    Add butternut squash, potato, zucchini, onion, carrots, celery, salt, chicken soup mix, and pepper. Reduce heat to low; cook for 1 additional hour.

    Step 3
    Remove from heat. Remove chicken from the pot. Chop into small pieces. Return to the pot.

    Step 4
    Add dill cubes; they will fully defrost in the hot soup. Stir well; taste and adjust seasoning, if necessary.
    """
    )

    db.session.add(weekday_chicken_soup_recipe)
    db.session.commit()

    weekday_chicken_soup_recipe_id = weekday_chicken_soup_recipe.id

    weekday_chicken_soup_ingredients = [
        {"name": "Boneless chicken thighs", "quantity": 1.5-2, "unit": "lb", "note": ""},
        {"name": "Butternut squash, peeled and cubed", "quantity": 0.5, "unit": "", "note": ""},
        {"name": "Large russet potato, peeled and cubed", "quantity": 1, "unit": "", "note": ""},
        {"name": "Zucchini, peeled and sliced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Onion, peeled and left whole", "quantity": 1, "unit": "", "note": "with root intact"},
        {"name": "Carrots, peeled and cut into chunks", "quantity": 2-3, "unit": "", "note": ""},
        {"name": "Celery heart, sliced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Sea salt", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Chicken soup mix", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Frozen dill cubes", "quantity": 6, "unit": "", "note": ""}
    ]

    for ing in weekday_chicken_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=weekday_chicken_soup_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 23: Red Lentil Flanken Soup
    red_lentil_flanken_soup_recipe = Recipe(
        name="Red Lentil Flanken Soup",
        picture="/recipes/red_lentil_flanken_soup.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="102",
        instructions="""
    Step 1
    In a large soup pot, heat oil over medium heat. Add marrow bones and flanken; cook for about 10 minutes, turning once, until the meat and bones have browned.

    Step 2
    Add onion, garlic, tomato paste, red wine, cumin, coriander, paprika, and turmeric. Stir well; cook for about 5 minutes to deepen the tomato flavor.

    Step 3
    Add chicken broth, red lentils, carrots, parsley, and salt. Stir well, cover, and simmer on low for 2 hours. Discard bones. Taste; add more salt, if necessary.
    """
    )

    db.session.add(red_lentil_flanken_soup_recipe)
    db.session.commit()

    red_lentil_flanken_soup_recipe_id = red_lentil_flanken_soup_recipe.id

    red_lentil_flanken_soup_ingredients = [
        {"name": "Oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Beef marrow bones", "quantity": 2-3, "unit": "", "note": ""},
        {"name": "Bone-in flanken, cut into large pieces", "quantity": 1.5-2, "unit": "lb", "note": ""},
        {"name": "Onion, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Garlic cloves, minced", "quantity": 5-6, "unit": "", "note": ""},
        {"name": "Tomato paste", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Red wine", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Chicken broth", "quantity": 64, "unit": "oz", "note": ""},
        {"name": "Red lentils, rinsed", "quantity": 1.5, "unit": "cups", "note": ""},
        {"name": "Carrots, peeled and cut into rounds", "quantity": 4, "unit": "", "note": ""},
        {"name": "Fresh parsley, chopped", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Cumin", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Coriander", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Paprika", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Turmeric", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 1, "unit": "Tbsp", "note": ""}
    ]

    for ing in red_lentil_flanken_soup_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=red_lentil_flanken_soup_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)
        
    # Recipe 24: Fall Chopped Salad with Maple Tahini Dressing
    fall_chopped_salad_with_maple_tahini_dressing_recipe = Recipe(
        name="Fall Chopped Salad with Maple Tahini Dressing",
        picture="/recipes/fall_chopped_salad_with_maple_tahini_dressing.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="108",
        instructions="""
    Step 1
    Prepare the roasted butternut squash: Preheat oven to 400°F. Line a baking sheet with parchment paper. Arrange cubed butternut squash in a single layer on prepared baking sheet. Drizzle with olive oil; season with salt to taste. Roast for 45 minutes, until tender and slightly crispy (see note).

    Step 2
    Prepare the panko crumb topping: In a small frying pan, over medium heat, heat oil. Add panko crumbs; sauté until golden, about 2 minutes.

    Step 3
    Prepare the maple tahini dressing: In a glass jar, combine all dressing ingredients; whisk or shake until emulsified. Taste; adjust seasonings, if necessary.

    Step 4
    To assemble: Place a bed of kale onto a large platter or into a large bowl. Top with apple, butternut squash, red onion, and feta cheese. Top with panko crumb topping. Drizzle with dressing before serving (see note).
    """
    )

    db.session.add(fall_chopped_salad_with_maple_tahini_dressing_recipe)
    db.session.commit()

    fall_chopped_salad_with_maple_tahini_dressing_recipe_id = fall_chopped_salad_with_maple_tahini_dressing_recipe.id

    fall_chopped_salad_with_maple_tahini_dressing_ingredients = [
        {"name": "Kale, washed and chopped", "quantity": 3, "unit": "cups", "note": ""},
        {"name": "Pink Lady apple, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Red onion, thinly sliced", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Feta cheese, crumbled", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Frozen butternut squash, cubed", "quantity": 1, "unit": "24-oz bag", "note": ""},
        {"name": "Olive oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Panko crumbs", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Extra-virgin olive oil", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Maple syrup", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Maple tahini paste", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Dijon mustard", "quantity": 2, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 1.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.5, "unit": "tsp", "note": ""}
    ]

    for ing in fall_chopped_salad_with_maple_tahini_dressing_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=fall_chopped_salad_with_maple_tahini_dressing_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 25: Rainbow Salad
    rainbow_salad_recipe = Recipe(
        name="Rainbow Salad",
        picture="/recipes/rainbow_salad.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="110",
        instructions="""
    Step 1
    Prepare the creamy lemon dressing: In a glass jar, combine all dressing ingredients; whisk or shake until well combined. Taste; adjust seasonings, if necessary.

    Step 2
    To assemble: Place a bed of romaine into a large bowl. Top with red cabbage, mini peppers, cherry tomatoes, cucumbers, corn, and feta.

    Step 3
    Drizzle with dressing; toss to coat salad before serving.
    """
    )

    db.session.add(rainbow_salad_recipe)
    db.session.commit()

    rainbow_salad_recipe_id = rainbow_salad_recipe.id

    rainbow_salad_ingredients = [
        {"name": "Hearts of romaine, chopped", "quantity": 2, "unit": "", "note": ""},
        {"name": "Red cabbage, shredded", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Mini peppers, cut into rounds", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Cherry tomatoes, halved", "quantity": 2, "unit": "cups", "note": ""},
        {"name": "Persian cucumbers, cut into rounds", "quantity": 3, "unit": "", "note": ""},
        {"name": "Corn, drained", "quantity": 1, "unit": "15-oz can", "note": "whole kernel"},
        {"name": "Feta cheese, crumbled", "quantity": 0.75, "unit": "cup", "note": ""},
        {"name": "Mayonnaise", "quantity": 0.33, "unit": "cup", "note": ""},
        {"name": "Lemon juice", "quantity": 2, "unit": "Tbsp", "note": ""},
        {"name": "Dijon mustard", "quantity": 0.5, "unit": "Tbsp", "note": ""},
        {"name": "Grated parmesan cheese", "quantity": 1.5, "unit": "tsp", "note": ""},
        {"name": "Frozen garlic cube", "quantity": 1, "unit": "", "note": ""},
        {"name": "Extra-virgin olive oil", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Garlic powder", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.25, "unit": "tsp", "note": ""}
    ]

    for ing in rainbow_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=rainbow_salad_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 26: Mushroom Avocado Salad
    mushroom_avocado_salad_recipe = Recipe(
        name="Mushroom Avocado Salad",
        picture="/recipes/mushroom_avocado_salad.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="116",
        instructions="""
    Step 1
    Prepare the sautéed mushrooms: Heat oil in a frying pan over medium heat. Add mushrooms; sauté until soft, about 5 minutes. Season with salt. Stir; set aside.

    Step 2
    Prepare the maple balsamic vinaigrette: In a glass jar, combine all vinaigrette ingredients; whisk or shake until emulsified. Taste; adjust seasonings, if necessary.

    Step 3
    To assemble: Add a bed of romaine to a platter or bowl, top with sautéed mushrooms, cherry tomatoes, avocado, and almonds. Drizzle with maple balsamic vinaigrette right before serving.
    """
    )

    db.session.add(mushroom_avocado_salad_recipe)
    db.session.commit()

    mushroom_avocado_salad_recipe_id = mushroom_avocado_salad_recipe.id

    mushroom_avocado_salad_ingredients = [
        {"name": "Hearts of romaine, chopped", "quantity": 2, "unit": "", "note": ""},
        {"name": "Cherry tomatoes, halved", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Avocado, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Candied almonds", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Baby bella mushrooms, sliced", "quantity": 8, "unit": "oz", "note": ""},
        {"name": "Olive oil", "quantity": 3, "unit": "Tbsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Balsamic vinegar", "quantity": 0.25, "unit": "cup", "note": "maple"},
        {"name": "Avocado oil", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Maple syrup", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Frozen garlic cube", "quantity": 1, "unit": "", "note": ""},
        {"name": "Dijon mustard", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.125, "unit": "tsp", "note": ""}
    ]

    for ing in mushroom_avocado_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=mushroom_avocado_salad_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 27: Crispy Goat Cheese Portobello Mushroom Salad
    crispy_goat_cheese_portobello_mushroom_salad_recipe = Recipe(
        name="Crispy Goat Cheese Portobello Mushroom Salad",
        picture="/recipes/crispy_goat_cheese_portobello_mushroom_salad.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="112",
        instructions="""
    Step 1
    Preheat oven to 400°F. Line a rimmed baking sheet with parchment paper.

    Step 2
    Arrange cubed sweet potato and sliced mushrooms in a single layer on prepared baking sheet. Spray or drizzle with olive oil; season with salt and pepper. Roast for 25-38 minutes.

    Step 3
    Prepare the panfried goat cheese: Place flour onto a plate. In a small bowl, whisk together egg and water. Place panko crumbs onto a second plate. Dredge each goat cheese cube in flour, dip into egg mixture, and coat in panko crumbs.

    Step 4
    Heat oil in a small frying pan over medium heat. Panfry until brown on both sides, about 1 minute per side, taking care not to burn them.

    Step 5
    Prepare the maple balsamic vinaigrette: In a glass jar, combine all dressing ingredients; whisk or shake until emulsified. Taste; adjust seasonings, if necessary.

    Step 6
    To assemble: Place a bed of arugula onto a large platter or into a large bowl. Top with quinoa, sweet potato cubes, portobello mushrooms, and beets.

    Step 7
    Immediately before serving, drizzle with vinaigrette; top with fried goat cheese.
    """
    )

    db.session.add(crispy_goat_cheese_portobello_mushroom_salad_recipe)
    db.session.commit()

    crispy_goat_cheese_portobello_mushroom_salad_recipe_id = crispy_goat_cheese_portobello_mushroom_salad_recipe.id

    crispy_goat_cheese_portobello_mushroom_salad_ingredients = [
        {"name": "Arugula", "quantity": 7, "unit": "oz", "note": "or greens of choice"},
        {"name": "Cooked quinoa", "quantity": 1, "unit": "cup", "note": ""},
        {"name": "Sweet potato, peeled and cubed", "quantity": 1, "unit": "large", "note": ""},
        {"name": "Portobello mushrooms, cleaned and sliced", "quantity": 16, "unit": "oz", "note": ""},
        {"name": "Olive oil", "quantity": 3, "unit": "Tbsp", "note": "or oil spray"},
        {"name": "Sea salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Diced beets", "quantity": 1, "unit": "15-oz can", "note": "sliced"},
        {"name": "Goat cheese, cut into cubes", "quantity": 1, "unit": "8-oz log", "note": "1/2-inch slices"},
        {"name": "Flour", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Egg", "quantity": 1, "unit": "", "note": ""},
        {"name": "Water", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Panko crumbs", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Oil", "quantity": 0, "unit": "", "note": "for frying"},
        {"name": "Balsamic vinegar", "quantity": 0.25, "unit": "cup", "note": "maple"},
        {"name": "Avocado oil", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Maple syrup", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Frozen garlic cube", "quantity": 1, "unit": "", "note": ""},
        {"name": "Dijon mustard", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.25, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.125, "unit": "tsp", "note": ""}
    ]

    for ing in crispy_goat_cheese_portobello_mushroom_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=crispy_goat_cheese_portobello_mushroom_salad_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

    # Recipe 28: Mami’s Favorite Quinoa Salad
    mamis_favorite_quinoa_salad_recipe = Recipe(
        name="Mami’s Favorite Quinoa Salad",
        picture="/recipes/mamis_favorite_quinoa_salad.jpeg",
        source_category_id=2,
        source="Marblespoon at Home",
        reference="118",
        instructions="""
    Step 1
    Prepare the quinoa: In a medium saucepan, place quinoa, water, oil, and salt. Stir; bring to a gentle boil over medium heat. Reduce heat to low, cover, and simmer for 20 minutes. Fluff with a fork; allow to come to room temperature.

    Step 2
    Prepare the maple-Dijon dressing: In a glass jar, combine all dressing ingredients; whisk or shake until emulsified. Taste; adjust seasonings, if necessary.

    Step 3
    To assemble: Place quinoa, peppers, red onion, dried cranberries, and almonds into a large bowl. Add dressing to your liking. Add avocado; toss gently, and serve.
    """
    )

    db.session.add(mamis_favorite_quinoa_salad_recipe)
    db.session.commit()

    mamis_favorite_quinoa_salad_recipe_id = mamis_favorite_quinoa_salad_recipe.id

    mamis_favorite_quinoa_salad_ingredients = [
        {"name": "Red bell pepper, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Orange bell pepper, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Yellow bell pepper, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Red onion, finely diced", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Dried cranberries", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Toasted sliced almonds", "quantity": 0.5, "unit": "cup", "note": ""},
        {"name": "Avocado, diced", "quantity": 1, "unit": "", "note": ""},
        {"name": "Quinoa", "quantity": 0.5, "unit": "cups", "note": ""},
        {"name": "Water", "quantity": 3, "unit": "cups", "note": ""},
        {"name": "Olive oil", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Sea salt", "quantity": 0.5, "unit": "tsp", "note": ""},
        {"name": "Extra-virgin olive oil", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Red wine vinegar", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Maple syrup or honey", "quantity": 0.25, "unit": "cup", "note": ""},
        {"name": "Dijon mustard", "quantity": 1, "unit": "Tbsp", "note": ""},
        {"name": "Sea salt", "quantity": 1, "unit": "tsp", "note": ""},
        {"name": "Black pepper", "quantity": 0.125, "unit": "tsp", "note": ""}
    ]

    for ing in mamis_favorite_quinoa_salad_ingredients:
        ingredient_entry = Recipe_Ingredient(
            recipe_id=mamis_favorite_quinoa_salad_recipe_id,
            ingredient_name=ing["name"],
            ingredient_quantity=ing["quantity"],
            ingredient_unit=ing["unit"],
            ingredient_note=ing["note"]
        )
        db.session.add(ingredient_entry)

print("seed complete")
