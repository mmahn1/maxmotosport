const fs = require('fs');
const path = require('path');
const mysql = require('mysql2/promise');


const directories = [
  'email-templates',
  'services',
  'public',
  'routes'
];


const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: ''
};


const dbName = 'max_motosport';

async function setupDirectories() {
  console.log('\nCreating directories...');
  directories.forEach(dir => {
    const dirPath = path.join(__dirname, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`✅ Created: ${dirPath}`);
    } else {
      console.log(`✓ Already exists: ${dirPath}`);
    }
  });
}

async function setupDatabase() {
  console.log('\nSetting up database...');
  let connection;
  
  try {
    connection = await mysql.createConnection(dbConfig);
    
    const [rows] = await connection.query(`SHOW DATABASES LIKE '${dbName}'`);
    
    if (rows.length === 0) {
      console.log(`Database '${dbName}' not found. Creating...`);
      await connection.query(`CREATE DATABASE ${dbName}`);
      console.log(`✅ Database '${dbName}' created successfully`);
    } else {
      console.log(`✓ Database '${dbName}' already exists`);
    }
    
      await connection.query(`USE ${dbName}`);
    
    console.log('Checking newsletter table...');
    await connection.query(`
      CREATE TABLE IF NOT EXISTS newsletter (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(255),
        email VARCHAR(255) NOT NULL,
        verified BOOLEAN DEFAULT FALSE,
        verification_token VARCHAR(255),
        subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        verified_at TIMESTAMP NULL,
        UNIQUE KEY unique_email (email)
      )
    `);
    console.log('✅ Newsletter table setup completed');
    
    return true;
  } catch (error) {
    console.error('❌ Database setup error:', error);
    return false;
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

async function main() {
  console.log('======= NEWSLETTER SYSTEM SETUP =======');
  
  await setupDirectories();
  

  await setupDatabase();
  
  
  console.log('\nChecking required packages...');
  let packagesToInstall = [];
  
  for (const pkg of ['nodemailer', 'handlebars', 'mysql2', 'express']) {
    try {
      require.resolve(pkg);
      console.log(`✓ Package '${pkg}' is installed`);
    } catch (e) {
      console.log(`✗ Package '${pkg}' is missing`);
      packagesToInstall.push(pkg);
    }
  }
  
  if (packagesToInstall.length > 0) {
    console.log(`\nMissing packages: ${packagesToInstall.join(', ')}`);
    console.log('Please install them using:');
    console.log(`npm install ${packagesToInstall.join(' ')}`);
  } else {
    console.log('\n✅ All required packages are installed');
  }
  
  console.log('\n======= SETUP COMPLETED =======');
  console.log('You can now run your application with:');
  console.log('node app.js');
}

main().catch(console.error);
