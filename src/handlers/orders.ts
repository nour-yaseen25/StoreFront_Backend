import express, { Request, Response } from 'express';
import { order, OrderStore } from '../models/order';

const store = new OrderStore();

const index = async (_req: Request, res: Response) => {
  try {
    const orders = await store.index();
    res.json(orders);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const order = await store.show( req.params.id as unknown as number);
    res.json(order);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const order: order = {
      user_id: req.body.user_id as unknown as number,
      status: req.body.status
    };

    const newOrder = await store.create(order);
    res.json(newOrder);
  } catch (err) {
    console.log("CREATE ORDER ERROR:", err);
    res.status(400);
    res.json(err);
  }
};

const destroy = async (req: Request, res: Response) => {
  try {
    const deletedOrder = await store.delete(req.params.id as unknown as number);
    res.json(deletedOrder);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};
const addproduct = async (req: Request, res: Response) => {
    try {
        const orderId: number = req.params.id as unknown as number;
        const productId: number = req.body.product_id as unknown as number;
        const quantity: number = parseInt(req.body.quantity);
        const addedProduct = await store.addProduct(quantity, orderId, productId);
        res.json(addedProduct);
    }
    catch (err) {
        res.status(400);
        res.json(err);
    }
};

const order_routes = (app: express.Application) => {
  app.get('/orders', index);
  app.get('/orders/:id', show);
  app.post('/orders', create);
  app.delete('/orders/:id', destroy);
  app.post('/orders/:id/products', addproduct);
};

export default order_routes; 