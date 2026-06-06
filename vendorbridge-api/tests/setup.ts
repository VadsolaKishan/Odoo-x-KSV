import { pool } from '../src/config/db';

afterAll(async () => {
  // Close database pool after all tests run to avoid hanging handles
  await pool.end();
});
