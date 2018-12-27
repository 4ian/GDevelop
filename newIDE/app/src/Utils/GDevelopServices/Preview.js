// @flow
import { GDevelopGamesPreview } from './ApiConfigs';

export type UploadedObject = {|
  Key: string,
  Body: string,
  ContentType: 'text/javascript' | 'text/html',
|};

export const uploadObject = (params: UploadedObject): Promise<any> => {
  return new Promise((resolve, reject) => {
    GDevelopGamesPreview.awsS3Client.putObject(
      { ...params, Bucket: GDevelopGamesPreview.options.destinationBucket },
      (err: ?Error, data: any) => {
        if (err) return reject(err);

        resolve(data);
      }
    );
  });
};

export const getBaseUrl = () => {
  return GDevelopGamesPreview.options.destinationBucketBaseUrl;
};
