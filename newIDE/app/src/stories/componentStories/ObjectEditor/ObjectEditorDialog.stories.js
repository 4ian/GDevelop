// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import ObjectEditorDialog from '../../../ObjectEditor/ObjectEditorDialog';
import fakeResourceExternalEditors from '../../FakeResourceExternalEditors';
import { emptyStorageProvider } from '../../../ProjectsStorage/ProjectStorageProviders';
import EventsFunctionsExtensionsContext from '../../../EventsFunctionsExtensionsLoader/EventsFunctionsExtensionsContext';
import LocalEventsFunctionsExtensionWriter from '../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionWriter';
import LocalEventsFunctionsExtensionOpener from '../../../EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionOpener';

export default {
  title: 'ObjectEditor/ObjectEditorDialog',
  component: ObjectEditorDialog,
  decorators: [muiDecorator],
};

const eventsFunctionsExtensionsContext = {
  loadProjectEventsFunctionsExtensions: async project => {},
  unloadProjectEventsFunctionsExtensions: project => {},
  unloadProjectEventsFunctionsExtension: (project, extensionName) => {},
  reloadProjectEventsFunctionsExtensions: async project => {},
  getEventsFunctionsExtensionWriter: () => LocalEventsFunctionsExtensionWriter,
  getEventsFunctionsExtensionOpener: () => LocalEventsFunctionsExtensionOpener,
  ensureLoadFinished: async () => {},
  getIncludeFileHashs: () => ({}),
  eventsFunctionsExtensionsError: null,
};

export const CustomObject = () => (
  <EventsFunctionsExtensionsContext.Provider
    value={eventsFunctionsExtensionsContext}
  >
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
  </EventsFunctionsExtensionsContext.Provider>
);

export const StandardObject = () => (
  <EventsFunctionsExtensionsContext.Provider
    value={eventsFunctionsExtensionsContext}
  >
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
  </EventsFunctionsExtensionsContext.Provider>
);
