"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
//This file is responsible for connecting to the database and exporting the connection object for use in other parts of the application.
const pg_1 = require("pg");
// Load environment variables from .env file
//pool is a connection pool that allows us to manage multiple connections to the database efficiently.
//We create a new Pool instance with the database connection parameters loaded from the environment variables. 
//Finally, we export the pool object so that it can be used in other parts of the application to execute queries against the database.
const dotenv_1 = __importDefault(require("dotenv"));
//dotenv.config() loads the environment variables from the .env file into process.env, making them accessible throughout the application.
dotenv_1.default.config();
const pool = new pg_1.Pool({
    user: process.env.DB_USER,
    host: process.env.DB_HOST,
    database: process.env.DB_NAME,
    password: process.env.DB_PASSWORD
});
exports.default = pool;
//# sourceMappingURL=database.js.map