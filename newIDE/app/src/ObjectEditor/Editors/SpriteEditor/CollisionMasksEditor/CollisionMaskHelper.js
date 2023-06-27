// @flow
import optionalLazyRequire from '../../../../Utils/OptionalLazyRequire';
const lazyRequireJimp = optionalLazyRequire('jimp');

const gd = global.gd;

export const getMatchingCollisionMask = async (imageFile: string) => {
  // First detect, the most left, right, top and bottom pixels that are not transparent.
  // This will be used to crop the image.
  const jimp = lazyRequireJimp();
  if (!jimp) return null;

  const image = await jimp.read(imageFile);
  const { width, height } = image.bitmap;
  if (!width || !height) return null;
  let minX = width;
  let maxX = 0;
  let minY = height;
  let maxY = 0;
  image.scan(0, 0, width, height, function(x, y, idx) {
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
