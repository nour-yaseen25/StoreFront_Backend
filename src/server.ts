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

const app: express.Application = express()
const address: string = "0.0.0.0:3000"
const port = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/', (_req, res) => {
  res.send('Server is running');
});

article_routes(app);

app.listen(port, () => {
  console.log(`Server started at http://localhost:${port}`);
});
