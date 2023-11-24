// @flow
import * as React from 'react';
import muiDecorator from '../../ThemeDecorator';
import paperDecorator from '../../PaperDecorator';
import { action } from '@storybook/addon-actions';
import ProjectManager from '../../../ProjectManager';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import GDevelopJsInitializerDecorator, {
  testProject,
} from '../../GDevelopJsInitializerDecorator';
import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';

export default {
  title: 'Project Creation/ProjectManager',
  component: ProjectManager,
  decorators: [paperDecorator, muiDecorator, GDevelopJsInitializerDecorator],
};
export const Default = () => (
  <ProjectManager
    project={testProject.project}
    onSaveProjectProperties={async () => true}
    onChangeProjectName={action('onChangeProjectName')}
    onOpenExternalEvents={action('onOpenExternalEvents')}
    onOpenLayout={action('onOpenLayout')}
    onOpenExternalLayout={action('onOpenExternalLayout')}
    onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
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
    freezeUpdate={false}
    hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
    resourceManagementProps={fakeResourceManagementProps}
  />
);

export const ErrorsInFunctions = () => (
  <ProjectManager
    project={testProject.project}
    onSaveProjectProperties={async () => true}
    onChangeProjectName={action('onChangeProjectName')}
    onOpenExternalEvents={action('onOpenExternalEvents')}
    onOpenLayout={action('onOpenLayout')}
    onOpenExternalLayout={action('onOpenExternalLayout')}
    onOpenEventsFunctionsExtension={action('onOpenEventsFunctionsExtension')}
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
    freezeUpdate={false}
    hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
    resourceManagementProps={fakeResourceManagementProps}
  />
);
