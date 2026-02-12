// @flow
import optionalRequire from './OptionalRequire';
const path = optionalRequire('path');
const fs = optionalRequire('fs');

const readLocalFileToArrayBuffer = async (
  filePath: string
): Promise<ArrayBuffer> => {
  const buffer: Buffer = await new Promise((resolve, reject) => {
    fs.readFile(filePath, function(err, buffer) {
      if (err) {
        reject(err);
        return;
      }

      resolve(buffer);
    });
  });

  // See https://stackoverflow.com/questions/8609289/convert-a-binary-nodejs-buffer-to-javascript-arraybuffer:
  // The slice and offset stuff is required because small Buffers (less than 4 kB by default, half the pool size)
  // can be views on a shared ArrayBuffer. Without slicing, you can end up with an ArrayBuffer containing data from another Buffer.
  const arrayBuffer = buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
  return arrayBuffer;
};

// See https://developer.mozilla.org/en-US/docs/Web/HTTP/Basics_of_HTTP/MIME_types/Common_types.
const extensionToMimeType = {
  // Common audio extensions:
  aac: 'audio/aac',
  wav: 'audio/wav',
  mp3: 'audio/mp3',
  ogg: 'audio/ogg',

  // Common image extensions:
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  webp: 'image/webp',

  // Common font extensions:
  ttf: 'font/ttf',
  otf: 'font/otf',

  // Common video extensions:
  mp4: 'video/mp4',
  webm: 'video/webm',

  // Other common extensions:
  json: 'application/json',
  xml: 'application/xml',
  gz: 'application/gzip',
  js: 'application/javascript',
};

export const readLocalFileToFile = async (filePath: string): Promise<File> => {
  const arrayBuffer = await readLocalFileToArrayBuffer(filePath);
  const extensionWithoutLeadingDot = path.extname(filePath).replace(/^\./, '');
  return new File([arrayBuffer], path.basename(filePath), {
    type:
      extensionToMimeType[extensionWithoutLeadingDot] ||
      'application/octet-stream',
  });
};
