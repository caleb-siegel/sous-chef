import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';
import { useGoogleLogin } from '@react-oauth/google';

function App() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const backendUrl = "https://souschef-backend.vercel.app"
  // const backendUrl = "http://127.0.0.1:5555"

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
  
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      setUser(parsedUser);
  
      // Check with the backend for the latest data
      // fetch(`${backendUrl}/api/check_session`, {
      //   credentials: "include", // important for cookies/session
      // })
      //   .then((res) => {
      //     if (!res.ok) throw new Error("Session invalid");
      //     return res.json();
      //   })
      //   .then((freshUser) => {
      //     setUser(freshUser);
      //     localStorage.setItem("user", JSON.stringify(freshUser)); // update local storage
      //   })
      //   .catch(() => {
      //     // Session is no longer valid
      //     localStorage.removeItem("user");
      //     setUser(null);
      //   });
    }
  }, []);

  //   useEffect(() => {
  //     fetch(`${backendUrl}/api/check_session`, {
  //         credentials: 'include'
  //     }).then((res) => {
  //         if (res.ok) {
  //             res.json().then((user) => setUser(user));
  //         }
  //     });
  // }, []);

  async function attemptLogin(userInfo) {
    try {
      const res = await fetch(`${backendUrl}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(userInfo),
      });
      if (!res.ok) throw res;
      const data = await res.json();
      setUser(data);
      localStorage.setItem("user", JSON.stringify(data));
      navigate("/alerts");
    } catch (e) {
      alert("Incorrect email or password");
    }
  }

  const googleLogin = useGoogleLogin({
    onSuccess: async (codeResponse) => {
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
          credentials: 'include',  // Important for cookies
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
        
        // Handle successful login (e.g., redirect or update UI)
        setUser(data.user);
        localStorage.setItem("user", JSON.stringify(data.user));
        navigate("/alerts");

      } catch (error) {
        console.error('Error during login:', error);
        // Handle error (e.g., show error message to user)
      }
    },
    onError: (error) => {
      console.error('Google Login Failed:', error);
    },
    flow: 'implicit',
    scope: 'email profile',
  });

  function logout() {
    fetch(`${backendUrl}/api/logout`, {
      method: "DELETE",
      credentials: "include",
    }).then((res) => {
      if (res.ok) {
        localStorage.removeItem("user");
        setUser(null);
      }
    });
  }

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.body.classList.toggle('dark-mode');
  };

  return (
      <Container disableGutters maxWidth={false} sx={{ height: '100vh', width: '100%', padding: '0px'}}>
        <Typography component={'span'}>
          <Navbar logout={logout} user={user} toggleDarkMode={toggleDarkMode} darkMode={darkMode}/>
          <Outlet context={{ user, attemptLogin, logout, backendUrl, googleLogin }}/>
        </Typography>
      </Container>
  );
};

export default App;
