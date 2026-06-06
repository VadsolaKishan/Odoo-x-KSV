-- ============================================================
-- VendorBridge Demo User Seeds
-- Password for ALL demo accounts: VendorBridge@2026
-- Hash: bcrypt 12 rounds of 'VendorBridge@2026'
-- ============================================================

-- Admin
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'System', 'Admin',
  'admin@vendorbridge.com',
  '$2a$12$9cVRkVEfg2W.5YgQN7UpY.sMrmVI3DKZClfZCwOoejBF2o8zoeddm',
  'admin', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- Procurement Officer
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Priya', 'Sharma',
  'officer@vendorbridge.com',
  '$2a$12$9cVRkVEfg2W.5YgQN7UpY.sMrmVI3DKZClfZCwOoejBF2o8zoeddm',
  'procurement_officer', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- Manager / Approver
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Raj', 'Patel',
  'manager@vendorbridge.com',
  '$2a$12$9cVRkVEfg2W.5YgQN7UpY.sMrmVI3DKZClfZCwOoejBF2o8zoeddm',
  'manager', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- L1 Approver - Rahul Mehta
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Rahul', 'Mehta',
  'rahul@vendorbridge.com',
  '$2a$12$9cVRkVEfg2W.5YgQN7UpY.sMrmVI3DKZClfZCwOoejBF2o8zoeddm',
  'manager', 'India', true
)
ON CONFLICT (email) DO NOTHING;

-- L2 Approver - Priya Shah
INSERT INTO users (first_name, last_name, email, password_hash, role, country, is_active)
VALUES (
  'Priya', 'Shah',
  'priya@vendorbridge.com',
  '$2a$12$9cVRkVEfg2W.5YgQN7UpY.sMrmVI3DKZClfZCwOoejBF2o8zoeddm',
  'manager', 'India', true
)
ON CONFLICT (email) DO NOTHING;
