// @flow
import Window from '../Window';

const isDev = Window.isDev();

const trimTrailingSlash = (url: string): string => url.replace(/\/$/, '');

const optionalProxyPath = (proxyPath: ?string): ?string =>
  proxyPath ? trimTrailingSlash(proxyPath) : null;

const gdevelopApiProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_API_PROXY_PATH
);
const gdevelopApiWebSocketProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_API_WS_PROXY_PATH
);
const gdevelopResourcesProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_RESOURCES_PROXY_PATH
);
const gdevelopPublicResourcesProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_PUBLIC_RESOURCES_PROXY_PATH
);
const gdevelopProjectResourcesProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_PROJECT_RESOURCES_PROXY_PATH
);
const gdevelopPrivateAssetsProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_PRIVATE_ASSETS_PROXY_PATH
);
const gdevelopPrivateGameTemplatesProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_PRIVATE_GAME_TEMPLATES_PROXY_PATH
);
const gdevelopAssetResourcesProxyPath = optionalProxyPath(
  process.env.REACT_APP_GDEVELOP_ASSET_RESOURCES_PROXY_PATH
);

const getGDevelopApiBaseUrl = (apiName: string): string => {
  if (gdevelopApiProxyPath) return `${gdevelopApiProxyPath}/${apiName}`;

  return isDev
    ? `https://api-dev.gdevelop.io/${apiName}`
    : `https://api.gdevelop.io/${apiName}`;
};

const getGDevelopApiWebSocketBaseUrl = (): string => {
  if (gdevelopApiWebSocketProxyPath) {
    const protocol =
      typeof window !== 'undefined' && window.location.protocol === 'https:'
        ? 'wss:'
        : 'ws:';
    const host =
      typeof window !== 'undefined' && window.location.host
        ? window.location.host
        : '';

    if (host) {
      return `${protocol}//${host}${gdevelopApiWebSocketProxyPath}/authorization`;
    }
  }

  return isDev
    ? 'wss://api-ws-dev.gdevelop.io/authorization'
    : 'wss://api-ws.gdevelop.io/authorization';
};

export const GDevelopGamePreviews = {
  baseUrl: `https://game-previews.gdevelop.io/`,
};

export const GDevelopGamesPlatform = {
  getInstantBuildUrl: (buildId: string): string =>
    isDev
      ? `https://gd.games/instant-builds/${buildId}?dev=true`
      : `https://gd.games/instant-builds/${buildId}`,
  getGameUrl: (gameId: string): string =>
    isDev
      ? `https://gd.games/games/${gameId}?dev=true`
      : `https://gd.games/games/${gameId}`,
  getGameUrlWithSlug: (userSlug: string, gameSlug: string): string =>
    isDev
      ? `https://gd.games/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}?dev=true`
      : `https://gd.games/${userSlug.toLowerCase()}/${gameSlug.toLowerCase()}`,
  getUserPublicProfileUrl: (userId: string, username: ?string): string =>
    username
      ? `https://gd.games/${username}${isDev ? '?dev=true' : ''}`
      : `https://gd.games/user/${userId}${isDev ? '?dev=true' : ''}`,
};

export const GDevelopFirebaseConfig = {
  apiKey: 'AIzaSyAnX9QMacrIl3yo4zkVFEVhDppGVDDewBc',
  authDomain: 'gdevelop-services.firebaseapp.com',
  databaseURL: 'https://gdevelop-services.firebaseio.com',
  projectId: 'gdevelop-services',
  storageBucket: 'gdevelop-services.appspot.com',
  messagingSenderId: '44882707384',
};

export const GDevelopAuthorizationWebSocketApi = {
  baseUrl: ((getGDevelopApiWebSocketBaseUrl(): string): string),
};

export const GDevelopBuildApi = {
  baseUrl: ((getGDevelopApiBaseUrl('build'): string): string),
};

export const GDevelopUsageApi = {
  baseUrl: ((getGDevelopApiBaseUrl('usage'): string): string),
};

export const GDevelopReleaseApi = {
  baseUrl: ((getGDevelopApiBaseUrl('release'): string): string),
};

export const GDevelopAssetApi = {
  baseUrl: ((getGDevelopApiBaseUrl('asset'): string): string),
};

export const GDevelopAssetCdn = {
  baseUrl: {
    staging: gdevelopResourcesProxyPath
      ? `${gdevelopResourcesProxyPath}/staging/assets-database`
      : 'https://resources.gdevelop-app.com/staging/assets-database',
    live: gdevelopResourcesProxyPath
      ? `${gdevelopResourcesProxyPath}/assets-database`
      : 'https://resources.gdevelop-app.com/assets-database',
  },
};

export const GDevelopAnalyticsApi = {
  baseUrl: ((getGDevelopApiBaseUrl('analytics'): string): string),
};

export const GDevelopGameApi = {
  baseUrl: ((getGDevelopApiBaseUrl('game'): string): string),
};

export const GDevelopUserApi = {
  baseUrl: ((getGDevelopApiBaseUrl('user'): string): string),
};

export const GDevelopPlayApi = {
  baseUrl: ((getGDevelopApiBaseUrl('play'): string): string),
};

export const GDevelopShopApi = {
  baseUrl: ((getGDevelopApiBaseUrl('shop'): string): string),
};

export const GDevelopProjectApi = {
  baseUrl: ((getGDevelopApiBaseUrl('project'): string): string),
};

export const GDevelopGenerationApi = {
  baseUrl: ((getGDevelopApiBaseUrl('generation'): string): string),
};

export const GDevelopAiCdn = {
  baseUrl: {
    staging: gdevelopPublicResourcesProxyPath
      ? `${gdevelopPublicResourcesProxyPath}/staging/ai`
      : 'https://public-resources.gdevelop.io/staging/ai',
    live: gdevelopPublicResourcesProxyPath
      ? `${gdevelopPublicResourcesProxyPath}/ai`
      : 'https://public-resources.gdevelop.io/ai',
  },
};

export const GDevelopProjectResourcesStorage = {
  baseUrl: ((gdevelopProjectResourcesProxyPath ||
    (isDev
      ? 'https://project-resources-dev.gdevelop.io'
      : 'https://project-resources.gdevelop.io'): string): string),
};

export const GDevelopPrivateAssetsStorage = {
  baseUrl: ((gdevelopPrivateAssetsProxyPath ||
    (isDev
      ? 'https://private-assets-dev.gdevelop.io'
      : 'https://private-assets.gdevelop.io'): string): string),
};

export const GDevelopPrivateGameTemplatesStorage = {
  baseUrl: ((gdevelopPrivateGameTemplatesProxyPath ||
    (isDev
      ? 'https://private-game-templates-dev.gdevelop.io'
      : 'https://private-game-templates.gdevelop.io'): string): string),
};

export const GDevelopPublicAssetResourcesStorageBaseUrl =
  gdevelopAssetResourcesProxyPath || 'https://asset-resources.gdevelop.io';
export const GDevelopPublicAssetResourcesStorageStagingBaseUrl =
  gdevelopAssetResourcesProxyPath
    ? `${gdevelopAssetResourcesProxyPath}/staging`
    : 'https://asset-resources.gdevelop.io/staging';
