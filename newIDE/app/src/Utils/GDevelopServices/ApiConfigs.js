// @flow
import Window from '../Window';

const isDev = Window.isDev();

export const GDevelopGamePreviews = {
  baseUrl: `https://game-previews.gdevelop.io/`,
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

export const GDevelopFirebaseConfig = {
  apiKey: 'AIzaSyAnX9QMacrIl3yo4zkVFEVhDppGVDDewBc',
  authDomain: 'gdevelop-services.firebaseapp.com',
  databaseURL: 'https://gdevelop-services.firebaseio.com',
  projectId: 'gdevelop-services',
  storageBucket: 'gdevelop-services.appspot.com',
  messagingSenderId: '44882707384',
};

export const GDevelopBuildApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/build'
    : 'https://api.gdevelop.io/build',
};

export const GDevelopUsageApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/usage'
    : 'https://api.gdevelop.io/usage',
};

export const GDevelopReleaseApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/release'
    : 'https://api.gdevelop.io/release',
};

export const GDevelopAssetApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/asset'
    : 'https://api.gdevelop.io/asset',
};

export const GDevelopAnalyticsApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/analytics'
    : 'https://api.gdevelop.io/analytics',
};

export const GDevelopGameApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/game'
    : 'https://api.gdevelop.io/game',
};

export const GDevelopUserApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/user'
    : 'https://api.gdevelop.io/user',
};

export const GDevelopPlayApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/play'
    : 'https://api.gdevelop.io/play',
};

export const GDevelopShopApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/shop'
    : 'https://api.gdevelop.io/shop',
};

export const GDevelopProjectApi = {
  baseUrl: isDev
    ? 'https://api-dev.gdevelop.io/project'
    : 'https://api.gdevelop.io/project',
};

export const GDevelopProjectResourcesStorage = {
  baseUrl: isDev
    ? 'https://project-resources-dev.gdevelop.io'
    : 'https://project-resources.gdevelop.io',
};
