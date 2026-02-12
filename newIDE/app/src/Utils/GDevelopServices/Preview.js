// @flow
import axios from 'axios';
import { GDevelopGamePreviews } from './ApiConfigs';
import { getSignedUrls } from './Usage';

export type UploadedObject = {|
  Key: string,
  Body: string,
  ContentType: 'text/javascript' | 'text/html',
|};

export const uploadObjects = async (
  uploadedObjects: Array<UploadedObject>
): Promise<void> => {
  const { signedUrls } = await getSignedUrls({
    uploadType: 'preview',
    files: uploadedObjects.map(params => ({
      key: params.Key,
      contentType: params.ContentType,
    })),
  });

  if (signedUrls.length !== uploadedObjects.length) {
    throw new Error(
      'Unexpected response from the API (signed urls count is not the same as uploaded objects count).'
    );
  }

  await Promise.all(
    uploadedObjects.map((params, index) =>
      axios.put(signedUrls[index], params.Body, {
        headers: {
          'Content-Type': params.ContentType,
        },
      })
    )
  );
};

export const getBaseUrl = () => {
  return GDevelopGamePreviews.baseUrl;
};
