// @flow
import {
  type ResourceMover,
  type MoveAllProjectResourcesOptions,
  type MoveAllProjectResourcesResult,
  type MoveAllProjectResourcesFunction,
} from './index';
import CloudStorageProvider from '../CloudStorageProvider';
import GoogleDriveStorageProvider from '../GoogleDriveStorageProvider';
import UrlStorageProvider from '../UrlStorageProvider';
import DownloadFileStorageProvider from '../DownloadFileStorageProvider';
import { checkIfIsGDevelopCloudBucketUrl } from '../../Utils/CrossOrigin';
import { moveAllCloudProjectResourcesToCloudProject } from '../CloudStorageProvider/CloudResourceMover';

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
const ensureNoCloudProjectResources = async ({
  project,
}: MoveAllProjectResourcesOptions): Promise<MoveAllProjectResourcesResult> => {
  const result: MoveAllProjectResourcesResult = {
    erroredResources: [],
  };
  const resourcesManager = project.getResourcesManager();
  const allResourceNames = resourcesManager.getAllResourceNames().toJSArray();
  allResourceNames.forEach((resourceName: string) => {
    const resource = resourcesManager.getResource(resourceName);
    const resourceFile = resource.getFile();

    if (isURL(resourceFile)) {
      if (checkIfIsGDevelopCloudBucketUrl(resourceFile)) {
        result.erroredResources.push({
          resourceName: resource.getName(),
          error: new Error(
            'Resources uploaded to GDevelop Cloud are not supported on Google Drive.'
          ),
        });
      } else if (isBlobURL(resourceFile)) {
        result.erroredResources.push({
          resourceName: resource.getName(),
          error: new Error('Resources with Blob URLs are not supported.'),
        });
        return;
      } else {
        // Public URL resource: it works.
        return;
      }
    } else {
      // Local resource: unsupported.
      result.erroredResources.push({
        resourceName: resource.getName(),
        error: new Error('Relative files in resources are not supported.'),
      });
      return;
    }
  });

  return result;
};

const moveNothing = async () => {
  return {
    erroredResources: [],
  };
};

const movers: {
  [string]: MoveAllProjectResourcesFunction,
} = {
  // Moving to GDevelop "Cloud" storage:

  // From a Cloud project to another, resources need to be copied
  // (unless they are public URLs).
  [`${CloudStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveAllCloudProjectResourcesToCloudProject,
  // Nothing to move around when going from a project on a public URL
  // to a cloud project (we could offer an option one day though to download
  // and upload the URL resources on GDevelop Cloud).
  [`${UrlStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveNothing,
  // Nothing to move around when going from a project on Google Drive
  // to a cloud project (because only public URLs are supported on Google Drive).
  [`${GoogleDriveStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveNothing,

  // Moving to "GoogleDrive" storage:

  // Google Drive does not support GDevelop cloud resources, so ensure there are none.
  [`${CloudStorageProvider.internalName}=>${
    GoogleDriveStorageProvider.internalName
  }`]: ensureNoCloudProjectResources,
  // Nothing to move around when saving to a Google Drive project from a public URL
  // (because only public URLs are supported).
  [`${UrlStorageProvider.internalName}=>${
    GoogleDriveStorageProvider.internalName
  }`]: moveNothing,
  // Nothing to move around when saving from a Google Drive project to another
  // (because only public URLs are supported).
  [`${GoogleDriveStorageProvider.internalName}=>${
    GoogleDriveStorageProvider.internalName
  }`]: moveNothing,

  // Moving to "DownloadFile":

  // Saving to "DownloadFile" will *not* change any resources, as it's a
  // "temporary save" that is made and given to the user.
  [`${CloudStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: moveNothing,
  [`${UrlStorageProvider.internalName}=>${
    DownloadFileStorageProvider.internalName
  }`]: moveNothing,
  [`${GoogleDriveStorageProvider.internalName}=>${
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
