// @flow
import axios from 'axios';
import { GDevelopAssetApi } from './ApiConfigs';
import { type UserPublicProfile } from './User';
import { retryIfFailed } from '../RetryIfFailed';
import { ensureIsArray } from '../DataValidator';

// This file is mocked by tests.
// Don't put any function that is not calling services.

const gd: libGDevelop = global.gd;

type ExtensionTier = 'experimental' | 'reviewed' | 'installed';

const USE_LOCAL_EXTENSIONS_REGISTRY = true;
const LOCAL_EXTENSIONS_DATABASE_URL =
  '/extensions-database/extensions-database.json';
const LOCAL_EXTENSIONS_BASE_URL = '/extensions';

const getLocalExtensionUrls = (extensionName: string) => ({
  url: `${LOCAL_EXTENSIONS_BASE_URL}/${extensionName}.json`,
  headerUrl: `${LOCAL_EXTENSIONS_BASE_URL}/${extensionName}-header.json`,
});

const loadLocalExtensionsDatabase = async () => {
  const response = await cdnClient.get(LOCAL_EXTENSIONS_DATABASE_URL);
  return response.data;
};

export type ExtensionDependency = {
  extensionName: string,
  extensionVersion: string,
};

export type ExtensionRegistryItemHeader = {
  tier: ExtensionTier,
  authorIds: Array<string>,
  authors?: Array<UserPublicProfile>,
  author?: string,
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
  changelog?: Array<{ version: string, breaking?: string }>,
  requiredExtensions?: Array<ExtensionDependency>,
  // Added by the editor.
  isInstalled?: boolean,
};

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

export type BehaviorShortHeader = {
  ...ExtensionRegistryItemHeader,
  description: string,
  extensionName: string,
  objectType: string,
  /**
   * All required behaviors including transitive ones.
   */
  allRequiredBehaviorTypes: Array<string>,
  /** This attribute is computed.
   * @see adaptBehaviorHeader
   */
  type: string,
  /**
   * Can only be true for `installed` extensions.
   */
  isDeprecated?: boolean,
};

export type ObjectShortHeader = {
  ...ExtensionRegistryItemHeader,
  description: string,
  extensionName: string,
  assetStoreTag: ?string,
  /** This attribute is computed.
   * @see adaptObjectHeader
   */
  type: string,
};

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
  requiredExtensions?: Array<ExtensionDependency>,
  author?: string,
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

export type ObjectsRegistry = {
  headers: Array<ObjectShortHeader>,
  views: {
    default: {
      firstIds: Array<{ extensionName: string, objectName: string }>,
      secondIds: Array<{ extensionName: string, objectName: string }>,
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
    // $FlowFixMe[incompatible-type]
    return dataWithTags;
  }

  // $FlowIgnore - ignore issue with non exact types
  return {
    ...dataWithTags,
    tags: dataWithTags.tags.split(',').map(tag => tag.trim().toLowerCase()),
  };
};

// $FlowFixMe[cannot-resolve-name]
export const client: Axios = axios.create({
  baseURL: GDevelopAssetApi.baseUrl,
});
// $FlowFixMe[cannot-resolve-name]
export const cdnClient: Axios = axios.create();

const extensionAuthorCache: { [string]: ?string } = {};
const extensionAuthorPromiseCache: { [string]: Promise<?string> } = {};

const normalizeAuthorName = (author: ?string): ?string => {
  if (!author) return null;
  const trimmedAuthor = author.trim();
  return trimmedAuthor.length > 0 ? trimmedAuthor : null;
};

export const getExtensionsRegistry = async (): Promise<ExtensionsRegistry> => {
  if (USE_LOCAL_EXTENSIONS_REGISTRY) {
    const extensionsRegistry: ExtensionsRegistry = await loadLocalExtensionsDatabase();

    if (!extensionsRegistry) {
      throw new Error(
        'Unexpected response from the local extensions database.'
      );
    }
    if (!extensionsRegistry.headers) {
      extensionsRegistry.headers = extensionsRegistry.extensionShortHeaders;
    }
    if (
      !extensionsRegistry.views ||
      !extensionsRegistry.views.default ||
      !extensionsRegistry.views.default.firstIds
    ) {
      extensionsRegistry.views = extensionsRegistry.views || {};
      extensionsRegistry.views.default = extensionsRegistry.views.default || {};
      extensionsRegistry.views.default.firstIds =
        extensionsRegistry.views.default.firstExtensionIds;
    }
    for (const header of extensionsRegistry.headers) {
      if ((header.tier: string) === 'community') {
        header.tier = 'experimental';
      }
    }

    return {
      ...extensionsRegistry,
      // TODO: move this to backend endpoint
      // $FlowFixMe[incompatible-type]
      headers: extensionsRegistry.headers
        .map(transformTagsAsStringToTagsAsArray)
        .map(header => ({
          ...header,
          ...getLocalExtensionUrls(header.name),
        })),
    };
  }

  const response = await client.get(`/extension`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { databaseUrl } = response.data;

  const extensionsRegistry: ExtensionsRegistry = await retryIfFailed(
    { times: 2 },
    async () => (await cdnClient.get(databaseUrl)).data
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
  for (const header of extensionsRegistry.headers) {
    if ((header.tier: string) === 'community') {
      header.tier = 'experimental';
    }
  }
  return {
    ...extensionsRegistry,
    // TODO: move this to backend endpoint
    // $FlowFixMe[incompatible-type]
    headers: extensionsRegistry.headers.map(transformTagsAsStringToTagsAsArray),
  };
};

export const getBehaviorsRegistry = async (): Promise<BehaviorsRegistry> => {
  if (USE_LOCAL_EXTENSIONS_REGISTRY) {
    const extensionsDatabase = await loadLocalExtensionsDatabase();
    const behaviorsRegistry: BehaviorsRegistry = extensionsDatabase.behavior;

    if (!behaviorsRegistry) {
      throw new Error('Unexpected local behaviors registry.');
    }

    return {
      ...behaviorsRegistry,
      headers: behaviorsRegistry.headers.map(header => {
        const adaptedHeader = adaptBehaviorHeader(header);
        return {
          ...adaptedHeader,
          ...getLocalExtensionUrls(adaptedHeader.extensionName),
        };
      }),
    };
  }

  const response = await client.get(`/behavior`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { databaseUrl } = response.data;

  const behaviorsRegistry: BehaviorsRegistry = await retryIfFailed(
    { times: 2 },
    async () => (await cdnClient.get(databaseUrl)).data
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
  // $FlowFixMe[incompatible-type]
  header = transformTagsAsStringToTagsAsArray(header);
  if ((header.tier: string) === 'community') {
    header.tier = 'experimental';
  }
  return header;
};

export const getObjectsRegistry = async (): Promise<ObjectsRegistry> => {
  if (USE_LOCAL_EXTENSIONS_REGISTRY) {
    const extensionsDatabase = await loadLocalExtensionsDatabase();
    const objectsRegistry: ObjectsRegistry = extensionsDatabase.object;

    if (!objectsRegistry) {
      throw new Error('Unexpected local objects registry.');
    }

    return {
      ...objectsRegistry,
      headers: objectsRegistry.headers.map(header => {
        const adaptedHeader = adaptObjectHeader(header);
        return {
          ...adaptedHeader,
          ...getLocalExtensionUrls(adaptedHeader.extensionName),
        };
      }),
    };
  }

  const response = await client.get(`/object`, {
    params: {
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });
  const { databaseUrl } = response.data;

  const objectsRegistry: ObjectsRegistry = await retryIfFailed(
    { times: 2 },
    async () => (await cdnClient.get(databaseUrl)).data
  );

  if (!objectsRegistry) {
    throw new Error('Unexpected response from the objects endpoint.');
  }
  return {
    ...objectsRegistry,
    headers: objectsRegistry.headers.map(adaptObjectHeader),
  };
};

const adaptObjectHeader = (header: ObjectShortHeader): ObjectShortHeader => {
  header.type = gd.PlatformExtension.getObjectFullType(
    header.extensionNamespace || header.extensionName,
    header.name
  );
  // $FlowFixMe[incompatible-type]
  header = transformTagsAsStringToTagsAsArray(header);
  if ((header.tier: string) === 'community') {
    header.tier = 'experimental';
  }
  return header;
};

export const getExtensionHeader = (
  extensionShortHeader:
    | ExtensionShortHeader
    | BehaviorShortHeader
    | ObjectShortHeader
): Promise<ExtensionHeader> => {
  const extensionName =
    extensionShortHeader.extensionName || extensionShortHeader.name;
  const headerUrl = USE_LOCAL_EXTENSIONS_REGISTRY
    ? getLocalExtensionUrls(extensionName).headerUrl
    : extensionShortHeader.headerUrl;

  return cdnClient.get(headerUrl).then(response => {
    const data: ExtensionHeaderWithTagsAsString = response.data;
    const transformedData: ExtensionHeader = transformTagsAsStringToTagsAsArray(
      // $FlowFixMe[incompatible-type]
      data
    );
    if ((data.tier: string) === 'community') {
      data.tier = 'experimental';
    }
    return transformedData;
  });
};

export const getExtension = (
  extensionHeader: ExtensionShortHeader | BehaviorShortHeader
): Promise<SerializedExtension> => {
  const extensionName = extensionHeader.extensionName || extensionHeader.name;
  const extensionUrl = USE_LOCAL_EXTENSIONS_REGISTRY
    ? getLocalExtensionUrls(extensionName).url
    : extensionHeader.url;

  return cdnClient.get(extensionUrl).then(response => {
    const data: SerializedExtensionWithTagsAsString = response.data;
    // $FlowFixMe[incompatible-type]
    const transformedData: SerializedExtension = transformTagsAsStringToTagsAsArray(
      // $FlowFixMe[incompatible-type]
      data
    );
    return transformedData;
  });
};

export const getExtensionAuthor = async (
  extensionShortHeader: ExtensionShortHeader | BehaviorShortHeader
): Promise<?string> => {
  const extensionName =
    extensionShortHeader.extensionName || extensionShortHeader.name;

  if (
    Object.prototype.hasOwnProperty.call(extensionAuthorCache, extensionName)
  ) {
    return extensionAuthorCache[extensionName];
  }

  if (extensionAuthorPromiseCache[extensionName]) {
    return extensionAuthorPromiseCache[extensionName];
  }

  const requestPromise = getExtension(extensionShortHeader)
    .then(extension => {
      const authorName = normalizeAuthorName(extension.author);
      extensionAuthorCache[extensionName] = authorName;
      delete extensionAuthorPromiseCache[extensionName];
      return authorName;
    })
    .catch(error => {
      console.warn(
        `Unable to load author for extension ${extensionName}.`,
        error
      );
      extensionAuthorCache[extensionName] = null;
      delete extensionAuthorPromiseCache[extensionName];
      return null;
    });

  extensionAuthorPromiseCache[extensionName] = requestPromise;
  return requestPromise;
};

export const getUserExtensionShortHeaders = async (
  authorId: string
): Promise<Array<ExtensionShortHeader>> => {
  const response = await client.get(`/extension-short-header`, {
    params: {
      authorId,
      // Could be changed according to the editor environment, but keep
      // reading from the "live" data for now.
      environment: 'live',
    },
  });

  return ensureIsArray({
    data: response.data,
    endpointName: '/extension-short-header of Asset API',
  });
};
