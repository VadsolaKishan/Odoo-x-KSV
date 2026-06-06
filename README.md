# VendorBridge 🚀
### Procurement & Vendor Management ERP Platform

VendorBridge is designed to **simplify, centralize, and digitize procurement operations**. It streamlines vendor communication, automates request for quotations (RFQs), manages approvals, and generates purchase orders and invoices, providing real-time tracking and audit logging.

![VendorBridge Dashboard Demo](./vendorbridge_dashboard.png)

---

## 👥 Team Members

| Name | Email |
| :--- | :--- |
| **Kishan Vadsola** | [vadsolakishan1310@gmail.com](mailto:vadsolakishan1310@gmail.com) |
| **Darshan Thummar** | [darshantce.059@gmail.com](mailto:darshantce.059@gmail.com) |
| **Shreeja Upadhyay** | [shreejaupadhyaycspitce@gmail.com](mailto:shreejaupadhyaycspitce@gmail.com) |
| **Dhruvin Vaghasiya** | [dhruvinvaghasiya.dev@gmail.com](mailto:dhruvinvaghasiya.dev@gmail.com) |

---

## ✨ Key Features

* **🔒 Role-Based Access Control**: Tailored dashboards for Administrators, Procurement Officers, Managers/Approvers, and Vendors.
* **📋 RFQ Lifecycle Management**: Create Request for Quotations (RFQs), invite vendors, set deadlines, and track lines.
* **💬 Quotation & Bidding**: Seamless vendor bidding portal with pricing, GST details, delivery lead times, and payment term submissions.
* **✍️ Multi-Level Approval Workflows**: Custom approval chains (L1, L2, etc.) for bid evaluations with approval comments and status tracking.
* **📦 Purchase Orders (PO)**: Automated generation of professional Purchase Orders with CGST/SGST breakdowns once a quotation is approved.
* **🧾 Invoicing & Payment Tracking**: Simple billing lifecycle tracking from "Pending Payment" to "Paid".
* **📜 Immutable Activity Logs**: Complete audit logging of all system actions for administrative compliance.

---

## 🛠️ Technology Stack

* **Frontend**: React (v19), TypeScript, Vite, TailwindCSS (for responsive UI/UX), Lucide Icons, TanStack React Query, Zustand.
* **Backend**: Node.js, Express, TypeScript, Zod Validation, JWT Authentication, bcryptjs.
* **Database**: PostgreSQL (Neon.tech Hosted).

---

## ⚙️ Project Structure

```
Odoo-x-KSV/
├── vendorbridge-api/         # Express Backend API
│   ├── src/                  # TS Source files
│   ├── migrations/           # SQL Database migrations & seeds
│   └── .env                  # Backend environment settings
└── vendorbridge-frontend/    # Vite React Frontend
    ├── src/                  # React components & stores
    └── .env                  # Frontend API configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
* **Node.js** (v18 or higher recommended)
* **npm** (v9 or higher)

### 2. Backend Setup (`vendorbridge-api`)
1. Navigate to the backend directory:
   ```bash
   cd vendorbridge-api
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables in your `.env` file (copy from `.env.example` if needed):
   ```env
   DATABASE_URL=postgresql://your_db_credentials
   JWT_SECRET=your_super_secret_key_here
   PORT=4000
   FRONTEND_URL=http://localhost:5173
   NODE_ENV=development
   ```
4. Run database migrations:
   ```bash
   npm run migrate
   ```
5. Start the backend server:
   ```bash
   npm run dev
   ```
   *The API will start running at `http://localhost:4000/api`*

### 3. Frontend Setup (`vendorbridge-frontend`)
1. Navigate to the frontend directory:
   ```bash
   cd ../vendorbridge-frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Verify your `.env` file contains:
   ```env
   VITE_API_URL=http://localhost:4000/api
   ```
4. Start the frontend server:
   ```bash
   npm run dev
   ```
   *Open `http://localhost:5173` in your browser.*

---

## 🔑 Demo Access Credentials

The database comes pre-seeded with the following credentials for testing and evaluation (Password is the same for all demo accounts):

* **Password**: `VendorBridge@2026`

| Role | Email | Description |
| :--- | :--- | :--- |
| 🛡️ **Admin** | `admin@vendorbridge.com` | Complete system access & logs |
| 💼 **Procurement Officer** | `officer@vendorbridge.com` | Manages RFQs, POs, and Invoices |
| 👥 **Manager / Approver** | `manager@vendorbridge.com` | General manager approval actions |
| ⚖️ **L1 Approver** | `rahul@vendorbridge.com` | First level manager approval |
| ⚖️ **L2 Approver** | `priya@vendorbridge.com` | Second level manager approval |
