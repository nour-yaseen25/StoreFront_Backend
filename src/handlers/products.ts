import express, { Request, Response } from 'express';
import { ProductStore, product } from '../models/product';

const store = new ProductStore(); 

const index = async (_req: Request, res: Response) => {
  try {
    const products = await store.index();
    res.json(products);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const product = await store.show( req.params.id as string);
    res.json(product);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const product: product = {
      name: req.body.name,
      price: req.body.price
    };


    const newProduct = await store.create(product);
    res.json(newProduct);
  } catch (err) {
    console.log("CREATE PRODUCT ERROR:", err);
    res.status(400);
    res.json(err);
  }
};

const destroy = async (req: Request, res: Response) => {
  try {
    const deletedProduct = await store.delete(req.params.id as string);
    res.json(deletedProduct);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const product_routes = (app: express.Application) => {
  app.get('/products', index);
  app.get('/products/:id', show);
  app.post('/products', create);
  app.delete('/products/:id', destroy);
};

export default product_routes; 