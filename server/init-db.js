const fs = require('fs').promises;
const path = require('path');
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');
const bcrypt = require('bcrypt');

async function initDb() {
  try {
    console.log('Initializing database...');
    
    // Database file path
    const dbPath = path.join(__dirname, 'maxmotosport.db');
    
    // Remove existing database if it exists
    try {
      await fs.unlink(dbPath);
      console.log('Removed existing database file');
    } catch (error) {
      // File doesn't exist, continue
    }
    
    // Create new database
    const db = await open({
      filename: dbPath,
      driver: sqlite3.Database
    });
    
    // Read schema SQL
    const schemaSQL = await fs.readFile(path.join(__dirname, 'db_schema.sql'), 'utf8');
    
    // Execute schema SQL
    await db.exec(schemaSQL);
    console.log('Database schema created');
    
    // Create default admin user
    const salt = await bcrypt.genSalt(10);
    const adminPasswordHash = await bcrypt.hash('amin123', salt);
    
    await db.run(
      'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
      ['admin123', 'maxmotosport.shop@gmail.com', adminPasswordHash, 'admin']
    );
    console.log('Default admin user created (admin123/amin123)');
    
    // Create regular test user
    const userPasswordHash = await bcrypt.hash('password123', salt);
    
    await db.run(
      'INSERT INTO users (username, email, password_hash, role, full_name, phone) VALUES (?, ?, ?, ?, ?, ?)',
      ['user', 'user@example.com', userPasswordHash, 'user', 'Test User', '123-456-7890']
    );
    console.log('Test user created (user/password123)');
    
    // Add some test newsletter subscribers
    await db.run('INSERT INTO newsletter_subscribers (email) VALUES (?)', ['subscriber1@example.com']);
    await db.run('INSERT INTO newsletter_subscribers (email) VALUES (?)', ['subscriber2@example.com']);
    await db.run('INSERT INTO newsletter_subscribers (email, user_id) VALUES (?, ?)', ['user@example.com', 2]);
    console.log('Test newsletter subscribers added');
    
    // Add some test maintenance orders
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    nextWeek.setHours(14, 0, 0, 0);
    
    await db.run(
      `INSERT INTO maintenance_orders 
      (user_id, customer_name, phone, service_type, vehicle_info, appointment_date, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 'Test User', '123-456-7890', 'Oil Change', '2020 Honda CBR650R', tomorrow.toISOString(), 'pending', 'Please use synthetic oil']
    );
    
    await db.run(
      `INSERT INTO maintenance_orders 
      (user_id, customer_name, phone, service_type, vehicle_info, appointment_date, status, notes) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [2, 'Test User', '123-456-7890', 'Tire Replacement', '2019 Kawasaki Ninja 400', nextWeek.toISOString(), 'approved', 'Need both front and rear tires']
    );
    console.log('Test maintenance orders added');
    
    // Add some user activity
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [2, 'account', 'Account created']
    );
    
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [2, 'maintenance', 'Scheduled Oil Change service']
    );
    
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [2, 'maintenance', 'Scheduled Tire Replacement service']
    );
    
    await db.run(
      'INSERT INTO user_activity (user_id, activity_type, description) VALUES (?, ?, ?)',
      [2, 'newsletter', 'Subscribed to newsletter']
    );
    console.log('Test user activity added');
    
    // Close database connection
    await db.close();
    
    console.log('Database initialization complete!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  }
}

initDb();
