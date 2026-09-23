// @flow
import axios from 'axios';
import { createAiAttachmentUploadUrls } from '../../Utils/GDevelopServices/Generation';

// Beyond this, images are downscaled for the AI (the original is kept, to be
// added to the project).
const VISION_COPY_MAX_DIMENSION = 1568;
const VISION_COPY_MIN_FILE_SIZE_IN_BYTES = 1000 * 1000;
const AI_READABLE_IMAGE_MIME_TYPES = [
  'image/png',
  'image/jpeg',
  'image/webp',
  'image/gif',
];

// The files attached during this session, so they can be added to the
// project without downloading them.
const uploadedFilesByAttachmentId: Map<string, File> = new Map();

export const getFileOfUploadedAttachment = (attachmentId: string): ?File =>
  uploadedFilesByAttachmentId.get(attachmentId);

const canvasToBlob = (
  canvas: HTMLCanvasElement,
  mimeType: string
): Promise<?Blob> =>
  new Promise(resolve => canvas.toBlob(resolve, mimeType, 0.85));

const loadImage = (file: File): Promise<?HTMLImageElement> =>
  new Promise(resolve => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve(null);
    };
    image.src = objectUrl;
  });

/**
 * A downscaled copy of an image for the AI, or null when the image can be
 * read as is, or cannot be read by the browser (the AI then only gets its
 * name).
 */
const makeVisionCopy = async (file: File): Promise<?Blob> => {
  if (!file.type.startsWith('image/')) return null;
  const image = await loadImage(file);
  if (!image) return null;
  const width = image.naturalWidth;
  const height = image.naturalHeight;
  const largestDimension = Math.max(width, height);
  if (
    AI_READABLE_IMAGE_MIME_TYPES.includes(file.type) &&
    file.size < VISION_COPY_MIN_FILE_SIZE_IN_BYTES &&
    largestDimension <= VISION_COPY_MAX_DIMENSION
  ) {
    return null;
  }

  const scale = Math.min(1, VISION_COPY_MAX_DIMENSION / largestDimension);
  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));
  const context = canvas.getContext('2d');
  if (!context) return null;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);

  // WebP keeps the transparency, but is not supported by every browser.
  const webpBlob = await canvasToBlob(canvas, 'image/webp');
  if (webpBlob && webpBlob.type === 'image/webp') return webpBlob;
  return canvasToBlob(canvas, 'image/jpeg');
};

/**
 * Upload a file attached to a message for the AI, and return the id of the
 * attachment to send with the message.
 */
export const uploadAiAttachment = async ({
  getAuthorizationHeader,
  userId,
  file,
}: {|
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  file: File,
|}): Promise<string> => {
  const mimeType = file.type || 'application/octet-stream';
  const visionCopy = await makeVisionCopy(file);
  const [upload] = await createAiAttachmentUploadUrls(getAuthorizationHeader, {
    userId,
    attachments: [
      {
        name: file.name,
        mimeType,
        size: file.size,
        visionCopy: visionCopy
          ? { mimeType: visionCopy.type, size: visionCopy.size }
          : null,
      },
    ],
  });
  const { attachmentId, uploadUrl, visionCopyUploadUrl } = upload;
  await Promise.all([
    axios.put<mixed>(uploadUrl, file, {
      headers: { 'Content-Type': mimeType },
    }),
    visionCopy && visionCopyUploadUrl
      ? axios.put<mixed>(visionCopyUploadUrl, visionCopy, {
          headers: { 'Content-Type': visionCopy.type },
        })
      : null,
  ]);
  uploadedFilesByAttachmentId.set(attachmentId, file);
  return attachmentId;
};
