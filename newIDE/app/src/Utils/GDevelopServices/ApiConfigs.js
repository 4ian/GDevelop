// @flow
const isDev = process.env.NODE_ENV === 'development';

const gdevelopGamesPreviewRegion = 'eu-west-1';
const gdevelopGamesPreviewBucket = 'gd-games-preview';

export const GDevelopGamesPreview = {
  destinationBucket: gdevelopGamesPreviewBucket,
  accessKeyId: process.env.REACT_APP_PREVIEW_S3_ACCESS_KEY_ID,
  secretAccessKey: process.env.REACT_APP_PREVIEW_S3_SECRET_ACCESS_KEY,
  region: gdevelopGamesPreviewRegion,
  destinationBucketBaseUrl: `https://s3-${gdevelopGamesPreviewRegion}.amazonaws.com/${gdevelopGamesPreviewBucket}/`,
};

if (
  !GDevelopGamesPreview.accessKeyId ||
  !GDevelopGamesPreview.secretAccessKey
) {
  console.warn(
    "Either REACT_APP_PREVIEW_S3_ACCESS_KEY_ID or REACT_APP_PREVIEW_S3_SECRET_ACCESS_KEY are not defined. Preview in browsers won't be working"
  );
  console.info(
    'Copy .env.dist file to .env and fill the values to fix this warning.'
  );
}

export const Auth0Config = {
  domain: '4ian.eu.auth0.com',
  clientId: 'vpsTe5CLJNp7K4nM1nQHzpkentyIZX5U',
  lockOptions: {
    autoclose: true,
    theme: {
      logo:
        'https://raw.githubusercontent.com/4ian/GD/gh-pages/res/icon128linux.png',
      primaryColor: '#4ab0e4',
    },
    auth: {
      responseType: 'token id_token',
      audience: `https://4ian.eu.auth0.com/userinfo`,
      params: {
        scope: 'openid profile email',
      },
      redirect: false,
    },
  },
};

export const GDevelopUsageApi = {
  baseUrl: isDev
    ? 'https://tc1jkfw4ul.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://qe7jiozpz9.execute-api.us-east-1.amazonaws.com/live',
};
