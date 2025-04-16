const express = require('express');
const router = express.Router();
const { body, validationResult } = require('express-validator');
const db = require('../db');
const auth = require('../middleware/auth');
const adminCheck = require('../middleware/adminCheck');
const nodemailer = require('nodemailer');

// Configure email transporter - should use environment variables in production
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.mailtrap.io',
  port: process.env.EMAIL_PORT || 2525,
  auth: {
    user: process.env.EMAIL_USER || 'your_mailtrap_username',
    pass: process.env.EMAIL_PASS || 'your_mailtrap_password'
  }
});

/**
 * @route   GET /api/newsletter/subscribers
 * @desc    Get all newsletter subscribers
 * @access  Admin
 */
router.get('/subscribers', [auth, adminCheck], async (req, res) => {
  try {
    const subscribers = await db.all('SELECT email, subscribed_at FROM newsletter_subscribers ORDER BY subscribed_at DESC');
    res.json({ success: true, subscribers });
  } catch (error) {
    console.error('Error fetching subscribers:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/newsletter/status
 * @desc    Check if user is subscribed to newsletter
 * @access  Private
 */
router.get('/status', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userEmail = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
    
    if (!userEmail) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    const subscriber = await db.get(
      'SELECT * FROM newsletter_subscribers WHERE email = ? OR user_id = ?',
      [userEmail.email, userId]
    );
    
    res.json({ 
      success: true, 
      subscribed: subscriber ? true : false 
    });
  } catch (error) {
    console.error('Error checking subscription status:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/newsletter/subscribe
 * @desc    Subscribe to newsletter
 * @access  Private
 */
router.post('/subscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userInfo = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
    
    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Check if already subscribed
    const existingSubscription = await db.get(
      'SELECT * FROM newsletter_subscribers WHERE email = ? OR user_id = ?',
      [userInfo.email, userId]
    );
    
    if (existingSubscription) {
      return res.json({ success: true, message: 'Already subscribed to newsletter' });
    }
    
    // Add subscription
    await db.run(
      'INSERT INTO newsletter_subscribers (email, user_id) VALUES (?, ?)',
      [userInfo.email, userId]
    );
    
    // Log activity
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [userId, 'newsletter', 'Subscribed to newsletter']
    );
    
    res.json({ success: true, message: 'Successfully subscribed to newsletter' });
  } catch (error) {
    console.error('Error subscribing to newsletter:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/newsletter/unsubscribe
 * @desc    Unsubscribe from newsletter
 * @access  Private
 */
router.post('/unsubscribe', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userInfo = await db.get('SELECT email FROM users WHERE id = ?', [userId]);
    
    if (!userInfo) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    
    // Delete subscription
    await db.run(
      'DELETE FROM newsletter_subscribers WHERE email = ? OR user_id = ?',
      [userInfo.email, userId]
    );
    
    // Log activity
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [userId, 'newsletter', 'Unsubscribed from newsletter']
    );
    
    res.json({ success: true, message: 'Successfully unsubscribed from newsletter' });
  } catch (error) {
    console.error('Error unsubscribing from newsletter:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/newsletter/archive
 * @desc    Get newsletter archive
 * @access  Private
 */
router.get('/archive', auth, async (req, res) => {
  try {
    const newsletters = await db.all(
      `SELECT id, subject, sent_date 
       FROM newsletter_archive 
       ORDER BY sent_date DESC 
       LIMIT 10`
    );
    
    res.json({ success: true, newsletters });
  } catch (error) {
    console.error('Error fetching newsletter archive:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   GET /api/newsletter/view/:id
 * @desc    View a specific newsletter
 * @access  Private
 */
router.get('/view/:id', auth, async (req, res) => {
  try {
    const newsletterId = req.params.id;
    const newsletter = await db.get(
      'SELECT * FROM newsletter_archive WHERE id = ?',
      [newsletterId]
    );
    
    if (!newsletter) {
      return res.status(404).json({ success: false, message: 'Newsletter not found' });
    }
    
    res.json({ success: true, newsletter });
  } catch (error) {
    console.error('Error fetching newsletter:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
});

/**
 * @route   POST /api/newsletter/send
 * @desc    Send newsletter to all subscribers
 * @access  Admin
 */
router.post(
  '/send',
  [
    auth,
    adminCheck,
    body('subject').not().isEmpty().withMessage('Subject is required'),
    body('content').not().isEmpty().withMessage('Content is required')
  ],
  async (req, res) => {
    // Validate request data
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, message: errors.array()[0].msg });
    }

    const { subject, content } = req.body;
    const adminId = req.user.id;

    try {
      // Get all subscribers
      const subscribers = await db.all('SELECT email FROM newsletter_subscribers');
      
      if (subscribers.length === 0) {
        return res.status(400).json({ success: false, message: 'No subscribers to send newsletter to' });
      }
      
      // Store newsletter in archive
      const result = await db.run(
        'INSERT INTO newsletter_archive (subject, content, sent_by) VALUES (?, ?, ?)',
        [subject, content, adminId]
      );
      
      const newsletterId = result.lastID;
      
      // Send emails (in batches for large lists)
      const batchSize = 50;
      let successCount = 0;
      let failCount = 0;
      
      for (let i = 0; i < subscribers.length; i += batchSize) {
        const batch = subscribers.slice(i, i + batchSize);
        
        const emailPromises = batch.map(subscriber => {
          return new Promise(async (resolve) => {
            try {
              await transporter.sendMail({
                from: '"MaX Motosport" <newsletter@maxmotosport.com>',
                to: subscriber.email,
                subject: subject,
                html: content
              });
              successCount++;
              resolve();
            } catch (error) {
              console.error(`Failed to send email to ${subscriber.email}:`, error);
              failCount++;
              resolve();
            }
          });
        });
        
        await Promise.all(emailPromises);
      }
      
      // Log activity
      await db.run(
        'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
        [adminId, 'newsletter', `Sent newsletter "${subject}" to ${successCount} subscribers`]
      );
      
      res.json({
        success: true,
        message: `Newsletter sent successfully to ${successCount} subscribers. Failed: ${failCount}`,
        newsletterId
      });
    } catch (error) {
      console.error('Error sending newsletter:', error);
      res.status(500).json({ success: false, message: 'Server error' });
    }
  }
);

module.exports = router;
