// @flow
const awsS3 = require('aws-sdk/clients/s3');
const isDev = process.env.NODE_ENV === 'development';

export const GDevelopHostingApi = {
  deployEndpoint:
    'https://nik50aqlp6.execute-api.eu-west-1.amazonaws.com/Production/deploy',
  gamesHost: 'http://gd-games.s3-website-eu-west-1.amazonaws.com',
};

const gdevelopGamesPreviewRegion = 'eu-west-1';
const gdevelopGamesPreviewBucket = 'gd-games-preview';

const gdevelopGamesPreviewOptions = {
  destinationBucket: gdevelopGamesPreviewBucket,
  accessKeyId: process.env.REACT_APP_PREVIEW_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_PREVIEW_S3_SECRET_ACCESS_KEY,
  region: gdevelopGamesPreviewRegion,
  destinationBucketBaseUrl: `https://s3-${gdevelopGamesPreviewRegion}.amazonaws.com/${gdevelopGamesPreviewBucket}/`,
};

export const GDevelopGamesPreview = {
  options: gdevelopGamesPreviewOptions,
  awsS3Client: new awsS3({
    accessKeyId: gdevelopGamesPreviewOptions.accessKeyId,
    secretAccessKey: gdevelopGamesPreviewOptions.secretAccessKey,
    region: gdevelopGamesPreviewOptions.region,
    correctClockSkew: true,
  }),
};

if (
  !gdevelopGamesPreviewOptions.accessKeyId ||
  !gdevelopGamesPreviewOptions.secretAccessKey
) {
  console.warn(
    "Either REACT_APP_PREVIEW_S3_ACCESS_KEY_ID or REACT_APP_PREVIEW_S3_SECRET_ACCESS_KEY are not defined. Preview won't work in the web-app."
  );
  console.info(
    'Copy .env.dist file to .env.local and fill the values to fix this warning.'
  );
}

const gdevelopBuildUploadRegion = 'eu-west-1';
const gdevelopBuildUploadBucket = 'gd-games-in';

const gdevelopBuildUploadOptions = {
  destinationBucket: gdevelopBuildUploadBucket,
  accessKeyId: process.env.REACT_APP_UPLOAD_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_UPLOAD_S3_SECRET_ACCESS_KEY,
  region: gdevelopBuildUploadRegion,
  destinationBucketBaseUrl: `https://s3-${gdevelopBuildUploadRegion}.amazonaws.com/${gdevelopBuildUploadBucket}/`,
};

if (
  !gdevelopBuildUploadOptions.accessKeyId ||
  !gdevelopBuildUploadOptions.secretAccessKey
) {
  console.warn(
    "Either REACT_APP_UPLOAD_S3_ACCESS_KEY_ID or REACT_APP_UPLOAD_S3_SECRET_ACCESS_KEY are not defined. Upload of builds won't work in the web-app."
  );
  console.info(
    'Copy .env.dist file to .env.local and fill the values to fix this warning.'
  );
}

export const GDevelopBuildUpload = {
  options: gdevelopBuildUploadOptions,
  awsS3Client: new awsS3({
    accessKeyId: gdevelopBuildUploadOptions.accessKeyId,
    secretAccessKey: gdevelopBuildUploadOptions.secretAccessKey,
    region: gdevelopBuildUploadOptions.region,
    correctClockSkew: true,
  }),
};

export const GDevelopBuildApi = {
  baseUrl: isDev
    ? 'https://ppvvhs48j1.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/build',
};

export const GDevelopFirebaseConfig = {
  apiKey: 'AIzaSyAnX9QMacrIl3yo4zkVFEVhDppGVDDewBc',
  authDomain: 'gdevelop-services.firebaseapp.com',
  databaseURL: 'https://gdevelop-services.firebaseio.com',
  projectId: 'gdevelop-services',
  storageBucket: 'gdevelop-services.appspot.com',
  messagingSenderId: '44882707384',
};

export const GDevelopUsageApi = {
  baseUrl: isDev
    ? 'https://dwjjhr5k76.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/usage',
};

export const GDevelopReleaseApi = {
  baseUrl: isDev
    ? 'https://c8cldf4iqh.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/release',
};

export const GDevelopExtensionApi = {
  baseUrl: isDev
    ? 'https://raw.githubusercontent.com/4ian/GDevelop-extensions/master'
    : 'https://raw.githubusercontent.com/4ian/GDevelop-extensions/master',
};
