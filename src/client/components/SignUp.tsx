import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSignupMutation } from '../api/authApi';
import { setCredentials, setAuthError } from '../features/auth/authSlice';

const SignUp: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await signup({ username, password, name }).unwrap();
      dispatch(setCredentials(userData));
    } catch (err: any) {
      setError(err.data?.message || 'Sign up failed');
      dispatch(setAuthError(err.data?.message || 'Sign up failed'));
    }
  };

  return (
    <div className="signup-container">
      <h1>Sign Up</h1>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="name">Name</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={e => setName(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="username">Username</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={e => setUsername(e.target.value)}
            required
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" disabled={isLoading}>
          {isLoading ? 'Signing up...' : 'Sign Up'}
        </button>
        {error && <div className="error">{error}</div>}
      </form>
    </div>
  );
};

export default SignUp;
