//This file is responsible for connecting to the database and exporting the connection object for use in other parts of the application.
import { Pool } from "pg";
// Load environment variables from .env file
//pool is a connection pool that allows us to manage multiple connections to the database efficiently.
//We create a new Pool instance with the database connection parameters loaded from the environment variables. 
//Finally, we export the pool object so that it can be used in other parts of the application to execute queries against the database.
import dotenv from "dotenv";
//dotenv.config() loads the environment variables from the .env file into process.env, making them accessible throughout the application.
dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD
});

export default pool;
