"""Ingredient parsing and supermarket category determination utilities.

This module is completely self-contained and has NO database or Flask dependencies,
preventing circular imports between app.py and migration/population scripts.
"""

import re

# Supermarket Categories & Display Order
DEFAULT_CATEGORIES = [
    ('Produce', 1),
    ('Meat & Poultry', 2),
    ('Seafood', 3),
    ('Dairy & Eggs', 4),
    ('Bakery & Bread', 5),
    ('Deli & Prepared', 6),
    ('Pantry & Dry Goods', 7),
    ('Canned & Jarred Goods', 8),
    ('Spices & Seasonings', 9),
    ('Oils, Vinegars & Condiments', 10),
    ('Baking Needs', 11),
    ('Frozen Foods', 12),
    ('Beverages', 13),
    ('Household & Other', 14),
]

# Preparation keywords to extract
PREPARATION_KEYWORDS = [
    'freshly ground', 'freshly squeezed', 'fresh-squeezed', 'freshly grated',
    'finely chopped', 'finely diced', 'finely minced', 'coarsely chopped',
    'coarsely ground', 'thinly sliced', 'roughly chopped', 'rough chopped',
    'chopped', 'diced', 'minced', 'sliced', 'crushed', 'grated', 'peeled',
    'melted', 'shredded', 'halved', 'quartered', 'toasted', 'cooked',
    'warmed', 'warm', 'chilled', 'cold', 'softened', 'crumbled', 'shaved',
    'julienned', 'roasted', 'dry roasted', 'drained', 'rinsed', 'divided',
    'cubed', 'mashed', 'whisked', 'beaten', 'stemmed', 'seeded', 'pitted',
    'zested', 'juiced', 'to taste'
]

def clean_and_parse_ingredient(raw_name):
    """
    Parses a raw ingredient string into:
      - canonical_name: cleaned title-cased ingredient name
      - preparation: extracted preparation methods
      - suggested_unit: unit detected if embedded in name
    """
    if not raw_name or not raw_name.strip():
        return None, None, None

    orig = raw_name.strip()
    name = orig
    prep_parts = []
    suggested_unit = None

    # 1. Extract and remove parenthetical details (e.g. "(chopped)", "(drained and rinsed)")
    parens = re.findall(r'\((.*?)\)', name)
    for p in parens:
        p_clean = p.strip()
        if p_clean:
            prep_parts.append(p_clean)
    name = re.sub(r'\(.*?\)', '', name).strip()

    # 2. Extract and remove comma clauses (e.g. "yellow onion, diced" -> "yellow onion", prep: "diced")
    if ',' in name:
        parts = [p.strip() for p in name.split(',') if p.strip()]
        if parts:
            name = parts[0]
            prep_parts.extend(parts[1:])

    # 3. Strip leading numbers, fractions, bullets, and dashes
    name = re.sub(r'^[\d\s\.\-\*/¼½¾⅓⅔⅛⅜⅝⅞]+', '', name).strip()

    # 4. Strip leading prep words (e.g. "chopped garlic" -> "garlic", prep: "chopped")
    for lp in sorted(PREPARATION_KEYWORDS, key=len, reverse=True):
        pattern = r'^' + re.escape(lp) + r'\s+'
        if re.search(pattern, name, re.IGNORECASE):
            prep_parts.append(lp)
            name = re.sub(pattern, '', name, flags=re.IGNORECASE).strip()
            break

    # 5. Strip trailing prep words (e.g. "garlic minced" -> "garlic", prep: "minced")
    for tp in ['chopped', 'diced', 'minced', 'sliced', 'grated', 'peeled', 'crushed', 'melted', 'shredded', 'halved', 'quartered', 'to taste']:
        pattern = r'\s+' + re.escape(tp) + r'$'
        if re.search(pattern, name, re.IGNORECASE):
            prep_parts.append(tp)
            name = re.sub(pattern, '', name, flags=re.IGNORECASE).strip()
            break

    # 6. Extract common unit prefixes (e.g. "cloves of garlic" -> "garlic", unit: "cloves")
    unit_of_match = re.match(r'^(cloves?|heads?|stalks?|bunch(?:es)?|sprigs?|leaves?|pinche?s?|dashes?)\s+of\s+', name, re.IGNORECASE)
    if unit_of_match:
        suggested_unit = unit_of_match.group(1).lower()
        name = name[unit_of_match.end():].strip()

    # Handle "juice and zest of X", "juice of X", "zest of X"
    citrus_match = re.match(r'^(juice\s+and\s+zest|juice|zest)\s+of\s+(?:\d+[\s\./]*\d*\s*)?(lemon|lime|orange)s?', name, re.IGNORECASE)
    if citrus_match:
        action = citrus_match.group(1).lower()
        fruit = citrus_match.group(2).title()
        if 'juice and zest' in action:
            prep_parts.append('juiced and zested')
        elif 'juice' in action:
            prep_parts.append('juiced')
        elif 'zest' in action:
            prep_parts.append('zested')
        name = fruit
        suggested_unit = 'whole'

    # Strip leading size descriptors like "large red onion" -> "red onion"
    size_match = re.match(r'^(large|medium|small|extra-large|extra large)\s+(.+)', name, re.IGNORECASE)
    if size_match and size_match.group(2).lower() not in ['eggs', 'egg', 'shrimp']:
        prep_parts.append(size_match.group(1).lower())
        name = size_match.group(2).strip()

    # 7. Normalize specific common culinary items
    name_lower = name.lower()

    if re.fullmatch(r'garlic\s+cloves?', name_lower) or re.fullmatch(r'cloves?\s+garlic', name_lower) or name_lower == 'clove garlic':
        name = 'Garlic'
        suggested_unit = 'clove'
    elif name_lower in ['garlic head', 'heads of garlic', 'head of garlic', 'garlic heads']:
        name = 'Garlic'
        suggested_unit = 'head'
    elif name_lower in ['lemons', 'lemon']:
        name = 'Lemon'
    elif name_lower in ['limes', 'lime']:
        name = 'Lime'
    elif name_lower in ['yellow onions', 'yellow onion']:
        name = 'Yellow Onion'
    elif name_lower in ['red onions', 'red onion']:
        name = 'Red Onion'
    elif name_lower in ['white onions', 'white onion']:
        name = 'White Onion'
    elif name_lower in ['onions', 'onion']:
        name = 'Onion'
    elif name_lower in ['scallions', 'scallion', 'green onions', 'green onion']:
        name = 'Scallions'
    elif name_lower in ['shallots', 'shallot']:
        name = 'Shallot'
    elif name_lower in ['carrots', 'carrot']:
        name = 'Carrots'
    elif name_lower in ['potatoes', 'potato', 'russet potatoes', 'russet potato']:
        name = 'Potatoes'
    elif name_lower in ['sweet potatoes', 'sweet potato']:
        name = 'Sweet Potatoes'
    elif name_lower in ['eggs', 'egg']:
        name = 'Eggs'
    elif name_lower in ['avocados', 'avocado']:
        name = 'Avocado'
    elif name_lower in ['fresh lemon juice', 'freshly squeezed lemon juice', 'lemon juice']:
        name = 'Lemon Juice'
    elif name_lower in ['fresh lime juice', 'freshly squeezed lime juice', 'lime juice']:
        name = 'Lime Juice'
    elif name_lower in ['kosher salt']:
        name = 'Kosher Salt'
    elif name_lower in ['sea salt']:
        name = 'Sea Salt'
    elif name_lower in ['black pepper', 'freshly ground black pepper', 'ground black pepper']:
        name = 'Black Pepper'
    elif name_lower in ['extra virgin olive oil', 'extra-virgin olive oil']:
        name = 'Extra Virgin Olive Oil'
    elif name_lower in ['olive oil']:
        name = 'Olive Oil'

    # Clean up whitespace
    name = re.sub(r'\s+', ' ', name).strip()
    if not name:
        name = orig

    # Capitalize nicely
    canonical_name = name.title()

    # Deduplicate prep words while preserving order
    unique_preps = []
    for p in prep_parts:
        p_clean = p.strip()
        if p_clean and p_clean.lower() not in [x.lower() for x in unique_preps]:
            unique_preps.append(p_clean)

    prep_str = '; '.join(unique_preps) if unique_preps else None
    return canonical_name, prep_str, suggested_unit

def determine_category(name):
    """
    Maps an ingredient name to its standard supermarket category.
    """
    n = name.lower()

    # 1. Meat & Poultry
    meat_keywords = [
        'chicken', 'turkey', 'beef', 'steak', 'pork', 'lamb', 'bacon', 'sausage', 'pancetta',
        'prosciutto', 'ham', 'chorizo', 'duck', 'venison', 'meatball', 'ribs', 'flank', 'brisket',
        'sirloin', 'tenderloin', 'ribeye', 'ground meat', 'veal', 'pepperoni', 'salami', 'pastrami',
        'poultry', 'pork chop', 'pork loin', 'short rib'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in meat_keywords):
        return 'Meat & Poultry'

    # 2. Seafood
    seafood_keywords = [
        'salmon', 'tuna', 'shrimp', 'prawn', 'cod', 'tilapia', 'halibut', 'mahi', 'trout',
        'sea bass', 'snapper', 'swordfish', 'crab', 'lobster', 'scallop', 'clam', 'mussel',
        'oyster', 'anchov', 'sardine', 'squid', 'calamari', 'octopus', 'flounder', 'haddock',
        'fish fillet', 'whitefish', 'bass fillet'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in seafood_keywords):
        return 'Seafood'

    # 3. Dairy & Eggs
    dairy_keywords = [
        'cheese', 'parmesan', 'cheddar', 'mozzarella', 'feta', 'ricotta', 'cream cheese',
        'gouda', 'brie', 'swiss cheese', 'gruyere', 'goat cheese', 'provolone', 'mascarpone',
        'pecorino', 'monterey jack', 'colby', 'yogurt', 'greek yogurt', 'sour cream', 'heavy cream',
        'whipping cream', 'half-and-half', 'half and half', 'ghee', 'buttermilk', 'paneer',
        'butter', 'eggs', 'egg', 'egg white', 'egg yolk', 'milk', 'condensed milk', 'evaporated milk'
    ]
    if 'coconut milk' not in n and 'peanut butter' not in n and 'almond butter' not in n and 'apple butter' not in n and 'butternut' not in n:
        if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in dairy_keywords):
            return 'Dairy & Eggs'

    # 4. Bakery & Bread
    bakery_keywords = [
        'bread', 'bagel', 'roll', 'rolls', 'bun', 'buns', 'baguette', 'ciabatta', 'sourdough',
        'pita', 'naan', 'tortilla', 'tortillas', 'flatbread', 'croissant', 'brioche',
        'english muffin', 'taco shell', 'taco shells', 'crouton', 'croutons', 'panko', 'breadcrumbs',
        'bread crumbs', 'pizza dough', 'pie crust'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in bakery_keywords):
        return 'Bakery & Bread'

    # 5. Spices & Seasonings
    spice_keywords = [
        'salt', 'pepper', 'peppercorn', 'paprika', 'powder', 'cumin', 'chili powder', 'cinnamon',
        'nutmeg', 'turmeric', 'coriander', 'cardamom', 'allspice', 'cloves', 'seasoning',
        'red pepper flakes', 'cayenne', 'bay leaf', 'bay leaves', 'curry', 'zaatar', 'za\'atar',
        'oregano', 'rosemary', 'thyme', 'tarragon', 'marjoram', 'sage', 'dill seed', 'caraway',
        'fennel seed', 'star anise', 'sumac', 'saffron', 'five spice', 'taco seasoning',
        'italian seasoning', 'cajun seasoning', 'garlic powder', 'onion powder'
    ]
    is_fresh = 'fresh' in n or 'bell pepper' in n or 'jalapeno' in n or 'serrano' in n or 'poblano' in n
    if not is_fresh and any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in spice_keywords):
        return 'Spices & Seasonings'

    # 6. Oils, Vinegars & Condiments
    condiment_keywords = [
        'oil', 'vinegar', 'soy sauce', 'tamari', 'fish sauce', 'worcestershire', 'hot sauce',
        'sriracha', 'tabasco', 'mustard', 'dijon', 'ketchup', 'mayonnaise', 'mayo',
        'bbq sauce', 'barbecue sauce', 'salsa', 'hoisin', 'teriyaki', 'tahini', 'honey',
        'maple syrup', 'vinaigrette', 'dressing', 'chili crisp', 'chili oil', 'sweet chili sauce',
        'agave', 'relish'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in condiment_keywords):
        return 'Oils, Vinegars & Condiments'

    # 7. Canned & Jarred Goods
    canned_keywords = [
        'canned', 'can of', 'tomato paste', 'tomato sauce', 'crushed tomatoes', 'diced tomatoes',
        'marinara', 'marinara sauce', 'coconut milk', 'artichoke hearts', 'olives', 'kalamata',
        'capers', 'roasted red peppers', 'pickles', 'chipotle in adobo', 'pumpkin puree'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in canned_keywords):
        return 'Canned & Jarred Goods'

    # 8. Baking Needs
    baking_keywords = [
        'flour', 'sugar', 'baking powder', 'baking soda', 'yeast', 'vanilla extract',
        'chocolate chips', 'cocoa', 'cocoa powder', 'cornstarch', 'molasses', 'cream of tartar',
        'powdered sugar', 'brown sugar', 'sprinkles', 'food coloring', 'almond extract'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in baking_keywords):
        return 'Baking Needs'

    # 9. Beverages
    bev_keywords = [
        'wine', 'beer', 'bourbon', 'whiskey', 'rum', 'vodka', 'coffee', 'espresso', 'tea',
        'cider', 'club soda', 'seltzer', 'tonic water', 'orange juice', 'apple juice'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in bev_keywords):
        return 'Beverages'

    # 10. Frozen Foods
    frozen_keywords = ['frozen', 'ice cream', 'puff pastry', 'phyllo dough']
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in frozen_keywords):
        return 'Frozen Foods'

    # 11. Produce
    produce_keywords = [
        'garlic', 'onion', 'shallot', 'leek', 'scallion', 'green onion', 'chive', 'lemon', 'lime',
        'apple', 'banana', 'orange', 'tomato', 'tomatoes', 'avocado', 'bell pepper', 'pepper',
        'carrot', 'celery', 'potato', 'potatoes', 'sweet potato', 'spinach', 'kale', 'lettuce',
        'arugula', 'cabbage', 'broccoli', 'cauliflower', 'asparagus', 'zucchini', 'squash',
        'mushroom', 'mushrooms', 'cucumber', 'ginger', 'cilantro', 'parsley', 'basil', 'thyme',
        'rosemary', 'mint', 'dill', 'berry', 'berries', 'strawberry', 'blueberry', 'raspberry',
        'peach', 'plum', 'mango', 'pineapple', 'corn', 'eggplant', 'green bean', 'radish', 'beet',
        'pea', 'peas', 'brussels sprout', 'jalapeno', 'serrano', 'habanero', 'fennel', 'artichoke',
        'grape', 'pear', 'fig', 'pomegranate', 'melon', 'watermelon', 'cantaloupe', 'cherry',
        'cherries', 'herb', 'herbs', 'greens', 'bok choy', 'scallions', 'watercress'
    ]
    if any(re.search(r'\b' + re.escape(w) + r'\b', n) for w in produce_keywords):
        return 'Produce'

    # 12. Pantry & Dry Goods
    return 'Pantry & Dry Goods'
