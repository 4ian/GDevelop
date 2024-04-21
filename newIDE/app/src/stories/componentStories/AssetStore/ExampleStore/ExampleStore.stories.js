// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import paperDecorator from '../../../PaperDecorator';
import { ExampleStore } from '../../../../AssetStore/ExampleStore';
import FixedHeightFlexContainer from '../../../FixedHeightFlexContainer';
import { ExampleStoreStateProvider } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';

export default {
  title: 'AssetStore/ExampleStore',
  component: ExampleStore,
  decorators: [paperDecorator],
};

export const Default = () => (
  <FixedHeightFlexContainer height={400}>
    <ExampleStoreStateProvider>
      <ExampleStore
        isOpening={false}
        onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
        onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
        onSelectPrivateGameTemplateListingData={action(
          'onSelectPrivateGameTemplateListingData'
        )}
        selectedExampleShortHeader={null}
        selectedPrivateGameTemplateListingData={null}
      />
    </ExampleStoreStateProvider>
  </FixedHeightFlexContainer>
);
