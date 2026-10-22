import { Response, NextFunction } from 'express';
import UnauthorizedError from '../errors/unauthorized-error';
import IRequest from '../types/request';
import { verifyToken } from '../utils/token';

export default (req: IRequest, _res: Response, next: NextFunction) => {
  const { authorization } = req.headers;
  if (!authorization || !authorization.startsWith('Bearer ')) {
    next(new UnauthorizedError('Необходима авторизация'));
    return;
  }
  const token = authorization.replace('Bearer ', '');
  try {
    req.user = verifyToken(token);
    next();
  } catch {
    next(new UnauthorizedError('Необходима авторизация'));
  }
};
