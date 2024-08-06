// @flow
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

export const canSwapAssetOfObject = (object: gdObject) => {
  const type = object.getType();
  return type === 'Scene3D::Model3DObject' || type === 'Sprite';
};

const mergeAnimations = (
  objectsAnimations: Array<{ name: string }>,
  assetAnimations: Array<{ name: string }>
) => {
  const animations = [];
  // Ensure the object don't loose any animation.
  for (const objectAnimation of objectsAnimations) {
    const assetAnimation = assetAnimations.find(
      assetAnimation => assetAnimation.name === objectAnimation.name
    ) || {
      ...assetAnimations[0],
      name: objectAnimation.name,
    };
    animations.push(assetAnimation);
  }
  // Add extra animations from the asset.
  for (const assetAnimation of assetAnimations) {
    if (
      !objectsAnimations.some(
        objectAnimation => objectAnimation.name === assetAnimation.name
      )
    ) {
      animations.push(assetAnimation);
    }
  }
  return animations;
};

export const swapAsset = (
  project: gdProject,
  object: gdObject,
  assetObject: gdObject
) => {
  const serializedObject = serializeToJSObject(object);
  const serializedAssetObject = serializeToJSObject(assetObject);

  if (object.getType() === 'Sprite') {
    serializedObject.animations = mergeAnimations(
      serializedObject.animations,
      serializedAssetObject.animations
    );
  } else if (object.getType() === 'Scene3D::Model3DObject') {
    const objectVolume =
      serializedObject.content.width *
      serializedObject.content.height *
      serializedObject.content.depth;
    const assetVolume =
      serializedAssetObject.content.width *
      serializedAssetObject.content.height *
      serializedAssetObject.content.depth;
    const sizeRatio = Math.pow(objectVolume / assetVolume, 1 / 3);

    serializedObject.content = {
      ...serializedAssetObject.content,
      animations: mergeAnimations(
        serializedObject.content.animations,
        serializedAssetObject.content.animations
      ),
      width: serializedAssetObject.content.width * sizeRatio,
      height: serializedAssetObject.content.height * sizeRatio,
      depth: serializedAssetObject.content.depth * sizeRatio,
      // Keep the origin and center as they may be important for the game to work.
      originLocation: serializedObject.content.originLocation,
      centerLocation: serializedObject.content.centerLocation,
    };
  }
  unserializeFromJSObject(object, serializedObject, 'unserializeFrom', project);
};
