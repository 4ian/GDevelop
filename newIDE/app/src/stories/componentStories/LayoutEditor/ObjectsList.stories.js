// @flow

import * as React from 'react';
import { I18n } from '@lingui/react';
import { action } from '@storybook/addon-actions';

// Keep first as it creates the `global.gd` object:
import { testProject } from '../../GDevelopJsInitializerDecorator';

import fakeHotReloadPreviewButtonProps from '../../FakeHotReloadPreviewButtonProps';
import paperDecorator from '../../PaperDecorator';
import alertDecorator from '../../AlertDecorator';
import ObjectsList from '../../../ObjectsList';
import DragAndDropContextProvider from '../../../UI/DragAndDrop/DragAndDropContextProvider';
import SerializedObjectDisplay from '../../SerializedObjectDisplay';
import fakeResourceManagementProps from '../../FakeResourceManagement';
import { AssetStoreStateProvider } from '../../../AssetStore/AssetStoreContext';
import { AssetStoreNavigatorStateProvider } from '../../../AssetStore/AssetStoreNavigator';
import { ObjectStoreStateProvider } from '../../../AssetStore/ObjectStoreContext';
import { BundleStoreStateProvider } from '../../../AssetStore/Bundles/BundleStoreContext';
import { PrivateGameTemplateStoreStateProvider } from '../../../AssetStore/PrivateGameTemplates/PrivateGameTemplateStoreContext';
import AuthenticatedUserContext from '../../../Profile/AuthenticatedUserContext';
import { fakeSilverAuthenticatedUser } from '../../../fixtures/GDevelopServicesTestData';

export default {
  title: 'LayoutEditor/ObjectsList',
  component: ObjectsList,
  decorators: [alertDecorator, paperDecorator],
};

// Needed by the NewObjectDialog, opened when clicking the "Add object" button.
const AssetStoreProviders = ({ children }: {| children: React.Node |}) => (
  <AuthenticatedUserContext.Provider value={fakeSilverAuthenticatedUser}>
    <AssetStoreNavigatorStateProvider>
      <AssetStoreStateProvider>
        <BundleStoreStateProvider>
          <PrivateGameTemplateStoreStateProvider>
            <I18n>
              {({ i18n }) => (
                <ObjectStoreStateProvider i18n={i18n}>
                  {children}
                </ObjectStoreStateProvider>
              )}
            </I18n>
          </PrivateGameTemplateStoreStateProvider>
        </BundleStoreStateProvider>
      </AssetStoreStateProvider>
    </AssetStoreNavigatorStateProvider>
  </AuthenticatedUserContext.Provider>
);

export const Default = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <div style={{ height: 400 }}>
        <ObjectsList
          getThumbnail={() => 'res/unknown32.png'}
          project={testProject.project}
          layout={testProject.testLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          resourceManagementProps={fakeResourceManagementProps}
          onEditObject={action('On edit object')}
          onOpenEventBasedObjectEditor={action('On edit children')}
          onOpenEventBasedObjectVariantEditor={action('On edit variant')}
          onExportAssets={action('On export assets')}
          onImportAssets={action('On import assets')}
          onAddObjectInstance={action('On add instance to the scene')}
          onObjectCreated={action('On object created')}
          onObjectEdited={action('On object edited')}
          selectedObjectFolderOrObjectsWithContext={[]}
          getValidatedObjectOrGroupName={newName => newName}
          onDeleteObjects={(objectsWithContext, cb) => cb(true)}
          onRenameObjectFolderOrObjectWithContextFinish={(
            objectWithContext,
            newName,
            cb
          ) => cb(true)}
          onObjectFolderOrObjectWithContextSelected={() => {}}
          onSetAsGlobalObject={action('onSetAsGlobalObject')}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          isListLocked={false}
          onWillInstallExtension={action('extension will be installed')}
          onExtensionInstalled={action('onExtensionInstalled')}
        />
      </div>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);

export const WithSerializedObjectView = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <SerializedObjectDisplay object={testProject.testLayout}>
        <div style={{ height: 250 }}>
          <ObjectsList
            getThumbnail={() => 'res/unknown32.png'}
            project={testProject.project}
            layout={testProject.testLayout}
            eventsFunctionsExtension={null}
            eventsBasedObject={null}
            projectScopedContainersAccessor={
              testProject.testSceneProjectScopedContainersAccessor
            }
            globalObjectsContainer={testProject.project.getObjects()}
            objectsContainer={testProject.testLayout.getObjects()}
            resourceManagementProps={fakeResourceManagementProps}
            onEditObject={action('On edit object')}
            onOpenEventBasedObjectEditor={action('On edit children')}
            onOpenEventBasedObjectVariantEditor={action('On edit variant')}
            onExportAssets={action('On export assets')}
            onImportAssets={action('On import assets')}
            onAddObjectInstance={action('On add instance to the scene')}
            onObjectCreated={action('On object created')}
            onObjectEdited={action('On object edited')}
            selectedObjectFolderOrObjectsWithContext={[]}
            getValidatedObjectOrGroupName={newName => newName}
            onDeleteObjects={(objectsWithContext, cb) => cb(true)}
            onRenameObjectFolderOrObjectWithContextFinish={(
              objectWithContext,
              newName,
              cb
            ) => cb(true)}
            onObjectFolderOrObjectWithContextSelected={() => {}}
            onSetAsGlobalObject={action('onSetAsGlobalObject')}
            hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
            isListLocked={false}
            onWillInstallExtension={action('extension will be installed')}
            onExtensionInstalled={action('onExtensionInstalled')}
          />
        </div>
      </SerializedObjectDisplay>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);

export const Locked = (): React.Node => (
  <AssetStoreProviders>
    <DragAndDropContextProvider>
      <div style={{ height: 400 }}>
        <ObjectsList
          getThumbnail={() => 'res/unknown32.png'}
          project={testProject.project}
          layout={testProject.testLayout}
          eventsFunctionsExtension={null}
          eventsBasedObject={null}
          projectScopedContainersAccessor={
            testProject.testSceneProjectScopedContainersAccessor
          }
          globalObjectsContainer={testProject.project.getObjects()}
          objectsContainer={testProject.testLayout.getObjects()}
          resourceManagementProps={fakeResourceManagementProps}
          onEditObject={action('On edit object')}
          onOpenEventBasedObjectEditor={action('On edit children')}
          onOpenEventBasedObjectVariantEditor={action('On edit variant')}
          onExportAssets={action('On export assets')}
          onImportAssets={action('On import assets')}
          onAddObjectInstance={action('On add instance to the scene')}
          onObjectCreated={action('On object created')}
          onObjectEdited={action('On object edited')}
          selectedObjectFolderOrObjectsWithContext={[]}
          getValidatedObjectOrGroupName={newName => newName}
          onDeleteObjects={(objectsWithContext, cb) => cb(true)}
          onRenameObjectFolderOrObjectWithContextFinish={(
            objectWithContext,
            newName,
            cb
          ) => cb(true)}
          onObjectFolderOrObjectWithContextSelected={() => {}}
          onSetAsGlobalObject={action('onSetAsGlobalObject')}
          hotReloadPreviewButtonProps={fakeHotReloadPreviewButtonProps}
          isListLocked={true}
          onWillInstallExtension={action('extension will be installed')}
          onExtensionInstalled={action('onExtensionInstalled')}
        />
      </div>
    </DragAndDropContextProvider>
  </AssetStoreProviders>
);
