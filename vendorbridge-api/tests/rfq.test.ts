import request from 'supertest';
import app from '../src/app';

describe('RFQ Endpoints', () => {
  const uniqueId = Date.now();
  let adminToken = '';
  let vendorToken = '';
  let testVendorId = '';
  let createdRFQId = '';

  beforeAll(async () => {
    // 1. Register/Login admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'User',
        email: `admin.rfq.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register/Login vendor
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'User',
        email: `vendor.rfq.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'vendor',
      });
    vendorToken = vendorReg.body.data.token;

    // 3. Create a test vendor in DB to assign to RFQs
    const vendorRes = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `RFQ Target Vendor ${uniqueId}`,
        category: 'Hardware',
        gst_number: `GST-RFQ-${uniqueId}`,
        contact_phone: '+1555555555',
        contact_email: `rfqvendor.${uniqueId}@example.com`,
      });
    testVendorId = vendorRes.body.data.id;
  });

  it('should allow admin/procurement_officer to create a draft RFQ', async () => {
    const res = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Laptops Procurement ${uniqueId}`,
        category: 'Hardware',
        description: 'Procuring 50 developer laptops',
        deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
        status: 'draft',
        line_items: [
          {
            item_name: 'MacBook Pro 16"',
            quantity: 50,
            unit: 'NOS',
            estimated_unit_price: 2500,
          }
        ],
        vendor_ids: [testVendorId],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Laptops Procurement');
    expect(res.body.data.line_items.length).toBe(1);
    createdRFQId = res.body.data.id;
  });

  it('should deny vendor from creating an RFQ', async () => {
    const res = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        title: `Vendor RFQ ${uniqueId}`,
        category: 'Hardware',
        deadline: '2026-12-31',
        line_items: [{ item_name: 'Keyboard', quantity: 10 }],
      });

    expect(res.status).toBe(403);
  });

  it('should return 400 validation error for missing line items', async () => {
    const res = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: 'Empty RFQ',
        category: 'Hardware',
        deadline: '2026-12-31',
        line_items: [], // invalid
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should retrieve RFQ list', async () => {
    const res = await request(app)
      .get('/api/rfqs')
      .set('Authorization', `Bearer ${vendorToken}`); // vendors can view RFQs

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should retrieve a specific RFQ by ID', async () => {
    const res = await request(app)
      .get(`/api/rfqs/${createdRFQId}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdRFQId);
    expect(res.body.data.line_items.length).toBe(1);
    expect(res.body.data.assigned_vendors.length).toBe(1);
    expect(res.body.data.assigned_vendors[0].id).toBe(testVendorId);
  });

  it('should allow admin/creator to update a draft RFQ', async () => {
    const res = await request(app)
      .put(`/api/rfqs/${createdRFQId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Laptops Procurement - Updated ${uniqueId}`,
        line_items: [
          {
            item_name: 'MacBook Pro 16"',
            quantity: 60, // quantity updated
          },
          {
            item_name: 'Laptops Stand',
            quantity: 60, // added new item
          }
        ],
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.title).toContain('Updated');
    expect(res.body.data.line_items.length).toBe(2);
  });

  it('should allow patching RFQ status to published', async () => {
    const res = await request(app)
      .patch(`/api/rfqs/${createdRFQId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'published' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('published');
  });

  it('should refuse deletion of a published RFQ', async () => {
    const res = await request(app)
      .delete(`/api/rfqs/${createdRFQId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('Cannot delete a published RFQ');
  });

  it('should allow deleting a draft RFQ', async () => {
    // 1. Create a draft RFQ
    const draftRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Draft RFQ to Delete ${uniqueId}`,
        category: 'Hardware',
        deadline: '2026-12-31',
        line_items: [{ item_name: 'Mouse', quantity: 5 }],
      });
    const draftId = draftRes.body.data.id;

    // 2. Delete it
    const deleteRes = await request(app)
      .delete(`/api/rfqs/${draftId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(deleteRes.status).toBe(200);
    expect(deleteRes.body.success).toBe(true);

    // 3. Confirm 404
    const checkRes = await request(app)
      .get(`/api/rfqs/${draftId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(checkRes.status).toBe(404);
  });
});
