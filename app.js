// Import required modules
const express = require('express');
const path = require('path');
const app = express();
const os = require('os');

// Import database API
const db = require('./api/database');

// Import routes
const newsletterRoutes = require('./routes/newsletter');

// Try to load admin routes
try {
  const adminRoutes = require('./routes/admin');
  // Use admin routes
  app.use('/api', adminRoutes);
  console.log('✅ Admin routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}

// Middleware for parsing and static files - these should come BEFORE routes
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Add a middleware to log all requests - this should come BEFORE routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Use routes
app.use('/api/newsletter', newsletterRoutes);

// Homepage route
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newsletter-signup.html'));
});

// Error handling middleware - this should come AFTER routes
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Please try again later.');
});

// Helper function to get server's IP address
function getServerIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = '';
  
  // Loop through network interfaces
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      // Skip internal and non-IPv4 addresses
      if (iface.family !== 'IPv4' || iface.internal) {
        return;
      }
      
      // Store the first IPv4 address we find
      if (!ipAddress) {
        ipAddress = iface.address;
      }
      
      // Prefer addresses that are likely on WiFi or cellular network
      // (typically start with 192.168 or 10.)
      if (iface.address.startsWith('192.168') || iface.address.startsWith('10.')) {
        ipAddress = iface.address;
      }
    });
  });
  
  return ipAddress;
}

// Initialize database and start server
async function startServer() {
  try {
    // Initialize database
    console.log('Initializing database...');
    await db.init();
    
    // Get server's IP address
    const serverIp = getServerIpAddress();
    global.SERVER_IP = serverIp;
    
    // Start server
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => { // Listen on all interfaces
      console.log(`✅ Server running on port ${PORT}`);
      console.log(`Server IP address: ${serverIp}`);
      console.log(`Access URL: http://${serverIp}:${PORT}`);
      console.log(`Newsletter signup: http://${serverIp}:${PORT}/newsletter-signup.html`);
    });
  } catch (error) {
    console.error('Server initialization failed:', error);
    process.exit(1);
  }
}

// Start the server
startServer().catch(console.error);