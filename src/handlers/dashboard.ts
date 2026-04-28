import express, { Request, Response } from 'express';
import { DashboardQueries } from '../services/dashboard';

const dashboard = new DashboardQueries();

const productsInOrders = async (_req: Request, res: Response) => {
  const data = await dashboard.productsInOrders();
  res.json(data);
};

const fiveMostExpensive = async (_req: Request, res: Response) => {
  const users = await dashboard.fiveMostExpensive()
  res.json(users)
}

const usersWithOrders = async (_req: Request, res: Response) => {
  const users = await dashboard.usersWithOrders()
  res.json(users)
}


const dashboardRoutes = (app: express.Application) => {
  app.get('/products_in_orders', productsInOrders);
  app.get('/five_most_expensive', fiveMostExpensive);
  app.get('/users_with_orders', usersWithOrders);
};


export default dashboardRoutes;
