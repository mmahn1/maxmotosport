/**
 * Script to create admin user in MySQL database
 * This provides a secure way to hash passwords before inserting into the database
 */

const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');
const fs = require('fs').promises;
const path = require('path');
require('dotenv').config();

// MySQL connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'max_motosport'
};

// Admin user information
const admin = {
  username: 'admin123',
  email: 'maxmotosport.shop@gmail.com',
  password: 'amin123',  // Will be hashed before storage
  role: 'admin',
  full_name: 'Admin User'
};

// Test user information
const testUser = {
  username: 'user',
  email: 'user@example.com',
  password: 'password123',
  role: 'user',
  full_name: 'Test User',
  phone: '123-456-7890'
};

async function createAdminUser() {
  let connection;
  
  try {
    // Connect to MySQL
    console.log('Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('Connected successfully!');
    
    // First check if the tables exist, if not create them
    console.log('Checking database structure...');
    try {
      // Check if users table exists
      const [tables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.tables 
         WHERE table_schema = ? AND table_name = 'users'`, 
        [dbConfig.database]
      );
      
      if (tables.length === 0) {
        console.log('Tables do not exist. Creating schema...');
        
        // Read MySQL schema file
        const schemaSQL = await fs.readFile(path.join(__dirname, 'mysql_schema.sql'), 'utf8');
        
        // Execute schema SQL (split by semicolons to execute each statement)
        const statements = schemaSQL
          .split(';')
          .filter(stmt => stmt.trim())
          .map(stmt => stmt.trim() + ';');
        
        for (const stmt of statements) {
          if (stmt.trim() !== ';') {
            await connection.execute(stmt);
          }
        }
        
        console.log('Database schema created successfully');
      }
    } catch (error) {
      console.error('Error checking/creating database structure:', error);
      return;
    }
    
    // Now check for the admin user
    const [existingAdmins] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [admin.username, admin.email]
    );
    
    if (existingAdmins.length > 0) {
      console.log('Admin user already exists, skipping creation');
    } else {
      // Hash admin password
      console.log('Creating admin user...');
      const adminSalt = await bcrypt.genSalt(10);
      const adminPasswordHash = await bcrypt.hash(admin.password, adminSalt);
      
      // Insert admin user
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role, full_name) VALUES (?, ?, ?, ?, ?)',
        [admin.username, admin.email, adminPasswordHash, admin.role, admin.full_name]
      );
      
      console.log(`Admin user created: ${admin.username} (${admin.email})`);
    }
    
    // Check if test user already exists
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE username = ? OR email = ?',
      [testUser.username, testUser.email]
    );
    
    if (existingUsers.length > 0) {
      console.log('Test user already exists, skipping creation');
    } else {
      // Hash test user password
      console.log('Creating test user...');
      const userSalt = await bcrypt.genSalt(10);
      const userPasswordHash = await bcrypt.hash(testUser.password, userSalt);
      
      // Insert test user
      await connection.execute(
        'INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
        [testUser.username, testUser.email, userPasswordHash, testUser.role, testUser.full_name, testUser.phone]
      );
      
      console.log(`Test user created: ${testUser.username} (${testUser.email})`);
    }
    
    // Add test newsletter subscribers
    console.log('Adding test subscribers...');
    
    // Get test user ID
    const [users] = await connection.execute(
      'SELECT id, email FROM users WHERE username = ?',
      [testUser.username]
    );
    
    if (users.length > 0) {
      const userId = users[0].id;
      const userEmail = users[0].email;
      
      // First check if newsletter_subscribers table exists
      const [subscriberTables] = await connection.query(
        `SELECT TABLE_NAME FROM information_schema.tables 
         WHERE table_schema = ? AND table_name = 'newsletter_subscribers'`, 
        [dbConfig.database]
      );
      
      if (subscriberTables.length > 0) {
        // Delete any existing subscriber records to avoid duplicates
        try {
          await connection.execute('DELETE FROM newsletter_subscribers WHERE email = ?', [userEmail]);
          
          // Insert subscriber record linked to user
          await connection.execute(
            'INSERT INTO newsletter_subscribers (email, user_id) VALUES (?, ?)',
            [userEmail, userId]
          );
          
          // Insert some additional test subscribers
          try {
            await connection.execute(
              'INSERT INTO newsletter_subscribers (email) VALUES (?)',
              ['subscriber1@example.com']
            );
          } catch (e) {
            console.log('subscriber1@example.com may already exist');
          }
          
          try {
            await connection.execute(
              'INSERT INTO newsletter_subscribers (email) VALUES (?)',
              ['subscriber2@example.com']
            );
          } catch (e) {
            console.log('subscriber2@example.com may already exist');
          }
          
          console.log('Test subscribers added');
        } catch (e) {
          console.log('Error adding subscribers:', e.message);
        }
      } else {
        console.log('newsletter_subscribers table does not exist yet');
      }
    }
    
    console.log('Setup completed successfully!');
    
  } catch (error) {
    console.error('Error during admin creation:', error);
  } finally {
    if (connection) {
      await connection.end();
      console.log('Database connection closed');
    }
  }
}

// Run the script
createAdminUser();
