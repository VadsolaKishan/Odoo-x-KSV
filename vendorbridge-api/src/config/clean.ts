import { query, pool } from './db';

export async function cleanDatabase() {
  console.log('Cleaning database (dropping all tables)...');
  try {
    const dropTablesSql = `
      DROP TABLE IF EXISTS activity_logs CASCADE;
      DROP TABLE IF EXISTS invoices CASCADE;
      DROP TABLE IF EXISTS purchase_orders CASCADE;
      DROP TABLE IF EXISTS approvals CASCADE;
      DROP TABLE IF EXISTS quotation_line_items CASCADE;
      DROP TABLE IF EXISTS quotations CASCADE;
      DROP TABLE IF EXISTS rfq_attachments CASCADE;
      DROP TABLE IF EXISTS rfq_vendor_assignments CASCADE;
      DROP TABLE IF EXISTS rfq_line_items CASCADE;
      DROP TABLE IF EXISTS rfqs CASCADE;
      DROP TABLE IF EXISTS vendors CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    await query(dropTablesSql);
    console.log('All tables dropped successfully.');
  } catch (error) {
    console.error('Error cleaning database:', error);
    throw error;
  }
}

if (require.main === module) {
  cleanDatabase()
    .then(() => {
      pool.end();
      process.exit(0);
    })
    .catch((err) => {
      console.error(err);
      process.exit(1);
    });
}
