import { Request, Response, NextFunction } from 'express';
import BadRequestError from '../errors/bad-request-error';

export default (req: Request, res: Response, next: NextFunction) => {
  if (!req.file) {
    next(new BadRequestError('Файл не найден'));
    return;
  }
  res
    .status(200)
    .send({
      fileName: `/images/${req.file.filename}`,
      originalName: req.file.originalname,
    });
};
