import * as dotenv from "dotenv";
dotenv.config();

export const PORT = process.env.PORT || 3001;

export const DATABASE_URL: string = process.env.DATABASE_URL || '';

export const JWT_SECRET: string = process.env.JWT_SECRET || 'jwt_secret';

export const CLOUDFLARE_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || '';

export const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID || '';

export const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY || '';