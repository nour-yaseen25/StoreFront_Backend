import Client from '../database';

export class DashboardQueries {
  async productsInOrders() {
    const conn = await Client.connect();

    const sql = `
      SELECT name, price, order_id
      FROM products
      INNER JOIN order_products
      ON products.id = order_products.product_id
    `;

    const result = await conn.query(sql);
    conn.release();

    return result.rows;
  }

// Get all users that have made orders
  async usersWithOrders(): Promise<{username: string}[]> {   //returns promise of array of objects with username property 
    try {
      //@ts-ignore
      const conn = await Client.connect()
      const sql = 'SELECT username FROM users INNER JOIN orders ON users.id = orders.user_id'

      const result = await conn.query(sql)

      conn.release()

      return result.rows
    } catch (err) {
      throw new Error(`unable get users with orders: ${err}`)
    } 
  }

    // Get the five most expensive products
  async fiveMostExpensive(): Promise<{name: string, price: number}[]> {
    try {
      //@ts-ignore
      const conn = await Client.connect()
      const sql = 'SELECT name, price FROM products ORDER BY price DESC LIMIT 5'

      const result = await conn.query(sql)

      conn.release()

      return result.rows
    } catch (err) {
      throw new Error(`unable get products by price: ${err}`)
    } 
  }

}

