// @flow
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';

/** Represents a point in a coordinate system. */
type SpritePoint = {
  /** X position of the point. */
  x: number,
  /** Y position of the point. */
  y: number,
};

/** Represents a custom point in a frame. */
type SpriteCustomPointData = {
  /** Name of the point. */
  name: string,
  /** X position of the point. */
  x: number,
  /** Y position of the point. */
  y: number,
};

/** Represents the center point in a frame. */
type SpriteCenterPointData = {
  /** Name of the point. */
  name: string,
  /** Is the center automatically computed? */
  automatic: boolean,
  /** X position of the point. */
  x: number,
  /** Y position of the point. */
  y: number,
};

/** Represents a {@link gdjs.SpriteAnimationFrame}. */
type SpriteFrameData = {
  /** The resource name of the image used in this frame. */
  image: string,
  /** The points of the frame. */
  points: Array<SpriteCustomPointData>,
  /** The origin point. */
  originPoint: SpriteCustomPointData,
  /** The center of the frame. */
  centerPoint: SpriteCenterPointData,
  /** Is The collision mask custom? */
  hasCustomCollisionMask: boolean,
  /** The collision mask if it is custom. */
  customCollisionMask: Array<Array<SpritePoint>>,
};

/** Represents the data of a {@link gdjs.SpriteAnimationDirection}. */
type SpriteDirectionData = {
  /** Time between each frame, in seconds. */
  timeBetweenFrames: number,
  /** Is the animation looping? */
  looping: boolean,
  /** The list of frames. */
  sprites: Array<SpriteFrameData>,
};

/** Represents the data of a {@link gdjs.SpriteAnimation}. */
type SpriteAnimationData = {
  /** The name of the animation. */
  name: string,
  /** Does the animation use multiple {@link gdjs.SpriteAnimationDirection}? */
  useMultipleDirections: boolean,
  /** The list of {@link SpriteDirectionData} representing {@link gdjs.SpriteAnimationDirection} instances. */
  directions: Array<SpriteDirectionData>,
};

export const canSwapAssetOfObject = (object: gdObject) => {
  const type = object.getType();
  return type === 'Scene3D::Model3DObject' || type === 'Sprite';
};

const mergeAnimations = function<A: { name: string }>(
  objectsAnimations: Array<A>,
  assetAnimations: Array<A>,
  mergeAnimation: (objectsAnimation: A, assetAnimation: A) => A
) {
  const animations = [];
  // Ensure the object don't loose any animation.
  for (const objectAnimation of objectsAnimations) {
    const assetAnimation = assetAnimations.find(
      assetAnimation => assetAnimation.name === objectAnimation.name
    ) || {
      ...assetAnimations[0],
      name: objectAnimation.name,
    };
    animations.push(mergeAnimation(objectAnimation, assetAnimation));
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

const mergeSpriteFrame = (
  objectsAnimation: SpriteFrameData,
  assetAnimation: SpriteFrameData
): SpriteFrameData => {
  return {
    ...assetAnimation,
    originPoint: objectsAnimation.originPoint,
    centerPoint: objectsAnimation.centerPoint,
    points: objectsAnimation.points,
  };
};

const mergeSpriteAnimation = (
  objectAnimation: SpriteAnimationData,
  assetAnimation: SpriteAnimationData
): SpriteAnimationData => {
  const objectDirection = objectAnimation.directions[0];
  const assetDirection = assetAnimation.directions[0];
  return {
    ...assetAnimation,
    directions: [
      {
        ...assetDirection,
        sprites: assetDirection.sprites.map((frame, frameIndex) =>
          mergeSpriteFrame(
            frameIndex < objectDirection.sprites.length
              ? objectDirection.sprites[frameIndex]
              : objectDirection.sprites[0],
            frame
          )
        ),
      },
    ],
  };
};

const mergeSpriteAnimations = (
  objectAnimations: Array<SpriteAnimationData>,
  assetAnimations: Array<SpriteAnimationData>
) =>
  mergeAnimations<SpriteAnimationData>(
    objectAnimations,
    assetAnimations,
    mergeSpriteAnimation
  );

const mergeModel3DAnimation = (objectsAnimation, assetAnimation) =>
  assetAnimation;

const mergeModel3DAnimations = (
  objectsAnimations: Array<{ name: string }>,
  assetAnimations: Array<{ name: string }>
) =>
  mergeAnimations<{ name: string }>(
    objectsAnimations,
    assetAnimations,
    mergeModel3DAnimation
  );

export const swapAsset = (
  project: gdProject,
  object: gdObject,
  assetObject: gdObject
) => {
  const serializedObject = serializeToJSObject(object);
  const serializedAssetObject = serializeToJSObject(assetObject);

  if (object.getType() === 'Sprite') {
    serializedObject.animations = mergeSpriteAnimations(
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
      animations: mergeModel3DAnimations(
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
