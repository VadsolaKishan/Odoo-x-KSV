import { query } from './db';
import * as fs from 'fs';
import * as path from 'path';

export async function runMigrations() {
  console.log('Starting migrations...');
  try {
    // 1. Run schema.sql (Backend Dev 1's tables)
    const schemaPath = path.join(__dirname, '../../migrations/schema.sql');
    console.log(`Reading base schema from: ${schemaPath}`);
    const baseSchemaSql = fs.readFileSync(schemaPath, 'utf8');
    await query(baseSchemaSql);
    console.log('Base schemas executed successfully.');

    // 2. Run Backend Dev 2's tables
    const backendDev2Sql = `
      -- QUOTATIONS (vendor submissions per RFQ)
      CREATE TABLE IF NOT EXISTS quotations (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
        vendor_id UUID REFERENCES vendors(id) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'submitted', 'selected', 'rejected')),
        subtotal DECIMAL(14,2) NOT NULL DEFAULT 0,
        gst_percentage DECIMAL(5,2) NOT NULL DEFAULT 18.00,
        gst_amount DECIMAL(14,2) NOT NULL DEFAULT 0,
        grand_total DECIMAL(14,2) NOT NULL DEFAULT 0,
        delivery_days INTEGER,
        payment_terms VARCHAR(150),
        notes TEXT,
        submitted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(rfq_id, vendor_id)
      );

      -- QUOTATION LINE ITEMS (vendor's pricing per RFQ line item)
      CREATE TABLE IF NOT EXISTS quotation_line_items (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID REFERENCES quotations(id) ON DELETE CASCADE NOT NULL,
        rfq_line_item_id UUID REFERENCES rfq_line_items(id) NOT NULL,
        item_name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        unit VARCHAR(50) NOT NULL DEFAULT 'NOS',
        unit_price DECIMAL(12,2) NOT NULL,
        total_price DECIMAL(14,2) NOT NULL,
        delivery_days INTEGER
      );

      -- APPROVALS (approval chain records)
      CREATE TABLE IF NOT EXISTS approvals (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        quotation_id UUID REFERENCES quotations(id) NOT NULL,
        rfq_id UUID REFERENCES rfqs(id) NOT NULL,
        vendor_id UUID REFERENCES vendors(id) NOT NULL,
        level INTEGER NOT NULL DEFAULT 1,
        approver_id UUID REFERENCES users(id) NOT NULL,
        approver_name VARCHAR(200) NOT NULL,
        approver_role VARCHAR(100) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
        remarks TEXT,
        actioned_at TIMESTAMPTZ,
        assigned_at TIMESTAMPTZ DEFAULT NOW(),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- PURCHASE ORDERS
      CREATE TABLE IF NOT EXISTS purchase_orders (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        po_number VARCHAR(50) UNIQUE NOT NULL,
        rfq_id UUID REFERENCES rfqs(id) NOT NULL,
        quotation_id UUID REFERENCES quotations(id) NOT NULL,
        vendor_id UUID REFERENCES vendors(id) NOT NULL,
        bill_to_name VARCHAR(255),
        bill_to_address TEXT,
        bill_to_gstin VARCHAR(50),
        subtotal DECIMAL(14,2) NOT NULL,
        cgst_percentage DECIMAL(5,2) DEFAULT 9.00,
        cgst_amount DECIMAL(14,2) NOT NULL,
        sgst_percentage DECIMAL(5,2) DEFAULT 9.00,
        sgst_amount DECIMAL(14,2) NOT NULL,
        grand_total DECIMAL(14,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'generated' CHECK (status IN ('generated', 'sent', 'acknowledged', 'completed')),
        po_date DATE NOT NULL DEFAULT CURRENT_DATE,
        created_by UUID REFERENCES users(id),
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- INVOICES
      CREATE TABLE IF NOT EXISTS invoices (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        invoice_number VARCHAR(50) UNIQUE NOT NULL,
        po_id UUID REFERENCES purchase_orders(id) NOT NULL,
        vendor_id UUID REFERENCES vendors(id) NOT NULL,
        vendor_address TEXT,
        vendor_gstin VARCHAR(50),
        invoice_date DATE NOT NULL DEFAULT CURRENT_DATE,
        due_date DATE NOT NULL,
        subtotal DECIMAL(14,2) NOT NULL,
        cgst_amount DECIMAL(14,2) NOT NULL,
        sgst_amount DECIMAL(14,2) NOT NULL,
        grand_total DECIMAL(14,2) NOT NULL,
        status VARCHAR(30) NOT NULL DEFAULT 'pending_payment' CHECK (status IN ('pending_payment', 'paid', 'overdue', 'cancelled')),
        paid_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        updated_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- ACTIVITY LOGS (IMMUTABLE — never update or delete rows here)
      CREATE TABLE IF NOT EXISTS activity_logs (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('rfq', 'approval', 'invoice', 'vendor', 'quotation', 'po')),
        action VARCHAR(255) NOT NULL,
        description TEXT NOT NULL,
        performed_by UUID REFERENCES users(id),
        performed_by_name VARCHAR(200),
        resource_id UUID,
        resource_type VARCHAR(50),
        meta JSONB,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_quotations_rfq ON quotations(rfq_id);
      CREATE INDEX IF NOT EXISTS idx_quotations_vendor ON quotations(vendor_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_quotation ON approvals(quotation_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_approver ON approvals(approver_id);
      CREATE INDEX IF NOT EXISTS idx_approvals_status ON approvals(status);
      CREATE INDEX IF NOT EXISTS idx_po_rfq ON purchase_orders(rfq_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_po ON invoices(po_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON activity_logs(event_type);
      CREATE INDEX IF NOT EXISTS idx_activity_logs_created ON activity_logs(created_at DESC);
    `;
    await query(backendDev2Sql);
    console.log('Backend Dev 2 schemas executed successfully.');

    // 3. Alter existing tables to add columns if they were created with old schema.sql
    console.log('Running ALTER TABLE statements to align existing tables...');
    const alterSchemaSql = `
      -- Alter approvals
      ALTER TABLE approvals ADD COLUMN IF NOT EXISTS level INTEGER NOT NULL DEFAULT 1;
      ALTER TABLE approvals ADD COLUMN IF NOT EXISTS approver_name VARCHAR(200) NOT NULL DEFAULT 'System';
      ALTER TABLE approvals ADD COLUMN IF NOT EXISTS actioned_at TIMESTAMPTZ;
      ALTER TABLE approvals ADD COLUMN IF NOT EXISTS assigned_at TIMESTAMPTZ DEFAULT NOW();

      -- Alter purchase_orders
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS bill_to_name VARCHAR(255);
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS bill_to_address TEXT;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS bill_to_gstin VARCHAR(50);
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS cgst_percentage DECIMAL(5,2) DEFAULT 9.00;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(14,2) DEFAULT 0.00;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS sgst_percentage DECIMAL(5,2) DEFAULT 9.00;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(14,2) DEFAULT 0.00;
      ALTER TABLE purchase_orders ADD COLUMN IF NOT EXISTS po_date DATE DEFAULT CURRENT_DATE;

      -- Recreate status constraint for purchase_orders to allow 'cancelled'
      ALTER TABLE purchase_orders DROP CONSTRAINT IF EXISTS purchase_orders_status_check;
      ALTER TABLE purchase_orders ADD CONSTRAINT purchase_orders_status_check CHECK (status IN ('generated', 'sent', 'acknowledged', 'completed', 'cancelled'));

      -- Alter invoices
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vendor_address TEXT;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS vendor_gstin VARCHAR(50);
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS invoice_date DATE DEFAULT CURRENT_DATE;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cgst_amount DECIMAL(14,2) DEFAULT 0.00;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS sgst_amount DECIMAL(14,2) DEFAULT 0.00;

      -- Update old invoice status values
      UPDATE invoices SET status = 'pending_payment' WHERE status = 'pending';

      -- Alter invoice status default and check constraint
      ALTER TABLE invoices ALTER COLUMN status SET DEFAULT 'pending_payment';
      ALTER TABLE invoices DROP CONSTRAINT IF EXISTS invoices_status_check;
      ALTER TABLE invoices ADD CONSTRAINT invoices_status_check CHECK (status IN ('pending_payment', 'paid', 'overdue', 'cancelled'));

      -- Alter activity_logs
      ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS meta JSONB;
    `;
    await query(alterSchemaSql);
    console.log('Database schema alterations executed successfully.');

    // 4. Run seeds (if exists)
    const seedPath = path.join(__dirname, '../../migrations/seed-demo-users.sql');
    if (fs.existsSync(seedPath)) {
      console.log(`Reading seed data from: ${seedPath}`);
      const seedsSql = fs.readFileSync(seedPath, 'utf8');
      await query(seedsSql);
      console.log('Demo user seeds executed successfully.');
    }

    console.log('All migrations completed successfully!');
  } catch (error) {
    console.error('Error running migrations:', error);
    throw error;
  }
}

// Allow running directly from command line
if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
