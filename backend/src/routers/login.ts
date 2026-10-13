import { Router } from "express";
import { LoginSchema } from "../schemas/loginSchema.js";
import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "../util/config.js";


export interface TokenUser {
  id: string;
  username: string;
}

const loginRouter = Router();

loginRouter.post("/", async (req, res) => {
  try {
    const { username, password } = LoginSchema.parse(req.body);
    const loginResult = await login(username, password);
    res.json(loginResult);
  } catch (error) {
    if (error instanceof Error && error.message) {
      res.status(400).json({
        message: error.message,
        details: error instanceof Error ? error.message : error,
      });
    } else {
      res.status(400).json({
        message: "Authorization error",
        details: error instanceof Error ? error.message : error,
      });
    }
  }
});

const login = async (username: string, password: string) => {
  try {
    const user = await User.scope("withPassword").findOne({ where: { username } });

    if (!user) {
      throw new Error("User not found");
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.passwordHash,
    );
    if (!isPasswordCorrect) {
      throw new Error("Invalid credentials.");
    }

    const tokenUser: TokenUser = {
      id: user.id,
      username: user.username,
    };

    const token = jwt.sign(tokenUser, JWT_SECRET);
    return { token, user: tokenUser };
  } catch (error) {
    throw new Error("Login error: " + (error instanceof Error ? error.message : String(error)));
  }
};

export default loginRouter;