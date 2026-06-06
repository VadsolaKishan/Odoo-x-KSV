import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query, pool } from '../config/db';
import { logActivity } from '../utils/activityLogger';

// Validation Schemas
export const createRFQSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  description: z.string().optional().nullable(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format',
  }),
  status: z.enum(['draft', 'published']).default('draft'),
  line_items: z.array(
    z.object({
      item_name: z.string().min(1, 'Item name is required').max(255),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      unit: z.string().min(1, 'Unit is required').max(50).default('NOS'),
      estimated_unit_price: z.number().positive().optional().nullable(),
    })
  ).min(1, 'At least one line item is required'),
  vendor_ids: z.array(z.string().uuid('Invalid vendor ID format')).optional().default([]),
});

export const updateRFQSchema = z.object({
  title: z.string().min(1, 'Title is required').max(255).optional(),
  category: z.string().min(1, 'Category is required').max(100).optional(),
  description: z.string().optional().nullable(),
  deadline: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid deadline date format',
  }).optional(),
  line_items: z.array(
    z.object({
      item_name: z.string().min(1, 'Item name is required').max(255),
      quantity: z.number().int().positive('Quantity must be a positive integer'),
      unit: z.string().min(1, 'Unit is required').max(50).default('NOS'),
      estimated_unit_price: z.number().positive().optional().nullable(),
    })
  ).min(1, 'At least one line item is required').optional(),
  vendor_ids: z.array(z.string().uuid('Invalid vendor ID format')).optional(),
});

export const updateStatusSchema = z.object({
  status: z.enum(['draft', 'published', 'closed', 'awarded']),
});

// Controllers
export const getRFQs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, vendor_id, page = '1', limit = '10' } = req.query;

    const pageVal = parseInt(page as string, 10) || 1;
    const limitVal = parseInt(limit as string, 10) || 10;
    const offsetVal = (pageVal - 1) * limitVal;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      conditions.push(`r.status = $${params.length}`);
    }

    // Filter by assigned vendor when vendor_id is provided
    const vendorJoin = vendor_id
      ? `JOIN rfq_vendor_assignments rva_filter ON r.id = rva_filter.rfq_id AND rva_filter.vendor_id = $${params.length + 1}`
      : '';
    if (vendor_id && typeof vendor_id === 'string') {
      params.push(vendor_id);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total matching count
    const countResult = await query(
      `SELECT COUNT(*) FROM rfqs r ${vendorJoin} ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Get paginated RFQs list
    const selectParams = [...params];
    selectParams.push(limitVal);
    const limitPlaceholder = `$${selectParams.length}`;
    selectParams.push(offsetVal);
    const offsetPlaceholder = `$${selectParams.length}`;

    const dataQuery = `
      SELECT 
        r.id,
        r.rfq_number,
        r.title,
        r.category,
        r.description,
        r.deadline,
        r.status,
        r.created_by,
        r.created_at,
        r.updated_at,
        u.first_name || ' ' || u.last_name AS creator_name,
        COALESCE(li.li_count, 0)::int AS line_items_count,
        COALESCE(va.va_count, 0)::int AS vendor_count
      FROM rfqs r
      ${vendorJoin}
      LEFT JOIN users u ON r.created_by = u.id
      LEFT JOIN (
        SELECT rfq_id, COUNT(*) as li_count 
        FROM rfq_line_items 
        GROUP BY rfq_id
      ) li ON r.id = li.rfq_id
      LEFT JOIN (
        SELECT rfq_id, COUNT(*) as va_count 
        FROM rfq_vendor_assignments 
        GROUP BY rfq_id
      ) va ON r.id = va.rfq_id
      ${whereClause}
      ORDER BY r.created_at DESC
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

export const getRFQById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Fetch RFQ base detail with creator info
    const rfqResult = await query(
      `SELECT r.*, u.first_name, u.last_name, u.email 
       FROM rfqs r 
       LEFT JOIN users u ON r.created_by = u.id 
       WHERE r.id = $1`,
      [id]
    );

    if (rfqResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    const rfq = rfqResult.rows[0];

    // Fetch related line items
    const lineItemsResult = await query(
      'SELECT * FROM rfq_line_items WHERE rfq_id = $1 ORDER BY created_at ASC',
      [id]
    );

    // Fetch related assigned vendors
    const vendorsResult = await query(
      `SELECT v.* 
       FROM rfq_vendor_assignments a 
       JOIN vendors v ON a.vendor_id = v.id 
       WHERE a.rfq_id = $1 
       ORDER BY v.name ASC`,
      [id]
    );

    // Fetch attachments
    const attachmentsResult = await query(
      'SELECT * FROM rfq_attachments WHERE rfq_id = $1 ORDER BY uploaded_at ASC',
      [id]
    );

    const formattedRFQ = {
      id: rfq.id,
      rfq_number: rfq.rfq_number,
      title: rfq.title,
      category: rfq.category,
      description: rfq.description,
      deadline: rfq.deadline,
      status: rfq.status,
      created_at: rfq.created_at,
      updated_at: rfq.updated_at,
      creator: {
        id: rfq.created_by,
        first_name: rfq.first_name,
        last_name: rfq.last_name,
        email: rfq.email,
      },
      line_items: lineItemsResult.rows,
      assigned_vendors: vendorsResult.rows,
      attachments: attachmentsResult.rows,
    };

    return res.status(200).json({
      success: true,
      data: formattedRFQ,
    });
  } catch (error) {
    return next(error);
  }
};

export const createRFQ = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { title, category, description, deadline, status, line_items, vendor_ids } = req.body;
    const userId = req.user?.userId;

    await client.query('BEGIN');

    // Sequential number generation
    const countResult = await client.query('SELECT COUNT(*) FROM rfqs');
    const count = parseInt(countResult.rows[0].count, 10) + 1;
    const rfqNumber = `RFQ-${new Date().getFullYear()}-${String(count).padStart(4, '0')}`;

    // Insert RFQ base details
    const rfqResult = await client.query(
      `INSERT INTO rfqs (rfq_number, title, category, description, deadline, status, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        rfqNumber,
        title,
        category,
        description || null,
        deadline,
        status || 'draft',
        userId,
      ]
    );

    const createdRFQ = rfqResult.rows[0];

    // Insert Line Items
    const createdLineItems = [];
    if (line_items && Array.isArray(line_items)) {
      for (const item of line_items) {
        const itemResult = await client.query(
          `INSERT INTO rfq_line_items (rfq_id, item_name, quantity, unit, estimated_unit_price)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            createdRFQ.id,
            item.item_name,
            item.quantity,
            item.unit || 'NOS',
            item.estimated_unit_price || null,
          ]
        );
        createdLineItems.push(itemResult.rows[0]);
      }
    }

    // Insert Vendor Assignments
    if (vendor_ids && Array.isArray(vendor_ids)) {
      for (const vendorId of vendor_ids) {
        await client.query(
          `INSERT INTO rfq_vendor_assignments (rfq_id, vendor_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [createdRFQ.id, vendorId]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(201).json({
      success: true,
      message: 'RFQ created successfully',
      data: {
        ...createdRFQ,
        line_items: createdLineItems,
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};

export const patchRFQStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const rfqResult = await query(
      `UPDATE rfqs 
       SET status = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [status, id]
    );

    if (rfqResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    const rfq = rfqResult.rows[0];

    // Trigger activity log entry if published
    if (status === 'published') {
      const userResult = await query(
        'SELECT first_name, last_name FROM users WHERE id = $1',
        [req.user?.userId]
      );
      const user = userResult.rows[0];
      const performerName = user ? `${user.first_name} ${user.last_name}` : 'System';

      await logActivity({
        event_type: 'rfq',
        action: 'RFQ Published',
        description: `RFQ ${rfq.rfq_number} ("${rfq.title}") has been published.`,
        performed_by: req.user?.userId,
        performed_by_name: performerName,
        resource_id: rfq.id,
        resource_type: 'rfq',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'RFQ status updated successfully',
      data: rfq,
    });
  } catch (error) {
    return next(error);
  }
};

export const updateRFQ = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { title, category, description, deadline, line_items, vendor_ids } = req.body;

    await client.query('BEGIN');

    // Build update parameters for base RFQ details
    const fieldsToUpdate: string[] = [];
    const params: any[] = [];

    const updateableFields = [
      { key: 'title', value: title },
      { key: 'category', value: category },
      { key: 'description', value: description },
      { key: 'deadline', value: deadline },
    ];

    for (const field of updateableFields) {
      if (field.value !== undefined) {
        params.push(field.value);
        fieldsToUpdate.push(`${field.key} = $${params.length}`);
      }
    }

    let updatedRFQ = null;
    if (fieldsToUpdate.length > 0) {
      params.push(id);
      const queryText = `
        UPDATE rfqs 
        SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() 
        WHERE id = $${params.length} 
        RETURNING *
      `;
      const result = await client.query(queryText, params);
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'RFQ not found',
        });
      }
      updatedRFQ = result.rows[0];
    } else {
      // Fetch current state if no updates provided for base fields
      const result = await client.query('SELECT * FROM rfqs WHERE id = $1', [id]);
      if (result.rowCount === 0) {
        await client.query('ROLLBACK');
        return res.status(404).json({
          success: false,
          message: 'RFQ not found',
        });
      }
      updatedRFQ = result.rows[0];
    }

    // Replace line items (delete and re-insert)
    if (line_items && Array.isArray(line_items)) {
      await client.query('DELETE FROM rfq_line_items WHERE rfq_id = $1', [id]);
      const createdLineItems = [];
      for (const item of line_items) {
        const itemResult = await client.query(
          `INSERT INTO rfq_line_items (rfq_id, item_name, quantity, unit, estimated_unit_price)
           VALUES ($1, $2, $3, $4, $5)
           RETURNING *`,
          [
            id,
            item.item_name,
            item.quantity,
            item.unit || 'NOS',
            item.estimated_unit_price || null,
          ]
        );
        createdLineItems.push(itemResult.rows[0]);
      }
      updatedRFQ.line_items = createdLineItems;
    }

    // Replace vendor assignments (delete and re-insert)
    if (vendor_ids && Array.isArray(vendor_ids)) {
      await client.query('DELETE FROM rfq_vendor_assignments WHERE rfq_id = $1', [id]);
      for (const vendorId of vendor_ids) {
        await client.query(
          `INSERT INTO rfq_vendor_assignments (rfq_id, vendor_id)
           VALUES ($1, $2)
           ON CONFLICT DO NOTHING`,
          [id, vendorId]
        );
      }
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: 'RFQ updated successfully',
      data: updatedRFQ,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};

export const deleteRFQ = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const userId = req.user?.userId;
    const userRole = req.user?.role;

    // Fetch RFQ status and creator
    const rfqResult = await query(
      'SELECT created_by, status FROM rfqs WHERE id = $1',
      [id]
    );

    if (rfqResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'RFQ not found',
      });
    }

    const rfq = rfqResult.rows[0];

    // Only deletable if status is 'draft'
    if (rfq.status !== 'draft') {
      return res.status(400).json({
        success: false,
        message: 'Cannot delete a published RFQ',
      });
    }

    // Only admin or creator can delete
    if (userRole !== 'admin' && rfq.created_by !== userId) {
      return res.status(403).json({
        success: false,
        message: 'Access denied: only the creator or an admin can delete this RFQ',
      });
    }

    // Cascade delete on references is defined at database schema level
    await query('DELETE FROM rfqs WHERE id = $1', [id]);

    return res.status(200).json({
      success: true,
      message: 'RFQ deleted successfully',
    });
  } catch (error) {
    return next(error);
  }
};
