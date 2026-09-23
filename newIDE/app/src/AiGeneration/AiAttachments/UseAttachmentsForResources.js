// @flow
import * as React from 'react';
import axios from 'axios';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { createAiAttachmentDownloadUrls } from '../../Utils/GDevelopServices/Generation';
import { type ResourceManagementProps } from '../../ResourcesList/ResourceSource';
import { type FileMetadata } from '../../ProjectsStorage';
import { type AttachmentsForResources } from '../../EditorFunctions/AttachmentResources';
import { getFileOfUploadedAttachment } from './AiAttachmentsUpload';

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

/** The files attached to the AI, for the functions making resources of them. */
export const useAttachmentsForResources = ({
  resourceManagementProps,
  fileMetadata,
}: {|
  resourceManagementProps: ResourceManagementProps,
  fileMetadata: ?FileMetadata,
|}): AttachmentsForResources => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );

  const getFiles = React.useCallback(
    async (attachmentIds: Array<string>) => {
      const files: { [attachmentId: string]: ?File } = {};
      const attachmentIdsToDownload = [];
      attachmentIds.forEach(attachmentId => {
        const file = getFileOfUploadedAttachment(attachmentId);
        if (file) files[attachmentId] = file;
        else attachmentIdsToDownload.push(attachmentId);
      });
      if (!attachmentIdsToDownload.length || !profile) return files;

      const downloads = await createAiAttachmentDownloadUrls(
        getAuthorizationHeader,
        { userId: profile.id, attachmentIds: attachmentIdsToDownload }
      );
      await Promise.all(
        downloads.map(async download => {
          if (download.error) return;
          try {
            files[download.attachmentId] = await downloadFile({
              url: download.url,
              name: download.name,
              mimeType: download.mimeType,
            });
          } catch (error) {
            console.error('Unable to download an attachment:', error);
          }
        })
      );
      return files;
    },
    [profile, getAuthorizationHeader]
  );

  const storeResourceFiles = React.useCallback(
    async () => {
      resourceManagementProps.onNewResourcesAdded();
      // A project not saved yet (or opened from a URL) has no storage for
      // its files: they are stored when it is saved.
      const storageProviderName = resourceManagementProps.getStorageProvider()
        .internalName;
      if (
        !fileMetadata ||
        (storageProviderName !== 'Cloud' && storageProviderName !== 'LocalFile')
      )
        return false;
      await resourceManagementProps.onFetchNewlyAddedResources();
      return true;
    },
    [resourceManagementProps, fileMetadata]
  );

  return React.useMemo(() => ({ getFiles, storeResourceFiles }), [
    getFiles,
    storeResourceFiles,
  ]);
};
