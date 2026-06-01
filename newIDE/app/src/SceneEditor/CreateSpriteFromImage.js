// @flow
import newNameGenerator from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire';
import {
  applyResourceDefaults,
  copyAllToProjectFolder,
  isPathInProjectFolder,
} from '../ResourcesList/ResourceUtils';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');

const supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];

const getProjectFolder = (project: gdProject): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error(
      'The project must be saved locally before importing images.'
    );
  }
  return path.dirname(projectFile);
};

export const isSupportedImageFilePath = (filePath: string): boolean => {
  if (!path || !filePath) return false;
  return supportedImageExtensions.includes(
    path.extname(filePath).toLowerCase()
  );
};

export const getSupportedImageFilePaths = (
  filePaths: Array<string>
): Array<string> => filePaths.filter(isSupportedImageFilePath);

export const getImageFilePathsFromDataTransfer = (
  dataTransfer: ?DataTransfer | any
): Array<string> => {
  if (!dataTransfer || !dataTransfer.files) return [];
  const filePaths = [];
  for (let i = 0; i < dataTransfer.files.length; i++) {
    const file = dataTransfer.files[i];
    if (file && typeof file.path === 'string') {
      filePaths.push(file.path);
    }
  }
  return getSupportedImageFilePaths(filePaths);
};

const getSafeObjectBaseName = (imageFilePath: string): string => {
  if (!path) return 'Sprite';
  const extension = path.extname(imageFilePath);
  const baseName = path.basename(imageFilePath, extension);
  return gd.Project.getSafeName(baseName) || 'Sprite';
};

const getUniqueProjectFilePath = ({
  project,
  baseName,
  extension,
}: {|
  project: gdProject,
  baseName: string,
  extension: string,
|}): string => {
  if (!fs || !path) throw new Error('File system is not available.');
  const projectFolder = getProjectFolder(project);
  const safeBaseName = gd.Project.getSafeName(baseName) || baseName || 'Image';
  const uniqueBaseName = newNameGenerator(safeBaseName, tentativeName =>
    fs.existsSync(path.join(projectFolder, tentativeName + extension))
  );
  return path.join(projectFolder, uniqueBaseName + extension);
};

export const writeClipboardImageToProjectFolder = ({
  project,
  imageBuffer,
}: {|
  project: gdProject,
  imageBuffer: Buffer,
|}): string => {
  if (!fs) throw new Error('File system is not available.');
  const imageFilePath = getUniqueProjectFilePath({
    project,
    baseName: 'PastedImage',
    extension: '.png',
  });
  fs.writeFileSync(imageFilePath, imageBuffer);
  return imageFilePath;
};

const addDefaultFrameToSpriteObject = (
  object: gdObject,
  resourceName: string
) => {
  const spriteConfiguration = gd.asSpriteConfiguration(
    object.getConfiguration()
  );
  const sprite = new gd.Sprite();
  sprite.setImageName(resourceName);

  const animation = new gd.Animation();
  animation.setDirectionsCount(1);
  animation.getDirection(0).addSprite(sprite);
  spriteConfiguration.getAnimations().addAnimation(animation);

  sprite.delete();
  animation.delete();
};

const addImageResource = ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFolder = getProjectFolder(project);
  const resourcesManager = project.getResourcesManager();
  const relativeResourceFile = path
    .relative(projectFolder, imageFilePath)
    .replace(/\\/g, '/');
  const extension = path.extname(relativeResourceFile);
  const resourceNameBase = relativeResourceFile.slice(
    0,
    relativeResourceFile.length - extension.length
  );
  const resourceName =
    newNameGenerator(resourceNameBase, tentativeName =>
      resourcesManager.hasResource(tentativeName + extension)
    ) + extension;

  const imageResource = new gd.ImageResource();
  imageResource.setFile(relativeResourceFile);
  imageResource.setName(resourceName);
  applyResourceDefaults(project, imageResource);
  resourcesManager.addResource(imageResource);
  imageResource.delete();
  return resourceName;
};

export const ensureImageFileIsInProjectFolder = async ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): Promise<string> => {
  if (isPathInProjectFolder(project, imageFilePath)) return imageFilePath;

  const newToOldFilePaths = new Map();
  const copiedFilePaths = await copyAllToProjectFolder(
    project,
    [imageFilePath],
    newToOldFilePaths
  );
  return copiedFilePaths[0] || imageFilePath;
};

export const createSpriteObjectFromImageFile = async ({
  project,
  objectsContainer,
  imageFilePath,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  imageFilePath: string,
|}): Promise<gdObject> => {
  const localImageFilePath = await ensureImageFileIsInProjectFolder({
    project,
    imageFilePath,
  });
  const resourceName = addImageResource({
    project,
    imageFilePath: localImageFilePath,
  });
  const objectName = newNameGenerator(
    getSafeObjectBaseName(localImageFilePath),
    tentativeName => objectsContainer.hasObjectNamed(tentativeName)
  );
  const object = objectsContainer.insertNewObject(
    project,
    'Sprite',
    objectName,
    objectsContainer.getObjectsCount()
  );
  addDefaultFrameToSpriteObject(object, resourceName);
  return object;
};

export const createSpriteObjectsFromImageFiles = async ({
  project,
  objectsContainer,
  imageFilePaths,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  imageFilePaths: Array<string>,
|}): Promise<Array<gdObject>> => {
  const supportedImageFilePaths = getSupportedImageFilePaths(imageFilePaths);
  const objects = [];
  for (const imageFilePath of supportedImageFilePaths) {
    objects.push(
      await createSpriteObjectFromImageFile({
        project,
        objectsContainer,
        imageFilePath,
      })
    );
  }
  return objects;
};
