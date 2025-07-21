const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple test endpoint
app.get('/test', (req, res) => {
    res.json({ message: 'Server is working!', timestamp: new Date().toISOString() });
});

// Debug endpoint to verify server is working
app.all('/register', (req, res) => {
    console.log('� REGISTER ROUTE HIT - Method:', req.method);
    console.log('🚀 Headers:', req.headers);
    console.log('🚀 Body:', req.body);
    
    if (req.method !== 'POST') {
        return res.status(405).json({ 
            error: 'Method not allowed', 
            method: req.method,
            message: 'Use POST method'
        });
    }
    
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ 
            error: 'All fields required',
            received: { username, email, password: password ? '***' : undefined }
        });
    }

    console.log('✅ Registration request for:', username);
    res.status(201).json({ 
        success: true, 
        message: 'REGISTRATION ENDPOINT IS WORKING!',
        debug: true,
        timestamp: new Date().toISOString(),
        data: { username, email }
    });
});

// Login endpoint (simplified for testing)
app.post('/login', async (req, res) => {
    console.log('🔥 LOGIN ENDPOINT HIT!', req.body);
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    // For now, just return success without database
    res.json({ 
        success: true, 
        message: 'Login endpoint working!',
        username: username,
        token: 'test-token-123'
    });
});

// Static files
app.use(express.static(__dirname));
app.use('/account', express.static(path.join(__dirname, 'account')));
app.use('/Landing_page', express.static(path.join(__dirname, 'Landing_page')));

// Home route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing_page', 'index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log('🚀🚀🚀 TEST SERVER RUNNING ON PORT ' + PORT + ' 🚀🚀🚀');
    console.log('✅ Test: GET http://localhost:' + PORT + '/test');
    console.log('✅ Register: POST http://localhost:' + PORT + '/register');
    console.log('✅ Login: POST http://localhost:' + PORT + '/login');
});
