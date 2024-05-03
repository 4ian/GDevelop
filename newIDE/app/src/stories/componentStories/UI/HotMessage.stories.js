// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import { getPaperDecorator } from '../../PaperDecorator';

import HotMessage from '../../../UI/HotMessage';
import { ColumnStackLayout } from '../../../UI/Layout';

export default {
  title: 'UI Building Blocks/HotMessage',
  component: HotMessage,
  decorators: [getPaperDecorator('medium')],
};

export const Default = () => (
  <ColumnStackLayout>
    <HotMessage
      title="Get 2 months free!"
      message="Get a yearly subscription and pay only 10 months!"
      rightButtonLabel="See yearly subs"
      onClickRightButton={action('onClickRightButton')}
    />
  </ColumnStackLayout>
);
