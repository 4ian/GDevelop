// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';
import { type Filters } from './Filters';

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

export type AssetCustomization =
  | {|
      required: boolean,
      extensionName: string,
      extensionVersion: string,
      behaviorName: string,
      behaviorType: string,
      properties: Array<SerializedParameterMetadata>,
    |}
  | {|
      required: boolean,
      parameters: Array<SerializedParameterMetadata>,
      extensions: Array<{|
        extensionName: string,
        extensionVersion: string,
      |}>,
    |};

export type ObjectAsset = {|
  object: any /*(serialized gdObject)*/,
  resources: Array<any /*(serialized gdResource)*/>,
  customization: Array<AssetCustomization>,
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
  license: string,
  objectAssets: Array<ObjectAsset>,
|};

export type AssetPack = {|
  name: string,
  tag: string,
  thumbnailUrl: string,
  assetsCount: number,
  externalWebLink?: ?string,
  userFriendlyPrice?: ?string,
|};

export type AssetPacks = {|
  starterPacks: Array<AssetPack>,
|};

type PrivateAssetPackAssetType =
  | 'font'
  | 'audio'
  | 'sprite'
  | '9patch'
  | 'tiled'
  | 'partial'
  | 'particleEmitter';

export type PrivateAssetPackContent = { [PrivateAssetPackAssetType]: number };

export type PrivateAssetPackDetails = {|
  id: string,
  previewImageUrls: Array<string>,
  updatedAt: string,
  createdAt: string,
  tag: string,
  longDescription: string,
  content: PrivateAssetPackContent,
|};

export type AllAssets = {|
  assetShortHeaders: Array<AssetShortHeader>,
  filters: Filters,
  assetPacks: AssetPacks,
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

export type License = {|
  name: string,
  website: string,
|};

export type Author = {|
  name: string,
  website: string,
|};

export type Environment = 'staging' | 'live';

export const client = axios.create({
  baseURL: GDevelopAssetApi.baseUrl,
});

/** Check if the IDE version, passed as argument, satisfy the version required by the asset. */
export const isCompatibleWithAsset = (
  ideVersion: string,
  assetHeader: { gdevelopVersion: string }
) =>
  assetHeader.gdevelopVersion
    ? semverSatisfies(ideVersion, assetHeader.gdevelopVersion, {
        includePrerelease: true,
      })
    : true;

export const listAllAssets = ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AllAssets> => {
  return client
    .get(`/asset`, {
      params: {
        environment,
      },
    })
    .then(response => response.data)
    .then(({ assetShortHeadersUrl, filtersUrl, assetPacksUrl }) => {
      if (!assetShortHeadersUrl || !filtersUrl || !assetPacksUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }

      return Promise.all([
        client.get(assetShortHeadersUrl).then(response => response.data),
        client.get(filtersUrl).then(response => response.data),
        client.get(assetPacksUrl).then(response => response.data),
      ]).then(([assetShortHeaders, filters, assetPacks]) => ({
        assetShortHeaders,
        filters,
        assetPacks,
      }));
    });
};

export const getAsset = (
  assetShortHeader: AssetShortHeader,
  { environment }: {| environment: Environment |}
): Promise<Asset> => {
  return client
    .get(`/asset/${assetShortHeader.id}`, {
      params: {
        environment,
      },
    })
    .then(response => response.data)
    .then(({ assetUrl }) => {
      if (!assetUrl) {
        throw new Error('Unexpected response from the asset endpoint.');
      }

      return client.get(assetUrl);
    })
    .then(response => response.data);
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
      ]).then(([resources, filters]) => ({
        resources,
        filters,
      }));
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

export const getPrivateAssetPackDetails = async (
  assetPackId: string
): Promise<?PrivateAssetPackDetails> => {
  const response = await client.get(`/asset-pack/${assetPackId}`);
  return response.data;
};

export const isPixelArt = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  return assetOrAssetShortHeader.tags.some(tag => {
    return tag.toLowerCase() === 'pixel art';
  });
};
