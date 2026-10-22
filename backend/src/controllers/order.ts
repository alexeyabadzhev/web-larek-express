import { Request, Response, NextFunction } from 'express';
import { faker } from '@faker-js/faker';
import BadRequestError from '../errors/bad-request-error';
import InternalServerError from '../errors/internal-server-error';
import Product from '../models/product';

export default async (req: Request, res: Response, next: NextFunction) => {
  try {
    const {
      total,
      items,
    } = req.body;

    const ids = [...new Set(items)];
    const products = await Product.find({ _id: { $in: ids } });

    if (products.length !== ids.length) {
      next(new BadRequestError('Некоторые товары не найдены'));
      return;
    }

    const noPrice = products.some((item) => item.price === null);
    if (noPrice) {
      next(new BadRequestError('Товар не продается'));
      return;
    }

    const totalSum = products.reduce((acc, item) => acc + (item.price as number), 0);
    if (totalSum !== total) {
      next(new BadRequestError('Некорректная сумма'));
      return;
    }

    res.status(200).send({ id: faker.string.uuid(), total: totalSum });
  } catch (err) {
    next(new InternalServerError('Internal Server Error'));
  }
};
