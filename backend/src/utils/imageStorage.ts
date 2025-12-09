import path from 'node:path';
import { unlink } from 'node:fs/promises';
import { AppError } from '../middlewares/errorHandler.js';
import { logger } from './logger.js';

export type UploadedImage = {
  filename?: string;
  mimetype: string;
  size: number;
};

const IMAGE_UPLOAD_DIR = path.resolve(process.cwd(), 'uploads', 'images');

export const getImageUploadDir = (): string => IMAGE_UPLOAD_DIR;

export function persistUploadedImage(file: UploadedImage): string {
  if (!file.filename) {
    throw new AppError('Invalid uploaded image', 400, 'INVALID_IMAGE_FILE');
  }

  return file.filename;
}

export async function removeStoredImage(imageId?: string | null): Promise<void> {
  if (!imageId) {
    return;
  }

  const normalizedId = path.normalize(imageId).replace(/^(\.\.[/\\])+/, '');

  const targetPath =
    imageId.startsWith(path.sep) || imageId.startsWith('/')
      ? path.resolve(process.cwd(), normalizedId.replace(/^[/\\]/, ''))
      : path.resolve(IMAGE_UPLOAD_DIR, normalizedId);

  try {
    await unlink(targetPath);
  } catch (error) {
    const err = error as NodeJS.ErrnoException;
    if (err.code !== 'ENOENT') {
      logger.warn('Failed to remove stored image from disk', {
        imageId,
        targetPath,
        error,
      });
    }
  }
}
