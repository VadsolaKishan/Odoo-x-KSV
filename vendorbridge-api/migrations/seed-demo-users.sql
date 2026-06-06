-- ============================================================
-- VendorBridge Demo User Seeds
-- Password for all demo users: Demo@1234
-- Hash generated with bcrypt, 12 rounds
-- ============================================================

-- Admin user
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'System', 'Admin',
  'admin@vendorbridge.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFU.5j4O7sSNT.u',
  'admin', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- Procurement Officer
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Priya', 'Sharma',
  'officer@vendorbridge.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFU.5j4O7sSNT.u',
  'procurement_officer', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- Manager / Approver
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Raj', 'Patel',
  'manager@vendorbridge.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewFU.5j4O7sSNT.u',
  'manager', 'India', true
)
ON CONFLICT (email) DO NOTHING;
