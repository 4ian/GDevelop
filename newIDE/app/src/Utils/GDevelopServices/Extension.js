// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type UserPublicProfile } from './User';
import { retryIfFailed } from '../RetryIfFailed';

// This file is mocked by tests.
// Don't put any function that is not calling services.

const gd: libGDevelop = global.gd;

type ExtensionTier = 'community' | 'reviewed' | 'installed';

export type ExtensionRegistryItemHeader = {|
  tier: ExtensionTier,
  authorIds: Array<string>,
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
  changelog?: {[key: string]: {breaking?: string}}
|};

export type EventsFunctionInsideExtensionShortHeader = {
  description: string,
  fullName: string,
  functionType:
    | 'StringExpression'
    | 'Expression'
    | 'Action'
    | 'Condition'
    | 'ExpressionAndCondition'
    | 'ActionWithOperator',
  name: string,
};

export type EventsBasedBehaviorInsideExtensionShortHeader = {
  description: string,
  fullName: string,
  name: string,
  objectType: string,
  eventsFunctions: EventsFunctionInsideExtensionShortHeader[],
};

export type EventsBasedObjectInsideExtensionShortHeader = {
  description: string,
  fullName: string,
  name: string,
  defaultName: string,
  eventsFunctions: EventsFunctionInsideExtensionShortHeader[],
};

export type ExtensionShortHeader = {
  ...ExtensionRegistryItemHeader,
  shortDescription: string,
  eventsBasedBehaviorsCount: number,
  eventsFunctionsCount: number,

  eventsBasedBehaviors?: Array<EventsBasedBehaviorInsideExtensionShortHeader>,
  eventsFunctions?: Array<EventsFunctionInsideExtensionShortHeader>,
  eventsBasedObjects?: Array<EventsBasedObjectInsideExtensionShortHeader>,

  helpPath: string,
};

export type ExtensionHeader = {
  ...ExtensionShortHeader,
  description: string,
  iconUrl: string,
};

export type BehaviorShortHeader = {|
  ...ExtensionRegistryItemHeader,
  description: string,
  extensionName: string,
  objectType: string,
  /**
   * All required behaviors including transitive ones.
   */
  allRequiredBehaviorTypes: Array<string>,
  /** This attribute is calculated.
   * @see adaptBehaviorHeader
   */
  type: string,
  /**
   * Can only be true for `installed` extensions.
   */
  isDeprecated?: boolean,
|};

export type ObjectShortHeader = {|
  ...ExtensionRegistryItemHeader,
  description: string,
  extensionName: string,
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
  headers: Array<ExtensionShortHeader>,
  views: {
    default: {
      firstIds: Array<string>,
    },
  },
};

export type BehaviorsRegistry = {
  headers: Array<BehaviorShortHeader>,
  views: {
    default: {
      firstIds: Array<{ extensionName: string, behaviorName: string }>,
    },
  },
};

/**
 * The ExtensionHeader returned by the API, with tags being a string
 * (which is kept in the API for compatibility with older GDevelop versions).
 */
type ExtensionHeaderWithTagsAsString = {
  ...ExtensionHeader,
  tags: string,
};

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
const transformTagsAsStringToTagsAsArray = <
  T: { tags: string } | { tags: string[] }
>(
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

export const getExtensionsRegistry = async (): Promise<ExtensionsRegistry> => {
  const response = await axios.get(`${GDevelopAssetApi.baseUrl}/extension`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { databaseUrl } = response.data;

  const extensionsRegistry: ExtensionsRegistry = await retryIfFailed(
    { times: 2 },
    async () => (await axios.get(databaseUrl)).data
  );

  if (!extensionsRegistry) {
    throw new Error('Unexpected response from the extensions endpoint.');
  }
  if (!extensionsRegistry.headers) {
    extensionsRegistry.headers = extensionsRegistry.extensionShortHeaders;
  }
  if (!extensionsRegistry.views.default.firstIds) {
    extensionsRegistry.views.default.firstIds =
      extensionsRegistry.views.default.firstExtensionIds;
  }
  return {
    ...extensionsRegistry,
    // TODO: move this to backend endpoint
    headers: extensionsRegistry.headers.map(transformTagsAsStringToTagsAsArray),
  };
};

export const getBehaviorsRegistry = async (): Promise<BehaviorsRegistry> => {
  const response = await axios.get(`${GDevelopAssetApi.baseUrl}/behavior`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { databaseUrl } = response.data;

  const behaviorsRegistry: BehaviorsRegistry = await retryIfFailed(
    { times: 2 },
    async () => (await axios.get(databaseUrl)).data
  );

  if (!behaviorsRegistry) {
    throw new Error('Unexpected response from the behaviors endpoint.');
  }
  return {
    ...behaviorsRegistry,
    headers: behaviorsRegistry.headers.map(adaptBehaviorHeader),
  };
};

const adaptBehaviorHeader = (
  header: BehaviorShortHeader
): BehaviorShortHeader => {
  header.type = gd.PlatformExtension.getBehaviorFullType(
    header.extensionNamespace || header.extensionName,
    header.name
  );
  header = transformTagsAsStringToTagsAsArray(header);
  return header;
};

export const getExtensionHeader = (
  extensionShortHeader: ExtensionShortHeader | BehaviorShortHeader
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
  extensionHeader: ExtensionShortHeader | BehaviorShortHeader
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
        // Could be changed according to the editor environment, but keep
        // reading from the "live" data for now.
        environment: 'live',
      },
    }
  );

  return response.data;
};
