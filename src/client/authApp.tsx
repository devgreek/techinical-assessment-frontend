import React, { useEffect } from 'react';
import ReactDOM from 'react-dom';
import { Provider, useDispatch, useSelector } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from './store';
import App from './components/App';
import { useRefreshMutation } from './api/authApi';
import { updateAccessToken, selectIsAuthenticated } from './features/auth/authSlice';
import './authStyles.css';

// Auth session initializer component to handle token refresh on app startup
const AuthInitializer: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const [refresh, { isLoading }] = useRefreshMutation();
  
  useEffect(() => {
    // Always try to refresh the token when the app loads
    // The HTTP-only cookie will determine if there's a valid session
    const refreshToken = async () => {
      try {
        // Call refresh endpoint which will use the HTTP-only cookie
        const result = await refresh().unwrap();
        // Update the token in state
        dispatch(updateAccessToken(result));
        console.log('Token refreshed on application start');
      } catch (err) {
        console.log('No valid session found or refresh failed');
        // The authMiddleware will handle logout if refresh fails
      }
    };

    refreshToken();
  }, [dispatch, refresh]);

  return <>{children}</>;
};

// This is a standalone entry point for the auth app
// It can be used outside of the notebook renderer context
const root = document.getElementById('root');

if (root) {
  ReactDOM.render(
    <Provider store={store}>
      <PersistGate loading={<div>Loading...</div>} persistor={persistor}>
        <AuthInitializer>
          <App />
        </AuthInitializer>
      </PersistGate>
    </Provider>,
    root
  );
}
