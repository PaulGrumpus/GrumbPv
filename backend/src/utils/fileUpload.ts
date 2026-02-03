import path from 'node:path';
import { mkdirSync } from 'node:fs';
import { randomUUID } from 'node:crypto';
import { AppError } from '../middlewares/errorHandler.js';

const UPLOADS_BASE = path.resolve(process.cwd(), 'uploads');

export type UploadCategory = 'videos' | 'images' | 'docs' | 'sounds';

const MIME_TO_FOLDER: Record<string, UploadCategory> = {
  // Video
  'video/mp4': 'videos',
  'video/webm': 'videos',
  'video/ogg': 'videos',
  'video/quicktime': 'videos',
  'video/x-msvideo': 'videos',
  'video/x-ms-wmv': 'videos',
  'video/avi': 'videos',
  'video/*': 'videos',
  // Image (already have uploads/images)
  'image/jpeg': 'images',
  'image/png': 'images',
  'image/gif': 'images',
  'image/webp': 'images',
  'image/svg+xml': 'images',
  'image/*': 'images',
  // Documents
  'application/pdf': 'docs',
  'text/plain': 'docs',
  'text/csv': 'docs',
  'text/html': 'docs',
  'application/msword': 'docs', // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'docs', // .docx
  'application/vnd.ms-excel': 'docs',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'docs',
  'application/rtf': 'docs',
  'application/*': 'docs',
  'text/*': 'docs',
  // Audio
  'audio/mpeg': 'sounds',
  'audio/mp3': 'sounds',
  'audio/wav': 'sounds',
  'audio/ogg': 'sounds',
  'audio/webm': 'sounds',
  'audio/aac': 'sounds',
  'audio/x-wav': 'sounds',
  'audio/*': 'sounds',
};

const EXT_TO_FOLDER: Record<string, UploadCategory> = {
  '.mp4': 'videos',
  '.webm': 'videos',
  '.ogg': 'videos',
  '.mov': 'videos',
  '.avi': 'videos',
  '.wmv': 'videos',
  '.jpg': 'images',
  '.jpeg': 'images',
  '.png': 'images',
  '.gif': 'images',
  '.webp': 'images',
  '.svg': 'images',
  '.pdf': 'docs',
  '.txt': 'docs',
  '.doc': 'docs',
  '.docx': 'docs',
  '.xls': 'docs',
  '.xlsx': 'docs',
  '.csv': 'docs',
  '.rtf': 'docs',
  '.mp3': 'sounds',
  '.wav': 'sounds',
  '.aac': 'sounds',
  '.m4a': 'sounds',
};

export function getUploadDirForMimetype(mimetype: string, originalName?: string): string {
  const normalizedMime = mimetype?.toLowerCase().split(';')[0].trim() || '';
  let folder: UploadCategory | undefined = MIME_TO_FOLDER[normalizedMime];

  if (!folder && normalizedMime.startsWith('video/')) folder = 'videos';
  if (!folder && normalizedMime.startsWith('image/')) folder = 'images';
  if (!folder && normalizedMime.startsWith('audio/')) folder = 'sounds';
  if (!folder && (normalizedMime.startsWith('text/') || normalizedMime.startsWith('application/')))
    folder = 'docs';

  if (!folder && originalName) {
    const ext = path.extname(originalName).toLowerCase();
    folder = EXT_TO_FOLDER[ext];
  }

  if (!folder) {
    throw new AppError(
      `Unsupported file type: ${mimetype || 'unknown'}. Allowed: video, image, pdf, doc, txt, mp3, etc.`,
      400,
      'UNSUPPORTED_FILE_TYPE'
    );
  }

  const dir = path.join(UPLOADS_BASE, folder);
  mkdirSync(dir, { recursive: true });
  return dir;
}

export function getRelativePathFromUploads(folder: UploadCategory, filename: string): string {
  return path.join(folder, filename).split(path.sep).join('/');
}

export function generateUploadFilename(originalName: string, mimetype?: string): string {
  const ext =
    path.extname(originalName)?.toLowerCase() ||
    (mimetype && getDefaultExtension(mimetype)) ||
    '.bin';
  return `${randomUUID()}${ext}`;
}

function getDefaultExtension(mimetype: string): string {
  const m = mimetype?.toLowerCase().split(';')[0] || '';
  const map: Record<string, string> = {
    'video/mp4': '.mp4',
    'video/webm': '.webm',
    'image/jpeg': '.jpg',
    'image/png': '.png',
    'application/pdf': '.pdf',
    'audio/mpeg': '.mp3',
    'audio/mp3': '.mp3',
    'text/plain': '.txt',
  };
  return map[m] || '';
}

export function getAllowedCategories(): UploadCategory[] {
  return ['videos', 'images', 'docs', 'sounds'];
}
