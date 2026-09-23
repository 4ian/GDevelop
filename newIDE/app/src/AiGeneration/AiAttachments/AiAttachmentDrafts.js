// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import {
  type AiAttachmentDraft,
  type AiAttachmentDraftError,
  MAX_ATTACHMENTS_PER_MESSAGE,
} from './UseAiAttachmentDrafts';
import { AiAttachmentChip } from './AiAttachmentChip';
import classes from './AiAttachments.module.css';

const errorMessages: { [AiAttachmentDraftError]: MessageDescriptor } = {
  'too-large': t`Too large (15 MB maximum)`,
  empty: t`This file is empty`,
  'too-many': t`${MAX_ATTACHMENTS_PER_MESSAGE} files maximum`,
  'not-authenticated': t`Log in to attach files`,
  'upload-failed': t`Upload failed`,
};

const useObjectUrlsOfImages = (
  drafts: Array<AiAttachmentDraft>
): { [localId: string]: string } => {
  const [objectUrls, setObjectUrls] = React.useState<{
    [localId: string]: string,
  }>({});
  const draftsKey = drafts.map(draft => draft.localId).join(',');
  React.useEffect(
    () => {
      const newObjectUrls: { [localId: string]: string } = {};
      drafts.forEach(draft => {
        if (draft.file.type.startsWith('image/')) {
          newObjectUrls[draft.localId] = URL.createObjectURL(draft.file);
        }
      });
      setObjectUrls(newObjectUrls);
      return () => {
        Object.keys(newObjectUrls).forEach(localId =>
          URL.revokeObjectURL(newObjectUrls[localId])
        );
      };
    },
    // Only when files are added or removed.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [draftsKey]
  );
  return objectUrls;
};

type Props = {|
  drafts: Array<AiAttachmentDraft>,
  onRemove: (localId: string) => void,
|};

/** The files attached to the message being written. */
export const AiAttachmentDrafts = ({ drafts, onRemove }: Props): React.Node => {
  const objectUrls = useObjectUrlsOfImages(drafts);
  if (!drafts.length) return null;

  return (
    <div className={classes.attachmentsList}>
      {drafts.map(draft => (
        <AiAttachmentChip
          key={draft.localId}
          name={draft.file.name}
          size={draft.file.size}
          thumbnailUrl={objectUrls[draft.localId]}
          isUploading={draft.status === 'uploading'}
          error={draft.error ? errorMessages[draft.error] : null}
          onRemove={() => onRemove(draft.localId)}
        />
      ))}
    </div>
  );
};
