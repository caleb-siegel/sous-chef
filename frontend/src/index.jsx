import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App';
import Error from './components/Error';
import Home from './components/Home';
import RecipeDirectory from './components/RecipeDirectory';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import Login from './components/Login';
import MealPrep from './components/MealPrep';
import IndividualRecipe from './components/IndividualRecipe';
import RandomizeRecipe from './components/RandomizeRecipe';
import ProfilePage from './components/ProfilePage';
import NewTag from './components/NewTag';
import { Analytics } from "@vercel/analytics/react"

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    errorElement: <Error />,
    children: [
      {
        path: "/",
        element: <Home />
      },
      {
        path: "recipes",
        element: <RecipeDirectory />
      },
      {
        path: "login",
        element: <Login />,
      },
      {
        path: "mealprep",
        element: <MealPrep />,
      },
      {
        path: "recipes/:id",
        element: <IndividualRecipe />,
      },
      {
        path: "random",
        element: <RandomizeRecipe />,
      },
      {
        path: "user/:id",
        element: <ProfilePage />,
      },
      {
        path: "newtag",
        element: <NewTag />,
      }
    ]
  }
])

const theme = createTheme({
  palette: {
    primary: {
      // main: "#013e87",
      main: "#3FFFC2",
      // contrastText: "#3FFFC2",
    },
    secondary: {
      // main: '#2e7c9'
      main: '#FF7D45'
    },
  },
  typography: {
    h1: {
      fontSize: "3rem",
      fontWeight: 600,
    },
    h2: {
      fontSize: "1.75rem",
      fontWeight: 600,
    },
    h3: {
      fontSize: "1.5rem",
      fontWeight: 600,
    },
  },
})

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
        <Analytics />
      </ThemeProvider>
  </React.StrictMode>
);

