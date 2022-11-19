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

export const readLocalFileToFile = async (filePath: string): Promise<File> => {
  const arrayBuffer = await readLocalFileToArrayBuffer(filePath);
  return new File([arrayBuffer], path.basename(filePath), {
    type: 'image/png', // TODO: read extension and get mime type from it.
  });
};
