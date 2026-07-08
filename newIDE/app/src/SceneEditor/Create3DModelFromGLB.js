// @flow
import newNameGenerator from '../Utils/NewNameGenerator';
import optionalRequire from '../Utils/OptionalRequire';
import { applyResourceDefaults } from '../ResourcesList/ResourceUtils';
import {
  getActiveProjectFileDragPath,
  getProjectFilePathFromDataTransfer,
} from '../Utils/ProjectFileDragData';

const gd: libGDevelop = global.gd;
const fs = optionalRequire('fs');
const path = optionalRequire('path');
const electron = optionalRequire('electron');
const electronWebUtils = electron ? electron.webUtils : null;

const supported3DModelExtensions = ['.glb'];
const assetsFolderName = 'assets';

const getProjectFolder = (project: gdProject): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFile = project.getProjectFile();
  if (!projectFile) {
    throw new Error(
      'The project must be saved locally before importing 3D models.'
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

export const isSupported3DModelFilePath = (filePath: string): boolean => {
  if (!path || !filePath) return false;
  return supported3DModelExtensions.includes(
    path.extname(filePath).toLowerCase()
  );
};

export const getSupported3DModelFilePaths = (
  filePaths: Array<string>
): Array<string> => filePaths.filter(isSupported3DModelFilePath);

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

export const get3DModelFilePathsFromDataTransfer = (
  dataTransfer: ?DataTransfer | any,
  webUtils: any = electronWebUtils
): Array<string> => {
  const filePaths = [];
  const activeProjectFileDragPath = getActiveProjectFileDragPath();
  if (activeProjectFileDragPath) filePaths.push(activeProjectFileDragPath);

  if (!dataTransfer) {
    return Array.from(new Set(getSupported3DModelFilePaths(filePaths)));
  }

  const projectFilePath = getProjectFilePathFromDataTransfer(dataTransfer);
  if (projectFilePath) filePaths.push(projectFilePath);

  if (dataTransfer.files) {
    for (let i = 0; i < dataTransfer.files.length; i++) {
      const file = dataTransfer.files[i];
      const filePath = getLocalPathFromNativeFile(file, webUtils);
      if (filePath) filePaths.push(filePath);
    }
  }
  return Array.from(new Set(getSupported3DModelFilePaths(filePaths)));
};

const getSafeObjectBaseName = (modelFilePath: string): string => {
  if (!path) return 'Model3D';
  const extension = path.extname(modelFilePath);
  const baseName = path.basename(modelFilePath, extension);
  return gd.Project.getSafeName(baseName) || 'Model3D';
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
  const uniqueBaseName = newNameGenerator(
    baseName || 'Model3D',
    tentativeName =>
      fs.existsSync(path.join(assetsFolder, tentativeName + extension))
  );
  return path.join(assetsFolder, uniqueBaseName + extension);
};

const add3DModelResource = ({
  project,
  modelFilePath,
}: {|
  project: gdProject,
  modelFilePath: string,
|}): string => {
  if (!path) throw new Error('Path module is not available.');
  const projectFolder = getProjectFolder(project);
  const resourcesManager = project.getResourcesManager();
  const relativeResourceFile = path
    .relative(projectFolder, modelFilePath)
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

  const model3DResource = new gd.Model3DResource();
  model3DResource.setFile(relativeResourceFile);
  model3DResource.setName(resourceName);
  applyResourceDefaults(project, model3DResource);
  resourcesManager.addResource(model3DResource);
  model3DResource.delete();
  return resourceName;
};

const ensure3DModelFileIsInAssetsFolder = async ({
  project,
  modelFilePath,
}: {|
  project: gdProject,
  modelFilePath: string,
|}): Promise<string> => {
  if (!fs || !path) throw new Error('File system is not available.');
  if (isPathInAssetsFolder(project, modelFilePath)) return modelFilePath;

  const extension = path.extname(modelFilePath);
  const modelFilePathInAssetsFolder = getUniqueProjectFilePath({
    project,
    baseName: path.basename(modelFilePath, extension),
    extension,
  });

  return new Promise((resolve, reject) => {
    fs.copyFile(modelFilePath, modelFilePathInAssetsFolder, error => {
      if (error) return reject(error);
      resolve(modelFilePathInAssetsFolder);
    });
  });
};

export const add3DModelFileToProjectResources = async ({
  project,
  modelFilePath,
}: {|
  project: gdProject,
  modelFilePath: string,
|}): Promise<string> => {
  const localModelFilePath = await ensure3DModelFileIsInAssetsFolder({
    project,
    modelFilePath,
  });
  return add3DModelResource({
    project,
    modelFilePath: localModelFilePath,
  });
};

export const create3DModelObjectFromGLBFile = async ({
  project,
  objectsContainer,
  modelFilePath,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  modelFilePath: string,
|}): Promise<gdObject> => {
  const localModelFilePath = await ensure3DModelFileIsInAssetsFolder({
    project,
    modelFilePath,
  });
  const resourceName = add3DModelResource({
    project,
    modelFilePath: localModelFilePath,
  });
  const objectName = newNameGenerator(
    getSafeObjectBaseName(localModelFilePath),
    tentativeName => objectsContainer.hasObjectNamed(tentativeName)
  );
  const object = objectsContainer.insertNewObject(
    project,
    'Scene3D::Model3DObject',
    objectName,
    objectsContainer.getObjectsCount()
  );
  const model3DConfiguration = gd.asModel3DConfiguration(
    object.getConfiguration()
  );
  model3DConfiguration.updateProperty('modelResourceName', resourceName);
  return object;
};

export const create3DModelObjectsFromGLBFiles = async ({
  project,
  objectsContainer,
  modelFilePaths,
}: {|
  project: gdProject,
  objectsContainer: gdObjectsContainer,
  modelFilePaths: Array<string>,
|}): Promise<Array<gdObject>> => {
  const supported3DModelFilePaths = getSupported3DModelFilePaths(
    modelFilePaths
  );
  const objects = [];
  for (const modelFilePath of supported3DModelFilePaths) {
    objects.push(
      await create3DModelObjectFromGLBFile({
        project,
        objectsContainer,
        modelFilePath,
      })
    );
  }
  return objects;
};
