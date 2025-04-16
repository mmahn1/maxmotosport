const jwt = require('jsonwebtoken');

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'secretkey'; // IMPORTANT: Match the key in server.js

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request object
 */
module.exports = function(req, res, next) {
  // Get token from header, localStorage, or session
  let token = req.header('Authorization')?.replace('Bearer ', '');
  
  // If no token in header, check request body for token
  if (!token && req.body && req.body.token) {
    token = req.body.token;
  }
  
  // If still no token and user info is in session, create token
  if (!token && req.session && req.session.user) {
    const payload = {
      id: req.session.user.id,
      username: req.session.user.username,
      role: req.session.user.role
    };
    token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
  }

  // Check if no token found at all
  if (!token) {
    return res.status(401).json({ success: false, message: 'No authentication token found' });
  }

  // Verify token
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Make user data available on request object
    req.user = {
      id: decoded.id || decoded.user?.id,
      username: decoded.username || decoded.user?.username,
      role: decoded.role || decoded.user?.role
    };
    
    next();
  } catch (err) {
    console.error('Token verification failed:', err.message);
    res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
  }
};
