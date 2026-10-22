import path from 'path';
import multer from 'multer';
import { UPLOAD_PATH_TEMP } from '../config';
import { fileTempName } from '../utils/token';
import BadRequestError from '../errors/bad-request-error';

const storage = multer.diskStorage({
  destination: (_req, _file, dest) => {
    dest(null, path.join(__dirname, '..', UPLOAD_PATH_TEMP as string));
  },
  filename: (_req, file, fileName) => {
    fileName(null, fileTempName(file.originalname));
  },
});

const allowedExtentions = ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/svg+xml'];

export default multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, filter) => {
    if (allowedExtentions.includes(file.mimetype)) {
      filter(null, true);
      return;
    }
    filter(new BadRequestError('Недопустимый формат файла'));
  },
});
