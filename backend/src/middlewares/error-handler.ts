import { ErrorRequestHandler } from 'express';
import multer from 'multer';

interface IStatusCode extends Error {
  statusCode: number;
}

const errorHandler: ErrorRequestHandler = (err: IStatusCode, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    const message = err.code === 'LIMIT_FILE_SIZE'
      ? 'Файл слишком большой'
      : 'Ошибка загрузки файла';
    res
      .status(400)
      .send({ message });
    return;
  }
  const statusCode = err.statusCode ?? 500;
  const message = err.statusCode ? err.message : 'Ошибка на сервере';

  res.status(statusCode).send({ message });
};

export default errorHandler;
