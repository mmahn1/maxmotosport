const express = require('express');
const router = express.Router();
const db = require('../db');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

/**
 * @route   GET /api/users
 * @desc    Get all users (admin only)
 * @access  Admin
 */
router.get('/', [auth, adminCheck], async (req, res) => {
  try {
    const users = await db.all(`
      SELECT id, username, email, role, full_name, phone, created_at 
      FROM users 
      ORDER BY created_at DESC
    `);
    
    res.json({ success: true, users });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/users/:id
 * @desc    Get specific user (admin only)
 * @access  Admin
 */
router.get('/:id', [auth, adminCheck], async (req, res) => {
  try {
    const user = await db.get(`
      SELECT id, username, email, role, full_name, phone, created_at 
      FROM users 
      WHERE id = ?
    `, [req.params.id]);
    
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    res.json({ success: true, user });
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   PUT /api/users/:id
 * @desc    Update user (admin only)
 * @access  Admin
 */
router.put('/:id', [auth, adminCheck], async (req, res) => {
  try {
    const { username, email, role, full_name, phone } = req.body;
    
    // Make sure at least some fields were provided
    if (!username && !email && !role && !full_name && !phone) {
      return res.status(400).json({ success: false, message: 'No fields to update' });
    }
    
    // First check if user exists
    const existingUser = await db.get('SELECT id FROM users WHERE id = ?', [req.params.id]);
    if (!existingUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Update user fields
    await db.run(`
      UPDATE users 
      SET username = COALESCE(?, username),
          email = COALESCE(?, email),
          role = COALESCE(?, role),
          full_name = COALESCE(?, full_name),
          phone = COALESCE(?, phone),
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `, [username, email, role, full_name, phone, req.params.id]);
    
    res.json({ success: true, message: 'User updated successfully' });
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
