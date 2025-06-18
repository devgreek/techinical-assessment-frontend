# Testing the Authentication System

This document provides instructions for testing the authentication system.

## Setup

1. Start both the React application and the authentication server:

```bash
npm run dev
```

This will start:
- React application on http://localhost:3000
- Authentication server on http://localhost:5000

## Test Credentials

To test the login functionality, use the following credentials:

- Email: `user@example.com`
- Password: `password123`

## Expected Behavior

1. When you log in with the correct credentials, you should:
   - Receive a JWT access token (stored in Redux state)
   - Be redirected to the Profile page
   - See the user profile data

2. If you use incorrect credentials, you should:
   - See an error message
   - Stay on the login page

3. Authentication state is persisted in Redux (not localStorage)

## API Endpoints

The authentication server provides the following endpoints:

- `POST /auth/login` - Authenticates user and returns access token
- `POST /auth/refresh` - Issues new access token using refresh token
- `POST /auth/logout` - Logs user out and clears authentication
- `GET /user/profile` - Protected endpoint that returns user data

## Common Issues

If you see a 400 Bad Request error:
- Verify that you're sending the correct payload format (email and password)
- Check the server logs for more details about the request

If you see a 401 Unauthorized error:
- Your access token may have expired
- The token refresh mechanism should handle this automatically

## Debugging

Check the browser console and server terminal for detailed error messages.
