// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import ObjectsList from '../../../ObjectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/ObjectsList',
  component: ObjectsList,
  decorators: [paperDecorator, muiDecorator],
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
        selectedObjectNames={[]}
        selectedObjectTags={[]}
        onChangeSelectedObjectTags={selectedObjectTags => {}}
        getAllObjectTags={() => []}
        getValidatedObjectOrGroupName={newName => newName}
        onDeleteObject={(objectWithContext, cb) => cb(true)}
        onRenameObjectFinish={(objectWithContext, newName, cb) => cb(true)}
        onObjectSelected={() => {}}
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
          selectedObjectNames={[]}
          selectedObjectTags={[]}
          onChangeSelectedObjectTags={selectedObjectTags => {}}
          getAllObjectTags={() => []}
          getValidatedObjectOrGroupName={newName => newName}
          onDeleteObject={(objectWithContext, cb) => cb(true)}
          onRenameObjectFinish={(objectWithContext, newName, cb) => cb(true)}
          onObjectSelected={() => {}}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          canInstallPrivateAsset={() => false}
        />
      </div>
    </SerializedObjectDisplay>
  </DragAndDropContextProvider>
);

export const WithTags = () => (
  <DragAndDropContextProvider>
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
        selectedObjectNames={[]}
        selectedObjectTags={['Tag1', 'Tag2']}
        onChangeSelectedObjectTags={action('on change selected object tags')}
        getAllObjectTags={() => [
          'Tag1',
          'Tag2',
          'Looooooooooong Tag 3',
          'Unselected Tag 4',
        ]}
        getValidatedObjectOrGroupName={newName => newName}
        onDeleteObject={(objectWithContext, cb) => cb(true)}
        onRenameObjectFinish={(objectWithContext, newName, cb) => cb(true)}
        onObjectSelected={() => {}}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        canInstallPrivateAsset={() => false}
      />
    </div>
  </DragAndDropContextProvider>
);
