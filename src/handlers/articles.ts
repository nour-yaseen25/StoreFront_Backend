import express, { Request, Response } from 'express';
import { Article, ArticleStore } from '../models/article';

const store = new ArticleStore();

const index = async (_req: Request, res: Response) => {
  try {
    const articles = await store.index();
    res.json(articles);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const article = await store.show( req.params.id as string);
    res.json(article);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const article: Article = {
      title: req.body.title,
      content: req.body.content
    };

    const newArticle = await store.create(article);
    res.json(newArticle);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const destroy = async (req: Request, res: Response) => {
  try {
    const deletedArticle = await store.delete(req.params.id as string);
    res.json(deletedArticle);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const article_routes = (app: express.Application) => {
  app.get('/articles', index);
  app.get('/articles/:id', show);
  app.post('/articles', create);
  app.delete('/articles/:id', destroy);
};

export default article_routes;