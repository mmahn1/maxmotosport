const { sendVerificationEmail } = require('./services/email-service');
const crypto = require('crypto');

async function testVerificationEmail() {
  const testEmail = 'mahnic.maks@gmail.com';
  
  console.log(`Sending test verification email to ${testEmail}...`);
  
  try {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    
    await sendVerificationEmail({
      name: 'Test User',
      email: testEmail,
      verificationToken: verificationToken
    });
    
    console.log('✅ Test email sent successfully!');
    console.log('Check your inbox (and spam folder) for the email.');
    console.log('Verification URL will contain this token:', verificationToken);
    
  } catch (error) {
    console.error('❌ Failed to send test email:', error);
  }
}

testVerificationEmail();
