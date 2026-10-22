import { ErrorRequestHandler } from 'express';
import { isCelebrateError } from 'celebrate';

const celebrateErrorHandler: ErrorRequestHandler = (err, _req, res, next) => {
  if (!isCelebrateError(err)) {
    return next(err);
  }

  const info = err.details.get('body') ?? [...err.details.values()][0];
  const message = info ? info.details.map((i) => i.message).join(', ') : 'Ошибка валидации';

  return res.status(400).send({ message });
};

export default celebrateErrorHandler;
