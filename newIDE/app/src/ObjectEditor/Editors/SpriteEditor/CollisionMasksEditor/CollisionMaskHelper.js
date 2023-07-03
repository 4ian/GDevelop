// @flow
import { checkIfCredentialsRequired } from '../../../../Utils/CrossOrigin';

const gd: libGDevelop = global.gd;

// 25% of 255 to accept pixels that are not fully transparent (like effects)
const PIXEL_TRANSPARENCY_THRESHOLD = 64;

const loadImage = (img: Image, pathToFile: string) => {
  return new Promise((resolve, reject) => {
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', () =>
      reject(new Error('Failed to load image'))
    );
    img.src = pathToFile;
  });
};

const isPixelAboveTransparencyThreshold = (
  pixels: Uint8ClampedArray,
  x: number,
  y: number,
  width: number
) => {
  const idx = (y * width + x) << 2; // Calculate the pixel index
  const alpha = pixels[idx + 3];
  return alpha >= PIXEL_TRANSPARENCY_THRESHOLD;
};

export const getMatchingCollisionMask = async (
  pathToFile: string
): Promise<gdVectorPolygon2d> => {
  // First detect, the most left, right, top and bottom pixels that are not transparent.
  // This will be used to crop the image.
  // To do so, we scan the image starting from the borders and going to the center,
  // until we find a non-transparent pixel. (To avoid going through the whole image)
  const img = new Image();

  if (pathToFile.startsWith('http://') || pathToFile.startsWith('https://')) {
    img.crossOrigin = checkIfCredentialsRequired(pathToFile)
      ? 'use-credentials'
      : 'anonymous';
  }

  try {
    await loadImage(img, pathToFile);

    const canvas = document.createElement('canvas');
    const width = img.width;
    const height = img.height;
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext('2d');
    if (!context) {
      throw new Error('Unable to get 2D context.');
    }

    context.drawImage(img, 0, 0);
    // Get the pixel data from the canvas
    const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    let minX = null;
    let maxX = null;
    let minY = null;
    let maxY = null;

    // Step 1: Scanning Rows from Top to Bottom, until we find a non-transparent pixel
    for (let y = 0; y < height; y++) {
      let foundNonTransparent = false;
      for (let x = 0; x < width; x++) {
        if (isPixelAboveTransparencyThreshold(pixels, x, y, width)) {
          minY = y;
          foundNonTransparent = true;
          break;
        }
      }
      if (foundNonTransparent) break;
    }
    if (minY === null) {
      throw new Error(
        'No non-transparent pixel found while scanning rows from top to bottom.'
      );
    }

    // Step 2: Scanning Rows from Bottom to Top, until we find a non-transparent pixel
    for (let y = height - 1; y >= 0; y--) {
      let foundNonTransparent = false;
      for (let x = 0; x < width; x++) {
        if (isPixelAboveTransparencyThreshold(pixels, x, y, width)) {
          maxY = y;
          foundNonTransparent = true;
          break;
        }
      }
      if (foundNonTransparent) break;
    }
    if (maxY === null) {
      throw new Error(
        'No non-transparent pixel found while scanning rows from bottom to top.'
      );
    }

    // Step 3: Scanning Columns from Left to Right, until we find a non-transparent pixel
    for (let x = 0; x < width; x++) {
      let foundNonTransparent = false;
      for (let y = minY; y <= maxY; y++) {
        if (isPixelAboveTransparencyThreshold(pixels, x, y, width)) {
          minX = x;
          foundNonTransparent = true;
          break;
        }
      }
      if (foundNonTransparent) break;
    }
    if (minX === null) {
      throw new Error(
        'No non-transparent pixel found while scanning columns from left to right.'
      );
    }

    // Step 4: Scanning Columns from Right to Left, until we find a non-transparent pixel
    for (let x = width - 1; x >= 0; x--) {
      let foundNonTransparent = false;
      for (let y = minY; y <= maxY; y++) {
        if (isPixelAboveTransparencyThreshold(pixels, x, y, width)) {
          maxX = x;
          foundNonTransparent = true;
          break;
        }
      }
      if (foundNonTransparent) break;
    }
    if (maxX === null) {
      throw new Error(
        'No non-transparent pixel found while scanning columns from right to left.'
      );
    }

    const collisionMaskWidth = maxX - minX + 1;
    const collisionMaskHeight = maxY - minY + 1;
    const collisionMaskXCenter = (minX + maxX + 1) / 2;
    const collisionMaskYCenter = (minY + maxY + 1) / 2;
    if (collisionMaskWidth <= 0 || collisionMaskHeight <= 0) {
      throw new Error('Invalid collision mask size.');
    }

    const newPolygon = gd.Polygon2d.createRectangle(
      collisionMaskWidth,
      collisionMaskHeight
    );
    newPolygon.move(collisionMaskXCenter, collisionMaskYCenter);
    const polygons = new gd.VectorPolygon2d();
    polygons.push_back(newPolygon);

    return polygons;
  } catch (e) {
    throw new Error('Unable to load image: ' + e);
  }
};
