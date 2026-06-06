import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query, pool } from '../config/db';
import { JWTPayload } from '../models/types';

// Validation Schemas
export const registerSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters long').max(100),
  role: z.enum(['admin', 'procurement_officer', 'manager', 'vendor']),
  country: z.string().max(100).optional().nullable(),
  phone: z.string().max(30).optional().nullable(),
  additional_info: z.string().optional().nullable(),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
});

// Controllers
export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      first_name,
      last_name,
      email,
      password,
      role,
      country,
      phone,
      additional_info,
    } = req.body;

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);

    // Insert user into DB
    let result;
    try {
      result = await query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, country, phone, additional_info)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id, first_name, last_name, email, role, country, phone, additional_info, is_active, created_at, updated_at`,
        [
          first_name,
          last_name,
          email.toLowerCase(),
          passwordHash,
          role,
          country || null,
          phone || null,
          additional_info || null,
        ]
      );
    } catch (error: any) {
      if (error.code === '23505') {
        return res.status(409).json({
          success: false,
          message: 'Email already registered',
        });
      }
      return next(error);
    }

    const user = result.rows[0];

    // Generate JWT access token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          country: user.country,
          phone: user.phone,
          additional_info: user.additional_info,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const result = await query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rowCount === 0) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    const user = result.rows[0];

    // Compare passwords
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials',
      });
    }

    // Check if user is active
    if (!user.is_active) {
      return res.status(403).json({
        success: false,
        message: 'Account disabled',
      });
    }

    // Generate JWT access token
    const tokenPayload: JWTPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, {
      expiresIn: '7d',
    });

    return res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        token,
        user: {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
          role: user.role,
          country: user.country,
          phone: user.phone,
          additional_info: user.additional_info,
          is_active: user.is_active,
          created_at: user.created_at,
          updated_at: user.updated_at,
        },
      },
    });
  } catch (error) {
    return next(error);
  }
};

export const getMe = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Unauthenticated',
      });
    }

    const result = await query(
      'SELECT id, first_name, last_name, email, role, country, phone, additional_info, is_active, created_at, updated_at FROM users WHERE id = $1',
      [req.user.userId]
    );

    if (result.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const user = result.rows[0];

    if (user.role === 'vendor') {
      const vendorResult = await query(
        'SELECT * FROM vendors WHERE created_by = $1',
        [user.id]
      );
      if (vendorResult.rows.length > 0) {
        user.vendor = vendorResult.rows[0];
      } else {
        user.vendor = null;
      }
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

// ============================================================
// VENDOR SELF-REGISTRATION (user + vendor company in one step)
// ============================================================
export const registerVendorSchema = z.object({
  // User account fields
  first_name: z.string().min(1, 'First name is required').max(100),
  last_name: z.string().min(1, 'Last name is required').max(100),
  email: z.string().email('Invalid email format').max(255),
  password: z.string().min(8, 'Password must be at least 8 characters').max(100),
  phone: z.string().max(30).optional().nullable(),
  country: z.string().max(100).optional().nullable(),
  // Vendor company fields
  company_name: z.string().min(1, 'Company name is required').max(255),
  gst_number: z.string().min(1, 'GST number is required').max(50),
  category: z.string().min(1, 'Category is required').max(100),
  contact_phone: z.string().min(1, 'Contact phone is required').max(30),
  address: z.string().optional().nullable(),
});

export const registerVendor = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const {
      first_name, last_name, email, password, phone, country,
      company_name, gst_number, category, contact_phone, address,
    } = req.body;

    const passwordHash = await bcrypt.hash(password, 12);

    await client.query('BEGIN');

    // 1. Create user account (role = vendor)
    let userResult;
    try {
      userResult = await client.query(
        `INSERT INTO users (first_name, last_name, email, password_hash, role, country, phone)
         VALUES ($1, $2, $3, $4, 'vendor', $5, $6)
         RETURNING id, first_name, last_name, email, role, country, phone, is_active, created_at`,
        [first_name, last_name, email.toLowerCase(), passwordHash, country || 'India', phone || null]
      );
    } catch (err: any) {
      if (err.code === '23505') {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'Email already registered' });
      }
      throw err;
    }

    const user = userResult.rows[0];

    // 2. Create vendor company profile (status = pending — awaits admin approval)
    let vendorResult;
    try {
      vendorResult = await client.query(
        `INSERT INTO vendors (name, category, gst_number, contact_name, contact_phone, contact_email, address, status, rating, created_by)
         VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', 0.00, $8)
         RETURNING *`,
        [
          company_name, category, gst_number,
          `${first_name} ${last_name}`,
          contact_phone,
          email.toLowerCase(),
          address || null,
          user.id,
        ]
      );
    } catch (err: any) {
      if (err.code === '23505') {
        await client.query('ROLLBACK');
        return res.status(409).json({ success: false, message: 'GST number already registered' });
      }
      throw err;
    }

    await client.query('COMMIT');

    // Generate JWT
    const tokenPayload: JWTPayload = { userId: user.id, email: user.email, role: user.role };
    const token = jwt.sign(tokenPayload, process.env.JWT_SECRET!, { expiresIn: '7d' });

    return res.status(201).json({
      success: true,
      message: 'Vendor registered successfully. Your account is pending admin approval.',
      data: {
        token,
        user,
        vendor: vendorResult.rows[0],
      },
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};
