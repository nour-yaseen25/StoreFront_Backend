import express, { Request, Response } from 'express';
import { User, UserStore } from '../models/user';
import type { Article } from '../models/article';
import { json } from 'body-parser';
import jsonwebtoken from 'jsonwebtoken';

const store = new UserStore();

const index = async (_req: Request, res: Response) => {
  try {
    const users = await store.index();
    res.json(users);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const user = await store.show( req.params.id as string);
    res.json(user);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const user: User = {
      username: req.body.username,
      password: req.body.password
    };

    const newUser = await store.create(user);
    const token =jsonwebtoken.sign({ user: newUser }, process.env.TOKEN_SECRET as string);
    res.json(token);
  } catch (err) {
    console.log("CREATE USER ERROR:", err);
    res.status(400);
    res.json(err);
  }
};

const destroy = async (req: Request, res: Response) => {
  try {
    const deletedUser = await store.delete(req.params.id as string);
    res.json(deletedUser);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};
const authenticate = async (req: Request, res: Response) => {
    try {
        const user = await store.authenticate(req.body.username, req.body.password);
        if (user) {
            res.json(user);
        }
        else {
            res.status(401).json({ error: 'Invalid username or password' });
        }
    } catch (err) {
        res.status(400);
        res.json(err);
    }
};

const user_routes = (app: express.Application) => {
  app.get('/users', index);
  app.get('/users/:id', show);
  app.post('/users', create);
  app.delete('/users/:id', destroy);
  app.post('/users/authenticate', authenticate);
};

export default user_routes; 