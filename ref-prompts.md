# VendorBridge — Complete Team Build Prompts
## Project: Procurement & Vendor Management ERP
### Hackathon 8-Hour Build | 4-Person Team

---

## TEAM ASSIGNMENT OVERVIEW

| Member | Role | Screens / Modules |
|---|---|---|
| **Backend Dev 1** | API Foundation + Auth + Vendors + RFQ | Auth, Users, Vendors, RFQ APIs |
| **Backend Dev 2** | Quotations + Approvals + PO/Invoice + Logs | Quotation, Approval, PO, Invoice, Activity, Reports |
| **Frontend Dev 1** | Login, Register, Dashboard, Vendors Page | Screens 1–4 |
| **Frontend Dev 2** | RFQ, Quotations, Comparison, Approval, PO/Invoice, Activity, Reports | Screens 5–11 |

---

---

# ═══════════════════════════════════════════════════
# BACKEND DEV 1 — Foundation, Auth, Vendors, RFQ
# ═══════════════════════════════════════════════════

## Your Mission
You are building the entire backend foundation for VendorBridge — a Procurement & Vendor Management ERP. Your job covers project setup, authentication, vendor management, and RFQ (Request for Quotation) APIs. You are using **Node.js + Express + TypeScript + Neon PostgreSQL (pg driver)**.

---

## CHUNK B1-1: Project Setup & Database Schema

### Tech Stack
- **Runtime**: Node.js 18+
- **Framework**: Express.js with TypeScript
- **Database**: Neon PostgreSQL (use `pg` package + connection string from `.env`)
- **ORM**: Raw SQL with `pg` pool (no Prisma, no Sequelize — keep it lean for hackathon)
- **Auth**: JWT (jsonwebtoken) + bcryptjs
- **Validation**: zod
- **CORS**: cors package
- **Environment**: dotenv
- **Dev**: nodemon + ts-node

### Project Structure to Create
```
vendorbridge-api/
├── src/
│   ├── config/
│   │   └── db.ts              ← Neon PostgreSQL pool setup
│   ├── middleware/
│   │   ├── auth.ts            ← JWT verification middleware
│   │   ├── errorHandler.ts    ← Global error handler
│   │   └── validate.ts        ← Zod validation middleware
│   ├── routes/
│   │   ├── index.ts           ← Route aggregator
│   │   ├── auth.routes.ts
│   │   ├── vendor.routes.ts
│   │   └── rfq.routes.ts
│   ├── controllers/
│   │   ├── auth.controller.ts
│   │   ├── vendor.controller.ts
│   │   └── rfq.controller.ts
│   ├── models/
│   │   └── types.ts           ← TypeScript interfaces for all DB entities
│   └── app.ts                 ← Express app setup
├── package.json
├── tsconfig.json
└── .env.example
```

### Database Schema — Run These SQL Migrations on Neon

```sql
-- USERS TABLE
CREATE TABLE users (
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
CREATE TABLE vendors (
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
CREATE TABLE rfqs (
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
CREATE TABLE rfq_line_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  item_name VARCHAR(255) NOT NULL,
  quantity INTEGER NOT NULL,
  unit VARCHAR(50) NOT NULL DEFAULT 'NOS',
  estimated_unit_price DECIMAL(12,2),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RFQ VENDOR ASSIGNMENTS (which vendors are invited to quote)
CREATE TABLE rfq_vendor_assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  vendor_id UUID REFERENCES vendors(id) NOT NULL,
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(rfq_id, vendor_id)
);

-- RFQ ATTACHMENTS
CREATE TABLE rfq_attachments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  rfq_id UUID REFERENCES rfqs(id) ON DELETE CASCADE NOT NULL,
  file_name VARCHAR(255) NOT NULL,
  file_url TEXT NOT NULL,
  uploaded_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_vendors_status ON vendors(status);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_rfqs_status ON rfqs(status);
CREATE INDEX idx_rfqs_created_by ON rfqs(created_by);
CREATE INDEX idx_rfq_vendor_assignments_rfq ON rfq_vendor_assignments(rfq_id);
```

### src/config/db.ts — Neon PostgreSQL Pool
```typescript
import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
```

### src/models/types.ts — All TypeScript Interfaces
Define these interfaces exactly:
```typescript
export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password_hash: string;
  role: 'admin' | 'procurement_officer' | 'manager' | 'vendor';
  country?: string;
  phone?: string;
  additional_info?: string;
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Vendor {
  id: string;
  name: string;
  category: string;
  gst_number: string;
  contact_name?: string;
  contact_phone: string;
  contact_email?: string;
  address?: string;
  status: 'active' | 'pending' | 'blocked';
  rating: number;
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RFQ {
  id: string;
  rfq_number: string;
  title: string;
  category: string;
  description?: string;
  deadline: Date;
  status: 'draft' | 'published' | 'closed' | 'awarded';
  created_by: string;
  created_at: Date;
  updated_at: Date;
}

export interface RFQLineItem {
  id: string;
  rfq_id: string;
  item_name: string;
  quantity: number;
  unit: string;
  estimated_unit_price?: number;
}

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}
```

---

## CHUNK B1-2: Auth API (Register + Login + Middleware)

### Full Auth Controller — src/controllers/auth.controller.ts

Implement these 3 endpoints with full validation and error handling:

#### POST /api/auth/register
- Accept body: `{ first_name, last_name, email, password, role, country, phone, additional_info }`
- Validate with Zod: email format, password min 8 chars, role must be one of enum values
- Hash password with `bcryptjs` (rounds: 12)
- Insert into `users` table
- Return JWT access token + user object (without password_hash)
- On duplicate email: return 409 Conflict with message "Email already registered"

#### POST /api/auth/login
- Accept body: `{ email, password }`
- Find user by email, compare password hash
- If invalid: return 401 with "Invalid credentials"
- If user inactive: return 403 "Account disabled"
- Return JWT token (expires: '7d') + user object
- JWT payload must contain: `{ userId, email, role }`

#### GET /api/auth/me
- Protected by `authMiddleware`
- Return current user's profile from DB (no password_hash)
- Status 200 with user object

### Auth Middleware — src/middleware/auth.ts
```typescript
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWTPayload } from '../models/types';

declare global {
  namespace Express {
    interface Request {
      user?: JWTPayload;
    }
  }
}

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

export const requireRole = (...roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }
    next();
  };
};
```

---

## CHUNK B1-3: Vendors API — Full CRUD + Filters

### All Vendor Endpoints (src/controllers/vendor.controller.ts)

#### GET /api/vendors
- Auth required
- Query params: `?status=active&category=IT&search=techcore&page=1&limit=10`
- `search` should ILIKE on name, gst_number
- `status` filter: active | pending | blocked | (all if not provided)
- `category` filter
- Return: `{ success, data: vendors[], total, page, limit }`
- Also return counts: `{ all: 28, active: 21, pending: 4, blocked: 3 }` (as `statusCounts`)

#### GET /api/vendors/:id
- Auth required
- Return full vendor object
- 404 if not found

#### POST /api/vendors
- Auth required, role: admin or procurement_officer
- Body: `{ name, category, gst_number, contact_name, contact_phone, contact_email, address }`
- Validate with Zod
- Default status: 'pending'
- Return created vendor

#### PUT /api/vendors/:id
- Auth required, role: admin or procurement_officer
- Update any fields
- Also supports `{ status: 'active' | 'blocked' }` to change status
- Return updated vendor

#### DELETE /api/vendors/:id
- Auth required, role: admin only
- Soft approach: set `status = 'blocked'` — never actually delete
- Return 200 with message

### Vendor Routes — src/routes/vendor.routes.ts
```typescript
import { Router } from 'express';
import { authMiddleware, requireRole } from '../middleware/auth';
import * as vc from '../controllers/vendor.controller';

const router = Router();

router.get('/', authMiddleware, vc.getVendors);
router.get('/:id', authMiddleware, vc.getVendorById);
router.post('/', authMiddleware, requireRole('admin', 'procurement_officer'), vc.createVendor);
router.put('/:id', authMiddleware, requireRole('admin', 'procurement_officer'), vc.updateVendor);
router.delete('/:id', authMiddleware, requireRole('admin'), vc.deleteVendor);

export default router;
```

---

## CHUNK B1-4: RFQ API — Full Create, Read, Assign Vendors

### All RFQ Endpoints (src/controllers/rfq.controller.ts)

#### GET /api/rfqs
- Auth required
- Query params: `?status=published&page=1&limit=10`
- Return rfqs with creator name (JOIN users), line_items count, vendor_count
- Sort by created_at DESC

#### GET /api/rfqs/:id
- Auth required
- Return full RFQ object including:
  - `line_items`: array of all line items
  - `assigned_vendors`: array of vendor objects assigned to this RFQ
  - `attachments`: array of attachment objects
  - `creator`: `{ id, first_name, last_name, email }`

#### POST /api/rfqs
- Auth required, role: procurement_officer or admin
- Body:
```json
{
  "title": "Office Furniture procurement Q2",
  "category": "Furniture",
  "description": "Ergonomic chairs and standing desks for 3rd floor",
  "deadline": "2025-06-15",
  "status": "draft",
  "line_items": [
    { "item_name": "Ergonomic chair", "quantity": 25, "unit": "NOS" },
    { "item_name": "Standing desks", "quantity": 10, "unit": "NOS" }
  ],
  "vendor_ids": ["uuid1", "uuid2"]
}
```
- Auto-generate rfq_number: `RFQ-2025-XXXX` (padded sequential)
- Insert RFQ, then insert line_items in loop, then vendor_assignments in loop
- Use a DB transaction (BEGIN/COMMIT/ROLLBACK)
- Return full created RFQ with line_items

#### PATCH /api/rfqs/:id/status
- Auth required
- Body: `{ status: 'published' | 'closed' | 'awarded' | 'draft' }`
- Update status
- When published: triggers activity log entry (call the activity log insert — coordinate with Backend Dev 2 for the shared function)

#### PUT /api/rfqs/:id
- Auth required
- Update title, category, description, deadline, line_items (replace all), vendor_ids (replace all)
- Use transaction

#### DELETE /api/rfqs/:id
- Auth required, role: admin or creator only
- Only deletable if status is 'draft'
- Return 400 if not draft: "Cannot delete a published RFQ"

### RFQ Utility — Auto-generate RFQ Number
```typescript
async function generateRFQNumber(): Promise<string> {
  const result = await query("SELECT COUNT(*) FROM rfqs");
  const count = parseInt(result.rows[0].count) + 1;
  return `RFQ-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;
}
```

---

## CHUNK B1-5: App Setup, CORS, Error Handler, Server

### src/app.ts
```typescript
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes';
import vendorRoutes from './routes/vendor.routes';
import rfqRoutes from './routes/rfq.routes';
import { errorHandler } from './middleware/errorHandler';

dotenv.config();
const app = express();

app.use(cors({
  origin: [process.env.FRONTEND_URL || 'http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_, res) => res.json({ status: 'ok', timestamp: new Date().toISOString() }));

app.use('/api/auth', authRoutes);
app.use('/api/vendors', vendorRoutes);
app.use('/api/rfqs', rfqRoutes);

app.use(errorHandler);

export default app;
```

### src/middleware/errorHandler.ts
Global error handler — catch all unhandled errors, return consistent JSON:
```typescript
import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err.message);
  const status = err.status || 500;
  const message = err.message || 'Internal server error';
  // Handle PostgreSQL unique constraint violations
  if (err.code === '23505') {
    return res.status(409).json({ success: false, message: 'Duplicate entry', detail: err.detail });
  }
  return res.status(status).json({ success: false, message });
};
```

### Standard API Response Format
ALL controllers must return this format:
```typescript
// Success: { success: true, message: string, data: any, meta?: any }
// Error: { success: false, message: string, errors?: any }
res.status(201).json({ success: true, message: 'Vendor created', data: vendor });
res.status(200).json({ success: true, data: vendors, meta: { total, page, limit } });
res.status(400).json({ success: false, message: 'Validation failed', errors: zodError.errors });
```

### .env.example
```
DATABASE_URL=postgresql://user:pass@ep-xxx.neon.tech/vendorbridge?sslmode=require
JWT_SECRET=your_super_secret_key_here_min_32_chars
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

---

## API ENDPOINTS SUMMARY (Backend Dev 1)
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/vendors
GET    /api/vendors/:id
POST   /api/vendors
PUT    /api/vendors/:id
DELETE /api/vendors/:id

GET    /api/rfqs
GET    /api/rfqs/:id
POST   /api/rfqs
PUT    /api/rfqs/:id
PATCH  /api/rfqs/:id/status
DELETE /api/rfqs/:id
```

---

---

# ═══════════════════════════════════════════════════
# BACKEND DEV 2 — Quotations, Approvals, PO, Invoice, Activity, Reports
# ═══════════════════════════════════════════════════

## Your Mission
You are building the procurement workflow engine for VendorBridge. Your work covers quotation submission, comparison, approval chains, purchase order generation, invoice management, activity logs, and analytics reports. Use the same Node.js + Express + TypeScript + Neon PostgreSQL setup as Backend Dev 1 — you are adding routes to the same Express app.

---

## CHUNK B2-1: Additional Database Tables

Run these on Neon PostgreSQL (in addition to Backend Dev 1's tables):

```sql
-- QUOTATIONS (vendor submissions per RFQ)
CREATE TABLE quotations (
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
CREATE TABLE quotation_line_items (
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
CREATE TABLE approvals (
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
CREATE TABLE purchase_orders (
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
CREATE TABLE invoices (
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
CREATE TABLE activity_logs (
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
CREATE INDEX idx_quotations_rfq ON quotations(rfq_id);
CREATE INDEX idx_quotations_vendor ON quotations(vendor_id);
CREATE INDEX idx_approvals_quotation ON approvals(quotation_id);
CREATE INDEX idx_approvals_approver ON approvals(approver_id);
CREATE INDEX idx_approvals_status ON approvals(status);
CREATE INDEX idx_po_rfq ON purchase_orders(rfq_id);
CREATE INDEX idx_invoices_po ON invoices(po_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_activity_logs_type ON activity_logs(event_type);
CREATE INDEX idx_activity_logs_created ON activity_logs(created_at DESC);
```

### IMPORTANT — Activity Log Helper (share this with Backend Dev 1 via a shared utility file)
Create `src/utils/activityLogger.ts`:
```typescript
import { query } from '../config/db';

export async function logActivity(params: {
  event_type: 'rfq' | 'approval' | 'invoice' | 'vendor' | 'quotation' | 'po';
  action: string;
  description: string;
  performed_by?: string;
  performed_by_name?: string;
  resource_id?: string;
  resource_type?: string;
  meta?: object;
}) {
  await query(
    `INSERT INTO activity_logs 
     (event_type, action, description, performed_by, performed_by_name, resource_id, resource_type, meta)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
    [
      params.event_type, params.action, params.description,
      params.performed_by || null, params.performed_by_name || null,
      params.resource_id || null, params.resource_type || null,
      params.meta ? JSON.stringify(params.meta) : null
    ]
  );
}
```

---

## CHUNK B2-2: Quotations API

### All Quotation Endpoints (src/controllers/quotation.controller.ts)

#### GET /api/quotations?rfq_id=xxx
- Auth required
- Returns all quotations for a specific RFQ
- Include: `vendor` object, `line_items` array
- Only accessible by procurement_officer, admin, or manager

#### GET /api/quotations/:id
- Auth required
- Return full quotation with line_items and vendor info

#### POST /api/quotations
- Used by vendor role to submit a quotation
- Body:
```json
{
  "rfq_id": "uuid",
  "vendor_id": "uuid",
  "gst_percentage": 18,
  "delivery_days": 10,
  "payment_terms": "Payment terms: 20 days net",
  "notes": "Additional notes",
  "line_items": [
    {
      "rfq_line_item_id": "uuid",
      "item_name": "Ergonomic chair",
      "quantity": 25,
      "unit": "NOS",
      "unit_price": 3500,
      "delivery_days": 10
    }
  ]
}
```
- Calculate totals server-side:
  - `total_price = quantity * unit_price` for each line item
  - `subtotal = SUM(total_price)`
  - `gst_amount = subtotal * (gst_percentage / 100)`
  - `grand_total = subtotal + gst_amount`
- Status: 'draft' initially
- Check vendor was assigned to this RFQ (check `rfq_vendor_assignments`)
- Use DB transaction

#### PATCH /api/quotations/:id/submit
- Auth required (vendor role)
- Change status from 'draft' to 'submitted'
- Set `submitted_at = NOW()`
- Log activity: "Quotation submitted by {vendor_name} for {rfq_title}"

#### GET /api/quotations/compare/:rfq_id
- Auth required (procurement_officer, admin, manager)
- Return all SUBMITTED quotations for an RFQ, sorted by grand_total ASC
- Response format:
```json
{
  "rfq": { ...rfq_details },
  "quotations": [
    {
      "id": "...",
      "vendor": { "id", "name", "rating" },
      "grand_total": 185000,
      "gst_percentage": 18,
      "delivery_days": 10,
      "payment_terms": "30 days",
      "is_lowest": true
    }
  ]
}
```
- Mark `is_lowest: true` on the lowest grand_total quotation

#### PATCH /api/quotations/:id/select
- Auth required (procurement_officer or admin)
- Change this quotation to status 'selected'
- Change all other quotations for same RFQ to 'rejected'
- Automatically trigger approval workflow creation (call `createApprovalChain` function)
- Log activity

---

## CHUNK B2-3: Approvals API

### Approval Chain Logic

When a quotation is selected, auto-create 2 approval levels:
```typescript
async function createApprovalChain(quotationId: string, rfqId: string, vendorId: string, pool: Pool) {
  // Level 1: Procurement Head (mock name: Rahul Mehta)
  // Level 2: Finance Manager (mock name: Priya Shah)
  // In real app, look up approvers from users by role
  // For hackathon, create approvals with status 'pending' for level 1
  // Level 2 stays 'pending' until level 1 approves
}
```

### All Approval Endpoints (src/controllers/approval.controller.ts)

#### GET /api/approvals
- Auth required
- Query params: `?status=pending&rfq_id=xxx`
- Returns approval records with associated quotation, vendor, rfq info

#### GET /api/approvals/:quotation_id
- Returns the full approval chain for a quotation
- Shows all levels, who approved what, timeline
- Response includes: approval chain with approver names, status, timestamps

#### PATCH /api/approvals/:id/approve
- Auth required (manager, admin)
- Body: `{ remarks: "Approved with conditions..." }`
- Mark current level as 'approved', set `actioned_at`
- If this is level 1 and level 2 exists: change level 2 status from pending to 'awaiting' (or keep as pending but update `assigned_at`)
- If final level approved: trigger PO generation automatically
- Log activity: "Approved by {approver_name} - Level {level}"

#### PATCH /api/approvals/:id/reject
- Auth required (manager, admin)
- Body: `{ remarks: "Reason for rejection" }`
- Mark as 'rejected'
- All subsequent levels stay pending
- Set quotation status back to 'submitted' (allowing re-evaluation)
- Log activity: "Rejected by {approver_name}"

---

## CHUNK B2-4: Purchase Order & Invoice API

### PO Generation Function
Called automatically after final approval, or manually via API:
```typescript
async function generatePO(quotationId: string, userId: string) {
  // Fetch quotation + rfq + vendor
  // Generate PO number: PO-{YEAR}-{padded count}
  // Insert purchase_orders record
  // Auto-generate invoice (see below)
  // Log activity
  return { po, invoice };
}
```

### All PO/Invoice Endpoints

#### GET /api/purchase-orders
- Auth required
- Query params: `?status=generated&page=1&limit=10`
- Return POs with vendor name, RFQ title, total
- Sort by created_at DESC

#### GET /api/purchase-orders/:id
- Full PO with: vendor details, line items (from quotation), invoice info

#### GET /api/invoices
- Auth required
- Query params: `?status=pending_payment`
- Return invoices with PO number, vendor name, due_date, grand_total

#### GET /api/invoices/:id
- Full invoice details for display/print/download

#### PATCH /api/invoices/:id/mark-paid
- Auth required (admin, manager)
- Set status to 'paid', set `paid_at = NOW()`
- Log activity

#### POST /api/invoices/:id/send-email
- Auth required
- In hackathon: just log the action + return success (no real email sending needed, or use Nodemailer if time permits)
- Log activity: "Invoice emailed to vendor"

---

## CHUNK B2-5: Activity Logs + Reports API

### Activity Logs Endpoints (src/controllers/activity.controller.ts)

#### GET /api/activity-logs
- Auth required
- Query params: `?event_type=rfq&page=1&limit=20`
- Filter by event_type: all | rfq | approval | invoice | vendor | quotation | po
- Sort by created_at DESC always
- Return: `{ logs: [...], total, page, limit }`
- Response includes: `{ id, event_type, description, performed_by_name, created_at, resource_type, resource_id }`

**CRITICAL**: This table is read-only from the API. Never expose any UPDATE or DELETE endpoints for activity_logs. All writes happen internally via the `logActivity()` utility.

### Reports Endpoints (src/controllers/reports.controller.ts)

#### GET /api/reports/summary
- Auth required (admin, manager)
- Returns dashboard stats for the reports page:
```json
{
  "total_spend": 1240000,
  "active_vendors": 21,
  "po_fulfillment_rate": 94,
  "overdue_invoices": 3,
  "month": "May 2025"
}
```
Queries:
- `total_spend`: SUM of grand_total from invoices WHERE status != 'cancelled' AND invoice_date in current month
- `active_vendors`: COUNT from vendors WHERE status = 'active'
- `po_fulfillment_rate`: (completed POs / total POs) * 100
- `overdue_invoices`: COUNT from invoices WHERE status = 'overdue' OR (status='pending_payment' AND due_date < NOW())

#### GET /api/reports/monthly-spend
- Auth required
- Returns last 6 months of spending data for chart
```json
{
  "data": [
    { "month": "Dec 2024", "amount": 890000 },
    { "month": "Jan 2025", "amount": 1100000 },
    ...
  ]
}
```
Query: GROUP BY date_trunc('month', invoice_date), SUM(grand_total) for last 6 months

#### GET /api/reports/vendor-performance
- Auth required
- Returns top 5 vendors by PO count + average rating + total spend
- Exportable data

---

## API ENDPOINTS SUMMARY (Backend Dev 2)
```
GET    /api/quotations?rfq_id=xxx
GET    /api/quotations/:id
POST   /api/quotations
PATCH  /api/quotations/:id/submit
GET    /api/quotations/compare/:rfq_id
PATCH  /api/quotations/:id/select

GET    /api/approvals
GET    /api/approvals/:quotation_id
PATCH  /api/approvals/:id/approve
PATCH  /api/approvals/:id/reject

GET    /api/purchase-orders
GET    /api/purchase-orders/:id

GET    /api/invoices
GET    /api/invoices/:id
PATCH  /api/invoices/:id/mark-paid
POST   /api/invoices/:id/send-email

GET    /api/activity-logs
GET    /api/reports/summary
GET    /api/reports/monthly-spend
GET    /api/reports/vendor-performance
```

---

---

# ═══════════════════════════════════════════════════
# FRONTEND DEV 1 — Screens 1, 2, 3, 4
# (Login, Register, Dashboard, Vendors Page)
# ═══════════════════════════════════════════════════

## Your Mission
You are building the first 4 screens of VendorBridge using **React + TypeScript + Vite + Tailwind CSS**. You own the authentication flow, main dashboard, and vendor management UI. The design language is a premium ERP dark-mode glassmorphism/neumorphism hybrid. Think Figma meets enterprise dashboard — sophisticated, clean, not "AI-generated looking."

---

## CHUNK F1-1: Project Setup + Design System + Layout Shell

### Project Init
```bash
npm create vite@latest vendorbridge-frontend -- --template react-ts
cd vendorbridge-frontend
npm install tailwindcss postcss autoprefixer
npm install react-router-dom axios react-hot-toast lucide-react recharts
npm install @tanstack/react-query zustand
npx tailwindcss init -p
```

### Design System — The Most Important Part

**Color Palette** (add to tailwind.config.js AND as CSS variables):
```css
:root {
  /* Primary brand */
  --brand-green: #10b981;       /* emerald-500 — primary CTA */
  --brand-green-dark: #059669;  /* emerald-600 — hover */
  --brand-green-glow: rgba(16, 185, 129, 0.15); /* subtle glow */

  /* Dark backgrounds (layered) */
  --bg-base: #0a0f0d;           /* deepest background */
  --bg-surface: #111917;        /* cards, panels */
  --bg-elevated: #1a2e25;       /* modals, dropdowns */
  --bg-glass: rgba(26, 46, 37, 0.7); /* glassmorphism */

  /* Text */
  --text-primary: #e2e8f0;      /* main text */
  --text-secondary: #94a3b8;    /* muted text */
  --text-accent: #10b981;       /* accent text */

  /* Borders */
  --border-subtle: rgba(255,255,255,0.06);
  --border-green: rgba(16, 185, 129, 0.3);

  /* Status colors */
  --status-active: #10b981;
  --status-pending: #f59e0b;
  --status-blocked: #ef4444;
  --status-draft: #6b7280;

  /* Shadows */
  --shadow-card: 0 4px 24px rgba(0, 0, 0, 0.4);
  --shadow-glow: 0 0 20px rgba(16, 185, 129, 0.2);
}
```

**tailwind.config.js** — extend with these custom values:
```javascript
module.exports = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: { green: '#10b981', dark: '#059669' },
        surface: { base: '#0a0f0d', card: '#111917', elevated: '#1a2e25' },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backdropBlur: { xs: '2px' },
      boxShadow: {
        'glow': '0 0 20px rgba(16, 185, 129, 0.2)',
        'card': '0 4px 24px rgba(0, 0, 0, 0.4)',
      }
    },
  },
  plugins: [],
};
```

**CSS in index.css** — Import Inter font + base styles:
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  background-color: #0a0f0d;
  color: #e2e8f0;
  font-family: 'Inter', sans-serif;
}

/* Glassmorphism card utility */
.glass-card {
  background: rgba(26, 46, 37, 0.6);
  backdrop-filter: blur(12px);
  border: 1px solid rgba(16, 185, 129, 0.15);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.4);
}

/* Input field base */
.input-field {
  background: rgba(10, 15, 13, 0.8);
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: #e2e8f0;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  transition: border-color 0.2s;
}
.input-field:focus {
  outline: none;
  border-color: rgba(16, 185, 129, 0.5);
  box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.08);
}
```

### Axios Setup + Auth Store
**src/lib/axios.ts** — Configure base URL + JWT interceptor:
```typescript
import axios from 'axios';

const api = axios.create({ baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5000/api' });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('vb_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vb_token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
```

**src/store/auth.store.ts** — Zustand auth store:
```typescript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User { id: string; first_name: string; last_name: string; email: string; role: string; }
interface AuthState {
  user: User | null;
  token: string | null;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  isAuthenticated: boolean;
}

export const useAuthStore = create<AuthState>()(
  persist((set) => ({
    user: null, token: null, isAuthenticated: false,
    setAuth: (user, token) => {
      localStorage.setItem('vb_token', token);
      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('vb_token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  }), { name: 'vb-auth' })
);
```

### App Router Setup — src/App.tsx
```tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useAuthStore } from './store/auth.store';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import VendorsPage from './pages/VendorsPage';
// Import Frontend Dev 2's pages when they push:
// import RFQPage from './pages/RFQPage';
// etc.

const queryClient = new QueryClient();

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#111917', color: '#e2e8f0', border: '1px solid rgba(16,185,129,0.2)' }
        }} />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/vendors" element={<ProtectedRoute><VendorsPage /></ProtectedRoute>} />
          {/* Add more routes as Frontend Dev 2 builds them */}
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
```

### Shared Layout Component — src/components/Layout/Sidebar.tsx
This sidebar is shared with Frontend Dev 2. Build it well — they'll import it.
Navigation items from the SVG layout:
- Dashboard
- Vendors
- RFQ's
- Quotations
- Approvals
- Purchase Orders
- Invoices
- Reports
- Activity

Sidebar design specs:
- Fixed left sidebar, width: 240px
- Dark background: `bg-surface-card` (#111917)
- Logo at top: "VendorBridge" with a small green circle icon
- Each nav item: icon from lucide-react + label
- Active state: `bg-brand-green/10 text-brand-green border-l-2 border-brand-green`
- Hover: subtle green glow
- Bottom: user avatar + name + logout button
- Create a `MainLayout` wrapper that renders `<Sidebar />` + `<main className="ml-60 flex-1 min-h-screen bg-surface-base p-8">`

---

## CHUNK F1-2: Screen 1 — Login Page

### File: src/pages/LoginPage.tsx

**Layout Reference (from SVG Screen 1)**:
- Full viewport, centered vertically + horizontally
- Left half: Large "VendorBridge" branding + tagline
- Right half: Login form card

**Exact Render Specification**:

```
┌─────────────────────────────────────────────────────┐
│                 FULL PAGE (bg: #0a0f0d)              │
│  ┌───────────────────┐  ┌────────────────────────┐  │
│  │   LEFT PANEL      │  │  RIGHT PANEL           │  │
│  │                   │  │  (glass-card, rounded) │  │
│  │  🟢 VendorBridge  │  │                        │  │
│  │                   │  │  Sign in to your acc   │  │
│  │  "Procurement &   │  │                        │  │
│  │   Vendor ERP"     │  │  [Username / Email  ]  │  │
│  │                   │  │  [Password          ]  │  │
│  │  ● Streamline     │  │                        │  │
│  │  ● Track          │  │  Forgot password?      │  │
│  │  ● Optimize       │  │                        │  │
│  │                   │  │  [  Login Button    ]  │  │
│  │                   │  │  ── or ──              │  │
│  │                   │  │  [  Register        ]  │  │
│  └───────────────────┘  └────────────────────────┘  │
└─────────────────────────────────────────────────────┘
```

**Component Implementation Requirements**:
- The form card must be a glassmorphism card (`glass-card` class)
- Email input: type="email", placeholder="Email address", icon: `<Mail />` from lucide-react inside input
- Password input: type="password", placeholder="Password", icon: `<Lock />`, toggle show/hide with `<Eye />` / `<EyeOff />` button
- Login button: full width, brand green gradient background (`bg-gradient-to-r from-emerald-500 to-emerald-600`), white text, loading spinner state
- "Forgot password?" link: right-aligned, small, text-emerald-400
- "Don't have an account? Register" link below the button → navigate to /register
- On form submit: call POST /api/auth/login, store token + user via `useAuthStore().setAuth()`, redirect to /
- Show toast on error: "Invalid credentials"
- Show toast on success: "Welcome back, {first_name}!"
- Validation: both fields required, email must be valid format
- Show loading state on button during API call (spinner icon + disabled)

**Left panel design**:
- Large VendorBridge text (font-bold, text-3xl) with small green square logo before it
- Tagline: "Streamline your procurement workflow"
- 3 bullet points with green check icons: "Manage vendors efficiently", "Track RFQs in real-time", "Automated approval workflows"

---

## CHUNK F1-3: Screen 2 — Register Page

### File: src/pages/RegisterPage.tsx

**Layout Reference (from SVG Screen 2)**:
```
┌────────────────────────────────────────────────────────────────────┐
│          Registration Screen  (bg: #0a0f0d, centered)              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                  REGISTRATION FORM CARD (glass)              │  │
│  │   [Photo circle]                                             │  │
│  │   [First Name        ]   [Last Name           ]             │  │
│  │   [Email Address     ]   [Phone Number        ]             │  │
│  │   [Role dropdown     ]   [Country dropdown    ]             │  │
│  │   [Additional Information (textarea)          ]             │  │
│  │   [            Register Button               ]             │  │
│  └──────────────────────────────────────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────┘
```

**Field Specifications**:
- Profile photo: circular avatar placeholder with upload icon, `<User />` icon in center, click to upload (for hackathon: just UI, no actual upload)
- First Name + Last Name: side by side (grid-cols-2)
- Email Address + Phone Number: side by side (grid-cols-2)
- Role dropdown: options = `[{ value: 'procurement_officer', label: 'Procurement Officer' }, { value: 'manager', label: 'Manager / Approver' }, { value: 'vendor', label: 'Vendor' }, { value: 'admin', label: 'Admin' }]`
- Country dropdown: at minimum include India + 5-6 other countries
- Additional Information: `<textarea>` rows=3, placeholder="Any additional details..."
- Register button: same style as Login button (brand green gradient, full width, loading state)
- Below button: "Already have an account? Sign in" → /login link
- On submit: call POST /api/auth/register, on success: redirect to /login with toast "Registration successful! Please sign in."

---

## CHUNK F1-4: Screen 3 — Dashboard Page

### File: src/pages/DashboardPage.tsx

**Layout Reference (from SVG Screen 3)**:
```
┌─────────────────────────────────────────────────────────────────┐
│ SIDEBAR (fixed, 240px) │        MAIN CONTENT                    │
│                        │  ┌─────────────────────────────────┐   │
│  - Dashboard ◀ active  │  │  Welcome back, Procurement...   │   │
│  - Vendors             │  └─────────────────────────────────┘   │
│  - RFQ's               │                                         │
│  - Quotations          │  ┌─────┐  ┌─────┐  ┌──────┐  ┌─────┐ │
│  - Approvals           │  │ 12  │  │  5  │  │$2.3L │  │  3  │ │
│  - Purchase orders     │  │Act. │  │Pend.│  │ POs  │  │Over.│ │
│  - Invoices            │  │RFQs │  │Appr │  │month │  │Inv. │ │
│  - Reports             │  └─────┘  └─────┘  └──────┘  └─────┘ │
│  - Activity            │                                         │
│                        │  ┌────────────────┐ ┌───────────────┐  │
│  [User avatar]         │  │ Recent POs     │ │Spending Trend │  │
│  [Name]                │  │ table          │ │ chart (bar)   │  │
│  [Logout]              │  └────────────────┘ └───────────────┘  │
│                        │                                         │
│                        │  [+ new RFQ] [Add Vendor] [Invoices]   │
└─────────────────────────────────────────────────────────────────┘
```

**Stats Cards (4 cards, grid-cols-4)**:
Use API data from GET /api/reports/summary. Show:
1. **Active RFQs** — number + "Active RFQ's" label + `<FileText />` icon (blue tint)
2. **Pending Approvals** — number + "Pending Approvals" label + `<Clock />` icon (amber tint)
3. **POs This Month** — `$2.3L` format + "PO's this month" label + `<ShoppingCart />` icon (green tint)
4. **Overdue Invoices** — number + "overdue invoices" label + `<AlertCircle />` icon (red tint)

Each card: `glass-card` with colored left border + colored icon background (10% opacity circle), large bold number, small label below.

**Recent Purchase Orders Table**:
- Fetch from GET /api/purchase-orders?limit=5
- Columns: PO# | Vendor | Amount | Status
- Status badge: green pill for Approved, amber for Pending, gray for draft
- Row hover: subtle green tint

**Spending Trends Chart**:
- Use `recharts` BarChart
- Fetch from GET /api/reports/monthly-spend
- X-axis: month names, Y-axis: amount in Lakhs
- Bar color: #10b981 (emerald), hover: #059669
- Dark background, white axis labels

**Quick Action Buttons (bottom)**:
- "+ new RFQ" → navigate to /rfq/new (Frontend Dev 2's page)
- "Add Vendor" → navigate to /vendors with modal open flag
- "view Invoices" → navigate to /invoices

**Data Fetching**:
- Use `@tanstack/react-query` for all API calls
- Show skeleton loaders while data is loading (animated pulse divs)
- Show error states gracefully

---

## CHUNK F1-5: Screen 4 — Vendors Page

### File: src/pages/VendorsPage.tsx

**Layout Reference (from SVG Screen 4)**:
```
SIDEBAR │ MAIN CONTENT
        │  Title: "Vendors"
        │  Subtitle: "Manage supplier profiles and registrations"
        │  
        │  [Search bar .....search by name, gst, category...]  [+ Add Vendor btn]
        │  
        │  [All (28)] [active (21)] [Pending (4)] [Blocked (3)]  ← filter tabs
        │  
        │  ┌──────────────────────────────────────────────────────────────┐
        │  │ Vendor Name  │ Category │ GST no. │ Contact no. │ Status │ Action │
        │  ├──────────────────────────────────────────────────────────────┤
        │  │ Infra Supp.. │ Construc │ 27AABC..│ XYZ Number  │ Active │ View   │
        │  │ Tech Core LT │ IT       │ 27AABC..│ XYZ Number  │ Active │ View   │
        │  │ FastLog Tran │ Logistics│ 27AABC..│ XYZ Number  │ Blocked│ View   │
        │  └──────────────────────────────────────────────────────────────┘
        │
        │  [Edit]  [Block/Activate]  action buttons inside each row
```

**Search & Filter Implementation**:
- Debounced search input (300ms) — calls GET /api/vendors?search=xxx
- Filter tabs: "All", "Active", "Pending", "Blocked" — show counts in parentheses
  - Clicking tab calls GET /api/vendors?status=active etc.
- Both search + tab filter work together

**Table Implementation**:
- Full-width table with dark header row (`bg-surface-elevated`)
- Row hover: `hover:bg-surface-elevated/50`
- Status badge component:
  ```tsx
  const StatusBadge = ({ status }: { status: string }) => {
    const colors = {
      active: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      pending: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
      blocked: 'bg-red-500/10 text-red-400 border-red-500/20',
    };
    return <span className={`px-2 py-1 rounded-full text-xs border ${colors[status]}`}>{status}</span>;
  };
  ```
- "View" button: outline style, brand-green border, opens vendor detail modal

**Add Vendor Modal**:
Form fields matching the Vendor schema: name, category, gst_number, contact_name, contact_phone, contact_email, address
- Glassmorphism modal overlay
- Call POST /api/vendors on submit
- React Query invalidation of vendor list after success

**Vendor Detail Modal / Drawer**:
- Slide-in from right (translate-x animation)
- Shows full vendor info: name, category, GST, contact, address, status, rating, creation date
- Action buttons: "Edit", "Block/Activate" toggle, "View RFQs"

**Pagination**:
- Show "Showing 1-10 of 28 vendors"
- Prev/Next buttons
- Use `page` state + query params

---

---

# ═══════════════════════════════════════════════════
# FRONTEND DEV 2 — Screens 5, 6, 7, 8, 9, 10, 11
# (RFQ, Quotations, Comparison, Approval, PO/Invoice, Activity, Reports)
# ═══════════════════════════════════════════════════

## Your Mission
You are building the procurement workflow screens for VendorBridge — the core transactional heart of the application. You own everything from RFQ creation through invoice management plus analytics. Import the `MainLayout` and design utilities created by Frontend Dev 1. The design language is identical: dark glassmorphism ERP aesthetic.

**Import these from Frontend Dev 1's work**:
```tsx
import MainLayout from '../components/Layout/MainLayout';
import { StatusBadge } from '../components/ui/StatusBadge';
import api from '../lib/axios';
import { useAuthStore } from '../store/auth.store';
```

**Your routes to add in App.tsx** (coordinate with Frontend Dev 1):
```tsx
<Route path="/rfqs" element={<ProtectedRoute><RFQsListPage /></ProtectedRoute>} />
<Route path="/rfqs/new" element={<ProtectedRoute><CreateRFQPage /></ProtectedRoute>} />
<Route path="/rfqs/:id" element={<ProtectedRoute><RFQDetailPage /></ProtectedRoute>} />
<Route path="/quotations" element={<ProtectedRoute><QuotationsPage /></ProtectedRoute>} />
<Route path="/rfqs/:rfq_id/compare" element={<ProtectedRoute><QuotationComparisonPage /></ProtectedRoute>} />
<Route path="/approvals" element={<ProtectedRoute><ApprovalsPage /></ProtectedRoute>} />
<Route path="/purchase-orders" element={<ProtectedRoute><PurchaseOrdersPage /></ProtectedRoute>} />
<Route path="/invoices" element={<ProtectedRoute><InvoicesPage /></ProtectedRoute>} />
<Route path="/invoices/:id" element={<ProtectedRoute><InvoiceDetailPage /></ProtectedRoute>} />
<Route path="/activity" element={<ProtectedRoute><ActivityPage /></ProtectedRoute>} />
<Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
```

---

## CHUNK F2-1: Screen 5 — RFQ Creation Page

### File: src/pages/CreateRFQPage.tsx

**Layout Reference (from SVG Screen 5)**:
```
SIDEBAR │ MAIN CONTENT
        │  Title: "Create RFQ's"
        │  Subtitle: "new request for quotation"
        │
        │  ┌─────────────────────────────────────────────────────────┐
        │  │  RFQ's title*   [Office Furniture procurement Q2      ]  │
        │  │                                                           │
        │  │  Category       [Furniture        ]  Deadline* [date  ] │
        │  │                                                           │
        │  │  Description                                              │
        │  │  [Ergonomic chairs and standing desks for 3rd floor    ] │
        │  │                                                           │
        │  │  LINE ITEMS                                               │
        │  │  Item                    qty          Unit               │
        │  │  [Ergonomic chair    ]   [25  ]       [NOS]  [🗑]        │
        │  │  [Standing desks     ]   [10  ]       [NOS]  [🗑]        │
        │  │  [+ add line item]                                        │
        │  │                                                           │
        │  │  ASSIGN VENDORS                                           │
        │  │  [Infra Supplies Pvt ltd  ×]  [Techcore LTD  ×]         │
        │  │  [+ add vendor]                                           │
        │  │                                                           │
        │  │  ATTACHMENTS                                              │
        │  │  [ Drag & drop files or click to upload ]                │
        │  │                                                           │
        │  │  [Save & Send to Vendors]    [Save as Draft]             │
        │  └─────────────────────────────────────────────────────────┘
```

**Implementation Requirements**:

**Form State**: Use `useState` for the whole form object:
```typescript
interface RFQForm {
  title: string;
  category: string;
  description: string;
  deadline: string;
  line_items: { item_name: string; quantity: number; unit: string }[];
  vendor_ids: string[];
  attachments: File[];
}
```

**Line Items Section**:
- Dynamic list — start with 2 empty rows
- Each row: item_name input (flex-grow) + quantity number input (w-24) + unit select (w-24) + red trash button
- "+ add line item" button adds a new empty row
- Minimum 1 line item required (show validation error if trying to submit with 0)

**Assign Vendors Section**:
- Fetch vendor list from GET /api/vendors?status=active
- Multiselect approach: clicking "+ add vendor" opens a dropdown/modal to search and select vendors
- Selected vendors appear as removable tags/pills (vendor name + × button)
- Tag style: `bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 px-3 py-1 rounded-full`

**Attachments**:
- Drag & drop zone with dashed border (border-dashed border-2 border-emerald-500/20)
- `<Upload />` icon centered, text "Drag & drop files or click to upload"
- For hackathon: just store file references in state, no actual upload needed
- Show file names as chips when files are added

**Submit Logic**:
- "Save as Draft": POST /api/rfqs with `status: 'draft'`, redirect to /rfqs
- "Save & Send to Vendors": POST /api/rfqs then PATCH /api/rfqs/:id/status with `status: 'published'`, redirect to /rfqs
- Both show loading state during submission
- Toast success/error messages

---

## CHUNK F2-2: Screen 6 — Quotations Submission Page

### File: src/pages/SubmitQuotationPage.tsx
(This is what a vendor sees when responding to an RFQ)

**Layout Reference (from SVG Screen 6)**:
```
SIDEBAR │ MAIN CONTENT
        │  Title: "Submit Quotations"
        │
        │  ┌── RFQ Summary ────────────────────────────────────────────┐
        │  │  RFQ: office furniture procurement q2 - deadline 15 june  │
        │  │  "Ergonomic chair * 25, standing desk *10 - category furn" │
        │  └───────────────────────────────────────────────────────────┘
        │
        │  [Tech Core LTD tab]  ← vendor selector tabs (if multiple vendors logged in)
        │
        │  TABLE: Item | Qty | Unit price | Total | Delivery (days)
        │  [Ergonomic chair ]  25   [ 3500 ]   87,500   [  ]
        │  [Standing desks  ]  10   [ 8200 ]   82,000   [  ]
        │                                     ─────────────
        │  Your Quotation:     tax/GST%: [18%]
        │  Note/terms: [Payment terms: 20 days net...]
        │  
        │  Subtotal:           1,69,599
        │  GST (18%):          30,510
        │  Grand total:        2,00,010
        │
        │  [Submit Quotation]    [Save Draft]
```

**Key Logic**:
- Fetch RFQ details from GET /api/rfqs/:id (get line items to pre-populate table)
- Each line item row: item_name (read-only) + qty (read-only) + unit_price (editable input) + total (auto-calculated) + delivery_days (editable)
- Real-time recalculation: as user types unit_price, instantly update total and summary
- GST percentage: editable input, default 18
- Note/terms: textarea
- "Submit Quotation": calls POST /api/quotations + PATCH /api/quotations/:id/submit
- "Save Draft": calls POST /api/quotations only (status stays draft)
- Grand total display in large font, brand-green color

---

## CHUNK F2-3: Screen 7 — Quotation Comparison Page

### File: src/pages/QuotationComparisonPage.tsx

**Layout Reference (from SVG Screen 7)**:
```
SIDEBAR │  Title: "Quotation Comparison"
        │  Subtitle: "RFQ: office furniture procurement q2 - 3 quotations received"
        │
        │  COMPARISON TABLE:
        │  Criteria         │ Infra Supplies (Lowest) │ TechCore LTD │ Office Need Co.
        │  ──────────────────────────────────────────────────────────────────────────
        │  Grand Total      │  185,000 🟢 (green)      │  214,800     │  200,010
        │  GST %            │  18%                     │  18%         │  18%
        │  Delivery (days)  │  10                      │  15          │  12
        │  Vendor Rating    │  4.5/5 ⭐               │  3.8/5 ⭐    │  4.2/5 ⭐
        │  Payment Terms    │  30 days                 │  15 days     │  30 days
        │  ──────────────────────────────────────────────────────────────────────────
        │                   │ [Select & Approve]       │ [Select]     │ [Select]
        │
        │  "Green = lowest price, selecting vendor initiates the approval workflow."
```

**Implementation Requirements**:
- Fetch from GET /api/quotations/compare/:rfq_id
- Comparison is displayed as a transposed table (criteria as rows, vendors as columns)
- The vendor with `is_lowest: true` gets:
  - Green highlighted column header
  - Grand Total in bold green text
  - "(Lowest)" label appended to vendor name
  - `Select & Approve` button (brand-green solid) instead of outline Select
- Other vendors get outline `Select` buttons
- Vendor rating: show star icons with `★` character in amber
- "Select & Approve" calls PATCH /api/quotations/:id/select
- After selection: show success toast "Vendor selected! Approval workflow initiated." and redirect to /approvals
- Info text at bottom in muted amber/yellow: "Green = lowest price..."

---

## CHUNK F2-4: Screen 8 — Approval Workflow Page

### File: src/pages/ApprovalsPage.tsx

**Layout Reference (from SVG Screen 8)**:
```
SIDEBAR │  Title: "Approval Workflow"
        │  Subtitle: "RFQ: office furniture Q2 - Vendor: Infra Supplies - 185400"
        │
        │  PROGRESS BAR / STEP INDICATOR:
        │  [Submitted] → [L1 Review] → [L2 approval] → [Generate PO]
        │  ●──────────●──────────────○──────────────○
        │
        │  APPROVAL CHAIN (vertical cards):
        │  ┌──────────────────────────────────────────────────────────┐
        │  │ ✅ Rahul Mehta (Procurement head)                        │
        │  │    Approved on may 20, 10:32 AM                         │
        │  └──────────────────────────────────────────────────────────┘
        │  ┌──────────────────────────────────────────────────────────┐
        │  │ ⏳ Priya Shah (finance manager)                          │
        │  │    Awaiting  │  Assigned may 21                         │
        │  └──────────────────────────────────────────────────────────┘
        │
        │  [Approval Remarks textarea]
        │
        │  RIGHT PANEL: QUOTATION SUMMARY
        │  Vendor: Infra Supplies PVT LTD
        │  Total: 1,85,400
        │  Delivery: 10 days
        │  Rating: 4.5/5
        │
        │  [Approve]  [Reject]
```

**Implementation Requirements**:
- Fetch approval chain from GET /api/approvals/:quotation_id
- Step indicator: 4 steps — "Submitted", "L1 Review", "L2 approval", "Generate PO"
  - Filled circle (brand-green) = completed, hollow circle = pending/current
  - Connecting line between steps, green for completed sections
- Approval cards:
  - Approved: green check icon, green left border, "Approved on [date]"
  - Pending/Awaiting: amber clock icon, amber left border, "Awaiting | Assigned [date]"
  - Rejected: red X icon, red left border
- Approval Remarks: `<textarea>` that's required when clicking Approve or Reject
- "Approve" button: brand-green solid → calls PATCH /api/approvals/:id/approve
- "Reject" button: red outline → calls PATCH /api/approvals/:id/reject
- Right panel: quotation summary card (glass-card)
- After approve/reject: refetch approval data, update UI optimistically

---

## CHUNK F2-5: Screen 9 — Purchase Order & Invoice Page

### File: src/pages/InvoiceDetailPage.tsx

**Layout Reference (from SVG Screen 9)**:
```
SIDEBAR │  Title: "Purchase Order & Invoice"
        │
        │  PO DOCUMENT CARD:
        │  ┌─────────────────────────────────────────────────────────┐
        │  │  PO-2025-0068  (auto-generated after approval)          │
        │  │                                                          │
        │  │  BILL TO:                    │  VENDOR:                 │
        │  │  Your Organization Name      │  Infra supplies pvt ltd  │
        │  │  123 business park, Ahmd     │  456, industrial estate  │
        │  │  GSTIN: 25383438AFB          │  GSTIN: 343434DB4523     │
        │  │                              │  PO Date: 21 may 2025    │
        │  │                              │  Invoice date: 22 may    │
        │  │                              │  Due date: 21 june       │
        │  │                                                          │
        │  │  Item      │ Qty │ Unit price │ Total                   │
        │  │  Erg chair │ 25  │ 3,500      │ 87,500                  │
        │  │  Std desks │ 10  │ 8,200      │ 82,000                  │
        │  │                                                          │
        │  │                        Subtotal:    1,69,500            │
        │  │                        CGST (9%):   15,255              │
        │  │                        SGST (9%):   15,255              │
        │  │                        Grand total: 2,00,010            │
        │  │                                                          │
        │  │  Status: Pending Payment                                │
        │  └─────────────────────────────────────────────────────────┘
        │
        │  ACTION BUTTONS:
        │  [Download PDF]  [🖨 Print]  [📧 Email invoice]  [✅ Mark as Paid]
```

**Implementation Requirements**:
- Fetch invoice from GET /api/invoices/:id
- The document card should look like an actual invoice — use a white-on-dark paper look:
  - Card background slightly lighter: `bg-surface-card`
  - Header section: two-column grid (Bill To | Vendor info)
  - Line items table with clean borders
  - Totals section right-aligned
  - Status banner at bottom: amber for "Pending Payment", green for "Paid"
- **Download PDF button**: Use `window.print()` with a print stylesheet OR generate with `jsPDF` if time permits. For hackathon: at minimum `window.print()` works
- **Print button**: `window.print()`
- **Email Invoice button**: calls POST /api/invoices/:id/send-email, shows toast "Invoice sent successfully"
- **Mark as Paid button**: calls PATCH /api/invoices/:id/mark-paid, updates status display

---

## CHUNK F2-6: Screen 10 — Activity & Logs Page

### File: src/pages/ActivityPage.tsx

**Layout Reference (from SVG Screen 10)**:
```
SIDEBAR │  Title: "Activity & Logs"
        │  Subtitle: "Procurement audit trail"
        │
        │  FILTER TABS: [All] [RFQ] [Approvals] [Invoices] [Vendors]
        │
        │  TIMELINE (vertical list):
        │  ┌──────────────────────────────────────────────────────────┐
        │  │  🟢●  Quotation selected - Infra supplies pvt ltd       │
        │  │       selected for office furniture Q2                   │
        │  │       23 may 2025, 9:15 PM                               │
        │  ├──────────────────────────────────────────────────────────┤
        │  │  🟡●  Approval pending - PO-2024 awaiting L2 approval   │
        │  │       22 may 2025, 09:15 AM                              │
        │  ├──────────────────────────────────────────────────────────┤
        │  │  🔵●  RFQ published - office furniture Q2 sent to 3     │
        │  │       19 may 2025                                        │
        │  ├──────────────────────────────────────────────────────────┤
        │  │  🟣●  Vendor added - FastLog transport registered        │
        │  │       18 may 2025, 3:20 PM                               │
        │  └──────────────────────────────────────────────────────────┘
        │
        │  ⚠ NOTE BOX (amber):
        │  "Audit logs must be immutable — write-once, no edit/delete"
```

**Implementation Requirements**:
- Fetch from GET /api/activity-logs?event_type=xxx&page=1&limit=20
- Filter tabs update the `event_type` query param
- Timeline design: vertical line on left, colored dot per event type, event card
- Color coding per event type:
  - `rfq`: blue (`text-blue-400`, `bg-blue-500`)
  - `approval`: amber (`text-amber-400`, `bg-amber-500`)
  - `invoice`: green (`text-emerald-400`, `bg-emerald-500`)
  - `vendor`: purple (`text-purple-400`, `bg-purple-500`)
  - `quotation`: cyan (`text-cyan-400`, `bg-cyan-500`)
  - `po`: orange (`text-orange-400`, `bg-orange-500`)
- Each log entry: event dot + action text (bold) + description + timestamp (right-aligned, muted)
- Amber info box at bottom (static): icon + "Audit logs must be immutable — These entries are write-once. No edit or delete operations are performed on log records."
- Infinite scroll OR simple pagination (prev/next)

---

## CHUNK F2-7: Screen 11 — Reports & Analytics Page

### File: src/pages/ReportsPage.tsx

**Layout Reference (from SVG Screen 11)**:
```
SIDEBAR │  Title: "Reports & Analytics"
        │  Subtitle: "Procurement Insights - may 2025"
        │
        │  DATE SELECTOR: [May 2025 ▼]    [Export] button
        │
        │  STATS ROW (4 cards):
        │  ┌──────────┐ ┌────────────┐ ┌─────────────┐ ┌──────────┐
        │  │  12.4 L  │ │ Active     │ │ 94%         │ │ Overdue  │
        │  │  total   │ │ vendors    │ │ PO          │ │ invoices │
        │  │  spend   │ │ count      │ │ Fulfillment │ │  count   │
        │  └──────────┘ └────────────┘ └─────────────┘ └──────────┘
        │
        │  CHART SECTION:
        │  ┌─────────────────────────────────┐ ┌───────────────────┐
        │  │ Monthly Spend Trend (Bar Chart) │ │ Vendor Perf Table │
        │  │ [recharts BarChart]             │ │ [table with top 5]│
        │  └─────────────────────────────────┘ └───────────────────┘
```

**Implementation Requirements**:
- Fetch stats from GET /api/reports/summary
- Fetch chart data from GET /api/reports/monthly-spend
- Fetch vendor performance from GET /api/reports/vendor-performance

**Stats Cards**: Same glassmorphism style as dashboard. Format `total_spend` as "12.4L" (divide by 100000, fix to 1 decimal).

**Monthly Spend Bar Chart (recharts)**:
```tsx
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

// Chart container:
<ResponsiveContainer width="100%" height={300}>
  <BarChart data={monthlyData}>
    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
    <XAxis dataKey="month" tick={{ fill: '#94a3b8', fontSize: 12 }} />
    <YAxis tick={{ fill: '#94a3b8', fontSize: 12 }} 
           tickFormatter={(val) => `${(val/100000).toFixed(1)}L`} />
    <Tooltip contentStyle={{ background: '#1a2e25', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 8 }} />
    <Bar dataKey="amount" fill="#10b981" radius={[4, 4, 0, 0]} />
  </BarChart>
</ResponsiveContainer>
```

**Vendor Performance Table**:
- Columns: Rank | Vendor Name | POs | Total Spend | Avg Rating
- Sorted by total spend DESC
- Top vendor gets a 🥇 medal

**Export Button**:
- Calls GET /api/reports/vendor-performance (or similar)
- For hackathon: generate a simple CSV download using `Blob`:
```typescript
const exportCSV = (data: any[]) => {
  const headers = Object.keys(data[0]).join(',');
  const rows = data.map(row => Object.values(row).join(','));
  const csv = [headers, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a'); a.href = url; a.download = 'report.csv'; a.click();
};
```

---

## IMPORTANT COORDINATION NOTES FOR ALL TEAM MEMBERS

### Git Branch Strategy
- Backend Dev 1: `feat/backend-foundation`
- Backend Dev 2: `feat/backend-workflow`
- Frontend Dev 1: `feat/frontend-auth-dashboard`
- Frontend Dev 2: `feat/frontend-workflow`
- All merge to `main` at the end

### Shared Constants File (both frontends)
Create `src/constants/api.ts`:
```typescript
export const API_ROUTES = {
  AUTH: { LOGIN: '/auth/login', REGISTER: '/auth/register', ME: '/auth/me' },
  VENDORS: '/vendors',
  RFQS: '/rfqs',
  QUOTATIONS: '/quotations',
  APPROVALS: '/approvals',
  PO: '/purchase-orders',
  INVOICES: '/invoices',
  ACTIVITY: '/activity-logs',
  REPORTS: { SUMMARY: '/reports/summary', MONTHLY: '/reports/monthly-spend', VENDORS: '/reports/vendor-performance' }
};
```

### Environment Variables (.env)
Frontend (.env):
```
VITE_API_URL=http://localhost:5000/api
```
Backend (.env):
```
DATABASE_URL=<neon-connection-string>
JWT_SECRET=vendorbridge_super_secret_2025_hackathon
PORT=5000
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

### Quick Integration Test Sequence
1. Backend Dev 1 starts server → test /health endpoint
2. Frontend Dev 1 sets up login → test full auth flow
3. Backend Dev 1 tests vendor CRUD via Postman
4. Frontend Dev 1 verifies vendors page loads data
5. Backend Dev 1 tests RFQ create → Backend Dev 2 reads them for quotation flow
6. Continue testing end-to-end

---