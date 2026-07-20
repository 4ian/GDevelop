// @flow
import * as React from 'react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../GDevelopJsInitializerDecorator';

import ObjectSettingsWorkbench from '../../ObjectSettingsWorkbench';
import FixedHeightFlexContainer from '../FixedHeightFlexContainer';
import DragAndDropContextProvider from '../../UI/DragAndDrop/DragAndDropContextProvider';
import fakeResourceManagementProps from '../FakeResourceManagement';

export default {
  title: 'ObjectEditor/ObjectSettingsWorkbench',
  component: ObjectSettingsWorkbench,
  parameters: {
    layout: 'fullscreen',
  },
};

export const TwoAreaWorkbench = (): React.Node => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={820}>
      <ObjectSettingsWorkbench
        project={testProject.project}
        unsavedChanges={null}
        resourceManagementProps={fakeResourceManagementProps}
        onWillInstallExtension={action('onWillInstallExtension')}
        onExtensionInstalled={action('onExtensionInstalled')}
        onOpenEventBasedObjectEditor={action('onOpenEventBasedObjectEditor')}
        onOpenEventBasedObjectVariantEditor={action(
          'onOpenEventBasedObjectVariantEditor'
        )}
        onDeleteEventsBasedObjectVariant={action(
          'onDeleteEventsBasedObjectVariant'
        )}
        onGlobalObjectEdited={action('onGlobalObjectEdited')}
        onSceneObjectEdited={action('onSceneObjectEdited')}
        onEventsBasedObjectChildrenEdited={action(
          'onEventsBasedObjectChildrenEdited'
        )}
        onObjectListsModified={action('onObjectListsModified')}
        triggerHotReloadInGameEditorIfNeeded={action(
          'triggerHotReloadInGameEditorIfNeeded'
        )}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
