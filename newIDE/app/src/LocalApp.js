// @flow
import React from 'react';
import { t } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.
import { type ExampleShortHeader } from './Utils/GDevelopServices/Example';
import optionalRequire from './Utils/OptionalRequire.js';

// Import for Electron powered IDE.
import LocalExamples from './ProjectCreation/LocalExamples';
import LocalStarters from './ProjectCreation/LocalStarters';
import localResourceSources from './ResourcesList/LocalResourceSources';
import localResourceExternalEditors from './ResourcesList/LocalResourceExternalEditors';
import LocalPreviewLauncher from './Export/LocalExporters/LocalPreviewLauncher';
import { getLocalExporters } from './Export/LocalExporters';
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
import { LocalResourceFetcher } from './ProjectsStorage/ResourceFetcher/LocalResourceFetcher';
import { type StorageProvider, type FileMetadata } from './ProjectsStorage';

// Import for project creation from example
import { getExample } from './Utils/GDevelopServices/Example';
import { sendNewGameCreated } from './Utils/Analytics/EventSender';
import { showErrorBox } from './UI/Messages/MessageBox';
import { writeAndCheckFile } from './ProjectsStorage/LocalFileStorageProvider/LocalProjectWriter';
import axios from 'axios';
const path = optionalRequire('path');

var fs = optionalRequire('fs-extra');

const onCreateFromExampleShortHeader = (
  isOpeningCallback: boolean => void,
  onOpenCallback: (
    storageProvider: StorageProvider,
    fileMetadata: FileMetadata
  ) => void,
) => async (
  i18n: I18nType,
  exampleShortHeader: ExampleShortHeader,
  outputPath?: string
) => {
  if (!fs || !outputPath) return;
  try {
    isOpeningCallback(true);
    const example = await getExample(exampleShortHeader);

    // Prepare the folder for the example.
    fs.mkdirsSync(outputPath);

    // Download the project file and save it.
    const response = await axios.get(example.projectFileUrl, {
      responseType: 'text',
      // Required to properly get the response as text, and not as JSON:
      transformResponse: [data => data],
    });
    const projectFileContent = response.data;
    const localFilePath = path.join(outputPath, 'game.json');

    await writeAndCheckFile(projectFileContent, localFilePath);

    // Open the project file. Note that resources that are URLs will be downloaded
    // thanks to the LocalResourceFetcher.
    onOpenCallback(LocalFileStorageProvider, {
      fileIdentifier: localFilePath,
    });

    sendNewGameCreated(example.projectFileUrl);
  } catch (error) {
    showErrorBox({
      message:
        i18n._(t`Unable to load the example or save it on disk.`) +
        ' ' +
        i18n._(t`Verify your internet connection or try again later.`),
      rawError: error,
      errorId: 'local-example-load-error',
    });
  } finally {
    isOpeningCallback(false);
  }
};

const gd: libGDevelop = global.gd;

export const create = (authentication: Authentication) => {
  Window.setUpContextMenu();

  const appArguments = Window.getArguments();
  const isDev = Window.isDev();

  return (
    <Providers
      authentication={authentication}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
      makeEventsFunctionCodeWriter={makeLocalEventsFunctionCodeWriter}
      eventsFunctionsExtensionWriter={LocalEventsFunctionsExtensionWriter}
      eventsFunctionsExtensionOpener={LocalEventsFunctionsExtensionOpener}
      resourceFetcher={LocalResourceFetcher}
    >
      {({ i18n }) => (
        <ProjectStorageProviders
          appArguments={appArguments}
          storageProviders={
            // Add Url provider
            [LocalFileStorageProvider]
          }
          defaultStorageProvider={LocalFileStorageProvider}
        >
          {({
            getStorageProviderOperations,
            storageProviders,
            initialFileMetadataToOpen,
            getStorageProvider,
          }) => (
            <MainFrame
              i18n={i18n}
              renderMainMenu={props => <ElectronMainMenu {...props} />}
              renderPreviewLauncher={(props, ref) => (
                <LocalPreviewLauncher {...props} ref={ref} />
              )}
              renderExportDialog={props => (
                <ExportDialog {...props} exporters={getLocalExporters()} />
              )}
              renderCreateDialog={props => (
                <CreateProjectDialog
                  {...props}
                  examplesComponent={LocalExamples}
                  startersComponent={LocalStarters}
                  onCreateFromExampleShortHeader={
                    onCreateFromExampleShortHeader
                  }
                />
              )}
              renderGDJSDevelopmentWatcher={
                isDev ? () => <LocalGDJSDevelopmentWatcher /> : null
              }
              onCreateFromExampleShortHeader={onCreateFromExampleShortHeader}
              storageProviders={storageProviders}
              getStorageProviderOperations={getStorageProviderOperations}
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
