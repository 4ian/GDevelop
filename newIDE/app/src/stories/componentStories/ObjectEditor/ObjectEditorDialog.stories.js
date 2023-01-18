// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import ObjectEditorDialog from '../../../ObjectEditor/ObjectEditorDialog';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';

export default {
  title: 'ObjectEditor/ObjectEditorDialog',
  component: ObjectEditorDialog,
  decorators: [muiDecorator],
};

export const CustomObject = () => (
  <ObjectEditorDialog
    open={true}
    object={testProject.customObject}
    onApply={() => action('Apply changes')}
    onCancel={() => action('Cancel changes')}
    onRename={() => action('Rename object')}
    canRenameObject={name => true}
    project={testProject.project}
    resourceManagementProps={{
      getStorageProvider: () => emptyStorageProvider,
      onFetchNewlyAddedResources: async () => {},
      resourceSources: [],
      onChooseResource: () => Promise.reject('Unimplemented'),
      resourceExternalEditors: fakeResourceExternalEditors,
    }}
    onComputeAllVariableNames={() => []}
    onUpdateBehaviorsSharedData={() => {}}
    initialTab={null}
    hotReloadPreviewButtonProps={{
      hasPreviewsRunning: false,
      launchProjectDataOnlyPreview: () => action('Hot-reload'),
      launchProjectWithLoadingScreenPreview: () => action('Reload'),
    }}
  />
);

export const StandardObject = () => (
  <ObjectEditorDialog
    open={true}
    object={testProject.panelSpriteObject}
    onApply={() => action('Apply changes')}
    onCancel={() => action('Cancel changes')}
    onRename={() => action('Rename object')}
    canRenameObject={name => true}
    project={testProject.project}
    resourceManagementProps={{
      getStorageProvider: () => emptyStorageProvider,
      onFetchNewlyAddedResources: async () => {},
      resourceSources: [],
      onChooseResource: () => Promise.reject('Unimplemented'),
      resourceExternalEditors: fakeResourceExternalEditors,
    }}
    onComputeAllVariableNames={() => []}
    onUpdateBehaviorsSharedData={() => {}}
    initialTab={null}
    hotReloadPreviewButtonProps={{
      hasPreviewsRunning: false,
      launchProjectDataOnlyPreview: () => action('Hot-reload'),
      launchProjectWithLoadingScreenPreview: () => action('Reload'),
    }}
  />
);
