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
import {
  ensureNoCloudProjectResources,
  moveUrlResourcesToCloudProject,
} from '../CloudStorageProvider/CloudResourceMover';

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
  }`]: moveUrlResourcesToCloudProject,
  // On the web-app, most resources are public URLs, so nothing to do.
  // But if some resources are coming from a private game template,
  // they need to be copied.
  [`${UrlStorageProvider.internalName}=>${
    CloudStorageProvider.internalName
  }`]: moveUrlResourcesToCloudProject,
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
