// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { BuildCard } from '../../../ExportAndShare/Builds/BuildCard';

import paperDecorator from '../../PaperDecorator';

import {
  erroredCordovaBuild,
  pendingCordovaBuild,
  pendingElectronBuild,
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
  game1,
  fakeSilverAuthenticatedUser,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Builds/BuildCard',
  component: BuildCard,
  decorators: [paperDecorator],
};

export const WebBuildCard = (): React.Node => (
  <BuildCard
    build={completeWebBuild}
    game={{ ...game1, acceptsBuildComments: true }}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);

export const WebCurrentlyOnlineBuildCard = (): React.Node => (
  <BuildCard
    build={completeWebBuild}
    game={{
      ...game1,
      publicWebBuildId: completeWebBuild.id,
    }}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);

export const ElectronBuildCard = (): React.Node => (
  <BuildCard
    build={completeElectronBuild}
    game={game1}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);
export const PendingElectronBuildCard = (): React.Node => (
  <BuildCard
    build={pendingElectronBuild}
    game={game1}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);
export const CordovaBuildCard = (): React.Node => (
  <BuildCard
    build={completeCordovaBuild}
    game={game1}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);
export const pendingCordovaBuildCard = (): React.Node => (
  <BuildCard
    build={pendingCordovaBuild}
    game={game1}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);
export const ErroredCordovaBuildCard = (): React.Node => (
  <BuildCard
    build={erroredCordovaBuild}
    game={game1}
    gameUpdating={false}
    setGameUpdating={action('setGameUpdating')}
    onBuildUpdated={action('onBuildUpdated')}
    onBuildDeleted={action('onBuildDeleted')}
    authenticatedUser={fakeSilverAuthenticatedUser}
  />
);
