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
  convertBlobToFiles,
  downloadUrlsToBlobs,
  type ItemResult,
} from '../../Utils/BlobDownloader';
import { isBlobURL, isURL } from '../../ResourcesList/ResourceUtils';

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
  // TODO: in the future, avoid to load everything in memory at once - download and upload by chunks,
  // once a certain amount of blob size is read in memory (so that we don't have more than
  // X MB of blobs loaded in memory at the same time).
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
