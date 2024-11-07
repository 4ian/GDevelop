// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { completeWebBuild } from '../../../fixtures/GDevelopServicesTestData';
import ShareOnlineGameDialog from '../../../ExportAndShare/GenericExporters/OnlineWebExport/ShareOnlineGameDialog';

export default {
  title: 'Share/ShareOnlineGameDialog',
  component: ShareOnlineGameDialog,
};

const gameName = 'Bark and sea';
const thumbnailUrl =
  'https://games.gdevelop-app.com/game-14f30268-f976-4e84-8c09-2e391b1f3907/BarkAndSail2.png';

export const Published = () => {
  const buildOrGameUrl = 'https://gd.games/alex_/bark-and-sea';
  return (
    <ShareOnlineGameDialog
      gameThumbnailUrl={null}
      gameName={gameName}
      buildOrGameUrl={buildOrGameUrl}
      isBuildPublished={true}
      loadingText={null}
      onClose={action('onClose')}
      onOpenGameDashboard={action('onOpenGameDashboard')}
    />
  );
};
export const PublishedWithThumbnail = () => {
  const buildOrGameUrl = 'https://gd.games/alex_/bark-and-sea';
  return (
    <ShareOnlineGameDialog
      gameThumbnailUrl={thumbnailUrl}
      gameName={gameName}
      buildOrGameUrl={buildOrGameUrl}
      isBuildPublished={true}
      loadingText={null}
      onClose={action('onClose')}
      onOpenGameDashboard={action('onOpenGameDashboard')}
    />
  );
};

export const Private = () => {
  const buildOrGameUrl = `https://gd.games/instant-builds/${
    completeWebBuild.id
  }`;
  return (
    <ShareOnlineGameDialog
      gameThumbnailUrl={null}
      gameName={gameName}
      buildOrGameUrl={buildOrGameUrl}
      isBuildPublished={false}
      loadingText={null}
      onClose={action('onClose')}
      onOpenGameDashboard={action('onOpenGameDashboard')}
    />
  );
};

export const Loading = () => {
  const buildOrGameUrl = 'https://gd.games/alex_/bark-and-sea';
  return (
    <ShareOnlineGameDialog
      gameThumbnailUrl={null}
      gameName={gameName}
      buildOrGameUrl={buildOrGameUrl}
      isBuildPublished={true}
      loadingText={'Generating link'}
      onClose={action('onClose')}
      onOpenGameDashboard={action('onOpenGameDashboard')}
    />
  );
};
