import React, { useState } from 'react'
import { useOutletContext } from "react-router-dom";
import LoginForm from './LoginForm';
import { Paper, Button, Typography } from '@mui/material';


function Login() {
    const [accountForm, setAccountForm] = useState(false)
    const [newName, setNewName] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const { attemptLogin } = useOutletContext();
    const [name, setName] = useState("");
    const [password, setPassword] = useState("");
    const [createAccount, setCreateAccount] = useState(false);

    function createUser(e) {
        e.preventDefault();
        const userData = {
            name: newName,
            password_hash: newPassword
        };
        fetch("https://souschef-backend.vercel.app/api/user", {
        method: "POST",
        headers: {
            "Content-Type": "Application/JSON",
        },
        body: JSON.stringify(userData),
        })
        .then((response) => response.json())
        .then((newUser) => {
            setNewName("");
            setNewPassword("");
            attemptLogin({ name: newName, password: newPassword });
        });
    }

    const handleChangeUsername = (e) => setName(e.target.value);
    const handleChangePassword = (e) => setPassword(e.target.value);

    const handleChangeNewUsername = (e) => setNewName(e.target.value);
    const handleChangeNewPassword = (e) => setNewPassword(e.target.value);

    const handleCreateAccount = () => {
        setAccountForm(!accountForm)
        setCreateAccount(!createAccount)
    }
    
    function handleSubmit(e) {
        e.preventDefault();
        attemptLogin({ name: name, password: password });
    }

    return (
    <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px'}}>
        {!createAccount && 
            <div>
                <Typography variant="h2">Sign In</Typography>
                <br/>
                <LoginForm submitText={"Login"} handleSubmit={handleSubmit} handleChangeUsername={handleChangeUsername} name={name} handleChangePassword={handleChangePassword} password={password}/>
                <br/>
                <Typography variant="h2">OR</Typography>
                <br/>
                <Button variant="outlined" color="secondary" onClick={handleCreateAccount}>Create Account</Button>
            </div>
        }
        {accountForm ? (
            <div>
                <Typography variant="h2">Create Account</Typography>
                <br/>
                <LoginForm submitText={"Submit"} handleSubmit={createUser} handleChangeUsername={handleChangeNewUsername} name={newName} handleChangePassword={handleChangeNewPassword} password={newPassword}/>
                <br/>
                <Typography variant="h2">OR</Typography>
                <br/>
                <Button variant="outlined" color="secondary" onClick={handleCreateAccount}>Login</Button>
            </div>
            ) : ("")
        }
    </Paper>
    );
}

export default Login