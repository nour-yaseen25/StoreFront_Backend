// @ts-ignore
import Client from '../database'
import bcrypt from 'bcrypt'; 
// The problem is that can not find the bcrypt module.
// To fix this, you need to install the bcrypt package and its type definitions.
// You can do this by running the following commands in your terminal:
// npm install bcrypt
// npm install --save-dev @types/bcrypt

export type User = {
  id?: string;
  username: string;
  password: string;
}

export class UserStore {
  async index(): Promise<User[]> {
    try {
      // @ts-ignore
      const conn = await Client.connect() 
      const sql = 'SELECT * FROM users'
  
      const result = await conn.query(sql)
  
      conn.release()
  
      return result.rows 
    } catch (err) {
      throw new Error(`Could not get users. Error: ${err}`)
    }
  }

  async show(id: string): Promise<User> {
    try {
        const sql = 'SELECT * FROM users WHERE id=($1)'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        conn.release()

        return result.rows[0]
    } catch (err) {
        throw new Error(`Could not get user ${id}. Error: ${err}`)
    }
  }

  async create(user: User): Promise<User> {
    try {
        const sql = 'INSERT INTO users (username, password) VALUES($1, $2) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const hashedPassword= bcrypt.hashSync(user.password + process.env.BCRYPT_PEPPER, parseInt(process.env.BCRYPT_ROUNDS as string))
        
        const result = await conn.query(sql, [user.username, hashedPassword]) 

        const newUser = result.rows[0] 

        conn.release()

        return newUser;
    } catch (err) {
        throw new Error(`Could not add user ${user.username}. Error: ${err}`)
    }
  }

  async delete(id: string): Promise<User> {
    try {
      const sql = 'DELETE FROM users WHERE id=($1) RETURNING *'
        // @ts-ignore
        const conn = await Client.connect()

        const result = await conn.query(sql, [id])

        const user = result.rows[0]

        conn.release()

        return user  
    } catch (err) {
        throw new Error(`Could not delete user ${id}. Error: ${err}`)
    }
  }
  async authenticate(username: string, password: string): Promise<User | null> {
    try {
      const sql = 'SELECT * FROM users WHERE username=($1)'
      // @ts-ignore
      const conn = await Client.connect()
      const result = await conn.query(sql, [username])

      if (result.rows.length) {
        const user = result.rows[0]
        if (bcrypt.compareSync(password + process.env.BCRYPT_PEPPER, user.password)) {
          conn.release()
          return user
        }
      }

      conn.release()
      return null

    } catch (err) {
        throw new Error(`Could not authenticate user ${username}. Error: ${err}`)
    }
}

}
