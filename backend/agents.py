import os
import json
import requests

def call_openai_json(system_prompt, max_tokens=2000):
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": max_tokens
    }
    res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    if not res.ok:
        raise Exception(f"OpenAI API Error: {res.text}")
    
    content = res.json()["choices"][0]["message"]["content"].strip()
    if content.startswith("```json"):
        content = content[7:]
        if content.endswith("```"):
            content = content[:-3]
    return json.loads(content)

def call_openai_text(system_prompt, max_tokens=2000):
    headers = {
        "Authorization": f"Bearer {os.getenv('OPENAI_API_KEY')}",
        "Content-Type": "application/json"
    }
    payload = {
        "model": "gpt-4o-mini",
        "messages": [
            {"role": "system", "content": system_prompt}
        ],
        "temperature": 0.7,
        "max_tokens": max_tokens
    }
    res = requests.post("https://api.openai.com/v1/chat/completions", headers=headers, json=payload)
    if not res.ok:
        raise Exception(f"OpenAI API Error: {res.text}")
    return res.json()["choices"][0]["message"]["content"].strip()

def agent_parse_requirements(num_days, target_weekday, target_meal, preferences, pantry_items):
    schedule_instruction = f"The user wants you to craft a meal plan over a {num_days}-day period."
    if target_weekday:
        meal_str = f"a {target_meal}" if target_meal else "a meal"
        schedule_instruction = f"The user urgently wants you to plan EXACTLY 1 {meal_str} for EXACTLY {target_weekday}."

    prompt = f"""
You are the Requirements Parser Agent. Your job is purely structural.
Listen to the user's constraints and determine EXACTLY which days and meals to schedule.
{schedule_instruction}

User Preferences: {preferences or 'None'}
User Pantry: {pantry_items or 'None'}

Return ONLY a JSON object evaluating the requests. Do NOT pick recipes.
Format:
{{
    "requirements": [
        {{ "weekday": "Monday", "meal": "Dinner", "protein_hint": "chicken", "dietary_requests": "low carb" }}
    ]
}}
"""
    return call_openai_json(prompt).get("requirements", [])

def agent_match_recipes(requirements, recipe_data, pantry_items):
    prompt = f"""
You are the Recipe Matcher Agent.
You have been given a structural meal schedule created by the parsing agent:
{json.dumps(requirements)}

You must pick recipes from our database that perfectly fulfill each requirement.
CRITICAL BALANCING RULE: Every meal MUST be perfectly balanced. It must contain at least 1 main source of protein, AND at least 1 vegetable. If a recipe lacks veggies, add a veggie side recipe. If it has multiple proteins, pick a different recipe.
Don't overextend their pantry: {pantry_items}

Our Database of Recipes (ID, Name, Ingredients, Tags):
{json.dumps(recipe_data)}

Return ONLY a JSON object mapping the requirements to specific Recipe IDs:
{{
    "matched_meals": [
        {{
            "weekday": "Monday",
            "meal": "Dinner",
            "recipe_ids": [10, 24]
        }}
    ]
}}
"""
    return call_openai_json(prompt).get("matched_meals", [])

def agent_format_summary(requirements, matched_meals, recipe_data_map, preferences):
    enriched_meals = []
    for m in matched_meals:
        names = [recipe_data_map.get(str(rid), f"Recipe {rid}") for rid in m.get("recipe_ids", [])]
        enriched_meals.append({
            "weekday": m.get("weekday"),
            "meal": m.get("meal"),
            "recipe_names": names
        })

    prompt = f"""
You are the Presentation Agent.
The parsing agent established these requirements based on user preferences '{preferences}': {json.dumps(requirements)}
The matching agent selected these exact recipes to fulfill them: {json.dumps(enriched_meals)}

Write an engaging, user-friendly summary of the meal plan.
First, provide an "overall_summary" (2-3 sentences).
Second, for each meal, provide a "specific_justification" explaining why these specific recipes were chosen (e.g. how they balance protein and vegetables).
Use the explicit Recipe Names in your text!

Return ONLY a JSON object:
{{
    "overall_summary": "...",
    "specific_justifications": [
        {{ "weekday": "Monday", "meal": "Dinner", "text": "..." }}
    ]
}}
"""
    res = call_openai_json(prompt)
    
    full_justification = res.get("overall_summary", "") + "\n\nSpecific Meals:\n"
    for just in res.get("specific_justifications", []):
        full_justification += f"- {just.get('weekday')} {just.get('meal')}: {just.get('text', '')}\n"
    
    return full_justification

def agent_aggregate_groceries(ingredients_list):
    prompt = f"""
You are the Grocery Aggregator Agent.
Here is a raw list of ingredients from the matched recipes:
{json.dumps(ingredients_list)}

Your job is to cleanly organize them into a shopping list. Combine duplicates, standardize units, and group them logically.
Return ONLY a JSON object:
{{
    "shopping_list": [
        {{ "name": "Chicken Breast", "quantity": "2 lbs", "category": "Meat" }},
        {{ "name": "Olive Oil", "quantity": "3 Tbsp", "category": "Pantry" }}
    ]
}}
"""
    return call_openai_json(prompt).get("shopping_list", [])

def agent_auto_cart(shopping_list, currently_owned_items):
    prompt = f"""
You are the Auto-Cart Agent.
The user's aggregated shopping list is:
{json.dumps(shopping_list)}

The user has explicitly stated they already own these items:
{json.dumps(currently_owned_items)}

Filter out the owned items, and return ONLY a plain JSON array of the remaining items that need to be purchased, formatted as raw strings exactly as they would be searched on Amazon Fresh.
Return ONLY a JSON object:
{{
    "items_to_buy": [ "2 lbs Chicken Breast", "1 bunch scallions" ]
}}
"""
    return call_openai_json(prompt).get("items_to_buy", [])
