const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const bcrypt = require('bcrypt');
const db = require('../db');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

/**
 * @route   GET /api/user/profile
 * @desc    Get user profile
 * @access  Private
 */
router.get('/profile', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const profile = await db.get(
      'SELECT id, username, email, full_name, phone, created_at FROM users WHERE id = ?',
      [userId]
    );
    
    if (!profile) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, profile });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/user/profile
 * @desc    Update user profile
 * @access  Private
 */
router.put(
  '/profile',
  [
    auth,
    body('email').isEmail().withMessage('Please include a valid email'),
    body('full_name').optional().isString(),
    body('phone').optional().isString()
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const userId = req.user.id;
    const { email, full_name, phone } = req.body;

    try {
      // Check if email already exists for another user
      const existingEmail = await db.get('SELECT id FROM users WHERE email = ? AND id != ?', [email, userId]);
      if (existingEmail) {
        return res.status(400).json({ success: false, message: 'Email already in use' });
      }
      
      // Update profile
      await db.run(
        'UPDATE users SET email = ?, full_name = ?, phone = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [email, full_name || null, phone || null, userId]
      );
      
      // Log activity
      await db.run(
        'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
        [userId, 'account', 'Updated profile information']
      );
      
      res.json({ success: true, message: 'Profile updated successfully' });
    } catch (error) {
      console.error('Error updating profile:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   PUT /api/user/password
 * @desc    Change user password
 * @access  Private
 */
router.put(
  '/password',
  [
    auth,
    body('current_password').not().isEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters long')
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const userId = req.user.id;
    const { current_password, new_password } = req.body;

    try {
      // Get user with password
      const user = await db.get('SELECT password_hash FROM users WHERE id = ?', [userId]);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }
      
      // Verify current password
      const isMatch = await bcrypt.compare(current_password, user.password_hash);
      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Current password is incorrect' });
      }
      
      // Hash new password
      const salt = await bcrypt.genSalt(10);
      const newPasswordHash = await bcrypt.hash(new_password, salt);
      
      // Update password
      await db.run(
        'UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newPasswordHash, userId]
      );
      
      // Log activity
      await db.run(
        'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
        [userId, 'account', 'Changed password']
      );
      
      res.json({ success: true, message: 'Password changed successfully' });
    } catch (error) {
      console.error('Error changing password:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/user/activity
 * @desc    Get user activity history
 * @access  Private
 */
router.get('/activity', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const activities = await db.all(
      'SELECT activity_type, description, timestamp FROM user_activity WHERE user_id = ? ORDER BY timestamp DESC LIMIT 10',
      [userId]
    );
    
    res.json({ success: true, activities });
  } catch (error) {
    console.error('Error fetching user activity:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Admin
 */
router.get('/', [auth, adminCheck], async (req, res) => {
  try {
    const users = await db.all(
      'SELECT id, username, email, role, full_name, phone, created_at FROM users ORDER BY created_at DESC'
    );
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
