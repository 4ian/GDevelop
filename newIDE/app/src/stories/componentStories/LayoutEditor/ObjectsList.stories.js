// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import ObjectsList from '../../../ObjectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/ObjectsList',
  component: ObjectsList,
  decorators: [alertDecorator, paperDecorator, muiDecorator],
};

export const Default = () => (
  <DragAndDropContextProvider>
    <div style={{ height: 400 }}>
      <ObjectsList
        getThumbnail={() => 'res/unknown32.png'}
        project={testProject.project}
        objectsContainer={testProject.testLayout}
        layout={testProject.testLayout}
        resourceManagementProps={fakeResourceManagementProps}
        onEditObject={action('On edit object')}
        onExportObject={action('On export object')}
        onAddObjectInstance={action('On add instance to the scene')}
        onObjectCreated={action('On object created')}
        selectedObjectFolderOrObjectsWithContext={[]}
        getValidatedObjectOrGroupName={newName => newName}
        onDeleteObject={(objectWithContext, cb) => cb(true)}
        onRenameObjectFolderOrObjectWithContextFinish={(
          objectWithContext,
          newName,
          cb
        ) => cb(true)}
        onObjectFolderOrObjectWithContextSelected={() => {}}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        canInstallPrivateAsset={() => false}
      />
    </div>
  </DragAndDropContextProvider>
);

export const WithSerializedObjectView = () => (
  <DragAndDropContextProvider>
    <SerializedObjectDisplay object={testProject.testLayout}>
      <div style={{ height: 250 }}>
        <ObjectsList
          getThumbnail={() => 'res/unknown32.png'}
          project={testProject.project}
          objectsContainer={testProject.testLayout}
          layout={testProject.testLayout}
          resourceManagementProps={fakeResourceManagementProps}
          onEditObject={action('On edit object')}
          onExportObject={action('On export object')}
          onAddObjectInstance={action('On add instance to the scene')}
          onObjectCreated={action('On object created')}
          selectedObjectFolderOrObjectsWithContext={[]}
          getValidatedObjectOrGroupName={newName => newName}
          onDeleteObject={(objectWithContext, cb) => cb(true)}
          onRenameObjectFolderOrObjectWithContextFinish={(
            objectWithContext,
            newName,
            cb
          ) => cb(true)}
          onObjectFolderOrObjectWithContextSelected={() => {}}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          canInstallPrivateAsset={() => false}
        />
      </div>
    </SerializedObjectDisplay>
  </DragAndDropContextProvider>
);
