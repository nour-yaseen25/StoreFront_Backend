// @ts-ignore
import { title } from 'process';
import Client from '../database'

export type product = {
  id?: string;
  name: string;
  price: string;
  created_at?: Date; 
}

export class ProductStore {
  async index(): Promise<product[]> {
    try {
      // @ts-ignore
      const conn = await Client.connect()
      const sql = 'SELECT * FROM products'
  
      const result = await conn.query(sql)
  
      conn.release()
  
      return result.rows 
    } catch (err) {
      throw new Error(`Could not get products. Error: ${err}`)
    }
  }

  async show(id: string): Promise<product> {
    try {
        const sql = 'SELECT * FROM products WHERE id=($1)'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        conn.release()

        return result.rows[0]
    } catch (err) {
        throw new Error(`Could not get product ${id}. Error: ${err}`)
    }
  }

  async create(product: product): Promise<product> {
    try {
        const sql = 'INSERT INTO products (name, price) VALUES($1, $2) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [product.name, product.price])

        const newProduct = result.rows[0]

        conn.release()

        return newProduct;
    } catch (err) {
        throw new Error(`Could not add product ${product.id}. Error: ${err}`)
    }
  }

  async delete(id: string): Promise<product> {
    try {
      const sql = 'DELETE FROM products WHERE id=($1) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        const product = result.rows[0]

        conn.release()

        return product;  
    } catch (err) {
        throw new Error(`Could not delete product ${id}. Error: ${err}`)
    }
  }
}
