const jwt = require('jsonwebtoken');

// Secret key for JWT - should match the one in server.js
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key'; // Ensure consistency with server.js

/**
 * Authentication middleware
 * Verifies JWT token and adds user info to request object
 */
module.exports = function (req, res, next) {
    // Get token from Authorization header
    let token = req.header('Authorization')?.replace('Bearer ', '');

    // If no token in header, check request body for token
    if (!token && req.body && req.body.token) {
        token = req.body.token;
    }

    // If no token found, return an error
    if (!token) {
        console.error("❌ No authentication token found");
        return res.status(401).json({ success: false, message: 'No authentication token found' });
    }

    // Verify the token
    try {
        const decoded = jwt.verify(token, JWT_SECRET);

        // Attach user data to the request object
        req.user = {
            id: decoded.id,
            username: decoded.username,
            role: decoded.role
        };

        console.log("✅ Token verified successfully:", req.user);
        next();
    } catch (err) {
        console.error("❌ Token verification failed:", err.message);
        res.status(401).json({ success: false, message: 'Invalid or expired authentication token' });
    }
};
