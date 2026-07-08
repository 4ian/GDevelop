// @flow
import newNameGenerator from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';
import { getProjectFilePathFromDataTransfer } from '../Utils/ProjectFileDragData';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const electronClipboard = electron ? electron.clipboard : null;
const electronWebUtils = electron ? electron.webUtils : null;

const supportedImageExtensions = ['.png', '.jpg', '.jpeg', '.webp'];
const assetsFolderName = 'assets';

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

const getAssetsFolder = (project: gdProject): string => {
  if (!path) throw new Error('Path module is not available.');
  return path.join(getProjectFolder(project), assetsFolderName);
};

const ensureAssetsFolderExists = (project: gdProject): string => {
  if (!fs) throw new Error('File system is not available.');
  const assetsFolder = getAssetsFolder(project);
  fs.mkdirSync(assetsFolder, { recursive: true });
  return assetsFolder;
};

const isPathInAssetsFolder = (
  project: gdProject,
  filePath: string
): boolean => {
  if (!path) throw new Error('Path module is not available.');
  const assetsFolder = path.resolve(getAssetsFolder(project));
  const resolvedFilePath = path.resolve(filePath);
  const relativeFilePath = path.relative(assetsFolder, resolvedFilePath);
  return (
    relativeFilePath === '' ||
    (!!relativeFilePath &&
      !relativeFilePath.startsWith('..') &&
      !path.isAbsolute(relativeFilePath))
  );
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

const getLocalPathFromNativeFile = (file: any, webUtils: any): ?string => {
  if (!file) return null;
  if (typeof file.path === 'string' && file.path) return file.path;

  if (webUtils && typeof webUtils.getPathForFile === 'function') {
    try {
      const filePath = webUtils.getPathForFile(file);
      return typeof filePath === 'string' && filePath ? filePath : null;
    } catch (error) {
      return null;
    }
  }

  return null;
};

export const getImageFilePathsFromDataTransfer = (
  dataTransfer: ?DataTransfer | any,
  webUtils: any = electronWebUtils
): Array<string> => {
  if (!dataTransfer) return [];
  const filePaths = [];
  const projectFilePath = getProjectFilePathFromDataTransfer(dataTransfer);
  if (projectFilePath) filePaths.push(projectFilePath);

  if (dataTransfer.files) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      const filePath = getLocalPathFromNativeFile(file, webUtils);
      if (filePath) filePaths.push(filePath);
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
  const assetsFolder = ensureAssetsFolderExists(project);
  const uniqueBaseName = newNameGenerator(baseName || 'Image', tentativeName =>
    fs.existsSync(path.join(assetsFolder, tentativeName + extension))
  );
  return path.join(assetsFolder, uniqueBaseName + extension);
};

export const writeClipboardImageToProjectFolder = ({
  project,
  imageBuffer,
}: {|
  project: gdProject,
  imageBuffer: any,
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

export const hasClipboardImage = (
  clipboard: any = electronClipboard
): boolean => {
  if (!clipboard) return false;

  try {
    const image = clipboard.readImage();
    return !!image && !image.isEmpty();
  } catch (error) {
    return false;
  }
};

export const writeImageFromClipboardToProjectFolder = (
  project: gdProject
): ?string => {
  if (!electronClipboard || !hasClipboardImage(electronClipboard)) return null;

  const image = electronClipboard.readImage();
  return writeClipboardImageToProjectFolder({
    project,
    imageBuffer: image.toPNG(),
  });
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

const ensureImageFileIsInAssetsFolder = async ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): Promise<string> => {
  if (!fs || !path) throw new Error('File system is not available.');
  if (isPathInAssetsFolder(project, imageFilePath)) return imageFilePath;

  const extension = path.extname(imageFilePath);
  const imageFilePathInAssetsFolder = getUniqueProjectFilePath({
    project,
    baseName: path.basename(imageFilePath, extension),
    extension,
  });

  return new Promise((resolve, reject) => {
    fs.copyFile(imageFilePath, imageFilePathInAssetsFolder, error => {
      if (error) return reject(error);
      resolve(imageFilePathInAssetsFolder);
    });
  });
};

export const addImageFileToProjectResources = async ({
  project,
  imageFilePath,
}: {|
  project: gdProject,
  imageFilePath: string,
|}): Promise<string> => {
  const localImageFilePath = await ensureImageFileIsInAssetsFolder({
    project,
    imageFilePath,
  });
  return addImageResource({
    project,
    imageFilePath: localImageFilePath,
  });
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
  const localImageFilePath = await ensureImageFileIsInAssetsFolder({
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
