// @flow

/** How long a game is waited for when asked something, unless said otherwise. */
export const DEFAULT_GAME_RESPONSE_TIMEOUT_MS = 1000;

/** How long a game is waited for when asked the state of its resources: building the answer takes time with a lot of them. */
export const RESOURCES_DUMP_TIMEOUT_MS = 10000;

/** Under this many frames, an average says more about the moment it was taken than about the game: comparing to it is warned about. */
export const MINIMUM_COMPARABLE_FRAMES_COUNT = 100;

/** The share of the inspector given to the list of the scene content, until the user resizes it. */
export const DEFAULT_INSPECTOR_LIST_SPLIT_PERCENTAGE = 30;
