// @flow

import { t } from '@lingui/macro';
import {
  getCloudProject,
  getCredentialsForCloudProject,
  getProjectFileAsZipBlob,
} from '../../Utils/GDevelopServices/Project';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';
import { unzipFirstEntryOfBlob } from '../../Utils/Zip.js/Utils';

export const CLOUD_PROJECT_AUTOSAVE_CACHE_KEY =
  'gdevelop-cloud-project-autosave';
const CLOUD_PROJECT_AUTOSAVE_PREFIX = 'cache-autosave:';
export const isCacheApiAvailable =
  typeof window !== 'undefined' && 'caches' in window;

class CloudProjectReadingError extends Error {
  constructor() {
    super();

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, CloudProjectReadingError);
    }

    this.name = 'CloudProjectReadingError';
  }
}

export const generateOnOpen = (authenticatedUser: AuthenticatedUser) => async (
  fileMetadata: FileMetadata,
  onProgress?: (progress: number, message: MessageDescriptor) => void
): Promise<{|
  content: Object,
|}> => {
  const cloudProjectId = fileMetadata.fileIdentifier;

  if (cloudProjectId.startsWith(CLOUD_PROJECT_AUTOSAVE_PREFIX)) {
    if (!('caches' in window)) throw new Error('Cache API is not available.');
    const { profile } = authenticatedUser;
    if (!profile) {
      throw new Error(
        'User seems not to be logged in. Cannot retrieve autosaved filed from cache.'
      );
    }
    const hasCache = await caches.has(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
    if (!hasCache) {
      throw new Error('Cloud project autosave cache could not be retrieved.');
    }
    const cloudProjectId = fileMetadata.fileIdentifier.replace(
      CLOUD_PROJECT_AUTOSAVE_PREFIX,
      ''
    );
    const cache = await caches.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
    const cacheKey = `${profile.id}/${cloudProjectId}`;
    const cachedResponse = await cache.match(cacheKey);
    const cachedResponseBody = await cachedResponse.text();
    const cachedSerializedProject = JSON.parse(cachedResponseBody).project;
    return { content: JSON.parse(cachedSerializedProject) };
  }

  onProgress && onProgress((1 / 4) * 100, t`Calibrating sensors`);
  const cloudProject = await getCloudProject(authenticatedUser, cloudProjectId);
  if (!cloudProject) throw new Error("Cloud project couldn't be fetched.");

  onProgress && onProgress((2 / 4) * 100, t`Starting engine`);
  await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
  onProgress && onProgress((3 / 4) * 100, t`Checking tools`);
  const zippedSerializedProject = await getProjectFileAsZipBlob(
    cloudProject,
    fileMetadata.version
  );
  onProgress && onProgress((4 / 4) * 100, t`Opening portal`);
  // Reading only the first entry since the zip should only contain the project json file
  try {
    const serializedProject = await unzipFirstEntryOfBlob(
      zippedSerializedProject
    );
    return {
      content: JSON.parse(serializedProject),
    };
  } catch (error) {
    throw new CloudProjectReadingError();
  }
};

export const generateOnEnsureCanAccessResources = (
  authenticatedUser: AuthenticatedUser
) => async (
  project: gdProject,
  fileMetadata: FileMetadata,
  onProgress?: (progress: number, message: MessageDescriptor) => void
): Promise<void> => {
  const cloudProjectId = fileMetadata.fileIdentifier;
  await getCredentialsForCloudProject(authenticatedUser, cloudProjectId);
};

export const generateGetAutoSaveCreationDate = (
  authenticatedUser: AuthenticatedUser
) =>
  isCacheApiAvailable
    ? async (
        fileMetadata: FileMetadata,
        compareLastModified: boolean
      ): Promise<?number> => {
        const { profile } = authenticatedUser;
        if (!profile) return null;

        const hasCache = await caches.has(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
        if (!hasCache) return null;

        const cloudProjectId = fileMetadata.fileIdentifier;
        const cache = await caches.open(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
        const cacheKey = `${profile.id}/${cloudProjectId}`;
        const cachedResponse = await cache.match(cacheKey);
        if (!cachedResponse) return null;

        const cachedResponseBody = await cachedResponse.text();
        const autoSavedTime = JSON.parse(cachedResponseBody).createdAt;
        if (!compareLastModified) return autoSavedTime;

        const saveTime = fileMetadata.lastModifiedDate;
        if (!saveTime) return null;

        return autoSavedTime > saveTime + 5000 ? autoSavedTime : null;
      }
    : undefined;

export const generateOnGetAutoSave = (authenticatedUser: AuthenticatedUser) =>
  isCacheApiAvailable
    ? async (fileMetadata: FileMetadata): Promise<FileMetadata> => {
        return {
          ...fileMetadata,
          fileIdentifier:
            CLOUD_PROJECT_AUTOSAVE_PREFIX + fileMetadata.fileIdentifier,
        };
      }
    : undefined;

export const burstCloudProjectAutoSaveCache = async () => {
  if (!isCacheApiAvailable) return;
  await caches.delete(CLOUD_PROJECT_AUTOSAVE_CACHE_KEY);
};
