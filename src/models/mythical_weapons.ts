// @ts-ignore
import { title } from 'process';
import Client from '../database'
import type { Article } from './article';

export type weapon = {
  id?: string;
  name: string;
  type: string;
  weight: number;
  created_at?: Date; 
}

export class WeaponStore {
  async index(): Promise<weapon[]> {
    try {
      // @ts-ignore
      const conn = await Client.connect()
      const sql = 'SELECT * FROM mythical_weapons'
  
      const result = await conn.query(sql)
  
      conn.release()
  
      return result.rows 
    } catch (err) {
      throw new Error(`Could not get articles. Error: ${err}`)
    }
  }

  async show(id: string): Promise<weapon> {
    try {
        const sql = 'SELECT * FROM mythical_weapons WHERE id=($1)'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        conn.release()

        return result.rows[0]
    } catch (err) {
        throw new Error(`Could not get weapon ${id}. Error: ${err}`)
    }
  }

  async create(weapon: weapon): Promise<weapon> {
    try {
        const sql = 'INSERT INTO mythical_weapons (name, type, weight) VALUES($1, $2, $3) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [weapon.name, weapon.type, weapon.weight])

        const newWeapon = result.rows[0]

        conn.release()

        return newWeapon;
    } catch (err) {
        throw new Error(`Could not add weapon ${weapon.name}. Error: ${err}`)
    }
  }

  async delete(id: string): Promise<weapon> {
    try {
      const sql = 'DELETE FROM mythical_weapons WHERE id=($1) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        const weapon = result.rows[0]

        conn.release()

        return weapon;  
    } catch (err) {
        throw new Error(`Could not delete article ${title}. Error: ${err}`)
    }
  }
}
