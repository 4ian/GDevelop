// @flow
import axios from 'axios';
import {
  GDevelopAssetApi,
  GDevelopAssetCdn,
  GDevelopPrivateAssetsStorage,
  GDevelopPrivateGameTemplatesStorage,
  GDevelopPublicAssetResourcesStorageBaseUrl,
  GDevelopPublicAssetResourcesStorageStagingBaseUrl,
} from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { type Filters } from './Filters';
import {
  type PrivateGameTemplateListingData,
  createProductAuthorizedUrl,
  isPrivateAssetResourceAuthorizedUrl,
} from './Shop';

export type License = {|
  name: string,
  website: string,
|};

export type Author = {|
  name: string,
  website: string,
|};

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

export type ExtensionDependency = {|
  extensionName: string,
  extensionVersion: string,
|};

export type ObjectAsset = {|
  object: any /*(serialized gdObjectConfiguration)*/,
  resources: Array<any /*(serialized gdResource)*/>,
  variants?: Array<{
    objectType: string,
    variant: any /*(serialized gdEventsBasedObjectVariant)*/,
  }>,
  // TODO This can become mandatory after the migration of the asset repository.
  requiredExtensions?: Array<ExtensionDependency>,
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
  assetPackId?: string,
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
  authorIds?: Array<string>,
  license: string,
  objectAssets: Array<ObjectAsset>,
|};

export type PublicAssetPack = {|
  name: string,
  tag: string,
  thumbnailUrl: string,
  assetsCount: number,
  externalWebLink?: ?string,
  userFriendlyPrice?: ?string,
  categories: Array<string>,
  authors: Array<Author>,
  licenses: Array<License>,
|};

export type PublicAssetPacks = {|
  starterPacks: Array<PublicAssetPack>,
|};

export type PrivateAssetPackAssetType =
  | 'font'
  | 'audio'
  | 'sprite'
  | '9patch'
  | 'tiled'
  | 'Scene3D::Model3DObject'
  | 'TileMap::SimpleTileMap'
  | 'ParticleSystem::ParticleEmitter'
  | string;

export type PrivateAssetPackContent = { [PrivateAssetPackAssetType]: number };

export type PrivateAssetPack = {|
  id: string,
  name: string,
  previewImageUrls: Array<string>,
  previewSoundUrls?: Array<string>,
  updatedAt: string,
  createdAt: string,
  tag: string,
  longDescription: string,
  content: PrivateAssetPackContent,
  includedPackIds?: Array<string>,
|};

export type PrivateGameTemplate = {|
  id: string,
  name: string,
  previewImageUrls: Array<string>,
  updatedAt: string,
  createdAt: string,
  tag: string,
  longDescription: string,
  gamePreviewLink: string,
  includedTemplateIds?: Array<string>,
|};

export type IncludedProduct = {|
  productId: string,
  usageType: string,
  productType: 'ASSET_PACK' | 'GAME_TEMPLATE' | 'COURSE' | 'CREDITS_PACKAGE',
|};

export type IncludedRedemptionCode = {|
  givenSubscriptionPlanId: string,
  durationInDays: number,
  estimatedPrices?: Array<{
    value: number,
    currency: 'USD' | 'EUR',
  }>,
|};

export type Bundle = {|
  id: string,
  name: string,
  nameByLocale: MessageByLocale,
  createdAt: string,
  updatedAt: string,
  // If the bundle is archived, it will not be available for purchase anymore.
  // But it will still be available for users who already purchased it.
  archivedAt?: string,
  longDescription: string,
  longDescriptionByLocale: MessageByLocale,
  previewImageUrls: Array<string>,
  tag: string,
  includedProducts: Array<IncludedProduct>,
  includedRedemptionCodes: Array<IncludedRedemptionCode>,
|};

export type PrivatePdfTutorial = {|
  id: string,
  downloadUrl: string,
|};

export type AllPublicAssets = {|
  publicAssetShortHeaders: Array<AssetShortHeader>,
  publicFilters: Filters,
  publicAssetPacks: PublicAssetPacks,
|};

export type Resource = {|
  url: string,
  name: string,
  license: string,
  type: string,
  tags: Array<string>,
|};

export interface ResourceV2CommonProps {
  url: string;
  name: string;
  license: string;
  tags: Array<string>;
  authors: Array<string>;
}

export interface AudioResourceV2 extends ResourceV2CommonProps {
  type: 'audio';
  metadata: { duration: number, type: 'music' | 'sound' };
}
export interface FontResourceV2 extends ResourceV2CommonProps {
  type: 'font';
  metadata: { supportedAlphabets: string[] };
  previewImageUrl: string;
}

export type ResourceV2 = FontResourceV2 | AudioResourceV2;

export type AllResources = {|
  resources: Array<Resource>,
  resourcesV2: Array<ResourceV2>,
  filters: Filters,
|};

export type CourseChapterTask = {|
  title: string,
  subtitle?: string,
  imageUrls?: string[],
  hint?: string,
  text?: string,
  answer?: { text?: string, imageUrls?: string[] },
|};

export type UnlockedVideoBasedCourseChapter = {|
  id: string,
  title: string,
  shortTitle?: string,
  videoUrl: string,
  isLocked?: false,
  isFree?: boolean,
  templateUrl: string,
  tasks: Array<CourseChapterTask>,
|};

export type TextBasedCourseChapterTextItem = {|
  type: 'text',
  text: string,
|};

export type TextBasedCourseChapterImageItem = {|
  type: 'image',
  url: string,
  caption?: string,
|};
export type TextBasedCourseChapterVideoItem = {|
  type: 'video',
  url: string,
  caption?: string,
|};

export type TextBasedCourseChapterTaskItem = {|
  type: 'task',
  title: string,
  items: Array<
    | TextBasedCourseChapterTextItem
    | TextBasedCourseChapterImageItem
    | TextBasedCourseChapterVideoItem
  >,
  answer?: {
    items: Array<
      | TextBasedCourseChapterTextItem
      | TextBasedCourseChapterImageItem
      | TextBasedCourseChapterVideoItem
    >,
  },
|};

export type UnlockedTextBasedCourseChapter = {|
  id: string,
  title: string,
  shortTitle?: string,
  isLocked?: false,
  isFree?: boolean,
  templates: Array<{| url: string, title?: string | null, id: string |}>,
  items: Array<
    | TextBasedCourseChapterTextItem
    | TextBasedCourseChapterImageItem
    | TextBasedCourseChapterTaskItem
    | TextBasedCourseChapterVideoItem
  >,
|};

export type LockedVideoBasedCourseChapter = {|
  isLocked: true,
  isFree?: boolean,
  // If not set, cannot be purchased with credits.
  priceInCredits?: number,
  productId: string,

  id: string,
  title: string,
  shortTitle?: string,
  videoUrl: string,
|};

export type LockedTextBasedCourseChapter = {|
  isLocked: true,
  isFree?: boolean,
  // If not set, cannot be purchased with credits.
  priceInCredits?: number,
  productId: string,

  id: string,
  title: string,
  shortTitle?: string,
|};

export type VideoBasedCourseChapter =
  | LockedVideoBasedCourseChapter
  | UnlockedVideoBasedCourseChapter;

export type TextBasedCourseChapter =
  | LockedTextBasedCourseChapter
  | UnlockedTextBasedCourseChapter;

export type CourseChapter =
  | LockedVideoBasedCourseChapter
  | LockedTextBasedCourseChapter
  | UnlockedVideoBasedCourseChapter
  | UnlockedTextBasedCourseChapter;

export type Course = {|
  id: string,
  durationInWeeks: number,
  chaptersTargetCount: number,
  specializationId: 'game-development' | 'interaction-design' | 'marketing',
  newUntil?: number,

  imageUrlByLocale: MessageByLocale,
  titleByLocale: MessageByLocale,
  shortDescriptionByLocale: MessageByLocale,
  levelByLocale: MessageByLocale,

  isLocked?: boolean,
  includedInSubscriptions: string[],
|};

export type UserCourseProgress = {|
  userId: string,
  courseId: string,
  progress: {| chapterId: string, completedTasks: number[] |}[],
|};

export type Environment = 'staging' | 'live';

export const client = axios.create({
  baseURL: GDevelopAssetApi.baseUrl,
});

export const isAssetPackAudioOnly = (assetPack: PrivateAssetPack): boolean => {
  const contentKeys = Object.keys(assetPack.content);
  return contentKeys.length === 1 && contentKeys[0] === 'audio';
};
export const doesAssetPackContainAudio = (
  assetPack: PrivateAssetPack
): boolean => !!assetPack.content.audio && assetPack.content.audio > 0;

export const listAllPublicAssets = async ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AllPublicAssets> => {
  const response = await client.get(`/asset`, {
    params: {
      environment,
    },
  });

  const {
    assetShortHeadersUrl,
    filtersUrl,
    assetPacksUrl,
    assetCdn,
  } = response.data;

  // Overwrite the CDN from where public assets are served.
  if (assetCdn.baseUrl) {
    GDevelopAssetCdn.baseUrl['live'] =
      assetCdn.baseUrl['live'] || GDevelopAssetCdn.baseUrl['live'];
    GDevelopAssetCdn.baseUrl['staging'] =
      assetCdn.baseUrl['staging'] || GDevelopAssetCdn.baseUrl['staging'];
  }

  const responsesData = await Promise.all([
    client
      .get(assetShortHeadersUrl)
      .then(response => response.data)
      .catch(e => e),
    client
      .get(filtersUrl)
      .then(response => response.data)
      .catch(e => e),
    client
      .get(assetPacksUrl)
      .then(response => response.data)
      .catch(e => e),
  ]);

  if (responsesData.some(data => !data || data instanceof Error)) {
    throw new Error('Unexpected response from the assets endpoints.');
  }

  const publicAssetShortHeaders = responsesData[0];
  const publicFilters = responsesData[1];
  const publicAssetPacks = responsesData[2];

  if (!publicAssetPacks.starterPacks) {
    throw new Error(
      'Unexpected response from the public asset packs endpoint.'
    );
  }

  return {
    publicAssetShortHeaders,
    publicFilters,
    publicAssetPacks,
  };
};

export const getPublicAsset = async (
  assetShortHeader: AssetShortHeader,
  { environment }: {| environment: Environment |}
): Promise<Asset> => {
  const assetResponse = await client.get(
    `${GDevelopAssetCdn.baseUrl[environment]}/assets/${
      assetShortHeader.id
    }.json`
  );
  return assetResponse.data;
};

export const getPrivateAsset = async (
  assetShortHeader: AssetShortHeader,
  authorizationToken: string,
  { environment }: {| environment: Environment |}
): Promise<Asset> => {
  const privateAssetPackId = assetShortHeader.assetPackId;
  if (!privateAssetPackId) {
    throw new Error('The asset does not have a private asset pack id.');
  }
  const assetUrl = `${
    GDevelopPrivateAssetsStorage.baseUrl
  }/${privateAssetPackId}/${assetShortHeader.id}.json`;
  const authorizedUrl = createProductAuthorizedUrl(
    assetUrl,
    authorizationToken
  );
  const assetResponse = await client.get(authorizedUrl);
  return assetResponse.data;
};

export const getPrivateAssetPackAudioFilesArchiveUrl = (
  privateAssetPackId: string,
  authorizationToken: string
): string => {
  const assetUrl = `${
    GDevelopPrivateAssetsStorage.baseUrl
  }/${privateAssetPackId}/resources/audio.zip`;
  const authorizedUrl = createProductAuthorizedUrl(
    assetUrl,
    authorizationToken
  );
  return authorizedUrl;
};

export const listAllResources = async ({
  environment,
}: {|
  environment: Environment,
|}): Promise<AllResources> => {
  const response = await client.get(`/resource`, {
    params: {
      environment,
    },
  });
  const { resourcesUrl, resourcesV2Url, filtersUrl } = response.data;
  if (!resourcesUrl || !filtersUrl) {
    throw new Error('Unexpected response from the resource endpoint.');
  }
  const responses = await Promise.all([
    client.get(resourcesUrl).then(response => response.data),
    client.get(resourcesV2Url).then(response => response.data),
    client.get(filtersUrl).then(response => response.data),
  ]);
  const [resources, resourcesV2, filters] = responses;
  if (!resources || !resourcesV2 || !filters) {
    throw new Error('Unexpected response from the resources endpoints.');
  }
  return {
    resources,
    resourcesV2,
    filters,
  };
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

export const getPrivateAssetPack = async (
  assetPackId: string
): Promise<PrivateAssetPack> => {
  const response = await client.get(`/asset-pack/${assetPackId}`);
  return response.data;
};

export const getPrivateGameTemplate = async (
  gameTemplateId: string
): Promise<PrivateGameTemplate> => {
  const response = await client.get(`/game-template/${gameTemplateId}`);
  return response.data;
};

export const getBundle = async (bundleId: string): Promise<Bundle> => {
  const response = await client.get(`/bundle/${bundleId}`);
  return response.data;
};

export const getPrivatePdfTutorial = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    tutorialId,
  }: {|
    userId: string,
    tutorialId: string,
  |}
): Promise<PrivatePdfTutorial> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/pdf-tutorial/${tutorialId}`, {
    params: {
      userId,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const createPrivateGameTemplateUrl = async (
  privateGameTemplateListingData: PrivateGameTemplateListingData,
  authorizationToken: string
): Promise<string> => {
  const gameTemplateUrl = `${GDevelopPrivateGameTemplatesStorage.baseUrl}/${
    privateGameTemplateListingData.id
  }/game.json`;
  const authorizedUrl = createProductAuthorizedUrl(
    gameTemplateUrl,
    authorizationToken
  );
  return authorizedUrl;
};

export const isPixelArt = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  return assetOrAssetShortHeader.tags.some(tag => {
    return tag.toLowerCase() === 'pixel art';
  });
};

export const isPrivateAsset = (
  assetOrAssetShortHeader: AssetShortHeader | Asset
): boolean => {
  const imageUrl = assetOrAssetShortHeader.previewImageUrls[0];
  return !!imageUrl && isPrivateAssetResourceAuthorizedUrl(imageUrl);
};

export const listReceivedAssetShortHeaders = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<AssetShortHeader>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/asset-short-header', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listReceivedAssetPacks = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<PrivateAssetPack>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/asset-pack', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listReceivedGameTemplates = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<PrivateGameTemplate>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/game-template', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const listReceivedBundles = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: string,
  |}
): Promise<Array<Bundle>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get('/bundle', {
    headers: { Authorization: authorizationHeader },
    params: { userId },
  });
  return response.data;
};

export const isPublicAssetResourceUrl = (url: string) =>
  url.startsWith(GDevelopPublicAssetResourcesStorageBaseUrl) ||
  url.startsWith(GDevelopPublicAssetResourcesStorageStagingBaseUrl);
const escapeStringForRegExp = string =>
  string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
const resourceFilenameRegex = new RegExp(
  `(${escapeStringForRegExp(
    GDevelopPublicAssetResourcesStorageBaseUrl
  )}|${escapeStringForRegExp(
    GDevelopPublicAssetResourcesStorageStagingBaseUrl
  )})\\/public-resources\\/(.*)\\/([a-z0-9]{64})_(.*)`
);

export const extractDecodedFilenameWithExtensionFromPublicAssetResourceUrl = (
  url: string
): string => {
  const matches = resourceFilenameRegex.exec(url);
  if (!matches) {
    throw new Error('The URL is not a valid public asset resource URL: ' + url);
  }
  const filenameWithExtension = matches[4];
  const decodedFilenameWithExtension = decodeURIComponent(
    filenameWithExtension
  );
  return decodedFilenameWithExtension;
};

export const listCourses = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
  }: {|
    userId: ?string,
  |}
): Promise<Array<Course>> => {
  if (userId) {
    const authorizationHeader = await getAuthorizationHeader();

    const response = await client.get(`/course`, {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    });
    return response.data;
  }
  const response = await client.get(`/course`);
  return response.data;
};

export const listCourseChapters = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    userId,
    courseId,
    language,
  }: {|
    userId: ?string,
    courseId: string,
    language: string,
  |}
): Promise<Array<CourseChapter>> => {
  if (userId) {
    const authorizationHeader = await getAuthorizationHeader();

    const response = await client.get(`/course/${courseId}/chapter`, {
      params: {
        userId,
        language,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    });
    return response.data;
  }
  const response = await client.get(`/course/${courseId}/chapter`, {
    params: { language },
  });
  return response.data;
};

export const getCourseChapterRatingUrl = ({
  courseId,
  chapterId,
  userId,
  language,
}: {|
  courseId: string,
  chapterId: string,
  userId: string,
  language: string,
|}): string => {
  const url = new URL(
    `${
      GDevelopAssetApi.baseUrl
    }/course/${courseId}/chapter/${chapterId}/action/redirect-to-rating`
  );

  url.searchParams.set('userId', userId);
  url.searchParams.set('language', language);
  return url.toString();
};
