// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import PromisePool from '@supercharge/promise-pool';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type FileMetadata } from '../index';
import {
  extractFilenameAndExtensionFromProductAuthorizedUrl,
  isProductAuthorizedResourceUrl,
} from '../../Utils/GDevelopServices/Shop';
import {
  extractFilenameAndExtensionFromPublicAssetResourceUrl,
  isPublicAssetResourceUrl,
} from '../../Utils/GDevelopServices/Asset';
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
      let extension;
      let filenameWithoutExtension;
      if (isProductAuthorizedResourceUrl(url)) {
        // Resource is a private asset.
        const result = extractFilenameAndExtensionFromProductAuthorizedUrl(url);
        extension = result.extension;
        filenameWithoutExtension = result.filenameWithoutExtension;
      } else if (isPublicAssetResourceUrl(url)) {
        // Resource is a public asset.
        const result = extractFilenameAndExtensionFromPublicAssetResourceUrl(
          url
        );
        extension = result.extension;
        filenameWithoutExtension = result.filenameWithoutExtension;
      } else {
        // Resource is a generic url.
        extension = path.extname(url);
        filenameWithoutExtension = path.basename(url, extension);
      }
      const name = newNameGenerator(filenameWithoutExtension, name => {
        const tentativePath = path.join(baseAssetsPath, name) + extension;
        return (
          fs.existsSync(tentativePath) || downloadedFilePaths.has(tentativePath)
        );
      });
      const downloadedFilePath = path.join(baseAssetsPath, name) + extension;
      downloadedFilePaths.add(downloadedFilePath);

      try {
        await retryIfFailed({ times: 2 }, async () => {
          await fs.ensureDir(baseAssetsPath);
          await ipcRenderer.invoke(
            'local-file-download',
            url,
            downloadedFilePath
          );
          resource.setFile(
            path.relative(projectPath, downloadedFilePath).replace(/\\/g, '/')
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
