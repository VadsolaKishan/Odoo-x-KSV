import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { query } from '../config/db';

// Validation Schemas
export const createVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255),
  category: z.string().min(1, 'Category is required').max(100),
  gst_number: z.string().min(1, 'GST number is required').max(50),
  contact_name: z.string().max(150).optional().nullable(),
  contact_phone: z.string().min(1, 'Contact phone is required').max(30),
  contact_email: z.string().email('Invalid email format').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
});

export const updateVendorSchema = z.object({
  name: z.string().min(1, 'Name is required').max(255).optional(),
  category: z.string().min(1, 'Category is required').max(100).optional(),
  gst_number: z.string().min(1, 'GST number is required').max(50).optional(),
  contact_name: z.string().max(150).optional().nullable(),
  contact_phone: z.string().min(1, 'Contact phone is required').max(30).optional(),
  contact_email: z.string().email('Invalid email format').optional().or(z.literal('')).nullable(),
  address: z.string().optional().nullable(),
  status: z.enum(['active', 'pending', 'blocked']).optional(),
});

// Controllers
export const getVendors = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, category, search, page = '1', limit = '10' } = req.query;

    const pageVal = parseInt(page as string, 10) || 1;
    const limitVal = parseInt(limit as string, 10) || 10;
    const offsetVal = (pageVal - 1) * limitVal;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      conditions.push(`status = $${params.length}`);
    }

    if (category) {
      params.push(category);
      conditions.push(`category = $${params.length}`);
    }

    if (search) {
      params.push(`%${search}%`);
      conditions.push(`(name ILIKE $${params.length} OR gst_number ILIKE $${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Count query for matching records
    const countResult = await query(
      `SELECT COUNT(*) FROM vendors ${whereClause}`,
      params
    );
    const total = parseInt(countResult.rows[0].count, 10);

    // Data query for paginated results
    const selectParams = [...params];
    selectParams.push(limitVal);
    const limitPlaceholder = `$${selectParams.length}`;
    selectParams.push(offsetVal);
    const offsetPlaceholder = `$${selectParams.length}`;

    const dataResult = await query(
      `SELECT * FROM vendors ${whereClause} ORDER BY created_at DESC LIMIT ${limitPlaceholder} OFFSET ${offsetPlaceholder}`,
      selectParams
    );

    // Global counts of statuses (system-wide)
    const countsResult = await query(
      'SELECT status, COUNT(*) as count FROM vendors GROUP BY status'
    );
    let allCount = 0;
    let activeCount = 0;
    let pendingCount = 0;
    let blockedCount = 0;

    for (const row of countsResult.rows) {
      const count = parseInt(row.count, 10);
      allCount += count;
      if (row.status === 'active') activeCount = count;
      if (row.status === 'pending') pendingCount = count;
      if (row.status === 'blocked') blockedCount = count;
    }

    const statusCounts = {
      all: allCount,
      active: activeCount,
      pending: pendingCount,
      blocked: blockedCount,
    };

    return res.status(200).json({
      success: true,
      data: dataResult.rows,
      meta: {
        total,
        page: pageVal,
        limit: limitVal,
      },
      statusCounts,
    });
  } catch (error) {
    return next(error);
  }
};

export const getVendorById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const result = await query('SELECT * FROM vendors WHERE id = $1', [id]);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

export const createVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      name,
      category,
      gst_number,
      contact_name,
      contact_phone,
      contact_email,
      address,
    } = req.body;

    const creatorId = req.user?.userId;

    const result = await query(
      `INSERT INTO vendors (name, category, gst_number, contact_name, contact_phone, contact_email, address, status, rating, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
       RETURNING *`,
      [
        name,
        category,
        gst_number,
        contact_name || null,
        contact_phone,
        contact_email || null,
        address || null,
        'pending',
        0.00,
        creatorId || null,
      ]
    );

    return res.status(201).json({
      success: true,
      message: 'Vendor created successfully',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

export const updateVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const fields = req.body;

    const fieldsToUpdate: string[] = [];
    const params: any[] = [];

    const updateableFields = [
      'name',
      'category',
      'gst_number',
      'contact_name',
      'contact_phone',
      'contact_email',
      'address',
      'status',
    ];

    for (const key of updateableFields) {
      if (fields[key] !== undefined) {
        params.push(fields[key]);
        fieldsToUpdate.push(`${key} = $${params.length}`);
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No fields provided for update',
      });
    }

    params.push(id);
    const queryText = `
      UPDATE vendors 
      SET ${fieldsToUpdate.join(', ')}, updated_at = NOW() 
      WHERE id = $${params.length} 
      RETURNING *
    `;

    const result = await query(queryText, params);

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor updated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};

export const deleteVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    // Soft delete approach: status = 'blocked'
    const result = await query(
      `UPDATE vendors 
       SET status = 'blocked', updated_at = NOW() 
       WHERE id = $1 
       RETURNING id`,
      [id]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Vendor blocked successfully',
    });
  } catch (error) {
    return next(error);
  }
};

export const rateVendor = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { rating } = req.body;

    const parsedRating = parseFloat(rating);
    if (isNaN(parsedRating) || parsedRating < 1 || parsedRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be a number between 1 and 5',
      });
    }

    const vendorResult = await query('SELECT rating FROM vendors WHERE id = $1', [id]);
    if (vendorResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Vendor not found',
      });
    }

    const currentRating = parseFloat(vendorResult.rows[0].rating || '0');
    // If vendor doesn't have rating yet, set it directly. Otherwise, average it.
    const newRating = currentRating === 0 ? parsedRating : (currentRating + parsedRating) / 2;

    const result = await query(
      `UPDATE vendors 
       SET rating = $1, updated_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [newRating.toFixed(2), id]
    );

    return res.status(200).json({
      success: true,
      message: 'Vendor rated successfully',
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};
