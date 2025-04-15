// @flow
import {
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
  fakeGame,
  pendingCordovaBuild,
  pendingElectronBuild,
} from '.';
import { type GameAndBuildsManager } from '../../Utils/UseGameAndBuildsManager';

export const fakeEmptyGameAndBuildsManager: GameAndBuildsManager = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: null,
  gameBuilds: null,
  refreshGameBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeGameAndBuildsManager: GameAndBuildsManager = {
  game: fakeGame,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: null,
  gameBuilds: [
    pendingCordovaBuild,
    pendingElectronBuild,
    completeCordovaBuild,
    completeElectronBuild,
    completeWebBuild,
  ],
  refreshGameBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeNotOwnedGameAndBuildsManager: GameAndBuildsManager = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'not-owned',
  gameBuilds: null,
  refreshGameBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeUnexpectedErrorGameAndBuildsManager: GameAndBuildsManager = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'unexpected',
  gameBuilds: null,
  refreshGameBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};
