const express = require('express');
const path = require('path');
const app = express();
const os = require('os');

const db = require('./api/database');

const newsletterRoutes = require('./api/newsletter');

try {
  const adminRoutes = require('./routes/admin');
  
  app.use('/api', adminRoutes);
  console.log('✅ Admin routes loaded successfully');
} catch (error) {
  console.error('❌ Failed to load admin routes:', error.message);
}
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

app.use('/api/newsletter', newsletterRoutes);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'newsletter-signup.html'));
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Something broke! Please try again later.');
});
function getServerIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = '';
  
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      
      if (iface.family !== 'IPv4' || iface.internal) {
        return;
      }
      if (!ipAddress) {
        ipAddress = iface.address;
      }
      if (iface.address.startsWith('192.168') || iface.address.startsWith('10.')) {
        ipAddress = iface.address;
      }
    });
  });
  
  return ipAddress;
}


async function startServer() {
  try {
    console.log('Initializing database...');
    await db.init();
    
    
    const serverIp = getServerIpAddress();
    global.SERVER_IP = serverIp;
    
    
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, '0.0.0.0', () => { 
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

startServer().catch(console.error);