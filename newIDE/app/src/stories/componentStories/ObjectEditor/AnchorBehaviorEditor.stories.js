// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import AnchorBehaviorEditor from '../../../BehaviorsEditor/Editors/AnchorBehaviorEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'ObjectEditor/AnchorBehaviorEditor',
  component: AnchorBehaviorEditor,
  decorators: [paperDecorator],
};

export const Default = (): React.Node => {
  const spriteObjectWithBehaviors = testProject.spriteObjectWithBehaviors;
  const anchorBehavior = spriteObjectWithBehaviors.getBehavior('Anchor');

  return (
    <SerializedObjectDisplay object={spriteObjectWithBehaviors}>
      <AnchorBehaviorEditor
        project={testProject.project}
        behavior={anchorBehavior}
        object={spriteObjectWithBehaviors}
        onBehaviorUpdated={action('onBehaviorUpdated')}
        resourceManagementProps={fakeResourceManagementProps}
        projectScopedContainersAccessor={
          testProject.testSceneProjectScopedContainersAccessor
        }
      />
    </SerializedObjectDisplay>
  );
};
