import { Request, Response, NextFunction } from 'express';
import { query } from '../config/db';

// GET /api/activity-logs
export const getActivityLogs = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { event_type, page = '1', limit = '20' } = req.query;

    const pageVal = parseInt(page as string, 10) || 1;
    const limitVal = parseInt(limit as string, 10) || 20;
    const offsetVal = (pageVal - 1) * limitVal;

    const conditions: string[] = [];
    const params: any[] = [];

    if (event_type && event_type !== 'all') {
      params.push(event_type);
      conditions.push(`event_type = $${params.length}`);
    }

    const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Total Count
    const countRes = await query(
      `SELECT COUNT(*) FROM activity_logs ${whereClause}`,
      params
    );
    const total = parseInt(countRes.rows[0].count, 10);

    // List Logs
    const selectParams = [...params];
    selectParams.push(limitVal);
    const limitPlaceholder = `$${selectParams.length}`;
    selectParams.push(offsetVal);
    const offsetPlaceholder = `$${selectParams.length}`;

    const dataQuery = `
      SELECT 
        id, 
        event_type, 
        action,
        description, 
        performed_by_name, 
        created_at, 
        resource_type, 
        resource_id
      FROM activity_logs
      ${whereClause}
      ORDER BY created_at DESC
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
