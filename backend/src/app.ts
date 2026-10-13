import cors from 'cors';
import express from 'express';
import usersRouter from './routers/users.js';

export const app = express();

app.use(cors());
app.use(express.json());

app.use('/api/users', usersRouter);

