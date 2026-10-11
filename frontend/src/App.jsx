import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';
import { useWakeLock } from './utils/wakeLock';

function App() {
  const { isLocked: isWakeLocked } = useWakeLock();
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem("user");
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      return null;
    }
  });
  const navigate = useNavigate();

  const backendUrl = import.meta.env.VITE_BACKEND_URL || 
    (typeof window !== 'undefined' && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')
      ? `http://${window.location.hostname}:5555`
      : "https://souschef-backend.vercel.app");

  const [isLoggingIn, setIsLoggingIn] = useState(false);

  useEffect(() => {
    // Check with the backend for the latest session data
    fetch(`${backendUrl}/api/check_session`, {
      credentials: "include",
    })
      .then((res) => {
        if (res.status === 401) {
          localStorage.removeItem("user");
          localStorage.removeItem("auth_token");
          setUser(null);
          return null;
        }
        if (!res.ok) {
          throw new Error(`Session check returned ${res.status}`);
        }
        return res.json();
      })
      .then((freshUser) => {
        if (freshUser) {
          if (freshUser.token) {
            localStorage.setItem("auth_token", freshUser.token);
          }
          setUser(freshUser);
          localStorage.setItem("user", JSON.stringify(freshUser));
        }
      })
      .catch((err) => {
        console.warn("Session check could not reach server:", err);
      });
  }, [backendUrl]);

  function attemptLogin(userInfo) {
    setIsLoggingIn(true);
    fetch(`${backendUrl}/api/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify(userInfo),
      credentials: 'include'
    })
      .then((res) => {
        if (res.ok) {
          return res.json();
        }
        throw res;
      })
      .then((data) => {
        if (data.token) {
          localStorage.setItem("auth_token", data.token);
        }
        setUser(data);
        localStorage.setItem("user", JSON.stringify(data));
        navigate("/recipes");
      })
      .catch((e) => {
        alert('incorrect username or password');
        console.log(e);
      })
      .finally(() => {
        setIsLoggingIn(false);
      });
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
      setIsLoggingIn(true);
      try {
        // Get user info from Google
        const userResponse = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
          headers: {
            'Authorization': `Bearer ${codeResponse.access_token}`,
          },
        });

        if (!userResponse.ok) {
          throw new Error('Failed to get user info from Google');
        }

        const userInfo = await userResponse.json();

        // Send to your backend
        const backendResponse = await fetch(`${backendUrl}/api/auth/google`, {
          method: 'POST',
          credentials: 'include',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${codeResponse.access_token}`,
          },
          body: JSON.stringify({ userInfo })
        });

        if (!backendResponse.ok) {
          throw new Error('Backend authentication failed');
        }

        const data = await backendResponse.json();
        const loggedInUser = data.user || data;
        if (data.token || loggedInUser.token) {
          localStorage.setItem("auth_token", data.token || loggedInUser.token);
        }

        setUser(loggedInUser);
        localStorage.setItem("user", JSON.stringify(loggedInUser));
        navigate("/recipes");

      } catch (error) {
        console.error('Error during login:', error);
      } finally {
        setIsLoggingIn(false);
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
      setIsLoggingIn(false);
    },
    flow: 'implicit',
    scope: 'email profile',
  });

  function logout() {
    fetch(`${backendUrl}/api/logout`, { method: "DELETE", credentials: "include" })
      .finally(() => {
        localStorage.removeItem("user");
        localStorage.removeItem("auth_token");
        setUser(null);
      });
  }

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
    <Container disableGutters maxWidth={false} sx={{ height: '100vh', width: '100%', padding: '0px' }}>
      <Typography component={'span'}>
        <Navbar logout={logout} user={user} toggleDarkMode={toggleDarkMode} darkMode={darkMode} />
        <Outlet context={{ user, attemptLogin, logout, backendUrl, googleLogin, isLoggingIn, isWakeLocked }} />
      </Typography>
    </Container>
  );
};

export default App;
