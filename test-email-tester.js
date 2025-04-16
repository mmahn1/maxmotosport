const { sendRegistrationEmail } = require('./test-email.js');

const testUser = {
  username: 'TestUser123',
  email: 'test@example.com'
};

async function testEmailSending() {
  console.log('Starting email test...');
  try {
    const result = await sendRegistrationEmail(testUser);
    console.log('Email test successful!');
    console.log('Message ID:', result.messageId);
  } catch (error) {
    console.error('Email test failed:', error);
  }
}

testEmailSending();
