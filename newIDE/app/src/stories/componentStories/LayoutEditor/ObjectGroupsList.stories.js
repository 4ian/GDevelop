// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import ObjectGroupsList from '../../../ObjectGroupsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';

export default {
  title: 'LayoutEditor/ObjectGroupsList',
  component: ObjectGroupsList,
  decorators: [alertDecorator, paperDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <SerializedObjectDisplay object={testProject.testLayout}>
      <div style={{ height: 250 }}>
        <ObjectGroupsList
          globalObjectGroups={testProject.project.getObjectGroups()}
          objectGroups={testProject.testLayout.getObjectGroups()}
          onEditGroup={action('onEditGroup')}
          onRenameGroup={action('onRenameGroup')}
          onDeleteGroup={action('onDeleteGroup')}
          getValidatedObjectOrGroupName={newName => newName}
        />
      </div>
    </SerializedObjectDisplay>
  </DragAndDropContextProvider>
);
