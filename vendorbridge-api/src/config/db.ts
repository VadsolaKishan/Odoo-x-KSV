import { Pool } from 'pg';
import dotenv from 'dotenv';
dotenv.config();

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }, // Required for Neon
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 15000,
});

pool.on('error', (err) => {
  console.error('Unexpected DB error:', err);
  process.exit(-1);
});

export const query = (text: string, params?: any[]) => pool.query(text, params);
