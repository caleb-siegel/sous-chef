import React, { useState, useEffect } from 'react'
import { Container, FormGroup, FormControlLabel, Checkbox, Typography, Switch, Box, Divider } from '@mui/material'
import { useOutletContext } from "react-router-dom";

function ShoppingList({ mealPrep, user }) {
    const { backendUrl } = useOutletContext();

    const [shoppingList, setShoppingList] = useState([]);
    const [consolidate, setConsolidate] = useState(false);

    useEffect(() => {
        fetch(`${backendUrl}/api/user_shopping_list`)
        .then((response) => response.json())
        .then((data) => {
            setShoppingList(data);
        });
    }, []);

    const handleCheckboxChange = (event, itemId, checkedProp) => {
        const isChecked = event.target.checked;
        const itemIds = Array.isArray(itemId) ? itemId : [itemId];

        setShoppingList(prevList =>
            prevList.map(item =>
                itemIds.includes(item.id) ? { ...item, checked: isChecked } : item
            )
        );

        itemIds.forEach(id => {
            fetch(`${backendUrl}/api/user_shopping_list/${id}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ checked: isChecked }),
            });
        });
    };

    const getCleanName = (name) => {
        if (!name) return "";
        // Remove text in parentheses and after commas, then lowercase and trim
        return name.split(',')[0].split('(')[0].trim().toLowerCase();
    };

    const getConsolidatedList = () => {
        const groups = {};
        
        shoppingList.forEach(item => {
            if (user && user.id && user.id !== item.user_id) return;
            
            const ingredient = item.recipe_ingredient;
            if (!ingredient) return;

            const originalName = ingredient.ingredient_name || "Unknown";
            const cleanName = getCleanName(originalName);
            const unit = (ingredient.ingredient_unit || "").trim().toLowerCase();
            const quantity = ingredient.ingredient_quantity || 0;

            if (!groups[cleanName]) {
                groups[cleanName] = {
                    displayName: originalName,
                    units: {},
                    itemIds: [],
                    allChecked: true,
                    notes: new Set()
                };
            }

            if (!groups[cleanName].units[unit]) {
                groups[cleanName].units[unit] = 0;
            }
            groups[cleanName].units[unit] += quantity;
            groups[cleanName].itemIds.push(item.id);
            if (!item.checked) {
                groups[cleanName].allChecked = false;
            }
            if (ingredient.ingredient_note) {
                groups[cleanName].notes.add(ingredient.ingredient_note);
            }
        });

        return Object.values(groups).sort((a, b) => a.displayName.localeCompare(b.displayName));
    };

    const renderConsolidated = () => {
        const consolidated = getConsolidatedList();
        return consolidated.map(group => {
            const unitStrings = Object.entries(group.units)
                .map(([unit, qty]) => `${qty > 0 ? qty : ""} ${unit}`.trim())
                .filter(s => s !== "");
            
            const quantityStr = unitStrings.join(", ");
            const notesStr = Array.from(group.notes).join("; ");
            const label = `${quantityStr} ${group.displayName}${notesStr ? " (" + notesStr + ")" : ""}`;

            return (
                <div key={group.displayName}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={group.allChecked}
                                onChange={(e) => handleCheckboxChange(e, group.itemIds, group.allChecked)}
                            />
                        }
                        label={label}
                    />
                </div>
            );
        });
    };

    const renderIndividual = () => {
        return shoppingList.map(item => {
            if (user && user.id && user.id !== item.user_id) return null;

            return (typeof item.id) === "number" ?
                <div key={item.id}>
                    <FormControlLabel 
                        control={
                            <Checkbox
                                checked={item.checked}
                                onChange={(e) => handleCheckboxChange(e, item.id, item.checked)}
                            />
                        } 
                        label={`${item.recipe_ingredient?.ingredient_quantity || ""} ${item.recipe_ingredient?.ingredient_unit || ""} ${item.recipe_ingredient?.ingredient_name || ""}${item.recipe_ingredient?.ingredient_note ? ", " + item.recipe_ingredient.ingredient_note : ""} ${item.recipe_ingredient?.recipe?.name ? "(" + item.recipe_ingredient.recipe.name + ")" : ""}`} 
                    />
                </div>
            : 
                <FormControlLabel 
                    key={item.id} 
                    control={<Checkbox />} 
                    label={`${item.id}`} 
                />
        });
    };

    return (
        <Container disableGutters maxWidth={false}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h2">Shopping List</Typography>
                <FormControlLabel
                    control={
                        <Switch 
                            checked={consolidate}
                            onChange={(e) => setConsolidate(e.target.checked)}
                            color="primary"
                        />
                    }
                    label="Consolidate Items"
                />
            </Box>
            <Divider sx={{ mb: 2 }} />
            <FormGroup>
                {consolidate ? renderConsolidated() : renderIndividual()}
            </FormGroup>
        </Container>
    )
}

export default ShoppingList