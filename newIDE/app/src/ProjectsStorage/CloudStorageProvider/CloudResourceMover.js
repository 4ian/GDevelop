// @flow
import {
  type MoveAllProjectResourcesOptions,
  type MoveAllProjectResourcesResult,
} from '../ResourceMover';
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
import { type FileMetadata } from '../index';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

type ResourceToFetchAndUpload = {|
  resource: gdResource,
  url: string,
  filename: string,
|};

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

const isPrivateAssetUrl = (filename: string) => {
  return (
    filename.startsWith('https://private-assets-dev.gdevelop.io') ||
    filename.startsWith('https://private-assets.gdevelop.io')
  );
};

/**
 * Find the resources stored on GDevelop Cloud that must be downloaded and
 * uploaded into the new project.
 */
const getResourcesToFetchAndUpload = ({
  project,
  selectCondition,
  ignoreCondition,
  onError,
}: {|
  project: gdProject,
  selectCondition: string => boolean,
  ignoreCondition?: string => boolean,
  onError: (resourceName: string, errorMessage: string) => void,
|}): Array<ResourceToFetchAndUpload> => {
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  return allResourceNames
    .map(
      (resourceName: string): ?ResourceToFetchAndUpload => {
        const resource = resourcesManager.getResource(resourceName);
        const resourceFile = resource.getFile();

        if (isURL(resourceFile)) {
          if (selectCondition(resourceFile)) {
            if (ignoreCondition && ignoreCondition(resourceFile)) {
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
            onError(resource.getName(), 'Unsupported blob URL.');
            return null;
          } else {
            // Public URL resource: nothing to do.
            return null;
          }
        } else {
          // Local resource: unsupported.
          onError(resource.getName(), 'Unsupported relative file.');
          return null;
        }
      }
    )
    .filter(Boolean);
};

const uploadResourcesToCloud = async ({
  resourcesToFetchAndUpload,
  transformFilename,
  authenticatedUser,
  cloudProjectId,
  onProgress,
  onError,
}: {|
  resourcesToFetchAndUpload: Array<ResourceToFetchAndUpload>,
  transformFilename?: string => string,
  authenticatedUser: AuthenticatedUser,
  cloudProjectId: string,
  onProgress: (count: number, total: number) => void,
  onError: (resourceName: string, error: Error) => void,
|}) => {
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
  const downloadedFilesAndResourcesToUpload = downloadedBlobsAndResourcesToUpload
    .map(({ item, blob, error }) => {
      if (error || !blob) {
        onError(
          item.resource.getName(),
          error || new Error('Unknown error during download.')
        );
        return null;
      }

      const fileName = transformFilename
        ? transformFilename(item.filename)
        : item.filename;

      return {
        resource: item.resource,
        file: new File([blob], fileName, { type: blob.type }),
      };
    })
    .filter(Boolean);

  // Upload the files just downloaded, for the new project.
  await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
  const uploadedProjectResourceFiles: UploadedProjectResourceFiles = await uploadProjectResourceFiles(
    authenticatedUser,
    cloudProjectId,
    downloadedFilesAndResourcesToUpload.map(({ file }) => file),
    (count, total) => {
      onProgress(total + count, total * 2);
    }
  );

  // Update resources with the newly created URLs.
  uploadedProjectResourceFiles.forEach(({ url, error }, index) => {
    const resource = downloadedFilesAndResourcesToUpload[index].resource;
    if (error || !url) {
      onError(
        resource.getName(),
        error || new Error('Unknown error during upload.')
      );
      return;
    }

    resource.setFile(url);
  });
};

export const moveAllCloudProjectResourcesToCloudProject = async ({
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
  const result: MoveAllProjectResourcesResult = {
    erroredResources: [],
  };

  const newCloudProjectId = newFileMetadata.fileIdentifier;

  const resourcesToFetchAndUpload = getResourcesToFetchAndUpload({
    project,
    selectCondition: checkIfIsGDevelopCloudBucketUrl,
    ignoreCondition: fileName =>
      extractProjectUuidFromProjetResourceUrl(fileName) === newCloudProjectId,
    onError: (resourceName, errorMessage) => {
      result.erroredResources.push({
        resourceName,
        error: new Error(errorMessage),
      });
    },
  });

  // If an error happens here, it will be thrown out of the function.
  if (oldStorageProviderOperations.onEnsureCanAccessResources)
    oldStorageProviderOperations.onEnsureCanAccessResources(
      project,
      oldFileMetadata
    );

  await uploadResourcesToCloud({
    resourcesToFetchAndUpload,
    authenticatedUser,
    cloudProjectId: newCloudProjectId,
    onProgress,
    onError: (resourceName, error) => {
      result.erroredResources.push({
        resourceName,
        error,
      });
    },
  });

  return result;
};

export const moveUrlResourcesToCloudFilesIfPrivate = async ({
  project,
  fileMetadata,
  authenticatedUser,
  onProgress,
}: {|
  project: gdProject,
  fileMetadata: FileMetadata,
  authenticatedUser: AuthenticatedUser,
  onProgress: (number, number) => void,
|}) => {
  const result = {
    erroredResources: [],
  };

  const cloudProjectId = fileMetadata.fileIdentifier;

  // Get all resources to download.
  const resourcesToFetchAndUpload = getResourcesToFetchAndUpload({
    project,
    selectCondition: isPrivateAssetUrl,
    onError: (resourceName, errorMessage) => {
      result.erroredResources.push({
        resourceName,
        error: new Error(errorMessage),
      });
    },
  });

  await uploadResourcesToCloud({
    resourcesToFetchAndUpload,
    // // Remove the token used to download the file when re-uploading it.
    transformFilename: filename => filename.split('?')[0],
    authenticatedUser,
    cloudProjectId,
    onProgress,
    onError: (resourceName, error) => {
      result.erroredResources.push({
        resourceName,
        error,
      });
    },
  });

  return result;
};
