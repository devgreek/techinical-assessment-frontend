import { 
  isRejectedWithValue, 
  Middleware, 
  MiddlewareAPI,
  Dispatch, 
  AnyAction 
} from '@reduxjs/toolkit';
import { authApi } from '../api/authApi';
import { clearCredentials, updateAccessToken } from '../features/auth/authSlice';

// Flag to prevent infinite refresh loops
let isRefreshing = false;
// Track failed refresh attempts to prevent infinite loops
let failedRefreshAttempts = 0;
const MAX_REFRESH_ATTEMPTS = 2;
// Queue for pending requests during token refresh
type PendingRequest = {
  resolve: (value: unknown) => void;
  reject: (reason?: any) => void;
  action: AnyAction;
};

const pendingRequests: PendingRequest[] = [];

export const authMiddleware: Middleware = 
  (api: MiddlewareAPI) => (next) => (action) => {
    // If not a rejected action with a 401 status, pass it through
    if (
      !isRejectedWithValue(action) || 
      !action.payload || 
      typeof action.payload !== 'object' ||
      !('status' in action.payload) ||
      action.payload.status !== 401
    ) {
      return next(action);
    }

    const { dispatch, getState } = api;
    const state = getState();
    const { auth } = state as { auth: { isAuthenticated: boolean, accessToken: string | null } };

    // If we've exceeded maximum refresh attempts, log out
    if (failedRefreshAttempts >= MAX_REFRESH_ATTEMPTS) {
      dispatch(clearCredentials());
      failedRefreshAttempts = 0;
      console.error('Maximum refresh attempts exceeded. Please log in again.');
      return next(action);
    }

    // If already refreshing, queue this request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        pendingRequests.push({ resolve, reject, action });
      });
    }

    // Start refreshing
    isRefreshing = true;

    const originalRequest = action.meta?.arg;

    // If the user is authenticated, try to refresh the token
    // if (auth.isAuthenticated && auth.accessToken) {
    //   return new Promise(async (resolve, reject) => {
    //     try {
    //       // Using dispatch with the thunk action
    //       const result = await dispatch(authApi.endpoints.refresh);
    //       const refreshResult = await (result as any).unwrap();
          
    //       // Update the token in the store
    //       dispatch(updateAccessToken({ accessToken: refreshResult.accessToken }));
    //       failedRefreshAttempts = 0;
          
    //       // Process all pending requests
    //       pendingRequests.forEach(({ resolve, action }) => {
    //         // Re-dispatch the original actions
    //         const result = dispatch(action.meta.arg);
    //         resolve(result);
    //       });
    //       pendingRequests.length = 0;
          
    //       // Retry the original request that triggered the refresh
    //       if (originalRequest && typeof originalRequest === 'object' && 'type' in originalRequest) {
    //         const result = dispatch(originalRequest as AnyAction);
    //         resolve(result);
    //       } else {
    //         resolve(next(action));
    //       }
    //     } catch (error) {
    //       // Increment failed attempts
    //       failedRefreshAttempts += 1;
          
    //       // Failed to refresh, log out
    //       dispatch(clearCredentials());
          
    //       // Reject all pending requests
    //       pendingRequests.forEach(({ reject }) => {
    //         reject({ message: 'Authentication failed' });
    //       });
    //       pendingRequests.length = 0;
          
    //       reject({ message: 'Authentication failed' });
    //     }
    //   });
    // }

  // If not authenticated, just pass through
  dispatch(clearCredentials());
  return next(action);
};
