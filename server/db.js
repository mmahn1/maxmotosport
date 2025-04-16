const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root', // Ensure this matches your XAMPP MySQL setup
    password: '', // Ensure this matches your XAMPP MySQL setup
    database: 'users_db', // Update to the correct database name
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: (sql, params) => pool.execute(sql, params),
    get: (sql, params) => pool.query(sql, params),
    all: (sql, params) => pool.query(sql, params),
    run: (sql, params) => pool.execute(sql, params)
};
