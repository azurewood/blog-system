-- Insert a default user for testing
INSERT INTO users (id, email, username, password_hash, full_name, role, created_at, updated_at)
VALUES (
    'default-user-id',
    'admin@example.com',
    'admin',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5rJGU.I3kKZ9G', -- password: "password123"
    'Default Admin',
    'admin',
    strftime('%s', 'now'),
    strftime('%s', 'now')
);
