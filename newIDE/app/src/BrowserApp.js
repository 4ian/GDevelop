// @flow
import * as React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ShareDialog from './ExportAndShare/ShareDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/icomoon-font.css'; // Styles for Icomoon font.

// Import for browser only IDE
import browserResourceSources from './ResourcesList/BrowserResourceSources';
import browserResourceExternalEditors from './ResourcesList/BrowserResourceExternalEditors';
import BrowserSWPreviewLauncher from './ExportAndShare/BrowserExporters/BrowserSWPreviewLauncher';
import BrowserS3PreviewLauncher from './ExportAndShare/BrowserExporters/BrowserS3PreviewLauncher';
import {
  browserAutomatedExporters,
  browserManualExporters,
  browserOnlineWebExporter,
} from './ExportAndShare/BrowserExporters';
import makeExtensionsLoader from './JsExtensionsLoader/BrowserJsExtensionsLoader';
import ObjectsEditorService from './ObjectEditor/ObjectsEditorService';
import ObjectsRenderingService from './ObjectsRendering/ObjectsRenderingService';
import { makeBrowserSWEventsFunctionCodeWriter } from './EventsFunctionsExtensionsLoader/CodeWriters/BrowserSWEventsFunctionCodeWriter';
import { makeBrowserS3EventsFunctionCodeWriter } from './EventsFunctionsExtensionsLoader/CodeWriters/BrowserS3EventsFunctionCodeWriter';
import Providers from './MainFrame/Providers';
import ProjectStorageProviders from './ProjectsStorage/ProjectStorageProviders';
import UrlStorageProvider from './ProjectsStorage/UrlStorageProvider';
import DownloadFileStorageProvider from './ProjectsStorage/DownloadFileStorageProvider';
import CloudStorageProvider from './ProjectsStorage/CloudStorageProvider';
import BrowserResourceMover from './ProjectsStorage/ResourceMover/BrowserResourceMover';
import BrowserResourceFetcher from './ProjectsStorage/ResourceFetcher/BrowserResourceFetcher';
import BrowserEventsFunctionsExtensionOpener from './EventsFunctionsExtensionsLoader/Storage/BrowserEventsFunctionsExtensionOpener';
import BrowserEventsFunctionsExtensionWriter from './EventsFunctionsExtensionsLoader/Storage/BrowserEventsFunctionsExtensionWriter';
import BrowserLoginProvider from './LoginProvider/BrowserLoginProvider';
import { isServiceWorkerSupported } from './ServiceWorkerSetup';
import { ensureBrowserSWPreviewSession } from './ExportAndShare/BrowserExporters/BrowserSWPreviewLauncher/BrowserSWPreviewIndexedDB';

export const create = (authentication: Authentication) => {
  Window.setUpContextMenu();
  const loginProvider = new BrowserLoginProvider(authentication.auth);
  authentication.setLoginProvider(loginProvider);

  let app = null;
  const appArguments = Window.getArguments();

  // TODO: make a hook that allows this to change, so we can switch to S3
  // (and log this into Posthog).
  const canUseBrowserSW = isServiceWorkerSupported();
  if (canUseBrowserSW) ensureBrowserSWPreviewSession();

  app = (
    <Providers
      authentication={authentication}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
      makeEventsFunctionCodeWriter={
        canUseBrowserSW
          ? makeBrowserSWEventsFunctionCodeWriter
          : makeBrowserS3EventsFunctionCodeWriter
      }
      eventsFunctionsExtensionWriter={BrowserEventsFunctionsExtensionWriter}
      eventsFunctionsExtensionOpener={BrowserEventsFunctionsExtensionOpener}
    >
      {({ i18n }) => (
        <ProjectStorageProviders
          appArguments={appArguments}
          storageProviders={[
            UrlStorageProvider,
            CloudStorageProvider,
            DownloadFileStorageProvider,
          ]}
          defaultStorageProvider={UrlStorageProvider}
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
              renderPreviewLauncher={(props, ref) =>
                canUseBrowserSW ? (
                  <BrowserSWPreviewLauncher {...props} ref={ref} />
                ) : (
                  <BrowserS3PreviewLauncher {...props} ref={ref} />
                )
              }
              renderShareDialog={props => (
                <ShareDialog
                  project={props.project}
                  onSaveProject={props.onSaveProject}
                  isSavingProject={props.isSavingProject}
                  onChangeSubscription={props.onChangeSubscription}
                  onClose={props.onClose}
                  automatedExporters={browserAutomatedExporters}
                  manualExporters={browserManualExporters}
                  onlineWebExporter={browserOnlineWebExporter}
                  allExportersRequireOnline
                  fileMetadata={props.fileMetadata}
                  storageProvider={props.storageProvider}
                  initialTab={props.initialTab}
                  gamesList={props.gamesList}
                />
              )}
              quickPublishOnlineWebExporter={browserOnlineWebExporter}
              storageProviders={storageProviders}
              resourceMover={BrowserResourceMover}
              resourceFetcher={BrowserResourceFetcher}
              getStorageProviderOperations={getStorageProviderOperations}
              getStorageProviderResourceOperations={
                getStorageProviderResourceOperations
              }
              getStorageProvider={getStorageProvider}
              resourceSources={browserResourceSources}
              resourceExternalEditors={browserResourceExternalEditors}
              extensionsLoader={makeExtensionsLoader({
                objectsEditorService: ObjectsEditorService,
                objectsRenderingService: ObjectsRenderingService,
                filterExamples: !Window.isDev(),
              })}
              initialFileMetadataToOpen={initialFileMetadataToOpen}
              initialExampleSlugToOpen={
                appArguments['create-from-example'] || null
              }
            />
          )}
        </ProjectStorageProviders>
      )}
    </Providers>
  );

  return app;
};
