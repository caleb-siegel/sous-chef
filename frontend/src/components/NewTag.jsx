import React, { useState, useEffect } from 'react'
import { Paper, TextField, Button, Chip, Alert } from '@mui/material';

function NewTag() {
    const [newTag, setNewTag] = useState("")
    const [alertMessage, setAlertMessage] = useState(false);

    const [userTags, setUserTags] = useState([]);
    useEffect(() => {
        fetch("/api/usertags")
        .then((response) => response.json())
        .then((data) => setUserTags(data));
    }, []);

    const handleSubmit = (event) => {
        event.preventDefault();
        const newTagData = {
            name: newTag
        }
        fetch("/api/usertags", {
            method: "POST",
            headers: {
                "Content-Type": "Application/JSON",
            },
            body: JSON.stringify(newTagData),
        })
        .then((response) => response.json())
        .then((data) => {
            setAlertMessage(true)
            setNewTag('')
            setUserTags([...userTags, data])
        })
    }

    const handleDeleteUserTag = (event, id) => {
        event.preventDefault();
        fetch(`/api/usertags/${id}`, {
            method: "DELETE",
        })
        .then((data) => {
            setUserTags(userTags.filter(tag => id !== tag.id))
        })
    };

    return (
        <Paper sx={{ bgcolor: "primary.main", padding: '50px', width: '100%', maxWidth: '100%'  }}>
            <h1>Don't see a tag you'd like to add to a recipe?</h1>
            {userTags.map(user_tag => (
                user_tag &&
                <Chip
                    key={user_tag.id}
                    size="small"
                    label={user_tag.name}
                    color="secondary"
                    sx={{ margin: '1px'}}
                    onDelete={(event) => handleDeleteUserTag(event, user_tag.id)}
                />
            ))}
            <h2>Add a new tag below</h2>
            <form onSubmit={handleSubmit}>
                <TextField id="newTag" color="secondary" label="New Tag" size="small" variant="standard" value={newTag} onChange={(event) => setNewTag(event.target.value)}/>
                <br/><br/>
                <Button variant="contained" color="secondary" size="small" type="submit">Add</Button>
            </form>
            {alertMessage && <Alert severity="success">You have successfully added the new tag.</Alert>
            }
        </Paper>
  )
}

export default NewTag