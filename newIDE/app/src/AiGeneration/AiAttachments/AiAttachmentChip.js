// @flow
import * as React from 'react';
import classNames from 'classnames';
import { I18n } from '@lingui/react';
import { t } from '@lingui/macro';
import IconButton from '../../UI/IconButton';
import SmallCross from '../../UI/CustomSvgIcons/SmallCross';
import FileIcon from '../../UI/CustomSvgIcons/File';
import CircularProgress from '../../UI/CircularProgress';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';
import classes from './AiAttachments.module.css';

const formatFileSize = (sizeInBytes: number): string =>
  sizeInBytes < 1000 * 1000
    ? `${Math.ceil(sizeInBytes / 1000)} KB`
    : `${(sizeInBytes / (1000 * 1000)).toFixed(1)} MB`;

type Props = {|
  name: string,
  size: number,
  thumbnailUrl: ?string,
  isUploading?: boolean,
  error?: ?MessageDescriptor,
  onOpen?: () => void,
  onRemove?: () => void,
|};

/** A file attached to a message: a thumbnail (or an icon), its name and size. */
export const AiAttachmentChip = ({
  name,
  size,
  thumbnailUrl,
  isUploading,
  error,
  onOpen,
  onRemove,
}: Props): React.Node => (
  <I18n>
    {({ i18n }) => (
      <div
        className={classNames(classes.attachment, {
          [classes.errored]: !!error,
          [classes.removable]: !!onRemove,
        })}
        title={error ? `${name}: ${i18n._(error)}` : name}
      >
        {thumbnailUrl ? (
          <img
            src={thumbnailUrl}
            alt={name}
            className={classNames(classes.attachmentThumbnail, {
              [classes.clickable]: !!onOpen,
            })}
            onClick={onOpen}
          />
        ) : (
          <div className={classes.attachmentIcon}>
            {isUploading ? <CircularProgress size={18} /> : <FileIcon />}
          </div>
        )}
        <div className={classes.attachmentTexts}>
          <span className={classes.attachmentName}>{name}</span>
          <span
            className={classNames(classes.attachmentDetails, {
              [classes.errored]: !!error,
            })}
          >
            {error
              ? i18n._(error)
              : isUploading
              ? i18n._(t`Uploading...`)
              : formatFileSize(size)}
          </span>
        </div>
        {onRemove && (
          <IconButton
            size="small"
            tooltip={t`Remove`}
            onClick={e => {
              // The chip can be in the label of the text field.
              e.preventDefault();
              onRemove();
            }}
          >
            <SmallCross fontSize="small" />
          </IconButton>
        )}
      </div>
    )}
  </I18n>
);
