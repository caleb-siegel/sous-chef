import { NavLink } from "react-router-dom";
import { Container } from "@mui/material";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";
import FormGroup from "@mui/material/FormGroup";

function Navbar({ user, logout, darkMode, toggleDarkMode }) {

    return (
        <Container className="navbar">
            <Container>
                <NavLink to="/" className={"nav-link"}>Home</NavLink>
            </Container>
            <Container>
                <NavLink to="recipes" className={"nav-link"}>Recipes</NavLink>
            </Container>
            <Container>
                <NavLink to="mealprep" className={"nav-link"}>Meal Prep</NavLink>
            </Container>
            {!user ? 
                <Container>
                    <NavLink to="login" className={"nav-link"}>Login</NavLink>
                </Container>
            :
                <Container>
                    <Container>
                        <NavLink to="/" className={"nav-link"} onClick={logout}>Logout</NavLink>
                        <div>Welcome, {user.name}</div>
                    </Container>
                </Container>
            }
            <Container sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <FormGroup>
                    <FormControlLabel control={<Switch defaultChecked onChange={toggleDarkMode} />} label={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'} />
                </FormGroup>
            </Container>
        </Container>
    )
}

export default Navbar;