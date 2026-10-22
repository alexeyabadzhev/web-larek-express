import { Router } from 'express';
import { celebrate, Joi, Segments } from 'celebrate';
import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from '../controllers/product';
import Auth from '../middlewares/auth';

const router = Router();

const productSchema = Joi.object({
  title: Joi.string().min(2).max(30).required(),
  category: Joi.string().required(),
  description: Joi.string().optional(),
  price: Joi.number().allow(null).optional(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).required(),
});

const productUpdateSchema = Joi.object({
  title: Joi.string().min(2).max(30).optional(),
  category: Joi.string().optional(),
  description: Joi.string().optional(),
  price: Joi.number().allow(null).optional(),
  image: Joi.object({
    fileName: Joi.string().required(),
    originalName: Joi.string().required(),
  }).optional(),
});

router.get('/product', getProducts);
router.post('/product', Auth, celebrate({ [Segments.BODY]: productSchema }), createProduct);
router.patch('/product/:productId', Auth, celebrate({
  [Segments.PARAMS]: { productId: Joi.string().hex().length(24).required() },
  [Segments.BODY]: productUpdateSchema,
}), updateProduct);

router.delete('/product/:productId', Auth, celebrate({
  [Segments.PARAMS]: { productId: Joi.string().hex().length(24).required() },
}), deleteProduct);

export default router;
