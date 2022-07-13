// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import { ExampleStoreStateProvider } from '../../../AssetStore/ExampleStore/ExampleStoreContext';
import CreateProjectDialog from '../../../ProjectCreation/CreateProjectDialog';

export default {
  title: 'Project Creation/CreateProjectDialog',
  component: CreateProjectDialog,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <ExampleStoreStateProvider>
    <CreateProjectDialog
      open
      onClose={action('onClose')}
      onOpen={action('On open project after it is created')}
      onCreateBlank={() => action('create blank project')}
      onCreateFromExampleShortHeader={() => action('create from example')}
    />
  </ExampleStoreStateProvider>
);
