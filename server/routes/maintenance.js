const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');

/**
 * @route   GET /api/maintenance/orders
 * @desc    Get all maintenance orders
 * @access  Admin
 */
router.get('/orders', auth, async (req, res) => {
  // Get query parameters for filtering
  const status = req.query.status;
  const date = req.query.date;
  
  try {
    // Build query with optional filters
    let query = 'SELECT * FROM maintenance_orders';
    const queryParams = [];
    
    // Only apply filters if provided
    const conditions = [];
    
    if (status && status !== 'all') {
      conditions.push('status = ?');
      queryParams.push(status);
    }
    
    if (date) {
      conditions.push('DATE(appointment_date) = ?');
      queryParams.push(date);
    }
    
    // Add WHERE clause if there are conditions
    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }
    
    // Add sorting
    query += ' ORDER BY appointment_date DESC';
    
    const orders = await db.all(query, queryParams);
    res.json({ success: true, orders });
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/maintenance/orders/:id
 * @desc    Get a specific maintenance order
 * @access  Admin
 */
router.get('/orders/:id', [auth, adminCheck], async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM maintenance_orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    res.json({ success: true, order });
  } catch (error) {
    console.error('Error fetching order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/maintenance/orders/:id/approve
 * @desc    Approve a maintenance order
 * @access  Admin
 */
router.post('/orders/:id/approve', [auth, adminCheck], async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM maintenance_orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be approved' });
    }
    await db.run('UPDATE maintenance_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['approved', req.params.id]);
    res.json({ success: true, message: 'Order approved successfully' });
  } catch (error) {
    console.error('Error approving order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/maintenance/orders/:id/reject
 * @desc    Reject a maintenance order
 * @access  Admin
 */
router.post('/orders/:id/reject', [auth, adminCheck], async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM maintenance_orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'Only pending orders can be rejected' });
    }
    await db.run('UPDATE maintenance_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['rejected', req.params.id]);
    res.json({ success: true, message: 'Order rejected successfully' });
  } catch (error) {
    console.error('Error rejecting order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/maintenance/orders/:id/complete
 * @desc    Mark a maintenance order as completed
 * @access  Admin
 */
router.post('/orders/:id/complete', [auth, adminCheck], async (req, res) => {
  try {
    const order = await db.get('SELECT * FROM maintenance_orders WHERE id = ?', [req.params.id]);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }
    if (order.status !== 'approved') {
      return res.status(400).json({ success: false, message: 'Only approved orders can be marked as completed' });
    }
    await db.run('UPDATE maintenance_orders SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?', ['completed', req.params.id]);
    res.json({ success: true, message: 'Order marked as completed successfully' });
  } catch (error) {
    console.error('Error completing order:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/maintenance/orders/:id/reschedule
 * @desc    Reschedule a maintenance order
 * @access  Admin
 */
router.post(
  '/orders/:id/reschedule',
  [
    auth,
    adminCheck,
    body('date').isDate().withMessage('Valid date is required'),
    body('time').matches(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/).withMessage('Valid time is required (HH:MM format)')
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { id } = req.params;
    const { date, time } = req.body;
    const adminId = req.user.id;

    try {
      // Check if order exists
      const order = await db.get('SELECT * FROM maintenance_orders WHERE id = ?', [id]);
      
      if (!order) {
        return res.status(404).json({ success: false, message: 'Order not found' });
      }
      
      if (order.status !== 'pending' && order.status !== 'approved') {
        return res.status(400).json({ 
          success: false, 
          message: `Cannot reschedule order that is ${order.status}` 
        });
      }
      
      // Format new appointment date
      const newAppointmentDate = `${date}T${time}:00`;
      
      // Check if the time slot is available (no other appointments within 1 hour)
      const appointmentTime = new Date(newAppointmentDate);
      const oneHourBefore = new Date(appointmentTime.getTime() - 60 * 60 * 1000);
      const oneHourAfter = new Date(appointmentTime.getTime() + 60 * 60 * 1000);
      
      const existingAppointment = await db.get(
        `SELECT * FROM maintenance_orders 
        WHERE id != ? 
        AND appointment_date BETWEEN ? AND ?
        AND status != 'rejected'
        AND status != 'canceled'`,
        [id, oneHourBefore.toISOString(), oneHourAfter.toISOString()]
      );
      
      if (existingAppointment) {
        return res.status(400).json({ 
          success: false, 
          message: 'This time slot is already booked. Please select another time.' 
        });
      }
      
      // Add admin note about the reschedule
      let adminNotes = order.admin_notes || '';
      const rescheduleNote = `[${new Date().toLocaleString()}] Rescheduled from ${new Date(order.appointment_date).toLocaleString()} to ${newAppointmentDate}.`;
      
      if (adminNotes) {
        adminNotes += '\n\n' + rescheduleNote;
      } else {
        adminNotes = rescheduleNote;
      }
      
      // Update order with new appointment date
      await db.run(
        'UPDATE maintenance_orders SET appointment_date = ?, admin_notes = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
        [newAppointmentDate, adminNotes, id]
      );
      
      // Log admin activity
      await db.run(
        'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
        [adminId, 'maintenance', `Rescheduled maintenance order #${id}`]
      );
      
      // Notify customer about reschedule (could send email here)
      
      res.json({ success: true, message: 'Order rescheduled successfully' });
    } catch (error) {
      console.error('Error rescheduling order:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

/**
 * @route   GET /api/maintenance/count
 * @desc    Get count of user's maintenance orders
 * @access  Private
 */
router.get('/count', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await db.get(
      'SELECT COUNT(*) as count FROM maintenance_orders WHERE user_id = ?',
      [userId]
    );
    
    res.json({ success: true, count: result ? result.count : 0 });
  } catch (error) {
    console.error('Error fetching maintenance count:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/maintenance/history
 * @desc    Get user's maintenance history
 * @access  Private
 */
router.get('/history', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const history = await db.all(
      'SELECT * FROM maintenance_orders WHERE user_id = ? ORDER BY appointment_date DESC',
      [userId]
    );
    
    res.json({ success: true, history });
  } catch (error) {
    console.error('Error fetching maintenance history:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/maintenance/schedule
 * @desc    Schedule new maintenance order
 * @access  Private
 */
router.post('/schedule', [
  auth,
  body('service_type').not().isEmpty().withMessage('Service type is required'),
  body('vehicle_info').not().isEmpty().withMessage('Vehicle information is required'),
  body('appointment_date').isISO8601().withMessage('Valid appointment date is required')
], async (req, res) => {
  // Validate request
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, message: errors.array()[0].msg });
  }

  const { service_type, vehicle_info, appointment_date, notes } = req.body;
  const userId = req.user.id;

  try {
    // Get user info
    const user = await db.get('SELECT username, full_name, phone FROM users WHERE id = ?', [userId]);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Use full_name if available, otherwise username
    const customerName = user.full_name || user.username;

    // Insert maintenance order
    const result = await db.run(
      `INSERT INTO maintenance_orders 
      (user_id, customer_name, phone, service_type, vehicle_info, appointment_date, status, notes)
      VALUES (?, ?, ?, ?, ?, ?, 'pending', ?)`,
      [userId, customerName, user.phone || '', service_type, vehicle_info, appointment_date, notes || '']
    );

    // Log activity
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [userId, 'maintenance', `Scheduled ${service_type} maintenance service`]
    );

    res.json({ 
      success: true, 
      message: 'Maintenance service scheduled successfully',
      orderId: result.lastID
    });
  } catch (error) {
    console.error('Error scheduling maintenance:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

module.exports = router;