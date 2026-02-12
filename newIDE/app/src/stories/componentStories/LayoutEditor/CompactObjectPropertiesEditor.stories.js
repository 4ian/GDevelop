// @flow

import * as React from 'react';
import { action } from '@storybook/addon-actions';
import { I18n } from '@lingui/react';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import paperDecorator from '../../PaperDecorator';
import { CompactObjectPropertiesEditor } from '../../../ObjectEditor/CompactObjectPropertiesEditor';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceManagementProps from '../../FakeResourceManagement';

export default {
  title: 'LayoutEditor/CompactObjectPropertiesEditor',
  component: CompactObjectPropertiesEditor,
  decorators: [paperDecorator],
};

export const Sprite2d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testSpriteObjectInstance}>
          <CompactObjectPropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            isVariableListLocked={false}
            isBehaviorListLocked={false}
            resourceManagementProps={fakeResourceManagementProps}
            onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
            objects={[testProject.spriteObjectWithEffects]}
            onEditObject={action('onEditObject')}
            onObjectsModified={action('onObjectsModified')}
            onEffectAdded={action('onEffectAdded')}
            onOpenEventBasedObjectVariantEditor={action(
              'onOpenEventBasedObjectVariantEditor'
            )}
            onDeleteEventsBasedObjectVariant={action(
              'onDeleteEventsBasedObjectVariant'
            )}
            onWillInstallExtension={action('onWillInstallExtension')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const Cube3d = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayoutInstance2}>
          <CompactObjectPropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            isVariableListLocked={false}
            isBehaviorListLocked={false}
            resourceManagementProps={fakeResourceManagementProps}
            onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
            objects={[testProject.cube3dObject]}
            onEditObject={action('onEditObject')}
            onObjectsModified={action('onObjectsModified')}
            onEffectAdded={action('onEffectAdded')}
            onOpenEventBasedObjectVariantEditor={action(
              'onOpenEventBasedObjectVariantEditor'
            )}
            onDeleteEventsBasedObjectVariant={action(
              'onDeleteEventsBasedObjectVariant'
            )}
            onWillInstallExtension={action('onWillInstallExtension')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const TextInput = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayoutInstance3}>
          <CompactObjectPropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            isVariableListLocked={false}
            isBehaviorListLocked={false}
            resourceManagementProps={fakeResourceManagementProps}
            onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
            objects={[testProject.textInputObject]}
            onEditObject={action('onEditObject')}
            onObjectsModified={action('onObjectsModified')}
            onEffectAdded={action('onEffectAdded')}
            onOpenEventBasedObjectVariantEditor={action(
              'onOpenEventBasedObjectVariantEditor'
            )}
            onDeleteEventsBasedObjectVariant={action(
              'onDeleteEventsBasedObjectVariant'
            )}
            onWillInstallExtension={action('onWillInstallExtension')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);

export const CustomObject = () => (
  <DragAndDropContextProvider>
    <I18n>
      {({ i18n }) => (
        <SerializedObjectDisplay object={testProject.testLayoutInstance3}>
          <CompactObjectPropertiesEditor
            i18n={i18n}
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            objectsContainer={testProject.testLayout.getObjects()}
            globalObjectsContainer={testProject.project.getObjects()}
            layersContainer={testProject.testLayout.getLayers()}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            isVariableListLocked={false}
            isBehaviorListLocked={false}
            resourceManagementProps={fakeResourceManagementProps}
            onUpdateBehaviorsSharedData={action('onUpdateBehaviorsSharedData')}
            objects={[testProject.customObject]}
            onEditObject={action('onEditObject')}
            onObjectsModified={action('onObjectsModified')}
            onEffectAdded={action('onEffectAdded')}
            onOpenEventBasedObjectVariantEditor={action(
              'onOpenEventBasedObjectVariantEditor'
            )}
            onDeleteEventsBasedObjectVariant={action(
              'onDeleteEventsBasedObjectVariant'
            )}
            onWillInstallExtension={action('onWillInstallExtension')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </SerializedObjectDisplay>
      )}
    </I18n>
  </DragAndDropContextProvider>
);
