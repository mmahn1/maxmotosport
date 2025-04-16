const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const { sendVerificationEmail, sendAdminNotification } = require('../services/email-service');
const db = require('../api/database');

function generateVerificationToken() {
  return crypto.randomBytes(32).toString('hex');
}

router.post('/subscribe', async (req, res) => {
  console.log('Newsletter subscription request received:', req.body);
  
  try {
    const { email, name } = req.body;
    
    if (!email) {
      console.log('Subscription rejected: No email provided');
      return res.status(400).json({
        success: false,
        message: 'Email address is required.'
      });
    }
    
    try {
      const columns = await db.query('SHOW COLUMNS FROM newsletter');
      const columnNames = columns.map(col => col.Field);
      
      if (!columnNames.includes('name')) {
        console.log('Adding missing name column');
        await db.query('ALTER TABLE newsletter ADD COLUMN name VARCHAR(255) AFTER id');
      }
      
      if (!columnNames.includes('verification_token')) {
        console.log('Adding missing verification_token column');
        await db.query('ALTER TABLE newsletter ADD COLUMN verification_token VARCHAR(255)');
      }
    } catch (structureError) {
      console.warn('Error checking table structure:', structureError);
    }
    
    const subscribers = await db.query(
      'SELECT * FROM newsletter WHERE email = ?', 
      [email]
    );
    
    const existingSubscriber = subscribers.length > 0 ? subscribers[0] : null;
    
    if (existingSubscriber && existingSubscriber.verified) {
      console.log(`Subscription rejected: Email ${email} is already verified`);
      return res.status(400).json({
        success: false,
        message: 'This email is already subscribed to our newsletter.'
      });
    }
    
    const verificationToken = generateVerificationToken();
    
    if (existingSubscriber) {
      console.log(`Updating existing subscriber: ${email}`);
      try {
        await db.query(
          'UPDATE newsletter SET name = ?, verification_token = ? WHERE id = ?',
          [name || '', verificationToken, existingSubscriber.id]
        );
      } catch (updateError) {
        console.warn('Update failed, trying simpler query:', updateError);
        await db.query(
          'UPDATE newsletter SET verification_token = ? WHERE id = ?',
          [verificationToken, existingSubscriber.id]
        );
      }
    } else {
      console.log(`Creating new subscriber: ${email}`);
      try {
        await db.query(
          'INSERT INTO newsletter (name, email, verified, verification_token) VALUES (?, ?, ?, ?)',
          [name || '', email, false, verificationToken]
        );
      } catch (insertError) {
        console.warn('Insert failed, trying simpler query:', insertError);
        await db.query(
          'INSERT INTO newsletter (email, verified) VALUES (?, ?)',
          [email, false]
        );
        
        const [newSubscriber] = await db.query('SELECT * FROM newsletter WHERE email = ?', [email]);
        if (newSubscriber) {
          await db.query(
            'UPDATE newsletter SET verification_token = ? WHERE id = ?',
            [verificationToken, newSubscriber.id]
          );
        }
      }
    }
    
    console.log(`Sending verification email to: ${email}`);
    await sendVerificationEmail({
      name: name || '',
      email: email,
      verificationToken: verificationToken
    });
    
    console.log('Sending admin notification');
    await sendAdminNotification({
      name: name || '',
      email: email
    });
    
    console.log(`Subscription process completed successfully for: ${email}`);
    res.status(200).json({
      success: true,
      message: 'Please check your email to verify your subscription.'
    });
  } catch (error) {
    console.error('Newsletter subscription error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process your subscription request.'
    });
  }
});

router.get('/verify/:token', async (req, res) => {
  console.log(`Verification request received for token: ${req.params.token}`);
  
  try {
    const { token } = req.params;
    
    const subscribers = await db.query(
      'SELECT * FROM newsletter WHERE verification_token = ?', 
      [token]
    );
    
    if (subscribers.length === 0) {
      console.log('Verification failed: Invalid token');
      return res.status(400).send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Invalid Verification Link</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .error { color: #d9534f; }
            .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-top: 30px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="error">Invalid Verification Link</h2>
            <p>The verification link is invalid or has expired.</p>
            <p>Please try subscribing again or contact support if you continue to experience issues.</p>
          </div>
        </body>
        </html>
      `);
    }
    
    const subscriber = subscribers[0];
    
    if (subscriber.verified) {
      console.log(`Email ${subscriber.email} is already verified`);
      return res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Already Verified</title>
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
            .info { color: #5bc0de; }
            .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-top: 30px; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
          </style>
        </head>
        <body>
          <div class="container">
            <h2 class="info">Email Already Verified</h2>
            <p>Your email address has already been verified and added to our newsletter list.</p>
            <a href="/" class="button">Return to Homepage</a>
          </div>
        </body>
        </html>
      `);
    }
    
    console.log(`Verifying email: ${subscriber.email}`);
    
    try {
      await db.query(
        'UPDATE newsletter SET verified = TRUE, verified_at = NOW() WHERE id = ?',
        [subscriber.id]
      );
      
      const checkUpdate = await db.query(
        'SELECT verified FROM newsletter WHERE id = ?',
        [subscriber.id]
      );
      
      if (!checkUpdate[0]?.verified) {
        console.log(`Warning: Update verification failed for ${subscriber.email}`);
        throw new Error('Verification update did not persist');
      }
      
      console.log(`Email ${subscriber.email} has been verified successfully`);
    } catch (dbError) {
      console.error('Database error during verification:', dbError);
      throw dbError;
    }
    
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Email Verified</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .success { color: #5cb85c; }
          .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-top: 30px; }
          .button { display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="success">Email Verified Successfully!</h2>
          <p>Thank you for verifying your email address. You have been added to our newsletter.</p>
          <a href="/" class="button">Return to Homepage</a>
        </div>
      </body>
      </html>
    `);
    
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Verification Error</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; max-width: 600px; margin: 0 auto; padding: 20px; text-align: center; }
          .error { color: #d9534f; }
          .container { border: 1px solid #ddd; border-radius: 5px; padding: 20px; margin-top: 30px; }
        </style>
      </head>
      <body>
        <div class="container">
          <h2 class="error">Verification Failed</h2>
          <p>We encountered an error while verifying your email. Please try again later.</p>
        </div>
      </body>
      </html>
    `);
  }
});

router.get('/check/:email', async (req, res) => {
  const allowedIps = ['127.0.0.1', 'localhost', '::1'];
  const clientIp = req.ip || req.connection.remoteAddress;
  
  if (!allowedIps.includes(clientIp) && !clientIp.startsWith('192.168.')) {
    return res.status(403).json({
      success: false,
      message: 'Unauthorized access'
    });
  }
  
  try {
    const { email } = req.params;
    
    if (!email) {
      return res.status(400).json({
        success: false,
        message: 'Email parameter is required'
      });
    }
    
    const subscribers = await db.query(
      'SELECT * FROM newsletter WHERE email = ?',
      [email]
    );
    
    if (subscribers.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Email not found in database'
      });
    }
    
    const subscriber = subscribers[0];
    
    return res.json({
      success: true,
      subscriber: {
        id: subscriber.id,
        email: subscriber.email,
        name: subscriber.name || null,
        verified: Boolean(subscriber.verified),
        subscribed_at: subscriber.subscribed_at,
        verified_at: subscriber.verified_at,
        has_token: Boolean(subscriber.verification_token)
      }
    });
  } catch (error) {
    console.error('Error checking subscriber:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error while checking subscriber'
    });
  }
});

module.exports = router;
