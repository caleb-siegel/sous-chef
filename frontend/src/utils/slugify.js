/**
 * Converts a string into a URL-friendly slug.
 * Example: "Mommy's Chicken" -> "mommys-chicken"
 */
export function slugify(text) {
    if (!text) return '';
    return text
        .toString()
        .toLowerCase()
        .trim()
        .replace(/['’]/g, '')           // Remove apostrophes: Mommy's -> Mommys
        .replace(/[^a-z0-9]+/g, '-')    // Convert non-alphanumeric chars to hyphens
        .replace(/^-+|-+$/g, '');       // Trim leading/trailing hyphens
}

/**
 * Returns a URL slug for a recipe object or recipe name.
 * Falls back to numeric id if no name exists.
 */
export function getRecipeSlug(recipeOrName) {
    if (!recipeOrName) return '';
    if (typeof recipeOrName === 'string') {
        return slugify(recipeOrName);
    }
    return slugify(recipeOrName.name) || String(recipeOrName.id || '');
}
