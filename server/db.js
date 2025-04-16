const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASS || '',
    database: process.env.DB_NAME || 'users_db',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

module.exports = {
    query: (sql, params) => pool.execute(sql, params),
    get: (sql, params) => pool.query(sql, params).then(([rows]) => rows[0]),
    all: (sql, params) => pool.query(sql, params).then(([rows]) => rows),
    run: (sql, params) => pool.execute(sql, params)
};
