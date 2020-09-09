// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';

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

export type TagsTreeNode = {|
  name: string,
  children: Array<TagsTreeNode>,
  allChildrenTags: Array<string>,
|};

export type Filters = {|
  allTags: Array<string>,
  defaultTags: Array<string>,
  tagsTree: Array<TagsTreeNode>,
|};

export type AllAssets = {|
  assetShortHeaders: Array<AssetShortHeader>,
  filters: Filters,
|};

export type Resource = {|
  url: string,
  type: string,
  tags: Array<string>,
|};

export type AllResources = {|
  resources: Array<Resource>,
  filters: Filters,
|};


/** Check if the IDE version, passed as argument, satisfy the version required by the asset. */
export const isCompatibleWithAsset = (
  ideVersion: string,
  assetHeader: AssetHeader
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
    .then(({ assetUrl }) => axios.get(assetUrl))
    .then(response => response.data);
};

export const listAllResources = (): Promise<AllResources> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/resource`)
    .then(response => response.data)
    .then(({ resourcesUrl, filtersUrl }) => {
      return Promise.all([
        axios.get(resourcesUrl).then(response => response.data),
        axios.get(filtersUrl).then(response => response.data),
      ]).then(([resources, filters]) => ({
        resources,
        filters,
      }));
    });
};
