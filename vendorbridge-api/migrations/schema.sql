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

-- Create indexes for performance if they do not exist
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_rfqs_status ON rfqs(status);
CREATE INDEX IF NOT EXISTS idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX IF NOT EXISTS idx_rfq_vendor_assignments_rfq ON rfq_vendor_assignments(rfq_id);
