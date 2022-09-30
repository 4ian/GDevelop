// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';
import { type UserPublicProfile } from './User';

type ExtensionTier = 'community' | 'reviewed';

export type ExtensionShortHeader = {|
  tier: ExtensionTier,
  shortDescription: string,
  authors?: Array<UserPublicProfile>,
  extensionNamespace: string,
  fullName: string,
  name: string,
  version: string,
  gdevelopVersion?: string,
  url: string,
  headerUrl: string,
  tags: Array<string>,
  category: string,
  previewIconUrl: string,
  eventsBasedBehaviorsCount: number,
  eventsFunctionsCount: number,
|};
export type ExtensionHeader = {|
  ...ExtensionShortHeader,
  helpPath: string,
  description: string,
  iconUrl: string,
|};

/**
 * This represents a serialized `gdEventsFunctionsExtension`.
 * This can be fed to the `unserializeFrom` function from `gdEventsFunctionsExtension`.
 *
 * Avoid manipulating this directly: it *can* have similar fields to an `ExtensionHeader` or
 * an `ExtensionShortHeader`, but not all the fields from the headers will be there. For example,
 * the `url` and `headerUrl` are only in the headers, but not in the serialized extension.
 * This is because these fields are specific to the extensions store.
 */
export type SerializedExtension = {
  name: string,

  // This type is inexact because the typing is not complete.
};

export type ExtensionsRegistry = {
  version: string,
  allTags: Array<string>,
  allCategories: Array<string>,
  extensionShortHeaders: Array<ExtensionShortHeader>,
  views?: {
    default: {
      firstExtensionIds: Array<string>,
    },
  },
};

/**
 * The ExtensionHeader returned by the API, with tags being a string
 * (which is kept in the API for compatibility with older GDevelop versions).
 */
type ExtensionHeaderWithTagsAsString = {|
  ...ExtensionHeader,
  tags: string,
|};

/**
 * The SerializedExtension returned by the API, with tags being a string
 * (which is kept in the API for compatibility with older GDevelop versions).
 */
type SerializedExtensionWithTagsAsString = {
  ...SerializedExtension,
  tags: string,
};

/**
 * Transform the tags from their old representation sent by the API (a string)
 * to their new representation (array of strings).
 */
const transformTagsAsStringToTagsAsArray = <T: { tags: string }>(
  dataWithTags: T
): $Exact<{ ...T, tags: Array<string> }> => {
  // Handle potential future update of the API that would
  // return tags as an array of strings.
  if (Array.isArray(dataWithTags.tags)) {
    // $FlowIgnore
    return dataWithTags;
  }

  // $FlowIgnore - ignore issue with non exact types
  return {
    ...dataWithTags,
    tags: dataWithTags.tags.split(',').map(tag => tag.trim().toLowerCase()),
  };
};

/** Check if the IDE version, passed as argument, satisfiy the version required by the extension. */
export const isCompatibleWithExtension = (
  ideVersion: string,
  extensionShortHeader: ExtensionShortHeader
) =>
  extensionShortHeader.gdevelopVersion
    ? semverSatisfies(ideVersion, extensionShortHeader.gdevelopVersion, {
        includePrerelease: true,
      })
    : true;

export const getExtensionsRegistry = (): Promise<ExtensionsRegistry> => {
  return axios
    .get(`${GDevelopAssetApi.baseUrl}/extensions-registry`)
    .then(response => response.data)
    .then(extensionsRegistry => {
      return {
        ...extensionsRegistry,
        // TODO: move this to backend endpoint
        extensionShortHeaders: extensionsRegistry.extensionShortHeaders.map(
          transformTagsAsStringToTagsAsArray
        ),
      };
    });
};

export const getExtensionHeader = (
  extensionShortHeader: ExtensionShortHeader
): Promise<ExtensionHeader> => {
  return axios.get(extensionShortHeader.headerUrl).then(response => {
    const data: ExtensionHeaderWithTagsAsString = response.data;
    const transformedData: ExtensionHeader = transformTagsAsStringToTagsAsArray(
      data
    );
    return transformedData;
  });
};

export const getExtension = (
  extensionHeader: ExtensionShortHeader | ExtensionHeader
): Promise<SerializedExtension> => {
  return axios.get(extensionHeader.url).then(response => {
    const data: SerializedExtensionWithTagsAsString = response.data;
    const transformedData: SerializedExtension = transformTagsAsStringToTagsAsArray(
      data
    );
    return transformedData;
  });
};

export const getUserExtensionShortHeaders = async (
  authorId: string
): Promise<Array<ExtensionShortHeader>> => {
  const response = await axios.get(
    `${GDevelopAssetApi.baseUrl}/extension-short-header`,
    {
      params: {
        authorId,
      },
    }
  );

  return response.data;
};
