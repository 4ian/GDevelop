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
  tags: string,
  eventsBasedBehaviorsCount: number,
  eventsFunctionsCount: number,
|};
export type ExtensionHeader = {|
  ...ExtensionShortHeader,
  description: string,
|};

export type SerializedExtension = {
  ...ExtensionHeader,
};

export type ExtensionsRegistry = {
  version: string,
  allTags: Array<string>,
  extensionShortHeaders: Array<ExtensionShortHeader>,
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
    .then(response => response.data);
};

export const getExtensionHeader = (
  extensionShortHeader: ExtensionShortHeader
): Promise<ExtensionHeader> => {
  return axios
    .get(resolveExtensionUrl(extensionShortHeader.headerUrl))
    .then(response => response.data);
};

export const getExtension = (
  extensionHeader: ExtensionShortHeader | ExtensionHeader
): Promise<SerializedExtension> => {
  return axios
    .get(resolveExtensionUrl(extensionHeader.url))
    .then(response => response.data);
};
