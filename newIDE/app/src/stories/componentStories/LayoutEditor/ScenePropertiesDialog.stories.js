// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import ScenePropertiesDialog from '../../../SceneEditor/ScenePropertiesDialog';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'LayoutEditor/ScenePropertiesDialog',
  component: ScenePropertiesDialog,
  decorators: [muiDecorator],
};

export const Default = () => (
  <ScenePropertiesDialog
    open
    project={testProject.project}
    layout={testProject.testLayout}
    onClose={() => action('Close the dialog')}
    onApply={() => action('Apply changes')}
    onEditVariables={() => action('Edit variables')}
    resourceManagementProps={{
      getStorageProvider: () => emptyStorageProvider,
      onFetchNewlyAddedResources: async () => {},
      resourceSources: [],
      onChooseResource: () => Promise.reject('Unimplemented'),
      resourceExternalEditors: fakeResourceExternalEditors,
    }}
  />
);

export const MoreSettings = () => (
  <ScenePropertiesDialog
    open
    project={testProject.project}
    layout={testProject.testLayout}
    onClose={() => action('Close the dialog')}
    onApply={() => action('Apply changes')}
    onEditVariables={() => action('Edit variables')}
    onOpenMoreSettings={() => action('Open more settings')}
    resourceManagementProps={{
      getStorageProvider: () => emptyStorageProvider,
      onFetchNewlyAddedResources: async () => {},
      resourceSources: [],
      onChooseResource: () => Promise.reject('Unimplemented'),
      resourceExternalEditors: fakeResourceExternalEditors,
    }}
  />
);
