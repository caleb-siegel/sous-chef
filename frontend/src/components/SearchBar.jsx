import React from "react";
import { TextField, Autocomplete, InputLabel } from "@mui/material";

function SearchBar({ cookbooks, chosenCookbook, setChosenCookbook }) {
    return (
        <div>
            <InputLabel id="cookbook-select-label">Search for Cookbook</InputLabel>
            <Autocomplete
                disablePortal
                id="cookbook-select"
                options={cookbooks}
                sx={{ width: 200 }}
                size="small"
                value={chosenCookbook}
                onChange={(event, newValue) => setChosenCookbook(newValue)}
                renderInput={(params) => <TextField {...params} label="Cookbook" />}
                freeSolo
                clearOnBlur={false}
            />
        </div>
    );
}

export default SearchBar;