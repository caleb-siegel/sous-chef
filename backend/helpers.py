from flask import Flask, make_response, jsonify, request, session, g
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy import or_, and_
from sqlalchemy.orm import selectinload
from flask_migrate import Migrate
from flask_cors import CORS
from models import db, User, User_Tag, User_Recipe, User_Recipe_Tag, Meal_Prep, Recipe, Recipe_Ingredient, Tag, Recipe_Tag, Source_Category
from dotenv import dotenv_values
from flask_bcrypt import Bcrypt
import json
import random

def get_eager_recipe_query(base_query=None):
    if base_query is None:
        base_query = Recipe.query
    return base_query.options(
        selectinload(Recipe.meal_preps),
        selectinload(Recipe.recipe_tags).selectinload(Recipe_Tag.tag),
        selectinload(Recipe.user_recipe_tags).selectinload(User_Recipe_Tag.user_tag),
        selectinload(Recipe.recipe_ingredients),
        selectinload(Recipe.user_recipes)
    )

def get_recipe_dict(recipe_list):
    recipes = []
    for recipe in recipe_list:
        # make meal prep list
        meal_preps = []
        for meal_prep in recipe.meal_preps:
            prep = {
                "id": meal_prep.id,
                "meal": meal_prep.meal,
                "recipe_id": meal_prep.recipe_id,
                "user_id": meal_prep.user_id,
                "weekday": meal_prep.weekday,
            }
            meal_preps.append(prep)

        # make recipe_tag list
        recipe_tags = []
        for tag in recipe.recipe_tags:
            tag_dict = {
                "id": tag.tag.id if tag.tag else tag.tag_id,
                "name": tag.tag.name if tag.tag else ""
            }

            recipe_tag = {
                "id": tag.id,
                "recipe_id": tag.recipe_id,
                "tag_id": tag.tag_id,
                "tag": tag_dict,
            }
            recipe_tags.append(recipe_tag)

        # make user recipe tag list
        user_recipe_tags = []
        for tag in recipe.user_recipe_tags:
            user_tag_dict = {
                "id": tag.user_tag.id if tag.user_tag else tag.user_tag_id,
                "name": tag.user_tag.name if tag.user_tag else ""
            }

            user_recipe_tag = {
                "id": tag.id,
                "user_id": tag.user_id,
                "recipe_id": tag.recipe_id,
                "user_tag_id": tag.user_tag_id,
                "user_tag": user_tag_dict,
            }
            user_recipe_tags.append(user_recipe_tag)

        # make user recipes list
        user_recipes = []
        for ur in recipe.user_recipes:
            user_recipes.append({
                "id": ur.id,
                "user_id": ur.user_id,
                "recipe_id": ur.recipe_id,
                "not_reorder": ur.not_reorder,
                "comments": ur.comments,
            })
        
        # make ingredients
        ingredients = [ingredient.ingredient_name for ingredient in recipe.recipe_ingredients]
        
        recipe_dict = {
            "id": recipe.id,
            "name": recipe.name,
            "picture": recipe.picture,
            "meal_preps": meal_preps,
            "recipe_tags": recipe_tags,
            "user_recipe_tags": user_recipe_tags,
            "user_recipes": user_recipes,
            "source": recipe.source,
            "recipe_ingredients": ingredients,
            "created_at": recipe.created_at.isoformat() if recipe.created_at else None,
            "updated_at": recipe.updated_at.isoformat() if recipe.updated_at else None,
        }
        recipes.append(recipe_dict)
    return recipes