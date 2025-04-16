-- Script to create an admin user if it doesn't exist

-- Begin transaction
BEGIN TRANSACTION;

-- Check if admin user already exists
SELECT COUNT(*) FROM users WHERE username = 'admin123' INTO @admin_exists;

-- If admin doesn't exist, create one
INSERT OR IGNORE INTO users 
    (username, email, password_hash, role)
VALUES 
    -- This creates a user with password "amin123"
    ('admin123', 'maxmotosport.shop@gmail.com', '$2b$10$ql0iwPtRNNx0/RD2UbGvXeYIQSX5DHUz/JCAxIA35m.1leheTKI.2', 'admin');

-- Create test user for development purposes (password is "password123")
INSERT OR IGNORE INTO users 
    (username, email, password_hash, role, full_name, phone)
VALUES 
    ('user', 'user@example.com', '$2b$10$3LzV4/fLb9EO60tzra1V1ef1j0mTHOhbUTQHKoM14x5.g0uyOiFNO', 'user', 'Test User', '123-456-7890');

-- Commit the transaction
COMMIT;

-- Display a message to confirm completion
SELECT 'Admin user created successfully' AS Message;
