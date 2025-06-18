import React from 'react';
import { useSelector } from 'react-redux';
import { useGetUserDataQuery } from '../api/authApi';
import { selectAccessToken } from '../features/auth/authSlice';

const Profile: React.FC = () => {
  const accessToken = useSelector(selectAccessToken);
  const { data, error, isLoading } = useGetUserDataQuery();

  if (isLoading) {
    return <div>Loading user profile...</div>;
  }

  if (error) {
    return <div>Error loading profile. Please try again later.</div>;
  }

  if (!data || !data.user) {
    return <div>No user data available</div>;
  }

  const { user } = data;
  console.log('User data:', user);

  return (
    <div className="profile-container">
      <h1>User Profile</h1>
      <div className="profile-info">
        <p><strong>User ID:</strong> {user.id}</p>
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Username:</strong> {user.username}</p>
      </div>
    </div>
  );
};

export default Profile;
