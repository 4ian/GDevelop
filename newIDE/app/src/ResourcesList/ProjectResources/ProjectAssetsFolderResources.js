// @flow
import {
  allResourceKindsAndMetadata,
  type ResourceKind,
} from '../ResourceSource';
import optionalRequire from '../../Utils/OptionalRequire';

const fs = optionalRequire('fs');
const path = optionalRequire('path');

const normalizeSlashes = (filePath: string): string =>
  filePath.replace(/\\/g, '/');

const normalizeProjectResourcePath = (filePath: string): string =>
  normalizeSlashes(filePath).toLowerCase();

const isPathInsideFolder = (filePath: string, folderPath: string): boolean => {
  if (!path) return false;

  const relativePath = path.relative(folderPath, filePath);
  return (
    relativePath === '' ||
    (!!relativePath &&
      !relativePath.startsWith('..') &&
      !path.isAbsolute(relativePath))
  );
};

export const getFileExtensionsForResourceKind = (
  resourceKind: ResourceKind
): Array<string> => {
  const resourceKindMetadata = allResourceKindsAndMetadata.find(
    metadata => metadata.kind === resourceKind
  );
  return resourceKindMetadata ? resourceKindMetadata.fileExtensions : [];
};

export const isSupportedProjectAssetResourceFile = ({
  filePath,
  resourceKind,
}: {|
  filePath: string,
  resourceKind: ResourceKind,
|}): boolean => {
  if (!path) return false;

  const extension = path
    .extname(filePath)
    .replace('.', '')
    .toLowerCase();
  return getFileExtensionsForResourceKind(resourceKind).includes(extension);
};

const getResourceCreatorForKind = (resourceKind: ResourceKind) => {
  const resourceKindMetadata = allResourceKindsAndMetadata.find(
    metadata => metadata.kind === resourceKind
  );
  return resourceKindMetadata ? resourceKindMetadata.createNewResource : null;
};

export const createProjectAssetResourceFromFile = ({
  projectRootPath,
  resourceKind,
  filePath,
}: {|
  projectRootPath: string,
  resourceKind: ResourceKind,
  filePath: string,
|}): ?gdResource => {
  if (!path) return null;

  const createNewResource = getResourceCreatorForKind(resourceKind);
  if (!createNewResource) return null;

  const relativePath = normalizeSlashes(
    path.relative(projectRootPath, filePath)
  );
  const resource = createNewResource();
  resource.setName(relativePath);
  resource.setFile(relativePath);
  return resource;
};

export const createProjectAssetResourceFromResourceName = ({
  project,
  resourceKind,
  resourceName,
}: {|
  project: gdProject,
  resourceKind: ResourceKind,
  resourceName: string,
|}): ?gdResource => {
  if (!fs || !path || !resourceName) return null;

  const normalizedResourceName = normalizeSlashes(resourceName);
  if (
    path.isAbsolute(normalizedResourceName) ||
    normalizedResourceName === 'assets' ||
    !normalizedResourceName.startsWith('assets/')
  ) {
    return null;
  }

  const projectFile = project.getProjectFile();
  if (!projectFile) return null;

  const projectRootPath = path.dirname(projectFile);
  const assetFilePath = path.resolve(projectRootPath, normalizedResourceName);
  const assetsFolderPath = path.resolve(projectRootPath, 'assets');
  if (!isPathInsideFolder(assetFilePath, assetsFolderPath)) return null;

  if (
    !isSupportedProjectAssetResourceFile({
      filePath: assetFilePath,
      resourceKind,
    })
  ) {
    return null;
  }

  if (!fs.existsSync(assetFilePath)) return null;

  return createProjectAssetResourceFromFile({
    projectRootPath,
    resourceKind,
    filePath: assetFilePath,
  });
};

const readProjectAssetFiles = async ({
  assetsFolderPath,
  resourceKind,
}: {|
  assetsFolderPath: string,
  resourceKind: ResourceKind,
|}): Promise<Array<string>> => {
  if (!fs || !path) return [];

  let entries;
  try {
    entries = await fs.promises.readdir(assetsFolderPath, {
      withFileTypes: true,
    });
  } catch (error) {
    if (error && error.code === 'ENOENT') return [];
    throw error;
  }

  const assetFiles: Array<string> = [];
  for (const entry of entries) {
    const entryPath = path.join(assetsFolderPath, entry.name);

    if (entry.isDirectory()) {
      assetFiles.push(
        ...(await readProjectAssetFiles({
          assetsFolderPath: entryPath,
          resourceKind,
        }))
      );
      continue;
    }

    if (
      entry.isFile() &&
      isSupportedProjectAssetResourceFile({
        filePath: entryPath,
        resourceKind,
      })
    ) {
      assetFiles.push(entryPath);
    }
  }

  return assetFiles;
};

export const getProjectAssetsFolderResources = async ({
  project,
  resourceKind,
}: {|
  project: gdProject,
  resourceKind: ResourceKind,
|}): Promise<Array<gdResource>> => {
  if (!fs || !path) return [];

  const projectFile = project.getProjectFile();
  if (!projectFile) return [];

  const projectRootPath = path.dirname(projectFile);
  const assetsFolderPath = path.join(projectRootPath, 'assets');
  const assetFiles = await readProjectAssetFiles({
    assetsFolderPath,
    resourceKind,
  });

  const resourcesManager = project.getResourcesManager();
  const registeredResources = resourcesManager
    .getAllResourceNames()
    .toJSArray()
    .map(resourceName => resourcesManager.getResource(resourceName));
  const registeredResourceNames = new Set(
    registeredResources.map(resource => resource.getName())
  );
  const registeredResourceFiles = new Set(
    registeredResources.map(resource =>
      normalizeProjectResourcePath(resource.getFile())
    )
  );

  const projectAssetResources: Array<gdResource> = [];
  for (const filePath of assetFiles) {
    const resource = createProjectAssetResourceFromFile({
      projectRootPath,
      resourceKind,
      filePath,
    });
    if (!resource) continue;

    const resourceName = resource.getName();
    const resourceFile = normalizeProjectResourcePath(resource.getFile());
    if (
      registeredResourceNames.has(resourceName) ||
      registeredResourceFiles.has(resourceFile)
    ) {
      resource.delete();
      continue;
    }

    projectAssetResources.push(resource);
  }

  return projectAssetResources;
};
