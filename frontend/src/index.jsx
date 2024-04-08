import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
// import reportWebVitals from './reportWebVitals';
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import App from './App';
import Error from './components/Error';
import Home from './components/Home';
import RecipeDirectory from './components/RecipeDirectory';
import { ThemeProvider } from '@emotion/react';
import { createTheme } from '@mui/material';
import Login from './components/Login';

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
        path: "recipedirectory",
        element: <RecipeDirectory />
      },
      {
        path: "login",
        element: <Login />,
      }
      // {
      //   path: "notreorders",
      //   element: <NotReorders />
      // }
    ]
  }
])

const theme = createTheme({
  palette: {
    primary: {
      // main: "#013e87",
      main: "#3FFFC2",
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
      </ThemeProvider>
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
