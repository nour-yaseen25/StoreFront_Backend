// @ts-ignore
import { title } from 'process';
import Client from '../database'

export type order = {
  id?: string;
  user_id: string;
  status: string;
  created_at?: Date; 
}

export class OrderStore {
  async index(): Promise<order[]> {
    try {
      // @ts-ignore
      const conn = await Client.connect()
      const sql = 'SELECT * FROM orders'
  
      const result = await conn.query(sql)
  
      conn.release()
  
      return result.rows 
    } catch (err) {
      throw new Error(`Could not get orders. Error: ${err}`)
    }
  }

  async show(id: string): Promise<order> {
    try {
        const sql = 'SELECT * FROM orders WHERE id=($1)'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        conn.release()

        return result.rows[0]
    } catch (err) {
        throw new Error(`Could not get order ${id}. Error: ${err}`)
    }
  }

  async create(order: order): Promise<order> {
    try {
        const sql = 'INSERT INTO orders (user_id, status) VALUES($1, $2) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [order.user_id, order.status])

        const newOrder = result.rows[0]

        conn.release()

        return newOrder;
    } catch (err) {
        throw new Error(`Could not add order ${order.id}. Error: ${err}`)
    }
  }

  async delete(id: string): Promise<order> {
    try {
      const sql = 'DELETE FROM orders WHERE id=($1) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        const order = result.rows[0]

        conn.release()

        return order;  
    } catch (err) {
        throw new Error(`Could not delete order ${id}. Error: ${err}`)
    }
  }
  
  async addProduct(quantity: number, orderId: string, productId: string): Promise<{ id: string; quantity: number; order_id: string; product_id: string }> {
    try {
      const sql = 'INSERT INTO order_products (quantity, order_id, product_id) VALUES($1, $2, $3) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()
        const result = await conn.query(sql, [quantity, orderId, productId])
        const orderProduct = result.rows[0]
        conn.release()
        return orderProduct;
    } catch (err) {
        throw new Error(`Could not add product ${productId} to order ${orderId}. Error: ${err}`)
    }

  }
}

