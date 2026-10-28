// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import Cube3DEditor from '../../../ObjectEditor/Editors/Cube3DEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { getRealCube3dObject } from '../../RealCube3dObject';

export default {
  title: 'ObjectEditor/Cube3DEditor',
  component: Cube3DEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
  const cube3dObject = getRealCube3dObject();
  return (
    <SerializedObjectDisplay object={cube3dObject}>
      <Cube3DEditor
        objectConfiguration={cube3dObject.getConfiguration()}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
        project={testProject.project}
        layout={testProject.testLayout}
        eventsFunctionsExtension={null}
        eventsBasedObject={null}
        resourceManagementProps={fakeResourceManagementProps}
        onSizeUpdated={() => {}}
        object={cube3dObject}
        objectName={cube3dObject.getName()}
      />
    </SerializedObjectDisplay>
  );
};
