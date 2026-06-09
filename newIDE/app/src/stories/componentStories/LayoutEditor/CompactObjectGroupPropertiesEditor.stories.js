// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';
import fakeResourceManagementProps from '../../FakeResourceManagement';

import paperDecorator from '../../PaperDecorator';
import { CompactObjectGroupPropertiesEditor } from '../../../ObjectGroupEditor/CompactObjectGroupPropertiesEditor';

export default {
  title: 'LayoutEditor/CompactObjectGroupPropertiesEditor',
  component: CompactObjectGroupPropertiesEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => (
  <CompactObjectGroupPropertiesEditor
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    initialInstances={testProject.testLayout.getInitialInstances()}
    objectGroup={testProject.group2}
    isVariableListLocked={false}
    isObjectListLocked={false}
    eventsFunctionsExtension={null}
    eventsBasedObject={null}
    onEditObjectGroup={action('onEditObjectGroup')}
    resourceManagementProps={fakeResourceManagementProps}
  />
);

export const WithLongObjectNames = (): React.Node => (
  <CompactObjectGroupPropertiesEditor
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    initialInstances={testProject.testLayout.getInitialInstances()}
    objectGroup={testProject.group4WithLongsNames}
    isVariableListLocked={false}
    isObjectListLocked={false}
    eventsFunctionsExtension={null}
    eventsBasedObject={null}
    onEditObjectGroup={action('onEditObjectGroup')}
    resourceManagementProps={fakeResourceManagementProps}
  />
);

export const Empty = (): React.Node => (
  <CompactObjectGroupPropertiesEditor
    project={testProject.project}
    projectScopedContainersAccessor={
      testProject.testSceneProjectScopedContainersAccessor
    }
    globalObjectsContainer={testProject.project.getObjects()}
    objectsContainer={testProject.testLayout.getObjects()}
    initialInstances={testProject.testLayout.getInitialInstances()}
    objectGroup={testProject.emptyGroup}
    isVariableListLocked={false}
    isObjectListLocked={false}
    eventsFunctionsExtension={null}
    eventsBasedObject={null}
    onEditObjectGroup={action('onEditObjectGroup')}
    resourceManagementProps={fakeResourceManagementProps}
  />
);
