// @flow
import axios from 'axios';
import { GDevelopExtensionApi } from './ApiConfigs';
import semverSatisfies from 'semver/functions/satisfies';

export type ExtensionShortHeader = {|
  shortDescription: string,
  extensionNamespace: string,
  fullName: string,
  name: string,
  version: string,
  gdevelopVersion?: string,
  url: string,
  headerUrl: string,
  tags: Array<string>,
  previewIconUrl: string,
  eventsBasedBehaviorsCount: number,
  eventsFunctionsCount: number,
|};
export type ExtensionHeader = {|
  ...ExtensionShortHeader,
  description: string,
  iconUrl: string,
|};

export type SerializedExtension = {
  ...ExtensionHeader,
};

export type ExtensionsRegistry = {
  version: string,
  allTags: Array<string>,
  extensionShortHeaders: Array<ExtensionShortHeader>,
};

/**
 * The ExtensionShortHeader returned by the API, with tags being a string
 * (which is kept in the API for compatibility with older GDevelop versions).
 */
type ExtensionShortHeaderWithTagsAsString = {|
  ...ExtensionShortHeader,
  tags: string,
|};

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
 * The ExtensionsRegistry returned by the API, with tags being a string
 * (which is kept in the API for compatibility with older GDevelop versions).
 */
type ExtensionsRegistryWithTagsAsString = {
  ...ExtensionsRegistry,
  extensionShortHeaders: Array<ExtensionShortHeaderWithTagsAsString>,
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

// Handle urls to extension header or file. If the URL is not absolute and HTTPS,
// it is assumed to be relative to the registry base url.
const resolveExtensionUrl = (url: string): string => {
  const trimmedUrl = url.trim();
  if (trimmedUrl.indexOf('https://') === 0) {
    return trimmedUrl;
  }

  return `${GDevelopExtensionApi.baseUrl}/${trimmedUrl}`;
};

export const getExtensionsRegistry = (): Promise<ExtensionsRegistry> => {
  return axios
    .get(`${GDevelopExtensionApi.baseUrl}/extensions-registry.json`)
    .then(response => {
      const data: ExtensionsRegistryWithTagsAsString = response.data;

      return {
        ...data,
        extensionShortHeaders: data.extensionShortHeaders.map(
          transformTagsAsStringToTagsAsArray
        ),
      };
    });
};

export const getExtensionHeader = (
  extensionShortHeader: ExtensionShortHeader
): Promise<ExtensionHeader> => {
  return axios
    .get(resolveExtensionUrl(extensionShortHeader.headerUrl))
    .then(response => {
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
  return axios.get(resolveExtensionUrl(extensionHeader.url)).then(response => {
    const data: SerializedExtensionWithTagsAsString = response.data;
    const transformedData: SerializedExtension = transformTagsAsStringToTagsAsArray(
      data
    );
    return transformedData;
  });
};
