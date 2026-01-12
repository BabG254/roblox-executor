-- Seed an owner account for initial setup
-- Password: owner123 (bcrypt hash)
INSERT INTO users (id, email, username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'owner-001',
  'owner@nexusx.app',
  'owner',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.2oI7WXf9RP3VZK',
  'OWNER',
  true,
  datetime('now'),
  datetime('now')
)
ON CONFLICT (email) DO NOTHING;

-- Initialize kill switch
INSERT INTO kill_switch (id, is_enabled, created_at, updated_at)
VALUES (
  'main',
  false,
  datetime('now'),
  datetime('now')
)
ON CONFLICT (id) DO NOTHING;

-- Create a sample reseller for testing
INSERT INTO users (id, email, username, password_hash, role, is_active, created_at, updated_at)
VALUES (
  'reseller-001',
  'reseller@nexusx.app',
  'topreseller',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/X4.2oI7WXf9RP3VZK',
  'RESELLER',
  true,
  datetime('now'),
  datetime('now')
)
ON CONFLICT (email) DO NOTHING;

-- Create reseller profile with wallet
INSERT INTO resellers (id, user_id, wallet_balance, total_sales, discount_percent, created_at, updated_at)
VALUES (
  'reseller-profile-001',
  'reseller-001',
  100.00,
  0,
  10,
  datetime('now'),
  datetime('now')
)
ON CONFLICT (user_id) DO NOTHING;
