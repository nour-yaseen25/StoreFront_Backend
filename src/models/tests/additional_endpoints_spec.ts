import request from 'supertest';
import jsonwebtoken from 'jsonwebtoken';
import app from '../../server';
import client from '../../database';

const createUserToken = async (username: string, password: string): Promise<string> => {
  const response = await request(app)
    .post('/users')
    .send({ username, password });

  return response.body as string;
};

const createUserId = async (username: string, password: string): Promise<string> => {
  const token = await createUserToken(username, password);
  const decoded = jsonwebtoken.decode(token) as { user: { id: string } };
  return decoded.user.id;
};

describe('Additional Endpoint Tests', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE order_products, orders, products, users, articles, mythical_weapons RESTART IDENTITY CASCADE');
    conn.release();
  });

  describe('Articles endpoints', () => {
    it('POST /articles should create an article', async () => {
      const response = await request(app)
        .post('/articles')
        .send({ title: 'Article Title', content: 'Article content' });

      expect(response.status).toBe(200);
      expect(response.body.title).toBe('Article Title');
      expect(response.body.content).toBe('Article content');
      expect(Number(response.body.id)).toBeGreaterThan(0);
    });

    it('GET /articles should return articles', async () => {
      await request(app)
        .post('/articles')
        .send({ title: 'List Article', content: 'List content' });

      const response = await request(app).get('/articles');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
      expect(response.body.length).toBe(1);
      expect(response.body[0].title).toBe('List Article');
    });

    it('GET /articles/:id should return a specific article', async () => {
      const createResponse = await request(app)
        .post('/articles')
        .send({ title: 'Show Article', content: 'Show content' });

      const articleId = String(createResponse.body.id);
      const response = await request(app).get(`/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(String(response.body.id)).toBe(articleId);
      expect(response.body.title).toBe('Show Article');
    });

    it('DELETE /articles/:id should delete an article', async () => {
      const createResponse = await request(app)
        .post('/articles')
        .send({ title: 'Delete Article', content: 'Delete content' });

      const articleId = String(createResponse.body.id);
      const response = await request(app).delete(`/articles/${articleId}`);

      expect(response.status).toBe(200);
      expect(String(response.body.id)).toBe(articleId);
    });
  });

  describe('Weapons endpoints', () => {
    it('POST /weapons should create a weapon with a valid token', async () => {
      const token = await createUserToken(`weapon_user_${Date.now()}`, 'password123');

      const response = await request(app)
        .post('/weapons')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Excalibur', type: 'sword', weight: 10 });

      expect(response.status).toBe(200);
      expect(response.body.name).toBe('Excalibur');
      expect(response.body.type).toBe('sword');
      expect(Number(response.body.weight)).toBe(10);
    });

    it('GET /weapons should return weapons', async () => {
      await request(app)
        .post('/weapons')
        .set('Authorization', `Bearer ${await createUserToken(`weapon_list_user_${Date.now()}`, 'password123')}`)
        .send({ name: 'Mjolnir', type: 'hammer', weight: 15 });

      const response = await request(app).get('/weapons');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Mjolnir');
    });

    it('GET /weapons/:id should return a specific weapon', async () => {
      const token = await createUserToken(`weapon_show_user_${Date.now()}`, 'password123');
      const createResponse = await request(app)
        .post('/weapons')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Aegis', type: 'shield', weight: 12 });

      const weaponId = String(createResponse.body.id);
      const response = await request(app).get(`/weapons/${weaponId}`);

      expect(response.status).toBe(200);
      expect(String(response.body.id)).toBe(weaponId);
      expect(response.body.name).toBe('Aegis');
    });

    it('DELETE /weapons/:id should delete a weapon with a valid token', async () => {
      const token = await createUserToken(`weapon_delete_user_${Date.now()}`, 'password123');
      const createResponse = await request(app)
        .post('/weapons')
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'Gungnir', type: 'spear', weight: 9 });

      const weaponId = String(createResponse.body.id);
      const response = await request(app)
        .delete(`/weapons/${weaponId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(response.status).toBe(200);
      expect(String(response.body.id)).toBe(weaponId);
    });
  });

  describe('Dashboard endpoints', () => {
    it('GET /products_in_orders should return joined order products', async () => {
      const userId = await createUserId(`dashboard_user_${Date.now()}`, 'password123');

      const productResponse = await request(app)
        .post('/products')
        .send({ name: 'Dashboard Product', price: '25.00' });

      const orderResponse = await request(app)
        .post('/orders')
        .send({ user_id: Number(userId), status: 'active' });

      await request(app)
        .post(`/orders/${orderResponse.body.id}/products`)
        .send({ product_id: Number(productResponse.body.id), quantity: 2 });

      const response = await request(app).get('/products_in_orders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Dashboard Product');
      expect(Number(response.body[0].order_id)).toBe(Number(orderResponse.body.id));
    });

    it('GET /five_most_expensive should return the five most expensive products', async () => {
      const products = [
        { name: 'Cheap', price: '1.00' },
        { name: 'Mid', price: '5.00' },
        { name: 'High', price: '10.00' },
        { name: 'Higher', price: '15.00' },
        { name: 'Premium', price: '20.00' },
        { name: 'Luxury', price: '25.00' }
      ];

      for (const product of products) {
        await request(app).post('/products').send(product);
      }

      const response = await request(app).get('/five_most_expensive');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
      expect(response.body.length).toBe(5);
      expect(response.body[0].name).toBe('Luxury');
      expect(response.body[4].name).toBe('Mid');
    });

    it('GET /users_with_orders should return users that have orders', async () => {
      const userId = await createUserId(`orders_user_${Date.now()}`, 'password123');

      await request(app)
        .post('/orders')
        .send({ user_id: Number(userId), status: 'active' });

      const response = await request(app).get('/users_with_orders');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBeTrue();
      expect(response.body.length).toBe(1);
      expect(response.body[0].username).toContain('orders_user_');
    });
  });
});
