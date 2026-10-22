import { Router } from 'express';
import Auth from '../middlewares/auth';
import FileControl from '../middlewares/file';
import UploadFile from '../controllers/upload';

const router = Router();

router.post('/upload', Auth, FileControl.single('file'), UploadFile);

export default router;
