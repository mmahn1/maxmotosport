/**
 * Manual verification tool
 * Run this script with: node tools/manual-verify.js email@example.com
 */
require('dotenv').config();
const mysql = require('mysql');
const util = require('util');

// Get email from command line arguments
const email = process.argv[2];

if (!email) {
  console.error('Please provide an email address.');
  console.error('Usage: node tools/manual-verify.js email@example.com');
  process.exit(1);
}

// Database connection
const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "max_motosport",
  port: process.env.DB_PORT || 3306
};

const connection = mysql.createConnection(dbConfig);
const query = util.promisify(connection.query).bind(connection);

// Add ability to check subscriber status without verifying
async function checkOrVerifyEmail() {
  try {
    console.log(`Looking up email: ${email}`);
    
    // Find the subscriber
    const subscribers = await query(
      'SELECT * FROM newsletter WHERE email = ?', 
      [email]
    );
    
    if (subscribers.length === 0) {
      console.error(`❌ Email ${email} not found in database.`);
      console.log('They need to sign up again.');
      return;
    }
    
    const subscriber = subscribers[0];
    console.log('Subscriber found:');
    console.log(`- Email: ${subscriber.email}`);
    console.log(`- Name: ${subscriber.name || 'Not provided'}`);
    console.log(`- Verified: ${subscriber.verified ? 'Yes' : 'No'}`);
    console.log(`- Subscribed at: ${subscriber.subscribed_at}`);
    console.log(`- Verified at: ${subscriber.verified_at || 'Not verified yet'}`);
    console.log(`- Has verification token: ${subscriber.verification_token ? 'Yes' : 'No'}`);
    
    // Ask if we should verify the email
    if (!subscriber.verified) {
      console.log('\nThis email is not verified. Would you like to manually verify it? (y/n)');
      const readline = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      readline.question('> ', async (answer) => {
        if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
          // Verify the email
          await query(
            'UPDATE newsletter SET verified = TRUE, verified_at = NOW() WHERE id = ?',
            [subscriber.id]
          );
          
          // Check if update was successful
          const updated = await query(
            'SELECT verified FROM newsletter WHERE id = ?', 
            [subscriber.id]
          );
          
          if (updated[0].verified) {
            console.log(`✅ Successfully verified email: ${email}`);
          } else {
            console.error(`❌ Failed to update verified status for ${email}`);
          }
        }
        
        readline.close();
        connection.end();
      });
    } else {
      console.log('\nThis email is already verified. No action needed.');
      connection.end();
    }
  } catch (error) {
    console.error('Error:', error);
    connection.end();
  }
}

// Replace the call to verifyEmail() with checkOrVerifyEmail()
checkOrVerifyEmail();
