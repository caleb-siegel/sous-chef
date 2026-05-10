import os
import json
import logging
from openai import OpenAI
from dotenv import load_dotenv

# Set up logger
logger = logging.getLogger(__name__)

load_dotenv()
client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))

def parse_recipe_image(image_base64):
    """
    Parse a recipe image (ingredients and instructions) using OpenAI GPT-4o Vision.
    Returns a dictionary with name, instructions, and ingredients.
    """
    logger.info("Starting recipe image parsing with OpenAI Vision...")
    
    try:
        # Prompt for the AI
        prompt = """
        Extract the recipe information from this image. 
        Return the result in JSON format with the following structure:
        {
          "name": "Recipe Name",
          "instructions": "Full step-by-step instructions",
          "reference": "Page number or source info (if visible)",
          "ingredients": [
            {
              "ingredient_name": "Name of ingredient",
              "ingredient_quantity": 1.5, (as a number/float, use 0 if not specified)
              "ingredient_unit": "Tsp", (Choose from: 'Tsp', 'Tbsp', 'Cup', 'Oz', 'Lb', 'Dash', 'Pinch' or empty string)
              "ingredient_note": "any extra info like 'chopped' or 'divided'"
            }
          ]
        }
        
        Important rules:
        1. ingredient_quantity MUST be a number (float or int). If it's a fraction like '1 1/2', convert to 1.5.
        2. ingredient_unit MUST be one of the specified values or an empty string if it doesn't fit.
        3. Try to capture the recipe name if it's in the image.
        4. If you see a page number (often in the corner or bottom), put it in the 'reference' field.
        5. Return ONLY the JSON object.
        """

        response = client.chat.completions.create(
            model="gpt-4o",
            messages=[
                {
                    "role": "user",
                    "content": [
                        {"type": "text", "text": str(prompt)},
                        {
                            "type": "image_url",
                            "image_url": {
                                "url": f"data:image/jpeg;base64,{str(image_base64)}"
                            },
                        },
                    ],
                }
            ]
        )
        
        result_text = response.choices[0].message.content
        logger.debug(f"AI response: {result_text}")
        
        # Manually extract JSON if it's wrapped in triple backticks
        if "```json" in result_text:
            result_text = result_text.split("```json")[1].split("```")[0].strip()
        elif "```" in result_text:
            result_text = result_text.split("```")[1].strip()
            
        recipe_data = json.loads(result_text)
        
        # Basic validation/cleanup
        if "name" not in recipe_data:
            recipe_data["name"] = "Parsed Recipe"
        if "instructions" not in recipe_data:
            recipe_data["instructions"] = ""
        if "ingredients" not in recipe_data:
            recipe_data["ingredients"] = []
            
        logger.info(f"Successfully parsed recipe: {recipe_data.get('name')}")
        return recipe_data

    except Exception as e:
        logger.error(f"Error parsing recipe image: {str(e)}", exc_info=True)
        raise Exception(f"Failed to parse recipe image: {str(e)}")
