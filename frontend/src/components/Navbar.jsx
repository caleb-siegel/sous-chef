import { NavLink } from "react-router-dom";
import { Container } from "@mui/material";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";
import Grid from "@mui/material/Grid";
import Box from "@mui/material/Box";

function Navbar({ user, logout, darkMode, toggleDarkMode }) {

    return (
        <Container className="navbar">
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Box display="flex">
                        <NavLink to="/" className="nav-link">Home</NavLink>
                        <NavLink to="recipes" className="nav-link">Recipes</NavLink>
                        <NavLink to="mealprep" className="nav-link">Meal Prep</NavLink>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display="flex" alignItems="center" sx={{ justifyContent: 'space-between', gap: '8px' }}>
                        {!user ? (
                            <NavLink to="login" className="nav-link">Login</NavLink>
                        ) : (
                            <Box>
                                <NavLink to="/" className="nav-link" onClick={logout}>Logout</NavLink>
                                <span>Welcome, {user.name}</span>
                            </Box>
                        )}
                        <FormGroup>
                            <FormControlLabel
                                control={<Switch defaultChecked onChange={toggleDarkMode} />}
                                label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
                            />
                        </FormGroup>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Navbar;