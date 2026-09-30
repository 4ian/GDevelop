// @flow
import * as React from 'react';
import axios from 'axios';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { createAiAttachmentDownloads } from '../../Utils/GDevelopServices/Generation';
import { MAX_ATTACHMENTS_PER_MESSAGE } from './UseAiAttachmentDrafts';
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
