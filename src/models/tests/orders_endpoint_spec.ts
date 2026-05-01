import request from 'supertest';
import app from '../../server';
import client from '../../database';
import jsonwebtoken from 'jsonwebtoken';

const createUser = async (username: string, password: string): Promise<string> => {
  const createUserResponse = await request(app)
    .post('/users')
    .send({ username, password });

  const token = createUserResponse.body as string;
  const decoded = jsonwebtoken.decode(token) as {
    user: { id: string };
  };

  return decoded.user.id;
};

describe('Orders Endpoint Tests', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE order_products, orders, products, users RESTART IDENTITY CASCADE');
    conn.release();
  });

  it('POST /orders should create an order', async () => {
    const userId = await createUser(`order_user_${Date.now()}`, 'password123');

    const response = await request(app)
      .post('/orders')
      .send({ user_id: Number(userId), status: 'active' });

    expect(response.status).toBe(200);
    expect(Number(response.body.id)).toBeGreaterThan(0);
    expect(Number(response.body.user_id)).toBe(Number(userId));
    expect(response.body.status).toBe('active');
  });

  it('GET /orders should return orders list', async () => {
    const userId = await createUser(`order_list_user_${Date.now()}`, 'password123');

    await request(app)
      .post('/orders')
      .send({ user_id: Number(userId), status: 'active' });

    const response = await request(app).get('/orders');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTrue();
    expect(response.body.length).toBe(1);
    expect(Number(response.body[0].user_id)).toBe(Number(userId));
  });

  it('GET /orders/:id should return a specific order', async () => {
    const userId = await createUser(`order_show_user_${Date.now()}`, 'password123');

    const createOrderResponse = await request(app)
      .post('/orders')
      .send({ user_id: Number(userId), status: 'active' });

    const orderId: string = String(createOrderResponse.body.id);
    const response = await request(app).get(`/orders/${orderId}`);

    expect(response.status).toBe(200);
    expect(String(response.body.id)).toBe(orderId);
    expect(Number(response.body.user_id)).toBe(Number(userId));
  });

  it('POST /orders/:id/products should add a product to an order', async () => {
    const userId = await createUser(`order_add_user_${Date.now()}`, 'password123');

    const createOrderResponse = await request(app)
      .post('/orders')
      .send({ user_id: Number(userId), status: 'active' });

    const createProductResponse = await request(app)
      .post('/products')
      .send({ name: 'Order Product', price: '55.00' });

    const orderId: string = String(createOrderResponse.body.id);
    const productId: string = String(createProductResponse.body.id);

    const response = await request(app)
      .post(`/orders/${orderId}/products`)
      .send({ product_id: Number(productId), quantity: 3 });

    expect(response.status).toBe(200);
    expect(Number(response.body.order_id)).toBe(Number(orderId));
    expect(Number(response.body.product_id)).toBe(Number(productId));
    expect(Number(response.body.quantity)).toBe(3);
  });

  it('DELETE /orders/:id should delete an order', async () => {
    const userId = await createUser(`order_delete_user_${Date.now()}`, 'password123');

    const createOrderResponse = await request(app)
      .post('/orders')
      .send({ user_id: Number(userId), status: 'active' });

    const orderId: string = String(createOrderResponse.body.id);
    const response = await request(app).delete(`/orders/${orderId}`);

    expect(response.status).toBe(200);
    expect(String(response.body.id)).toBe(orderId);

    const indexResponse = await request(app).get('/orders');
    expect(indexResponse.status).toBe(200);
    expect(indexResponse.body.length).toBe(0);
  });
});
