const mysql = require('mysql');
const util = require('util');
require('dotenv').config();


const dbConfig = {
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root", 
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "max_motosport",
  port: process.env.DB_PORT || 3306,
  connectionLimit: 10
};


let pool = mysql.createPool(dbConfig);


pool.query = util.promisify(pool.query);

async function testConnection() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database connection test failed:', error);
    return false;
  }
}


async function safeQuery(sql, params = []) {
  try {
    return await pool.query(sql, params);
  } catch (error) {
    console.error('Database query error:', error);
    console.error('Query:', sql);
    console.error('Params:', params);
    
    if (error.code === 'PROTOCOL_CONNECTION_LOST' || 
        error.code === 'ECONNREFUSED' || 
        error.code === 'ETIMEDOUT') {
      console.log('Attempting to reconnect to database...');
      
      pool = mysql.createPool(dbConfig);
      pool.query = util.promisify(pool.query);
      

      try {
        return await pool.query(sql, params);
      } catch (retryError) {
        console.error('Reconnection failed:', retryError);
        throw retryError;
      }
    }
    
    throw error;
  }
}

async function init() {
  try {
    
    const connected = await testConnection();
    if (!connected) {
      throw new Error('Unable to connect to database');
    }

    console.log('✅ Database connection successful');

    
    try {
      const tables = await pool.query("SHOW TABLES LIKE 'newsletter'");
      
      if (tables.length === 0) {
        console.log('Creating newsletter table...');
        
        await pool.query(`
          CREATE TABLE newsletter (
            id INT AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255),
            email VARCHAR(255) UNIQUE NOT NULL,
            verification_token VARCHAR(255),
            verified BOOLEAN DEFAULT FALSE,
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified_at TIMESTAMP NULL
          )
        `);
        
        console.log('✅ Newsletter table created successfully');
      } else {
        console.log('Newsletter table already exists');
        
        const columns = await pool.query('SHOW COLUMNS FROM newsletter');
        const columnNames = columns.map(col => col.Field);
        
        const columnsToAdd = [];
        
        if (!columnNames.includes('name')) {
          columnsToAdd.push("ADD COLUMN name VARCHAR(255) AFTER id");
        }
        
        if (!columnNames.includes('verification_token')) {
          columnsToAdd.push("ADD COLUMN verification_token VARCHAR(255)");
        }
        
        if (!columnNames.includes('verified')) {
          columnsToAdd.push("ADD COLUMN verified BOOLEAN DEFAULT FALSE");
        }
        
        if (!columnNames.includes('verified_at')) {
          columnsToAdd.push("ADD COLUMN verified_at TIMESTAMP NULL");
        }
        
        if (columnsToAdd.length > 0) {
          const alterQuery = `ALTER TABLE newsletter ${columnsToAdd.join(', ')}`;
          await pool.query(alterQuery);
          console.log('✅ Newsletter table structure updated');
        }
      }
    } catch (error) {
      console.error('Error initializing newsletter table:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Database initialization failed:', error);
    throw error;
  }
}

module.exports = {
  query: safeQuery,  
  testConnection,
  init
};
