import request from 'supertest';
import app from '../src/app';

describe('PO and Invoice Endpoints', () => {
  jest.setTimeout(90000); // Set a longer timeout for this suite
  const uniqueId = Date.now();
  let adminToken = '';
  let managerToken = '';
  let vendorToken = '';
  let vendorEmail = `vendor.po.${uniqueId}@example.com`;
  let rfqId = '';
  let vendorId = '';
  let quotationId = '';
  let rfqLineItemId = '';
  let poId = '';
  let invoiceId = '';

  beforeAll(async () => {
    // 1. Register Admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'PO-Test',
        email: `admin.po.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register Manager
    const managerReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Manager',
        last_name: 'PO-Test',
        email: `manager.po.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'manager',
      });
    managerToken = managerReg.body.data.token;

    // 3. Register Vendor
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'PO-User',
        email: vendorEmail,
        password: 'securepassword123',
        role: 'vendor',
      });
    vendorToken = vendorReg.body.data.token;

    // 4. Create Vendor
    const vendorRes = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: `PO supplier ${uniqueId}`,
        category: 'Services',
        gst_number: `GST-PO-${uniqueId}`,
        contact_phone: '+1333333333',
        contact_email: vendorEmail,
      });
    vendorId = vendorRes.body.data.id;

    // 5. Create RFQ
    const rfqRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `RFQ for PO Test ${uniqueId}`,
        category: 'Services',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'published',
        line_items: [
          {
            item_name: 'Testing Service',
            quantity: 2,
            unit: 'DAYS',
            estimated_unit_price: 500,
          }
        ],
        vendor_ids: [vendorId],
      });
    rfqId = rfqRes.body.data.id;
    rfqLineItemId = rfqRes.body.data.line_items[0].id;

    // 6. Create quotation draft
    const draftRes = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfq_id: rfqId,
        vendor_id: vendorId,
        gst_percentage: 18,
        delivery_days: 3,
        payment_terms: 'Immediate',
        line_items: [
          {
            rfq_line_item_id: rfqLineItemId,
            item_name: 'Testing Service',
            quantity: 2,
            unit: 'DAYS',
            unit_price: 450,
            delivery_days: 3,
          }
        ],
      });
    quotationId = draftRes.body.data.id;

    // 7. Submit quotation
    await request(app)
      .patch(`/api/quotations/${quotationId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`);

    // 8. Select quotation
    await request(app)
      .patch(`/api/quotations/${quotationId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    // 9. Approve Level 1 and Level 2
    const approvalsRes = await request(app)
      .get(`/api/approvals/${quotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const approvals = approvalsRes.body.data;

    await request(app)
      .patch(`/api/approvals/${approvals[0].id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ remarks: 'L1 approve' });

    const approveL2Res = await request(app)
      .patch(`/api/approvals/${approvals[1].id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ remarks: 'L2 approve' });

    // Level 2 approval automatically generates PO and Invoice.
    // Let's retrieve the generated PO and Invoice to perform tests on them.
    const posRes = await request(app)
      .get('/api/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`);
    poId = posRes.body.data[0].id;

    const invoicesRes = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`);
    invoiceId = invoicesRes.body.data[0].id;
  });

  it('should retrieve list of purchase orders for admin', async () => {
    const res = await request(app)
      .get('/api/purchase-orders')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should filter purchase orders for a vendor to only show their own', async () => {
    const res = await request(app)
      .get('/api/purchase-orders')
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    // All returned POs must belong to the test vendor
    res.body.data.forEach((po: any) => {
      expect(po.vendor_name).toBe(`PO supplier ${uniqueId}`);
    });
  });

  it('should retrieve specific purchase order details by ID', async () => {
    const res = await request(app)
      .get(`/api/purchase-orders/${poId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(poId);
    expect(res.body.data.line_items.length).toBeGreaterThan(0);
    expect(res.body.data.invoice).toBeDefined();
  });

  it('should retrieve list of invoices for admin', async () => {
    const res = await request(app)
      .get('/api/invoices')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });

  it('should retrieve specific invoice details by ID', async () => {
    const res = await request(app)
      .get(`/api/invoices/${invoiceId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(invoiceId);
    expect(res.body.data.bill_to).toBeDefined();
    expect(res.body.data.vendor).toBeDefined();
  });

  it('should deny non-manager/non-admin roles from marking invoice as paid', async () => {
    const res = await request(app)
      .patch(`/api/invoices/${invoiceId}/mark-paid`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow manager/admin to mark invoice as paid', async () => {
    const res = await request(app)
      .patch(`/api/invoices/${invoiceId}/mark-paid`)
      .set('Authorization', `Bearer ${managerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.status).toBe('paid');
    expect(res.body.data.paid_at).toBeDefined();
  });

  it('should allow sending invoice email mock', async () => {
    const res = await request(app)
      .post(`/api/invoices/${invoiceId}/send-email`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.message).toContain('email sent successfully');
  });
});
