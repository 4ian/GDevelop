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
  extractFilenameFromProjectResourceUrl,
  extractProjectUuidFromProjetResourceUrl,
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
    filename: string,
  |};

  const newCloudProjectId = newFileMetadata.fileIdentifier;

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
      .map(
        (resourceName: string): ?ResourceToFetchAndUpload => {
          const resource = resourcesManager.getResource(resourceName);
          const resourceFile = resource.getFile();

          if (isURL(resourceFile)) {
            if (checkIfIsGDevelopCloudBucketUrl(resourceFile)) {
              if (
                extractProjectUuidFromProjetResourceUrl(resourceFile) ===
                newCloudProjectId
              ) {
                // Somehow the resource is *already* stored in the new project - surely because
                // the project resources were partially moved (like when you click "Retry" after some failures
                // when saving a project as a new cloud project).
                // Just ignore this resource which is already moved then.
                return null;
              }

              return {
                resource,
                url: resourceFile,
                filename: extractFilenameFromProjectResourceUrl(resourceFile),
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
        }
      )
      .filter(Boolean);
  };

  const resourcesToFetchAndUpload = getResourcesToFetchAndUpload(project);

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
    onProgress: (count, total) => {
      onProgress(count, total * 2);
    },
  });

  // Transform Blobs into Files.
  const result: MoveAllProjectResourcesResult = {
    erroredResources: [],
  };
  const downloadedFilesAndResourcesToUpload = downloadedBlobsAndResourcesToUpload
    .map(({ item, blob, error }) => {
      if (error || !blob) {
        result.erroredResources.push({
          resourceName: item.resource.getName(),
          error: error || new Error('Unknown error during download.'),
        });
        return null;
      }

      return {
        resource: item.resource,
        file: new File([blob], item.filename, { type: blob.type }),
      };
    })
    .filter(Boolean);

  // Upload the files just downloaded, for the new project.
  await getCredentialsForCloudProject(authenticatedUser, newCloudProjectId);
  const uploadedProjectResourceFiles: UploadedProjectResourceFiles = await uploadProjectResourceFiles(
    authenticatedUser,
    newCloudProjectId,
    downloadedFilesAndResourcesToUpload.map(({ file }) => file),
    (count, total) => {
      onProgress(total + count, total * 2);
    }
  );

  // Update resources with the newly created URLs.
  uploadedProjectResourceFiles.forEach(({ url, error }, index) => {
    const resource = downloadedFilesAndResourcesToUpload[index].resource;
    console.log({
      url,
      error,
      resourceName: resource.getName(),
    });
    if (error || !url) {
      result.erroredResources.push({
        resourceName: resource.getName(),
        error: error || new Error('Unknown error during upload.'),
      });
      return;
    }

    resource.setFile(url);
  });

  return result;
};

const moveNothing = () => {
  return {
    erroredResources: [],
  };
};

const movers: {
  [string]: MoveAllProjectResourcesFunction,
} = {
  [`${CloudStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveAllCloudProjectResourcesToCloudProject,
  [`${UrlStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: (options: MoveAllProjectResourcesOptions) => {
    // Ensure urls are accessible, and do nothing else.
    console.log(
      'TODO - once save as it used for project creation: ensure urls are accessible, and do nothing else.'
    );
    return {
      erroredResources: [],
    };
  },
  // Saving to "DownloadFile" will *not* change any resources, as it's a
  // "temporary save" that is made and given to the user.
  [`${CloudStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: moveNothing,
  [`${UrlStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: moveNothing,
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
