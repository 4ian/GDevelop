// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';

import { GenericRetryableProcessWithProgressDialog } from '../../../Utils/UseGenericRetryableProcessWithProgress';

export default {
  title: 'GenericRetryableProcessWithProgressDialog',
  component: GenericRetryableProcessWithProgressDialog,
  decorators: [paperDecorator],
};

export const Starting = (): React.Node => (
  <GenericRetryableProcessWithProgressDialog
    progress={0}
    result={null}
    onAbandon={null}
    onRetry={null}
    genericError={null}
  />
);

export const InProgress = (): React.Node => (
  <GenericRetryableProcessWithProgressDialog
    progress={40}
    result={null}
    onAbandon={null}
    onRetry={null}
    genericError={null}
  />
);

export const WithErrors = (): React.Node => (
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

export const WithGenericError = (): React.Node => (
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
