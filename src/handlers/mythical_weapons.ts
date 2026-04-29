import express, { Request, Response } from 'express';
import { weapon, WeaponStore } from '../models/mythical_weapons';
import type { Article } from '../models/article';
import { verify } from './../../node_modules/@types/jsonwebtoken/index.d';
import jwt from 'jsonwebtoken';

import { NextFunction } from "express";

const store = new WeaponStore();

const verifyAuthToken = (req: Request, res: Response, next: NextFunction) => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      return res.status(401).json({ error: "No token provided" });
    }

    const token = authorizationHeader.split(" ")[1];
    const secret = process.env.TOKEN_SECRET as string;

    jwt.verify(token as string, secret);

    next();
  } catch (error) {
    console.log("JWT ERROR:", error);
    return res.status(401).json({ error: "Access denied, invalid token" });
  }
};

const index = async (_req: Request, res: Response) => {
  try {
    const weapons = await store.index(); 
    res.json(weapons);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const show = async (req: Request, res: Response) => {
  try {
    const weapon = await store.show( req.params.id as string);
    res.json(weapon);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const create = async (req: Request, res: Response) => {
  try {
    const weapon: weapon = {
      name: req.body.name,
      type: req.body.type,
      weight: req.body.weight
    };
    /*
try{
    jwt.verify(req.body.token, process.env.TOKEN_SECRET as string);
}
catch(err){
    res.status(401);
    res.json("Access denied, invalid token");
    return;
}
    
         try {
        const authorizationHeader = req.headers.authorization
        const token = authorizationHeader?.split(' ')[1]
        jwt.verify(token as string, process.env.TOKEN_SECRET as string)
    } catch(err) {
        res.status(401)
        res.json('Access denied, invalid token')
        return
    }
    
    
    */
    const newWeapon = await store.create(weapon);
    res.json(newWeapon);
  } catch (err) {
    console.log("CREATE WEAPON ERROR:", err);
    res.status(400);
    res.json(err);
  }
};

const destroy = async (req: Request, res: Response) => {
  try {
    const deletedWeapon = await store.delete(req.params.id as string);
    res.json(deletedWeapon);
  } catch (err) {
    res.status(400);
    res.json(err);
  }
};

const weapon_routes = (app: express.Application) => {
  app.get('/weapons', index);
  app.get('/weapons/:id', show);
  app.post('/weapons', verifyAuthToken, create);
  app.delete('/weapons/:id',verifyAuthToken, destroy);
};

export default weapon_routes; 
