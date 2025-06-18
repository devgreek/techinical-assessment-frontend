const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');

const app = express();
const PORT = process.env.PORT || 5000;

// Secret keys for JWT
const ACCESS_TOKEN_SECRET = 'access-token-secret';
const REFRESH_TOKEN_SECRET = 'refresh-token-secret';

// Middleware
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(bodyParser.json());
app.use(cookieParser());

// In-memory user database for testing
const users = [
  { 
    id: '1', 
    username: 'testuser', 
    password: 'password123',
    name: 'Test User'
  }
];

// Auth endpoints
app.post('/auth/login', (req, res) => {
  console.log('Login request received:', req.body);

  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required' });
  }

  const user = users.find(u => u.username === username);
  
  if (!user || user.password !== password) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  // Generate tokens
  const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  
  // Send refresh token as HTTP-only cookie
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax', // Use lax for local dev to allow redirects
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Log for debugging
  console.log('Login successful, tokens generated');

  // Send response with access token and user data
  res.json({
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  console.log('Refresh token request received', refreshToken ? 'with token' : 'without token');
  
  if (!refreshToken) {
    console.log('No refresh token in cookies');
    return res.status(401).json({ message: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;
    
    // Find the user
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      console.log('User not found for refresh token');
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    
    // Optional: Generate new refresh token (token rotation for better security)
    const newRefreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    
    // Update the refresh token cookie
    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    });
    
    console.log('Refresh successful, new tokens generated');
    
    // Return the new access token
    res.json({ accessToken });
  } catch (error) {
    console.log('Refresh token verification failed:', error.message);
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

app.post('/auth/logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
});

// Sign up endpoint
app.post('/auth/signup', (req, res) => {
  const { username, password, name } = req.body;
  if (!username || !password || !name) {
    return res.status(400).json({ message: 'Name, username, and password are required' });
  }
  if (users.find(u => u.username === username)) {
    return res.status(409).json({ message: 'Username already registered' });
  }
  const id = (users.length + 1).toString();
  const user = { id, username, password, name };
  users.push(user);
  // Generate tokens
  const accessToken = jwt.sign({ userId: user.id }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
  const refreshToken = jwt.sign({ userId: user.id }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000
  });
  res.json({
    accessToken,
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

// Protected route example
app.get('/user/profile', authenticateToken, (req, res) => {
  const user = users.find(u => u.id === req.user.userId);
  
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }
  
  res.json({
    user: {
      id: user.id,
      username: user.username,
      name: user.name
    }
  });
});

// Middleware to verify access token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Access token required' });
  }
  
  jwt.verify(token, ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      return res.status(401).json({ message: 'Invalid or expired token' });
    }
    
    req.user = user;
    next();
  });
}

// Serve static files (if needed)
app.use(express.static('public'));

// Start the server
app.listen(PORT, () => {
  console.log(`Auth server running on http://localhost:${PORT}`);
  console.log(`Test credentials: username=testuser, password=password123`);
});
