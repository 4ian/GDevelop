// @flow

import * as React from 'react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import PanelSpriteEditor from '../../../ObjectEditor/Editors/PanelSpriteEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/PanelSpriteEditor',
  component: PanelSpriteEditor,
  decorators: [paperDecorator],
};

export const Default = () => (
  <SerializedObjectDisplay
    object={testProject.panelSpriteObject.getConfiguration()}
  >
    <PanelSpriteEditor
      objectConfiguration={testProject.panelSpriteObject.getConfiguration()}
      project={testProject.project}
      layout={testProject.testLayout}
      resourceManagementProps={fakeResourceManagementProps}
      onSizeUpdated={() => {}}
      object={testProject.panelSpriteObject}
      objectName="FakeObjectName"
    />
  </SerializedObjectDisplay>
);
