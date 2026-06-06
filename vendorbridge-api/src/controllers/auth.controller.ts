import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/db';
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

    return res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    return next(error);
  }
};
