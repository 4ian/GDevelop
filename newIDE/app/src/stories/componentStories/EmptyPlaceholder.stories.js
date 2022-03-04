// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../ThemeDecorator';
import paperDecorator from '../PaperDecorator';

import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';

export default {
  title: 'UI Building Blocks/EmptyPlaceholder',
  component: EmptyPlaceholder,
  decorators: [paperDecorator, muiDecorator],
};
export const Default = () => (
  <EmptyPlaceholder
    title="Add your first event"
    description="You can use events to create cause and effect."
    actionLabel="Add something"
    helpPagePath="/objects/tiled_sprite"
    onAdd={action('onAdd')}
  />
);
