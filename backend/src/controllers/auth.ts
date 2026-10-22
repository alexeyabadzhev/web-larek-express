import { Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import ms from 'ms';
import User from '../models/user';
import BadRequestError from '../errors/bad-request-error';
import UnauthorizedError from '../errors/unauthorized-error';
import NotFoundError from '../errors/not-found-error';
import ConflictError from '../errors/conflict-error';
import IRequest from '../types/request';
import { AUTH_REFRESH_TOKEN_EXPIRY } from '../config';
import {
  generateAccessToken,
  generateRefreshToken,
  verifyToken,
} from '../utils/token';

const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax' as const,
  secure: false,
  maxAge: ms(AUTH_REFRESH_TOKEN_EXPIRY as ms.StringValue),
  path: '/',
};

const createTokens = async (
  res: Response,
  userId: string,
  user: { email: string, name: string },
) => {
  const payload = { _id: userId };
  const accessToken = generateAccessToken(payload);
  const refreshToken = generateRefreshToken(payload);

  await User.findByIdAndUpdate(userId, { $push: { tokens: { token: refreshToken } } });

  res
    .cookie('refreshToken', refreshToken, cookieOptions)
    .status(200)
    .send({ user: { email: user.email, name: user.name }, success: true, accessToken });
};

export const login = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { email, password } = req.body;
    const user = await User.findUserByCredentials(email, password);
    await createTokens(res, String(user._id), { email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
};

export const register = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { name, email, password } = req.body;
    await User.init();
    const user = await User.create({ name, email, password });
    await createTokens(res, String(user._id), { email: user.email, name: user.name });
  } catch (err) {
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Некорректные данные'));
      return;
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError('Такой пользователь уже существует'));
      return;
    }
    next(err);
  }
};

export const logout = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }
    const { _id } = req.user;
    if (!mongoose.isValidObjectId(_id)) {
      next(new BadRequestError('Некорректный id'));
      return;
    }
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }
    const user = await User.findByIdAndUpdate(
      _id,
      { $pull: { tokens: { token: refreshToken } } },
      { new: true },
    );
    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }
    res
      .clearCookie('refreshToken', { ...cookieOptions, maxAge: 0 })
      .status(200)
      .send({ success: true });
  } catch (err) {
    next(err);
  }
};

export const refreshAccessToken = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }
    let payload: { _id: string };
    try {
      payload = verifyToken(refreshToken);
    } catch {
      next(new UnauthorizedError('Токен недействителен или просрочен'));
      return;
    }
    const user = await User.findById(payload._id).select('+tokens');
    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }
    if (!user.tokens?.some((token) => token.token === refreshToken)) {
      next(new UnauthorizedError('Токен недействителен или просрочен'));
      return;
    }
    await User.findByIdAndUpdate(payload._id, { $pull: { tokens: { token: refreshToken } } });
    await createTokens(res, String(user._id), { email: user.email, name: user.name });
  } catch (err) {
    next(err);
  }
};

export const getUser = async (
  req: IRequest,
  res: Response,
  next: NextFunction,
) => {
  try {
    if (!req.user) {
      next(new UnauthorizedError('Требуется авторизация'));
      return;
    }
    const user = await User.findById(req.user._id);
    if (!user) {
      next(new NotFoundError('Пользователь не найден'));
      return;
    }
    res
      .status(200)
      .send({ user: { email: user.email, name: user.name }, success: true });
  } catch (err) {
    next(err);
  }
};
