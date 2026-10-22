import cors from 'cors';
import express from 'express';
import usersRouter from './routers/users.js';
import loginRouter from './routers/login.js';
import imagesRouter from './routers/images.js';
import articlesRouter from './routers/articles.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);
app.use('/api/login', loginRouter);
app.use('/api/images', imagesRouter);
app.use('/api/articles', articlesRouter);

