const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');

// Define directories to create
const directories = [
  'api',
  'email-templates',
  'services',
  'public',
  'routes'
];

// Database connection details
const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: ''
};

// Database name
const dbName = 'max_motosport';

// Create directories
function createDirectories() {
  console.log('Creating required directories...');
  
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created directory: ${dir}`);
    } else {
      console.log(`✓ Directory already exists: ${dir}`);
    }
  });
}

// Check database
async function checkDatabase() {
  console.log('\nChecking database connection...');
  let connection;
  
  try {
    // Connect without database
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ MySQL server connection successful');
    
    // Check if database exists
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
    
    if (rows.length === 0) {
      console.log(`Database '${dbName}' not found. Creating...`);
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }
    
    // Close connection
    await connection.end();
    console.log('✅ Database setup completed');
    
    return true;
  } catch (error) {
    console.error('\n❌ Database setup error:', error);
    if (connection) await connection.end();
    return false;
  }
}

// Initialize everything
async function init() {
  console.log('========== SYSTEM INITIALIZATION ==========');
  
  // Create directories
  createDirectories();
  
  // Check database
  const dbOk = await checkDatabase();
  
  console.log('\n============ INIT COMPLETE ============');
  console.log(`Database: ${dbOk ? '✅ Ready' : '❌ Error'}`);
  console.log('\nTo start the server, run:');
  console.log('node app.js');
  console.log('=======================================');
}

// Run initialization
init().catch(console.error);
