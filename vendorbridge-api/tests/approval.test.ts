import request from 'supertest';
import app from '../src/app';

describe('Approval Endpoints', () => {
  jest.setTimeout(90000); // Set a longer timeout for this suite
  const uniqueId = Date.now();
  let adminToken = '';
  let managerToken = '';
  let vendorToken = '';
  let vendorEmail = `vendor.approval.${uniqueId}@example.com`;
  let rfqId = '';
  let vendorId = '';
  let quotationId = '';
  let rfqLineItemId = '';

  beforeAll(async () => {
    // 1. Register Admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'Approver',
        email: `admin.app.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register Manager
    const managerReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Manager',
        last_name: 'Approver',
        email: `manager.app.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'manager',
      });
    managerToken = managerReg.body.data.token;

    // 3. Register Vendor
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'User',
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
        name: `Approval Supplier ${uniqueId}`,
        category: 'Consulting',
        gst_number: `GST-APP-${uniqueId}`,
        contact_phone: '+1444444444',
        contact_email: vendorEmail,
      });
    vendorId = vendorRes.body.data.id;

    // 5. Create RFQ
    const rfqRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `RFQ for Approval Test ${uniqueId}`,
        category: 'Consulting',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'published',
        line_items: [
          {
            item_name: 'Design Consulting',
            quantity: 5,
            unit: 'DAYS',
            estimated_unit_price: 1000,
          }
        ],
        vendor_ids: [vendorId],
      });
    rfqId = rfqRes.body.data.id;
    rfqLineItemId = rfqRes.body.data.line_items[0].id;
  });

  async function createSubmittedQuotation() {
    // Create quotation draft
    const draftRes = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfq_id: rfqId,
        vendor_id: vendorId,
        gst_percentage: 18,
        delivery_days: 10,
        payment_terms: 'NET 30',
        line_items: [
          {
            rfq_line_item_id: rfqLineItemId,
            item_name: 'Design Consulting',
            quantity: 5,
            unit: 'DAYS',
            unit_price: 900,
            delivery_days: 10,
          }
        ],
      });
    const qId = draftRes.body.data.id;

    // Submit quotation
    await request(app)
      .patch(`/api/quotations/${qId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`);

    return qId;
  }

  it('should initialize approval chain on quotation selection', async () => {
    quotationId = await createSubmittedQuotation();

    // Select the quotation
    const selectRes = await request(app)
      .patch(`/api/quotations/${quotationId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(selectRes.status).toBe(200);

    // Retrieve approval chain
    const chainRes = await request(app)
      .get(`/api/approvals/${quotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(chainRes.status).toBe(200);
    expect(chainRes.body.data.length).toBe(2); // Level 1 and Level 2
    expect(chainRes.body.data[0].level).toBe(1);
    expect(chainRes.body.data[0].status).toBe('pending');
    expect(chainRes.body.data[1].level).toBe(2);
    expect(chainRes.body.data[1].status).toBe('pending');
  });

  it('should deny approval access to non-managers/non-admins', async () => {
    const chainRes = await request(app)
      .get(`/api/approvals/${quotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const approvalId = chainRes.body.data[0].id;

    const res = await request(app)
      .patch(`/api/approvals/${approvalId}/approve`)
      .set('Authorization', `Bearer ${vendorToken}`) // Vendor cannot approve
      .send({ remarks: 'Approve from vendor' });

    expect(res.status).toBe(403);
  });

  it('should allow manager/admin to approve Level 1', async () => {
    const chainRes = await request(app)
      .get(`/api/approvals/${quotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const level1 = chainRes.body.data[0];

    const res = await request(app)
      .patch(`/api/approvals/${level1.id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ remarks: 'Level 1 approved by Manager' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');
    expect(res.body.data.remarks).toBe('Level 1 approved by Manager');
  });

  it('should allow manager/admin to approve Level 2 and automatically trigger PO generation', async () => {
    const chainRes = await request(app)
      .get(`/api/approvals/${quotationId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const level2 = chainRes.body.data[1];

    const res = await request(app)
      .patch(`/api/approvals/${level2.id}/approve`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ remarks: 'Level 2 approved by Manager' });

    expect(res.status).toBe(200);
    expect(res.body.data.status).toBe('approved');

    // Verify that RFQ status is now 'awarded'
    const rfqCheck = await request(app)
      .get(`/api/rfqs/${rfqId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(rfqCheck.body.data.status).toBe('awarded');
  });

  it('should allow manager/admin to reject an approval level and revert quotation to submitted status', async () => {
    // 1. Create and select a new quotation
    const newRFQRes = await request(app)
      .post('/api/rfqs')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        title: `Rejection RFQ ${uniqueId}`,
        category: 'Consulting',
        deadline: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        status: 'published',
        line_items: [{ item_name: 'Support Services', quantity: 10, unit_price: 100 }],
        vendor_ids: [vendorId],
      });
    const newRfqId = newRFQRes.body.data.id;
    const newRfqLineItem = newRFQRes.body.data.line_items[0].id;

    const newDraftRes = await request(app)
      .post('/api/quotations')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        rfq_id: newRfqId,
        vendor_id: vendorId,
        line_items: [{ rfq_line_item_id: newRfqLineItem, item_name: 'Support Services', quantity: 10, unit_price: 100 }],
      });
    const newQId = newDraftRes.body.data.id;

    await request(app)
      .patch(`/api/quotations/${newQId}/submit`)
      .set('Authorization', `Bearer ${vendorToken}`);

    await request(app)
      .patch(`/api/quotations/${newQId}/select`)
      .set('Authorization', `Bearer ${adminToken}`);

    // Get approval chain
    const chainRes = await request(app)
      .get(`/api/approvals/${newQId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    const level1 = chainRes.body.data[0];

    // Reject Level 1
    const rejectRes = await request(app)
      .patch(`/api/approvals/${level1.id}/reject`)
      .set('Authorization', `Bearer ${managerToken}`)
      .send({ remarks: 'Price is too high' });

    expect(rejectRes.status).toBe(200);
    expect(rejectRes.body.data.status).toBe('rejected');

    // Verify quotation is reverted to submitted
    const qCheck = await request(app)
      .get(`/api/quotations/${newQId}`)
      .set('Authorization', `Bearer ${vendorToken}`);
    expect(qCheck.body.data.status).toBe('submitted');
  });
});
