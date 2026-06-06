import request from 'supertest';
import app from '../src/app';

describe('Reports Endpoints', () => {
  const uniqueId = Date.now();
  let adminToken = '';
  let vendorToken = '';
  let officerToken = '';

  beforeAll(async () => {
    // 1. Register/Login Admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'Reports',
        email: `admin.reports.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register/Login Vendor
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'Reports',
        email: `vendor.reports.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'vendor',
      });
    vendorToken = vendorReg.body.data.token;

    // 3. Register/Login Procurement Officer
    const officerReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Officer',
        last_name: 'Reports',
        email: `officer.reports.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'procurement_officer',
      });
    officerToken = officerReg.body.data.token;
  });

  it('should retrieve reports summary for admin/manager', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.total_spend).toBeDefined();
    expect(res.body.data.active_vendors).toBeDefined();
    expect(res.body.data.po_fulfillment_rate).toBeDefined();
    expect(res.body.data.overdue_invoices).toBeDefined();
    expect(res.body.data.month).toBeDefined();
  });

  it('should retrieve reports summary for procurement officer', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${officerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
  });

  it('should deny vendor from retrieving reports summary', async () => {
    const res = await request(app)
      .get('/api/reports/summary')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
  });

  it('should retrieve monthly spend report', async () => {
    const res = await request(app)
      .get('/api/reports/monthly-spend')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should retrieve vendor performance report', async () => {
    const res = await request(app)
      .get('/api/reports/vendor-performance')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });
});
