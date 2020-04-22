// @flow
import React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentification from './Utils/GDevelopServices/Authentification';
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
import UnsavedChangesContext from './MainFrame/UnsavedChangesContext';

const gd = global.gd;

export const create = (authentification: Authentification) => {
  Window.setUpContextMenu();

  const appArguments = Window.getArguments();
  const isDev = Window.isDev();

  return (
    <Providers
      authentification={authentification}
      disableCheckForUpdates={!!appArguments['disable-update-check']}
      eventsFunctionCodeWriter={makeLocalEventsFunctionCodeWriter()}
      eventsFunctionsExtensionWriter={LocalEventsFunctionsExtensionWriter}
      eventsFunctionsExtensionOpener={LocalEventsFunctionsExtensionOpener}
    >
      {({ i18n, eventsFunctionsExtensionsState }) => (
        <ProjectStorageProviders
          appArguments={appArguments}
          storageProviders={[LocalFileStorageProvider]}
          defaultStorageProvider={LocalFileStorageProvider}
        >
          {({
            currentStorageProviderOperations,
            useStorageProvider,
            storageProviders,
            initialFileMetadataToOpen,
          }) => (
            <UnsavedChangesContext.Consumer>
              {unsavedChanges => (
                <MainFrame
                  i18n={i18n}
                  renderMainMenu={props => <ElectronMainMenu {...props} />}
                  eventsFunctionsExtensionsState={
                    eventsFunctionsExtensionsState
                  }
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
                    />
                  )}
                  renderGDJSDevelopmentWatcher={
                    isDev ? () => <LocalGDJSDevelopmentWatcher /> : null
                  }
                  storageProviders={storageProviders}
                  useStorageProvider={useStorageProvider}
                  storageProviderOperations={currentStorageProviderOperations}
                  resourceSources={localResourceSources}
                  resourceExternalEditors={localResourceExternalEditors}
                  extensionsLoader={makeExtensionsLoader({
                    gd,
                    objectsEditorService: ObjectsEditorService,
                    objectsRenderingService: ObjectsRenderingService,
                    filterExamples: !isDev,
                  })}
                  initialFileMetadataToOpen={initialFileMetadataToOpen}
                  unsavedChanges={unsavedChanges}
                />
              )}
            </UnsavedChangesContext.Consumer>
          )}
        </ProjectStorageProviders>
      )}
    </Providers>
  );
};
