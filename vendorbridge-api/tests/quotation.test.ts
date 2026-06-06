import request from 'supertest';
import app from '../src/app';

describe('Quotation Endpoints', () => {
  const uniqueId = Date.now();
  let adminToken = '';
  let vendorToken = '';
  let vendorEmail = `vendor.user.q.${uniqueId}@example.com`;
  let rfqId = '';
  let rfqLineItemId = '';
  let vendorId = '';
  let quotationId = '';

  beforeAll(async () => {
    // 1. Register/Login Admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'User',
        email: `admin.q.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register/Login Vendor User
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'Q',
        email: vendorEmail,
        password: 'securepassword123',
        role: 'vendor',
      });
    vendorToken = vendorReg.body.data.token;

    // 3. Admin creates a vendor associated with the vendor user's email
    const vendorRes = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `Quotation Supplier ${uniqueId}`,
        category: 'Services',
        gst_number: `GST-Q-${uniqueId}`,
        contact_phone: '+919999999999',
        contact_email: vendorEmail, // links the vendor user
      });
    vendorId = vendorRes.body.data.id;

    // 4. Admin creates RFQ
    const rfqRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Procurement for Q-Test ${uniqueId}`,
        category: 'Services',
        description: 'Test RFQ for quotation testing',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'published',
        line_items: [
          {
            item_name: 'Consulting Hour',
            quantity: 10,
            unit: 'HOURS',
            estimated_unit_price: 150,
          }
        ],
        vendor_ids: [vendorId], // Invite our test vendor
      });
    rfqId = rfqRes.body.data.id;
    rfqLineItemId = rfqRes.body.data.line_items[0].id;
  });

  it('should allow vendor to create a draft quotation', async () => {
    const res = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfq_id: rfqId,
        vendor_id: vendorId,
        gst_percentage: 18,
        delivery_days: 5,
        payment_terms: 'NET 30',
        notes: 'Price includes all taxes',
        line_items: [
          {
            rfq_line_item_id: rfqLineItemId,
            item_name: 'Consulting Hour',
            quantity: 10,
            unit: 'HOURS',
            unit_price: 120, // bidding 120 per hour
            delivery_days: 5,
          }
        ],
      });

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('draft');
    expect(parseFloat(res.body.data.subtotal)).toBe(1200);
    expect(parseFloat(res.body.data.grand_total)).toBe(1416); // 1200 + 18% GST (216)
    quotationId = res.body.data.id;
  });

  it('should deny vendor from creating a quotation for uninvited RFQ', async () => {
    // 1. Create another RFQ without inviting this vendor
    const uninvitedRfqRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Uninvited RFQ ${uniqueId}`,
        category: 'Services',
        deadline: '2026-12-31',
        line_items: [{ item_name: 'Consulting Hour', quantity: 5 }],
        vendor_ids: [],
      });
    const uninvitedRfqId = uninvitedRfqRes.body.data.id;
    const uninvitedLineItemId = uninvitedRfqRes.body.data.line_items[0].id;

    // 2. Try to submit quotation
    const res = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfq_id: uninvitedRfqId,
        vendor_id: vendorId,
        line_items: [
          {
            rfq_line_item_id: uninvitedLineItemId,
            item_name: 'Consulting Hour',
            quantity: 5,
            unit_price: 100,
          }
        ],
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain('not invited/assigned to this RFQ');
  });

  it('should list quotations for admin/procurement_officer', async () => {
    const res = await request(app)
      .get('/api/quotations')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({ rfq_id: rfqId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should retrieve a specific quotation by ID', async () => {
    const res = await request(app)
      .get(`/api/quotations/${quotationId}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(quotationId);
  });

  it('should allow vendor to submit their draft quotation', async () => {
    const res = await request(app)
      .patch(`/api/quotations/${quotationId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('submitted');
  });

  it('should compare quotations for an RFQ', async () => {
    const res = await request(app)
      .get(`/api/quotations/compare/${rfqId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.rfq.id).toBe(rfqId);
    expect(res.body.data.quotations.length).toBe(1);
    expect(res.body.data.quotations[0].id).toBe(quotationId);
    expect(res.body.data.quotations[0].is_lowest).toBe(true);
  });

  it('should allow procurement_officer/admin to select a submitted quotation', async () => {
    const res = await request(app)
      .patch(`/api/quotations/${quotationId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('selected');
    expect(res.body.message).toContain('approval chain initialized');
  });

  it('should fail to select an already selected/unsubmitted quotation', async () => {
    const res = await request(app)
      .patch(`/api/quotations/${quotationId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
