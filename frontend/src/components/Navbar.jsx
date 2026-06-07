import { NavLink } from "react-router-dom";
import { Container, Switch, FormControlLabel, FormGroup, Grid, Box, IconButton, Menu, MenuItem, useMediaQuery, useTheme, Typography } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import React, { useState } from 'react';

function Navbar({ user, logout, darkMode, toggleDarkMode }) {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleMenuClick = (event) => {
        setAnchorEl(event.currentTarget);
    };

    const handleMenuClose = () => {
        setAnchorEl(null);
    };

    const navLinks = [
        { name: "Home", path: "/" },
        { name: "Recipes", path: "/recipes" },
        { name: "Restaurants", path: "/restaurants" },
        { name: "Meal Prep", path: "/mealprep" },
        { name: "Feed", path: "/feed" },
        { name: "Spice It Up", path: "/random" },
    ];

    if (user && user.id === 2) {
        navLinks.push({ name: "Add New Tag", path: "/newtag" });
    }
    if (user && user.id) {
        navLinks.push({ name: "Profile", path: `/user/${user.id}` });
    }

    const renderNavLinks = () => (
        navLinks.map((link) => (
            <NavLink key={link.path} to={link.path} className="nav-link" onClick={handleMenuClose}>
                {link.name}
            </NavLink>
        ))
    );

    return (
        <Container disableGutters maxWidth={false} className="navbar" sx={{ px: 2, py: 1 }}>
            <Grid container alignItems="center" justifyContent="space-between">
                <Grid item>
                    <Box display="flex" alignItems="center">
                        {isMobile && (
                            <>
                                <IconButton
                                    size="large"
                                    edge="start"
                                    color="inherit"
                                    aria-label="menu"
                                    onClick={handleMenuClick}
                                    sx={{ mr: 1 }}
                                >
                                    <MenuIcon />
                                </IconButton>
                                <Menu
                                    anchorEl={anchorEl}
                                    open={open}
                                    onClose={handleMenuClose}
                                    sx={{ display: { xs: 'block', md: 'none' } }}
                                >
                                    {navLinks.map((link) => (
                                        <MenuItem key={link.path} onClick={handleMenuClose} component={NavLink} to={link.path}>
                                            {link.name}
                                        </MenuItem>
                                    ))}
                                    {!user ? (
                                        <MenuItem onClick={handleMenuClose} component={NavLink} to="/login">Login</MenuItem>
                                    ) : (
                                        <MenuItem onClick={() => { logout(); handleMenuClose(); }} component={NavLink} to="/">Logout</MenuItem>
                                    )}
                                </Menu>
                            </>
                        )}
                        {!isMobile && (
                            <Box display="flex">
                                {renderNavLinks()}
                            </Box>
                        )}
                        <Typography variant="h6" sx={{ ml: 1, fontWeight: 'bold', display: { xs: 'none', sm: 'block' } }}>
                            Sous Chef
                        </Typography>
                    </Box>
                </Grid>
                <Grid item>
                    <Box display="flex" alignItems="center" sx={{ gap: '16px' }}>
                        {!isMobile && (
                            <>
                                {!user ? (
                                    <NavLink to="login" className="nav-link">Login</NavLink>
                                ) : (
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                        <Typography variant="body2" sx={{ display: { xs: 'none', lg: 'block' } }}>
                                            Welcome, {user.name}
                                        </Typography>
                                        <NavLink to="/" className="nav-link" onClick={logout}>Logout</NavLink>
                                    </Box>
                                )}
                            </>
                        )}
                        <FormGroup>
                            <FormControlLabel
                                control={<Switch checked={darkMode} onChange={toggleDarkMode} size="small" />}
                                label={isMobile ? "" : (darkMode ? 'Dark' : 'Light')}
                                labelPlacement="start"
                            />
                        </FormGroup>
                    </Box>
                </Grid>
            </Grid>
        </Container>
    );
};

export default Navbar;