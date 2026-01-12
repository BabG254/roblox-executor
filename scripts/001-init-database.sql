-- Initialize SQLite database with Prisma migrations
-- This script creates the initial seed data

-- Create default kill switch state (disabled)
INSERT INTO KillSwitch (id, isEnabled, updatedAt) 
VALUES ('default', 0, datetime('now'));

-- Create default system configs
INSERT INTO SystemConfig (id, key, value, updatedAt) VALUES 
('config-1', 'maintenance_mode', 'false', datetime('now')),
('config-2', 'max_sessions_per_user', '3', datetime('now')),
('config-3', 'default_license_duration', '30', datetime('now')),
('config-4', 'license_key_price', '10.00', datetime('now'));
