// @flow
import * as React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/icomoon-font.css'; // Styles for Icomoon font.

// Import for browser only IDE
import browserResourceSources from './ResourcesList/BrowserResourceSources';
import browserResourceExternalEditors from './ResourcesList/BrowserResourceExternalEditors';
import BrowserS3PreviewLauncher from './Export/BrowserExporters/BrowserS3PreviewLauncher';
import {
  browserAutomatedExporters,
  browserManualExporters,
  browserOnlineWebExporter,
} from './Export/BrowserExporters';
import makeExtensionsLoader from './JsExtensionsLoader/BrowserJsExtensionsLoader';
import ObjectsEditorService from './ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from './ObjectsRendering/ObjectsRenderingService';
import { makeBrowserS3EventsFunctionCodeWriter } from './EventsFunctionsExtensionsLoader/CodeWriters/BrowserS3EventsFunctionCodeWriter';
import Providers from './MainFrame/Providers';
import ProjectStorageProviders from './ProjectsStorage/ProjectStorageProviders';
import UrlStorageProvider from './ProjectsStorage/UrlStorageProvider';
import GoogleDriveStorageProvider from './ProjectsStorage/GoogleDriveStorageProvider';
import DownloadFileStorageProvider from './ProjectsStorage/DownloadFileStorageProvider';
import DropboxStorageProvider from './ProjectsStorage/DropboxStorageProvider';
import OneDriveStorageProvider from './ProjectsStorage/OneDriveStorageProvider';
import { BrowserResourceFetcher } from './ProjectsStorage/ResourceFetcher/BrowserResourceFetcher';
import {
  onCreateFromExampleShortHeader,
  onCreateBlank,
} from './ProjectCreation/services/BrowserCreation';

export const create = (authentication: Authentication) => {
  Window.setUpContextMenu();

  let app = null;
  const appArguments = Window.getArguments();

  app = (
    <Providers
      authentication={authentication}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
      makeEventsFunctionCodeWriter={makeBrowserS3EventsFunctionCodeWriter}
      eventsFunctionsExtensionWriter={null}
      eventsFunctionsExtensionOpener={null}
      resourceFetcher={BrowserResourceFetcher}
    >
      {({ i18n }) => (
        <ProjectStorageProviders
          appArguments={appArguments}
          storageProviders={[
            UrlStorageProvider,
            GoogleDriveStorageProvider,
            DropboxStorageProvider,
            OneDriveStorageProvider,
            DownloadFileStorageProvider,
          ]}
          defaultStorageProvider={UrlStorageProvider}
        >
          {({
            getStorageProviderOperations,
            storageProviders,
            initialFileMetadataToOpen,
            getStorageProvider,
          }) => (
            <MainFrame
              i18n={i18n}
              renderPreviewLauncher={(props, ref) => (
                <BrowserS3PreviewLauncher {...props} ref={ref} />
              )}
              renderExportDialog={props => (
                <ExportDialog
                  project={props.project}
                  onSaveProject={props.onSaveProject}
                  onChangeSubscription={props.onChangeSubscription}
                  onClose={props.onClose}
                  automatedExporters={browserAutomatedExporters}
                  manualExporters={browserManualExporters}
                  onlineWebExporter={browserOnlineWebExporter}
                  allExportersRequireOnline
                />
              )}
              renderCreateDialog={props => (
                <CreateProjectDialog
                  open={props.open}
                  onClose={props.onClose}
                  onOpen={props.onOpen}
                  onCreateBlank={onCreateBlank}
                  onCreateFromExampleShortHeader={
                    onCreateFromExampleShortHeader
                  }
                />
              )}
              storageProviders={storageProviders}
              onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
              onCreateBlank={onCreateBlank}
              getStorageProviderOperations={getStorageProviderOperations}
              getStorageProvider={getStorageProvider}
              resourceSources={browserResourceSources}
              resourceExternalEditors={browserResourceExternalEditors}
              extensionsLoader={makeExtensionsLoader({
                objectsEditorService: ObjectsEditorService,
                objectsRenderingService: ObjectsRenderingService,
                filterExamples: !Window.isDev(),
              })}
              initialFileMetadataToOpen={initialFileMetadataToOpen}
            />
          )}
        </ProjectStorageProviders>
      )}
    </Providers>
  );

  return app;
};
