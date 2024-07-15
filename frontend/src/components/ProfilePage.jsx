import React from 'react'
import { useOutletContext } from "react-router-dom";

function ProfilePage() {
    const {user} = useOutletContext();

    return (
        <div>
            <h1>{user.id}</h1>
        </div>
    )
}

export default ProfilePage