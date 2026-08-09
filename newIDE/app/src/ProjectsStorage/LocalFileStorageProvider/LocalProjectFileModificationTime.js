// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH } from '../../EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog';
import { MULTI_FILE_ENTRY_NAME } from '../MultiFileProjectFormat';
import { PROJECT_SETTINGS_CATALOG_RELATIVE_PATH } from '../ProjectSourceCatalog';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

const multiFileProjectDirectories = ['scenes', 'externals', 'extensions'];
const multiFileProjectRootFiles = [MULTI_FILE_ENTRY_NAME, 'resources.settings'];
const multiFileProjectExtensions = new Set(['.settings', '.events']);

const getFileModificationTime = async (filePath: string): Promise<?number> => {
  try {
    const stats = await fs.stat(filePath);
    return stats.isFile() ? stats.mtimeMs : null;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `Unable to read the modification time of project file "${filePath}":`,
        error
      );
    }
    return null;
  }
};

const getFileModificationTimeSync = (filePath: string): ?number => {
  try {
    const stats = fs.statSync(filePath);
    return stats.isFile() ? stats.mtimeMs : null;
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `Unable to read the modification time of project file "${filePath}":`,
        error
      );
    }
    return null;
  }
};

const getLatestProjectFileModificationTimeInDirectory = async (
  directoryPath: string
): Promise<?number> => {
  let entries;
  try {
    entries = await fs.readdir(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `Unable to inspect local project directory "${directoryPath}":`,
        error
      );
    }
    return null;
  }

  let latestModificationTime = null;
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    let modificationTime = null;
    if (entry.isDirectory()) {
      modificationTime = await getLatestProjectFileModificationTimeInDirectory(
        entryPath
      );
    } else if (
      entry.isFile() &&
      multiFileProjectExtensions.has(path.extname(entry.name).toLowerCase())
    ) {
      modificationTime = await getFileModificationTime(entryPath);
    }

    if (
      typeof modificationTime === 'number' &&
      (typeof latestModificationTime !== 'number' ||
        modificationTime > latestModificationTime)
    ) {
      latestModificationTime = modificationTime;
    }
  }
  return latestModificationTime;
};

const getLatestProjectFileModificationTimeInDirectorySync = (
  directoryPath: string
): ?number => {
  let entries;
  try {
    entries = fs.readdirSync(directoryPath, { withFileTypes: true });
  } catch (error) {
    if (error.code !== 'ENOENT') {
      console.warn(
        `Unable to inspect local project directory "${directoryPath}":`,
        error
      );
    }
    return null;
  }

  let latestModificationTime = null;
  for (const entry of entries) {
    const entryPath = path.join(directoryPath, entry.name);
    let modificationTime = null;
    if (entry.isDirectory()) {
      modificationTime = getLatestProjectFileModificationTimeInDirectorySync(
        entryPath
      );
    } else if (
      entry.isFile() &&
      multiFileProjectExtensions.has(path.extname(entry.name).toLowerCase())
    ) {
      modificationTime = getFileModificationTimeSync(entryPath);
    }

    if (
      typeof modificationTime === 'number' &&
      (typeof latestModificationTime !== 'number' ||
        modificationTime > latestModificationTime)
    ) {
      latestModificationTime = modificationTime;
    }
  }
  return latestModificationTime;
};

const getMultiFileProjectPathsToInspect = (projectRoot: string) => [
  ...multiFileProjectRootFiles.map(fileName =>
    path.join(projectRoot, fileName)
  ),
  path.join(
    projectRoot,
    ...PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
  ),
  path.join(projectRoot, ...PROJECT_SETTINGS_CATALOG_RELATIVE_PATH.split('/')),
];

const getLatestModificationTime = (
  modificationTimes: Array<?number>
): ?number =>
  modificationTimes.reduce<?number>(
    (latestModificationTime, modificationTime) =>
      typeof modificationTime === 'number' &&
      (typeof latestModificationTime !== 'number' ||
        modificationTime > latestModificationTime)
        ? modificationTime
        : latestModificationTime,
    null
  );

/**
 * Returns the newest modification time among files that make up a local
 * project. Resource files are deliberately excluded: they have their own
 * watcher and should not force a full project reload. Constants is also
 * excluded because its editor writes constants.toml independently from the
 * project save lifecycle.
 */
export const getLocalProjectLastModifiedDate = async (
  fileIdentifier: string
): Promise<?number> => {
  if (!fs || !path || !fileIdentifier) return null;

  if (path.basename(fileIdentifier).toLowerCase() !== MULTI_FILE_ENTRY_NAME) {
    return getFileModificationTime(fileIdentifier);
  }

  const projectRoot = path.dirname(fileIdentifier);
  const pathsToInspect = getMultiFileProjectPathsToInspect(projectRoot);
  const modificationTimes = await Promise.all([
    ...pathsToInspect.map(getFileModificationTime),
    ...multiFileProjectDirectories.map(directoryName =>
      getLatestProjectFileModificationTimeInDirectory(
        path.join(projectRoot, directoryName)
      )
    ),
  ]);

  return getLatestModificationTime(modificationTimes);
};

/**
 * Synchronous counterpart used by reload_project after its synchronous catalog
 * writes. Keeping this final acknowledgement on the same execution path avoids
 * stranding the reload on a filesystem callback that is never delivered.
 */
export const getLocalProjectLastModifiedDateSync = (
  fileIdentifier: string
): ?number => {
  if (!fs || !path || !fileIdentifier) return null;

  if (path.basename(fileIdentifier).toLowerCase() !== MULTI_FILE_ENTRY_NAME) {
    return getFileModificationTimeSync(fileIdentifier);
  }

  const projectRoot = path.dirname(fileIdentifier);
  return getLatestModificationTime([
    ...getMultiFileProjectPathsToInspect(projectRoot).map(
      getFileModificationTimeSync
    ),
    ...multiFileProjectDirectories.map(directoryName =>
      getLatestProjectFileModificationTimeInDirectorySync(
        path.join(projectRoot, directoryName)
      )
    ),
  ]);
};
