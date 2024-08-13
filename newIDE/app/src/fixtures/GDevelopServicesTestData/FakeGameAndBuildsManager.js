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
  builds: null,
  refreshBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeGameAndBuildsManager: GameAndBuildsManager = {
  game: fakeGame,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: null,
  builds: [
    pendingCordovaBuild,
    pendingElectronBuild,
    completeCordovaBuild,
    completeElectronBuild,
    completeWebBuild,
  ],
  refreshBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeNotOwnedGameAndBuildsManager: GameAndBuildsManager = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'not-owned',
  builds: null,
  refreshBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};

export const fakeUnexpectedErrorGameAndBuildsManager: GameAndBuildsManager = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'unexpected',
  builds: null,
  refreshBuilds: async () => {},
  registerGameIfNeeded: async () => {},
};
