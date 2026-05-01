import request from 'supertest';
import app from '../../server';
import client from '../../database';

describe('Products Endpoint Tests', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE order_products, orders, products, users RESTART IDENTITY CASCADE');
    conn.release();
  });

  it('POST /products should create a product', async () => {
    const response = await request(app)
      .post('/products')
      .send({ name: 'Laptop', price: '1250.50' });

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('Laptop');
    expect(Number(response.body.price)).toBeCloseTo(1250.5, 2);
    expect(Number(response.body.id)).toBeGreaterThan(0);
  });

  it('GET /products should return product list', async () => {
    await request(app).post('/products').send({ name: 'Keyboard', price: '99.99' });

    const response = await request(app).get('/products');

    expect(response.status).toBe(200);
    expect(Array.isArray(response.body)).toBeTrue();
    expect(response.body.length).toBe(1);
    expect(response.body[0].name).toBe('Keyboard');
  });

  it('GET /products/:id should return a specific product', async () => {
    const createResponse = await request(app)
      .post('/products')
      .send({ name: 'Mouse', price: '39.99' });

    const productId: string = String(createResponse.body.id);
    const response = await request(app).get(`/products/${productId}`);

    expect(response.status).toBe(200);
    expect(String(response.body.id)).toBe(productId);
    expect(response.body.name).toBe('Mouse');
    expect(Number(response.body.price)).toBeCloseTo(39.99, 2);
  });

  it('DELETE /products/:id should delete a product', async () => {
    const createResponse = await request(app)
      .post('/products')
      .send({ name: 'Monitor', price: '400.00' });

    const productId: string = String(createResponse.body.id);
    const deleteResponse = await request(app).delete(`/products/${productId}`);

    expect(deleteResponse.status).toBe(200);
    expect(String(deleteResponse.body.id)).toBe(productId);

    const indexResponse = await request(app).get('/products');
    expect(indexResponse.status).toBe(200);
    expect(indexResponse.body.length).toBe(0);
  });
});
