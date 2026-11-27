import bcrypt from 'bcryptjs';
import { Router } from 'express';
import { User } from '../models/index.js';
import { createUserSchema } from '../schemas/createUserSchema.js';
import { requireAuth } from '../util/auth.js';
import { AppError } from '../util/appError.js';

const usersRouter = Router();

usersRouter.get('/me', requireAuth, async (req, res, next) => {
  try {
    const { id } = req.tokenUser;
    const user = await User.findByPk(id);
    if (!user) {
      next(AppError.notFound('User not found'));
      return;
    }
    res.json(user);
  } catch (error) {
    next(error);
  }
});

usersRouter.post('/', async (req, res, next) => {
  const parsed = createUserSchema.safeParse(req.body);
  if (!parsed.success) {
    next(parsed.error);
    return;
  }

  const { password, ...noPasswordUser } = parsed.data;

  try {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ ...noPasswordUser, passwordHash });
    const { passwordHash: _omit, ...data } = user.toJSON();
    res.status(201).json({ data });
  } catch (error) {
    next(error);
  }
});

export default usersRouter;