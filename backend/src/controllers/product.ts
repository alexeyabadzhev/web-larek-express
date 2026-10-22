import { Request, Response, NextFunction } from 'express';
import mongoose from 'mongoose';
import BadRequestError from '../errors/bad-request-error';
import ConflictError from '../errors/conflict-error';
import Product from '../models/product';
import NotFoundError from '../errors/not-found-error';
import { moveFile, removeFile } from '../utils/files';

const isEnoent = (err: unknown) => err instanceof Error
  && (err as Error & { code?: string }).code === 'ENOENT';

export const getProducts = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const products = await Product.find({});
    res.status(200).send({ items: products, total: products.length });
  } catch (err) {
    next(err);
  }
};

export const createProduct = async (req: Request, res: Response, next: NextFunction) => {
  const {
    description,
    image: { fileName, originalName },
    title,
    category,
    price,
  } = req.body;

  let imagePath: string;
  try {
    await Product.init();
    imagePath = await moveFile(fileName);
  } catch (err) {
    if (isEnoent(err)) {
      next(new BadRequestError('Файл не найден'));
      return;
    }
    next(err);
    return;
  }

  try {
    const newProduct = await Product.create({
      description,
      image: {
        fileName: imagePath,
        originalName,
      },
      title,
      category,
      price,
    });
    res.status(201).send(newProduct);
  } catch (err) {
    await removeFile(imagePath);
    if (err instanceof mongoose.Error.ValidationError) {
      next(new BadRequestError('Переданы некорректные данные при создании товара'));
      return;
    }
    if (err instanceof Error && err.message.includes('E11000')) {
      next(new ConflictError('Товар с таким title уже существует'));
      return;
    }
    next(err);
  }
};

export const updateProduct = async (req: Request, res: Response, next: NextFunction) => {
  const { productId } = req.params;
  const {
    description,
    image,
    title,
    category,
    price,
  } = req.body;

  try {
    const productExisting = await Product.findById(productId);
    if (!productExisting) {
      next(new NotFoundError('Товар не найден'));
      return;
    }

    const update: Record<string, unknown> = {};
    if (description !== undefined) update.description = description;
    if (title !== undefined) update.title = title;
    if (category !== undefined) update.category = category;
    if (price !== undefined) update.price = price;

    let newImagePath: string | undefined;
    if (image?.fileName) {
      try {
        newImagePath = await moveFile(image.fileName);
      } catch (err) {
        if (isEnoent(err)) {
          next(new BadRequestError('Файл не найден'));
          return;
        }
        next(err);
        return;
      }
      update.image = { fileName: newImagePath, originalName: image.originalName };
    }

    try {
      const product = await Product.findByIdAndUpdate(productId, update, {
        new: true,
        runValidators: true,
      });
      if (!product) {
        if (newImagePath) await removeFile(newImagePath);
        next(new NotFoundError('Товар не найден'));
        return;
      }
      if (newImagePath) {
        await removeFile(productExisting.image.fileName);
      }
      res.status(200).send(product);
    } catch (err) {
      if (newImagePath) {
        await removeFile(newImagePath);
      }
      if (err instanceof mongoose.Error.ValidationError) {
        next(new BadRequestError('Переданы некорректные данные при обновлении товара'));
        return;
      }
      if (err instanceof Error && err.message.includes('E11000')) {
        next(new ConflictError('Товар с таким title уже существует'));
        return;
      }
      next(err);
    }
  } catch (err) {
    next(err);
  }
};

export const deleteProduct = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { productId } = req.params;
    const product = await Product.findByIdAndDelete(productId);
    if (!product) {
      next(new NotFoundError('Товар не найден'));
      return;
    }
    res.status(200).send(product);
  } catch (err) {
    next(err);
  }
};
