// @flow
import axios from 'axios';

type UploadOptions = {
  signedUrl: string,
  contentType: string,
};

type UploadConfig = {
  onProgress: (progress: number, total: number) => void,
  abortSignal?: AbortSignal,
  timeout?: number,
};

export const uploadBlobFile = (
  blob: Blob,
  uploadOptions: UploadOptions,
  onProgress: (progress: number, total: number) => void,
  config?: UploadConfig
): Promise<void> => {
  const abortSignal = config?.abortSignal;
  const timeout = config?.timeout || 5 * 60 * 1000;

  const cancelTokenSource = axios.CancelToken.source();

  if (abortSignal) {
    abortSignal.addEventListener('abort', () => {
      cancelTokenSource.cancel('Upload cancelled by user');
    });
  }

  return axios
    .put(uploadOptions.signedUrl, blob, {
      headers: {
        'Content-Type': uploadOptions.contentType,
      },
      // Allow any arbitrary large file to be sent
      maxContentLength: Infinity,
      timeout: timeout,
      cancelToken: cancelTokenSource.token,
      onUploadProgress: progressEvent => {
        if (!progressEvent || !progressEvent.total) {
          onProgress(0, 0);
          return;
        }

        onProgress(progressEvent.loaded, progressEvent.total);
      },
    })
    .then(() => undefined)
    .catch(error => {
      if (axios.isCancel(error)) {
        throw new Error('Upload cancelled');
      }
      throw error;
    });
};
