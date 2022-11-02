// @flow
import {
  getCredentialsForCloudProject,
  type UploadedProjectResourceFiles,
  uploadProjectResourceFiles,
} from '../../Utils/GDevelopServices/Project';
import {
  convertBlobToFiles,
  downloadUrlsToBlobs,
  type ItemResult,
} from '../../Utils/BlobDownloader';
import { type FileMetadata } from '../index';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import {
  extractFilenameWithExtensionFromProductAuthorizedUrl,
  isProductAuthorizedResourceUrl,
} from '../../Utils/GDevelopServices/Shop';
import { isBlobURL, isURL } from '../../ResourcesList/ResourceUtils';

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

  type ResourceToFetchAndUpload = {|
    resource: gdResource,
    url: string,
    filename: string,
  |};

  const cloudProjectId = fileMetadata.fileIdentifier;

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
            if (isProductAuthorizedResourceUrl(resourceFile)) {
              const filenameWithExtension = extractFilenameWithExtensionFromProductAuthorizedUrl(
                resourceFile
              );
              return {
                resource,
                url: resourceFile,
                filename: filenameWithExtension,
              };
            } else if (isBlobURL(resourceFile)) {
              result.erroredResources.push({
                resourceName: resource.getName(),
                error: new Error('Unsupported blob URL.'),
              });
              return null;
            } else {
              // Public URL resource: nothing to do.
              return null;
            }
          } else {
            // Local resource: unsupported.
            result.erroredResources.push({
              resourceName: resource.getName(),
              error: new Error('Unsupported relative file.'),
            });
            return null;
          }
        }
      )
      .filter(Boolean);
  };

  const resourcesToFetchAndUpload = getResourcesToFetchAndUpload(project);

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
  const downloadedFilesAndResourcesToUpload = convertBlobToFiles(
    downloadedBlobsAndResourcesToUpload,
    (resourceName, error) => {
      result.erroredResources.push({
        resourceName,
        error,
      });
    }
  );

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
