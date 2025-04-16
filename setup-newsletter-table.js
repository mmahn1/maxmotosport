const mysql = require("mysql");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "",
    database: "max_motosport",
    port: 3306
});

db.connect(err => {
    if (err) {
        console.error("Failed to connect to database:", err);
        process.exit(1);
    }

    console.log("Connected to database");
    
    const recreateTable = `
        DROP TABLE IF EXISTS newsletter;
        
        CREATE TABLE newsletter (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) NOT NULL UNIQUE,
            verified BOOLEAN DEFAULT FALSE,
            verification_token VARCHAR(255),
            subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            verified_at TIMESTAMP NULL
        )
    `;
    
    db.query(recreateTable, (err) => {
        if (err) {
            console.error("Failed to recreate newsletter table:", err);
        } else {
            console.log("✅ Newsletter table recreated successfully");
        }
        
        db.end((err) => {
            if (err) {
                console.error("Error closing database connection:", err);
            }
            console.log("Database connection closed");
        });
    });
});
