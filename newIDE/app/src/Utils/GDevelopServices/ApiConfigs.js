// @flow
import Window from '../Window';

const isDev = Window.isDev();

export const GDevelopGamePreviews = {
  baseUrl: `https://game-previews.gdevelop-app.com/`,
};

export const GDevelopGamesPlatform = {
  getInstantBuildUrl: (buildId: string) =>
    isDev
      ? `https://liluo.io/instant-builds/${buildId}?dev=true`
      : `https://liluo.io/instant-builds/${buildId}`,
  getGameUrl: (gameId: string) =>
    isDev
      ? `https://liluo.io/games/${gameId}?dev=true`
      : `https://liluo.io/games/${gameId}`,
  getGameUrlWithSlug: (userSlug: string, gameSlug: string) =>
    isDev
      ? `https://liluo.io/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}?dev=true`
      : `https://liluo.io/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}`,
  getUserPublicProfileUrl: (userId: string, username: ?string) =>
    username
      ? `https://liluo.io/${username}${isDev ? '?dev=true' : ''}`
      : `https://liluo.io/user/${userId}${isDev ? '?dev=true' : ''}`,
};

export const GDevelopBuildApi = {
  baseUrl: isDev
    ? 'https://69p4m07edd.execute-api.us-east-1.amazonaws.com/dev'
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

export const GDevelopAssetApi = {
  baseUrl: isDev
    ? 'https://57l4cj31aj.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/asset',
};

export const GDevelopAnalyticsApi = {
  baseUrl: isDev
    ? 'https://fixpe96o0h.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/analytics',
};

export const GDevelopGameApi = {
  baseUrl: isDev
    ? 'https://we7eqjifc2.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/game',
};

export const GDevelopUserApi = {
  baseUrl: isDev
    ? 'https://yrun9q6udj.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/user',
};

export const GDevelopPlayApi = {
  baseUrl: isDev
    ? 'https://n9dsp0xfw6.execute-api.us-east-1.amazonaws.com/dev'
    : 'https://api.gdevelop-app.com/play',
};

export const GDevelopProjectApi = {
  baseUrl: 'https://api-local.gdevelop.io:3010/dev'
}