// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import AuthenticatedUserContext from '../../Profile/AuthenticatedUserContext';
import {
  type AiRequestAttachment,
  createAiAttachmentDownloadUrls,
} from '../../Utils/GDevelopServices/Generation';
import { getFileOfUploadedAttachment } from './AiAttachmentsUpload';
import { AiAttachmentChip } from './AiAttachmentChip';
import classes from './AiAttachments.module.css';

type ImageUrls = { [attachmentId: string]: string | null };

/**
 * The URL to show each image: the file attached in this session, or a
 * download URL (null once the attachment expired).
 */
const useImageUrls = (attachments: Array<AiRequestAttachment>): ImageUrls => {
  const { profile, getAuthorizationHeader } = React.useContext(
    AuthenticatedUserContext
  );
  const [imageUrls, setImageUrls] = React.useState<ImageUrls>({});
  const imageAttachmentIds = attachments
    .filter(attachment => attachment.mimeType.startsWith('image/'))
    .map(attachment => attachment.attachmentId);
  const imageAttachmentIdsKey = imageAttachmentIds.join(',');

  React.useEffect(
    () => {
      const objectUrls: ImageUrls = {};
      const attachmentIdsToDownload = [];
      imageAttachmentIds.forEach(attachmentId => {
        const file = getFileOfUploadedAttachment(attachmentId);
        if (file) objectUrls[attachmentId] = URL.createObjectURL(file);
        else attachmentIdsToDownload.push(attachmentId);
      });
      setImageUrls(objectUrls);

      let isMounted = true;
      if (attachmentIdsToDownload.length && profile) {
        createAiAttachmentDownloadUrls(getAuthorizationHeader, {
          userId: profile.id,
          attachmentIds: attachmentIdsToDownload,
        }).then(
          downloads => {
            if (!isMounted) return;
            const downloadedImageUrls: ImageUrls = {};
            downloads.forEach(download => {
              downloadedImageUrls[download.attachmentId] =
                download.error ? null : download.previewUrl;
            });
            setImageUrls(currentImageUrls => ({
              ...currentImageUrls,
              ...downloadedImageUrls,
            }));
          },
          error => console.error('Unable to get attachment URLs:', error)
        );
      }

      return () => {
        isMounted = false;
        Object.keys(objectUrls).forEach(attachmentId => {
          if (objectUrls[attachmentId])
            URL.revokeObjectURL(objectUrls[attachmentId]);
        });
      };
    },
    // Only when the attachments change.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [imageAttachmentIdsKey, profile]
  );

  return imageUrls;
};

type Props = {|
  attachments: Array<AiRequestAttachment>,
|};

/** The files attached to a message sent to the AI. */
export const AiMessageAttachments = ({ attachments }: Props): React.Node => {
  const imageUrls = useImageUrls(attachments);

  return (
    <div className={classes.attachmentsList}>
      {attachments.map(attachment => {
        const imageUrl = imageUrls[attachment.attachmentId];
        return imageUrl ? (
          <img
            key={attachment.attachmentId}
            src={imageUrl}
            alt={attachment.name}
            title={attachment.name}
            className={classes.messageImage}
          />
        ) : (
          <AiAttachmentChip
            key={attachment.attachmentId}
            name={attachment.name}
            size={attachment.size}
            thumbnailUrl={null}
            error={imageUrl === null ? t`No longer available` : null}
          />
        );
      })}
    </div>
  );
};
