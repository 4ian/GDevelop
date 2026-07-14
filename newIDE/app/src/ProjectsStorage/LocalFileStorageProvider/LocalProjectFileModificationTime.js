// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import { PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH } from '../../EventsSheet/IfDoEventsDsl/ProjectInstructionCatalog';
import {
  PROJECT_LAYOUT_CATALOG_RELATIVE_PATH,
  PROJECT_SETTINGS_CATALOG_RELATIVE_PATH,
} from '../ProjectSourceCatalog';

const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

const multiFileProjectDirectories = ['scenes', 'externals', 'extensions'];
const multiFileProjectRootFiles = [
  'project.settings',
  'static-data.toml',
  'resources.settings',
];
const multiFileProjectExtensions = new Set(['.settings', '.layout', '.events']);

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
      modificationTime !== null &&
      (latestModificationTime === null ||
        modificationTime > latestModificationTime)
    ) {
      latestModificationTime = modificationTime;
    }
  }
  return latestModificationTime;
};

/**
 * Returns the newest modification time among files that make up a local
 * project. Resource files are deliberately excluded: they have their own
 * watcher and should not force a full project reload.
 */
export const getLocalProjectLastModifiedDate = async (
  fileIdentifier: string
): Promise<?number> => {
  if (!fs || !path || !fileIdentifier) return null;

  if (path.basename(fileIdentifier).toLowerCase() !== 'project.settings') {
    return getFileModificationTime(fileIdentifier);
  }

  const projectRoot = path.dirname(fileIdentifier);
  const pathsToInspect = [
    ...multiFileProjectRootFiles.map(fileName =>
      path.join(projectRoot, fileName)
    ),
    path.join(
      projectRoot,
      ...PROJECT_INSTRUCTION_CATALOG_RELATIVE_PATH.split('/')
    ),
    path.join(
      projectRoot,
      ...PROJECT_SETTINGS_CATALOG_RELATIVE_PATH.split('/')
    ),
    path.join(projectRoot, ...PROJECT_LAYOUT_CATALOG_RELATIVE_PATH.split('/')),
  ];
  const modificationTimes = await Promise.all([
    ...pathsToInspect.map(getFileModificationTime),
    ...multiFileProjectDirectories.map(directoryName =>
      getLatestProjectFileModificationTimeInDirectory(
        path.join(projectRoot, directoryName)
      )
    ),
  ]);

  return modificationTimes.reduce<?number>(
    (latestModificationTime, modificationTime) =>
      modificationTime !== null &&
      (latestModificationTime === null ||
        modificationTime > latestModificationTime)
        ? modificationTime
        : latestModificationTime,
    null
  );
};
