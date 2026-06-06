import { Request, Response, NextFunction } from 'express';
import '../middleware/auth';
import { z } from 'zod';
import { query, pool } from '../config/db';
import { logActivity } from '../utils/activityLogger';
import { generatePO } from './po.controller';

// Helper to create approval chain
export async function createApprovalChain(
  quotationId: string,
  rfqId: string,
  vendorId: string,
  client: any
) {
  // Find Rahul Mehta and Priya Shah specifically by email
  const rahulRes = await client.query("SELECT id FROM users WHERE email = 'rahul@vendorbridge.com'");
  const priyaRes = await client.query("SELECT id FROM users WHERE email = 'priya@vendorbridge.com'");

  let approver1Id: string;
  let approver2Id: string;

  if (rahulRes.rowCount > 0) {
    approver1Id = rahulRes.rows[0].id;
  } else {
    // Fallback to existing logic
    const usersRes = await client.query(
      `SELECT id FROM users WHERE role IN ('manager', 'admin') ORDER BY role ASC LIMIT 2`
    );
    approver1Id = usersRes.rows[0]?.id;
  }

  if (priyaRes.rowCount > 0) {
    approver2Id = priyaRes.rows[0].id;
  } else {
    // Fallback to existing logic
    const usersRes = await client.query(
      `SELECT id FROM users WHERE role IN ('manager', 'admin') ORDER BY role ASC LIMIT 2`
    );
    approver2Id = usersRes.rows[1]?.id || usersRes.rows[0]?.id;
  }

  // Fallback to RFQ creator if no approvers resolved
  if (!approver1Id || !approver2Id) {
    const rfqRes = await client.query('SELECT created_by FROM rfqs WHERE id = $1', [rfqId]);
    const creatorId = rfqRes.rows[0]?.created_by;
    if (!approver1Id) approver1Id = creatorId;
    if (!approver2Id) approver2Id = creatorId;
  }

  // Insert Level 1 Approval (Procurement Head - Rahul Mehta)
  await client.query(
    `INSERT INTO approvals (quotation_id, rfq_id, vendor_id, level, approver_id, approver_name, approver_role, status, assigned_at)
     VALUES ($1, $2, $3, 1, $4, 'Rahul Mehta', 'Procurement Head', 'pending', NOW())`,
    [quotationId, rfqId, vendorId, approver1Id]
  );

  // Insert Level 2 Approval (Finance Manager - Priya Shah)
  // Level 2 stays pending and assigned_at will be updated when Level 1 approves
  await client.query(
    `INSERT INTO approvals (quotation_id, rfq_id, vendor_id, level, approver_id, approver_name, approver_role, status, assigned_at)
     VALUES ($1, $2, $3, 2, $4, 'Priya Shah', 'Finance Manager', 'pending', NOW())`,
    [quotationId, rfqId, vendorId, approver2Id]
  );
}

// Validation Schema
export const approvalDecisionSchema = z.object({
  remarks: z.string().min(1, 'Remarks are required').max(500),
});

// GET /api/approvals
export const getApprovals = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { status, rfq_id } = req.query;

    const conditions: string[] = [];
    const params: any[] = [];

    if (status) {
      params.push(status);
      conditions.push(`a.status = $${params.length}`);
    }

    if (rfq_id) {
      params.push(rfq_id);
      conditions.push(`a.rfq_id = $${params.length}`);
    }

    // Role-based restrictions: Vendors can only see approvals for their vendor ID
    if (req.user?.role === 'vendor') {
      // Find vendor associated with the user
      const vendorRes = await query(
        `SELECT id FROM vendors WHERE created_by = $1 OR contact_email = $2`,
        [req.user.userId, req.user.email]
      );
      const vendorIds = vendorRes.rows.map((row) => row.id);
      if (vendorIds.length === 0) {
        return res.status(200).json({ success: true, data: [] });
      }
      params.push(vendorIds);
      conditions.push(`a.vendor_id = ANY($${params.length})`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    const approvalsResult = await query(
      `SELECT a.*,
              r.title AS rfq_title,
              r.rfq_number,
              v.name AS vendor_name,
              q.grand_total AS quotation_total
       FROM approvals a
       JOIN rfqs r ON a.rfq_id = r.id
       JOIN vendors v ON a.vendor_id = v.id
       JOIN quotations q ON a.quotation_id = q.id
       ${whereClause}
       ORDER BY a.assigned_at DESC`,
      params
    );

    return res.status(200).json({
      success: true,
      data: approvalsResult.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/approvals/:quotation_id
export const getApprovalChain = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { quotation_id } = req.params;

    const approvalsResult = await query(
      `SELECT a.*,
              u.first_name || ' ' || u.last_name AS actual_user_name
       FROM approvals a
       LEFT JOIN users u ON a.approver_id = u.id
       WHERE a.quotation_id = $1
       ORDER BY a.level ASC`,
      [quotation_id]
    );

    if (approvalsResult.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'No approval chain found for this quotation',
      });
    }

    return res.status(200).json({
      success: true,
      data: approvalsResult.rows,
    });
  } catch (error) {
    return next(error);
  }
};

// PATCH /api/approvals/:id/approve
export const approveLevel = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    // Fetch the approval record
    const approvalRes = await client.query(
      `SELECT a.*, r.title AS rfq_title, v.name AS vendor_name 
       FROM approvals a
       JOIN rfqs r ON a.rfq_id = r.id
       JOIN vendors v ON a.vendor_id = v.id
       WHERE a.id = $1`,
      [id]
    );

    if (approvalRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approval record not found',
      });
    }

    const approval = approvalRes.rows[0];

    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Approval is already ${approval.status}`,
      });
    }

    // Begin transaction
    await client.query('BEGIN');

    // 1. Approve current level
    const updateResult = await client.query(
      `UPDATE approvals 
       SET status = 'approved', remarks = $1, actioned_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [remarks, id]
    );

    const approvedRecord = updateResult.rows[0];

    // 2. Log Activity for approval
    const userResult = await client.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : approval.approver_name;

    await logActivity({
      event_type: 'approval',
      action: 'Level Approved',
      description: `Quotation for RFQ "${approval.rfq_title}" from ${approval.vendor_name} approved at Level ${approval.level} (${approval.approver_name})`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: approvedRecord.id,
      resource_type: 'approval',
    });

    // 3. Handle next level or trigger PO
    if (approval.level === 1) {
      // Find if level 2 exists and update assigned_at
      const level2Res = await client.query(
        `SELECT id FROM approvals WHERE quotation_id = $1 AND level = 2`,
        [approval.quotation_id]
      );
      if (level2Res.rows.length > 0) {
        await client.query(
          `UPDATE approvals SET assigned_at = NOW() WHERE id = $1`,
          [level2Res.rows[0].id]
        );
      }
    } else if (approval.level === 2) {
      // Final level approved -> Trigger PO Generation automatically
      await generatePO(approval.quotation_id, req.user?.userId || approval.approver_id, client);
    }

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Level ${approval.level} approved successfully.`,
      data: approvedRecord,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};

// PATCH /api/approvals/:id/reject
export const rejectLevel = async (req: Request, res: Response, next: NextFunction) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { remarks } = req.body;

    const approvalRes = await client.query(
      `SELECT a.*, r.title AS rfq_title, v.name AS vendor_name 
       FROM approvals a
       JOIN rfqs r ON a.rfq_id = r.id
       JOIN vendors v ON a.vendor_id = v.id
       WHERE a.id = $1`,
      [id]
    );

    if (approvalRes.rowCount === 0) {
      return res.status(404).json({
        success: false,
        message: 'Approval record not found',
      });
    }

    const approval = approvalRes.rows[0];

    if (approval.status !== 'pending') {
      return res.status(400).json({
        success: false,
        message: `Approval is already ${approval.status}`,
      });
    }

    await client.query('BEGIN');

    // 1. Reject current level
    const updateResult = await client.query(
      `UPDATE approvals 
       SET status = 'rejected', remarks = $1, actioned_at = NOW() 
       WHERE id = $2 
       RETURNING *`,
      [remarks, id]
    );

    const rejectedRecord = updateResult.rows[0];

    // 2. Revert quotation status back to 'submitted'
    await client.query(
      `UPDATE quotations SET status = 'submitted', updated_at = NOW() WHERE id = $1`,
      [approval.quotation_id]
    );

    // 3. Log Activity
    const userResult = await client.query(
      'SELECT first_name, last_name FROM users WHERE id = $1',
      [req.user?.userId]
    );
    const user = userResult.rows[0];
    const performerName = user ? `${user.first_name} ${user.last_name}` : approval.approver_name;

    await logActivity({
      event_type: 'approval',
      action: 'Level Rejected',
      description: `Quotation for RFQ "${approval.rfq_title}" from ${approval.vendor_name} rejected at Level ${approval.level} (${approval.approver_name})`,
      performed_by: req.user?.userId,
      performed_by_name: performerName,
      resource_id: rejectedRecord.id,
      resource_type: 'approval',
    });

    await client.query('COMMIT');

    return res.status(200).json({
      success: true,
      message: `Level ${approval.level} rejected successfully. Quotation status reverted.`,
      data: rejectedRecord,
    });
  } catch (error) {
    await client.query('ROLLBACK');
    return next(error);
  } finally {
    client.release();
  }
};
