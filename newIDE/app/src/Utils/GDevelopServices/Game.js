// @flow
import axios from 'axios';
import capitalize from 'lodash/capitalize';
import { type I18n as I18nType } from '@lingui/core';
import { GDevelopGameApi, GDevelopGamesPlatform } from './ApiConfigs';
import { type MessageByLocale } from '../i18n/MessageByLocale';
import { type Filters } from './Filters';
import { type UserPublicProfile } from './User';
import { t } from '@lingui/macro';

export type CachedGameSlug = {
  username: string,
  gameSlug: string,
};

export type GameSlug = {
  username: string,
  gameSlug: string,
  createdAt: number,
};

export type PublicGame = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  publicWebBuildId?: ?string,
  description?: string,
  owners: Array<UserPublicProfile>,
  authors: Array<UserPublicProfile>,
  playWithKeyboard: boolean,
  playWithGamepad: boolean,
  playWithMobile: boolean,
  orientation: string,
  thumbnailUrl?: string,
  cachedLastWeekSessionsCount?: number,
  cachedLastYearSessionsCount?: number,
  categories?: string[],
  userSlug?: string,
  gameSlug?: string,
  discoverable?: boolean,
  donateLink: ?string,
};

export type Game = {
  id: string,
  gameName: string,
  authorName: string, // this corresponds to the publisher name
  createdAt: number,
  publicWebBuildId?: ?string,
  description?: string,
  thumbnailUrl?: string,
  discoverable?: boolean,
  acceptsBuildComments?: boolean,
  acceptsGameComments?: boolean,
  displayAdsOnGamePage?: boolean,
  cachedCurrentSlug?: CachedGameSlug,
};

export type GameCategory = {
  name: string,
  type: 'user-defined' | 'admin-only',
};

export type ShowcasedGameLink = {
  url: string,
  type:
    | 'app-store'
    | 'play-store'
    | 'play'
    | 'download'
    | 'download-win-mac-linux'
    | 'learn-more',
};

export type ShowcasedGame = {
  title: string,
  author: string,
  description: string,
  genres: Array<string>,
  platforms: Array<string>,
  /** Represents the union of genres+platforms. */
  tags: Array<string>,
  imageUrls: Array<string>,
  links: Array<ShowcasedGameLink>,
  isFeatured: boolean,
  bannerUrl: string,
  bannerBackgroundPosition: string,
  thumbnailUrl: string,
  editorDescription: string,
};

export type AllShowcasedGames = {
  showcasedGames: Array<ShowcasedGame>,
  filters: Filters,
};

export type GameApiError = {|
  code: 'game-deletion/leaderboards-exist',
|};

export type FeaturingType =
  | 'games-platform-home'
  | 'games-platform-game-page'
  | 'games-platform-listing'
  | 'socials-newsletter'
  | 'gdevelop-banner';

export type GameFeaturing = {|
  gameId: string,
  featuring: FeaturingType,
  createdAt: number, // in seconds.
  updatedAt: number, // in seconds.
  expiresAt: number, // in seconds.
|};

export type GameUsageType =
  | 'featuring-basic'
  | 'featuring-pro'
  | 'featuring-premium';

export type MarketingPlan = {|
  id: GameUsageType,
  nameByLocale: MessageByLocale,
  descriptionByLocale: MessageByLocale,
  bulletPointsByLocale: Array<MessageByLocale>,
|};

export type GameLeaderboardEntry = {
  count: number | null,
  publicGame: PublicGame | null,
};

export type GameLeaderboard = {
  name: string,
  displayNameByLocale: MessageByLocale,
  topGameCommentQualityRatings: GameLeaderboardEntry[],
};

export const getCategoryName = (category: string, i18n: I18nType) => {
  switch (category) {
    case 'action':
      return i18n._(t`Action`);
    case 'adventure':
      return i18n._(t`Adventure`);
    case 'shooter':
      return i18n._(t`Shooter`);
    case 'platformer':
      return i18n._(t`Platformer`);
    case 'rpg':
      return i18n._(t`RPG`);
    case 'horror':
      return i18n._(t`Horror`);
    case 'strategy':
      return i18n._(t`Strategy`);
    case 'puzzle':
      return i18n._(t`Puzzle`);
    case 'racing':
      return i18n._(t`Racing`);
    case 'simulation':
      return i18n._(t`Simulation`);
    case 'sport':
      return i18n._(t`Sport`);
    case 'story-rich':
      return i18n._(t`Story-Rich`);
    case 'survival':
      return i18n._(t`Survival`);
    case 'building':
      return i18n._(t`Building`);
    case 'multiplayer':
      return i18n._(t`Multiplayer`);
    case 'leaderboard':
      return i18n._(t`Leaderboard`);
    case 'educational':
      return i18n._(t`Educational`);
    default:
      return capitalize(category);
  }
};

export const getGameUrl = (game: ?Game) => {
  if (!game) return null;
  const slug = game.cachedCurrentSlug;
  return slug
    ? GDevelopGamesPlatform.getGameUrlWithSlug(slug.username, slug.gameSlug)
    : GDevelopGamesPlatform.getGameUrl(game.id);
};

export const getPublicGameUrl = (publicGame: ?PublicGame) => {
  if (!publicGame) return null;

  return publicGame.gameSlug && publicGame.userSlug
    ? GDevelopGamesPlatform.getGameUrlWithSlug(
        publicGame.userSlug,
        publicGame.gameSlug
      )
    : GDevelopGamesPlatform.getGameUrl(publicGame.id);
};

export const getAclsFromUserIds = (
  ownersIds: Array<string>
): Array<{| userId: string, level: string |}> =>
  ownersIds.map(ownerId => ({
    userId: ownerId,
    level: 'owner',
  }));

export const listAllShowcasedGames = async (): Promise<AllShowcasedGames> => {
  const response = await axios.get(`${GDevelopGameApi.baseUrl}/showcased-game`);
  const { gamesShowcaseUrl, filtersUrl } = response.data;
  if (!gamesShowcaseUrl || !filtersUrl) {
    throw new Error('Unexpected response from the resource endpoint.');
  }

  const responsesData = await Promise.all([
    axios
      .get(gamesShowcaseUrl)
      .then(response => response.data)
      .catch(e => e),
    axios
      .get(filtersUrl)
      .then(response => response.data)
      .catch(e => e),
  ]);

  if (responsesData.some(data => !data || data instanceof Error)) {
    throw new Error('Unexpected response from the assets endpoints.');
  }

  const showcasedGames = responsesData[0];
  const filters = responsesData[1];

  return {
    showcasedGames,
    filters,
  };
};

export const registerGame = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
    gameName,
    authorName,
    templateSlug,
  }: {|
    gameId: string,
    gameName: string,
    authorName: string,
    templateSlug: string,
  |}
): Promise<Game> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await axios.post(
    `${GDevelopGameApi.baseUrl}/game/${gameId}`,
    {
      gameName,
      authorName,
      templateSlug,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const updateGame = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  {
    gameName,
    categories,
    authorName,
    publicWebBuildId,
    description,
    playWithKeyboard,
    playWithGamepad,
    playWithMobile,
    orientation,
    thumbnailUrl,
    discoverable,
    acceptsBuildComments,
    acceptsGameComments,
    displayAdsOnGamePage,
  }: {|
    gameName?: string,
    categories?: string[],
    authorName?: string,
    publicWebBuildId?: ?string,
    description?: string,
    playWithKeyboard?: boolean,
    playWithGamepad?: boolean,
    playWithMobile?: boolean,
    orientation?: string,
    thumbnailUrl?: ?string,
    discoverable?: boolean,
    acceptsBuildComments?: boolean,
    acceptsGameComments?: boolean,
    displayAdsOnGamePage?: boolean,
  |}
): Promise<Game> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.patch(
    `${GDevelopGameApi.baseUrl}/game/${gameId}`,
    {
      gameName,
      categories,
      authorName,
      publicWebBuildId,
      description,
      playWithKeyboard,
      playWithGamepad,
      playWithMobile,
      orientation,
      thumbnailUrl,
      discoverable,
      acceptsBuildComments,
      acceptsGameComments,
      displayAdsOnGamePage,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const setGameUserAcls = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  acls: {|
    ownership?: Array<{| userId: string, level: string |}>,
    author?: Array<{| userId: string, level: string |}>,
  |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGameApi.baseUrl}/game/action/set-acls`,
    {
      gameId,
      newAcls: acls,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const setGameSlug = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  userSlug: string,
  gameSlug: string
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.post(
    `${GDevelopGameApi.baseUrl}/game/action/set-slug`,
    {
      gameId,
      userSlug,
      gameSlug,
    },
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const getGame = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<Game> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGameApi.baseUrl}/game/${gameId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const deleteGame = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<Game> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.delete(
    `${GDevelopGameApi.baseUrl}/game/${gameId}`,
    {
      params: {
        userId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const getGames = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string
): Promise<Array<Game>> => {
  const authorizationHeader = await getAuthorizationHeader();

  const response = await axios.get(`${GDevelopGameApi.baseUrl}/game`, {
    params: {
      userId,
    },
    headers: {
      Authorization: authorizationHeader,
    },
  });

  return response.data;
};

export const getPublicGame = async (gameId: string): Promise<PublicGame> => {
  const response = await axios.get(
    `${GDevelopGameApi.baseUrl}/public-game/${gameId}`
  );
  return response.data;
};

export const getGameCategories = async (): Promise<GameCategory[]> => {
  const response = await axios.get(`${GDevelopGameApi.baseUrl}/game-category`);
  return response.data;
};

export const buyGameFeaturing = async (
  getAuthorizationHeader: () => Promise<string>,
  {
    gameId,
    userId,
    usageType,
  }: {| gameId: string, userId: string, usageType: GameUsageType |}
): Promise<void> => {
  const authorizationHeader = await getAuthorizationHeader();
  await axios.post(
    `${GDevelopGameApi.baseUrl}/game/action/buy-with-credits`,
    {},
    {
      params: {
        userId,
        gameId,
        usageType,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
};

export const listGameFeaturings = async (
  getAuthorizationHeader: () => Promise<string>,
  { gameId, userId }: {| gameId: string, userId: string |}
): Promise<GameFeaturing[]> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await axios.get(
    `${GDevelopGameApi.baseUrl}/game-featuring`,
    {
      params: {
        userId,
        gameId,
      },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );

  return response.data;
};

export const listMarketingPlans = async (): Promise<MarketingPlan[]> => {
  const response = await axios.get(`${GDevelopGameApi.baseUrl}/marketing-plan`);
  return response.data;
};

export const getGameCommentQualityRatingsLeaderboards = async (): Promise<
  Array<GameLeaderboard>
> => {
  const response = await axios.get(
    `${
      GDevelopGameApi.baseUrl
    }/game-comment-quality-ratings-leaderboard?leaderboardRegionName=global`
  );

  if (!Array.isArray(response.data)) {
    throw new Error('Invalid response from the game leaderboard API');
  }

  return response.data;
};
