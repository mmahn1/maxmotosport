const mysql = require('mysql2/promise');
const nodemailer = require('nodemailer');
const fs = require('fs').promises;
const path = require('path');

// Database connection details
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: ''
};

// Database name
const dbName = 'max_motosport';

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

async function checkDatabaseConnection() {
  console.log('Checking database connection...');
  let connection;
  
  try {
    // First connect without specifying database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Database server connection successful');
    
    // Check if database exists, create it if not
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
    
    if (rows.length === 0) {
      console.log(`❌ Database '${dbName}' does not exist`);
      console.log(`Creating database '${dbName}'...`);
      
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✅ Database '${dbName}' exists`);
    }
    
    // Close the connection and reconnect with the database
    await connection.end();
    
    // Connect to the specific database
    connection = await mysql.createConnection({
      ...dbConfig,
      database: dbName
    });
    
    // Check if newsletter table exists and has the right structure
    const [tables] = await connection.query('SHOW TABLES LIKE "newsletter"');
    
    if (tables.length === 0) {
      console.log('❌ Newsletter table does not exist!');
      console.log('Creating newsletter table...');
      
      await connection.query(`
        CREATE TABLE newsletter (
          id INT AUTO_INCREMENT PRIMARY KEY,
          name VARCHAR(255),
          email VARCHAR(255) NOT NULL,
          verified BOOLEAN DEFAULT FALSE,
          verification_token VARCHAR(255),
          subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          verified_at TIMESTAMP NULL
        )
      `);
      
      console.log('✅ Newsletter table created successfully');
    } else {
      console.log('✅ Newsletter table exists');
      
      // Check table structure
      const [columns] = await connection.query('SHOW COLUMNS FROM newsletter');
      const columnNames = columns.map(col => col.Field);
      
      console.log('Table columns:', columnNames.join(', '));
      
      // Check for required columns
      const requiredColumns = ['verified', 'verification_token', 'verified_at'];
      const missingColumns = requiredColumns.filter(col => !columnNames.includes(col));
      
      if (missingColumns.length > 0) {
        console.log(`❌ Missing columns: ${missingColumns.join(', ')}`);
        
        // Add missing columns
        for (const column of missingColumns) {
          if (column === 'verified') {
            await connection.query('ALTER TABLE newsletter ADD COLUMN verified BOOLEAN DEFAULT FALSE');
          } else if (column === 'verification_token') {
            await connection.query('ALTER TABLE newsletter ADD COLUMN verification_token VARCHAR(255)');
          } else if (column === 'verified_at') {
            await connection.query('ALTER TABLE newsletter ADD COLUMN verified_at TIMESTAMP NULL');
          }
        }
        
        console.log('✅ Missing columns added successfully');
      }
    }

    // Show existing subscribers
    const [subscribers] = await connection.query('SELECT * FROM newsletter');
    console.log(`\n📊 Current subscribers (${subscribers.length}):`);
    if (subscribers.length > 0) {
      subscribers.forEach(sub => {
        console.log(`- ${sub.email} (${sub.verified ? '✓ Verified' : '✗ Unverified'})`);
      });
    } else {
      console.log('No subscribers yet');
    }

    await connection.end();
    return true;
  } catch (error) {
    console.error('❌ Database operation error:', error);
    if (connection) {
      try {
        await connection.end();
      } catch (err) {
        // Ignore error on connection close
      }
    }
    return false;
  }
}

async function checkEmailConnection() {
  console.log('\nChecking email connection...');
  try {
    const transporter = nodemailer.createTransport(emailConfig);
    const verification = await transporter.verify();
    
    if (verification) {
      console.log('✅ Email connection successful');
      return true;
    } else {
      console.log('❌ Email connection failed, but no error was thrown');
      return false;
    }
  } catch (error) {
    console.error('❌ Email connection error:', error);
    return false;
  }
}

async function checkEmailTemplates() {
  console.log('\nChecking email templates...');
  
  const templateDir = path.join(__dirname, 'email-templates');
  const verificationTemplatePath = path.join(templateDir, 'verification.html');
  
  try {
    await fs.access(templateDir);
    console.log('✅ Email templates directory exists');
    
    try {
      await fs.access(verificationTemplatePath);
      console.log('✅ Verification email template exists');
      
      // Check template content
      const templateContent = await fs.readFile(verificationTemplatePath, 'utf8');
      if (templateContent.includes('{{verificationLink}}')) {
        console.log('✅ Verification template contains verification link placeholder');
      } else {
        console.log('❌ Verification template is missing the {{verificationLink}} placeholder');
      }
    } catch (error) {
      console.error('❌ Verification email template not found');
    }
  } catch (error) {
    console.error('❌ Email templates directory not found');
  }
}

async function runDiagnostics() {
  console.log('========== NEWSLETTER SYSTEM DIAGNOSTICS ==========\n');
  
  // Check database connection
  const dbOk = await checkDatabaseConnection();
  
  // Check email connection
  const emailOk = await checkEmailConnection();
  
  // Check email templates
  await checkEmailTemplates();
  
  console.log('\n======= DIAGNOSTICS SUMMARY =======');
  console.log(`Database connection: ${dbOk ? '✅ OK' : '❌ FAILED'}`);
  console.log(`Email connection: ${emailOk ? '✅ OK' : '❌ FAILED'}`);
  
  if (dbOk && emailOk) {
    console.log('\n✅ System appears to be properly configured');
  } else {
    console.log('\n❌ System has configuration issues that need to be resolved');
  }
  
  console.log('\n========== END OF DIAGNOSTICS ==========');
}

runDiagnostics().catch(console.error);
