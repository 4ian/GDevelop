// @flow
import * as React from 'react';

import paperDecorator from '../../PaperDecorator';

import PlaceholderMessage from '../../../UI/PlaceholderMessage';

export default {
  title: 'UI Building Blocks/PlaceholderMessage',
  component: PlaceholderMessage,
  decorators: [paperDecorator],
};

export const Default = () => (
  <PlaceholderMessage>
    <p>
      Neque porro quisquam est qui dolorem ipsum quia dolor sit amet,
      consectetur, adipisci velit
    </p>
  </PlaceholderMessage>
);
