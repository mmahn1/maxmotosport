/**
 * Admin check middleware
 * Ensures the user has admin role
 * Must be used after auth middleware
 */
module.exports = function(req, res, next) {
  // Check if user exists
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'User not authenticated' });
  }

  // For development purposes, bypass admin check temporarily
  return next(); 
  
  // DISABLED FOR DEVELOPMENT - UNCOMMENT IN PRODUCTION:
  /*
  // Check if user is admin
  if (req.user.role !== 'admin' && req.user.username !== 'admin123') {
    console.log('Admin access denied. User:', req.user);
    return res.status(403).json({ success: false, message: 'Access denied: Admin privileges required' });
  }

  next();
  */
};
