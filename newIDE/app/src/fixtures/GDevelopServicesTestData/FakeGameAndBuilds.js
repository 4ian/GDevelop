// @flow
import {
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
  fakeGame,
  pendingCordovaBuild,
  pendingElectronBuild,
} from '.';

export const fakeEmptyGameAndBuilds = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: null,
  builds: null,
  refreshBuilds: async () => {},
};

export const fakeGameAndBuilds = {
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
};

export const fakeNotOwnedGameAndBuilds = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'not-owned',
  builds: null,
  refreshBuilds: async () => {},
};

export const fakeUnexpectedErrorGameAndBuilds = {
  game: null,
  setGame: () => {},
  refreshGame: async () => {},
  gameAvailabilityError: 'unexpected',
  builds: null,
  refreshBuilds: async () => {},
};
