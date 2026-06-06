import { Request, Response, NextFunction } from 'express';
import '../middleware/auth';
import { query, pool } from '../config/db';
import { logActivity } from '../utils/activityLogger';

// Helper to generate PO and Invoice
export async function generatePO(quotationId: string, userId: string, dbClient?: any) {
  const client = dbClient || pool;

  // 1. Fetch quotation, rfq, and vendor details
  const qRes = await client.query(
    `SELECT q.*, 
            v.name AS vendor_name, 
            v.gst_number AS vendor_gstin, 
            v.address AS vendor_address, 
            r.rfq_number, 
            r.title AS rfq_title
     FROM quotations q
     JOIN vendors v ON q.vendor_id = v.id
     JOIN rfqs r ON q.rfq_id = r.id
     WHERE q.id = $1`,
    [quotationId]
  );

  if (qRes.rowCount === 0) {
    throw new Error('Quotation not found');
  }
  const q = qRes.rows[0];

  // 2. Generate PO number
  const poCountRes = await client.query('SELECT COUNT(*) FROM purchase_orders');
  const poCount = parseInt(poCountRes.rows[0].count, 10) + 1;
  const year = new Date().getFullYear();
  const poNumber = `PO-${year}-${String(poCount).padStart(4, '0')}`;

  // Calculations
  const subtotal = parseFloat(q.subtotal);
  const cgstPercentage = 9.00;
  const sgstPercentage = 9.00;
  const cgstAmount = subtotal * (cgstPercentage / 100);
  const sgstAmount = subtotal * (sgstPercentage / 100);
  const grandTotal = subtotal + cgstAmount + sgstAmount;

  // Insert PO
  const poInsertRes = await client.query(
    `INSERT INTO purchase_orders 
     (po_number, rfq_id, quotation_id, vendor_id, bill_to_name, bill_to_address, bill_to_gstin, subtotal, cgst_percentage, cgst_amount, sgst_percentage, sgst_amount, grand_total, status, po_date, created_by)
     VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, CURRENT_DATE, $15)
     RETURNING *`,
    [
      poNumber,
      q.rfq_id,
      q.id,
      q.vendor_id,
      'VendorBridge Corp',
      '123 Business Park, Tech City, Karnataka - 560001',
      '29AAAAA1111A1Z1',
      subtotal,
      cgstPercentage,
      cgstAmount,
      sgstPercentage,
      sgstAmount,
      grandTotal,
      'generated',
      userId,
    ]
  );
  const po = poInsertRes.rows[0];

  // Update RFQ status to awarded
  await client.query(
    `UPDATE rfqs SET status = 'awarded', updated_at = NOW() WHERE id = $1`,
    [q.rfq_id]
  );

  // 3. Generate Invoice
  const invCountRes = await client.query('SELECT COUNT(*) FROM invoices');
  const invCount = parseInt(invCountRes.rows[0].count, 10) + 1;
  const invoiceNumber = `INV-${year}-${String(invCount).padStart(4, '0')}`;

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + 30); // 30 days net terms

  const invInsertRes = await client.query(
    `INSERT INTO invoices 
     (invoice_number, po_id, vendor_id, vendor_address, vendor_gstin, invoice_date, due_date, subtotal, cgst_amount, sgst_amount, grand_total, status)
     VALUES ($1, $2, $3, $4, $5, CURRENT_DATE, $6, $7, $8, $9, $10, 'pending_payment')
     RETURNING *`,
    [
      invoiceNumber,
      po.id,
      q.vendor_id,
      q.vendor_address || 'Vendor Address Not Stated',
      q.vendor_gstin,
      dueDate,
      subtotal,
      cgstAmount,
      sgstAmount,
      grandTotal,
    ]
  );
  const invoice = invInsertRes.rows[0];

  // Log PO Activity
  await logActivity({
    event_type: 'po',
    action: 'PO Generated',
    description: `Purchase Order ${po.po_number} generated for RFQ "${q.rfq_title}" and awarded to vendor ${q.vendor_name}.`,
    performed_by: userId,
    resource_id: po.id,
    resource_type: 'po',
  });

  // Log Invoice Activity
  await logActivity({
    event_type: 'invoice',
    action: 'Invoice Generated',
    description: `Invoice ${invoice.invoice_number} generated automatically for PO ${po.po_number}.`,
    performed_by: userId,
    resource_id: invoice.id,
    resource_type: 'invoice',
  });

  return { po, invoice };
}

// GET /api/purchase-orders
export const getPurchaseOrders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const pageVal = parseInt(page as string, 10) || 1;
    const limitVal = parseInt(limit as string, 10) || 10;
    const offsetVal = (pageVal - 1) * limitVal;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      conditions.push(`po.status = $${params.length}`);
    }

    // Role-based filter for vendors
    if (req.user?.role === 'vendor') {
      const vendorRes = await query(
        `SELECT id FROM vendors WHERE created_by = $1 OR contact_email = $2`,
        [req.user.userId, req.user.email]
      );
      const vendorIds = vendorRes.rows.map((row) => row.id);
      if (vendorIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          meta: { total: 0, page: pageVal, limit: limitVal },
        });
      }
      params.push(vendorIds);
      conditions.push(`po.vendor_id = ANY($${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countRes = await query(
      `SELECT COUNT(*) FROM purchase_orders po ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // Paginated PO list
    const selectParams = [...params];
    selectParams.push(limitVal);
    const limitPlaceholder = `$${selectParams.length}`;
    selectParams.push(offsetVal);
    const offsetPlaceholder = `$${selectParams.length}`;

    const dataQuery = `
      SELECT 
        po.id,
        po.po_number,
        po.subtotal,
        po.grand_total,
        po.status,
        po.po_date,
        po.created_at,
        v.name AS vendor_name,
        r.title AS rfq_title
      FROM purchase_orders po
      JOIN vendors v ON po.vendor_id = v.id
      JOIN rfqs r ON po.rfq_id = r.id
      ${whereClause}
      ORDER BY po.created_at DESC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const dataResult = await query(dataQuery, selectParams);

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      meta: {
        total,
        page: pageVal,
        limit: limitVal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/purchase-orders/:id
export const getPurchaseOrderById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const poResult = await query(
      `SELECT po.*, 
              v.name AS vendor_name, 
              v.category AS vendor_category, 
              v.gst_number AS vendor_gst_number, 
              v.contact_name AS vendor_contact_name, 
              v.contact_phone AS vendor_contact_phone, 
              v.contact_email AS vendor_contact_email, 
              v.address AS vendor_address,
              v.created_by AS vendor_created_by,
              r.rfq_number, 
              r.title AS rfq_title
       FROM purchase_orders po
       JOIN vendors v ON po.vendor_id = v.id
       JOIN rfqs r ON po.rfq_id = r.id
       WHERE po.id = $1`,
      [id]
    );

    if (poResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Purchase Order not found',
      });
    }

    const po = poResult.rows[0];

    // Authorization
    if (req.user?.role === 'vendor') {
      const isAssociated = 
        po.vendor_created_by === req.user.userId || 
        po.vendor_contact_email === req.user.email;
      if (!isAssociated) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own purchase orders',
        });
      }
    }

    // Fetch line items from the quotation used to generate this PO
    const lineItemsResult = await query(
      `SELECT * FROM quotation_line_items WHERE quotation_id = $1`,
      [po.quotation_id]
    );

    // Fetch invoice associated with this PO
    const invoiceResult = await query(
      `SELECT * FROM invoices WHERE po_id = $1`,
      [po.id]
    );

    const formattedPO = {
      ...po,
      vendor: {
        id: po.vendor_id,
        name: po.vendor_name,
        category: po.vendor_category,
        gst_number: po.vendor_gst_number,
        contact_name: po.vendor_contact_name,
        contact_phone: po.vendor_contact_phone,
        contact_email: po.vendor_contact_email,
        address: po.vendor_address,
      },
      line_items: lineItemsResult.rows,
      invoice: invoiceResult.rows[0] || null,
    };

    return res.status(200).json({
      success: true,
      data: formattedPO,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/invoices
export const getInvoices = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, page = '1', limit = '10' } = req.query;

    const pageVal = parseInt(page as string, 10) || 1;
    const limitVal = parseInt(limit as string, 10) || 10;
    const offsetVal = (pageVal - 1) * limitVal;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      conditions.push(`i.status = $${params.length}`);
    }

    // Role-based filter for vendors
    if (req.user?.role === 'vendor') {
      const vendorRes = await query(
        `SELECT id FROM vendors WHERE created_by = $1 OR contact_email = $2`,
        [req.user.userId, req.user.email]
      );
      const vendorIds = vendorRes.rows.map((row) => row.id);
      if (vendorIds.length === 0) {
        return res.status(200).json({
          success: true,
          data: [],
          meta: { total: 0, page: pageVal, limit: limitVal },
        });
      }
      params.push(vendorIds);
      conditions.push(`i.vendor_id = ANY($${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count
    const countRes = await query(
      `SELECT COUNT(*) FROM invoices i ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // List Invoices
    const selectParams = [...params];
    selectParams.push(limitVal);
    const limitPlaceholder = `$${selectParams.length}`;
    selectParams.push(offsetVal);
    const offsetPlaceholder = `$${selectParams.length}`;

    const dataQuery = `
      SELECT 
        i.id,
        i.invoice_number,
        i.invoice_date,
        i.due_date,
        i.subtotal,
        i.grand_total,
        i.status,
        po.po_number,
        v.name AS vendor_name
      FROM invoices i
      JOIN purchase_orders po ON i.po_id = po.id
      JOIN vendors v ON i.vendor_id = v.id
      ${whereClause}
      ORDER BY i.created_at DESC
      LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}
    `;

    const dataResult = await query(dataQuery, selectParams);

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      meta: {
        total,
        page: pageVal,
        limit: limitVal,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/invoices/:id
export const getInvoiceById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const invoiceResult = await query(
      `SELECT i.*, 
              po.po_number, 
              po.po_date,
              po.bill_to_name,
              po.bill_to_address,
              po.bill_to_gstin,
              v.name AS vendor_name, 
              v.contact_name AS vendor_contact_name,
              v.contact_phone AS vendor_contact_phone,
              v.contact_email AS vendor_contact_email,
              v.created_by AS vendor_created_by,
              po.quotation_id
       FROM invoices i
       JOIN purchase_orders po ON i.po_id = po.id
       JOIN vendors v ON i.vendor_id = v.id
       WHERE i.id = $1`,
      [id]
    );

    if (invoiceResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const inv = invoiceResult.rows[0];

    // Authorization
    if (req.user?.role === 'vendor') {
      const isAssociated = 
        inv.vendor_created_by === req.user.userId || 
        inv.vendor_contact_email === req.user.email;
      if (!isAssociated) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own invoices',
        });
      }
    }

    // Fetch line items from the quotation used to generate the PO
    const lineItemsResult = await query(
      `SELECT * FROM quotation_line_items WHERE quotation_id = $1`,
      [inv.quotation_id]
    );

    const formattedInvoice = {
      ...inv,
      po_number: inv.po_number,
      po_date: inv.po_date,
      bill_to: {
        name: inv.bill_to_name,
        address: inv.bill_to_address,
        gstin: inv.bill_to_gstin,
      },
      vendor: {
        name: inv.vendor_name,
        contact_name: inv.vendor_contact_name,
        contact_phone: inv.vendor_contact_phone,
        contact_email: inv.vendor_contact_email,
        address: inv.vendor_address,
        gstin: inv.vendor_gstin,
      },
      line_items: lineItemsResult.rows,
    };

    return res.status(200).json({
      success: true,
      data: formattedInvoice,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/invoices/:id/mark-paid
export const markInvoicePaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Update status to paid and set paid_at = NOW()
    const result = await query(
      `UPDATE invoices 
       SET status = 'paid', paid_at = NOW(), updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const invoice = result.rows[0];

    // Fetch PO details for logging
    const poResult = await query(
      `SELECT po.po_number, v.name AS vendor_name 
       FROM purchase_orders po 
       JOIN vendors v ON po.vendor_id = v.id 
       WHERE po.id = $1`,
      [invoice.po_id]
    );
    const poDetails = poResult.rows[0];
    const poNumber = poDetails?.po_number || 'Unknown';
    const vendorName = poDetails?.vendor_name || 'Vendor';

    // Log Activity
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : 'System';

    await logActivity({
      event_type: 'invoice',
      action: 'Invoice Paid',
      description: `Invoice ${invoice.invoice_number} of grand total ₹${invoice.grand_total} from ${vendorName} for PO ${poNumber} has been marked as PAID.`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: invoice.id,
      resource_type: 'invoice',
    });

    return res.status(200).json({
      success: true,
      message: 'Invoice marked as paid successfully',
      data: invoice,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/invoices/:id/send-email
export const sendInvoiceEmail = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT i.invoice_number, v.name AS vendor_name, v.contact_email 
       FROM invoices i
       JOIN vendors v ON i.vendor_id = v.id
       WHERE i.id = $1`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Invoice not found',
      });
    }

    const invoice = result.rows[0];

    // Log Activity
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : 'System';

    await logActivity({
      event_type: 'invoice',
      action: 'Invoice Emailed',
      description: `Invoice ${invoice.invoice_number} emailed to vendor ${invoice.vendor_name} at ${invoice.contact_email || 'no-email-configured@vendor.com'}.`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: id,
      resource_type: 'invoice',
    });

    return res.status(200).json({
      success: true,
      message: 'Invoice email sent successfully (mocked)',
    });
  } catch (error) {
    return next(error);
  }
};
