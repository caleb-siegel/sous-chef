import React, { useState } from "react";
import { NavLink, Link } from "react-router-dom";
import IconButton from "@mui/material/IconButton";
import Drawer from "@mui/material/Drawer";
import Tooltip from "@mui/material/Tooltip";
import HomeRounded from "@mui/icons-material/HomeRounded";
import MenuBookRounded from "@mui/icons-material/MenuBookRounded";
import StorefrontRounded from "@mui/icons-material/StorefrontRounded";
import CalendarMonthRounded from "@mui/icons-material/CalendarMonthRounded";
import DynamicFeedRounded from "@mui/icons-material/DynamicFeedRounded";
import AutoAwesomeRounded from "@mui/icons-material/AutoAwesomeRounded";
import LocalOfferRounded from "@mui/icons-material/LocalOfferRounded";
import LightModeRounded from "@mui/icons-material/LightModeRounded";
import DarkModeRounded from "@mui/icons-material/DarkModeRounded";
import LoginRounded from "@mui/icons-material/LoginRounded";
import LogoutRounded from "@mui/icons-material/LogoutRounded";
import MenuRounded from "@mui/icons-material/MenuRounded";
import CloseRounded from "@mui/icons-material/CloseRounded";
import "./Navbar.css";

function Navbar({ user, logout, darkMode, toggleDarkMode }) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen((prev) => !prev);
  };

  const isSuperUser = Boolean(user && (user.id === 2 || user.id === "2"));

  const navLinks = [
    { name: "Home", path: "/", icon: <HomeRounded className="sc-header-nav-icon" />, end: true },
    { name: "Recipes", path: "/recipes", icon: <MenuBookRounded className="sc-header-nav-icon" /> },
    ...(isSuperUser
      ? [{ name: "Restaurants", path: "/restaurants", icon: <StorefrontRounded className="sc-header-nav-icon" /> }]
      : []),
    { name: "Meal Prep", path: "/mealprep", icon: <CalendarMonthRounded className="sc-header-nav-icon" /> },
    ...(isSuperUser
      ? [{ name: "Feed", path: "/feed", icon: <DynamicFeedRounded className="sc-header-nav-icon" /> }]
      : []),
    { name: "Spice It Up", path: "/random", icon: <AutoAwesomeRounded className="sc-header-nav-icon" /> },
    ...(isSuperUser
      ? [{ name: "Add New Tag", path: "/newtag", icon: <LocalOfferRounded className="sc-header-nav-icon" /> }]
      : []),
  ];


  const userDisplayName = user
    ? user.first_name
      ? `${user.first_name} ${user.last_name || ""}`.trim()
      : user.name || "Chef"
    : "";

  const userInitial = userDisplayName ? userDisplayName[0].toUpperCase() : "U";

  return (
    <header className="navbar sc-header-root">
      <div className="sc-header-inner">
        {/* Left Side: Mobile Menu Button & Brand */}
        <div className="sc-header-left">
          <IconButton
            className="sc-mobile-menu-btn"
            onClick={handleDrawerToggle}
            edge="start"
            aria-label="Open navigation menu"
            size="large"
          >
            <MenuRounded />
          </IconButton>

          <Link to="/" className="sc-brand-link">
            <span className="sc-brand-emoji" role="img" aria-label="Chef">👨‍🍳</span>
            <span className="sc-brand-text">SousChef</span>
          </Link>
        </div>

        {/* Desktop Navigation Links */}
        <nav className="sc-header-nav" aria-label="Main Navigation">
          {navLinks.map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              end={link.end}
              className={({ isActive }) =>
                `sc-header-nav-link ${isActive ? "active" : ""}`
              }
            >
              <span>{link.name}</span>
            </NavLink>
          ))}
        </nav>

        {/* Right Section: Theme Toggle & User Auth */}
        <div className="sc-header-right">
          <Tooltip title={darkMode ? "Switch to light mode" : "Switch to dark mode"} arrow>
            <IconButton
              className="sc-theme-btn"
              onClick={toggleDarkMode}
              aria-label="Toggle dark/light theme"
              size="medium"
            >
              {darkMode ? (
                <LightModeRounded sx={{ color: "#fbbf24" }} />
              ) : (
                <DarkModeRounded sx={{ color: "#64748b" }} />
              )}
            </IconButton>
          </Tooltip>

          {user ? (
            <div className="sc-user-wrapper">
              <Tooltip title={`Signed in as ${userDisplayName}`} arrow>
                <div className="sc-user-badge">
                  <div className="sc-user-avatar">{userInitial}</div>
                  <span className="sc-user-name">{userDisplayName}</span>
                </div>
              </Tooltip>

              <Tooltip title="Log out" arrow>
                <button
                  type="button"
                  className="sc-logout-btn"
                  onClick={logout}
                  aria-label="Log out"
                >
                  <LogoutRounded fontSize="small" />
                  <span className="sc-logout-text">Logout</span>
                </button>
              </Tooltip>
            </div>
          ) : (
            <NavLink to="/login" className="sc-login-btn">
              <LoginRounded fontSize="small" />
              <span>Login</span>
            </NavLink>
          )}
        </div>
      </div>

      {/* Mobile Drawer (Using Material UI Drawer with React Portal) */}
      <Drawer
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        PaperProps={{
          className: "sc-mobile-drawer-paper",
        }}
      >
        <div className="sc-drawer-container">
          {/* Drawer Header */}
          <div className="sc-drawer-header">
            <Link
              to="/"
              className="sc-brand-link"
              onClick={() => setMobileOpen(false)}
            >
              <span className="sc-brand-emoji" role="img" aria-label="Chef">👨‍🍳</span>
              <span className="sc-brand-text">SousChef</span>
            </Link>
            <IconButton
              onClick={() => setMobileOpen(false)}
              size="small"
              aria-label="Close menu"
              color="inherit"
            >
              <CloseRounded />
            </IconButton>
          </div>

          {/* User Card inside Drawer */}
          {user ? (
            <div className="sc-drawer-user">
              <div className="sc-drawer-avatar">{userInitial}</div>
              <div className="sc-drawer-user-meta">
                <span className="sc-drawer-user-title">{userDisplayName}</span>
              </div>
            </div>
          ) : null}

          {/* Nav Links in Drawer */}
          <nav className="sc-drawer-nav-list" aria-label="Mobile Navigation">
            {navLinks.map((link) => (
              <NavLink
                key={link.path}
                to={link.path}
                end={link.end}
                onClick={() => setMobileOpen(false)}
                className={({ isActive }) =>
                  `sc-drawer-link ${isActive ? "active" : ""}`
                }
              >
                <span className="sc-drawer-link-icon">{link.icon}</span>
                <span>{link.name}</span>
              </NavLink>
            ))}
          </nav>

          {/* Drawer Footer Actions */}
          <div className="sc-drawer-footer">
            <div className="sc-drawer-theme-row">
              <span className="sc-drawer-theme-title">
                {darkMode ? "Dark Theme" : "Light Theme"}
              </span>
              <IconButton onClick={toggleDarkMode} color="inherit" size="small">
                {darkMode ? (
                  <LightModeRounded sx={{ color: "#fbbf24" }} />
                ) : (
                  <DarkModeRounded sx={{ color: "#64748b" }} />
                )}
              </IconButton>
            </div>

            {user ? (
              <button
                type="button"
                className="sc-drawer-auth-btn sc-drawer-logout-btn"
                onClick={() => {
                  logout();
                  setMobileOpen(false);
                }}
              >
                <LogoutRounded fontSize="small" />
                <span>Log Out</span>
              </button>
            ) : (
              <NavLink
                to="/login"
                className="sc-drawer-auth-btn sc-drawer-login-btn"
                onClick={() => setMobileOpen(false)}
              >
                <LoginRounded fontSize="small" />
                <span>Log In</span>
              </NavLink>
            )}
          </div>
        </div>
      </Drawer>
    </header>
  );
}

export default Navbar;