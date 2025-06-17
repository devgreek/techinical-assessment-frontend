import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import Login from './Login';
import Profile from './Profile';
import { RootState } from '../store';
import { clearCredentials, selectIsAuthenticated } from '../features/auth/authSlice';
import { useLogoutMutation } from '../api/authApi';

// Navigation content to simulate routing
const NAV_LOGIN = 'login';
const NAV_PROFILE = 'profile';

// Redux-based protected component
const ProtectedComponent: React.FC<{
  children: React.ReactNode;
  fallback?: React.ReactNode;
}> = ({ children, fallback = <div>Access denied</div> }) => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  return isAuthenticated ? <>{children}</> : <>{fallback}</>;
};

const Navigation: React.FC = () => {
  const [currentPage, setCurrentPage] = useState(NAV_LOGIN);
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const dispatch = useDispatch();
  const [logout, { isLoading: isLoggingOut }] = useLogoutMutation();

  const handleLogout = async () => {
    try {
      await logout().unwrap();
      dispatch(clearCredentials());
      setCurrentPage(NAV_LOGIN);
    } catch (error) {
      console.error('Logout failed:', error);
      // Force logout anyway on error
      dispatch(clearCredentials());
      setCurrentPage(NAV_LOGIN);
    }
  };

  return (
    <div className="app-container">
      <nav>
        <ul>
          {!isAuthenticated ? (
            <li>
              <button onClick={() => setCurrentPage(NAV_LOGIN)}>Login</button>
            </li>
          ) : (
            <>
              <li>
                <button onClick={() => setCurrentPage(NAV_PROFILE)}>Profile</button>
              </li>
              <li>
                <button onClick={handleLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Logging out...' : 'Logout'}
                </button>
              </li>
            </>
          )}
        </ul>
      </nav>

      <main>
        {currentPage === NAV_LOGIN && !isAuthenticated && <Login />}
        {currentPage === NAV_LOGIN && isAuthenticated && (
          <div>
            <p>You are logged in! You can now visit the Profile page.</p>
            <button onClick={() => setCurrentPage(NAV_PROFILE)}>Go to Profile</button>
          </div>
        )}
        {currentPage === NAV_PROFILE && (
          <ProtectedComponent 
            fallback={<div>
              <p>Please log in to view your profile</p>
              <button onClick={() => setCurrentPage(NAV_LOGIN)}>Go to Login</button>
            </div>}
          >
            <Profile />
          </ProtectedComponent>
        )}
      </main>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <div className="app-wrapper">
      <h1>Authentication Example</h1>
      <Navigation />
    </div>
  );
};

export default App;
