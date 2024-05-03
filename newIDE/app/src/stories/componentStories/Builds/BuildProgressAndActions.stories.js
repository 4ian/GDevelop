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

export const Errored = () => (
  <BuildProgressAndActions build={erroredCordovaBuild} game={game1} />
);

export const PendingElectronBuild = () => (
  <BuildProgressAndActions
    build={{ ...pendingElectronBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const PendingCordovaBuild = () => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const SlowPendingCordovaBuild = () => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 400 }}
    game={game1}
  />
);

export const TimedOutPendingCordovaBuild = () => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 3600 * 24 }}
    game={game1}
  />
);

export const CompleteCordovaBuild = () => (
  <BuildProgressAndActions build={completeCordovaBuild} game={game1} />
);

export const CompleteElectronBuild = () => (
  <BuildProgressAndActions build={completeElectronBuild} game={game1} />
);

export const CompleteUnpublishedWebBuild = () => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: 'other-build-id' }}
  />
);

export const CompletePublishedWebBuild = () => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: completeWebBuild.id }}
  />
);
