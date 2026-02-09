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

export const Errored = (): renders any => (
  <BuildProgressAndActions build={erroredCordovaBuild} game={game1} />
);

export const PendingElectronBuild = (): renders any => (
  <BuildProgressAndActions
    build={{ ...pendingElectronBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const PendingCordovaBuild = (): renders any => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() }}
    game={game1}
  />
);

export const SlowPendingCordovaBuild = (): renders any => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 400 }}
    game={game1}
  />
);

export const TimedOutPendingCordovaBuild = (): renders any => (
  <BuildProgressAndActions
    build={{ ...pendingCordovaBuild, updatedAt: Date.now() - 1000 * 3600 * 24 }}
    game={game1}
  />
);

export const CompleteCordovaBuild = (): renders any => (
  <BuildProgressAndActions build={completeCordovaBuild} game={game1} />
);

export const CompleteElectronBuild = (): renders any => (
  <BuildProgressAndActions build={completeElectronBuild} game={game1} />
);

export const CompleteUnpublishedWebBuild = (): renders any => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: 'other-build-id' }}
  />
);

export const CompletePublishedWebBuild = (): renders any => (
  <BuildProgressAndActions
    build={completeWebBuild}
    game={{ ...game1, publicWebBuildId: completeWebBuild.id }}
  />
);
