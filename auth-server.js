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
    email: 'user@example.com', 
    password: 'password123',
    name: 'Test User'
  }
];

// Auth endpoints
app.post('/auth/login', (req, res) => {
  console.log('Login request received:', req.body);

  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = users.find(u => u.email === email);
  
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
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
  });

  // Send response with access token and user data
  res.json({
    accessToken,
    user: {
      id: user.id,
      email: user.email,
      name: user.name
    }
  });
});

app.post('/auth/refresh', (req, res) => {
  const refreshToken = req.cookies.refreshToken;
  
  if (!refreshToken) {
    return res.status(401).json({ message: 'Refresh token required' });
  }
  
  try {
    // Verify refresh token
    const decoded = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
    const userId = decoded.userId;
    
    // Find the user
    const user = users.find(u => u.id === userId);
    
    if (!user) {
      return res.status(403).json({ message: 'Invalid refresh token' });
    }
    
    // Generate new access token
    const accessToken = jwt.sign({ userId }, ACCESS_TOKEN_SECRET, { expiresIn: '15m' });
    
    res.json({ accessToken });
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired refresh token' });
  }
});

app.post('/auth/logout', (req, res) => {
  // Clear refresh token cookie
  res.clearCookie('refreshToken');
  res.status(200).json({ message: 'Logged out successfully' });
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
      email: user.email,
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
  console.log(`Test credentials: email=user@example.com, password=password123`);
});
