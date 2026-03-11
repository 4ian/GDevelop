// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import { CompactScenePropertiesEditor } from '../../../SceneEditor/CompactScenePropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/CompactScenePropertiesEditor',
  component: CompactScenePropertiesEditor,
  decorators: [paperDecorator],
};

export const Sprite2d = (): React.Node => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testSpriteObjectInstance}>
          <CompactScenePropertiesEditor
            scene={testProject.testLayout}
            resourceManagementProps={fakeResourceManagementProps}
            project={testProject.project}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            i18n={i18n}
            onBackgroundColorChanged={action('onBackgroundColorChanged')}
            onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
            onEditSceneVariables={action('onEditSceneVariables')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);
