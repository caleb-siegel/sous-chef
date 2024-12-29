import './App.css';
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import React, { useState, useEffect } from "react";
import { useNavigate } from 'react-router-dom';
import { Container, Typography } from '@mui/material';

function App() {

  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  const backendUrl = "https://souschef-backend.vercel.app"
  // const backendUrl = "http://127.0.0.1:5555"

  useEffect(() => {
    fetch(`${backendUrl}/api/check_session`, {
        credentials: 'include'
    }).then((res) => {
        if (res.ok) {
            res.json().then((user) => setUser(user));
        }
    });
}, []);

  function attemptLogin(userInfo) {
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
            console.log(`receiving data: ${data}`)
            setUser(data);
            console.log(`post setting user state: ${data}`)
            navigate("/recipes");
            console.log(`after navigation: user-${user}`)
            console.log(`after navigation: data-${data}`)
        })
        .catch((e) => {
            alert('incorrect username or password')
            console.log(e);
        });
  }
  function logout() {
    fetch(`${backendUrl}/api/logout`, { method: "DELETE" }).then((res) => {
        if (res.ok) {
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
          <Outlet context={{ user, attemptLogin, logout, backendUrl }}/>
        </Typography>
      </Container>
  );
};

export default App;
