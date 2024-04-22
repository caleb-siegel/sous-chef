import React from 'react'
import { useParams } from 'react-router-dom';
import { useOutletContext } from "react-router-dom";

function ProfilePage() {
    const {user} = useOutletContext();
    const { id } = useParams();

    return (
        <div>
            <h1>{user.id}</h1>
        </div>
    )
}

export default ProfilePage