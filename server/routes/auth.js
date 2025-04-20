const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const db = require('../db');

// Secret key for JWT - should be in environment variables in production
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret_key';

if (JWT_SECRET === 'your_jwt_secret_key') {
    console.warn('⚠️ Warning: Using default JWT secret. Set JWT_SECRET in environment variables for production.');
}

/**
 * @route   POST /register
 * @desc    Register a new user
 * @access  Public
 */
router.post(
    '/register',
    [
        body('username').not().isEmpty().withMessage('Username is required'),
        body('email').isEmail().withMessage('Please include a valid email'),
        body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, email, password } = req.body;

        try {
            const existingUser = await db.get('SELECT * FROM users WHERE username = ? OR email = ?', [username, email]);
            if (existingUser) {
                return res.status(400).json({ error: 'Username or email already exists' });
            }

            const hashedPassword = await bcrypt.hash(password, 10);
            await db.run(
                'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
                [username, email, hashedPassword]
            );

            res.status(201).json({ success: true, message: 'Registration successful' });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

/**
 * @route   POST /login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post(
    '/login',
    [
        body('username').not().isEmpty().withMessage('Username is required'),
        body('password').not().isEmpty().withMessage('Password is required')
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ error: errors.array()[0].msg });
        }

        const { username, password } = req.body;

        try {
            // Check if user exists
            const user = await db.get('SELECT * FROM users WHERE username = ?', [username]);
            if (!user) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Verify password using bcrypt
            const isMatch = await bcrypt.compare(password, user.password_hash);
            if (!isMatch) {
                return res.status(400).json({ error: 'Invalid credentials' });
            }

            // Create and sign JWT token
            const payload = {
                id: user.id,
                username: user.username,
                role: user.role
            };

            jwt.sign(
                payload,
                JWT_SECRET,
                { expiresIn: '24h' },
                (err, token) => {
                    if (err) throw err;
                    res.json({
                        token,
                        id: user.id,
                        username: user.username,
                        role: user.role
                    });
                }
            );

            // Log activity
            await db.run(
                'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
                [user.id, 'account', 'User logged in']
            );
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ error: 'Server error' });
        }
    }
);

/**
 * @route   GET /verify-token
 * @desc    Verify if the token is valid
 * @access  Public
 */
router.get('/verify-token', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        res.json({ success: true, user: decoded });
    } catch (error) {
        console.error('Token verification error:', error);
        res.status(401).json({ success: false, message: 'Invalid or expired token' });
    }
});

/**
 * @route   POST /logout
 * @desc    Log user logout
 * @access  Private
 */
router.post('/logout', async (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
        return res.status(401).json({ success: false, message: 'No token provided' });
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        await db.run(
            'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
            [decoded.id, 'account', 'User logged out']
        );
        res.json({ success: true, message: 'Logout successful' });
    } catch (error) {
        console.error('Logout error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
});

module.exports = router;
