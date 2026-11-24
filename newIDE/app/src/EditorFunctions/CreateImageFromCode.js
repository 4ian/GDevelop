// @flow
import * as React from 'react';
import { Trans } from '@lingui/macro';
import { SafeExtractor } from '../Utils/SafeExtractor';
import newNameGenerator from '../Utils/NewNameGenerator';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';
import { getMatchingCollisionMask } from '../ObjectEditor/Editors/SpriteEditor/CollisionMasksEditor/CollisionMaskHelper';
import { setCollisionMaskOnAllFrames } from '../ObjectEditor/Editors/SpriteEditor/Utils/SpriteObjectHelper';
import { type EditorFunction } from './index';
import { makeGenericFailure } from './Utils';
import {
  OBJECTS_SCOPE_TYPES,
  complyVariantsAfterStructuralEdit,
  getNamedVariantRejection,
  getOutsideEditorChangesTarget,
  getReadOnlyRejection,
  getScopeObjectsContainer,
  resolveScopeFromArgs,
} from './Scope';
import { rasterizeSvgToPng } from './SvgRasterizer';

const gd: libGDevelop = global.gd;

const MAX_IMAGE_SIDE = 4096;
const OBJECT_TYPES = [
  'Sprite',
  'TiledSpriteObject::TiledSprite',
  'PanelSpriteObject::PanelSprite',
];
const ROOT_TAG_PATTERN = /<svg\b[^>]*>/i;

// What could run code or load a file from outside of the SVG: it would not
// be in the image, or would make the browser refuse to draw it.
const REMOVALS: Array<[RegExp, string, string]> = [
  [/<script\b[\s\S]*?(<\/script\s*>|\/>)/gi, '<script>', ''],
  [
    /<foreignObject\b[\s\S]*?(<\/foreignObject\s*>|\/>)/gi,
    '<foreignObject>',
    '',
  ],
  [
    /<image\b(?![^>]*href\s*=\s*["']data:)[^>]*?(\/>|>[\s\S]*?<\/image\s*>)/gi,
    '<image> of a file or URL',
    '',
  ],
  [
    /\son[a-z]+\s*=\s*("[^"]*"|'[^']*')/gi,
    'event handler attribute (on...)',
    '',
  ],
  [
    /\s(xlink:)?href\s*=\s*["'](?!#|data:)[^"']*["']/gi,
    'link to an external file (href)',
    '',
  ],
  [/@import[^;]*;?/gi, 'CSS @import', ''],
  [
    /url\(\s*(["']?)(?!#|data:)[^)]*\)/gi,
    'url(...) of an external file',
    'none',
  ],
];

const readSize = (rootTag: string): [number, number] | null => {
  const readPixels = (name: string): number | null => {
    const match = rootTag.match(
      new RegExp(`\\s${name}\\s*=\\s*["']\\s*([0-9.]+)\\s*(px)?\\s*["']`, 'i')
    );
    return match ? parseFloat(match[1]) : null;
  };
  const width = readPixels('width');
  const height = readPixels('height');
  if (width && height) return [width, height];
  const viewBox = rootTag.match(
    /\sviewBox\s*=\s*["']\s*[-0-9.e]+[\s,]+[-0-9.e]+[\s,]+([0-9.e]+)[\s,]+([0-9.e]+)\s*["']/i
  );
  return viewBox ? [parseFloat(viewBox[1]), parseFloat(viewBox[2])] : null;
};

/**
 * Reads the size of a standalone SVG and removes what could run code or load
 * a file. Throws an error explaining what to fix when it can't be drawn.
 */
const prepareSvg = (
  source: string
): {|
  svg: string,
  width: number,
  height: number,
  removedFeatures: Array<string>,
|} => {
  const rootTag = (source.match(ROOT_TAG_PATTERN) || [''])[0];
  if (!rootTag)
    throw new Error(
      'No <svg> element: give a standalone SVG, like <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 64 64">...</svg>.'
    );
  const size = readSize(rootTag);
  if (!size)
    throw new Error(
      'The <svg> has no width and height in pixels: set width="..." height="..." (the size of the image).'
    );
  const [width, height] = size.map(Math.round);
  if (
    !(width >= 1 && height >= 1) ||
    width > MAX_IMAGE_SIDE ||
    height > MAX_IMAGE_SIDE
  )
    throw new Error(
      `The SVG is ${width}x${height} pixels: each side must be between 1 and ${MAX_IMAGE_SIDE}.`
    );

  let svg = source;
  const removedFeatures = [];
  REMOVALS.forEach(([pattern, description, replacement]) => {
    const matches = svg.match(pattern);
    if (!matches) return;
    removedFeatures.push(`${matches.length} ${description}`);
    svg = svg.replace(pattern, replacement);
  });
  // An explicit size in pixels makes the browser draw it at that size.
  svg = svg.replace(ROOT_TAG_PATTERN, tag => {
    const tagWithoutSize = tag.replace(
      /\s(width|height)\s*=\s*("[^"]*"|'[^']*')/gi,
      ''
    );
    const namespace = /\sxmlns\s*=/.test(tagWithoutSize)
      ? ''
      : ' xmlns="http://www.w3.org/2000/svg"';
    return tagWithoutSize.replace(
      /^<svg\b/i,
      `<svg${namespace} width="${width}" height="${height}"`
    );
  });
  return { svg, width, height, removedFeatures };
};

const getOpaqueCollisionMask = async (
  imageUrl: string
): Promise<gdVectorPolygon2d | null> => {
  try {
    return await getMatchingCollisionMask(imageUrl);
  } catch (error) {
    return null;
  }
};

const setObjectImage = ({
  object,
  resourceName,
  width,
  height,
  collisionMask,
}: {|
  object: gdObject,
  resourceName: string,
  width: number,
  height: number,
  collisionMask: gdVectorPolygon2d | null,
|}) => {
  const configuration = object.getConfiguration();
  if (object.getType() === 'Sprite') {
    const animations = gd.asSpriteConfiguration(configuration).getAnimations();
    const animation = new gd.Animation();
    if (animations.getAnimationsCount())
      animation.setName(animations.getAnimation(0).getName());
    animation.setDirectionsCount(1);
    const sprite = new gd.Sprite();
    sprite.setImageName(resourceName);
    animation.getDirection(0).addSprite(sprite);
    animations.removeAllAnimations();
    animations.addAnimation(animation);
    sprite.delete();
    animation.delete();
    setCollisionMaskOnAllFrames(animations, collisionMask);
    return;
  }
  const texturedObject =
    object.getType() === 'PanelSpriteObject::PanelSprite'
      ? gd.asPanelSpriteConfiguration(configuration)
      : gd.asTiledSpriteConfiguration(configuration);
  texturedObject.setTexture(resourceName);
  texturedObject.setWidth(width);
  texturedObject.setHeight(height);
};

export const createImageFromCode: EditorFunction = {
  renderForEditor: ({ args }) => {
    const objectName = SafeExtractor.extractStringProperty(args, 'object_name');
    return {
      text: objectName ? (
        <Trans>Draw the object {objectName}.</Trans>
      ) : (
        <Trans>Draw an image.</Trans>
      ),
    };
  },
  launchFunction: async ({
    project,
    args,
    attachmentsForResources,
    onObjectsModifiedOutsideEditor,
  }) => {
    const svgSource = SafeExtractor.extractStringProperty(args, 'svg');
    const objectName = SafeExtractor.extractStringProperty(args, 'object_name');
    const objectType =
      SafeExtractor.extractStringProperty(args, 'object_type') || 'Sprite';
    const shouldReplaceExistingObject = !!SafeExtractor.extractBooleanProperty(
      args,
      'replace_existing_object'
    );
    if (!svgSource)
      return makeGenericFailure(
        '`svg` is required: a standalone SVG whose width and height (in pixels) are the size of the image. Nothing was created.'
      );
    if (!OBJECT_TYPES.includes(objectType))
      return makeGenericFailure(
        `\`object_type\` must be one of ${OBJECT_TYPES.join(
          ', '
        )}. Nothing was created.`
      );

    let target = null;
    if (objectName) {
      if (!gd.Project.isNameSafe(objectName))
        return makeGenericFailure(
          `"${objectName}" is not a valid object name (letters, digits and _, not starting with a digit). Nothing was created.`
        );
      const resolvedScope = resolveScopeFromArgs(project, args, {
        allowedTypes: OBJECTS_SCOPE_TYPES,
      });
      if (resolvedScope.success === false)
        return makeGenericFailure(
          `${resolvedScope.message} Nothing was created.`
        );
      const rejection =
        getReadOnlyRejection(resolvedScope) ||
        getNamedVariantRejection(resolvedScope);
      if (rejection) return makeGenericFailure(rejection.message);
      const objects = getScopeObjectsContainer(resolvedScope);
      const globalObjects = resolvedScope.globalObjectsContainer;
      const existingObject = objects.hasObjectNamed(objectName)
        ? objects.getObject(objectName)
        : globalObjects && globalObjects.hasObjectNamed(objectName)
        ? globalObjects.getObject(objectName)
        : null;
      if (existingObject && !shouldReplaceExistingObject)
        return makeGenericFailure(
          `An object "${objectName}" already exists (${existingObject.getType()}): it was kept unchanged. Set \`replace_existing_object\` to true to give it the image, or use another \`object_name\`. Nothing was created.`
        );
      if (existingObject && existingObject.getType() !== objectType)
        return makeGenericFailure(
          `The object "${objectName}" is a ${existingObject.getType()}, not a ${objectType}: use another \`object_name\`. Nothing was created.`
        );
      target = { resolvedScope, objects, existingObject, objectName };
    }

    let preparedSvg, png;
    try {
      preparedSvg = prepareSvg(svgSource);
      png = await rasterizeSvgToPng(
        preparedSvg.svg,
        preparedSvg.width,
        preparedSvg.height
      );
    } catch (error) {
      return makeGenericFailure(`${error.message} Nothing was created.`);
    }
    const { width, height, removedFeatures } = preparedSvg;

    const resourcesManager = project.getResourcesManager();
    const resourceName =
      newNameGenerator(objectName || 'image', name =>
        resourcesManager.hasResource(name + '.png')
      ) + '.png';
    const blobUrl = URL.createObjectURL(png);
    const resource = new gd.ImageResource();
    resource.setName(resourceName);
    resource.setFile(blobUrl);
    applyResourceDefaults(project, resource);
    resourcesManager.addResource(resource);
    resource.delete();
    const collisionMask =
      target && objectType === 'Sprite'
        ? await getOpaqueCollisionMask(blobUrl)
        : null;

    const storage = await attachmentsForResources.storeResourceFiles();
    const isFileStored =
      storage === 'stored' &&
      resourcesManager.getResource(resourceName).getFile() !== blobUrl;
    if (
      storage === 'project-not-saved' ||
      (storage === 'stored' && !isFileStored)
    ) {
      resourcesManager.removeResource(resourceName);
      URL.revokeObjectURL(blobUrl);
      if (collisionMask) collisionMask.delete();
      return makeGenericFailure(
        storage === 'project-not-saved'
          ? 'The image was not added: the project must be saved (in the cloud) to store it, and the user did not save it. Nothing was created. Stop and ask the user to save their project, then try again.'
          : 'The image could not be stored in the project. Nothing was created.'
      );
    }
    if (isFileStored) URL.revokeObjectURL(blobUrl);

    let message = `Created the image resource "${resourceName}" (${width}×${height} px)`;
    if (target) {
      const { resolvedScope, objects, existingObject, objectName } = target;
      const isNewObjectTypeUsed =
        !existingObject &&
        !gd.UsedObjectTypeFinder.scanProject(project, objectType);
      const object =
        existingObject ||
        objects.insertNewObject(
          project,
          objectType,
          objectName,
          objects.getObjectsCount()
        );
      setObjectImage({ object, resourceName, width, height, collisionMask });
      const { eventsBasedObject, eventsFunctionsExtension } = resolvedScope;
      if (!existingObject && eventsBasedObject && eventsFunctionsExtension) {
        complyVariantsAfterStructuralEdit(project, resolvedScope);
        gd.WholeProjectRefactorer.ensureObjectEventsFunctionsProperParameters(
          eventsFunctionsExtension,
          eventsBasedObject
        );
      }
      onObjectsModifiedOutsideEditor({
        ...getOutsideEditorChangesTarget(resolvedScope),
        isNewObjectTypeUsed,
      });
      message += existingObject
        ? ` and set it as the image of the existing object "${objectName}" (${objectType}) in ${
            resolvedScope.label
          }.`
        : ` and the object "${objectName}" (${objectType}) using it in ${
            resolvedScope.label
          }.`;
    } else {
      message += '.';
    }
    if (collisionMask) collisionMask.delete();
    if (removedFeatures.length)
      message += ` Removed from the SVG (the image must be self-contained): ${removedFeatures.join(
        ', '
      )}.`;
    if (storage === 'stored-when-project-is-saved')
      message +=
        ' The project is not saved yet: the image will be stored in it when it is saved.';
    return { success: true, message };
  },
  modifiesProject: true,
};
