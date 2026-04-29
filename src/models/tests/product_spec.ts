import client from '../../database';
import { product as ProductType, ProductStore } from '../product';

const store = new ProductStore();

describe('Product Model', () => {
  beforeEach(async () => {
    const conn = await client.connect();
    await conn.query('TRUNCATE TABLE products RESTART IDENTITY CASCADE');
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

  it('create method should add a product', async () => {
    const result = await store.create({ name: 'Test Product', price: '100' } as ProductType);
    expect(Number(result.id)).toBeGreaterThan(0);
    expect(result.name).toEqual('Test Product');
    expect(Number(result.price)).toEqual(100);
  });

  it('index method should return a list of products', async () => {
    await store.create({ name: 'Test Product', price: '100' } as ProductType);
    const result = await store.index();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]?.name).toEqual('Test Product');
    expect(Number(result[0]?.price)).toEqual(100);
  });

  it('show method should return the correct product', async () => {
    const created = await store.create({ name: 'Test Product', price: '100' } as ProductType);
    const result = await store.show(created.id as string);
    expect(Number(result.id)).toEqual(Number(created.id));
    expect(result.name).toEqual('Test Product');
    expect(Number(result.price)).toEqual(100);
  });

  it('delete method should remove the product', async () => {
    const created = await store.create({ name: 'Test Product', price: '100' } as ProductType);
    await store.delete((created.id as string));
    const result = await store.index();
    expect(result).toEqual([]);
  });
});
