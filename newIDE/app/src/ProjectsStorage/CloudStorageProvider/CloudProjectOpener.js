// @flow

import {
  getCloudProject,
  getCredentialsForProject,
  getProjectFileAsZipBlob,
} from '../../Utils/GDevelopServices/Project';
import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';

import { type FileMetadata } from '../index';
import { initializeZipJs } from '../../Utils/Zip.js';

const unzipProject = async (zippedProject: any) => {
  const zipJs: ZipJs = await initializeZipJs();

  return new Promise((resolve, reject) => {
    zipJs.createReader(new zipJs.BlobReader(zippedProject), zipReader => {
      zipReader.getEntries(entries => {
        // Reading only the first entry since the zip should only contain the project json file
        entries[0].getData(new zipJs.TextWriter(), result => {
          resolve(result);
        });
      });
    });
  });
};

export const generateOnOpen = (authenticatedUser: AuthenticatedUser) => async (
  fileMetadata: FileMetadata
): Promise<{|
  content: Object,
|}> => {
  const cloudProjectId = fileMetadata.fileIdentifier;

  const cloudProject = await getCloudProject(authenticatedUser, cloudProjectId);
  if (!cloudProject) throw new Error("Cloud project couldn't be fetched.");

  await getCredentialsForProject(authenticatedUser, cloudProjectId);
  const zippedSerializedProject = await getProjectFileAsZipBlob(cloudProject);
  const serializedProject = await unzipProject(zippedSerializedProject);

  return {
    content: JSON.parse(serializedProject),
  };
};
