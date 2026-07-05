// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';

import paperDecorator from '../../PaperDecorator';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import { CompactObjectGroupPropertiesEditor } from '../../../ObjectGroupEditor/CompactObjectGroupPropertiesEditor';

export default {
  title: 'LayoutEditor/CompactObjectGroupPropertiesEditor',
  component: CompactObjectGroupPropertiesEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <DragAndDropContextProvider>
    <CompactObjectGroupPropertiesEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={testProject.project.getObjects()}
      objectsContainer={testProject.testLayout.getObjects()}
      initialInstances={testProject.testLayout.getInitialInstances()}
      layersContainer={testProject.testLayout.getLayers()}
      objectGroup={testProject.group2}
      isVariableListLocked={false}
      isObjectListLocked={false}
      isBehaviorListLocked={false}
      eventsFunctionsExtension={null}
      eventsBasedObject={null}
      onEditObjectGroup={action('onEditObjectGroup')}
      onWillInstallExtension={action('onWillInstallExtension')}
      onExtensionInstalled={action('onExtensionInstalled')}
      onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
      resourceManagementProps={fakeResourceManagementProps}
    />
  </DragAndDropContextProvider>
);

export const WithLongObjectNames = (): React.Node => (
  <DragAndDropContextProvider>
    <CompactObjectGroupPropertiesEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={testProject.project.getObjects()}
      objectsContainer={testProject.testLayout.getObjects()}
      initialInstances={testProject.testLayout.getInitialInstances()}
      layersContainer={testProject.testLayout.getLayers()}
      objectGroup={testProject.group4WithLongsNames}
      isVariableListLocked={false}
      isObjectListLocked={false}
      isBehaviorListLocked={false}
      eventsFunctionsExtension={null}
      eventsBasedObject={null}
      onEditObjectGroup={action('onEditObjectGroup')}
      onWillInstallExtension={action('onWillInstallExtension')}
      onExtensionInstalled={action('onExtensionInstalled')}
      onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
      resourceManagementProps={fakeResourceManagementProps}
    />
  </DragAndDropContextProvider>
);

export const Empty = (): React.Node => (
  <DragAndDropContextProvider>
    <CompactObjectGroupPropertiesEditor
      project={testProject.project}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      globalObjectsContainer={testProject.project.getObjects()}
      objectsContainer={testProject.testLayout.getObjects()}
      initialInstances={testProject.testLayout.getInitialInstances()}
      layersContainer={testProject.testLayout.getLayers()}
      objectGroup={testProject.emptyGroup}
      isVariableListLocked={false}
      isObjectListLocked={false}
      isBehaviorListLocked={false}
      eventsFunctionsExtension={null}
      eventsBasedObject={null}
      onEditObjectGroup={action('onEditObjectGroup')}
      onWillInstallExtension={action('onWillInstallExtension')}
      onExtensionInstalled={action('onExtensionInstalled')}
      onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
      resourceManagementProps={fakeResourceManagementProps}
    />
  </DragAndDropContextProvider>
);
