// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import PromisePool from '@supercharge/promise-pool';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type FileMetadata } from '../index';
import { extractFilenameFromProjectResourceUrl } from '../../Utils/GDevelopServices/Project';
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

type Options = {|
  project: gdProject,
  fileMetadata: FileMetadata,
  onProgress: (number, number) => void,
|};

export const moveUrlResourcesToLocalFiles = async ({
  project,
  fileMetadata,
  onProgress,
}: Options) => {
  if (!fs || !ipcRenderer) throw new Error('Unsupported');

  // Get all resources to download.
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  const resourceToFetchNames = allResourceNames.filter(resourceName => {
    const resource = resourcesManager.getResource(resourceName);

    return isFetchableUrl(resource.getFile());
  });

  const projectPath = path.dirname(fileMetadata.fileIdentifier);
  const baseAssetsPath = path.join(projectPath, 'assets');
  const downloadedFilePaths = new Set<string>();
  const erroredResources = [];

  let fetchedResourcesCount = 0;

  await PromisePool.withConcurrency(50)
    .for(resourceToFetchNames)
    .process(async resourceName => {
      const resource = resourcesManager.getResource(resourceName);

      const url = resource.getFile();
      const filename = extractFilenameFromProjectResourceUrl(url);
      const extension = path.extname(filename);
      const basename = path.basename(filename, extension);
      const pathPrefix = path.join(baseAssetsPath, resource.getKind());
      const newBasename = newNameGenerator(basename, tentativeBasename => {
        const tentativePath = path.join(pathPrefix, tentativeBasename) + extension;
        return (
          fs.existsSync(tentativePath) || downloadedFilePaths.has(tentativePath)
        );
      });
      const newPath = path.join(pathPrefix, newBasename) + extension;
      downloadedFilePaths.add(newPath);

      try {
        await retryIfFailed({ times: 2 }, async () => {
          await fs.ensureDir(pathPrefix);
          await ipcRenderer.invoke('local-file-download', url, newPath);
          resource.setFile(
            path.relative(projectPath, newPath).replace(/\\/g, '/')
          );
        });
      } catch (error) {
        erroredResources.push({ resourceName, error });
      }

      onProgress(fetchedResourcesCount++, resourceToFetchNames.length);
    });

  return {
    erroredResources,
  };
};
