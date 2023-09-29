// @flow
import axios from 'axios';

type UploadOptions = {
  signedUrl: string,
  contentType: string,
};

export const uploadBlobFile = (
  blob: Blob,
  uploadOptions: UploadOptions,
  onProgress: (progress: number, total: number) => void
): Promise<void> => {
  return axios
    .put(uploadOptions.signedUrl, blob, {
      headers: {
        'Content-Type': uploadOptions.contentType,
      },
      // Allow any arbitrary large file to be sent
      maxContentLength: Infinity,
      onUploadProgress: progressEvent => {
        if (!progressEvent || !progressEvent.total) {
          onProgress(0, 0);
          return;
        }

        onProgress(progressEvent.loaded, progressEvent.total);
      },
    })
    .then(() => undefined);
};
