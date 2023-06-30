// @flow
import { checkIfCredentialsRequired } from '../../../../Utils/CrossOrigin';

const gd: libGDevelop = global.gd;

// 25% of 255 to accept pixels that are not fully transparent (like effects)
const PIXEL_TRANSPARENCY_THRESHOLD = 64;

export const getMatchingCollisionMask = async (
  pathToFile: string
): Promise<gdVectorPolygon2d> => {
  // First detect, the most left, right, top and bottom pixels that are not transparent.
  // This will be used to crop the image.
  // To do so, we scan the image starting from the borders and going to the center,
  // until we find a non-transparent pixel. (To avoid going through the whole image)
  return new Promise((resolve, reject) => {
    const img = new Image();

    if (pathToFile.startsWith('http://') || pathToFile.startsWith('https://')) {
      img.crossOrigin = checkIfCredentialsRequired(pathToFile)
        ? 'use-credentials'
        : 'anonymous';
    }

    img.addEventListener('load', () => {
      const canvas = document.createElement('canvas');
      const width = img.width;
      const height = img.height;
      canvas.width = width;
      canvas.height = height;
      const context = canvas.getContext('2d');
      if (!context) {
        reject(new Error('Unable to get 2D context.'));
        return;
      }

      context.drawImage(img, 0, 0);
      // Get the pixel data from the canvas
      var imageData = context.getImageData(0, 0, canvas.width, canvas.height);
      var pixels = imageData.data;

      let minX = null;
      let maxX = null;
      let minY = null;
      let maxY = null;

      // Step 1: Scanning Rows from Top to Bottom, until we find a non-transparent pixel
      for (let y = 0; y < height; y++) {
        let foundNonTransparent = false;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) << 2; // Calculate the pixel index

          const alpha = pixels[idx + 3];
          if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
            minY = y;
            foundNonTransparent = true;
            break;
          }
        }
        if (foundNonTransparent) break;
      }
      if (minY === null) {
        reject(new Error('No non-transparent pixel found.'));
        return;
      }

      // Step 2: Scanning Rows from Bottom to Top, until we find a non-transparent pixel
      for (let y = height - 1; y >= 0; y--) {
        let foundNonTransparent = false;
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) << 2; // Calculate the pixel index

          const alpha = pixels[idx + 3];
          if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
            maxY = y;
            foundNonTransparent = true;
            break;
          }
        }
        if (foundNonTransparent) break;
      }
      if (maxY === null) {
        reject(new Error('No non-transparent pixel found.'));
        return;
      }

      // Step 3: Scanning Columns from Left to Right, until we find a non-transparent pixel
      for (let x = 0; x < width; x++) {
        let foundNonTransparent = false;
        for (let y = minY; y <= maxY; y++) {
          const idx = (y * width + x) << 2; // Calculate the pixel index

          const alpha = pixels[idx + 3];
          if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
            minX = x;
            foundNonTransparent = true;
            break;
          }
        }
        if (foundNonTransparent) break;
      }
      if (minX === null) {
        reject(new Error('No non-transparent pixel found.'));
        return;
      }

      // Step 4: Scanning Columns from Right to Left, until we find a non-transparent pixel
      for (let x = width - 1; x >= 0; x--) {
        let foundNonTransparent = false;
        for (let y = minY; y <= maxY; y++) {
          const idx = (y * width + x) << 2; // Calculate the pixel index

          const alpha = pixels[idx + 3];
          if (alpha >= PIXEL_TRANSPARENCY_THRESHOLD) {
            maxX = x;
            foundNonTransparent = true;
            break;
          }
        }
        if (foundNonTransparent) break;
      }
      if (maxX === null) {
        reject(new Error('No non-transparent pixel found.'));
        return;
      }

      const collisionMaskWidth = maxX - minX + 1;
      const collisionMaskHeight = maxY - minY + 1;
      const collisionMaskXCenter = (minX + maxX + 1) / 2;
      const collisionMaskYCenter = (minY + maxY + 1) / 2;
      if (collisionMaskWidth <= 0 || collisionMaskHeight <= 0) {
        reject(new Error('Invalid collision mask size.'));
        return;
      }

      const newPolygon = gd.Polygon2d.createRectangle(
        collisionMaskWidth,
        collisionMaskHeight
      );
      newPolygon.move(collisionMaskXCenter, collisionMaskYCenter);
      const polygons = new gd.VectorPolygon2d();
      polygons.push_back(newPolygon);

      resolve(polygons);
    });
    img.addEventListener('error', () => {
      console.error('Error loading image:', pathToFile);
      reject(new Error('Error loading image.'));
      return;
    });

    img.src = pathToFile;
  });
};
