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
      events: any /*(serialized gdEventsList)*/,
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

const stagingBucket = 'https://resources.gdevelop-app.com/staging';
const devAssetShortHeadersUrl = `${stagingBucket}/assets-database/assetShortHeaders.json`;
const devFiltersUrl = `${stagingBucket}/assets-database/assetFilters.json`;
const devAssetPacksUrl = `${stagingBucket}/assets-database/assetPacks.json`;

export const listAllAssets = (
  showStagingAssets: boolean
): Promise<AllAssets> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/asset`)
    .then(response => response.data)
    .then(({ assetShortHeadersUrl, filtersUrl, assetPacksUrl }) => {
      if (!assetShortHeadersUrl || !filtersUrl || !assetPacksUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }

      return Promise.all([
        axios
          .get(
            showStagingAssets ? devAssetShortHeadersUrl : assetShortHeadersUrl
          )
          .then(response => response.data),
        axios
          .get(showStagingAssets ? devFiltersUrl : filtersUrl)
          .then(response => response.data),
        axios
          .get(showStagingAssets ? devAssetPacksUrl : assetPacksUrl)
          .then(response => response.data),
      ]).then(([assetShortHeaders, filters, assetPacks]) => ({
        assetShortHeaders,
        filters,
        assetPacks,
      }));
    });
};

export const getAsset = (
  assetShortHeader: AssetShortHeader,
  { isStagingAsset }: { isStagingAsset: boolean }
): Promise<Asset> => {
  if (isStagingAsset) {
    return axios
      .get(
        `${stagingBucket}/assets-database/assets/${assetShortHeader.id}.json`
      )
      .then(response => response.data);
  }
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/asset/${assetShortHeader.id}`)
    .then(response => response.data)
    .then(({ assetUrl }) => {
      if (!assetUrl) {
        throw new Error('Unexpected response from the asset endpoint.');
      }

      return axios.get(assetUrl);
    })
    .then(response => response.data);
};

export const listAllResources = (): Promise<AllResources> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/resource`)
    .then(response => response.data)
    .then(({ resourcesUrl, filtersUrl }) => {
      if (!resourcesUrl || !filtersUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }
      return Promise.all([
        axios.get(resourcesUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([resources, filters]) => ({
        resources,
        filters,
      }));
    });
};

export const listAllAuthors = (): Promise<Array<Author>> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/author`)
    .then(response => response.data)
    .then(({ authorsUrl }) => {
      if (!authorsUrl)
        throw new Error('Unexpected response from author endpoint.');
      return axios.get(authorsUrl);
    })
    .then(response => response.data);
};

export const listAllLicenses = (): Promise<Array<License>> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/license`)
    .then(response => response.data)
    .then(({ licensesUrl }) => {
      if (!licensesUrl)
        throw new Error('Unexpected response from license endpoint.');
      return axios.get(licensesUrl);
    })
    .then(response => response.data);
};

export const isPixelArt = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  return assetOrAssetShortHeader.tags.some(tag => {
    return tag.toLowerCase() === 'pixel art';
  });
};
