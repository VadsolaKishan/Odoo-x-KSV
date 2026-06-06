import { Request, Response, NextFunction } from 'express';
import '../middleware/auth';
import { z } from 'zod';
import { query, pool } from '../config/db';
import { logActivity } from '../utils/activityLogger';
import { createApprovalChain } from './approval.controller';

// Validation Schemas
export const createQuotationSchema = z.object({
  rfq_id: z.string().uuid('Invalid RFQ ID'),
  vendor_id: z.string().uuid('Invalid Vendor ID'),
  gst_percentage: z.number().min(0).max(100).default(18),
  delivery_days: z.number().int().positive().optional().nullable(),
  payment_terms: z.string().max(150).optional().nullable(),
  notes: z.string().optional().nullable(),
  line_items: z.array(
    z.object({
      rfq_line_item_id: z.string().uuid('Invalid RFQ Line Item ID'),
      item_name: z.string().min(1).max(255),
      quantity: z.number().int().positive(),
      unit: z.string().min(1).max(50).default('NOS'),
      unit_price: z.number().positive(),
      delivery_days: z.number().int().positive().optional().nullable(),
    })
  ).min(1, 'At least one line item is required'),
});

// Controllers

// GET /api/quotations?rfq_id=xxx&status=xxx&search=xxx&page=1&limit=10
export const getQuotations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rfq_id, status, search } = req.query;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit as string) || 20));
    const offset = (page - 1) * limit;

    const params: any[] = [];
    const conditions: string[] = [];

    if (rfq_id && typeof rfq_id === 'string') {
      params.push(rfq_id);
      conditions.push(`q.rfq_id = $${params.length}`);
    }

    if (status && typeof status === 'string' && status !== 'all') {
      params.push(status);
      conditions.push(`q.status = $${params.length}`);
    }

    if (search && typeof search === 'string' && search.trim()) {
      params.push(`%${search.trim().toLowerCase()}%`);
      const si = params.length;
      conditions.push(`(LOWER(r.rfq_number) LIKE $${si} OR LOWER(r.title) LIKE $${si} OR LOWER(v.name) LIKE $${si})`);
    }

    if (req.user?.role === 'vendor') {
      params.push(req.user.userId);
      const userParamIdx = params.length;
      params.push(req.user.email);
      const emailParamIdx = params.length;
      conditions.push(`(v.created_by = $${userParamIdx} OR v.contact_email = $${emailParamIdx})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query
    const countResult = await query(
      `SELECT COUNT(*) AS total
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       JOIN rfqs r ON q.rfq_id = r.id
       ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].total, 10);

    // Data query with pagination
    const paginationParams = [...params, limit, offset];
    const quotationsResult = await query(
      `SELECT q.*, 
              v.name AS vendor_name, 
              v.rating AS vendor_rating,
              r.title AS rfq_title,
              r.rfq_number AS rfq_number
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       JOIN rfqs r ON q.rfq_id = r.id
       ${whereClause}
       ORDER BY q.created_at DESC
       LIMIT $${paginationParams.length - 1} OFFSET $${paginationParams.length}`,
      paginationParams
    );

    const formattedQuotations = quotationsResult.rows.map((q) => ({
      id: q.id,
      rfq_id: q.rfq_id,
      vendor_id: q.vendor_id,
      status: q.status,
      subtotal: q.subtotal,
      gst_percentage: q.gst_percentage,
      gst_amount: q.gst_amount,
      grand_total: q.grand_total,
      delivery_days: q.delivery_days,
      payment_terms: q.payment_terms,
      notes: q.notes,
      submitted_at: q.submitted_at,
      created_at: q.created_at,
      updated_at: q.updated_at,
      rfq_title: q.rfq_title,
      rfq_number: q.rfq_number,
      vendor_name: q.vendor_name,
      vendor: {
        id: q.vendor_id,
        name: q.vendor_name,
        rating: q.vendor_rating,
      },
    }));

    return res.status(200).json({
      success: true,
      data: formattedQuotations,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/quotations/:id
export const getQuotationById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const quotationResult = await query(
      `SELECT q.*, 
              v.name AS vendor_name, 
              v.rating AS vendor_rating,
              v.created_by AS vendor_created_by,
              v.contact_email AS vendor_contact_email
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.id = $1`,
      [id]
    );

    if (quotationResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found',
      });
    }

    const q = quotationResult.rows[0];

    // Authorization check for vendors
    if (req.user?.role === 'vendor') {
      const isAssociated = 
        q.vendor_created_by === req.user.userId || 
        q.vendor_contact_email === req.user.email;
      if (!isAssociated) {
        return res.status(403).json({
          success: false,
          message: 'Access denied: You can only view your own quotations',
        });
      }
    }

    const lineItemsResult = await query(
      `SELECT * FROM quotation_line_items WHERE quotation_id = $1`,
      [id]
    );

    const formattedQuotation = {
      id: q.id,
      rfq_id: q.rfq_id,
      vendor_id: q.vendor_id,
      status: q.status,
      subtotal: q.subtotal,
      gst_percentage: q.gst_percentage,
      gst_amount: q.gst_amount,
      grand_total: q.grand_total,
      delivery_days: q.delivery_days,
      payment_terms: q.payment_terms,
      notes: q.notes,
      submitted_at: q.submitted_at,
      created_at: q.created_at,
      updated_at: q.updated_at,
      vendor: {
        id: q.vendor_id,
        name: q.vendor_name,
        rating: q.vendor_rating,
      },
      line_items: lineItemsResult.rows,
    };

    return res.status(200).json({
      success: true,
      data: formattedQuotation,
    });
  } catch (error) {
    return next(error);
  }
};

// POST /api/quotations
export const createQuotation = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const {
      rfq_id,
      vendor_id,
      gst_percentage,
      delivery_days,
      payment_terms,
      notes,
      line_items,
    } = req.body;

    // Verification that this vendor is authorized/owned by the logged-in vendor user
    if (req.user?.role === 'vendor') {
      const vendorCheckResult = await client.query(
        `SELECT id FROM vendors 
         WHERE id = $1 AND (created_by = $2 OR contact_email = $3)`,
        [vendor_id, req.user.userId, req.user.email]
      );
      if (vendorCheckResult.rowCount === 0) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to submit quotations for this vendor.',
        });
      }
    }

    // Check if the vendor is assigned to the RFQ
    const assignmentResult = await client.query(
      `SELECT 1 FROM rfq_vendor_assignments WHERE rfq_id = $1 AND vendor_id = $2`,
      [rfq_id, vendor_id]
    );

    if (assignmentResult.rowCount === 0) {
      return res.status(400).json({
        success: false,
        message: 'This vendor is not invited/assigned to this RFQ.',
      });
    }

    // Begin transaction
    await client.query('BEGIN');

    // Calculate totals server-side
    let subtotal = 0;
    const computedLineItems = line_items.map((item: any) => {
      const totalPrice = item.quantity * item.unit_price;
      subtotal += totalPrice;
      return {
        ...item,
        total_price: totalPrice,
      };
    });

    const gstAmount = subtotal * (gst_percentage / 100);
    const grandTotal = subtotal + gstAmount;

    // Insert quotation base
    const quotationResult = await client.query(
      `INSERT INTO quotations (rfq_id, vendor_id, status, subtotal, gst_percentage, gst_amount, grand_total, delivery_days, payment_terms, notes)
       VALUES ($1, $2, 'draft', $3, $4, $5, $6, $7, $8, $9)
       ON CONFLICT (rfq_id, vendor_id) DO UPDATE 
       SET subtotal = EXCLUDED.subtotal,
           gst_percentage = EXCLUDED.gst_percentage,
           gst_amount = EXCLUDED.gst_amount,
           grand_total = EXCLUDED.grand_total,
           delivery_days = EXCLUDED.delivery_days,
           payment_terms = EXCLUDED.payment_terms,
           notes = EXCLUDED.notes,
           status = 'draft',
           updated_at = NOW()
       RETURNING *`,
      [
        rfq_id,
        vendor_id,
        subtotal,
        gst_percentage,
        gstAmount,
        grandTotal,
        delivery_days || null,
        payment_terms || null,
        notes || null,
      ]
    );

    const quotation = quotationResult.rows[0];

    // Clean up existing quotation line items (in case of update)
    await client.query(
      `DELETE FROM quotation_line_items WHERE quotation_id = $1`,
      [quotation.id]
    );

    // Insert quotation line items
    const insertedLineItems = [];
    for (const item of computedLineItems) {
      const lineItemResult = await client.query(
        `INSERT INTO quotation_line_items (quotation_id, rfq_line_item_id, item_name, quantity, unit, unit_price, total_price, delivery_days)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING *`,
        [
          quotation.id,
          item.rfq_line_item_id,
          item.item_name,
          item.quantity,
          item.unit || 'NOS',
          item.unit_price,
          item.total_price,
          item.delivery_days || null,
        ]
      );
      insertedLineItems.push(lineItemResult.rows[0]);
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'Quotation saved as draft successfully',
      data: {
        ...quotation,
        line_items: insertedLineItems,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};

// PATCH /api/quotations/:id/submit
export const submitQuotation = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Fetch quotation details including vendor and rfq information for authorization and activity logging
    const qDetailsResult = await query(
      `SELECT q.*, 
              v.name AS vendor_name, 
              v.created_by AS vendor_created_by,
              v.contact_email AS vendor_contact_email,
              r.title AS rfq_title
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       JOIN rfqs r ON q.rfq_id = r.id
       WHERE q.id = $1`,
      [id]
    );

    if (qDetailsResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found',
      });
    }

    const qDetails = qDetailsResult.rows[0];

    // Authorization check
    if (req.user?.role === 'vendor') {
      const isAssociated = 
        qDetails.vendor_created_by === req.user.userId || 
        qDetails.vendor_contact_email === req.user.email;
      if (!isAssociated) {
        return res.status(403).json({
          success: false,
          message: 'You are not authorized to submit this quotation.',
        });
      }
    }

    // Update status to submitted
    const updateResult = await query(
      `UPDATE quotations
       SET status = 'submitted', submitted_at = NOW(), updated_at = NOW()
       WHERE id = $1
       RETURNING *`,
      [id]
    );

    const updatedQuotation = updateResult.rows[0];

    // Log Activity
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : 'Vendor User';

    await logActivity({
      event_type: 'quotation',
      action: 'Quotation Submitted',
      description: `Quotation submitted by ${qDetails.vendor_name} for RFQ "${qDetails.rfq_title}".`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: updatedQuotation.id,
      resource_type: 'quotation',
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation submitted successfully',
      data: updatedQuotation,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/quotations/compare/:rfq_id
export const compareQuotations = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { rfq_id } = req.params;

    // Fetch RFQ info
    const rfqResult = await query(
      `SELECT id, rfq_number, title, category, deadline, status FROM rfqs WHERE id = $1`,
      [rfq_id]
    );

    if (rfqResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    const rfq = rfqResult.rows[0];

    // Fetch submitted quotations sorted by grand_total ASC
    const quotationsResult = await query(
      `SELECT q.id, 
              q.grand_total, 
              q.gst_percentage, 
              q.delivery_days, 
              q.payment_terms,
              q.notes,
              v.id AS vendor_id,
              v.name AS vendor_name, 
              v.rating AS vendor_rating
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       WHERE q.rfq_id = $1 AND q.status = 'submitted'
       ORDER BY q.grand_total ASC`,
      [rfq_id]
    );

    // Determine lowest grand_total (first row after ORDER BY ASC, but handle ties)
    const lowestTotal = quotationsResult.rows.length > 0
      ? parseFloat(quotationsResult.rows[0].grand_total)
      : null;

    let markedLowest = false;
    const quotations = quotationsResult.rows.map((q) => {
      const grandTotal = parseFloat(q.grand_total);
      // Only mark the very first (cheapest) entry as lowest, not ties
      const isLowest = lowestTotal !== null && grandTotal === lowestTotal && !markedLowest;
      if (isLowest) markedLowest = true;
      return {
        id: q.id,
        vendor: {
          id: q.vendor_id,
          name: q.vendor_name,
          rating: q.vendor_rating,
        },
        grand_total: grandTotal,
        gst_percentage: parseFloat(q.gst_percentage),
        delivery_days: q.delivery_days,
        payment_terms: q.payment_terms,
        notes: q.notes,
        is_lowest: isLowest,
      };
    });

    return res.status(200).json({
      success: true,
      data: {
        rfq,
        quotations,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/quotations/:id/select
export const selectQuotation = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;

    // Fetch quotation details
    const quotationResult = await client.query(
      `SELECT q.*, v.name AS vendor_name, r.title AS rfq_title 
       FROM quotations q
       JOIN vendors v ON q.vendor_id = v.id
       JOIN rfqs r ON q.rfq_id = r.id
       WHERE q.id = $1`,
      [id]
    );

    if (quotationResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Quotation not found',
      });
    }

    const selectedQuotation = quotationResult.rows[0];

    if (selectedQuotation.status !== 'submitted') {
      return res.status(400).json({
        success: false,
        message: 'Only submitted quotations can be selected',
      });
    }

    await client.query('BEGIN');

    // 1. Set this quotation status to selected
    const updateSelectedResult = await client.query(
      `UPDATE quotations 
       SET status = 'selected', updated_at = NOW() 
       WHERE id = $1 
       RETURNING *`,
      [id]
    );

    const updatedQuotation = updateSelectedResult.rows[0];

    // 2. Reject all other quotations for the same RFQ
    await client.query(
      `UPDATE quotations 
       SET status = 'rejected', updated_at = NOW() 
       WHERE rfq_id = $1 AND id != $2 AND status = 'submitted'`,
      [selectedQuotation.rfq_id, id]
    );

    // 3. Automatically create approval chain records
    await createApprovalChain(
      updatedQuotation.id,
      updatedQuotation.rfq_id,
      updatedQuotation.vendor_id,
      client
    );

    await client.query('COMMIT');

    // Fetch user details for logging
    const userResult = await query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : 'Procurement Officer';

    // Log activity
    await logActivity({
      event_type: 'quotation',
      action: 'Quotation Selected',
      description: `Quotation from ${selectedQuotation.vendor_name} has been selected for RFQ "${selectedQuotation.rfq_title}". Approval workflow triggered.`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: updatedQuotation.id,
      resource_type: 'quotation',
    });

    return res.status(200).json({
      success: true,
      message: 'Quotation selected successfully and approval chain initialized.',
      data: updatedQuotation,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};
