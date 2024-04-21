// @flow
import React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ShareDialog from './ExportAndShare/ShareDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/icomoon-font.css'; // Styles for Icomoon font.

// Import for Electron powered IDE.
import localResourceSources from './ResourcesList/LocalResourceSources';
import localResourceExternalEditors from './ResourcesList/LocalResourceExternalEditors';
import LocalPreviewLauncher from './ExportAndShare/LocalExporters/LocalPreviewLauncher';
import {
  localAutomatedExporters,
  localManualExporters,
  localOnlineWebExporter,
} from './ExportAndShare/LocalExporters';
import ElectronMainMenu from './MainFrame/ElectronMainMenu';
import makeExtensionsLoader from './JsExtensionsLoader/LocalJsExtensionsLoader';
import { makeLocalEventsFunctionCodeWriter } from './EventsFunctionsExtensionsLoader/CodeWriters/LocalEventsFunctionCodeWriter';
import ObjectsEditorService from './ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from './ObjectsRendering/ObjectsRenderingService';
import Providers from './MainFrame/Providers';
import LocalEventsFunctionsExtensionWriter from './EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionWriter';
import LocalEventsFunctionsExtensionOpener from './EventsFunctionsExtensionsLoader/Storage/LocalEventsFunctionsExtensionOpener';
import ProjectStorageProviders from './ProjectsStorage/ProjectStorageProviders';
import LocalFileStorageProvider from './ProjectsStorage/LocalFileStorageProvider';
import { LocalGDJSDevelopmentWatcher } from './GameEngineFinder/LocalGDJSDevelopmentWatcher';
import CloudStorageProvider from './ProjectsStorage/CloudStorageProvider';
import UrlStorageProvider from './ProjectsStorage/UrlStorageProvider';
import LocalResourceMover from './ProjectsStorage/ResourceMover/LocalResourceMover';
import LocalResourceFetcher from './ProjectsStorage/ResourceFetcher/LocalResourceFetcher';
import LocalLoginProvider from './LoginProvider/LocalLoginProvider';

const gd: libGDevelop = global.gd;

export const create = (authentication: Authentication) => {
  Window.setUpContextMenu();
  const loginProvider = new LocalLoginProvider(authentication.auth);
  authentication.setLoginProvider(loginProvider);

  const appArguments = Window.getArguments();
  const isDev = Window.isDev();

  return (
    <Providers
      authentication={authentication}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
      makeEventsFunctionCodeWriter={makeLocalEventsFunctionCodeWriter}
      eventsFunctionsExtensionWriter={LocalEventsFunctionsExtensionWriter}
      eventsFunctionsExtensionOpener={LocalEventsFunctionsExtensionOpener}
    >
      {({ i18n }) => (
        <ProjectStorageProviders
          appArguments={appArguments}
          storageProviders={[
            LocalFileStorageProvider,
            UrlStorageProvider,
            CloudStorageProvider,
          ]}
          defaultStorageProvider={LocalFileStorageProvider}
        >
          {({
            getStorageProviderOperations,
            getStorageProviderResourceOperations,
            storageProviders,
            initialFileMetadataToOpen,
            getStorageProvider,
          }) => (
            <MainFrame
              i18n={i18n}
              renderMainMenu={(props, callbacks, extraCallbacks) => (
                <ElectronMainMenu
                  props={props}
                  callbacks={callbacks}
                  extraCallbacks={extraCallbacks}
                />
              )}
              renderPreviewLauncher={(props, ref) => (
                <LocalPreviewLauncher {...props} ref={ref} />
              )}
              renderShareDialog={props => (
                <ShareDialog
                  project={props.project}
                  onSaveProject={props.onSaveProject}
                  isSavingProject={props.isSavingProject}
                  onChangeSubscription={props.onChangeSubscription}
                  onClose={props.onClose}
                  automatedExporters={localAutomatedExporters}
                  manualExporters={localManualExporters}
                  onlineWebExporter={localOnlineWebExporter}
                  fileMetadata={props.fileMetadata}
                  storageProvider={props.storageProvider}
                  initialTab={props.initialTab}
                />
              )}
              renderGDJSDevelopmentWatcher={
                isDev ? () => <LocalGDJSDevelopmentWatcher /> : null
              }
              storageProviders={storageProviders}
              resourceMover={LocalResourceMover}
              resourceFetcher={LocalResourceFetcher}
              getStorageProviderOperations={getStorageProviderOperations}
              getStorageProviderResourceOperations={
                getStorageProviderResourceOperations
              }
              getStorageProvider={getStorageProvider}
              resourceSources={localResourceSources}
              resourceExternalEditors={localResourceExternalEditors}
              extensionsLoader={makeExtensionsLoader({
                gd,
                objectsEditorService: ObjectsEditorService,
                objectsRenderingService: ObjectsRenderingService,
                filterExamples: !isDev,
              })}
              initialFileMetadataToOpen={initialFileMetadataToOpen}
            />
          )}
        </ProjectStorageProviders>
      )}
    </Providers>
  );
};
