// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';

import { ResourceMoverDialog } from '../../../../ProjectsStorage/ResourceMover';

export default {
  title: 'ResourceMoverDialog',
  component: ResourceMoverDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ResourceMoverDialog
    progress={40}
    result={null}
    onAbandon={null}
    onRetry={null}
    genericError={null}
  />
);

export const WithErrors = () => (
  <ResourceMoverDialog
    progress={100}
    result={{
      erroredResources: [
        {
          resourceName: 'Player.png',
          error: new Error('Fake download error'),
        },
        {
          resourceName: 'Spaceship.png',
          error: new Error('Another fake error'),
        },
      ],
    }}
    onAbandon={action('abandon')}
    onRetry={action('retry')}
    genericError={null}
  />
);

export const WithGenericError = () => (
  <ResourceMoverDialog
    progress={100}
    result={{
      erroredResources: [
        {
          resourceName: 'Spaceship.png',
          error: new Error('Another fake error'),
        },
      ],
    }}
    onAbandon={action('abandon')}
    onRetry={action('retry')}
    genericError={new Error('Some generic error that happened to the project.')}
  />
);
