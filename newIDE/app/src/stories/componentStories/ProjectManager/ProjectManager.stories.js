// @flow
import * as React from 'react';
import paperDecorator from '../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import ProjectManager from '../../../ProjectManager';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import FixedHeightFlexContainer from '../../FixedHeightFlexContainer';

export default {
  title: 'Project Creation/ProjectManager',
  component: ProjectManager,
  decorators: [paperDecorator, GDevelopJsInitializerDecorator],
};
export const Default = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={500}>
      <ProjectManager
        project={testProject.project}
        onSaveProjectProperties={async () => true}
        onChangeProjectName={action('onChangeProjectName')}
        onOpenExternalEvents={action('onOpenExternalEvents')}
        onOpenLayout={action('onOpenLayout')}
        onOpenExternalLayout={action('onOpenExternalLayout')}
        onOpenEventsFunctionsExtension={action(
          'onOpenEventsFunctionsExtension'
        )}
        onInstallExtension={action('onInstallExtension')}
        onDeleteLayout={action('onDeleteLayout')}
        onDeleteExternalLayout={action('onDeleteExternalLayout')}
        onDeleteEventsFunctionsExtension={action(
          'onDeleteEventsFunctionsExtension'
        )}
        onDeleteExternalEvents={action('onDeleteExternalEvents')}
        onRenameLayout={action('onRenameLayout')}
        onRenameExternalLayout={action('onRenameExternalLayout')}
        onRenameEventsFunctionsExtension={action(
          'onRenameEventsFunctionsExtension'
        )}
        onRenameExternalEvents={action('onRenameExternalEvents')}
        onOpenResources={action('onOpenResources')}
        onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
        eventsFunctionsExtensionsError={null}
        onReloadEventsFunctionsExtensions={action(
          'onReloadEventsFunctionsExtensions'
        )}
        onShareProject={action('onShareProject')}
        freezeUpdate={false}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        resourceManagementProps={fakeResourceManagementProps}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);

export const ErrorsInFunctions = () => (
  <DragAndDropContextProvider>
    <FixedHeightFlexContainer height={500}>
      <ProjectManager
        project={testProject.project}
        onSaveProjectProperties={async () => true}
        onChangeProjectName={action('onChangeProjectName')}
        onOpenExternalEvents={action('onOpenExternalEvents')}
        onOpenLayout={action('onOpenLayout')}
        onOpenExternalLayout={action('onOpenExternalLayout')}
        onOpenEventsFunctionsExtension={action(
          'onOpenEventsFunctionsExtension'
        )}
        onInstallExtension={action('onInstallExtension')}
        onDeleteLayout={action('onDeleteLayout')}
        onDeleteExternalLayout={action('onDeleteExternalLayout')}
        onDeleteEventsFunctionsExtension={action(
          'onDeleteEventsFunctionsExtension'
        )}
        onDeleteExternalEvents={action('onDeleteExternalEvents')}
        onRenameLayout={action('onRenameLayout')}
        onRenameExternalLayout={action('onRenameExternalLayout')}
        onRenameEventsFunctionsExtension={action(
          'onRenameEventsFunctionsExtension'
        )}
        onRenameExternalEvents={action('onRenameExternalEvents')}
        onOpenResources={action('onOpenResources')}
        onOpenPlatformSpecificAssets={action('onOpenPlatformSpecificAssets')}
        eventsFunctionsExtensionsError={
          new Error('Fake error during code generation')
        }
        onReloadEventsFunctionsExtensions={action(
          'onReloadEventsFunctionsExtensions'
        )}
        onShareProject={action('onShareProject')}
        freezeUpdate={false}
        hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
        resourceManagementProps={fakeResourceManagementProps}
      />
    </FixedHeightFlexContainer>
  </DragAndDropContextProvider>
);
