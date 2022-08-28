// @flow

import { t } from '@lingui/macro';
import {
  getCloudProject,
  getCredentialsForCloudProject,
  getProjectFileAsZipBlob,
} from '../../Utils/GDevelopServices/Project';
import { initializeZipJs } from '../../Utils/Zip.js';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { type FileMetadata } from '..';

const unzipProject = async (zippedProject: Blob) => {
  const zipJs: ZipJs = await initializeZipJs();

  return new Promise((resolve, reject) => {
    zipJs.createReader(
      new zipJs.BlobReader(zippedProject),
      zipReader => {
        zipReader.getEntries(entries => {
          // Reading only the first entry since the zip should only contain the project json file
          entries[0].getData(new zipJs.TextWriter(), result => {
            resolve(result);
          });
        });
      },
      error => {
        console.error(
          'An error occurred when unzipping archived project',
          error
        );
        reject(error);
      }
    );
  });
};

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
  const zippedSerializedProject = await getProjectFileAsZipBlob(cloudProject);
  onProgress && onProgress((4 / 4) * 100, t`Opening portal`);
  const serializedProject = await unzipProject(zippedSerializedProject);

  return {
    content: JSON.parse(serializedProject),
  };
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
