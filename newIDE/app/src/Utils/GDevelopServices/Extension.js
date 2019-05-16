// @flow
import axios from 'axios';
import { GDevelopExtensionApi } from './ApiConfigs';

export type ExtensionShortHeader = {|
  shortDescription: string,
  extensionNamespace: string,
  fullName: string,
  name: string,
  version: string,
  url: string,
  headerUrl: string,
|};
export type ExtensionHeader = {|
  ...ExtensionShortHeader,
  description: string,
|};

export type SerializedExtension = {
  ...ExtensionHeader,
}

export type ExtensionsRegistry = {
  version: string,
  extensionShortHeaders: Array<ExtensionShortHeader>,
};

export const getExtensionsRegistry = (): Promise<ExtensionsRegistry> => {
  // TODO: Caching for a few minutes/hours?
  return axios
    .get(`${GDevelopExtensionApi.baseUrl}/extensions-registry.json`)
    .then(response => response.data);
};

export const getExtensionHeader = (extensionShortHeader: ExtensionShortHeader): Promise<ExtensionHeader> => {
  // TODO: Handle absolute urls?
  return axios
    .get(`${GDevelopExtensionApi.baseUrl}/${extensionShortHeader.headerUrl}`)
    .then(response => response.data);
};

export const getExtension = (extensionHeader: ExtensionShortHeader | ExtensionHeader): Promise<SerializedExtension> => {
  // TODO: Handle absolute urls?
  return axios
    .get(`${GDevelopExtensionApi.baseUrl}/${extensionHeader.url}`)
    .then(response => response.data);
};
