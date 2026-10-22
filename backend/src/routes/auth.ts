import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import {
  login,
  register,
  logout,
  refreshAccessToken,
  getUser,
} from '../controllers/auth';
import Auth from '../middlewares/auth';

const router = Router();

router.post('/auth/login', celebrate({
  [Segments.BODY]: {
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  },
}), login);

router.post('/auth/register', celebrate({
  [Segments.BODY]: {
    name: Joi.string().min(2).max(30),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required(),
  },
}), register);

router.get('/auth/token', refreshAccessToken);
router.get('/auth/logout', Auth, logout);
router.get('/auth/user', Auth, getUser);

export default router;
