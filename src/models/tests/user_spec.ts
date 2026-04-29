import client from '../../database';
import { User, UserStore } from '../user';

const store = new UserStore();

describe('User Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE users RESTART IDENTITY CASCADE');
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

  it('create method should add a user', async () => {
    const result = await store.create({ username: 'testuser', password: 'password123' } as User);
    expect(Number(result.id)).toBeGreaterThan(0);
    expect(result.username).toEqual('testuser');
  });

  it('index method should return a list of users', async () => {
    await store.create({ username: 'testuser', password: 'password123' } as User);
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.username).toEqual('testuser');
  });

  it('show method should return the correct user', async () => {
    const created = await store.create({ username: 'testuser', password: 'password123' } as User);
    const result = await store.show(String(created.id));
    expect(Number(result.id)).toEqual(Number(created.id));
    expect(result.username).toEqual('testuser');
  });

  it('delete method should remove the user', async () => {
    const created = await store.create({ username: 'testuser', password: 'password123' } as User);
    await store.delete(String(created.id));
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
