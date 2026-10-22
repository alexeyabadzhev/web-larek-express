import jwt from 'jsonwebtoken';
import { faker } from '@faker-js/faker';
import { AUTH_ACCESS_TOKEN_EXPIRY, AUTH_REFRESH_TOKEN_EXPIRY, JWT_SECRET } from '../config';

interface IPayload {
  _id: string;
}

const jwtSecret = JWT_SECRET as string || 'mys1kr3tw0rd';

export const generateAccessToken = (payload: IPayload) => {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: AUTH_ACCESS_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
  return token;
};

export const generateRefreshToken = (payload: IPayload) => {
  const token = jwt.sign(payload, jwtSecret, { expiresIn: AUTH_REFRESH_TOKEN_EXPIRY as jwt.SignOptions['expiresIn'] });
  return token;
};

export const verifyToken = (token: string) => {
  const matched = jwt.verify(token, jwtSecret) as IPayload;
  return matched;
};

export const fileTempName = (originalName: string) => {
  const fileExtention = originalName.slice(originalName.lastIndexOf('.'));
  return `${faker.string.uuid()}${fileExtention}`;
};
