// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../PaperDecorator';

import { EmptyPlaceholder } from '../../UI/EmptyPlaceholder';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import PasteIcon from '../../UI/CustomSvgIcons/Clipboard';

export default {
  title: 'UI Building Blocks/EmptyPlaceholder',
  component: EmptyPlaceholder,
  decorators: [paperDecorator],
};
export const Default = () => (
  <FixedHeightFlexContainer
    height={500}
    justifyContent="center"
    alignItems="center"
  >
    <EmptyPlaceholder
      title="Add your first event"
      description="You can use events to create cause and effect."
      actionLabel="Add something"
      helpPagePath="/objects/tiled_sprite"
      onAction={action('onAdd')}
    />
  </FixedHeightFlexContainer>
);

export const WithSecondaryAction = () => (
  <FixedHeightFlexContainer
    height={500}
    justifyContent="center"
    alignItems="center"
  >
    <EmptyPlaceholder
      title="Add your first event"
      description="You can use events to create cause and effect."
      actionLabel="Add something"
      helpPagePath="/objects/tiled_sprite"
      onAction={action('onAdd')}
      secondaryActionIcon={<PasteIcon />}
      secondaryActionLabel="Paste"
      onSecondaryAction={action('onAdd')}
    />
  </FixedHeightFlexContainer>
);
