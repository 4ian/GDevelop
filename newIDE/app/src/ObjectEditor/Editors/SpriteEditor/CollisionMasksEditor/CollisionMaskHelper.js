// @flow
import axios from 'axios';
import optionalLazyRequire from '../../../../Utils/OptionalLazyRequire';
import { checkIfCredentialsRequired } from '../../../../Utils/CrossOrigin';
import Jimp from 'jimp/es';
const lazyRequireFs = optionalLazyRequire('fs');

const gd = global.gd;

async function getJimpImage(pathToFile: string) {
  try {
    if (pathToFile.startsWith('http://') || pathToFile.startsWith('https://')) {
      const response = await axios.get(pathToFile, {
        responseType: 'arraybuffer',
        withCredentials: checkIfCredentialsRequired(pathToFile),
      });

      const imageBuffer = response.data;
      const jimpImage = await Jimp.read(imageBuffer);

      return jimpImage;
    } else if (pathToFile.startsWith('file://')) {
      const cleanedPath = pathToFile.replace('file://', '').split('?')[0];
      // For some reason, calling directly Jimp.read with a path does not work
      // in the renderer process of Electron. So we read the file ourselves
      // and pass the ArrayBuffer to Jimp.
      const fs = lazyRequireFs();
      if (!fs) return null;
      const file = fs.readFileSync(cleanedPath);
      const imageBuffer = new Uint8Array(file).buffer;
      const jimpImage = await Jimp.read(imageBuffer);

      return jimpImage;
    } else {
      console.error(
        'Unsupported image path. Only http://, https:// and file:// are supported.'
      );
      return null;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

// 25% of 255 to accept pixels that are not fully transparent (like effects)
const PIXEL_TRANSPARENCY_THRESHOLD = 64;

export const getMatchingCollisionMask = async (imageFile: string) => {
  // First detect, the most left, right, top and bottom pixels that are not transparent.
  // This will be used to crop the image.
  // To do so, we scan the image starting from the borders and going to the center,
  // until we find a non-transparent pixel. (To avoid going through the whole image)
  if (!Jimp) return null;
  const jimpImage = await getJimpImage(imageFile);
  if (!jimpImage) return null;
  const { width, height } = jimpImage.bitmap;
  if (!width || !height) return null;
  let minX = null;
  let maxX = null;
  let minY = null;
  let maxY = null;

  // Step 1: Scanning Rows from Top to Bottom, until we find a non-transparent pixel
  for (let y = 0; y < height; y++) {
    let foundNonTransparent = false;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2; // Calculate the pixel index

      const alpha = jimpImage.bitmap.data[idx + 3];
      if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
        minY = y;
        foundNonTransparent = true;
        break;
      }
    }
    if (foundNonTransparent) break;
  }
  if (minY === null) return null;

  // Step 2: Scanning Rows from Bottom to Top, until we find a non-transparent pixel
  for (let y = height - 1; y >= 0; y--) {
    let foundNonTransparent = false;
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) << 2; // Calculate the pixel index

      const alpha = jimpImage.bitmap.data[idx + 3];
      if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
        maxY = y;
        foundNonTransparent = true;
        break;
      }
    }
    if (foundNonTransparent) break;
  }
  if (maxY === null) return null;

  // Step 3: Scanning Columns from Left to Right, until we find a non-transparent pixel
  for (let x = 0; x < width; x++) {
    let foundNonTransparent = false;
    for (let y = minY; y <= maxY; y++) {
      const idx = (y * width + x) << 2; // Calculate the pixel index

      const alpha = jimpImage.bitmap.data[idx + 3];
      if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
        minX = x;
        foundNonTransparent = true;
        break;
      }
    }
    if (foundNonTransparent) break;
  }
  if (minX === null) return null;

  // Step 4: Scanning Columns from Right to Left, until we find a non-transparent pixel
  for (let x = width - 1; x >= 0; x--) {
    let foundNonTransparent = false;
    for (let y = minY; y <= maxY; y++) {
      const idx = (y * width + x) << 2; // Calculate the pixel index

      const alpha = jimpImage.bitmap.data[idx + 3];
      if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
        maxX = x;
        foundNonTransparent = true;
        break;
      }
    }
    if (foundNonTransparent) break;
  }
  if (maxX === null) return null;

  const collisionMaskWidth = maxX - minX + 1;
  const collisionMaskHeight = maxY - minY + 1;
  const collisionMaskXCenter = (minX + maxX + 1) / 2;
  const collisionMaskYCenter = (minY + maxY + 1) / 2;
  if (collisionMaskWidth <= 0 || collisionMaskHeight <= 0) return null;

  const newPolygon = gd.Polygon2d.createRectangle(
    collisionMaskWidth,
    collisionMaskHeight
  );
  newPolygon.move(collisionMaskXCenter, collisionMaskYCenter);
  const polygons = new gd.VectorPolygon2d();
  polygons.push_back(newPolygon);

  return polygons;
};
