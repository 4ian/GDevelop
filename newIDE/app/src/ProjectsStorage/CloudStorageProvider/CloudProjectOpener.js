// @flow

import { t } from '@lingui/macro';
import {
  getCloudProject,
  getCredentialsForCloudProject,
  getOtherUserCloudProject,
  getProjectFileAsZipBlob,
} from '../../Utils/GDevelopServices/Project';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';
import { unzipFirstEntryOfBlob } from '../../Utils/Zip.js/Utils';
import ProjectCache from '../../Utils/ProjectCache';

const CLOUD_PROJECT_AUTOSAVE_PREFIX = 'cache-autosave:';
let projectCache;

export const getProjectCache = () => {
  if (projectCache) return projectCache;
  projectCache = new ProjectCache();
  return projectCache;
};

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
    if (!ProjectCache.isAvailable()) {
      throw new Error('Cache is not available.');
    }
    const { profile } = authenticatedUser;
    if (!profile) {
      throw new Error(
        'User seems to not be logged in. Cannot retrieve autosaved file from cache.'
      );
    }
    const cloudProjectId = fileMetadata.fileIdentifier.replace(
      CLOUD_PROJECT_AUTOSAVE_PREFIX,
      ''
    );
    const projectCache = getProjectCache();
    const project = await projectCache.get({
      userId: profile.id,
      cloudProjectId,
    });
    if (!project) {
      throw new Error(
        `Could not find cache entry for project id ${cloudProjectId}.`
      );
    }
    return { content: JSON.parse(project) };
  }

  onProgress && onProgress((1 / 4) * 100, t`Calibrating sensors`);
  let cloudProject;
  if (fileMetadata.ownerId) {
    cloudProject = await getOtherUserCloudProject(
      authenticatedUser,
      cloudProjectId,
      fileMetadata.ownerId
    );
  } else {
    cloudProject = await getCloudProject(authenticatedUser, cloudProjectId);
  }
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
  ProjectCache.isAvailable()
    ? async (
        fileMetadata: FileMetadata,
        compareLastModified: boolean
      ): Promise<?number> => {
        const { profile } = authenticatedUser;
        if (!profile) return null;

        try {
          const cloudProjectId = fileMetadata.fileIdentifier;
          const projectCache = getProjectCache();
          const autoSavedTime = await projectCache.getCreationDate({
            userId: profile.id,
            cloudProjectId,
          });
          if (!autoSavedTime) return null;
          if (!compareLastModified) return autoSavedTime;

          const saveTime = fileMetadata.lastModifiedDate;
          if (!saveTime) return null;

          return autoSavedTime > saveTime + 5000 ? autoSavedTime : null;
        } catch (error) {
          console.error(
            'An error occurred while getting autosave creation date:',
            error
          );
          return null;
        }
      }
    : undefined;

export const generateOnGetAutoSave = (authenticatedUser: AuthenticatedUser) =>
  ProjectCache.isAvailable()
    ? async (fileMetadata: FileMetadata): Promise<FileMetadata> => {
        return {
          ...fileMetadata,
          fileIdentifier:
            CLOUD_PROJECT_AUTOSAVE_PREFIX + fileMetadata.fileIdentifier,
        };
      }
    : undefined;

export const burstCloudProjectAutoSaveCache = async () => {
  await ProjectCache.burst();
};
