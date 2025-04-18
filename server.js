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
const dotenv = require("dotenv");
dotenv.config();

const app = express();
const PORT = 3000;
const JSON_FILE = path.join(__dirname, "ponudba", "bikes.json"); // Corrected path

// Check if running in production (Railway / Hostinger)
const isProduction = process.env.NODE_ENV === 'production' || process.env.DB_HOST !== 'localhost';

const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME, 
  port: process.env.DB_PORT
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
    origin: ['https://maxmotosport-production.up.railway.app', 'https://example.com'], // Add your frontend's origin
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

// Endpoint to expose server configuration
app.get('/api/config', (req, res) => {
    res.json({ SERVER_URL: process.env.SERVER_URL });
});

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

// JWT Authentication Middleware
function authenticateToken(req, res, next) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, "your_jwt_secret_key", (err, user) => {
        if (err) return res.sendStatus(403);
        req.user = user;
        next();
    });
}

// Example protected route
app.get("/api/profile", authenticateToken, (req, res) => {
    res.json({ message: `Hello ${req.user.id}, you are logged in as ${req.user.role}` });
});

// Create a new order from cart data
app.post("/api/orders", authenticateToken, (req, res) => {
    const { cart } = req.body;

    if (!cart || !Array.isArray(cart) || cart.length === 0) {
        return res.status(400).json({ error: "Cart is empty or invalid" });
    }

    // Read products from the JSON file
    fs.readFile(JSON_FILE, "utf8", (err, data) => {
        if (err) {
            console.error("❌ Error reading products JSON file:", err);
            return res.status(500).json({ error: "Server error" });
        }

        const products = JSON.parse(data);
        let totalPrice = 0;
        const productDetails = [];

        // Validate cart items and calculate total price
        for (const item of cart) {
            const product = products.find(p => p.id === item.product_id);
            if (!product) {
                return res.status(400).json({ error: `Product with ID ${item.product_id} not found` });
            }

            const itemTotalPrice = product.price * item.quantity;
            totalPrice += itemTotalPrice;

            productDetails.push({
                name: product.name,
                price: product.price,
                quantity: item.quantity,
                total_price: itemTotalPrice
            });
        }

        // Insert the order into the database
        const query = `
            INSERT INTO orders (user_id, product_details, total_price)
            VALUES (?, ?, ?)
        `;
        db.query(query, [req.user.id, JSON.stringify(productDetails), totalPrice], (err, result) => {
            if (err) {
                console.error("❌ Error creating order:", err);
                return res.status(500).json({ error: "Server error" });
            }
            res.status(201).json({ success: true, message: "Order created successfully", orderId: result.insertId });
        });
    });
});

// Get all orders for the logged-in user
app.get("/api/orders", authenticateToken, (req, res) => {
    const query = `
        SELECT id, product_details, total_price, order_date, status
        FROM orders
        WHERE user_id = ?
    `;
    db.query(query, [req.user.id], (err, results) => {
        if (err) {
            console.error("❌ Error fetching orders:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ success: true, orders: results });
    });
});

// Admin-only route to fetch all orders
app.get("/api/admin/orders", authenticateToken, (req, res) => {
    if (req.user.role !== "admin") {
        return res.status(403).json({ error: "Access denied" });
    }

    const query = `
        SELECT id, user_id, product_details, total_price, order_date, status
        FROM orders
        ORDER BY order_date DESC
    `;
    db.query(query, (err, results) => {
        if (err) {
            console.error("❌ Error fetching all orders:", err);
            return res.status(500).json({ error: "Server error" });
        }
        res.json({ success: true, orders: results });
    });
});

// Serve static files - Place this AFTER API routes
app.use(express.static(__dirname));
app.use("/ponudba", express.static(__dirname + "/ponudba"));
app.use("/Slike", express.static(__dirname + "/Slike"));
app.use("/Landing_page", express.static(__dirname + "/Landing_page"));
app.use("/account", express.static(__dirname + "/account"));
app.use("/Newsletter", express.static(__dirname + "/Newsletter"));
app.use("/Cart", express.static(__dirname + "/Cart"));

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

// Start the server
app.listen(PORT, () => {
    console.log(`🚀 Server running at http://localhost:${PORT}/`);
});
