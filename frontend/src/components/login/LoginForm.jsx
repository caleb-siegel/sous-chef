import React from "react";
import { Paper, TextField, Button, Box, CircularProgress } from "@mui/material";

const LoginForm = ({
    submitText, 
    handleSubmit, 
    handleChangeUsername, 
    name, 
    handleChangePassword, 
    password,
    loading = false
}) => {
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px'}}>
            <form onSubmit={handleSubmit}>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        id="login-username" 
                        label="Username" 
                        variant="standard" 
                        onChange={handleChangeUsername} 
                        value={name}
                        disabled={loading}
                        fullWidth
                        autoComplete="username"
                    />
                </Box>
                <Box sx={{ mb: 2 }}>
                    <TextField 
                        type="password" 
                        id="login-password" 
                        label="Password" 
                        variant="standard" 
                        onChange={handleChangePassword} 
                        value={password}
                        disabled={loading}
                        fullWidth
                        autoComplete="current-password"
                    />
                </Box>
                <Box sx={{ mt: 2 }}>
                    <Button 
                        variant="contained" 
                        type="submit" 
                        disabled={loading}
                        sx={{ minWidth: '130px', height: '40px' }}
                    >
                        {loading ? (
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <CircularProgress size={20} color="inherit" />
                                <span>Logging in...</span>
                            </Box>
                        ) : (
                            submitText
                        )}
                    </Button>
                </Box>
            </form>
        </Paper>
    );
};

export default LoginForm;
