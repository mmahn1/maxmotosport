const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs').promises;
const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

// Routes
const authRoutes = require('./routes/auth');
const userRoutes = require('./routes/user');
const newsletterRoutes = require('./routes/newsletter');
const maintenanceRoutes = require('./routes/maintenance');

// Create express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/maintenance', maintenanceRoutes);

// Serve React app for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../public/index.html'));
});

// Initialize database and start server
async function initServer() {
  try {
    // Check if database file exists, initialize if not
    const dbPath = path.join(__dirname, 'maxmotosport.db');
    try {
      await fs.access(dbPath);
      console.log('Database file exists, skipping initialization');
    } catch (error) {
      console.log('Database file not found, creating and initializing...');
      
      // Create new database
      const db = await open({
        filename: dbPath,
        driver: sqlite3.Database
      });
      
      // Read schema SQL
      const schemaSQL = await fs.readFile(path.join(__dirname, 'db_schema.sql'), 'utf8');
      
      // Execute schema SQL
      await db.exec(schemaSQL);
      console.log('Database initialized successfully');

      // Create default admin user
      const bcrypt = require('bcrypt');
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash('amin123', salt);
      
      await db.run(
        'INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)',
        ['admin123', 'maxmotosport.shop@gmail.com', passwordHash, 'admin']
      );
      console.log('Default admin user created');
    }
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  }
}

initServer();
