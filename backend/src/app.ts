import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import path from 'path';
import cookieParser from 'cookie-parser';
import { PORT, DB_ADDRESS, ORIGIN_ALLOW } from './config';
import ProductRouter from './routes/product';
import OrderRouter from './routes/order';
import AuthRouter from './routes/auth';
import UploadRouter from './routes/upload';
import ErrorHandler from './middlewares/error-handler';
import CelebrateErrorHandler from './middlewares/celebrate-error-handler';
import NotFoundError from './errors/not-found-error';
import { requestLogger, errorLogger } from './middlewares/logger';
import './utils/cleanup';

const app = express();
app.use(express.json());
app.use(cors({ origin: (ORIGIN_ALLOW as string).split(','), credentials: true }));
app.use(cookieParser());

mongoose.connect(`${DB_ADDRESS}`).catch((err) => console.log(err));

app.use(requestLogger);
app.use(express.static(path.join(__dirname, 'public')));

app.use(AuthRouter);
app.use(UploadRouter);
app.use(ProductRouter);
app.use(OrderRouter);
app.use((_req, _res, next) => {
  next(new NotFoundError('Маршрут не найден'));
});
app.use(errorLogger);
app.use(CelebrateErrorHandler);
app.use(ErrorHandler);

app.listen(PORT, () => console.log(`'Server started on port ${PORT}'`));
