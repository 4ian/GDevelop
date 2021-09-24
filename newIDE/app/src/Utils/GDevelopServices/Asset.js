// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';
import { type Filters } from './Types.flow';
import { type UserPublicProfile } from './User';

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

export type AllAssets = {|
  assetShortHeaders: Array<AssetShortHeader>,
  filters: Filters,
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

export type ExampleShortHeader = {|
  id: string,
  name: string,
  shortDescription: string,
  license: string,
  tags: Array<string>,
  authors?: Array<UserPublicProfile>,
  previewImageUrls: Array<string>,
  gdevelopVersion: string,
|};

export type Example = {|
  ...ExampleShortHeader,
  description: string,
  projectFileUrl: string,
  authors: Array<string>,
|};

export type AllExamples = {|
  exampleShortHeaders: Array<ExampleShortHeader>,
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

export const listAllAssets = (): Promise<AllAssets> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/asset`)
    .then(response => response.data)
    .then(({ assetShortHeadersUrl, filtersUrl }) => {
      if (!assetShortHeadersUrl || !filtersUrl) {
        throw new Error('Unexpected response from the resource endpoint.');
      }
      return Promise.all([
        axios.get(assetShortHeadersUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([assetShortHeaders, filters]) => ({
        assetShortHeaders,
        filters,
      }));
    });
};

export const getAsset = (
  assetShortHeader: AssetShortHeader
): Promise<Asset> => {
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

export const listAllExamples = (): Promise<AllExamples> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/example`)
    .then(response => response.data)
    .then(({ exampleShortHeadersUrl, filtersUrl }) => {
      if (!exampleShortHeadersUrl || !filtersUrl) {
        throw new Error('Unexpected response from the example endpoint.');
      }
      return Promise.all([
        axios.get(exampleShortHeadersUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([exampleShortHeaders, filters]) => ({
        exampleShortHeaders,
        filters,
      }));
    });
};

export const getExample = (
  exampleShortHeader: ExampleShortHeader
): Promise<Example> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/example/${exampleShortHeader.id}`)
    .then(response => response.data)
    .then(({ exampleUrl }) => {
      if (!exampleUrl) {
        throw new Error('Unexpected response from the example endpoint.');
      }

      return axios.get(exampleUrl);
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

export const isPixelArt = (assetShortHeader: AssetShortHeader) => {
  return assetShortHeader.tags.some(tag => {
    return tag.toLowerCase() === 'pixel art';
  });
};
