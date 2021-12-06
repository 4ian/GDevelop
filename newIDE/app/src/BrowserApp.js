// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.
import { type ExampleShortHeader } from './Utils/GDevelopServices/Example';

// Import for browser only IDE
import BrowserExamples from './ProjectCreation/BrowserExamples';
import BrowserStarters from './ProjectCreation/BrowserStarters';
import BrowserIntroDialog from './MainFrame/BrowserIntroDialog';
import browserResourceSources from './ResourcesList/BrowserResourceSources';
import browserResourceExternalEditors from './ResourcesList/BrowserResourceExternalEditors';
import BrowserS3PreviewLauncher from './Export/BrowserExporters/BrowserS3PreviewLauncher';
import { getBrowserExporters } from './Export/BrowserExporters';
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
import { type StorageProvider, type FileMetadata } from './ProjectsStorage';

// Import for project creation from example
import { getExample } from './Utils/GDevelopServices/Example';
import { sendNewGameCreated } from './Utils/Analytics/EventSender';
import { showErrorBox } from './UI/Messages/MessageBox';

const onCreateFromExampleShortHeader = (
  isOpeningCallback: boolean => void,
  onOpenCallback: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void
) => async (
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
) => {
  try {
    isOpeningCallback(true);
    const example = await getExample(exampleShortHeader);
    onOpenCallback(UrlStorageProvider, {
      fileIdentifier: example.projectFileUrl,
    });
    sendNewGameCreated(example.projectFileUrl);
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to fetch the example.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'browser-example-load-error',
    });
  } finally {
    isOpeningCallback(false);
  }
};

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
                  {...props}
                  exporters={getBrowserExporters()}
                  allExportersRequireOnline
                />
              )}
              renderCreateDialog={props => (
                <CreateProjectDialog
                  {...props}
                  examplesComponent={BrowserExamples}
                  startersComponent={BrowserStarters}
                  onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
                />
              )}
              introDialog={<BrowserIntroDialog />}
              storageProviders={storageProviders}
              onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
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
