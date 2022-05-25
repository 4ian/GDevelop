// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

import muiDecorator from '../../../ThemeDecorator';
import paperDecorator from '../../../PaperDecorator';
import { testProject } from '../../../GDevelopJsInitializerDecorator';
import { AssetStoreStateProvider } from '../../../../AssetStore/AssetStoreContext';
import { AssetStore } from '../../../../AssetStore';

export default {
  title: 'AssetStore/AssetStore',
  component: AssetStore,
  decorators: [paperDecorator, muiDecorator],
};

export const Default = () => (
  <AssetStoreStateProvider>
    <AssetStore
      onOpenDetails={action('onOpenDetails')}
      events={testProject.testLayout.getEvents()}
      project={testProject.project}
      layout={testProject.testLayout}
      onChooseResource={() => Promise.reject('unimplemented')}
      resourceSources={[]}
      onObjectAddedFromAsset={() => {}}
      resourceExternalEditors={[]}
      objectsContainer={testProject.testLayout}
    />
  </AssetStoreStateProvider>
);
