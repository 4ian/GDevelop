// @flow
import {
  type ResourceMover,
  type MoveAllProjectResourcesOptions,
  type MoveAllProjectResourcesResult,
  type MoveAllProjectResourcesFunction,
} from './index';
import CloudStorageProvider from '../CloudStorageProvider';
import UrlStorageProvider from '../UrlStorageProvider';
import DownloadFileStorageProvider from '../DownloadFileStorageProvider';
import {
  getCredentialsForCloudProject,
  type UploadedProjectResourceFiles,
  uploadProjectResourceFiles,
} from '../../Utils/GDevelopServices/Project';

import { checkIfIsGDevelopCloudBucketUrl } from '../../Utils/CrossOrigin';
import {
  downloadUrlsToBlobs,
  type ItemResult,
} from '../../Utils/BlobDownloader';

const isURL = (filename: string) => {
  return (
    filename.startsWith('http://') ||
    filename.startsWith('https://') ||
    filename.startsWith('ftp://') ||
    filename.startsWith('blob:') ||
    filename.startsWith('data:')
  );
};

const isBlobURL = (filename: string) => {
  return filename.startsWith('blob:');
};

const moveAllCloudProjectResourcesToCloudProject = async ({
  project,
  authenticatedUser,
  oldFileMetadata,
  newFileMetadata,
  oldStorageProvider,
  oldStorageProviderOperations,
  newStorageProvider,
  newStorageProviderOperations,
  onProgress,
}: MoveAllProjectResourcesOptions): Promise<MoveAllProjectResourcesResult> => {
  type ResourceToFetchAndUpload = {|
    resource: gdResource,
    url: string,
  |};

  /**
   * Find the resources stored on GDevelop Cloud that must be downloaded and
   * uploaded into the new project.
   */
  const getResourcesToFetchAndUpload = (
    project: gdProject
  ): Array<ResourceToFetchAndUpload> => {
    const resourcesManager = project.getResourcesManager();
    const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
    return allResourceNames
      .map(resourceName => {
        const resource = resourcesManager.getResource(resourceName);
        const resourceFile = resource.getFile();

        if (isURL(resourceFile)) {
          if (checkIfIsGDevelopCloudBucketUrl(resourceFile)) {
            return {
              resource,
              url: resourceFile,
            };
          } else if (isBlobURL(resourceFile)) {
            throw new Error('Unsupported blob files for cloud projects.');
          } else {
            // Public URL resource: nothing to do.
            return null;
          }
        } else {
          // Local resource: unsupported.
          throw new Error('Unsupported local files for cloud projects.');
        }
      })
      .filter(Boolean);
  };

  const resourcesToFetchAndUpload = getResourcesToFetchAndUpload(project);
  console.log({ resourcesToFetchAndUpload });

  // If an error happens here, it will be thrown out of the function.
  if (oldStorageProviderOperations.onEnsureCanAccessResources)
    oldStorageProviderOperations.onEnsureCanAccessResources(
      project,
      oldFileMetadata
    );

  // Download all the project resources as blob (much like what is done during an export).
  const downloadedBlobsAndResourcesToUpload: Array<
    ItemResult<ResourceToFetchAndUpload>
  > = await downloadUrlsToBlobs({
    urlContainers: resourcesToFetchAndUpload,
    onProgress,
  });

  // Transform Blobs into Files.
  const result: MoveAllProjectResourcesResult = {
    erroredResources: [],
  };
  const downloadedFilesAndResourcesToUpload = downloadedBlobsAndResourcesToUpload
    .map(({ item, blob, error }) => {
      if (error || !blob) {
        result.erroredResources.push({
          resource: item.resource,
          error: error || new Error('Unknown error during download.'),
        });
        return null;
      }

      return {
        resource: item.resource,
        file: new File([blob], 'TODO', { type: 'todo' }),
      };
    })
    .filter(Boolean);

  // Upload the files just downloaded, for the new project.
  const cloudProjectId = newFileMetadata.fileIdentifier;
  await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
  const uploadedProjectResourceFiles: UploadedProjectResourceFiles = await uploadProjectResourceFiles(
    authenticatedUser,
    cloudProjectId,
    downloadedFilesAndResourcesToUpload.map(({ file }) => file)
  );

  // Update resources with the newly created URLs.
  uploadedProjectResourceFiles.forEach(({ url, error }, index) => {
    const resource = downloadedFilesAndResourcesToUpload[index].resource;
    if (error || !url) {
      result.erroredResources.push({
        resource,
        error: error || new Error('Unknown error during upload.'),
      });
      return;
    }

    resource.setFile(url);
  });

  return result;
};

const movers: {
  [string]: MoveAllProjectResourcesFunction,
} = {
  [`${CloudStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveAllCloudProjectResourcesToCloudProject,
  [`${CloudStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: (options: MoveAllProjectResourcesOptions) => {
    // Download everything as a blob.
    console.log('TODO: Download everything as a blob.');
    return {
      erroredResources: [],
    };
  },
  [`${UrlStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: (options: MoveAllProjectResourcesOptions) => {
    // Ensure urls are accessible, and do nothing else.
    console.log('TODO: Ensure urls are accessible, and do nothing else.');
    return {
      erroredResources: [],
    };
  },
  [`${UrlStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: (options: MoveAllProjectResourcesOptions) => {
    // Ensure urls are accessible, and do nothing else.
    console.log('TODO: Ensure urls are accessible, and do nothing else.');
    return {
      erroredResources: [],
    };
  },
};

const BrowserResourceMover: ResourceMover = {
  moveAllProjectResources: async (
    options: MoveAllProjectResourcesOptions
  ): Promise<MoveAllProjectResourcesResult> => {
    const { oldStorageProvider, newStorageProvider } = options;
    const mover =
      movers[
        `${oldStorageProvider.internalName}=>${newStorageProvider.internalName}`
      ];
    if (!mover)
      throw new Error(
        `Can't find a ResourceMover for ${oldStorageProvider.internalName} to ${
          newStorageProvider.internalName
        }.`
      );

    return mover(options);
  },
};

export default BrowserResourceMover;
