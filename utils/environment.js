const os = require('os');

/**
 * Utility to get environment-specific values
 */

/**
 * Get the server's IP address
 * @returns {string} The server's IP address
 */
function getServerIpAddress() {
  const interfaces = os.networkInterfaces();
  let ipAddress = 'localhost';
  
  // Loop through network interfaces
  Object.keys(interfaces).forEach((ifname) => {
    interfaces[ifname].forEach((iface) => {
      // Skip internal and non-IPv4 addresses
      if (iface.family !== 'IPv4' || iface.internal) {
        return;
      }
      
      // Prefer addresses that are likely on WiFi or cellular network
      if (iface.address.startsWith('192.168') || iface.address.startsWith('10.')) {
        ipAddress = iface.address;
      }
    });
  });
  
  return ipAddress;
}

/**
 * Get the base URL for the application
 * @returns {string} The base URL (no trailing slash)
 */
function getBaseUrl() {
  // Use global SERVER_IP if available (set in app.js)
  if (global.SERVER_IP) {
    return `http://${global.SERVER_IP}:${process.env.PORT || 3000}`;
  }
  
  // As a fallback, try to detect it directly
  const ip = getServerIpAddress();
  return `http://${ip}:${process.env.PORT || 3000}`;
}

/**
 * Check if running in production mode
 * @returns {boolean}
 */
function isProduction() {
  return process.env.NODE_ENV === 'production';
}

module.exports = {
  getBaseUrl,
  isProduction,
  getServerIpAddress
};
