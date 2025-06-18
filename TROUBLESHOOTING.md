# Fixing "auth/login 400 (Bad Request)" Error

If you're encountering a `400 Bad Request` error when trying to call the `/auth/login` endpoint, here are steps to troubleshoot and fix the issue:

## 1. Check Request Payload Format

Make sure the request body is formatted correctly. The server expects:

```json
{
  "email": "user@example.com",
  "password": "yourpassword"
}
```

## 2. Verify Login Component Implementation

Make sure your Login component is sending the data in the correct format:

```typescript
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const userData = await login({ 
      email: username,  // Make sure this matches the expected "email" field
      password
    }).unwrap();
    dispatch(setCredentials(userData));
  } catch (err) {
    // Error handling
  }
};
```

## 3. Check Server Logs

Look at the authentication server logs to see what's coming in and if there are more specific error messages.

```bash
# In a terminal, run:
node auth-server.js
```

Then check the console output when you attempt to log in.

## 4. Verify CORS Configuration

Ensure CORS is properly configured if your client and server are on different domains/ports.

## 5. Test API Directly

Use a tool like curl or Postman to test the API directly:

```bash
curl -X POST http://localhost:5000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

## 6. Debug Network Requests

In your browser's developer tools:
1. Open the Network tab
2. Attempt the login
3. Find the failing request
4. Check the request payload and response

## 7. Common Causes of 400 Bad Request

- Missing required fields in the request body
- Incorrect field names (e.g., using "username" instead of "email")
- Invalid JSON format
- Content-Type header missing or incorrect
- Validation errors (e.g., email format, password requirements)

## 8. Server-Side Validation

If you have access to the server code, check for any validation logic that might be rejecting the request.

## Solution Using Our Test Server

Our included test server expects:
- Email: `user@example.com`
- Password: `password123`

If you're using the demo authentication server provided, make sure to:

1. Start the server: `npm run start:auth-server`
2. Use the correct credentials in the login form
3. Check that your client code is sending the payload with the expected field names

For any persistent issues, check the browser console and server logs for more specific error messages.
