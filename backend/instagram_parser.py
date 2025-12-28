import yt_dlp
import json
import re
import logging

# Set up logger
logger = logging.getLogger(__name__)
logger.setLevel(logging.DEBUG)

# Create console handler if it doesn't exist
if not logger.handlers:
    handler = logging.StreamHandler()
    handler.setLevel(logging.DEBUG)
    formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
    handler.setFormatter(formatter)
    logger.addHandler(handler)

def extract_instagram_caption(instagram_url):
    """
    Extract caption/description from Instagram video using yt-dlp metadata.
    Returns the caption text without downloading the video.
    """
    logger.info(f"Starting caption extraction for URL: {instagram_url}")
    
    ydl_opts = {
        'quiet': True,
        'no_warnings': True,
        'extract_flat': False,
        'skip_download': True,  # Don't download, just get metadata
    }
    
    try:
        logger.debug("Extracting metadata with yt-dlp...")
        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(instagram_url, download=False)
            
            logger.debug(f"Metadata extracted. Available keys: {list(info.keys())[:20]}...")  # Log first 20 keys
            
            # Log what fields we're checking
            description = info.get('description')
            fulltitle = info.get('fulltitle')
            title = info.get('title')
            alt_title = info.get('alt_title')
            
            logger.debug(f"Field values - description: {description[:100] if description else None}...")
            logger.debug(f"Field values - fulltitle: {fulltitle}")
            logger.debug(f"Field values - title: {title}")
            logger.debug(f"Field values - alt_title: {alt_title}")
            
            # Try to get description/caption from various fields
            # Instagram often stores the caption in 'description' field
            caption = (
                description or 
                fulltitle or 
                title or
                alt_title or
                ''
            )
            
            # Clean up the caption - remove extra whitespace
            if caption:
                caption = caption.strip()
                logger.info(f"Caption extracted successfully. Length: {len(caption)} characters")
                logger.debug(f"Caption preview (first 200 chars): {caption[:200]}...")
            else:
                logger.warning("No caption found in any metadata fields")
                # Log all available string fields for debugging
                logger.debug("All string fields in metadata:")
                for key, value in info.items():
                    if isinstance(value, str) and len(value) > 0:
                        logger.debug(f"  {key}: {value[:100]}...")
            
            return caption
    except yt_dlp.utils.DownloadError as e:
        logger.error(f"yt-dlp DownloadError: {str(e)}")
        raise Exception(f"Failed to access Instagram video. The video may be private or the URL may be invalid: {str(e)}")
    except Exception as e:
        logger.error(f"Unexpected error extracting caption: {str(e)}", exc_info=True)
        raise Exception(f"Failed to extract Instagram caption: {str(e)}")

def parse_recipe_from_caption(caption):
    """
    Parse recipe information from Instagram caption using pattern matching.
    Returns a dictionary with recipe information.
    """
    logger.info(f"Starting recipe parsing from caption (length: {len(caption)} chars)")
    
    if not caption or not caption.strip():
        logger.error("Caption is empty or None")
        raise Exception("No caption found in Instagram video")
    
    # Initialize recipe data
    recipe_data = {
        "name": "",
        "instructions": "",
        "ingredients": []
    }
    
    # Try to extract recipe name (often at the start, before ingredients)
    lines = caption.split('\n')
    non_empty_lines = [line.strip() for line in lines if line.strip()]
    
    logger.debug(f"Caption split into {len(lines)} lines, {len(non_empty_lines)} non-empty lines")
    
    if non_empty_lines:
        # First non-empty line is often the recipe name
        recipe_data["name"] = non_empty_lines[0]
        logger.debug(f"Initial recipe name from first line: {recipe_data['name']}")
    
    # Look for ingredients section (common patterns)
    ingredients_text = ""
    instructions_text = ""
    
    # Common patterns for ingredients
    ingredient_keywords = ['ingredients', 'ingredient', 'you\'ll need', 'what you need', 'for the']
    instruction_keywords = ['instructions', 'directions', 'method', 'how to', 'steps', 'recipe']
    
    # Find where ingredients section starts
    ingredients_start = -1
    instructions_start = -1
    
    caption_lower = caption.lower()
    
    for i, line in enumerate(lines):
        line_lower = line.lower().strip()
        if any(keyword in line_lower for keyword in ingredient_keywords):
            ingredients_start = i
        if any(keyword in line_lower for keyword in instruction_keywords):
            instructions_start = i
            break
    
    # Extract ingredients
    if ingredients_start >= 0:
        end_idx = instructions_start if instructions_start > ingredients_start else len(lines)
        ingredients_lines = lines[ingredients_start + 1:end_idx]
        ingredients_text = '\n'.join(ingredients_lines)
    else:
        # If no explicit ingredients section, try to find bullet points or numbered lists
        # Look for lines that look like ingredients (short, often with quantities)
        for line in lines:
            line_stripped = line.strip()
            if line_stripped and (line_stripped.startswith('-') or 
                                 line_stripped.startswith('•') or 
                                 line_stripped.startswith('*') or
                                 re.match(r'^\d+[\.\)]', line_stripped)):
                if not any(keyword in line_stripped.lower() for keyword in instruction_keywords):
                    ingredients_text += line_stripped + '\n'
    
    # Extract instructions
    if instructions_start >= 0:
        instructions_lines = lines[instructions_start + 1:]
        instructions_text = '\n'.join(instructions_lines)
    else:
        # If no explicit instructions section, use everything after ingredients
        if ingredients_start >= 0:
            instructions_text = '\n'.join(lines[ingredients_start + 1:])
        else:
            # Use all text as instructions if we can't find sections
            instructions_text = caption
    
    # Parse ingredients into structured format
    ingredient_lines = [line.strip() for line in ingredients_text.split('\n') if line.strip()]
    
    for ingredient_line in ingredient_lines:
        # Remove bullet points and numbering
        ingredient_line = re.sub(r'^[-•*\d+\.\)]\s*', '', ingredient_line)
        
        if not ingredient_line:
            continue
        
        # Try to extract quantity, unit, and name using regex
        # Handle fractions like "1/2", "1 1/2", "3/4"
        fraction_match = re.search(r'(\d+)\s+(\d+)/(\d+)', ingredient_line)
        decimal_match = re.search(r'(\d+\.?\d*)', ingredient_line)
        
        quantity = None
        if fraction_match:
            whole = int(fraction_match.group(1))
            num = int(fraction_match.group(2))
            den = int(fraction_match.group(3))
            quantity = whole + (num / den)
        elif decimal_match:
            quantity = float(decimal_match.group(1))
        
        # Common cooking units
        unit_pattern = r'(cup|cups|tbsp|tablespoon|tablespoons|tsp|teaspoon|teaspoons|ounce|ounces|oz|lb|lbs|pound|pounds|gram|grams|g|kg|kilogram|kilograms|ml|milliliter|milliliters|l|liter|liters|pint|pints|quart|quarts|gallon|gallons|piece|pieces|clove|cloves|can|cans|package|packages|bunch|bunches|head|heads|stalk|stalks|slice|slices|dash|pinch|handful|handfuls)'
        unit_match = re.search(unit_pattern, ingredient_line, re.IGNORECASE)
        unit = unit_match.group(1).lower() if unit_match else None
        
        # Normalize unit abbreviations to match form's Select options
        # Form expects: 'Tsp', 'Tbsp', 'Cup', 'Oz', 'Lb', 'Dash', 'Pinch'
        if unit:
            unit_map = {
                'tbsp': 'Tbsp', 'tablespoon': 'Tbsp', 'tablespoons': 'Tbsp',
                'tsp': 'Tsp', 'teaspoon': 'Tsp', 'teaspoons': 'Tsp',
                'cup': 'Cup', 'cups': 'Cup',
                'oz': 'Oz', 'ounce': 'Oz', 'ounces': 'Oz',
                'lb': 'Lb', 'lbs': 'Lb', 'pound': 'Lb', 'pounds': 'Lb',
                'dash': 'Dash',
                'pinch': 'Pinch',
                # Keep other units as-is (lowercase) if not in form options
                'g': 'g', 'gram': 'g', 'grams': 'g',
                'kg': 'kg', 'kilogram': 'kg', 'kilograms': 'kg',
                'ml': 'ml', 'milliliter': 'ml', 'milliliters': 'ml',
                'l': 'l', 'liter': 'l', 'liters': 'l',
            }
            unit = unit_map.get(unit, unit)
        
        # Extract ingredient name (everything after quantity and unit)
        if fraction_match:
            start_idx = fraction_match.end()
            if unit_match and unit_match.start() > fraction_match.end():
                start_idx = unit_match.end()
            ingredient_name = ingredient_line[start_idx:].strip()
        elif decimal_match:
            start_idx = decimal_match.end()
            if unit_match and unit_match.start() > decimal_match.end():
                start_idx = unit_match.end()
            ingredient_name = ingredient_line[start_idx:].strip()
        else:
            # No quantity found, check if there's a unit at the start
            if unit_match and unit_match.start() == 0:
                ingredient_name = ingredient_line[unit_match.end():].strip()
            else:
                ingredient_name = ingredient_line.strip()
        
        # Clean up ingredient name
        ingredient_name = re.sub(r'^of\s+', '', ingredient_name, flags=re.IGNORECASE)
        ingredient_name = ingredient_name.strip()
        
        # Skip if ingredient name is empty
        if not ingredient_name or not ingredient_name.strip():
            continue
        
        # Ensure quantity is 0 if None (not null), and unit is '' if None (not null)
        final_quantity = quantity if quantity is not None else 0
        final_unit = unit if unit is not None else ''
        
        recipe_data["ingredients"].append({
            "ingredient_name": ingredient_name.strip(),
            "ingredient_quantity": final_quantity,
            "ingredient_unit": final_unit,
            "ingredient_note": None
        })
    
    # Clean up instructions
    recipe_data["instructions"] = instructions_text.strip()
    
    # Log warning if no ingredients were found
    if len(recipe_data["ingredients"]) == 0:
        logger.warning("No ingredients were parsed from the caption. Ingredients text was empty or couldn't be parsed.")
        logger.debug(f"Ingredients text that was attempted: {ingredients_text[:200]}...")
    
    # If we didn't find a name, try to extract from first line or title
    if not recipe_data["name"] and non_empty_lines:
        logger.debug("Recipe name not found, trying to extract from first lines...")
        # Use first line but skip if it looks like an ingredient or instruction header
        first_line = non_empty_lines[0]
        if not any(keyword in first_line.lower() for keyword in ingredient_keywords + instruction_keywords):
            recipe_data["name"] = first_line[:100]  # Limit length
            logger.debug(f"Using first line as name: {recipe_data['name']}")
        elif len(non_empty_lines) > 1:
            recipe_data["name"] = non_empty_lines[1][:100]
            logger.debug(f"Using second line as name: {recipe_data['name']}")
    
    # If still no name, use a default
    if not recipe_data["name"]:
        recipe_data["name"] = "Recipe from Instagram"
        logger.debug("Using default recipe name")
    
    logger.info(f"Recipe parsing complete - Name: {recipe_data['name']}, Ingredients: {len(recipe_data['ingredients'])}, Instructions length: {len(recipe_data['instructions'])}")
    logger.debug(f"Final recipe data: {json.dumps(recipe_data, indent=2)}")
    
    return recipe_data

def parse_instagram_recipe(instagram_url):
    """
    Main function to parse an Instagram video and extract recipe information.
    Uses the video caption/description instead of transcribing audio.
    Returns a dictionary with recipe data.
    """
    logger.info(f"=== Starting Instagram recipe parsing for: {instagram_url} ===")
    
    try:
        # Step 1: Extract caption from Instagram video metadata
        logger.info("Step 1: Extracting caption from Instagram video...")
        caption = extract_instagram_caption(instagram_url)
        
        if not caption:
            logger.error("No caption extracted from video")
            raise Exception("No caption found in Instagram video. The video may not have a description.")
        
        # Step 2: Parse the caption into recipe data
        logger.info("Step 2: Parsing caption into recipe data...")
        recipe_data = parse_recipe_from_caption(caption)
        
        logger.info(f"=== Successfully parsed recipe: {recipe_data['name']} ===")
        return recipe_data
    except Exception as e:
        logger.error(f"=== Error parsing Instagram recipe: {str(e)} ===", exc_info=True)
        raise Exception(f"Failed to parse Instagram recipe: {str(e)}")
