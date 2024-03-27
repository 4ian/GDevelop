// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import ObjectEditorDialog from '../../../ObjectEditor/ObjectEditorDialog';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/ObjectEditorDialog',
  component: ObjectEditorDialog,
};

export const CustomObject = () => (
  <DragAndDropContextProvider>
    <ObjectEditorDialog
      open={true}
      object={testProject.customObject}
      onApply={() => action('Apply changes')}
      onCancel={() => action('Cancel changes')}
      onRename={() => action('Rename object')}
      getValidatedObjectOrGroupName={newName => newName}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={fakeResourceManagementProps}
      onComputeAllVariableNames={() => []}
      onUpdateBehaviorsSharedData={() => {}}
      initialTab={null}
      hotReloadPreviewButtonProps={{
        hasPreviewsRunning: false,
        launchProjectDataOnlyPreview: () => action('Hot-reload'),
        launchProjectWithLoadingScreenPreview: () => action('Reload'),
      }}
      openBehaviorEvents={() => action('Open behavior events')}
    />
  </DragAndDropContextProvider>
);

export const StandardObject = () => (
  <DragAndDropContextProvider>
    <ObjectEditorDialog
      open={true}
      object={testProject.panelSpriteObject}
      onApply={() => action('Apply changes')}
      onCancel={() => action('Cancel changes')}
      onRename={() => action('Rename object')}
      getValidatedObjectOrGroupName={newName => newName}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={fakeResourceManagementProps}
      onComputeAllVariableNames={() => []}
      onUpdateBehaviorsSharedData={() => {}}
      initialTab={null}
      hotReloadPreviewButtonProps={{
        hasPreviewsRunning: false,
        launchProjectDataOnlyPreview: () => action('Hot-reload'),
        launchProjectWithLoadingScreenPreview: () => action('Reload'),
      }}
      openBehaviorEvents={() => action('Open behavior events')}
    />
  </DragAndDropContextProvider>
);
