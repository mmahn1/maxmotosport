//redeploy trigger 
const express = require("express");
const fs = require("fs");
const mysql = require("mysql2");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const session = require("express-session");
const cors = require("cors");
const path = require("path");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const { exec } = require('child_process');

const app = express();
const PORT = 3000;
const JSON_FILE = __dirname + "/ponudba/izdelki.json";

// Check if running in production (Railway / Hostinger)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost';

const db = mysql.createConnection({
  host: isProduction ? process.env.DB_HOST : 'localhost',
  user: isProduction ? process.env.DB_USER : 'root',
  password: isProduction ? process.env.DB_PASS : '', // or your local MySQL password
  database: isProduction ? process.env.DB_NAME : 'users_db',
  port: isProduction ? process.env.DB_PORT || 3306 : 3306
});

db.connect(err => {
  if (err) {
    console.error('❌ Error connecting to MySQL:', err.stack);
    return;
  }
  console.log('✅ Connected to MySQL!');
});

db.query('SELECT DATABASE()', (err, results) => {
    if (err) console.error('Database connection error:', err);
    else console.log('Connected to database:', results[0]['DATABASE()']);
});

// Routes import section - keep this near the top
const authRoutes = require('./server/routes/auth');
const userRoutes = require('./server/routes/user');
const newsletterRoutes = require('./server/routes/newsletter');
const maintenanceRoutes = require('./server/routes/maintenance');
const orderRoutes = require('./server/routes/orders');
const usersRoutes = require('./server/routes/users'); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({
    origin: true,
    credentials: true
}));
app.use(session({
    secret: "maxmotosport_secret_key",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false, maxAge: 3600000 } 
}));

// API routes registration - IMPORTANT: This needs to be before other route handlers
app.use('/', authRoutes);
app.use('/api/user', userRoutes);
app.use('/api/newsletter', newsletterRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/users', usersRoutes);

// Authentication Routes
app.post("/register", async (req, res) => {
    console.log("Register endpoint hit with data:", req.body); // Log incoming data

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
        console.log("❌ Missing fields in request body:", { username, email, password });
        return res.status(400).json({ error: 'All fields are required' });
    }

    try {
        // Check if the email already exists
        const emailCheckQuery = 'SELECT * FROM users WHERE email = ?';
        db.query(emailCheckQuery, [email], async (err, results) => {
            if (err) {
                console.error("❌ Database error during email check:", err);
                return res.status(500).json({ error: 'Server error' });
            }

            console.log("🔹 Email check results:", results); // Log the results of the email check

            if (results.length > 0) {
                console.log("❌ Email already exists:", email);
                return res.status(400).json({ error: 'The email address is already registered. Please use a different email or log in.' });
            }

            // Proceed with registration
            const hashedPassword = await bcrypt.hash(password, 10);
            const query = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
            console.log("Executing query:", query, [username, email, hashedPassword]); // Log query

            db.query(query, [username, email, hashedPassword], (err, result) => {
                if (err) {
                    console.error("❌ Database error during registration:", err); // Log the full error object
                    return res.status(500).json({ error: 'Server error' });
                }
                console.log("✅ User registered successfully:", { username, email });
                res.status(201).json({ success: true, message: 'User registered successfully' });
            });
        });
    } catch (error) {
        console.error("❌ Server error:", error); // Log server error
        res.status(500).json({ error: 'Server error' });
    }
});

app.post("/login", (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'All fields are required' });
    }

    const query = 'SELECT * FROM users WHERE username = ?';
    db.query(query, [username], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ error: 'Server error' });
        }

        if (results.length === 0) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const user = results[0];
        const isPasswordValid = await bcrypt.compare(password, user.password);

        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Invalid username or password' });
        }

        const token = jwt.sign({ id: user.id, role: user.role }, "your_jwt_secret_key", { expiresIn: '1h' });
        res.json({ success: true, token, username: user.username, role: user.role, id: user.id });
    });
});

// Serve static files - Place this AFTER API routes
app.use(express.static(__dirname));
app.use("/ponudba", express.static(__dirname + "/ponudba"));
app.use("/Slike", express.static(__dirname + "/Slike"));
app.use("/Landing page", express.static(__dirname + "/Landing page"));
app.use("/account", express.static(__dirname + "/account"));
app.use("/Newsletter", express.static(__dirname + "/Newsletter"));

// Email configuration
const emailTransporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'maxmotosport.shop@gmail.com',
        pass: 'gmir ejjf outo whkm'
    }
});

// Generate verification token
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

// Send verification email
async function sendVerificationEmail(email, token) {
    const yourLocalIP = "172.20.10.6";
    const localVerificationUrl = `http://localhost:${PORT}/api/newsletter/verify/${token}`;
    const networkVerificationUrl = `http://${yourLocalIP}:${PORT}/api/newsletter/verify/${token}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(networkVerificationUrl)}`;
    
    const mailOptions = {
        from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
        to: email,
        subject: 'Please Verify Your Email Address',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
                <div style="background-color: #333; color: white; padding: 20px; text-align: center;">
                    <h1>Email Verification</h1>
                </div>
                <div style="padding: 20px;">
                    <p>Hello,</p>
                    <p>Thank you for subscribing to MaxMotoSport Shop newsletter.</p>
                    <p>Please click the button below to verify your email address:</p>
                    
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${localVerificationUrl}" style="background-color: #333; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px;">Verify Email Address</a>
                    </div>
                    
                    <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
                    <p>${localVerificationUrl}</p>
                    
                    <p>If you're on a mobile device, scan this QR code or use this link:</p>
                    <div style="text-align: center;">
                        <img src="${qrCodeUrl}" alt="Verification QR Code" style="max-width: 150px; height: auto;">
                        <p><a href="${networkVerificationUrl}">${networkVerificationUrl}</a></p>
                    </div>
                    
                    <p>If you didn't subscribe to our newsletter, you can safely ignore this email.</p>
                    
                    <p>Best regards,<br>MaxMotoSport Shop Team</p>
                </div>
            </div>
        `
    };
    
    return emailTransporter.sendMail(mailOptions);
}

// Send admin notification
async function sendAdminNotification(email) {
    const mailOptions = {
        from: '"MaxMotoSport Shop" <maxmotosport.shop@gmail.com>',
        to: 'mahnicen@gmail.com',
        subject: 'New Newsletter Subscription',
        html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #ddd;">
                <div style="background-color: #333; color: white; padding: 10px 20px; text-align: center;">
                    <h2>New Newsletter Subscription</h2>
                </div>
                <div style="padding: 20px;">
                    <p>Hello Admin,</p>
                    <p>A new user has subscribed to your newsletter:</p>
                    <ul>
                        <li><strong>Email:</strong> ${email}</li>
                        <li><strong>Date:</strong> ${new Date().toLocaleString()}</li>
                    </ul>
                    <p>They need to verify their email to complete the subscription.</p>
                    <p>Best regards,<br>MaxMotoSport System</p>
                </div>
            </div>
        `
    };
    
    return emailTransporter.sendMail(mailOptions);
}

// Newsletter API endpoints
app.post("/api/newsletter/subscribe", (req, res) => {
    const { email } = req.body;
    
    if (!email) {
        return res.status(400).json({ 
            success: false,
            message: "Email address is required."
        });
    }
    
    db.query('SELECT * FROM newsletter WHERE email = ?', [email], async (err, results) => {
        if (err) {
            console.error("Database error:", err);
            return res.status(500).json({ 
                success: false,
                message: "Failed to process your request. Please try again later." 
            });
        }

        if (results.length > 0 && results[0].verified) {
            return res.status(400).json({ 
                success: false,
                message: "This email is already subscribed to our newsletter." 
            });
        }
        
        const token = generateToken();
        
        try {
            if (results.length > 0) {
                db.query('UPDATE newsletter SET verification_token = ? WHERE id = ?', [token, results[0].id]);
            } else {
                db.query('INSERT INTO newsletter (email, verified, verification_token) VALUES (?, FALSE, ?)', [email, token]);
            }
            
            await sendVerificationEmail(email, token);
            await sendAdminNotification(email);
            
            return res.json({
                success: true,
                message: "Please check your email to verify your subscription."
            });
        } catch (error) {
            console.error("Error:", error);
            return res.status(500).json({ 
                success: false,
                message: "Failed to process your request. Please try again later."
            });
        }
    });
});

// Routes for Landing page with spaces in URL
app.get('/', (req, res) => {
    res.redirect('/Landing page/');
});

app.get('/Landing page', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing page', 'index.html'));
});

app.get('/Landing page/', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing page', 'index.html'));
});

app.get('/Landing page/index.html', (req, res) => {
    res.sendFile(path.join(__dirname, 'Landing page', 'index.html'));
});

// API Endpoint to Load Products
app.get("/api/products", (req, res) => {
    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("Failed to read JSON:", err);
            return res.status(500).json({ error: "Failed to read products." });
        }
        res.json(JSON.parse(data));
    });
});

// API Endpoint to Add New Product
app.post("/api/products", (req, res) => {
    const newProduct = req.body;

    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) return res.status(500).json({ error: "Failed to read products." });

        let products = JSON.parse(data);
        products.push(newProduct);

        fs.writeFile(JSON_FILE, JSON.stringify(products, null, 2), (err) => {
            if (err) return res.status(500).json({ error: "Failed to save product." });
            res.json({ message: "Product added successfully!", product: newProduct });
        });
    });
});

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
