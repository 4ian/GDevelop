// @flow
import React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentication from './Utils/GDevelopServices/Authentication';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.

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
import { onCreateFromExampleShortHeader } from './ProjectCreation/services/LocalCreation';

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
