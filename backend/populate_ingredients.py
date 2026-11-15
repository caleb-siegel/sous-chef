"""Populate canonical ingredients and link recipe_ingredient records.

This script:
1. Reviews all existing recipe_ingredient records.
2. Cleans and extracts the canonical ingredient name (e.g., 'garlic cloves, minced' -> 'Garlic', prep: 'minced').
3. Categorizes each ingredient into standard supermarket aisles (Produce, Dairy & Eggs, Meat & Poultry, etc.).
4. Creates canonical records in the `ingredient` table (without duplicates).
5. Updates `recipe_ingredient.ingredient_id` to link each existing row to its canonical ingredient.
6. Updates `recipe_ingredient.preparation` when preparation details are detected.
7. DOES NOT DELETE ANY DATA from recipe_ingredient.

Usage:
  python populate_ingredients.py --dry-run   # Review mappings without writing to DB
  python populate_ingredients.py            # Apply changes to the database
"""

import sys
import os
import re
from collections import defaultdict
from app import app
from models import db, Ingredient_Category, Ingredient, Recipe_Ingredient
from ingredient_parser import DEFAULT_CATEGORIES, clean_and_parse_ingredient, determine_category


def run(dry_run=False):
    print("=" * 70)
    print("INSPECTING & POPULATING INGREDIENTS TABLE")
    print(f"Mode: {'DRY RUN (No database changes will be committed)' if dry_run else 'LIVE (Database changes will be applied)'}")
    print("=" * 70)

    with app.app_context():
        # 1. Ensure categories exist
        category_map = {}
        for cat in Ingredient_Category.query.all():
            category_map[cat.name.lower()] = cat

        for cat_name, sort_order in DEFAULT_CATEGORIES:
            if cat_name.lower() not in category_map:
                new_cat = Ingredient_Category(name=cat_name, sort_order=sort_order)
                if not dry_run:
                    db.session.add(new_cat)
                    db.session.flush()
                category_map[cat_name.lower()] = new_cat

        if not dry_run:
            db.session.commit()
            for cat in Ingredient_Category.query.all():
                category_map[cat.name.lower()] = cat

        print(f"Categories available: {len(category_map)}")

        # 2. Existing ingredients map (case-insensitive)
        ingredient_map = {}
        for ing in Ingredient.query.all():
            ingredient_map[ing.name.strip().lower()] = ing

        print(f"Existing canonical ingredients in DB: {len(ingredient_map)}")

        # 3. Query all recipe_ingredient records
        all_recipe_ingredients = Recipe_Ingredient.query.all()
        total_records = len(all_recipe_ingredients)
        print(f"Total recipe_ingredient records in DB: {total_records}")

        linked_count = 0
        skipped_empty = 0
        new_ingredients_created = 0
        prep_updated_count = 0
        category_stats = defaultdict(int)

        sample_mappings = []

        for ri in all_recipe_ingredients:
            raw_name = ri.ingredient_name
            if not raw_name or not raw_name.strip():
                skipped_empty += 1
                continue

            canonical_name, detected_prep, suggested_unit = clean_and_parse_ingredient(raw_name)
            if not canonical_name:
                skipped_empty += 1
                continue

            cat_name = determine_category(canonical_name)
            category_stats[cat_name] += 1
            cat_obj = category_map.get(cat_name.lower())
            cat_id = cat_obj.id if cat_obj else None

            # Look up or create canonical Ingredient
            canonical_key = canonical_name.lower()
            if canonical_key in ingredient_map:
                ing_obj = ingredient_map[canonical_key]
            else:
                ing_obj = Ingredient(
                    name=canonical_name,
                    category_id=cat_id,
                    default_unit=suggested_unit
                )
                ingredient_map[canonical_key] = ing_obj
                new_ingredients_created += 1
                if not dry_run:
                    db.session.add(ing_obj)
                    db.session.flush()

            # Link foreign key
            if not dry_run:
                ri.ingredient_id = ing_obj.id
                if detected_prep and not ri.preparation:
                    ri.preparation = detected_prep
                    prep_updated_count += 1

            linked_count += 1

            if len(sample_mappings) < 15 and (ri.id % 700 == 0 or raw_name.lower().startswith('garlic')):
                sample_mappings.append({
                    'raw': raw_name,
                    'canonical': canonical_name,
                    'category': cat_name,
                    'prep': detected_prep,
                })

        if not dry_run:
            db.session.commit()
            print("\nSuccessfully committed all changes to the database!")

        print("\n" + "=" * 70)
        print("SUMMARY REPORT")
        print("=" * 70)
        print(f"Total records reviewed:              {total_records}")
        print(f"Records successfully linked:         {linked_count}")
        print(f"Records skipped (empty/null name):   {skipped_empty}")
        print(f"Canonical ingredients created:       {new_ingredients_created}")
        print(f"Total canonical ingredients in DB:   {len(ingredient_map)}")
        if not dry_run:
            print(f"Preparation fields populated:        {prep_updated_count}")

        print("\nBreakdown by Grocery Store Category:")
        for cat, count in sorted(category_stats.items(), key=lambda x: x[1], reverse=True):
            print(f"  - {cat:<28} : {count:>5} recipe items")

        print("\nSample Ingredient Mappings:")
        for s in sample_mappings[:10]:
            prep_info = f" [Prep: {s['prep']}]" if s['prep'] else ""
            print(f"  • '{s['raw']}' -> '{s['canonical']}' ({s['category']}){prep_info}")

        print("=" * 70)

if __name__ == '__main__':
    is_dry_run = '--dry-run' in sys.argv
    run(dry_run=is_dry_run)
