// @flow
import * as React from 'react';
import paperDecorator from '../../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import { ExampleStoreStateProvider } from '../../../../AssetStore/ExampleStore/ExampleStoreContext';
import ExampleStoreDialog from '../../../../AssetStore/ExampleStore/ExampleStoreDialog';

export default {
  title: 'Project Creation/ExampleStoreDialog',
  component: ExampleStoreDialog,
  decorators: [paperDecorator],
};

export const Default = () => (
  <ExampleStoreStateProvider>
    <ExampleStoreDialog
      open
      isProjectOpening={false}
      onClose={action('onClose')}
      selectedExampleShortHeader={null}
      selectedPrivateGameTemplateListingData={null}
      onSelectExampleShortHeader={action('onSelectExampleShortHeader')}
      onSelectPrivateGameTemplateListingData={action(
        'onSelectPrivateGameTemplateListingData'
      )}
      onOpenNewProjectSetupDialog={action('onOpenNewProjectSetupDialog')}
    />
  </ExampleStoreStateProvider>
);
