// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import InstancePropertiesEditor from '../../../InstancesEditor/InstancePropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'LayoutEditor/InstancePropertiesEditor',
  component: InstancePropertiesEditor,
  decorators: [paperDecorator],
};

export const Instance2d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayout}>
          <InstancePropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            instances={[testProject.testSpriteObjectInstance]}
            editInstanceVariables={action('edit instance variables')}
            onGetInstanceSize={() => [100, 101, 102]}
            onEditObjectByName={action('edit object')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const Instance3d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayout}>
          <InstancePropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            instances={[testProject.testLayoutInstance2]}
            editInstanceVariables={action('edit instance variables')}
            onGetInstanceSize={() => [100, 101, 102]}
            onEditObjectByName={action('edit object')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);
