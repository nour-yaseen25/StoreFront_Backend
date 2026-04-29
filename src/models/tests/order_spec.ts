import { OrderStore } from '../order';
import { UserStore } from '../user';
import { ProductStore } from '../product';

const orderStore = new OrderStore();
const userStore = new UserStore();
const productStore = new ProductStore();

describe('Order Model', () => {
  let userId: number;
  let productId: number;
  let orderId: number;

  beforeAll(async () => {
    const unique = Date.now();

    const user = await userStore.create({
      username: `testuser_${unique}`,
      password: 'password123'
    });

    userId = Number(user.id);

    const product = await productStore.create({
      name: `Test Product ${unique}`,
      price: '100'
    });

    productId = Number(product.id);

    // create an order up-front so other tests can rely on it
    const ord = await orderStore.create({
      user_id: userId,
      status: 'active'
    });
    orderId = Number(ord.id);
  });

  it('should have an index method', () => {
    expect(orderStore.index).toBeDefined();
  });

  it('should have a show method', () => {
    expect(orderStore.show).toBeDefined();
  });

  it('should have a create method', () => {
    expect(orderStore.create).toBeDefined();
  });

  it('should have a delete method', () => {
    expect(orderStore.delete).toBeDefined();
  });

  it('should have an addProduct method', () => {
    expect(orderStore.addProduct).toBeDefined();
  });

  it('create method should add an order', async () => {
    const result = await orderStore.create({ user_id: userId, status: 'active' });
    // verify created order
    expect(Number(result.user_id)).toEqual(userId);
    expect(result.status).toEqual('active');
  });

  it('index method should return a list of orders', async () => {
    // create an order to ensure index has at least one
    await orderStore.create({ user_id: userId, status: 'active' });
    const result = await orderStore.index();
    expect(result.length).toBeGreaterThan(0);
  });

  it('show method should return the correct order', async () => {
    const created = await orderStore.create({ user_id: userId, status: 'active' });
    const result = await orderStore.show(Number(created.id));
    expect(Number(result.id)).toEqual(Number(created.id));
    expect(Number(result.user_id)).toEqual(userId);
    expect(result.status).toEqual('active');
  });

  it('addProduct method should add a product to an order', async () => {
    // create a fresh order for this test to avoid FK issues from other tests
    const created = await orderStore.create({ user_id: userId, status: 'active' });
    const result = await orderStore.addProduct(2, Number(created.id), productId);
    expect(Number(result.quantity)).toEqual(2);
    expect(Number(result.order_id)).toEqual(Number(created.id));
    expect(Number(result.product_id)).toEqual(productId);
  });

  it('delete method should remove the order', async () => {
    // create an order and then delete it to ensure isolation
    const created = await orderStore.create({ user_id: userId, status: 'active' });
    const result = await orderStore.delete(Number(created.id));
    expect(result.id).toBeDefined();
  });
});
