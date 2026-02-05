'use client';

import Image from 'next/image';
import { EscrowBackendConfig } from '@/config/config';

const FILE_NAME_MARKER = '__FILE_NAME__:';
const VIDEO_EXTENSIONS = /\.(mp4|webm|ogg|mov|avi|wmv)$/i;
const IMAGE_EXTENSIONS = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
const AUDIO_EXTENSIONS = /\.(mp3|wav|aac|m4a|ogg|webm)$/i;
const TEXT_EXTENSIONS = /\.(txt|md|json|csv|log|xml|html|htm|ts|tsx|js|jsx|yml|yaml|env|ini|cfg|conf)$/i;

type AdminMessageLike = {
  body_text?: string | null;
  kind?: string | null;
  attachment_id?: string | null;
};

function parseMessageBody(bodyText: string | undefined): {
  type: 'image' | 'file' | 'text';
  url?: string;
  caption?: string;
  originalFilename?: string;
} {
  if (!bodyText || !bodyText.trim()) return { type: 'text' };
  const trimmed = bodyText.trim();
  const lines = trimmed.split(/\r?\n/);
  let originalFilename: string | undefined;
  const restLines: string[] = [];
  for (const line of lines) {
    if (line.startsWith(FILE_NAME_MARKER)) {
      originalFilename = line.slice(FILE_NAME_MARKER.length).trim() || undefined;
    } else {
      restLines.push(line);
    }
  }
  const rest = restLines.join('\n').trim();
  const urlMatch = rest.match(/(https?:\/\/[^\s]+|\/(?:backend\/)?uploads\/[^\s]+)/i);
  const url = urlMatch ? urlMatch[1].replace(/[\s\n]+$/, '') : null;
  const caption = url ? rest.replace(url, '').replace(/\n+$/, '').trim() : rest || undefined;

  if (url) {
    const lower = url.toLowerCase();
    const isImage = /\/uploads\/images\//.test(lower) || IMAGE_EXTENSIONS.test(lower);
    const isUploadFile = /\/uploads\//.test(lower) || /\/backend\/uploads\//.test(lower);
    if (isImage) return { type: 'image', url, caption: caption || undefined };
    if (isUploadFile) return { type: 'file', url, caption: caption || undefined, originalFilename };
  }
  return { type: 'text', caption: trimmed || undefined };
}

function getFilePreviewType(filename: string): 'video' | 'audio' | 'image' | 'pdf' | 'text' | 'unsupported' {
  const lower = filename.toLowerCase();
  if (lower.endsWith('.pdf')) return 'pdf';
  if (IMAGE_EXTENSIONS.test(lower)) return 'image';
  if (VIDEO_EXTENSIONS.test(lower)) return 'video';
  if (AUDIO_EXTENSIONS.test(lower)) return 'audio';
  if (TEXT_EXTENSIONS.test(lower)) return 'text';
  return 'unsupported';
}

function normalizeUrl(url: string): string {
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = EscrowBackendConfig.baseURL.replace(/\/api\/v1$/, '');
  if (url.startsWith('/')) {
    return `${apiBase}${url}`;
  }
  return `${apiBase}/${url}`;
}

const AdminMessagePreview = ({ message }: { message: AdminMessageLike }) => {
  const parsed = parseMessageBody(message.body_text ?? undefined);
  const kind = message.kind ?? 'text';
  const attachmentUrl = message.attachment_id
    ? `${EscrowBackendConfig.uploadedImagesURL}${message.attachment_id}`
    : null;
  const rawUrl = parsed.url ? normalizeUrl(parsed.url) : attachmentUrl;
  const filename =
    parsed.originalFilename ||
    (rawUrl ? rawUrl.split('/').pop() : undefined) ||
    'Attachment';

  if ((kind === 'image' || parsed.type === 'image') && rawUrl) {
    return (
      <div className="space-y-2">
        <div className="relative w-full">
          <Image
            src={rawUrl}
            alt="Shared image"
            width={600}
            height={400}
            className="w-full max-h-64 rounded-lg object-contain"
          />
        </div>
        {parsed.caption && (
          <p className="text-small text-gray-700 whitespace-pre-wrap wrap-break-word">{parsed.caption}</p>
        )}
      </div>
    );
  }

  if ((kind === 'file' || parsed.type === 'file') && rawUrl) {
    const previewType = getFilePreviewType(filename);

    return (
      <div className="space-y-2">
        {parsed.caption && (
          <p className="text-small text-gray-700 whitespace-pre-wrap wrap-break-word">{parsed.caption}</p>
        )}
        <div className="flex items-center gap-2 text-small text-[#7E3FF2]">
          <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
            {filename}
          </a>
        </div>
        {previewType === 'image' && (
          <Image
            src={rawUrl}
            alt={filename}
            width={600}
            height={400}
            className="w-full max-h-64 rounded-lg object-contain"
          />
        )}
        {previewType === 'video' && (
          <video controls className="w-full max-h-64 rounded-lg">
            <source src={rawUrl} />
          </video>
        )}
        {previewType === 'audio' && (
          <audio controls className="w-full">
            <source src={rawUrl} />
          </audio>
        )}
        {previewType === 'pdf' && (
          <iframe title={filename} src={rawUrl} className="w-full h-64 rounded-lg bg-white" />
        )}
        {previewType === 'text' && (
          <a href={rawUrl} target="_blank" rel="noopener noreferrer" className="text-small text-gray-600 hover:underline">
            View text file
          </a>
        )}
      </div>
    );
  }

  if (kind === 'system') {
    return (
      <p className="text-small text-gray-500 italic whitespace-pre-wrap wrap-break-word">
        {message.body_text}
      </p>
    );
  }

  if (kind === 'image' && !rawUrl) {
    return <p className="text-small text-gray-700">[Image]</p>;
  }

  if (kind === 'file' && !rawUrl) {
    return <p className="text-small text-[#7E3FF2]">📎 File attachment</p>;
  }

  return (
    <p className="text-small text-gray-700 whitespace-pre-wrap wrap-break-word">
      {message.body_text}
    </p>
  );
};

export default AdminMessagePreview;
