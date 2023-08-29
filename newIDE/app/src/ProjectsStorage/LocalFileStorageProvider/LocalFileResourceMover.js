// @flow
import optionalRequire from '../../Utils/OptionalRequire';
import PromisePool from '@supercharge/promise-pool';
import { retryIfFailed } from '../../Utils/RetryIfFailed';
import newNameGenerator from '../../Utils/NewNameGenerator';
import { type FileMetadata } from '../index';
import {
  extractFilenameWithExtensionFromProductAuthorizedUrl,
  getAuthorizationTokenForPrivateGameTemplates,
  isPrivateGameTemplateResourceAuthorizedUrl,
  isProductAuthorizedResourceUrl,
} from '../../Utils/GDevelopServices/Shop';
import {
  extractFilenameWithExtensionFromPublicAssetResourceUrl,
  isPublicAssetResourceUrl,
} from '../../Utils/GDevelopServices/Asset';
import {
  isBlobURL,
  isURL,
  parseLocalFilePathOrExtensionFromMetadata,
} from '../../ResourcesList/ResourceUtils';
import { sanitizeFilename } from '../../Utils/Filename';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { extractFilenameFromProjectResourceUrl } from '../../Utils/GDevelopServices/Project';
import axios from 'axios';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;
const fs = optionalRequire('fs-extra');
const path = optionalRequire('path');

type Options = {|
  project: gdProject,
  fileMetadata: FileMetadata,
  onProgress: (number, number) => void,
  authenticatedUser: AuthenticatedUser,
|};

const generateUnusedFilepath = (
  basePath: string,
  alreadyUsedFilePaths: Set<string>,
  filename: string
) => {
  const extension = path.extname(filename);
  const filenameWithoutExtension = path.basename(filename, extension);
  const name = newNameGenerator(filenameWithoutExtension, name => {
    const tentativePath = path.join(basePath, name) + extension;
    return (
      fs.existsSync(tentativePath) || alreadyUsedFilePaths.has(tentativePath)
    );
  });
  return path.join(basePath, name) + extension;
};

const downloadBlobToLocalFile = async (
  blobUrl: string,
  filePath: string
): Promise<void> => {
  if (!ipcRenderer) throw new Error('Not supported');

  const response = await axios.get(blobUrl, {
    responseType: 'arraybuffer',
  });
  const arrayBuffer = response.data;

  await ipcRenderer.invoke(
    'local-file-save-from-arraybuffer',
    arrayBuffer,
    filePath
  );
};

export const moveUrlResourcesToLocalFiles = async ({
  project,
  fileMetadata,
  onProgress,
  authenticatedUser,
}: Options) => {
  if (!fs || !ipcRenderer) throw new Error('Unsupported');

  // Get all resources to download.
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  let tokenForPrivateGameTemplateAuthorization = null;
  let isFetchingGameTemplateAuthorizedResources = false;
  const resourceToFetchNames = [];
  for (const resourceName of allResourceNames) {
    const resource = resourcesManager.getResource(resourceName);
    const resourcePath = resource.getFile();
    if (isURL(resourcePath)) {
      resourceToFetchNames.push(resourceName);
      if (isPrivateGameTemplateResourceAuthorizedUrl(resourcePath)) {
        isFetchingGameTemplateAuthorizedResources = true;
      }
    }
  }
  if (isFetchingGameTemplateAuthorizedResources) {
    const userId = authenticatedUser.profile && authenticatedUser.profile.id;
    if (!userId) {
      throw new Error(
        'Can not fetch resources from a private game template without being authenticated.'
      );
    }
    tokenForPrivateGameTemplateAuthorization = await getAuthorizationTokenForPrivateGameTemplates(
      authenticatedUser.getAuthorizationHeader,
      { userId }
    );
  }

  const projectPath = path.dirname(fileMetadata.fileIdentifier);
  const baseAssetsPath = path.join(projectPath, 'assets');
  const downloadedFilePaths = new Set<string>();
  const erroredResources = [];

  console.log('allResourceNames', allResourceNames);
  console.log('projectPath', projectPath);

  let fetchedResourcesCount = 0;

  await PromisePool.withConcurrency(50)
    .for(resourceToFetchNames)
    .process(async resourceName => {
      const resource = resourcesManager.getResource(resourceName);

      const url = resource.getFile();
      if (isBlobURL(url)) {
        try {
          const {
            localFilePath,
            extension,
          } = parseLocalFilePathOrExtensionFromMetadata(resource);
          const downloadedFilePath = localFilePath
            ? path.resolve(projectPath, localFilePath)
            : generateUnusedFilepath(
                baseAssetsPath,
                downloadedFilePaths,
                sanitizeFilename(resource.getName() + (extension || ''))
              );

          await fs.ensureDir(baseAssetsPath);
          await downloadBlobToLocalFile(url, downloadedFilePath);
          resource.setFile(
            path.relative(projectPath, downloadedFilePath).replace(/\\/g, '/')
          );
        } catch (error) {
          erroredResources.push({ resourceName, error });
        }
      } else {
        let filename;
        if (isProductAuthorizedResourceUrl(url)) {
          // Resource is coming from a private asset or private game template.
          filename = extractFilenameWithExtensionFromProductAuthorizedUrl(url);
        } else if (isPublicAssetResourceUrl(url)) {
          // Resource is coming from a public asset.
          filename = extractFilenameWithExtensionFromPublicAssetResourceUrl(
            url
          );
        } else {
          // Resource is a project resource or a generic url.
          filename = extractFilenameFromProjectResourceUrl(url);
        }

        // Find a new file for the resource to download.
        const downloadedFilePath = generateUnusedFilepath(
          baseAssetsPath,
          downloadedFilePaths,
          filename
        );
        downloadedFilePaths.add(downloadedFilePath);

        try {
          await retryIfFailed({ times: 2 }, async () => {
            await fs.ensureDir(baseAssetsPath);
            const resourceUrl = new URL(url);
            if (
              isPrivateGameTemplateResourceAuthorizedUrl(resourceUrl.href) &&
              tokenForPrivateGameTemplateAuthorization
            ) {
              resourceUrl.searchParams.set(
                'token',
                tokenForPrivateGameTemplateAuthorization
              );
            }
            const encodedUrl = resourceUrl.href; // Encode the URL to support special characters in file names.
            console.log('Downloading', encodedUrl, 'to', downloadedFilePath);
            await ipcRenderer.invoke(
              'local-file-download',
              encodedUrl,
              downloadedFilePath
            );
            resource.setFile(
              path.relative(projectPath, downloadedFilePath).replace(/\\/g, '/')
            );
          });
        } catch (error) {
          erroredResources.push({ resourceName, error });
        }
      }

      console.log('calling onProgress');
      onProgress(fetchedResourcesCount++, resourceToFetchNames.length);
    });

  console.log('finished, returning', erroredResources);

  return {
    erroredResources,
  };
};
