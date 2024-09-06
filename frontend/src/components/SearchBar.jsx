import React from "react";
import { TextField, Autocomplete, InputLabel } from "@mui/material";

function SearchBar({ cookbooks, chosenCookbook, setChosenCookbook }) {

    return (
        <div>
          <InputLabel id="demo-simple-select-label">Search for Cookbook</InputLabel>
          <Autocomplete
          disablePortal
          id="combo-box-demo"
          options={cookbooks}
          sx={{ width: 200 }}
          size="small"
          value={chosenCookbook}
          onChange={(event, newValue) => setChosenCookbook(newValue)}
          renderInput={(params) => <TextField {...params} label="Cookbook" />}
          />
        </div>
  )
}

export default SearchBar