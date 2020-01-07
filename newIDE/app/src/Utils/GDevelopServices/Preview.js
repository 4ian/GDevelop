// @flow
import { GDevelopGamesPreview } from './ApiConfigs';
import { getUploadOptions } from './Usage';
const awsS3 = require('aws-sdk/clients/s3');

export type UploadedObject = {|
  Key: string,
  Body: string,
  ContentType: 'text/javascript' | 'text/html',
|};

let previewAWSS3Client = null;
const getAWSS3Client = (): Promise<any> => {
  if (!previewAWSS3Client) {
    return getUploadOptions().then(uploadOptions => {
      previewAWSS3Client = new awsS3({
        accessKeyId: uploadOptions.preview.ak1 + uploadOptions.preview.ak2,
        secretAccessKey: uploadOptions.preview.sa1 + uploadOptions.preview.sa2,
        region: GDevelopGamesPreview.options.region,
        correctClockSkew: true,
      });

      return previewAWSS3Client;
    });
  }

  return Promise.resolve(previewAWSS3Client);
};

export const uploadObject = (params: UploadedObject): Promise<any> => {
  return getAWSS3Client().then(awsS3Client => {
    return new Promise((resolve, reject) => {
      awsS3Client.putObject(
        { ...params, Bucket: GDevelopGamesPreview.options.destinationBucket },
        (err: ?Error, data: any) => {
          if (err) return reject(err);

          resolve(data);
        }
      );
    });
  });
};

export const getBaseUrl = () => {
  return GDevelopGamesPreview.options.destinationBucketBaseUrl;
};
