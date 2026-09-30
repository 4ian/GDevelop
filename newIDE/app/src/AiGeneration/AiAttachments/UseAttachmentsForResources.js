// @flow
import * as React from 'react';
import axios from 'axios';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { createAiAttachmentDownloads } from '../../Utils/GDevelopServices/Generation';
import { MAX_ATTACHMENTS_PER_MESSAGE } from './UseAiAttachmentDrafts';
import { t } from '@lingui/macro';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import {
  type FileMetadata,
  type StorageProvider,
  type SaveAsLocation,
} from '../../ProjectsStorage';
import CloudStorageProvider from '../../ProjectsStorage/CloudStorageProvider';
import {
  type AttachmentsForResources,
  type ResourceFilesStorage,
} from '../../EditorFunctions/AttachmentResources';
import { getFileOfUploadedAttachment } from './AiAttachmentsUpload';
import useAlertDialog from '../../UI/Alert/useAlertDialog';
import { isNativeMobileApp } from '../../Utils/Platform';

const downloadFile = async ({
  url,
  name,
  mimeType,
}: {|
  url: string,
  name: string,
  mimeType: string,
|}): Promise<File> => {
  const response = await axios.get<Blob>(url, { responseType: 'blob' });
  return new File([response.data], name, { type: mimeType });
};

const canStorageProviderStoreResourceFiles = (
  storageProvider: StorageProvider
): boolean =>
  storageProvider.internalName === 'Cloud' ||
  storageProvider.internalName === 'LocalFile';

/** The files attached to the AI, for the functions making resources of them. */
export const useAttachmentsForResources = ({
  project,
  resourceManagementProps,
  fileMetadata,
  onSaveProjectAsWithStorageProvider,
}: {|
  project: ?gdProject,
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
  onSaveProjectAsWithStorageProvider?: (
    options: ?{|
      requestedStorageProvider?: StorageProvider,
      forcedSavedAsLocation?: SaveAsLocation,
      createdProject?: gdProject,
    |}
  ) => Promise<?FileMetadata>,
|}): AttachmentsForResources => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const { showConfirmation } = useAlertDialog();

  const getFiles = React.useCallback(
    async (attachmentIds: Array<string>) => {
      const files: { [attachmentId: string]: ?File } = {};
      const attachmentIdsToDownload = [];
      new Set(attachmentIds).forEach(attachmentId => {
        const file = getFileOfUploadedAttachment(attachmentId);
        if (file) files[attachmentId] = file;
        else attachmentIdsToDownload.push(attachmentId);
      });
      if (!profile) return files;

      // The API gives the downloads of a few attachments at a time.
      for (
        let index = 0;
        index < attachmentIdsToDownload.length;
        index += MAX_ATTACHMENTS_PER_MESSAGE
      ) {
        const attachmentDownloads = await createAiAttachmentDownloads(
          getAuthorizationHeader,
          {
            userId: profile.id,
            attachmentIds: attachmentIdsToDownload.slice(
              index,
              index + MAX_ATTACHMENTS_PER_MESSAGE
            ),
          }
        );
        await Promise.all(
          attachmentDownloads.map(async attachmentDownload => {
            if (attachmentDownload.error) return;
            try {
              files[attachmentDownload.attachmentId] = await downloadFile({
                url: attachmentDownload.url,
                name: attachmentDownload.name,
                mimeType: attachmentDownload.mimeType,
              });
            } catch (error) {
              console.error('Unable to download an attachment:', error);
            }
          })
        );
      }
      return files;
    },
    [profile, getAuthorizationHeader]
  );

  const saveProjectInCloudIfUserAgrees = React.useCallback(
    async (): Promise<boolean> => {
      if (!project || !onSaveProjectAsWithStorageProvider) return false;
      const shouldSave = await showConfirmation({
        title: t`Save your project`,
        message: t`Your project must be saved in the cloud to add the files you attached. Save it now?`,
        confirmButtonLabel: t`Save`,
      });
      if (!shouldSave) return false;

      // Saving it also stores the files of its resources.
      const newFileMetadata = await onSaveProjectAsWithStorageProvider({
        requestedStorageProvider: CloudStorageProvider,
        forcedSavedAsLocation: { name: project.getName() },
      });
      return (
        !!newFileMetadata &&
        canStorageProviderStoreResourceFiles(
          resourceManagementProps.getStorageProvider()
        )
      );
    },
    [
      project,
      onSaveProjectAsWithStorageProvider,
      showConfirmation,
      resourceManagementProps,
    ]
  );

  const storeResourceFiles = React.useCallback(
    async (): Promise<ResourceFilesStorage> => {
      resourceManagementProps.onNewResourcesAdded();
      if (
        fileMetadata &&
        canStorageProviderStoreResourceFiles(
          resourceManagementProps.getStorageProvider()
        )
      ) {
        await resourceManagementProps.onFetchNewlyAddedResources();
        return 'stored';
      }

      // A project not saved yet (or opened from a URL) has no storage for its
      // files. On desktop and on the web, they are kept in memory, where the
      // previews can read them, until the project is saved. On the mobile
      // app, the previews can't read them and they are lost if the app is
      // closed: the project must be saved first.
      if (!isNativeMobileApp()) return 'stored-when-project-is-saved';
      if (!(await saveProjectInCloudIfUserAgrees())) return 'project-not-saved';
      await resourceManagementProps.onFetchNewlyAddedResources();
      return 'stored';
    },
    [resourceManagementProps, fileMetadata, saveProjectInCloudIfUserAgrees]
  );

  return React.useMemo(() => ({ getFiles, storeResourceFiles }), [
    getFiles,
    storeResourceFiles,
  ]);
};
