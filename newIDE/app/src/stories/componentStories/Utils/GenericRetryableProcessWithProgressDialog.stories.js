// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';

import { GenericRetryableProcessWithProgressDialog } from '../../../Utils/UseGenericRetryableProcessWithProgress';

export default {
  title: 'GenericRetryableProcessWithProgressDialog',
  component: GenericRetryableProcessWithProgressDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <GenericRetryableProcessWithProgressDialog
    progress={40}
    result={null}
    onAbandon={null}
    onRetry={null}
    genericError={null}
  />
);

export const WithErrors = () => (
  <GenericRetryableProcessWithProgressDialog
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
  <GenericRetryableProcessWithProgressDialog
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
