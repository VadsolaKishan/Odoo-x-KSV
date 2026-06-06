import { query } from '../config/db';

export async function logActivity(params: {
  event_type: 'rfq' | 'approval' | 'invoice' | 'vendor' | 'quotation' | 'po';
  action: string;
  description: string;
  performed_by?: string;
  performed_by_name?: string;
  resource_id?: string;
  resource_type?: string;
  meta?: object;
}) {
  try {
    await query(
      `INSERT INTO activity_logs 
       (event_type, action, description, performed_by, performed_by_name, resource_id, resource_type, meta)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        params.event_type,
        params.action,
        params.description,
        params.performed_by || null,
        params.performed_by_name || null,
        params.resource_id || null,
        params.resource_type || null,
        params.meta ? JSON.stringify(params.meta) : null,
      ]
    );
  } catch (error) {
    console.error('Activity logging failed (activity_logs table might not exist yet):', error);
  }
}
