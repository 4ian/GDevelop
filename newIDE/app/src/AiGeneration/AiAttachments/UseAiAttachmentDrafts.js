// @flow
import * as React from 'react';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import { makeTimestampedId } from '../../Utils/TimestampedId';
import { PROJECT_RESOURCE_MAX_SIZE_IN_BYTES } from '../../Utils/GDevelopServices/Project';
import { uploadAiAttachment } from './AiAttachmentsUpload';

export const MAX_ATTACHMENTS_PER_MESSAGE = 10;

export type AiAttachmentDraftError =
  | 'too-large'
  | 'empty'
  | 'too-many'
  | 'not-authenticated'
  | 'upload-failed';

export type AiAttachmentDraft = {|
  localId: string,
  file: File,
  status: 'uploading' | 'uploaded' | 'error',
  attachmentId: string | null,
  error: AiAttachmentDraftError | null,
|};

const getFileError = (file: File): AiAttachmentDraftError | null => {
  if (file.size === 0) return 'empty';
  if (file.size > PROJECT_RESOURCE_MAX_SIZE_IN_BYTES) return 'too-large';
  return null;
};

/**
 * The files attached to the message being written, for each chat ('' for a
 * new chat). They are uploaded as soon as they are added.
 */
export const useAiAttachmentDrafts = (): {|
  draftsPerAiRequestId: { [aiRequestId: string]: Array<AiAttachmentDraft> },
  addFiles: (aiRequestId: string, files: Array<File>) => void,
  removeDraft: (aiRequestId: string, localId: string) => void,
  clearDrafts: (aiRequestId: string) => void,
|} => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [draftsPerAiRequestId, setDraftsPerAiRequestId] = React.useState<{
    [aiRequestId: string]: Array<AiAttachmentDraft>,
  }>({});

  const updateDraft = React.useCallback(
    (
      aiRequestId: string,
      localId: string,
      changes: Partial<AiAttachmentDraft>
    ) =>
      setDraftsPerAiRequestId(currentDraftsPerAiRequestId => ({
        ...currentDraftsPerAiRequestId,
        [aiRequestId]: (currentDraftsPerAiRequestId[aiRequestId] || []).map(
          draft =>
            draft.localId === localId ? { ...draft, ...changes } : draft
        ),
      })),
    []
  );

  const addFiles = React.useCallback(
    (aiRequestId: string, files: Array<File>) => {
      const existingDraftsCount = (
        draftsPerAiRequestId[aiRequestId] || []
      ).filter(draft => draft.status !== 'error').length;
      let validDraftsCount = existingDraftsCount;
      const newDrafts: Array<AiAttachmentDraft> = files.map(file => {
        const error =
          validDraftsCount >= MAX_ATTACHMENTS_PER_MESSAGE
            ? 'too-many'
            : !profile
            ? 'not-authenticated'
            : getFileError(file);
        if (!error) validDraftsCount++;
        return {
          localId: makeTimestampedId(),
          file,
          status: error ? 'error' : 'uploading',
          attachmentId: null,
          error,
        };
      });
      setDraftsPerAiRequestId(currentDraftsPerAiRequestId => ({
        ...currentDraftsPerAiRequestId,
        [aiRequestId]: [
          ...(currentDraftsPerAiRequestId[aiRequestId] || []),
          ...newDrafts,
        ],
      }));

      if (!profile) return;
      newDrafts
        .filter(draft => draft.status === 'uploading')
        .forEach(async draft => {
          try {
            const attachmentId = await uploadAiAttachment({
              getAuthorizationHeader,
              userId: profile.id,
              file: draft.file,
            });
            updateDraft(aiRequestId, draft.localId, {
              status: 'uploaded',
              attachmentId,
            });
          } catch (error) {
            console.error('Unable to upload an attachment:', error);
            updateDraft(aiRequestId, draft.localId, {
              status: 'error',
              error: 'upload-failed',
            });
          }
        });
    },
    [draftsPerAiRequestId, profile, getAuthorizationHeader, updateDraft]
  );

  const removeDraft = React.useCallback(
    (aiRequestId: string, localId: string) =>
      setDraftsPerAiRequestId(currentDraftsPerAiRequestId => ({
        ...currentDraftsPerAiRequestId,
        [aiRequestId]: (currentDraftsPerAiRequestId[aiRequestId] || []).filter(
          draft => draft.localId !== localId
        ),
      })),
    []
  );

  const clearDrafts = React.useCallback(
    (aiRequestId: string) =>
      setDraftsPerAiRequestId(currentDraftsPerAiRequestId => ({
        ...currentDraftsPerAiRequestId,
        [aiRequestId]: [],
      })),
    []
  );

  return { draftsPerAiRequestId, addFiles, removeDraft, clearDrafts };
};
