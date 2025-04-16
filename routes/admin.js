const express = require('express');
const router = express.Router();

router.get('/check-admin', (req, res) => {
  console.log('Admin check endpoint accessed');
  
  
  return res.status(200).json({
    success: false,
    message: 'Not authorized',
    isAdmin: false
  });
});

router.get('/ping', (req, res) => {
  return res.status(200).json({
    success: true,
    message: 'API is working',
    timestamp: new Date().toISOString()
  });
});

module.exports = router;
