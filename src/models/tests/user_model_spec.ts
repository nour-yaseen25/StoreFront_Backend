import client from '../../database';
import { UserStore } from '../user';

const store = new UserStore();

describe('User Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE order_products, orders, users RESTART IDENTITY CASCADE');
    conn.release();
  });

  it('should have an index method', () => {
    expect(store.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(store.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(store.create).toBeDefined();
  });

  it('should have a delete method', () => {
    expect(store.delete).toBeDefined();
  });

  it('should have an authenticate method', () => {
    expect(store.authenticate).toBeDefined();
  });

  it('create method should add a user', async () => {
    const created = await store.create({ username: 'model_user', password: 'password123' });

    expect(Number(created.id)).toBeGreaterThan(0);
    expect(created.username).toBe('model_user');
    expect(created.password).not.toBe('password123');
  });

  it('index method should return users', async () => {
    await store.create({ username: 'index_user', password: 'password123' });

    const users = await store.index();

    expect(users.length).toBe(1);
    expect(users[0]?.username).toBe('index_user');
  });

  it('show method should return a specific user', async () => {
    const created = await store.create({ username: 'show_user', password: 'password123' });

    const found = await store.show(String(created.id));

    expect(String(found.id)).toBe(String(created.id));
    expect(found.username).toBe('show_user');
  });

  it('authenticate method should return user for valid credentials', async () => {
    await store.create({ username: 'auth_user', password: 'password123' });

    const authenticated = await store.authenticate('auth_user', 'password123');

    expect(authenticated).not.toBeNull();
    expect(authenticated?.username).toBe('auth_user');
  });

  it('authenticate method should return null for invalid credentials', async () => {
    await store.create({ username: 'auth_invalid_user', password: 'password123' });

    const authenticated = await store.authenticate('auth_invalid_user', 'wrong-password');

    expect(authenticated).toBeNull();
  });

  it('delete method should remove a user', async () => {
    const created = await store.create({ username: 'delete_user', password: 'password123' });

    const deleted = await store.delete(String(created.id));
    const users = await store.index();

    expect(String(deleted.id)).toBe(String(created.id));
    expect(users.length).toBe(0);
  });
});
