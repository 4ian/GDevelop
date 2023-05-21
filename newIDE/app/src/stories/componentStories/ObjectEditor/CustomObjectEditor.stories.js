// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import CustomObjectPropertiesEditor from '../../../ObjectEditor/Editors/CustomObjectPropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/CustomObjectPropertiesEditor',
  component: CustomObjectPropertiesEditor,
  decorators: [paperDecorator, muiDecorator],
};

export const ButtonObject = () => (
  <SerializedObjectDisplay object={testProject.customObject.getConfiguration()}>
    <CustomObjectPropertiesEditor
      objectConfiguration={testProject.customObject.getConfiguration()}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={fakeResourceManagementProps}
      onSizeUpdated={() => {}}
      object={testProject.customObject}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
