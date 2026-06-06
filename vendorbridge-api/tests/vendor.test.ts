import request from 'supertest';
import app from '../src/app';

describe('Vendor Endpoints', () => {
  const uniqueId = Date.now();
  let adminToken = '';
  let vendorToken = '';
  let createdVendorId = '';

  const testVendorData = {
    name: `Test Vendor ${uniqueId}`,
    category: 'IT Services',
    gst_number: `GST${uniqueId}`,
    contact_name: 'Jane Smith',
    contact_phone: '+1987654321',
    contact_email: `vendor.${uniqueId}@example.com`,
    address: '456 Tech Lane',
  };

  beforeAll(async () => {
    // 1. Register and login as admin
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'User',
        email: `admin.vendor.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    adminToken = adminReg.body.data.token;

    // 2. Register and login as vendor
    const vendorReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Vendor',
        last_name: 'User',
        email: `vendor.user.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'vendor',
      });
    vendorToken = vendorReg.body.data.token;
  });

  it('should allow admin/procurement_officer to create a vendor', async () => {
    const res = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send(testVendorData);

    expect(res.status).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.data.name).toBe(testVendorData.name);
    expect(res.body.data.status).toBe('pending');
    createdVendorId = res.body.data.id;
  });

  it('should refuse vendor creation without token', async () => {
    const res = await request(app)
      .post('/api/vendors')
      .send(testVendorData);

    expect(res.status).toBe(401);
  });

  it('should deny vendor role from creating a vendor', async () => {
    const res = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${vendorToken}`)
      .send(testVendorData);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it('should validate inputs during vendor creation', async () => {
    const res = await request(app)
      .post('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        ...testVendorData,
        gst_number: '', // empty
        contact_email: 'invalidemail',
      });

    expect(res.status).toBe(400);
    expect(res.body.errors).toBeDefined();
  });

  it('should retrieve list of vendors', async () => {
    const res = await request(app)
      .get('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.statusCounts).toBeDefined();
  });

  it('should retrieve vendors with filters', async () => {
    const res = await request(app)
      .get('/api/vendors')
      .set('Authorization', `Bearer ${adminToken}`)
      .query({
        status: 'pending',
        category: 'IT Services',
        search: testVendorData.name,
      });

    expect(res.status).toBe(200);
    expect(res.body.data.length).toBeGreaterThan(0);
    expect(res.body.data[0].id).toBe(createdVendorId);
  });

  it('should retrieve a vendor by id', async () => {
    const res = await request(app)
      .get(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.id).toBe(createdVendorId);
  });

  it('should return 404 for a non-existent vendor id', async () => {
    const fakeUuid = '00000000-0000-0000-0000-000000000000';
    const res = await request(app)
      .get(`/api/vendors/${fakeUuid}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });

  it('should allow admin/procurement_officer to update a vendor', async () => {
    const updatedName = `Updated Vendor ${uniqueId}`;
    const res = await request(app)
      .put(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        name: updatedName,
        status: 'active',
      });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe(updatedName);
    expect(res.body.data.status).toBe('active');
  });

  it('should deny vendor role from updating a vendor', async () => {
    const res = await request(app)
      .put(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${vendorToken}`)
      .send({
        name: 'Another Name',
      });

    expect(res.status).toBe(403);
  });

  it('should deny non-admin roles from blocking (deleting) a vendor', async () => {
    const res = await request(app)
      .delete(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${vendorToken}`);

    expect(res.status).toBe(403);
  });

  it('should allow admin to block (delete) a vendor', async () => {
    const res = await request(app)
      .delete(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);

    // Verify vendor is now blocked
    const checkRes = await request(app)
      .get(`/api/vendors/${createdVendorId}`)
      .set('Authorization', `Bearer ${adminToken}`);
    expect(checkRes.body.data.status).toBe('blocked');
  });
});
