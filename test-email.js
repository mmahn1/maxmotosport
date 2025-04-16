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

function getEmailTemplate() {
  const templatePath = path.join(__dirname, 'test-email.html');
  const source = fs.readFileSync(templatePath, 'utf-8');
  return handlebars.compile(source);
}

/**
 * Send registration notification email
 * @param {Object} userData - The user data including username, email, etc.
 * @returns {Promise} 
 */
async function sendRegistrationEmail(userData) {
  try {
    const template = getEmailTemplate();
    const htmlToSend = template({
      username: userData.username,
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
    console.log('Registration email sent: %s', info.messageId);
    return info;
  } catch (error) {
    console.error('Error sending registration email:', error);
    throw error;
  }
}


module.exports = { sendRegistrationEmail };
