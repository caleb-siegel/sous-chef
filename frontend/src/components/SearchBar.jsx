import React from "react";
import { TextField, Autocomplete } from "@mui/material";

function SearchBar({ cookbooks, chosenCookbook, setChosenCookbook }) {

    return (
        <Autocomplete
        disablePortal
        id="combo-box-demo"
        options={cookbooks}
        sx={{ width: 200 }}
        size="small"
        value={chosenCookbook}
        onChange={(event, newValue) => setChosenCookbook(newValue)}
        renderInput={(params) => <TextField {...params} label="Search" />}
        />
  )
}

export default SearchBar