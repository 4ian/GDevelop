// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../PaperDecorator';
import Text from '../../../UI/Text';
import PlaceholderError from '../../../UI/PlaceholderError';

export default {
  title: 'UI Building Blocks/PlaceholderError',
  component: PlaceholderError,
  decorators: [paperDecorator],
};

// $FlowFixMe[signature-verification-failure]
export const Default = () => {
  return (
    <PlaceholderError>
      <Text>This is an error</Text>
    </PlaceholderError>
  );
};
// $FlowFixMe[signature-verification-failure]
export const WithRetryButton = () => {
  return (
    <PlaceholderError onRetry={() => action('retry')()}>
      <Text>This is an error, but you can retry the failed action</Text>
    </PlaceholderError>
  );
};
