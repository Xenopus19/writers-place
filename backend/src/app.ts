import cors from 'cors';
import express from 'express';
import usersRouter from './routers/users.js';
import loginRouter from './routers/login.js';

import imagesRouter from './routers/images.js';
import articlesRouter from './routers/articles.js';
import genresRouter from './routers/genres.js';
import likesRouter from './routers/likes.js';
import commentsRouter from './routers/comments.js';
import { errorHandler } from './util/errorHandler.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/images', imagesRouter);
app.use('/api/articles/:articleId/likes', likesRouter);
app.use('/api/articles/:articleId/comments', commentsRouter);
app.use('/api/articles', articlesRouter);
app.use('/api/genres', genresRouter);
app.use('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(errorHandler);