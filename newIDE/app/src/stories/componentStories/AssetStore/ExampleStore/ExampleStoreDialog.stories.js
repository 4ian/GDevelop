// @flow
import * as React from 'react';
import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import { ExampleStoreStateProvider } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import ExampleStoreDialog from '../../../../AssetStore/ExampleStore/ExampleStoreDialog';

export default {
  title: 'Project Creation/ExampleStoreDialog',
  component: ExampleStoreDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ExampleStoreStateProvider>
    <ExampleStoreDialog
      open
      onClose={action('onClose')}
      initialExampleShortHeader={null}
      initialPrivateGameTemplateListingData={null}
      isProjectOpening={false}
      onChooseExampleShortHeader={action('onChooseExampleShortHeader')}
      onChoosePrivateGameTemplateListingData={action(
        'onChoosePrivateGameTemplateListingData'
      )}
      onChooseEmptyProject={action('onChooseEmptyProject')}
    />
  </ExampleStoreStateProvider>
);
