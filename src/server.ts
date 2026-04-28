/*
import express from "express";
// Importing the Express framework to create a web server

const app = express();
// Creating an instance of the Express application
const port = 3000;

app.use(express.json());
// Middleware to parse incoming JSON requests

app.get("/", (_req, res) => {
  res.send("Server is running");
});
// Defining a route for the root URL ("/") that sends a response indicating the server is running

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
// Starting the server and listening on the specified port, logging a message to the console when the server is ready

*/

import express, { Request, Response } from 'express'
import bodyParser from 'body-parser'
import cors from 'cors';
import article_routes from './handlers/articles';
import user_routes from './handlers/users';
import mythical_routes from './handlers/mythical_weapons';
import order_routes from './handlers/orders';
import product_routes from './handlers/products';
import dashboard_routes from './handlers/dashboard';

const app: express.Application = express()
const address: string = "0.0.0.0:3000"
const port = 3000;

app.use(cors());
app.use(express.json());

app.get('/', (_req, res) => {
  res.send('Server is running');
});

article_routes(app);
user_routes(app);
mythical_routes(app);
order_routes(app);
product_routes(app);
dashboard_routes(app);


app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
