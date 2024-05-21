import React from 'react';

interface UserProfileProps {
    username: string;
    email: string;
    avatarUrl: string;
}

const Profile: React.FC<UserProfileProps> = ({ username, email, avatarUrl }) => {
    return (
        <div>
            <h1>{username}</h1>
            <img src={avatarUrl} alt="User Avatar" />
            <p>{email}</p>
        </div>
    );
};

export default Profile;