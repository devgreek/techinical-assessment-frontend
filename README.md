Techinal Assessment Frontend

Login details

username: testuser
password: password123

This starter includes:

 - 📦 A Webpack build for renderer client code
 - ⚡ Support for hot module reloading and safe boilerplate
 - 🎨 CSS modules support
 - 🔐 Secure authentication implementation with Redux

### Authentication Implementation

This project includes a secure authentication system built with Redux Toolkit and RTK Query, with the following features:

- **Secure Token Storage:**
  - Access tokens are stored in Redux state only, never in localStorage
  - This provides security against XSS attacks while maintaining user session state

- **Automatic Auth Header Injection:**
  - Authorization headers (`Bearer <token>`) are automatically injected via the `prepareHeaders` configuration
  - Ensures all API requests include authentication when a token is available

- **401 Response Handling Middleware:**
  - Intercepts 401 (Unauthorized) responses
  - Automatically triggers token refresh when authentication fails
  - Retries the original request with the new token after successful refresh
  - Forces logout if refresh fails, maintaining security

- **Protected Routes:**
  - Demonstrates a `/profile` protected component that fetches user data
  - Prevents unauthorized access to protected content
  - Shows proper UI feedback during loading/error states

- **Clear Separation of Concerns:**
  - Auth API slice handles authentication endpoints
  - Auth slice manages state
  - Auth middleware handles refresh logic
  - Components use authentication state appropriately

### Running this Sample

 1. `cd notebook-renderer-react-sample`
 1. `code-insiders .`: Open the folder in VS Code Insiders
 1. Hit `F5` to build+debug

### Structure

A Notebook Renderer consists of code that runs in the VS Code Extension Host (Node.js), which registers the renderer and passes data into the UI code running inside a WebView (Browser/DOM).

This uses TypeScript project references. There are three projects in the `src` directory:

 - `extension` contains the code running in Node.js extension host. It's compiled with `tsc`.
 - `client` is the UI code, built by Webpack, with access to the DOM.
 - `common` contains code shared between the extension and client.

When you run `watch`, `compile`, or `dev`, we invoke both `tsc` and `webpack` to compile the extension and the client portion of the code.

### Authentication Code Structure

The authentication system is organized as follows:

- **API Layer** (`/src/client/api/authApi.ts`):
  - Defines API endpoints for authentication operations (login, refresh, logout)
  - Uses RTK Query for data fetching and caching
  - Configures authentication headers injection

- **State Management** (`/src/client/features/auth/authSlice.ts`):
  - Redux slice for managing authentication state
  - Stores access token securely in memory (Redux store)
  - Provides actions for updating auth state
  - Exposes selectors for accessing authentication state

- **Auth Middleware** (`/src/client/middleware/authMiddleware.ts`):
  - Intercepts 401 unauthorized responses
  - Handles token refresh process
  - Manages retrying failed requests
  - Prevents infinite refresh loops
  - Forces logout when refresh fails

- **Types** (`/src/client/types/auth.ts`):
  - TypeScript interfaces for authentication data
  - Login request/response types
  - Token response types
  - User data types

- **Protected Components** (`/src/client/components/Profile.tsx`):
  - Example of fetching data in a protected component
  - Uses authentication state to control rendering
  - Handles loading and error states

- **Login Component** (`/src/client/components/Login.tsx`):
  - Handles user authentication
  - Dispatches credentials to Redux state
  - Shows appropriate error messages

- **Redux Store** (`/src/client/store.ts`):
  - Configures Redux store with auth reducer
  - Registers auth API and middleware

### Implementation Code Examples

#### RTK Query Authentication API

```typescript
// src/client/api/authApi.ts
export const authApi = createApi({
  reducerPath: 'authApi',
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) {
        headers.set('Authorization', `Bearer ${token}`);
      }
      return headers;
    },
  }),
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponse, LoginRequest>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),
    signup: builder.mutation<LoginResponse, SignupRequest>({
      query: (credentials) => ({
        url: '/auth/signup',
        method: 'POST',
        body: credentials,
      }),
    }),
    refresh: builder.mutation<AccessTokenResponse, void>({
      query: () => ({
        url: '/auth/refresh',
        method: 'POST',
        // The refresh token is sent in the cookie by the browser
      }),
    }),
    logout: builder.mutation<void, void>({
      query: () => ({
        url: '/auth/logout',
        method: 'POST',
      }),
    }),
    getUserData: builder.query<UserData, void>({
      query: () => '/user/profile',
    }),
  }),
});
```

#### Authentication Middleware

```typescript
// src/client/middleware/authMiddleware.ts
export const authMiddleware: Middleware = 
  (api: MiddlewareAPI) => (next: Dispatch<AnyAction>) => (action: AnyAction) => {
    // Handle the rejected action from RTK Query
    if (isRejectedWithValue(action) && action.payload?.status === 401) {
      const state = api.getState() as RootState;
      
      // Only attempt refresh if we're authenticated and not already refreshing
      if (state.auth.accessToken && !state.auth.isRefreshing) {
        // Set refreshing flag
        api.dispatch(authSlice.actions.setRefreshing(true));
        
        // Store the original action to retry later
        const originalAction = action.meta.arg.originalArgs;
        const endpoint = action.meta.arg.endpointName;
        
        // Attempt to refresh the token
        api.dispatch(authApi.endpoints.refresh.initiate())
          .unwrap()
          .then((refreshResult) => {
            // Token refresh succeeded, update the token
            api.dispatch(authSlice.actions.updateAccessToken(refreshResult));
            
            // Retry the original request
            if (originalAction && endpoint) {
              api.dispatch(api.dispatch(action.meta.arg.originalArgs));
            }
          })
          .catch(() => {
            // Refresh failed, log the user out
            api.dispatch(authSlice.actions.clearCredentials());
          })
          .finally(() => {
            api.dispatch(authSlice.actions.setRefreshing(false));
          });
      }
    }
    
    return next(action);
  };
```

#### Sign Up Component

```tsx
// src/client/components/SignUp.tsx
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useSignupMutation } from '../api/authApi';
import { setCredentials, setAuthError } from '../features/auth/authSlice';

const SignUp: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [signup, { isLoading }] = useSignupMutation();
  const dispatch = useDispatch();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const userData = await signup({ email, password, name }).unwrap();
      dispatch(setCredentials(userData));
    } catch (err: any) {
      setError(err.data?.message || 'Sign up failed');
      dispatch(setAuthError(err.data?.message || 'Sign up failed'));
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Name" required />
      <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" required />
      <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Password" required />
      <button type="submit" disabled={isLoading}>Sign Up</button>
      {error && <div className="error">{error}</div>}
    </form>
  );
};
```

### Server Implementation Considerations

For the authentication system to work properly, the backend server should implement:

1. **JWT Token Issuance:**
   - Issue short-lived access tokens (e.g., 15 minutes)
   - Issue longer-lived HTTP-only, secure, SameSite refresh tokens
   - Include appropriate user claims in the tokens

2. **Token Refresh Endpoint:**
   - Validate the refresh token from the cookie
   - Issue a new access token
   - Consider implementing refresh token rotation for enhanced security

3. **CORS Configuration:**
   - Configure CORS to allow requests from the notebook renderer origin
   - Ensure `credentials: 'include'` works by setting `Access-Control-Allow-Credentials: true`
   - Set appropriate `Access-Control-Allow-Origin` headers

4. **Token Validation:**
   - Validate JWT signatures (HS256 or RS256)
   - Check token expiration
   - Verify token claims and scopes

### Future Enhancements

Potential improvements to the authentication system include:

1. **Refresh Token Rotation:**
   - Implement single-use refresh tokens that generate a new refresh token with each use
   - Improves security by limiting the window of opportunity if a refresh token is compromised

2. **Integration with Notebook Context:**
   - Pass authentication state to the notebook renderer context
   - Allow notebook cells to access authenticated APIs

3. **Role-Based Access Control (RBAC):**
   - Add role claims to tokens
   - Implement permission checks in protected components

4. **Token Revocation:**
   - Add server-side token blacklist for immediate revocation
   - Implement a token revocation endpoint

5. **Security Improvements:**
   - Add fingerprinting to tokens to tie them to specific devices
   - Implement rate limiting for authentication attempts
   - Add multi-factor authentication support
