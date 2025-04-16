const nodemailer = require('nodemailer');
const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');

const emailConfig = {
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: 'maxmotosport.shop@gmail.com',
    pass: 'gmir ejjf outo whkm'
  }
};

const transporter = nodemailer.createTransport(emailConfig);

function compileEmailTemplate(templateName, data) {
  try {
    const templatePath = path.join(__dirname, '..', 'email-templates', `${templateName}.html`);
    console.log(`Loading template from: ${templatePath}`);
    
    const source = fs.readFileSync(templatePath, 'utf-8');
    const template = handlebars.compile(source);
    return template(data);
  } catch (error) {
    console.error(`Error compiling email template ${templateName}:`, error);
    throw error;
  }
}

/**
 * Send a verification email to a newsletter subscriber
 * @param {Object} data - Subscriber data (email, name, verificationToken)
 * @returns {Promise} Sending result
 */
async function sendVerificationEmail(data) {
  console.log(`Preparing verification email for: ${data.email}`);
  
  const baseUrl = global.SERVER_IP ? `http://${global.SERVER_IP}:3000` : 'http://localhost:3000';
  const verificationUrl = `${baseUrl}/api/newsletter/verify/${data.verificationToken}`;
  
  console.log(`Verification URL: ${verificationUrl}`);
  
  try {
    const htmlContent = compileEmailTemplate('verification', {
      username: data.name || data.email,
      verificationLink: verificationUrl
    });
    
    const plainText = `
Hello ${data.name || data.email},

Thank you for subscribing to the MaxMotoSport Shop newsletter.

Please verify your email by clicking this link or pasting it into your browser:
${verificationUrl}

If you didn't sign up for our newsletter, you can ignore this email.

Thank you,
MaxMotoSport Shop Team
    `.trim();

    const info = await transporter.sendMail({
      from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
      to: data.email,
      subject: 'Please Verify Your Email Address',
      text: plainText,
      html: htmlContent
    });
    
    console.log(`✅ Verification email sent to ${data.email} (${info.messageId})`);
    return info;
  } catch (error) {
    console.error(`❌ Failed to send verification email to ${data.email}:`, error);
    throw error;
  }
}

/**
 * Send admin notification about new subscriber
 * @param {Object} data - Subscriber data (email, name)
 * @returns {Promise} Sending result
 */
async function sendAdminNotification(data) {
  try {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
        <div style="background-color: #4CAF50; color: white; padding: 10px 20px; text-align: center;">
          <h2 style="margin: 0;">New Newsletter Subscription</h2>
        </div>
        <div style="padding: 20px;">
          <p>Hello Admin,</p>
          <p>A new user has subscribed to your newsletter.</p>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Name</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.name || 'Not provided'}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Email</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${data.email}</td>
            </tr>
            <tr>
              <td style="padding: 10px; border: 1px solid #ddd; font-weight: bold;">Date</td>
              <td style="padding: 10px; border: 1px solid #ddd;">${new Date().toLocaleString()}</td>
            </tr>
          </table>
          <p>The subscriber will need to verify their email address.</p>
          <p>Best regards,<br>MaxMotoSport Shop System</p>
        </div>
      </div>
    `;

    const info = await transporter.sendMail({
      from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
      to: 'mahnicen@gmail.com',
      subject: 'New Newsletter Subscription',
      html: htmlContent
    });
    
    console.log(`✅ Admin notification sent (${info.messageId})`);
    return info;
  } catch (error) {
    console.error('❌ Failed to send admin notification:', error);
    throw error;
  }
}

function sendRegistrationEmail(userData) {
  return sendAdminNotification({
    name: userData.username,
    email: userData.email
  });
}

module.exports = {
  sendVerificationEmail,
  sendAdminNotification,
  sendRegistrationEmail
};
