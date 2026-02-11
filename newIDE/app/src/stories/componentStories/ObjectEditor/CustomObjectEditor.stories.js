// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import CustomObjectPropertiesEditor from '../../../ObjectEditor/Editors/CustomObjectPropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/CustomObjectPropertiesEditor',
  component: CustomObjectPropertiesEditor,
  decorators: [paperDecorator],
};

export const ButtonObject = () => (
  <SerializedObjectDisplay object={testProject.customObject.getConfiguration()}>
    <CustomObjectPropertiesEditor
      objectConfiguration={testProject.customObject.getConfiguration()}
      projectScopedContainersAccessor={
        testProject.testSceneProjectScopedContainersAccessor
      }
      project={testProject.project}
      layout={testProject.testLayout}
      eventsFunctionsExtension={null}
      eventsBasedObject={null}
      resourceManagementProps={fakeResourceManagementProps}
      onSizeUpdated={() => {}}
      object={testProject.customObject}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
