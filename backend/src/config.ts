import { loadEnvFile } from 'node:process';

loadEnvFile();

export const {
  PORT,
  DB_ADDRESS,
  UPLOAD_PATH,
  UPLOAD_PATH_TEMP,
  AUTH_REFRESH_TOKEN_EXPIRY,
  AUTH_ACCESS_TOKEN_EXPIRY,
  JWT_SECRET,
  ORIGIN_ALLOW,
} = process.env;
