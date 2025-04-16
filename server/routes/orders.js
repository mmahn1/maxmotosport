const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');

/**
 * @route   GET /api/orders
 * @desc    Get all orders for a user
 * @access  Private
 */
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get orders
    const orders = await db.all(`
      SELECT o.order_id, o.order_date, o.status, o.total, o.shipping_address, o.payment_method
      FROM orders o
      WHERE o.user_id = ?
      ORDER BY o.order_date DESC
    `, [userId]);
    
    // Get order items for each order
    for (let order of orders) {
      const items = await db.all(`
        SELECT oi.*, p.name, pi.image_url as image
        FROM order_items oi
        JOIN products p ON oi.product_id = p.id
        LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
        WHERE oi.order_id = ?
      `, [order.order_id]);
      
      order.items = items;
    }
    
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/orders/count
 * @desc    Get count of user's orders
 * @access  Private
 */
router.get('/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    db.query('SELECT COUNT(*) AS orderCount FROM orders WHERE user_id = ?', [userId])
      .then(([rows]) => {
        res.json({ success: true, orderCount: rows[0].orderCount });
      })
      .catch(err => {
        console.error('Error fetching order count:', err);
        res.status(500).json({ success: false, message: 'Failed to fetch order count' });
      });
  } catch (error) {
    console.error('Error fetching order count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/orders/:id
 * @desc    Get a specific order
 * @access  Private
 */
router.get('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const orderId = req.params.id;
    
    // Get order
    const order = await db.get(`
      SELECT o.order_id, o.order_date, o.status, o.total, o.shipping_address, o.payment_method
      FROM orders o
      WHERE o.order_id = ? AND o.user_id = ?
    `, [orderId, userId]);
    
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    
    // Get order items
    const items = await db.all(`
      SELECT oi.*, p.name, pi.image_url as image
      FROM order_items oi
      JOIN products p ON oi.product_id = p.id
      LEFT JOIN product_images pi ON p.id = pi.product_id AND pi.is_primary = TRUE
      WHERE oi.order_id = ?
    `, [orderId]);
    
    order.items = items;
    
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;
