# Authentication Session Persistence

This document explains how authentication session persistence works in this application.

## Overview

The authentication system maintains session persistence across page reloads and browser restarts using a combination of:

1. **HTTP-only cookies** for secure refresh token storage
2. **Redux state** for access tokens during the session
3. **Redux Persist** for improved user experience

## How It Works

### Authentication Flow

1. **Login**: When a user logs in successfully, the server:
   - Provides an access token that's stored in Redux state (in-memory only)
   - Sets a secure HTTP-only cookie containing the refresh token

2. **Page Refresh**: When the user refreshes the page:
   - Redux state is lost (including the access token)
   - The `AuthInitializer` component automatically attempts to refresh the token
   - The server receives the HTTP-only refresh token cookie
   - If valid, the server issues a new access token
   - Redux state is rehydrated with the new access token

3. **Redux Persist**:
   - Only persists user data (not tokens) for a better UX
   - This lets the UI know a user was previously authenticated
   - The actual authentication happens through the refresh token cookie

### Security Considerations

- **Access tokens** are short-lived (15 minutes) and stored only in memory
- **Refresh tokens** are stored in HTTP-only cookies that can't be accessed by JavaScript
- Using HTTP-only cookies protects against XSS attacks
- Token refresh happens automatically when needed

## Troubleshooting

If you're experiencing issues with session persistence:

1. **Check browser cookies**: Make sure cookies are not being blocked
2. **Server CORS**: Ensure the server has proper CORS settings for cookies:
   ```javascript
   app.use(cors({
     origin: 'http://localhost:3000',
     credentials: true
   }));
   ```
   
3. **API Requests**: Make sure all API requests include `credentials: 'include'`
4. **Refresh tokens**: Make sure the refresh token endpoint is working correctly

## Local Development

For local development, the sameSite cookie property is set to 'lax' instead of 'strict' to allow for easier testing. In production, this should be changed to 'strict' for better security.
