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
