// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import { CompactInstancePropertiesEditor } from '../../../InstancesEditor/CompactInstancePropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';

export default {
  title: 'LayoutEditor/CompactInstancePropertiesEditor',
  component: CompactInstancePropertiesEditor,
  decorators: [paperDecorator],
};

export const InstanceSprite2d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testSpriteObjectInstance}>
          <CompactInstancePropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            instances={[testProject.testSpriteObjectInstance]}
            editInstanceVariables={action('edit instance variables')}
            onGetInstanceSize={() => [100, 101, 102]}
            editObjectInPropertiesPanel={action('edit object')}
            tileMapTileSelection={null}
            onSelectTileMapTile={() => {}}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const InstanceCube3d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayoutInstance2}>
          <CompactInstancePropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            instances={[testProject.testLayoutInstance2]}
            editInstanceVariables={action('edit instance variables')}
            onGetInstanceSize={() => [100, 101, 102]}
            editObjectInPropertiesPanel={action('edit object')}
            tileMapTileSelection={null}
            onSelectTileMapTile={() => {}}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const InstanceTextInput = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayoutInstance3}>
          <CompactInstancePropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            instances={[testProject.testLayoutInstance3]}
            editInstanceVariables={action('edit instance variables')}
            onGetInstanceSize={() => [120, 40, 0]}
            editObjectInPropertiesPanel={action('edit object')}
            tileMapTileSelection={null}
            onSelectTileMapTile={() => {}}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);
