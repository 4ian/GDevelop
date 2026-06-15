// @flow
import { parseGIF, decompressFrames, type ParsedFrame } from 'gifuct-js';
import { applyResourceDefaults } from '../../../ResourcesList/ResourceUtils';
import newNameGenerator from '../../../Utils/NewNameGenerator';
import optionalRequire from '../../../Utils/OptionalRequire';
import { sanitizeFilename } from '../../../Utils/Filename';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const fsPromises = fs ? fs.promises : null;
const path = optionalRequire('path');

const assetsFolderName = 'assets';

export type ImportedRawGif = {|
  resourceName: string,
  frameCount: number,
  timeBetweenFrames: number,
|};

const getProjectFolder = (project: gdProject): string => {
  if (!path) {
    throw new Error('Path module is not available.');
  }

  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error('The project must be saved locally before importing GIFs.');
  }

  return path.dirname(projectFile);
};

const readLocalFileToArrayBuffer = async (
  filePath: string
): Promise<ArrayBuffer> => {
  if (!fsPromises) {
    throw new Error('File system is not available.');
  }

  const buffer: any = await fsPromises.readFile(filePath);
  return buffer.buffer.slice(
    buffer.byteOffset,
    buffer.byteOffset + buffer.byteLength
  );
};

const getBaseName = (gifFilePath: string): string => {
  if (!path) return 'GifFrame';

  const rawBaseName = path.basename(gifFilePath, path.extname(gifFilePath));
  return sanitizeFilename(rawBaseName) || 'GifFrame';
};

const getUniqueGifFile = ({
  project,
  assetsFolder,
  baseName,
}: {|
  project: gdProject,
  assetsFolder: string,
  baseName: string,
|}): {| gifAssetFilePath: string, resourceName: string |} => {
  if (!fs || !path) {
    throw new Error('File system is not available.');
  }

  const resourcesManager = project.getResourcesManager();
  const uniqueGifBaseName = newNameGenerator(baseName, tentativeName => {
    const resourceName = `${assetsFolderName}/${tentativeName}.gif`;
    const gifAssetFilePath = path.join(assetsFolder, `${tentativeName}.gif`);
    return (
      resourcesManager.hasResource(resourceName) ||
      fs.existsSync(gifAssetFilePath)
    );
  });

  const resourceName = `${assetsFolderName}/${uniqueGifBaseName}.gif`;

  return {
    gifAssetFilePath: path.join(assetsFolder, `${uniqueGifBaseName}.gif`),
    resourceName,
  };
};

const getUniqueResourceName = ({
  project,
  resourceName,
}: {|
  project: gdProject,
  resourceName: string,
|}): string => {
  const resourcesManager = project.getResourcesManager();
  return newNameGenerator(resourceName, tentativeName => {
    return resourcesManager.hasResource(tentativeName);
  });
};

const createImageResource = ({
  project,
  resourceName,
  resourceFile,
}: {|
  project: gdProject,
  resourceName: string,
  resourceFile: string,
|}) => {
  const imageResource = new gd.ImageResource();
  imageResource.setFile(resourceFile);
  imageResource.setName(getUniqueResourceName({ project, resourceName }));
  applyResourceDefaults(project, imageResource);
  project.getResourcesManager().addResource(imageResource);
  const imageResourceName = imageResource.getName();
  imageResource.delete();

  return imageResourceName;
};

const getTimeBetweenFrames = (frames: Array<ParsedFrame>): number => {
  const validDelays = frames
    .map(frame => frame.delay)
    .filter(delay => Number.isFinite(delay) && delay > 0);

  if (!validDelays.length) return 0.1;

  const averageDelayInMilliseconds =
    validDelays.reduce((sum, delay) => sum + delay, 0) / validDelays.length;
  return Math.max(averageDelayInMilliseconds / 1000, 0.00001);
};

export const importRawGifToProjectResources = async ({
  project,
  gifFilePath,
}: {|
  project: gdProject,
  gifFilePath: string,
|}): Promise<ImportedRawGif> => {
  if (!fsPromises || !path) {
    throw new Error('GIF import is only available in the desktop app.');
  }

  const projectFolder = getProjectFolder(project);
  const assetsFolder = path.join(projectFolder, assetsFolderName);
  await fsPromises.mkdir(assetsFolder, { recursive: true });

  const gifArrayBuffer = await readLocalFileToArrayBuffer(gifFilePath);
  const parsedGif = parseGIF(gifArrayBuffer);
  const frames = decompressFrames(parsedGif, false);
  if (!frames.length) {
    throw new Error('No frames were found in this GIF.');
  }

  const baseName = getBaseName(gifFilePath);
  const { gifAssetFilePath, resourceName: gifResourceFile } = getUniqueGifFile({
    project,
    assetsFolder,
    baseName,
  });

  await fsPromises.copyFile(gifFilePath, gifAssetFilePath);

  const gifResourceName = createImageResource({
    project,
    resourceName: gifResourceFile,
    resourceFile: gifResourceFile,
  });

  return {
    resourceName: gifResourceName,
    frameCount: frames.length,
    timeBetweenFrames: getTimeBetweenFrames(frames),
  };
};
