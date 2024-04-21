// @flow
import axios from 'axios';
import {
  GDevelopAssetApi,
  GDevelopPrivateAssetsStorage,
  GDevelopPrivateGameTemplatesStorage,
  GDevelopPublicAssetResourcesStorageBaseUrl,
  GDevelopPublicAssetResourcesStorageStagingBaseUrl,
} from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';
import { type Filters } from './Filters';
import {
  type PrivateGameTemplateListingData,
  createProductAuthorizedUrl,
  isPrivateAssetResourceAuthorizedUrl,
} from './Shop';

export type License = {|
  name: string,
  website: string,
|};

export type Author = {|
  name: string,
  website: string,
|};

export type SerializedParameterMetadata = {|
  codeOnly: boolean,
  defaultValue: string,
  description: string,
  longDescription: string,
  name: string,
  optional: boolean,
  supplementaryInformation: string,
  type: string, // See ParameterRenderingService for valid types.
|};

export type ExtensionDependency = {|
  extensionName: string,
  extensionVersion: string,
|};

export type ObjectAsset = {|
  object: any /*(serialized gdObjectConfiguration)*/,
  resources: Array<any /*(serialized gdResource)*/>,
  // TODO This can become mandatory after the migration of the asset repository.
  requiredExtensions?: Array<ExtensionDependency>,
|};

export type AssetShortHeader = {|
  id: string,
  name: string,
  shortDescription: string,
  previewImageUrls: Array<string>,
  tags: Array<string>,
  license: string,
  objectType: string,
  animationsCount: number,
  maxFramesCount: number,
  width: number,
  height: number,
  dominantColors: number[],
  assetPackId?: string,
|};

export type AssetHeader = {|
  ...AssetShortHeader,
  gdevelopVersion: string,
  version: string,
  description: string,
|};

export type Asset = {|
  ...AssetHeader,
  authors: Array<string>,
  authorIds?: Array<string>,
  license: string,
  objectAssets: Array<ObjectAsset>,
|};

export type PublicAssetPack = {|
  name: string,
  tag: string,
  thumbnailUrl: string,
  assetsCount: number,
  externalWebLink?: ?string,
  userFriendlyPrice?: ?string,
  categories: Array<string>,
  authors: Array<Author>,
  licenses: Array<License>,
|};

export type PublicAssetPacks = {|
  starterPacks: Array<PublicAssetPack>,
|};

type PrivateAssetPackAssetType =
  | 'font'
  | 'audio'
  | 'sprite'
  | '9patch'
  | 'tiled'
  | 'partial'
  | 'particleEmitter'
  | 'Scene3D::Model3DObject';

export type PrivateAssetPackContent = { [PrivateAssetPackAssetType]: number };

export type PrivateAssetPack = {|
  id: string,
  name: string,
  previewImageUrls: Array<string>,
  previewSoundUrls?: Array<string>,
  updatedAt: string,
  createdAt: string,
  tag: string,
  longDescription: string,
  content: PrivateAssetPackContent,
|};

export type PrivateGameTemplate = {|
  id: string,
  name: string,
  previewImageUrls: Array<string>,
  updatedAt: string,
  createdAt: string,
  tag: string,
  longDescription: string,
  gamePreviewLink: string,
|};

export type AllPublicAssets = {|
  publicAssetShortHeaders: Array<AssetShortHeader>,
  publicFilters: Filters,
  publicAssetPacks: PublicAssetPacks,
|};

export type Resource = {|
  url: string,
  name: string,
  license: string,
  type: string,
  tags: Array<string>,
|};

export type AllResources = {|
  resources: Array<Resource>,
  filters: Filters,
|};

export type Environment = 'staging' | 'live';

export const client = axios.create({
  baseURL: GDevelopAssetApi.baseUrl,
});

export const isAssetPackAudioOnly = (assetPack: PrivateAssetPack): boolean => {
  const contentKeys = Object.keys(assetPack.content);
  return contentKeys.length === 1 && contentKeys[0] === 'audio';
};
export const doesAssetPackContainAudio = (
  assetPack: PrivateAssetPack
): boolean => !!assetPack.content.audio && assetPack.content.audio > 0;

/**
 * Check if the IDE version, passed as argument, satisfy the version required by the asset.
 */
export const isCompatibleWithAsset = (
  ideVersion: string,
  assetHeader: { gdevelopVersion: string }
) =>
  assetHeader.gdevelopVersion
    ? semverSatisfies(ideVersion, assetHeader.gdevelopVersion, {
        includePrerelease: true,
      })
    : true;

export const listAllPublicAssets = async ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AllPublicAssets> => {
  const response = await client.get(`/asset`, {
    params: {
      environment,
    },
  });

  const { assetShortHeadersUrl, filtersUrl, assetPacksUrl } = response.data;

  const responsesData = await Promise.all([
    client
      .get(assetShortHeadersUrl)
      .then(response => response.data)
      .catch(e => e),
    client
      .get(filtersUrl)
      .then(response => response.data)
      .catch(e => e),
    client
      .get(assetPacksUrl)
      .then(response => response.data)
      .catch(e => e),
  ]);

  if (responsesData.some(data => !data || data instanceof Error)) {
    throw new Error('Unexpected response from the assets endpoints.');
  }

  const publicAssetShortHeaders = responsesData[0];
  const publicFilters = responsesData[1];
  const publicAssetPacks = responsesData[2];

  if (!publicAssetPacks.starterPacks) {
    throw new Error(
      'Unexpected response from the public asset packs endpoint.'
    );
  }

  return {
    publicAssetShortHeaders,
    publicFilters,
    publicAssetPacks,
  };
};

export const getPublicAsset = async (
  assetShortHeader: AssetShortHeader,
  { environment }: {| environment: Environment |}
): Promise<Asset> => {
  const response = await client.get(`/asset/${assetShortHeader.id}`, {
    params: {
      environment,
    },
  });
  if (!response.data.assetUrl) {
    throw new Error('Unexpected response from the asset endpoint.');
  }

  const assetResponse = await client.get(response.data.assetUrl);
  return assetResponse.data;
};

export const getPrivateAsset = async (
  assetShortHeader: AssetShortHeader,
  authorizationToken: string,
  { environment }: {| environment: Environment |}
): Promise<Asset> => {
  const privateAssetPackId = assetShortHeader.assetPackId;
  if (!privateAssetPackId) {
    throw new Error('The asset does not have a private asset pack id.');
  }
  const assetUrl = `${
    GDevelopPrivateAssetsStorage.baseUrl
  }/${privateAssetPackId}/${assetShortHeader.id}.json`;
  const authorizedUrl = createProductAuthorizedUrl(
    assetUrl,
    authorizationToken
  );
  const assetResponse = await client.get(authorizedUrl);
  return assetResponse.data;
};

export const getPrivateAssetPackAudioFilesArchiveUrl = (
  privateAssetPackId: string,
  authorizationToken: string
): string => {
  const assetUrl = `${
    GDevelopPrivateAssetsStorage.baseUrl
  }/${privateAssetPackId}/resources/audio.zip`;
  const authorizedUrl = createProductAuthorizedUrl(
    assetUrl,
    authorizationToken
  );
  return authorizedUrl;
};

export const listAllResources = ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AllResources> => {
  return client
    .get(`/resource`, {
      params: {
        environment,
      },
    })
    .then(response => response.data)
    .then(({ resourcesUrl, filtersUrl }) => {
      if (!resourcesUrl || !filtersUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }
      return Promise.all([
        client.get(resourcesUrl).then(response => response.data),
        client.get(filtersUrl).then(response => response.data),
      ]).then(([resources, filters]) => {
        if (!resources || !filters) {
          throw new Error('Unexpected response from the resources endpoints.');
        }
        return {
          resources,
          filters,
        };
      });
    });
};

export const listAllAuthors = ({
  environment,
}: {|
  environment: Environment,
|}): Promise<Array<Author>> => {
  return client
    .get(`/author`, {
      params: {
        environment,
      },
    })
    .then(response => response.data)
    .then(({ authorsUrl }) => {
      if (!authorsUrl)
        throw new Error('Unexpected response from author endpoint.');
      return client.get(authorsUrl);
    })
    .then(response => response.data);
};

export const listAllLicenses = ({
  environment,
}: {|
  environment: Environment,
|}): Promise<Array<License>> => {
  return client
    .get(`/license`, {
      params: {
        environment,
      },
    })
    .then(response => response.data)
    .then(({ licensesUrl }) => {
      if (!licensesUrl)
        throw new Error('Unexpected response from license endpoint.');
      return client.get(licensesUrl);
    })
    .then(response => response.data);
};

export const getPrivateAssetPack = async (
  assetPackId: string
): Promise<PrivateAssetPack> => {
  const response = await client.get(`/asset-pack/${assetPackId}`);
  return response.data;
};

export const getPrivateGameTemplate = async (
  gameTemplateId: string
): Promise<PrivateGameTemplate> => {
  const response = await client.get(`/game-template/${gameTemplateId}`);
  return response.data;
};

export const createPrivateGameTemplateUrl = async (
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  authorizationToken: string
): Promise<string> => {
  const gameTemplateUrl = `${GDevelopPrivateGameTemplatesStorage.baseUrl}/${
    privateGameTemplateListingData.id
  }/game.json`;
  const authorizedUrl = createProductAuthorizedUrl(
    gameTemplateUrl,
    authorizationToken
  );
  return authorizedUrl;
};

export const isPixelArt = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  return assetOrAssetShortHeader.tags.some(tag => {
    return tag.toLowerCase() === 'pixel art';
  });
};

export const isPrivateAsset = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  const imageUrl = assetOrAssetShortHeader.previewImageUrls[0];
  return !!imageUrl && isPrivateAssetResourceAuthorizedUrl(imageUrl);
};

export const listReceivedAssetShortHeaders = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<AssetShortHeader>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/asset-short-header', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listReceivedAssetPacks = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<PrivateAssetPack>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/asset-pack', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listReceivedGameTemplates = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<PrivateGameTemplate>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/game-template', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const isPublicAssetResourceUrl = (url: string) =>
  url.startsWith(GDevelopPublicAssetResourcesStorageBaseUrl) ||
  url.startsWith(GDevelopPublicAssetResourcesStorageStagingBaseUrl);
const escapeStringForRegExp = string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
const resourceFilenameRegex = new RegExp(
  `(${escapeStringForRegExp(
    GDevelopPublicAssetResourcesStorageBaseUrl
  )}|${escapeStringForRegExp(
    GDevelopPublicAssetResourcesStorageStagingBaseUrl
  )})\\/public-resources\\/(.*)\\/([a-z0-9]{64})_(.*)`
);
export const extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl = (
  url: string
): string => {
  const matches = resourceFilenameRegex.exec(url);
  if (!matches) {
    throw new Error('The URL is not a valid public asset resource URL: ' + url);
  }
  const filenameWithExtension = matches[4];
  const decodedFilenameWithExtension = decodeURIComponent(
    filenameWithExtension
  );
  return decodedFilenameWithExtension;
};
