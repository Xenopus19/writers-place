import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { UniqueConstraintError } from 'sequelize';
import { User } from '../models/index.js';
import { createUserSchema } from '../schemas/createUserSchema.js';

const usersRouter = Router();

usersRouter.post('/', async (req, res) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.issues });
    return;
  }

  const { password, ...noPasswordUser } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...noPasswordUser, passwordHash });
    const { passwordHash: _omit, ...data } = user.toJSON();
    res.status(201).json({ data });
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      res.status(409).json({ error: 'Username already taken' });
      return;
    }
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default usersRouter;