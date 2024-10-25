// @flow
import axios from 'axios';
import { GDevelopPlayApi } from './ApiConfigs';

import { type AuthenticatedUser } from '../../Profile/AuthenticatedUserContext';
import { rgbOrHexToRGBString } from '../ColorTransformer';

export type LeaderboardSortOption = 'ASC' | 'DESC';
export type LeaderboardVisibilityOption = 'HIDDEN' | 'PUBLIC';
export type LeaderboardPlayerUnicityDisplayOption =
  | 'FREE'
  | 'PREFER_UNIQUE'
  | 'PREFER_NON_UNIQUE';

export type LeaderboardScoreFormattingCustom = {|
  type: 'custom',
  prefix: string,
  suffix: string,
  precision: number,
|};

export type LeaderboardScoreFormattingTimeUnit =
  | 'hour'
  | 'minute'
  | 'second'
  | 'millisecond';

export type LeaderboardScoreFormattingTime = {|
  type: 'time',
  smallestUnit: LeaderboardScoreFormattingTimeUnit,
  biggestUnit: LeaderboardScoreFormattingTimeUnit,
|};

export type LeaderboardScoreFormatting =
  | LeaderboardScoreFormattingCustom
  | LeaderboardScoreFormattingTime;

export interface LeaderboardTheme {
  backgroundColor: string;
  textColor: string;
  highlightBackgroundColor: string;
  highlightTextColor: string;
}

export type LeaderboardCustomizationSettings = {|
  defaultDisplayedEntriesNumber?: number,
  scoreTitle: string,
  scoreFormatting: LeaderboardScoreFormatting,
  theme?: LeaderboardTheme,
  useCustomCss?: boolean,
  customCss?: string,
|};

export type Leaderboard = {|
  id: string,
  gameId: string,
  name: string,
  sort: LeaderboardSortOption,
  startDatetime: string,
  deletedAt?: string,
  playerUnicityDisplayChoice: LeaderboardPlayerUnicityDisplayOption,
  visibility: LeaderboardVisibilityOption,
  customizationSettings?: LeaderboardCustomizationSettings,
  primary?: boolean,
  resetLaunchedAt?: string,
  extremeAllowedScore?: number,
  ignoreCustomPlayerNames?: boolean,
  autoPlayerNamePrefix?: string,
  disableLoginInLeaderboard?: string,
|};

export type LeaderboardUpdatePayload = {|
  name?: string,
  sort?: LeaderboardSortOption,
  playerUnicityDisplayChoice?: LeaderboardPlayerUnicityDisplayOption,
  visibility?: LeaderboardVisibilityOption,
  customizationSettings?: LeaderboardCustomizationSettings,
  primary?: boolean,
  extremeAllowedScore?: number | null,
  ignoreCustomPlayerNames?: boolean,
  autoPlayerNamePrefix?: string,
  disableLoginInLeaderboard?: boolean,
|};

export type LeaderboardEntry = {|
  id: string,
  leaderboardId: string,
  playerId?: string,
  playerName: string,
  createdAt: string,
  score: number,
|};

export type LobbyConfiguration = {|
  gameId: string,
  maxPlayers: number,
  minPlayers: number,
  canJoinAfterStart: boolean,
|};

export const shortenUuidForDisplay = (uuid: string): string =>
  `${uuid.split('-')[0]}-...`;

export const client = axios.create({
  baseURL: GDevelopPlayApi.baseUrl,
});

export const listGameActiveLeaderboards = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string
): Promise<?Array<Leaderboard>> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/game/${gameId}/leaderboard`, {
    headers: { Authorization: authorizationHeader },
    params: { userId, deleted: 'false' },
  });
  return response.data;
};

export const extractNextPageUriFromLinkHeader = (
  linkHeader: string
): ?string => {
  const links = linkHeader.split(',').map(link => link.trim());
  const mapRelationToUri = links.reduce((acc, link) => {
    const relationRegexMatch = link.match(/;\srel="(\w*)"/);
    const uriMatch = link.match(/^<(.*)>/);
    if (acc && relationRegexMatch && uriMatch) {
      acc[relationRegexMatch[1]] = uriMatch[1];
    }
    return acc;
  }, {});
  if (Object.keys(mapRelationToUri).includes('next')) {
    return mapRelationToUri.next;
  }
  return null;
};

export const listLeaderboardEntries = async (
  gameId: string,
  leaderboardId: string,
  options: {| pageSize: number, onlyBestEntry: boolean, forceUri: ?string |}
): Promise<{|
  entries: LeaderboardEntry[],
  nextPageUri: ?string,
|}> => {
  const uri =
    options.forceUri || `/game/${gameId}/leaderboard/${leaderboardId}/entry`;
  // $FlowFixMe
  const response = await client.get(uri, {
    params: options.forceUri
      ? null
      : {
          onlyBestEntry: options.onlyBestEntry,
          perPage: options.pageSize,
        },
  });
  const nextPageUri = response.headers.link
    ? extractNextPageUriFromLinkHeader(response.headers.link)
    : null;
  return {
    entries: response.data,
    nextPageUri,
  };
};

export const createLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  { name, sort }: {| name: string, sort: LeaderboardSortOption |}
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/game/${gameId}/leaderboard`,
    {
      name,
      sort,
    },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

type LeaderboardDuplicationPayload = {|
  sourceLeaderboardId: string,
  sourceGameId: string,
|};

export const duplicateLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  payload: LeaderboardDuplicationPayload
): Promise<Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) throw new Error('User is not authenticated.');

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/game/${gameId}/leaderboard/action/copy`,
    payload,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const updateLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string,
  payload: LeaderboardUpdatePayload
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.patch(
    `/game/${gameId}/leaderboard/${leaderboardId}`,
    payload,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const resetLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.put(
    `/game/${gameId}/leaderboard/${leaderboardId}/reset`,
    {},
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const deleteLeaderboard = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.delete(
    `/game/${gameId}/leaderboard/${leaderboardId}`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const deleteLeaderboardEntry = async (
  authenticatedUser: AuthenticatedUser,
  gameId: string,
  leaderboardId: string,
  entryId: string
): Promise<?Leaderboard> => {
  const { getAuthorizationHeader, firebaseUser } = authenticatedUser;
  if (!firebaseUser) return;

  const { uid: userId } = firebaseUser;
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.delete(
    `/game/${gameId}/leaderboard/${leaderboardId}/entry/${entryId}`,
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

// 2 types of comments. Feedback is private, Review is public.
export type CommentType = 'FEEDBACK' | 'REVIEW';

export type GameRatings = {
  version: number,
  visuals: number,
  sound: number,
  fun: number,
  easeOfUse: number,
};

export type Comment = {
  id: string,
  type: CommentType,
  gameId: string,
  buildId?: string,
  text: string,
  ratings?: GameRatings,
  playerId?: string,
  playerName?: string,
  contact?: string,
  createdAt: number,
  processedAt?: number,
  updatedAt: number,
  qualityRatingPerRole?: {
    owner?: string,
  },
};

export const listComments = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
    type,
  }: {|
    gameId: string,
    type: 'FEEDBACK' | 'REVIEW',
  |}
): Promise<Array<Comment>> => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      client.get(`/game/${gameId}/comment`, {
        params: {
          userId,
          type,
        },
        headers: {
          Authorization: authorizationHeader,
        },
      })
    )
    .then(response => response.data);
};

export const canCommentBeRatedByOwner = (comment: Comment): boolean => {
  if (!comment.text) return false;

  return true;
};

export const updateComment = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
    commentId,
    processed,
    qualityRating,
  }: {|
    gameId: string,
    commentId: string,
    processed?: boolean,
    qualityRating?: string,
  |}
) => {
  return getAuthorizationHeader()
    .then(authorizationHeader =>
      client.patch(
        `/game/${gameId}/comment/${commentId}`,
        { processed, qualityRating },
        {
          params: { userId },
          headers: {
            Authorization: authorizationHeader,
          },
        }
      )
    )
    .then(response => response.data);
};

export const canUserCustomizeLeaderboardTheme = (
  authenticatedUser: AuthenticatedUser
): {|
  canUseTheme: boolean,
  canUseCustomCss: boolean,
|} => {
  const { limits } = authenticatedUser;
  return {
    canUseTheme:
      !!limits &&
      !!limits.capabilities.leaderboards &&
      (limits.capabilities.leaderboards.themeCustomizationCapabilities ===
        'BASIC' ||
        limits.capabilities.leaderboards.themeCustomizationCapabilities ===
          'FULL'),
    canUseCustomCss:
      !!limits &&
      !!limits.capabilities.leaderboards &&
      !!limits.capabilities.leaderboards.canUseCustomCss,
  };
};

export const getRGBLeaderboardTheme = (
  leaderboardCustomizationSettings: ?LeaderboardCustomizationSettings
): LeaderboardTheme => {
  const defaultBackgroundColor = '#d0d1ff';
  const defaultTextColor = '#000000';
  const defaultHighlightBackgroundColor = '#5763dd';
  const defaultHighlightTextColor = '#ffffff';

  const hexLeaderboardTheme =
    leaderboardCustomizationSettings && leaderboardCustomizationSettings.theme
      ? {
          backgroundColor:
            leaderboardCustomizationSettings.theme.backgroundColor,
          textColor: leaderboardCustomizationSettings.theme.textColor,
          highlightBackgroundColor:
            leaderboardCustomizationSettings.theme.highlightBackgroundColor,
          highlightTextColor:
            leaderboardCustomizationSettings.theme.highlightTextColor,
        }
      : {
          backgroundColor: defaultBackgroundColor,
          textColor: defaultTextColor,
          highlightBackgroundColor: defaultHighlightBackgroundColor,
          highlightTextColor: defaultHighlightTextColor,
        };
  return {
    backgroundColor: rgbOrHexToRGBString(hexLeaderboardTheme.backgroundColor),
    textColor: rgbOrHexToRGBString(hexLeaderboardTheme.textColor),
    highlightBackgroundColor: rgbOrHexToRGBString(
      hexLeaderboardTheme.highlightBackgroundColor
    ),
    highlightTextColor: rgbOrHexToRGBString(
      hexLeaderboardTheme.highlightTextColor
    ),
  };
};

export const getLobbyConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
  }: {|
    gameId: string,
  |}
): Promise<LobbyConfiguration> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.get(`/game/${gameId}/lobby-configuration`, {
    params: { userId },
    headers: {
      Authorization: authorizationHeader,
    },
  });
  return response.data;
};

export const updateLobbyConfiguration = async (
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  {
    gameId,
    maxPlayers,
    minPlayers,
    canJoinAfterStart,
  }: {|
    gameId: string,
    maxPlayers: number,
    minPlayers: number,
    canJoinAfterStart: boolean,
  |}
): Promise<LobbyConfiguration> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.patch(
    `/game/${gameId}/lobby-configuration`,
    { maxPlayers, minPlayers, canJoinAfterStart },
    {
      params: { userId },
      headers: {
        Authorization: authorizationHeader,
      },
    }
  );
  return response.data;
};

export const duplicateLobbyConfiguration = async ({
  getAuthorizationHeader,
  userId,
  gameId,
  sourceGameId,
}: {|
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
  sourceGameId: string,
|}): Promise<LobbyConfiguration> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/game/${gameId}/lobby-configuration/action/copy`,
    { sourceGameId },
    {
      headers: { Authorization: authorizationHeader },
      params: { userId },
    }
  );
  return response.data;
};

export const getPlayerToken = async ({
  getAuthorizationHeader,
  userId,
  gameId,
}: {
  getAuthorizationHeader: () => Promise<string>,
  userId: string,
  gameId: string,
}): Promise<string> => {
  const authorizationHeader = await getAuthorizationHeader();
  const response = await client.post(
    `/game/${gameId}/player-token`,
    {},
    {
      headers: {
        Authorization: authorizationHeader,
      },
      params: {
        userId,
      },
    }
  );
  return response.data;
};
