const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const nodemailer = require('nodemailer');
const validator = require('validator');

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER || "root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME || "max_motosport",
    port: process.env.DB_PORT || 3306
});

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER || 'maxmotosport.shop@gmail.com',
        pass: process.env.EMAIL_PASSWORD
    },
    
    debug: false, 
    logger: false
});

transporter.verify(function(error, success) {
    if (error) {
        console.error('Email transporter error:', error);
    } else {
        console.log('Email server is ready');
    }
});

router.post('/subscribe', (req, res) => {
    const { email } = req.body;
    
    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({ 
            success: false, 
            message: 'Please provide a valid email address' 
        });
    }

    db.ping((err) => {
        if (err) {
            console.error('Database connection error:', err);
            return res.status(500).json({
                success: false,
                message: 'Database connection error'
            });
        }
    });
    
    db.query("SHOW TABLES LIKE 'newsletter'", (err, results) => {
        if (err) {
            console.error('Error checking table:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking database structure'
            });
        }
        
        if (results.length === 0) {
            console.error('Newsletter table does not exist');
            const createTableSQL = `
                CREATE TABLE newsletter (
                    id INT AUTO_INCREMENT PRIMARY KEY,
                    email VARCHAR(255) UNIQUE NOT NULL,
                    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `;
            
            db.query(createTableSQL, (createErr) => {
                if (createErr) {
                    console.error('Error creating newsletter table:', createErr);
                    return res.status(500).json({
                        success: false,
                        message: 'Error creating database structure'
                    });
                }
                
                insertEmail(email, res);
            });
        } else {
            insertEmail(email, res);
        }
    });
});

function insertEmail(email, res) {
    db.query("DESCRIBE newsletter", (err, columns) => {
        if (err) {
            console.error('Error describing newsletter table:', err);
            return res.status(500).json({
                success: false,
                message: 'Error checking database structure'
            });
        }
        
        const hasEmailColumn = columns.some(col => col.Field === 'email');
        
        if (!hasEmailColumn) {
            console.error('Newsletter table is missing email column');
            return res.status(500).json({
                success: false,
                message: 'Database structure error'
            });
        }
        
        const query = 'INSERT INTO newsletter (email) VALUES (?) ON DUPLICATE KEY UPDATE subscribed_at = CURRENT_TIMESTAMP';
        
        db.query(query, [email], (err, result) => {
            if (err) {
                console.error('Database insert error:', err);
                return res.status(500).json({ 
                    success: false, 
                    message: 'An error occurred while subscribing' 
                });
            }
    
            res.status(200).json({ 
                success: true, 
                message: 'Successfully subscribed to the newsletter!' 
            });
    
            sendSubscriptionEmails(email);
        });
    });
}

function sendSubscriptionEmails(email) {
    try {
        const adminMailOptions = {
            from: process.env.EMAIL_USER || 'maxmotosport.shop@gmail.com',
            to: process.env.EMAIL_USER || 'maxmotosport.shop@gmail.com',
            subject: 'New Newsletter Subscriber',
            text: `${email} has just subscribed.`
        };

        transporter.sendMail(adminMailOptions)
            .then(info => {
                console.log('Admin notification email sent successfully');
            })
            .catch(error => {
                console.error('Error sending admin notification:', error);
            });

        const userMailOptions = {
            from: process.env.EMAIL_USER || 'maxmotosport.shop@gmail.com',
            to: email,
            subject: 'Welcome to MaX Motosport Newsletter',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #ff0000;">Welcome to MaX Motosport!</h2>
                    <p>Thank you for subscribing to our newsletter. You'll now receive updates on:</p>
                    <ul>
                        <li>Exclusive deals and discounts</li>
                        <li>New model announcements</li>
                        <li>Motorsport news and events</li>
                    </ul>
                    <p>Stay tuned for exciting content!</p>
                    <p>Best regards,<br>The MaX Motosport Team</p>
                </div>
            `
        };

        transporter.sendMail(userMailOptions)
            .then(info => {
                console.log('User confirmation email sent successfully');
            })
            .catch(error => {
                console.error('Error sending confirmation email:', error);
            });
            
    } catch (emailError) {
        console.error('Error in email sending process:', emailError);
    }
}

router.get('/subscribers', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const query = 'SELECT email, subscribed_at FROM newsletter ORDER BY subscribed_at DESC';
    
    db.query(query, (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving subscribers' });
        }
        
        res.status(200).json({ 
            success: true, 
            subscribers: results 
        });
    });
});

router.post('/send', (req, res) => {
    if (!req.session.user || req.session.user.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Unauthorized' });
    }

    const { subject, content } = req.body;
    
    if (!subject || !content) {
        return res.status(400).json({ success: false, message: 'Subject and content are required' });
    }

    db.query('SELECT email FROM newsletter', (err, results) => {
        if (err) {
            console.error('Database error:', err);
            return res.status(500).json({ success: false, message: 'Error retrieving subscribers' });
        }

        if (results.length === 0) {
            return res.status(404).json({ success: false, message: 'No subscribers found' });
        }

        const emails = results.map(row => row.email);
        
        const mailOptions = {
            from: 'maxmotosport.shop@gmail.com',
            bcc: emails,
            subject: subject,
            html: content
        };

        transporter.sendMail(mailOptions, (mailErr) => {
            if (mailErr) {
                console.error('Error sending newsletter:', mailErr);
                return res.status(500).json({ success: false, message: 'Error sending newsletter' });
            }

            res.status(200).json({ 
                success: true, 
                message: `Newsletter sent successfully to ${emails.length} subscribers` 
            });
        });
    });
});

module.exports = router;
