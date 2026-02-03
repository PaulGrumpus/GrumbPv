import type { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler.js';
import path from 'node:path';
import { getRelativePathFromUploads, type UploadCategory } from '../utils/fileUpload.js';

const DEFAULT_MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024; // 100MB
const MAX_FILE_SIZE = Number(process.env.UPLOAD_MAX_FILE_SIZE_BYTES || DEFAULT_MAX_FILE_SIZE_BYTES);

function getBaseUrl(): string {
  const url =
    process.env.BACKEND_URL ||
    process.env.BASE_URL ||
    process.env.FRONTEND_URL ||
    `http://localhost:${process.env.PORT || 5000}`;
  return url.replace(/\/$/, '');
}

/**
 * POST /upload (single file)
 * Expects multipart/form-data with field name "file".
 * Returns { url: string } - absolute URL to access the file.
 */
export async function uploadFile(req: Request, res: Response, next: NextFunction) {
  try {
    if (!req.file) {
      throw new AppError('No file uploaded. Use multipart/form-data with field name "file".', 400, 'NO_FILE');
    }

    const file = req.file;
    const folder = path.basename(file.destination) as UploadCategory;
    const relativePath = getRelativePathFromUploads(folder, file.filename);
    const baseUrl = getBaseUrl();
    const absoluteUrl = `${baseUrl}/uploads/${relativePath}`;

    res.status(201).json({
      success: true,
      data: {
        url: absoluteUrl,
        filename: file.filename,
        original_filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        folder,
      },
    });
  } catch (error) {
    next(error);
  }
}

export { MAX_FILE_SIZE };
