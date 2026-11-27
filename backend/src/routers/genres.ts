import { Router } from 'express';
import { Genre } from '../models/index.js';

const genresRouter = Router();

genresRouter.get('/', async (_req, res, next) => {
  try {
    const genres = await Genre.findAll({ order: [['name', 'ASC']] });
    res.json(genres);
  } catch (error) {
    next(error);
  }
});

export default genresRouter;
