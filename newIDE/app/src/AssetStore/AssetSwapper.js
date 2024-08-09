// @flow
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type AssetShortHeader } from '../Utils/GDevelopServices/Asset';

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

/** Represents the data of a {@link gdjs.SpriteRuntimeObject}. */
type SpriteObjectDataType = {
  /** Update the object even if he is not visible?. */
  updateIfNotVisible: boolean,
  /** The scale applied to object to evaluate the default dimensions */
  preScale?: number,
  /** The list of {@link SpriteAnimationData} representing {@link gdjs.SpriteAnimation} instances. */
  animations: Array<SpriteAnimationData>,
};

export const canSwapAssetOfObject = (object: gdObject) => {
  const type = object.getType();
  return type === 'Scene3D::Model3DObject' || type === 'Sprite';
};

const mergeAnimations = function<A: { name: string }>(
  project: gdProject,
  PixiResourcesLoader: any,
  objectAnimations: Array<A>,
  assetAnimations: Array<A>,
  mergeAnimation: (
    project: gdProject,
    PixiResourcesLoader: any,
    objectsAnimation: A,
    assetAnimation: A
  ) => A
) {
  const animations = [];
  // Ensure the object don't loose any animation.
  for (const objectAnimation of objectAnimations) {
    const assetAnimation = assetAnimations.find(
      assetAnimation => assetAnimation.name === objectAnimation.name
    ) || {
      ...assetAnimations[0],
      name: objectAnimation.name,
    };
    animations.push(
      mergeAnimation(
        project,
        PixiResourcesLoader,
        objectAnimation,
        assetAnimation
      )
    );
  }
  // Add extra animations from the asset.
  for (const assetAnimation of assetAnimations) {
    if (
      !objectAnimations.some(
        objectAnimation => objectAnimation.name === assetAnimation.name
      )
    ) {
      animations.push(assetAnimation);
    }
  }
  return animations;
};

const getFirstFrameDimension = (
  project: gdProject,
  PixiResourcesLoader: any,
  spriteConfiguration: SpriteObjectDataType
) => {
  if (spriteConfiguration.animations.length === 0) {
    return null;
  }
  const direction = spriteConfiguration.animations[0].directions[0];
  if (direction.sprites.length === 0) {
    return null;
  }
  const image = PixiResourcesLoader.getPIXITexture(
    project,
    direction.sprites[0].image
  );
  if (!image.valid) {
    return null;
  }
  return { width: image.width, height: image.height };
};

const evaluateImageScale = (
  project: gdProject,
  PixiResourcesLoader: any,
  serializedObject: SpriteObjectDataType,
  serializedAssetObject: SpriteObjectDataType,
  assetShortHeader?: ?AssetShortHeader
) => {
  const objectDimensions = getFirstFrameDimension(
    project,
    PixiResourcesLoader,
    serializedObject
  );
  // The asset header is used because the Pixi texture will likely be invalid
  // when the asset has just been downloaded.
  const assetDimensions = assetShortHeader
    ? { width: assetShortHeader.width, height: assetShortHeader.height }
    : getFirstFrameDimension(
        project,
        PixiResourcesLoader,
        serializedAssetObject
      );
  if (!objectDimensions || !assetDimensions) {
    return { scaleX: 1, scaleY: 1 };
  }
  const scaleX = assetDimensions.width / objectDimensions.width;
  const scaleY = assetDimensions.height / objectDimensions.height;
  return { scaleX, scaleY };
};

const evaluatePreScale = (
  project: gdProject,
  PixiResourcesLoader: any,
  serializedObject: SpriteObjectDataType,
  serializedAssetObject: SpriteObjectDataType,
  assetShortHeader?: ?AssetShortHeader
) => {
  const { scaleX, scaleY } = evaluateImageScale(
    project,
    PixiResourcesLoader,
    serializedObject,
    serializedAssetObject,
    assetShortHeader
  );
  const objectPreScale = serializedObject.preScale || 1;
  const assetPreScale = objectPreScale / Math.sqrt(scaleX * scaleY);
  return assetPreScale > 0.5 &&
    Math.abs(Math.round(assetPreScale) - assetPreScale) < 0.001
    ? Math.round(assetPreScale)
    : assetPreScale;
};

const scalePoint = function<P: { x: number, y: number }>(
  point: P,
  scaleX: number,
  scaleY: number
): P {
  return {
    ...point,
    x: point.x * scaleX,
    y: point.y * scaleY,
  };
};

const mergeSpriteFrame = (
  project: gdProject,
  PixiResourcesLoader: any,
  objectFrame: SpriteFrameData,
  assetFrame: SpriteFrameData,
  scaleX: number,
  scaleY: number
): SpriteFrameData => {
  return {
    ...assetFrame,
    originPoint: scalePoint(objectFrame.originPoint, scaleX, scaleY),
    centerPoint: scalePoint(objectFrame.centerPoint, scaleX, scaleY),
    points: objectFrame.points.map(point => scalePoint(point, scaleX, scaleY)),
  };
};

const mergeSpriteAnimation = (
  project: gdProject,
  PixiResourcesLoader: any,
  objectAnimation: SpriteAnimationData,
  assetAnimation: SpriteAnimationData,
  scaleX: number,
  scaleY: number
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
            project,
            PixiResourcesLoader,
            objectDirection.sprites[0],
            frame,
            scaleX,
            scaleY
          )
        ),
      },
    ],
  };
};

const mergeSpriteAnimations = (
  project: gdProject,
  PixiResourcesLoader: any,
  objectAnimations: Array<SpriteAnimationData>,
  assetAnimations: Array<SpriteAnimationData>,
  scaleX: number,
  scaleY: number
) =>
  mergeAnimations<SpriteAnimationData>(
    project,
    PixiResourcesLoader,
    objectAnimations,
    assetAnimations,
    (project, PixiResourcesLoader, objectAnimation, assetAnimation) =>
      mergeSpriteAnimation(
        project,
        PixiResourcesLoader,
        objectAnimation,
        assetAnimation,
        scaleX,
        scaleY
      )
  );

const mergeModel3DAnimation = (
  project: gdProject,
  PixiResourcesLoader: any,
  objectsAnimation,
  assetAnimation
) => assetAnimation;

const mergeModel3DAnimations = (
  project: gdProject,
  PixiResourcesLoader: any,
  objectAnimations: Array<{ name: string }>,
  assetAnimations: Array<{ name: string }>
) =>
  mergeAnimations<{ name: string }>(
    project,
    PixiResourcesLoader,
    objectAnimations,
    assetAnimations,
    mergeModel3DAnimation
  );

export const swapAsset = (
  project: gdProject,
  PixiResourcesLoader: any,
  object: gdObject,
  assetObject: gdObject,
  assetShortHeader?: ?AssetShortHeader
) => {
  const serializedObject = serializeToJSObject(object);
  const serializedAssetObject = serializeToJSObject(assetObject);

  if (object.getType() === 'Sprite') {
    serializedObject.preScale = evaluatePreScale(
      project,
      PixiResourcesLoader,
      serializedObject,
      serializedAssetObject,
      assetShortHeader
    );
    const { scaleX, scaleY } = evaluateImageScale(
      project,
      PixiResourcesLoader,
      serializedObject,
      serializedAssetObject,
      assetShortHeader
    );
    serializedObject.animations = mergeSpriteAnimations(
      project,
      PixiResourcesLoader,
      serializedObject.animations,
      serializedAssetObject.animations,
      scaleX,
      scaleY
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
        project,
        PixiResourcesLoader,
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
    serializedObject.assetStoreId = serializedAssetObject.assetStoreId;
  }
  unserializeFromJSObject(object, serializedObject, 'unserializeFrom', project);
};
