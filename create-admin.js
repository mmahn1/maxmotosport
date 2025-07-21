/**
 * Script to create an admin user quickly
 * Run this with: node create-admin.js
 */

require("dotenv").config();
const mysql = require("mysql2");
const bcrypt = require("bcrypt");

// Database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

async function createAdminUser() {
  try {
    console.log("🔧 Connecting to database...");

    // Admin user details
    const adminData = {
      username: "admin",
      email: "admin@maxmotosport.eu",
      password: "admin123", // Change this to a secure password!
      role: "admin",
    };

    // Check if admin user already exists
    db.query(
      "SELECT * FROM users WHERE username = ? OR email = ?",
      [adminData.username, adminData.email],
      async (err, results) => {
        if (err) {
          console.error("❌ Database error:", err);
          process.exit(1);
        }

        if (results.length > 0) {
          console.log("⚠️ Admin user already exists!");

          // Update existing user to admin
          const userId = results[0].id;
          db.query(
            "UPDATE users SET role = ? WHERE id = ?",
            ["admin", userId],
            (updateErr) => {
              if (updateErr) {
                console.error("❌ Error updating user role:", updateErr);
              } else {
                console.log("✅ Updated existing user to admin role");
              }
              process.exit(0);
            }
          );
          return;
        }

        // Create new admin user
        const hashedPassword = await bcrypt.hash(adminData.password, 10);

        db.query(
          "INSERT INTO users (username, email, password_hash, role) VALUES (?, ?, ?, ?)",
          [adminData.username, adminData.email, hashedPassword, adminData.role],
          (insertErr, result) => {
            if (insertErr) {
              console.error("❌ Error creating admin user:", insertErr);
              process.exit(1);
            }

            console.log("✅ Admin user created successfully!");
            console.log("📋 Admin credentials:");
            console.log("   Username:", adminData.username);
            console.log("   Email:", adminData.email);
            console.log("   Password:", adminData.password);
            console.log("   Role: admin");
            console.log("");
            console.log("🚨 IMPORTANT: Change the password after first login!");

            process.exit(0);
          }
        );
      }
    );
  } catch (error) {
    console.error("❌ Error:", error);
    process.exit(1);
  }
}

// Run the script
createAdminUser();
