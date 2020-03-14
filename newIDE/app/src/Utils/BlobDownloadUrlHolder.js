// @flow
import * as React from 'react';

type Props = {
  blob: ?Blob,
  children: (blobDownloadUrl: string) => React.Node,
};

export const BlobDownloadUrlHolder = ({ blob, children }: Props) => {
  const [blobDownloadUrl, setBlobDownloadUrl] = React.useState('');
  React.useEffect(
    () => {
      // Release the existing blob URL, if any.
      if (blobDownloadUrl) {
        URL.revokeObjectURL(blobDownloadUrl);
      }

      if (blob) {
        setBlobDownloadUrl(URL.createObjectURL(blob));
      } else {
        setBlobDownloadUrl('');
      }

      return () => {
        // Release the blob URL if component is unmounted.
        if (blobDownloadUrl) {
          URL.revokeObjectURL(blobDownloadUrl);
        }
      };
    },
    [blob, blobDownloadUrl]
  );

  return children(blobDownloadUrl);
};
