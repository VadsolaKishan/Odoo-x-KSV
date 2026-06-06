import request from 'supertest';
import app from '../src/app';

describe('Activity Logs Endpoints', () => {
  const uniqueId = Date.now();
  let token = '';

  beforeAll(async () => {
    const adminReg = await request(app)
      .post('/api/auth/register')
      .send({
        first_name: 'Admin',
        last_name: 'Activity',
        email: `admin.activity.${uniqueId}@example.com`,
        password: 'securepassword123',
        role: 'admin',
      });
    token = adminReg.body.data.token;
  });

  it('should retrieve list of activity logs', async () => {
    const res = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
  });

  it('should support pagination and event type filtering', async () => {
    const res = await request(app)
      .get('/api/activity-logs')
      .set('Authorization', `Bearer ${token}`)
      .query({
        event_type: 'rfq',
        page: 1,
        limit: 5,
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.meta.limit).toBe(5);
  });
});
