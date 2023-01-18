// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { ExampleStore } from '../../../../AssetStore/ExampleStore';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ExampleStoreStateProvider } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';

export default {
  title: 'AssetStore/ExampleStore',
  component: ExampleStore,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={400}>
    <ExampleStoreStateProvider>
      <ExampleStore
        onOpen={action('onOpen')}
        isOpening={false}
        initialExampleShortHeader={null}
      />
    </ExampleStoreStateProvider>
  </FixedHeightFlexContainer>
);
