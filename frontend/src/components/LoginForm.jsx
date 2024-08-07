import React from "react";
import { Paper, TextField, Button } from "@mui/material";

const LoginForm = ({submitText, handleSubmit, handleChangeUsername, name, handleChangePassword, password}) => {
    return (
        <Paper elevation={3} sx={{ backgroundColor: '#D4D7D5', padding: '20px'}}>
            <form onSubmit={handleSubmit}>
                <div>
                    <TextField id="standard-basic" label="Username" variant="standard" onChange={handleChangeUsername} value={name}/>
                </div>
                <div>
                    <TextField type="password" id="standard-basic" label="Password" variant="standard" onChange={handleChangePassword} value={password} />
                </div>
                <br />
                <div>
                    <Button variant="contained" type="button" onClick={handleSubmit}>{submitText}</Button>
                </div>
            </form>
        </Paper>
    );
};

export default LoginForm;
