import { Router } from "express";
import { LoginSchema } from "../schemas/loginSchema.js";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../util/config.js";
import { AppError } from "../util/appError.js";


export interface TokenUser {
  id: string;
  username: string;
}

const loginRouter = Router();

loginRouter.post("/", async (req, res, next) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);
    const loginResult = await login(username, password);
    res.json(loginResult);
  } catch (error) {
    next(error);
  }
});

const login = async (username: string, password: string) => {
  const user = await User.scope("withPassword").findOne({ where: { username } });

  if (!user) {
    throw new AppError(400, "INVALID_CREDENTIALS", "Login error: User not found");
  }

  const isPasswordCorrect = await bcrypt.compare(
    password,
    user.passwordHash,
  );
  if (!isPasswordCorrect) {
    throw new AppError(400, "INVALID_CREDENTIALS", "Login error: Invalid credentials.");
  }

  const tokenUser: TokenUser = {
    id: user.id,
    username: user.username,
  };

  const token = jwt.sign(tokenUser, JWT_SECRET);
  return { token, user: tokenUser };
};

export default loginRouter;