import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

// GET /api/reports/summary
export const getSummary = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // 1. Total Spend (SUM of grand_total from invoices in current month, status != 'cancelled')
    const spendRes = await query(
      `SELECT COALESCE(SUM(grand_total), 0)::numeric AS total 
       FROM invoices 
       WHERE status != 'cancelled' 
         AND date_trunc('month', invoice_date) = date_trunc('month', CURRENT_DATE)`
    );
    const totalSpend = parseFloat(spendRes.rows[0].total);

    // 2. Active Vendors (COUNT from vendors WHERE status = 'active')
    const vendorsRes = await query(
      `SELECT COUNT(*)::int AS count FROM vendors WHERE status = 'active'`
    );
    const activeVendors = vendorsRes.rows[0].count;

    // 3. PO Fulfillment Rate ((completed POs / total POs) * 100)
    const poRes = await query(
      `SELECT 
         COUNT(CASE WHEN status = 'completed' THEN 1 END)::int AS completed_count,
         COUNT(*)::int AS total_count
       FROM purchase_orders`
    );
    const completedCount = poRes.rows[0].completed_count;
    const totalCount = poRes.rows[0].total_count;
    const poFulfillmentRate = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

    // 4. Overdue Invoices (COUNT from invoices WHERE status = 'overdue' OR (status='pending_payment' AND due_date < NOW()))
    const overdueRes = await query(
      `SELECT COUNT(*)::int AS count 
       FROM invoices 
       WHERE status = 'overdue' 
          OR (status = 'pending_payment' AND due_date < CURRENT_DATE)`
    );
    const overdueInvoices = overdueRes.rows[0].count;

    // 5. Active RFQs (COUNT from rfqs WHERE status = 'published')
    const rfqsRes = await query(
      `SELECT COUNT(*)::int AS count FROM rfqs WHERE status = 'published'`
    );
    const activeRfqs = rfqsRes.rows[0].count;

    // 6. Pending Approvals (COUNT from approvals WHERE status = 'pending')
    const approvalsRes = await query(
      `SELECT COUNT(*)::int AS count FROM approvals WHERE status = 'pending'`
    );
    const pendingApprovals = approvalsRes.rows[0].count;

    // Get current month name
    const monthNames = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    const currentDate = new Date();
    const monthStr = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;

    return res.status(200).json({
      success: true,
      data: {
        total_spend: totalSpend,
        active_vendors: activeVendors,
        po_fulfillment_rate: poFulfillmentRate,
        overdue_invoices: overdueInvoices,
        active_rfqs: activeRfqs,
        pending_approvals: pendingApprovals,
        month: monthStr,
      },
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/reports/monthly-spend
export const getMonthlySpend = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Returns last 6 months of spending data
    const result = await query(
      `SELECT 
         to_char(date_trunc('month', invoice_date), 'Mon YYYY') AS month_name,
         SUM(grand_total)::numeric AS amount,
         date_trunc('month', invoice_date) AS month_date
       FROM invoices
       WHERE status != 'cancelled'
         AND invoice_date >= CURRENT_DATE - INTERVAL '6 months'
       GROUP BY date_trunc('month', invoice_date)
       ORDER BY month_date ASC`
    );

    const formattedData = result.rows.map((row) => ({
      month: row.month_name,
      amount: parseFloat(row.amount),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    return next(error);
  }
};

// GET /api/reports/vendor-performance
export const getVendorPerformance = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Top 5 vendors by PO count + average rating + total spend
    const result = await query(
      `SELECT 
         v.id,
         v.name,
         COALESCE(v.rating, 0.00)::numeric AS rating,
         COUNT(po.id)::int AS po_count,
         COALESCE(SUM(po.grand_total), 0)::numeric AS total_spend
       FROM vendors v
       LEFT JOIN purchase_orders po ON v.id = po.vendor_id
       GROUP BY v.id, v.name, v.rating
       ORDER BY total_spend DESC, po_count DESC, rating DESC
       LIMIT 5`
    );

    const formattedData = result.rows.map((row) => ({
      id: row.id,
      name: row.name,
      rating: parseFloat(row.rating),
      po_count: row.po_count,
      total_spend: parseFloat(row.total_spend),
    }));

    return res.status(200).json({
      success: true,
      data: formattedData,
    });
  } catch (error) {
    return next(error);
  }
};
