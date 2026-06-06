-- ============================================================
-- VendorBridge Complete Database Schema
-- ============================================================

-- USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'procurement_officer', 'manager', 'vendor')),
  country VARCHAR(100),
  phone VARCHAR(30),
  additional_info TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- VENDORS TABLE
CREATE TABLE IF NOT EXISTS vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  gst_number VARCHAR(50) UNIQUE NOT NULL,
  contact_name VARCHAR(150),
  contact_phone VARCHAR(30) NOT NULL,
  contact_email VARCHAR(255),
  address TEXT,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('active', 'pending', 'blocked')),
  rating DECIMAL(3,2) DEFAULT 0.00,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ TABLE
CREATE TABLE IF NOT EXISTS rfqs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_number VARCHAR(50) UNIQUE NOT NULL,
  title VARCHAR(255) NOT NULL,
  category VARCHAR(100) NOT NULL,
  description TEXT,
  deadline DATE NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'closed', 'awarded')),
  created_by UUID REFERENCES users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ LINE ITEMS
CREATE TABLE IF NOT EXISTS rfq_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'NOS',
  estimated_unit_price DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ VENDOR ASSIGNMENTS (which vendors are invited to quote)
CREATE TABLE IF NOT EXISTS rfq_vendor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- RFQ ATTACHMENTS
CREATE TABLE IF NOT EXISTS rfq_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- QUOTATIONS TABLE
CREATE TABLE IF NOT EXISTS quotations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'selected', 'rejected')),
  subtotal DECIMAL(14,2) DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) DEFAULT 18.00,
  gst_amount DECIMAL(14,2) DEFAULT 0.00,
  grand_total DECIMAL(14,2) DEFAULT 0.00,
  delivery_days INTEGER,
  payment_terms VARCHAR(150),
  notes TEXT,
  submitted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- QUOTATION LINE ITEMS
CREATE TABLE IF NOT EXISTS quotation_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  rfq_line_item_id UUID REFERENCES rfq_line_items(id),
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'NOS',
  unit_price DECIMAL(12,2) NOT NULL,
  total_price DECIMAL(14,2) NOT NULL,
  delivery_days INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- APPROVALS TABLE (approval chain per quotation)
CREATE TABLE IF NOT EXISTS approvals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
  rfq_id UUID REFERENCES rfqs(id),
  vendor_id UUID REFERENCES vendors(id),
  approver_id UUID REFERENCES users(id),
  approver_role VARCHAR(50),
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  remarks TEXT,
  decided_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- PURCHASE ORDERS
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  po_number VARCHAR(50) UNIQUE NOT NULL,
  quotation_id UUID REFERENCES quotations(id),
  rfq_id UUID REFERENCES rfqs(id),
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'acknowledged', 'completed', 'cancelled')),
  subtotal DECIMAL(14,2) DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) DEFAULT 18.00,
  gst_amount DECIMAL(14,2) DEFAULT 0.00,
  grand_total DECIMAL(14,2) DEFAULT 0.00,
  delivery_days INTEGER,
  payment_terms VARCHAR(150),
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- INVOICES
CREATE TABLE IF NOT EXISTS invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number VARCHAR(50) UNIQUE NOT NULL,
  po_id UUID REFERENCES purchase_orders(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  subtotal DECIMAL(14,2) DEFAULT 0.00,
  gst_percentage DECIMAL(5,2) DEFAULT 18.00,
  gst_amount DECIMAL(14,2) DEFAULT 0.00,
  grand_total DECIMAL(14,2) DEFAULT 0.00,
  due_date DATE,
  paid_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ACTIVITY LOGS
CREATE TABLE IF NOT EXISTS activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL,
  action VARCHAR(150) NOT NULL,
  description TEXT,
  performed_by UUID REFERENCES users(id),
  performed_by_name VARCHAR(255),
  resource_id UUID,
  resource_type VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX IF NOT EXISTS idx_rfq_vendor_assignments_rfq ON rfq_vendor_assignments(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_rfq_id ON quotations(rfq_id);
CREATE INDEX IF NOT EXISTS idx_quotations_vendor_id ON quotations(vendor_id);
CREATE INDEX IF NOT EXISTS idx_quotations_status ON quotations(status);
CREATE INDEX IF NOT EXISTS idx_approvals_quotation_id ON approvals(quotation_id);
CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_vendor_id ON purchase_orders(vendor_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);
CREATE INDEX IF NOT EXISTS idx_invoices_po_id ON invoices(po_id);
CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
CREATE INDEX IF NOT EXISTS idx_activity_logs_event_type ON activity_logs(event_type);
