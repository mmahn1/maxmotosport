require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 3000;

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT
});

db.connect(err => {
  if (err) {
    console.error('❌ MySQL Error:', err);
    return;
  }
  console.log('✅ MySQL Connected!');
});

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: ['http://localhost:3000'], credentials: true }));

app.post('/register', async (req, res) => {
    console.log('🔥 REGISTER ENDPOINT HIT!', req.body);
    const { username, email, password } = req.body;
    
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields required' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const query = 'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)';
        
        db.query(query, [username, email, hashedPassword], (err, result) => {
            if (err) {
                console.error('Insert Error:', err);
                return res.status(500).json({ error: 'Database error' });
            }
            console.log('✅ User created:', username);
            res.status(201).json({ success: true, message: 'User registered!' });
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/login', async (req, res) => {
    console.log('🔥 LOGIN ENDPOINT HIT!');
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Username and password required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            return res.status(500).json({ error: 'Database error' });
        }
        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const user = results[0];
        const isValid = await bcrypt.compare(password, user.password_hash);
        
        if (!isValid) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, 'secret', { expiresIn: '1h' });
        res.json({ success: true, token, username: user.username, role: user.role });
    });
});

app.use(express.static(__dirname));
app.use('/account', express.static(path.join(__dirname, 'account')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing_page', 'index.html'));
});

app.listen(PORT, () => {
    console.log('🚀🚀🚀 SERVER RUNNING ON PORT ' + PORT + ' 🚀🚀🚀');
    console.log('✅ Register: POST http://localhost:' + PORT + '/register');
    console.log('✅ Login: POST http://localhost:' + PORT + '/login');
});
