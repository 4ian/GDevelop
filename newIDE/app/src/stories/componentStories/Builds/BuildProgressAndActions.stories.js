// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import BuildProgressAndActions from '../../../ExportAndShare/Builds/BuildProgressAndActions';
import {
  erroredCordovaBuild,
  pendingCordovaBuild,
  pendingElectronBuild,
  completeCordovaBuild,
  completeElectronBuild,
  completeWebBuild,
  game1,
} from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'Builds/BuildProgressAndActions',
  component: BuildProgressAndActions,
  decorators: [paperDecorator],
};

export const Errored = (): React.Node => (
  <BuildProgressAndActions build={erroredCordovaBuild} game={game1} />
);

export const PendingElectronBuild = (): React.Node => (
  <BuildProgressAndActions
    build={{ ...pendingElectronBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const PendingCordovaBuild = (): React.Node => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const SlowPendingCordovaBuild = (): React.Node => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 400 }}
    game={game1}
  />
);

export const TimedOutPendingCordovaBuild = (): React.Node => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 3600 * 24 }}
    game={game1}
  />
);

export const CompleteCordovaBuild = (): React.Node => (
  <BuildProgressAndActions build={completeCordovaBuild} game={game1} />
);

export const CompleteElectronBuild = (): React.Node => (
  <BuildProgressAndActions build={completeElectronBuild} game={game1} />
);

export const CompleteUnpublishedWebBuild = (): React.Node => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: 'other-build-id' }}
  />
);

export const CompletePublishedWebBuild = (): React.Node => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: completeWebBuild.id }}
  />
);
