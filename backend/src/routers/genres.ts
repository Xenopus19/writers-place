import { Router } from 'express';
import { Genre } from '../models/index.js';

const genresRouter = Router();

genresRouter.get('/', async (_req, res) => {
  try {
    const genres = await Genre.findAll({ order: [['name', 'ASC']] });
    res.json(genres);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default genresRouter;
