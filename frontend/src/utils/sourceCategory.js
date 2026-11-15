/**
 * Utility functions and constants for recipe sources and source categories.
 */

export const SOURCE_CATEGORIES = [
    { id: 'Instagram', name: 'Instagram', label: 'Instagram', emoji: '📷', color: '#E1306C', bg: 'rgba(225, 48, 108, 0.1)', desc: 'Reels, videos & creator posts' },
    { id: 'Life', name: 'Life', label: 'Life', emoji: '🏡', color: '#059669', bg: 'rgba(5, 150, 105, 0.1)', desc: 'Family recipes, memories & personal dishes' },
    { id: 'Cookbook', name: 'Cookbook', label: 'Cookbook', emoji: '📚', color: '#2563eb', bg: 'rgba(37, 99, 235, 0.1)', desc: 'Printed cookbooks & publications' },
    { id: 'Website', name: 'Website', label: 'Website', emoji: '🌐', color: '#d97706', bg: 'rgba(217, 119, 6, 0.1)', desc: 'Food blogs, articles & websites' },
    { id: 'Restaurant', name: 'Restaurant', label: 'Restaurant', emoji: '🍽️', color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.1)', desc: 'Dining out & restaurant recreations' },
];

/**
 * Returns the canonical source category name for a recipe.
 * Works with full backend objects, source_category_id, or fallback link parsing.
 *
 * @param {Object} recipe
 * @returns {string} Category name ('Instagram' | 'Life' | 'Cookbook' | 'Website' | 'Restaurant' | 'Other')
 */
export const getRecipeSourceCategory = (recipe) => {
    if (!recipe) return 'Other';
    
    // 1. Explicit source_category object from backend
    if (recipe.source_category?.name) {
        const name = recipe.source_category.name.trim();
        const matched = SOURCE_CATEGORIES.find(c => c.name.toLowerCase() === name.toLowerCase());
        if (matched) return matched.name;
        return name;
    }

    // 2. Numeric source_category_id
    const catId = Number(recipe.source_category_id);
    if (catId === 1) return 'Website';
    if (catId === 2) return 'Cookbook';
    if (catId === 3) return 'Life';
    if (catId === 4) return 'Instagram';
    if (catId === 5) return 'Restaurant';

    // 3. Fallback inference from reference link or source
    const ref = (recipe.reference || '').toLowerCase();
    const src = (recipe.source || '').toLowerCase();
    if (ref.includes('instagram.com') || ref.includes('instagr.am') || src.includes('instagram') || src.startsWith('@')) {
        return 'Instagram';
    }
    if (ref.startsWith('http://') || ref.startsWith('https://')) {
        return 'Website';
    }

    return 'Other';
};

/**
 * Helper to get the metadata item for a category.
 */
export const getSourceCategoryMeta = (categoryName) => {
    if (!categoryName) return null;
    const lower = categoryName.toLowerCase();
    return SOURCE_CATEGORIES.find(c => c.name.toLowerCase() === lower || c.id.toLowerCase() === lower) || null;
};
