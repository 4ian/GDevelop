// @flow
// Asset Database (initial): ensure each local resource has a stable GUID
// stored both in resource metadata and a .meta file next to the asset.
import optionalRequire from '../Utils/OptionalRequire';
import { isURL, updateResourceJsonMetadata } from './ResourceUtils';

const fs = optionalRequire('fs');
const path = optionalRequire('path');

export const ASSET_META_VERSION = 1;
export const RESOURCE_GUID_METADATA_KEY = 'gdevelopAssetGuid';

const ASSET_META_EXTENSION = '.meta';
const guidIndexByProjectPtr: { [number]: Map<string, string> } = {};
const IGNORED_FOLDER_NAMES = new Set([
  '.git',
  'node_modules',
  'build',
  'dist',
  'out',
  '.cache',
  'tmp',
  'temp',
]);

type AssetMetaFile = {|
  version: number,
  guid: string,
|};

const generateGuid = (): string => {
  // RFC4122-ish v4 UUID.
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
};

const readMetaFile = async (metaFilePath: string): Promise<?AssetMetaFile> => {
  if (!fs || !fs.promises || !fs.promises.readFile) return null;
  try {
    const raw = await fs.promises.readFile(metaFilePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (
      parsed &&
      typeof parsed === 'object' &&
      typeof parsed.guid === 'string'
    ) {
      return {
        version:
          typeof parsed.version === 'number' ? parsed.version : ASSET_META_VERSION,
        guid: parsed.guid,
      };
    }
  } catch (error) {
    return null;
  }
  return null;
};

const writeMetaFile = async (
  metaFilePath: string,
  meta: AssetMetaFile
): Promise<void> => {
  if (!fs || !fs.promises || !fs.promises.writeFile) return;
  const content = JSON.stringify(meta, null, 2);
  await fs.promises.writeFile(metaFilePath, content);
};

const getResourceGuidFromMetadata = (resource: gdResource): ?string => {
  const metadataAsString = resource.getMetadata();
  if (!metadataAsString) return null;
  try {
    const metadata = JSON.parse(metadataAsString);
    const guid = metadata && metadata[RESOURCE_GUID_METADATA_KEY];
    return typeof guid === 'string' && guid ? guid : null;
  } catch (error) {
    return null;
  }
};

const normalizePath = (value: string): string => value.replace(/\\/g, '/');

const resolveResourceAbsolutePath = (
  projectFolderPath: string,
  resourceFilePath: string
): ?string => {
  if (!path) return null;
  if (!resourceFilePath) return null;
  const normalizedPath = resourceFilePath.replace(/^file:\/\//, '');
  return path.isAbsolute(normalizedPath)
    ? normalizedPath
    : path.resolve(projectFolderPath, normalizedPath);
};

const isPathInsideProject = (
  projectFolderPath: string,
  absoluteFilePath: string
): boolean => {
  if (!path) return false;
  const relative = path.relative(projectFolderPath, absoluteFilePath);
  if (!relative) return false;
  return !relative.startsWith('..') && !path.isAbsolute(relative);
};

const ensureResourceGuid = async (
  resource: gdResource,
  projectFolderPath: string
): Promise<?string> => {
  if (!fs || !path) return null;
  const resourceFilePath = resource.getFile();
  if (!resourceFilePath || isURL(resourceFilePath)) return null;

  const absoluteFilePath = resolveResourceAbsolutePath(
    projectFolderPath,
    resourceFilePath
  );
  if (!absoluteFilePath) return null;
  if (!isPathInsideProject(projectFolderPath, absoluteFilePath)) return null;
  if (!fs.existsSync(absoluteFilePath)) {
    const guidFromMetadata = getResourceGuidFromMetadata(resource);
    return guidFromMetadata || null;
  }

  const metaFilePath = absoluteFilePath + ASSET_META_EXTENSION;
  const existingMeta = await readMetaFile(metaFilePath);
  const guidFromMeta = existingMeta ? existingMeta.guid : null;
  const guidFromMetadata = getResourceGuidFromMetadata(resource);

  const guid = guidFromMeta || guidFromMetadata || generateGuid();
  if (guid !== guidFromMetadata) {
    updateResourceJsonMetadata(resource, {
      [RESOURCE_GUID_METADATA_KEY]: guid,
    });
  }

  if (!guidFromMeta || (existingMeta && existingMeta.guid !== guid)) {
    await writeMetaFile(metaFilePath, {
      version: ASSET_META_VERSION,
      guid,
    });
  }

  return guid;
};

const collectMetaFiles = async (
  rootFolderPath: string
): Promise<Array<string>> => {
  if (!fs || !fs.promises) return [];

  const metaFiles = [];
  const stack = [rootFolderPath];

  while (stack.length) {
    const currentDir = stack.pop();
    if (!currentDir) continue;

    let entries;
    try {
      entries = await fs.promises.readdir(currentDir, { withFileTypes: true });
    } catch (error) {
      // Fallback for environments without "withFileTypes".
      try {
        entries = await fs.promises.readdir(currentDir);
      } catch (secondError) {
        continue;
      }
    }

    for (let i = 0; i < entries.length; i++) {
      const entry = entries[i];
      const entryName = typeof entry === 'string' ? entry : entry.name;
      if (!entryName) continue;
      const entryPath = path.join(currentDir, entryName);
      let isDirectory = false;
      if (typeof entry !== 'string') {
        isDirectory = entry.isDirectory ? entry.isDirectory() : false;
      } else if (fs.statSync) {
        isDirectory = fs.statSync(entryPath).isDirectory();
      }

      if (isDirectory) {
        if (IGNORED_FOLDER_NAMES.has(entryName)) continue;
        stack.push(entryPath);
        continue;
      }

      if (entryName.endsWith(ASSET_META_EXTENSION)) {
        metaFiles.push(entryPath);
      }
    }
  }

  return metaFiles;
};

const buildGuidToRelativePathMap = async (
  projectFolderPath: string
): Promise<Map<string, string>> => {
  if (!fs || !path) return new Map();
  const metaFiles = await collectMetaFiles(projectFolderPath);
  const guidToPath = new Map();

  for (let i = 0; i < metaFiles.length; i++) {
    const metaFilePath = metaFiles[i];
    const meta = await readMetaFile(metaFilePath);
    if (!meta || !meta.guid) continue;

    const absoluteAssetPath = metaFilePath.slice(
      0,
      -ASSET_META_EXTENSION.length
    );
    const relativePath = normalizePath(
      path.relative(projectFolderPath, absoluteAssetPath)
    );
    if (!relativePath || relativePath.startsWith('..')) continue;

    const existing = guidToPath.get(meta.guid);
    if (!existing) {
      guidToPath.set(meta.guid, relativePath);
      continue;
    }

    const existingAbsolute = path.resolve(projectFolderPath, existing);
    const existingExists = fs.existsSync(existingAbsolute);
    const candidateExists = fs.existsSync(absoluteAssetPath);
    if (!existingExists && candidateExists) {
      guidToPath.set(meta.guid, relativePath);
    }
  }

  return guidToPath;
};

const setProjectGuidIndex = (
  project: gdProject,
  guidToPath: Map<string, string>
) => {
  guidIndexByProjectPtr[project.ptr] = guidToPath;
};

export const getRelativePathForGuid = (
  project: gdProject,
  guid: string
): ?string => {
  const guidToPath = guidIndexByProjectPtr[project.ptr];
  if (!guidToPath) return null;
  return guidToPath.get(guid) || null;
};

export const getResourceGuidFromResource = (
  resource: gdResource
): ?string => getResourceGuidFromMetadata(resource);

export const ensureResourceGuidInMetadata = (
  resource: gdResource
): string => {
  const existingGuid = getResourceGuidFromMetadata(resource);
  if (existingGuid) return existingGuid;
  const guid = generateGuid();
  updateResourceJsonMetadata(resource, {
    [RESOURCE_GUID_METADATA_KEY]: guid,
  });
  return guid;
};

export const refreshProjectAssetGuidIndex = async (
  project: gdProject,
  projectFolderPath: string
): Promise<Map<string, string>> => {
  const guidToPath = await buildGuidToRelativePathMap(projectFolderPath);
  setProjectGuidIndex(project, guidToPath);
  return guidToPath;
};

const relinkResourcesFromGuidIndex = async (
  project: gdProject,
  projectFolderPath: string,
  guidToPath: Map<string, string>
): Promise<Array<string>> => {
  if (!fs || !path) return [];
  if (!guidToPath.size) return [];

  const resourcesManager = project.getResourcesManager();
  const resourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const updatedResourceNames = [];

  for (let i = 0; i < resourceNames.length; i++) {
    const resourceName = resourceNames[i];
    if (!resourcesManager.hasResource(resourceName)) continue;
    const resource = resourcesManager.getResource(resourceName);
    const guid = getResourceGuidFromMetadata(resource);
    if (!guid) continue;

    const targetRelativePath = guidToPath.get(guid);
    if (!targetRelativePath) continue;

    const currentPath = resource.getFile();
    if (isURL(currentPath)) continue;

    const normalizedCurrentPath = normalizePath(currentPath || '');
    if (normalizedCurrentPath === targetRelativePath) continue;

    const targetAbsolutePath = path.resolve(
      projectFolderPath,
      targetRelativePath
    );
    if (!fs.existsSync(targetAbsolutePath)) continue;

    resource.setFile(targetRelativePath);
    updatedResourceNames.push(resourceName);
  }

  return updatedResourceNames;
};

export const ensureProjectResourcesHaveGuids = async (
  project: gdProject,
  options?: {|
    projectFilePath?: ?string,
    shouldWriteMetaFiles?: boolean,
  |}
): Promise<void> => {
  if (!project) return;
  const projectFilePath =
    (options && options.projectFilePath) || project.getProjectFile();
  if (!projectFilePath) return;
  if (options && options.shouldWriteMetaFiles === false) return;
  if (!fs || !path) return;

  const projectFolderPath = path.dirname(projectFilePath);
  const guidToPath = await refreshProjectAssetGuidIndex(
    project,
    projectFolderPath
  );
  await relinkResourcesFromGuidIndex(project, projectFolderPath, guidToPath);
  const resourcesManager = project.getResourcesManager();
  const resourceNames = resourcesManager.getAllResourceNames().toJSArray();

  for (let i = 0; i < resourceNames.length; i++) {
    const resourceName = resourceNames[i];
    if (!resourcesManager.hasResource(resourceName)) continue;
    const resource = resourcesManager.getResource(resourceName);
    await ensureResourceGuid(resource, projectFolderPath);
  }
};
