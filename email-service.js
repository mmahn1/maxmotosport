const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

// Email configuration
const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'maxmotosport.shop@gmail.com',
    pass: 'gmir ejjf outo whkm'
  }
};

// Create transporter
const transporter = nodemailer.createTransport(emailConfig);

// Function to read and compile email template
function compileTemplate(templatePath, data) {
  try {
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    return template(data);
  } catch (error) {
    console.error(`Error compiling template from ${templatePath}:`, error);
    throw error;
  }
}

/**
 * Send admin notification email when someone subscribes
 * @param {Object} userData - The user data including username, email
 * @returns {Promise} - Promise representing the email sending operation
 */
async function sendAdminNotificationEmail(userData) {
  try {
    const templatePath = path.join(__dirname, 'test-email.html');
    const htmlToSend = compileTemplate(templatePath, {
      username: userData.username || userData.email,
      email: userData.email,
      regDate: new Date().toLocaleString()
    });

    const mailOptions = {
      from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
      to: 'mahnicen@gmail.com',
      subject: 'New Newsletter Subscription',
      html: htmlToSend
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Admin notification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending admin notification email:', error);
    throw error;
  }
}

/**
 * Send verification email to new subscriber
 * @param {Object} userData - The user data including username, email, and verification token
 * @returns {Promise} - Promise representing the email sending operation
 */
async function sendVerificationEmail(userData) {
  try {
    const templatePath = path.join(__dirname, 'verification-email.html');
    
    // Create verification link with correct URL
    // Change this to your actual domain in production
    const baseUrl = process.env.BASE_URL || 'http://localhost:3000';
    const verificationLink = `${baseUrl}/api/newsletter/verify/${userData.verificationToken}`;
    
    console.log('Verification link:', verificationLink); // Log for debugging
    
    // Generate template with data
    const htmlToSend = compileTemplate(templatePath, {
      username: userData.username || userData.email,
      verificationLink: verificationLink
    });

    // Create plain text version as fallback
    const plainText = `
Hello ${userData.username || userData.email},

Thank you for subscribing to the MaxMotoSport Shop newsletter. 

Please verify your email address by copying and pasting the following link in your browser:
${verificationLink}

If you did not request this subscription, you can safely ignore this email.

Best regards,
MaxMotoSport Shop

This is an automated message. Please do not reply to this email.
    `.trim();

    // Send email with both HTML and plain text options
    const mailOptions = {
      from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
      to: userData.email,
      subject: 'Verify Your Newsletter Subscription',
      text: plainText,  // Plain text version
      html: htmlToSend  // HTML version
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Verification email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending verification email:', error);
    throw error;
  }
}

module.exports = {
  sendAdminNotificationEmail,
  sendVerificationEmail
};
