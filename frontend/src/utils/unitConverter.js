/**
 * Culinary Unit Converter & Scaler
 * 
 * Supports:
 * - Normalizing unit aliases (e.g. "tablespoons", "tbsp.", "T" -> "tbsp")
 * - Culinary fraction formatting (e.g. 0.25 -> "1/4", 1.5 -> "1 1/2")
 * - Consolidating multiple units for shopping lists (e.g. 1/4 cup + 2 tbsp -> "6 tbsp" or "3/8 cup")
 * - Auto-upgrading/downgrading units when scaling recipes (e.g. 12 tsp -> "1/4 cup" or "4 tbsp")
 */

// 1. Culinary fraction formatter
export function formatQuantity(qty, scale = 1) {
    if (qty === null || qty === undefined || qty === '' || Number(qty) === 0) return '';
    const val = Number(qty) * scale;
    if (isNaN(val) || val <= 0) return '';

    if (Math.abs(val - Math.round(val)) < 0.02) {
        return Math.round(val).toString();
    }

    const whole = Math.floor(val);
    const remainder = val - whole;

    const fractions = [
        { decimal: 0.125, fraction: '⅛' },
        { decimal: 0.166, fraction: '⅙' },
        { decimal: 0.25, fraction: '¼' },
        { decimal: 0.333, fraction: '⅓' },
        { decimal: 0.375, fraction: '⅜' },
        { decimal: 0.5, fraction: '½' },
        { decimal: 0.625, fraction: '⅝' },
        { decimal: 0.666, fraction: '⅔' },
        { decimal: 0.75, fraction: '¾' },
        { decimal: 0.833, fraction: '⅚' },
        { decimal: 0.875, fraction: '⅞' },
    ];

    let closest = fractions[0];
    let minDiff = Math.abs(remainder - fractions[0].decimal);
    for (let f of fractions) {
        const diff = Math.abs(remainder - f.decimal);
        if (diff < minDiff) {
            minDiff = diff;
            closest = f;
        }
    }

    if (minDiff < 0.035) {
        return whole > 0 ? `${whole} ${closest.fraction}` : closest.fraction;
    }

    // Fallback: round cleanly to 2 decimal places
    const rounded = Number(val.toFixed(2));
    return rounded.toString();
}

// 2. Unit standardizer / alias dictionary
const UNIT_ALIASES = {
    // Teaspoons
    'tsp': 'tsp',
    'tsps': 'tsp',
    'teaspoon': 'tsp',
    'teaspoons': 'tsp',
    'tsp.': 'tsp',
    't': 'tsp',

    // Tablespoons
    'tbsp': 'tbsp',
    'tbsps': 'tbsp',
    'tablespoon': 'tbsp',
    'tablespoons': 'tbsp',
    'tbsp.': 'tbsp',
    'tbs': 'tbsp',
    'tbs.': 'tbsp',
    'tbp': 'tbsp',
    'T': 'tbsp',

    // Fluid Ounces
    'fl oz': 'fl oz',
    'fl. oz.': 'fl oz',
    'fl. oz': 'fl oz',
    'fluid ounce': 'fl oz',
    'fluid ounces': 'fl oz',

    // Cups
    'cup': 'cup',
    'cups': 'cup',
    'c': 'cup',
    'c.': 'cup',

    // Pints
    'pint': 'pt',
    'pints': 'pt',
    'pt': 'pt',
    'pt.': 'pt',

    // Quarts
    'quart': 'qt',
    'quarts': 'qt',
    'qt': 'qt',
    'qt.': 'qt',

    // Gallons
    'gallon': 'gal',
    'gallons': 'gal',
    'gal': 'gal',
    'gal.': 'gal',

    // Weight - Ounces
    'oz': 'oz',
    'ozs': 'oz',
    'ounce': 'oz',
    'ounces': 'oz',
    'oz.': 'oz',

    // Weight - Pounds
    'lb': 'lb',
    'lbs': 'lb',
    'pound': 'lb',
    'pounds': 'lb',
    'lb.': 'lb',
    'lbs.': 'lb',

    // Weight - Grams
    'g': 'g',
    'gram': 'g',
    'grams': 'g',
    'g.': 'g',

    // Weight - Kilograms
    'kg': 'kg',
    'kilogram': 'kg',
    'kilograms': 'kg',
    'kg.': 'kg',

    // Volume - Milliliters
    'ml': 'ml',
    'milliliter': 'ml',
    'milliliters': 'ml',
    'ml.': 'ml',

    // Volume - Liters
    'l': 'l',
    'liter': 'l',
    'liters': 'l',
    'l.': 'l',

    // Count / Discrete
    'clove': 'clove',
    'cloves': 'clove',
    'head': 'head',
    'heads': 'head',
    'pinch': 'pinch',
    'pinches': 'pinch',
    'dash': 'dash',
    'dashes': 'dash',
    'bunch': 'bunch',
    'bunches': 'bunch',
    'sprig': 'sprig',
    'sprigs': 'sprig',
    'stalk': 'stalk',
    'stalks': 'stalk',
    'slice': 'slice',
    'slices': 'slice',
    'can': 'can',
    'cans': 'can',
    'piece': 'piece',
    'pieces': 'piece',
    'whole': 'whole',
};

export function normalizeUnit(unitStr) {
    if (!unitStr || typeof unitStr !== 'string') return '';
    const clean = unitStr.trim().toLowerCase();
    return UNIT_ALIASES[clean] || clean;
}

// Volume conversion ratios (Base: tsp)
const VOLUME_TO_TSP = {
    'dash': 0.125,
    'pinch': 0.125,
    'tsp': 1,
    'tbsp': 3,
    'fl oz': 6,
    'cup': 48,
    'pt': 96,
    'qt': 192,
    'gal': 768,
    'ml': 0.202884,
    'l': 202.884,
};

// Weight conversion ratios (Base: oz)
const WEIGHT_TO_OZ = {
    'oz': 1,
    'lb': 16,
    'g': 0.035274,
    'kg': 35.274,
};

/**
 * Consolidates a map of { unit: quantity } into the cleanest human-friendly string.
 * Example input: { "cup": 0.25, "tbsp": 4 }
 * Output: "½ cup"
 * Example input: { "head": 1, "clove": 5 }
 * Output: "1 head, 5 cloves"
 */
export function consolidateUnits(unitsMap) {
    if (!unitsMap || typeof unitsMap !== 'object') return '';

    let totalVolumeTsp = 0;
    let hasVolume = false;

    let totalWeightOz = 0;
    let hasWeight = false;

    // Discrete or non-convertible units (cloves, heads, bunches, cans, etc.)
    const discreteUnits = {};

    for (const [rawUnit, qty] of Object.entries(unitsMap)) {
        if (!qty || isNaN(qty) || Number(qty) <= 0) continue;
        const normUnit = normalizeUnit(rawUnit);

        if (VOLUME_TO_TSP[normUnit] !== undefined) {
            totalVolumeTsp += qty * VOLUME_TO_TSP[normUnit];
            hasVolume = true;
        } else if (WEIGHT_TO_OZ[normUnit] !== undefined) {
            totalWeightOz += qty * WEIGHT_TO_OZ[normUnit];
            hasWeight = true;
        } else {
            discreteUnits[normUnit] = (discreteUnits[normUnit] || 0) + Number(qty);
        }
    }

    const resultParts = [];

    // 1. Process Volume consolidation
    if (hasVolume && totalVolumeTsp > 0) {
        if (totalVolumeTsp >= 192) {
            // >= 4 cups: use quarts or gallons if huge
            if (totalVolumeTsp >= 768) {
                const gals = totalVolumeTsp / 768;
                resultParts.push(`${formatQuantity(gals)} ${gals === 1 ? 'gal' : 'gal'}`);
            } else {
                const qts = totalVolumeTsp / 192;
                resultParts.push(`${formatQuantity(qts)} ${qts === 1 ? 'qt' : 'qt'}`);
            }
        } else if (totalVolumeTsp >= 48) {
            // >= 1 cup: express in cups
            const cups = totalVolumeTsp / 48;
            resultParts.push(`${formatQuantity(cups)} ${cups === 1 ? 'cup' : 'cups'}`);
        } else if (totalVolumeTsp >= 12) {
            // 4 tbsp to < 1 cup: express in cups if clean fraction, else tbsp
            const cups = totalVolumeTsp / 48;
            const tbsp = totalVolumeTsp / 3;
            if ([0.25, 0.333, 0.5, 0.666, 0.75].some(f => Math.abs(cups - f) < 0.02)) {
                resultParts.push(`${formatQuantity(cups)} cup`);
            } else {
                resultParts.push(`${formatQuantity(tbsp)} tbsp`);
            }
        } else if (totalVolumeTsp >= 3) {
            // 1 to 4 tbsp: express in tbsp
            const tbsp = totalVolumeTsp / 3;
            resultParts.push(`${formatQuantity(tbsp)} tbsp`);
        } else {
            // < 1 tbsp: express in tsp
            resultParts.push(`${formatQuantity(totalVolumeTsp)} tsp`);
        }
    }

    // 2. Process Weight consolidation
    if (hasWeight && totalWeightOz > 0) {
        if (totalWeightOz >= 16) {
            const lbs = totalWeightOz / 16;
            resultParts.push(`${formatQuantity(lbs)} ${lbs === 1 ? 'lb' : 'lbs'}`);
        } else {
            resultParts.push(`${formatQuantity(totalWeightOz)} oz`);
        }
    }

    // 3. Process Discrete units (cloves, heads, whole, etc.)
    for (const [unit, qty] of Object.entries(discreteUnits)) {
        const formattedQty = formatQuantity(qty);
        let displayUnit = unit;
        // Pluralize common discrete units
        if (qty > 1 && unit) {
            if (unit === 'clove') displayUnit = 'cloves';
            else if (unit === 'head') displayUnit = 'heads';
            else if (unit === 'bunch') displayUnit = 'bunches';
            else if (unit === 'sprig') displayUnit = 'sprigs';
            else if (unit === 'stalk') displayUnit = 'stalks';
            else if (unit === 'slice') displayUnit = 'slices';
            else if (unit === 'can') displayUnit = 'cans';
            else if (unit === 'pinch') displayUnit = 'pinches';
            else if (unit === 'dash') displayUnit = 'dashes';
        }
        resultParts.push(`${formattedQty} ${displayUnit}`.trim());
    }

    return resultParts.join(', ');
}

/**
 * Optimizes scaled ingredient measurements for the recipe scaler.
 * Example: 1 tsp scaled by 12x = 12 tsp -> returns { quantityStr: "¼", unit: "cup" } or { quantityStr: "4", unit: "tbsp" }
 * Example: 2 tbsp scaled by 8x = 16 tbsp -> returns { quantityStr: "1", unit: "cup" }
 */
export function scaleAndOptimizeMeasurement(qty, unitStr, scale = 1) {
    if (qty === null || qty === undefined || qty === '' || Number(qty) === 0) {
        return { quantityStr: '', unit: unitStr || '' };
    }

    const normUnit = normalizeUnit(unitStr);
    const rawScaledVal = Number(qty) * scale;
    if (isNaN(rawScaledVal) || rawScaledVal <= 0) {
        return { quantityStr: '', unit: unitStr || '' };
    }

    // 1. Check if Volume Unit can be upgraded cleanly
    if (VOLUME_TO_TSP[normUnit] !== undefined) {
        const totalTsp = rawScaledVal * VOLUME_TO_TSP[normUnit];

        // >= 48 tsp (1 cup) -> convert to cups
        if (totalTsp >= 48) {
            const cups = totalTsp / 48;
            return {
                quantityStr: formatQuantity(cups),
                unit: cups === 1 ? 'cup' : 'cups'
            };
        }
        // >= 12 tsp (4 tbsp / 1/4 cup) -> convert to cups if clean fraction, else tbsp
        if (totalTsp >= 12) {
            const cups = totalTsp / 48;
            if ([0.25, 0.333, 0.5, 0.666, 0.75].some(f => Math.abs(cups - f) < 0.02)) {
                return { quantityStr: formatQuantity(cups), unit: 'cup' };
            }
            const tbsp = totalTsp / 3;
            return { quantityStr: formatQuantity(tbsp), unit: 'tbsp' };
        }
        // >= 3 tsp (1 tbsp) -> convert to tbsp if scaling up from tsp
        if (totalTsp >= 3 && (normUnit === 'tsp' || normUnit === 'tbsp')) {
            const tbsp = totalTsp / 3;
            if (Math.abs(tbsp - Math.round(tbsp)) < 0.05 || tbsp === 1.5 || tbsp === 2.5) {
                return { quantityStr: formatQuantity(tbsp), unit: 'tbsp' };
            }
        }
    }

    // 2. Check if Weight Unit can be upgraded cleanly (>= 16 oz -> lbs)
    if (WEIGHT_TO_OZ[normUnit] !== undefined) {
        const totalOz = rawScaledVal * WEIGHT_TO_OZ[normUnit];
        if (totalOz >= 16) {
            const lbs = totalOz / 16;
            return {
                quantityStr: formatQuantity(lbs),
                unit: lbs === 1 ? 'lb' : 'lbs'
            };
        }
    }

    // 3. Default: keep original unit with formatted quantity
    return {
        quantityStr: formatQuantity(rawScaledVal),
        unit: unitStr || ''
    };
}
