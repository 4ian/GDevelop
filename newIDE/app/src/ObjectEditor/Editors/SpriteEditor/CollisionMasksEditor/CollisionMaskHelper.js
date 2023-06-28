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
    } else {
      // For some reason, calling directly Jimp.read with a path does not work
      // in the renderer process of Electron. So we read the file ourselves
      // and pass the ArrayBuffer to Jimp.
      const fs = lazyRequireFs();
      if (!fs) return null;
      const imageBuffer = fs.readFileSync(pathToFile).buffer;
      const jimpImage = await Jimp.read(imageBuffer);

      return jimpImage;
    }
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
}

export const getMatchingCollisionMask = async (imageFile: string) => {
  // First detect, the most left, right, top and bottom pixels that are not transparent.
  // This will be used to crop the image.
  if (!Jimp) return null;
  const jimpImage = await getJimpImage(imageFile);
  if (!jimpImage) return null;
  const { width, height } = jimpImage.bitmap;
  if (!width || !height) return null;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  jimpImage.scan(0, 0, width, height, function(x, y, idx) {
    const alpha = this.bitmap.data[idx + 3];
    if (alpha > 0) {
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  });

  const collisionMaskWidth = maxX - minX;
  const collisionMaskHeight = maxY - minY;
  const collisionMaskXCenter = (minX + maxX) / 2;
  const collisionMaskYCenter = (minY + maxY) / 2;
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
