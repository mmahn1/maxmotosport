-- Script to update the existing database schema
-- This script will alter existing tables or create new ones if they don't exist

-- Add sqlite3 pragma to disable foreign keys during update
PRAGMA foreign_keys=OFF;

-- Begin transaction
BEGIN TRANSACTION;

-- Table: users
-- Check if users table exists, if not create it
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'user',
    full_name VARCHAR(100),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add missing columns to users table if they don't exist
PRAGMA table_info(users);
-- Add full_name column if it doesn't exist
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN full_name VARCHAR(100)'
    ELSE 
        'SELECT 1' -- Dummy query that does nothing
    END AS sql_to_run
FROM pragma_table_info('users') 
WHERE name='full_name'
INTO @sql;
EXECUTE(@sql);

-- Add phone column if it doesn't exist
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN phone VARCHAR(20)'
    ELSE 
        'SELECT 1' -- Dummy query that does nothing
    END AS sql_to_run
FROM pragma_table_info('users') 
WHERE name='phone'
INTO @sql;
EXECUTE(@sql);

-- Add role column if it doesn't exist
SELECT CASE 
    WHEN COUNT(*) = 0 THEN 
        'ALTER TABLE users ADD COLUMN role VARCHAR(20) NOT NULL DEFAULT "user"'
    ELSE 
        'SELECT 1' -- Dummy query that does nothing
    END AS sql_to_run
FROM pragma_table_info('users') 
WHERE name='role'
INTO @sql;
EXECUTE(@sql);

-- Table: newsletter_subscribers
-- Drop and recreate the table if it exists
DROP TABLE IF EXISTS newsletter_subscribers;
CREATE TABLE newsletter_subscribers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email VARCHAR(100) NOT NULL UNIQUE,
    user_id INTEGER,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: newsletter_archive
-- Create if it doesn't exist
CREATE TABLE IF NOT EXISTS newsletter_archive (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    subject VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    sent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    sent_by INTEGER,
    FOREIGN KEY (sent_by) REFERENCES users(id)
);

-- Table: maintenance_orders
-- Create if it doesn't exist
CREATE TABLE IF NOT EXISTS maintenance_orders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    customer_name VARCHAR(100) NOT NULL,
    phone VARCHAR(20),
    service_type VARCHAR(100) NOT NULL,
    vehicle_info VARCHAR(255) NOT NULL,
    appointment_date DATETIME NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'pending',
    notes TEXT,
    admin_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Table: user_activity
-- Create if it doesn't exist
CREATE TABLE IF NOT EXISTS user_activity (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    activity_type VARCHAR(50) NOT NULL,
    description TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_newsletter_subscribers_email ON newsletter_subscribers(email);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_user_id ON maintenance_orders(user_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_status ON maintenance_orders(status);
CREATE INDEX IF NOT EXISTS idx_maintenance_orders_appointment_date ON maintenance_orders(appointment_date);

-- Commit the transaction
COMMIT;

-- Re-enable foreign key constraints
PRAGMA foreign_keys=ON;

-- Display a message to confirm completion
SELECT 'Database schema update completed successfully' AS Message;
