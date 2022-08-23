// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type ResourceFetcher, type FetchResourcesArgs } from '.';
import PromisePool from '@supercharge/promise-pool';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

const isFetchableUrl = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://')
  );
};

/**
 * On the desktop app, try to download all URLs into local files, put
 * next to the project file (in a "assets" directory). This is helpful
 * to continue working on a game started on the web-app (using public URLs
 * for resources).
 */
const getResourcesToFetch = (project: gdProject): Array<string> => {
  const resourcesManager = project.getResourcesManager();

  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  return allResourceNames.filter(resourceName => {
    const resource = resourcesManager.getResource(resourceName);

    return isFetchableUrl(resource.getFile());
  });
};

const fetchResources = async ({
  project,
  resourceNames,
  onProgress,
}: FetchResourcesArgs) => {
  if (!fs || !ipcRenderer) throw new Error('Unsupported');
  const resourcesManager = project.getResourcesManager();

  const projectPath = path.dirname(project.getProjectFile());
  const baseAssetsPath = path.join(projectPath, 'assets');
  const downloadedFilePaths = new Set<string>();
  const erroredResources = [];
  const fetchedResources = [];

  let fetchedResourcesCount = 0;
  const resourcesToFetch = getResourcesToFetch(project);

  return PromisePool.withConcurrency(50)
    .for(resourceNames)
    .process(async resourceName => {
      const resource = resourcesManager.getResource(resourceName);

      const url = resource.getFile();
      const extension = path.extname(url);
      const filenameWithoutExtension = path.basename(url, extension);
      const name = newNameGenerator(filenameWithoutExtension, name => {
        const tentativePath = path.join(baseAssetsPath, name) + extension;
        return (
          fs.existsSync(tentativePath) || downloadedFilePaths.has(tentativePath)
        );
      });
      const newPath = path.join(baseAssetsPath, name) + extension;
      downloadedFilePaths.add(newPath);

      try {
        await retryIfFailed({ times: 2 }, async () => {
          await fs.ensureDir(baseAssetsPath);
          await ipcRenderer.invoke('local-file-download', url, newPath);
          resource.setFile(
            path.relative(projectPath, newPath).replace(/\\/g, '/')
          );
          fetchedResources.push({ resourceName });
        });
      } catch (error) {
        erroredResources.push({ resourceName, error });
      }

      onProgress(fetchedResourcesCount++, resourcesToFetch.length);
    })
    .then(() => ({
      fetchedResources,
      erroredResources,
    }));
};

// TODO: This is the ResourceFetcher of LocalFileStorageProvider.
export const LocalResourceFetcher: ResourceFetcher = {
  getResourcesToFetch,
  fetchResources,
};
