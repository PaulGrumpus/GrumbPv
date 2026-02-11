import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import {
  getUploadDirForMimetype,
  generateUploadFilename,
} from '../utils/fileUpload.js';
import { uploadFile, MAX_FILE_SIZE } from '../controllers/upload.controller.js';
import { AppError } from '../middlewares/errorHandler.js';

const router = Router();

const storage = multer.diskStorage({
  destination: (_req, file, cb) => {
    try {
      const dir = getUploadDirForMimetype(file.mimetype, file.originalname);
      cb(null, dir);
    } catch (err) {
      cb(err as Error, '');
    }
  },
  filename: (_req, file, cb) => {
    const name = generateUploadFilename(file.originalname, file.mimetype);
    cb(null, name);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, cb) => {
    const mimetype = (file.mimetype || '').toLowerCase();
    const allowed =
      mimetype.startsWith('video/') ||
      mimetype.startsWith('image/') ||
      mimetype.startsWith('audio/') ||
      mimetype.startsWith('text/') ||
      mimetype.startsWith('application/pdf') ||
      mimetype.startsWith('application/msword') ||
      mimetype.includes('openxmlformats') ||
      mimetype.includes('spreadsheet') ||
      mimetype.includes('wordprocessing');
    if (allowed) {
      cb(null, true);
      return;
    }
    const ext = path.extname(file.originalname || '').toLowerCase();
    const allowedExt = ['.mp4', '.webm', '.avi', '.mov', '.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf', '.doc', '.docx', '.txt', '.mp3', '.wav', '.ogg', '.m4a', '.csv', '.xls', '.xlsx'];
    if (allowedExt.includes(ext)) {
      cb(null, true);
      return;
    }
    cb(new AppError('File type not allowed. Use video, image, pdf, doc, txt, mp3, etc.', 400, 'FILE_TYPE_NOT_ALLOWED'));
  },
});

router.post('/', upload.single('file'), uploadFile);

export default router;
