// @flow
import React from 'react';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import Authentification from './Utils/GDevelopServices/Authentification';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.

// Import for Electron powered IDE.
import ExternalEditor from './ExternalEditor';
import LocalExamples from './ProjectCreation/LocalExamples';
import LocalStarters from './ProjectCreation/LocalStarters';
import localResourceSources from './ResourcesList/LocalResourceSources';
import localResourceExternalEditors from './ResourcesList/LocalResourceExternalEditors';
import LocalProjectWriter from './ProjectsStorage/LocalProjectWriter';
import LocalProjectOpener from './ProjectsStorage/LocalProjectOpener';
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
const gd = global.gd;

export const create = (authentification: Authentification) => {
  Window.setUpContextMenu();

  let app = null;
  const appArguments = Window.getArguments();

  if (appArguments['server-port']) {
    app = (
      <Providers
        authentification={authentification}
        disableCheckForUpdates={!!appArguments['disable-update-check']}
        eventsFunctionCodeWriter={null}
        eventsFunctionsExtensionWriter={null}
        eventsFunctionsExtensionOpener={null}
      >
        {({ i18n, eventsFunctionsExtensionsState }) => (
          <ExternalEditor
            serverPort={appArguments['server-port']}
            isIntegrated={appArguments['mode'] === 'integrated'}
            editor={appArguments['editor']}
            editedElementName={appArguments['edited-element-name']}
          >
            <MainFrame
              i18n={i18n}
              eventsFunctionsExtensionsState={eventsFunctionsExtensionsState}
              resourceSources={localResourceSources}
              authentification={authentification}
              onReadFromPathOrURL={() =>
                Promise.reject('Should never be called')
              }
              resourceExternalEditors={localResourceExternalEditors}
              initialPathsOrURLsToOpen={[]}
            />
          </ExternalEditor>
        )}
      </Providers>
    );
  } else {
    app = (
      <Providers
        authentification={authentification}
        disableCheckForUpdates={!!appArguments['disable-update-check']}
        eventsFunctionCodeWriter={makeLocalEventsFunctionCodeWriter()}
        eventsFunctionsExtensionWriter={LocalEventsFunctionsExtensionWriter}
        eventsFunctionsExtensionOpener={LocalEventsFunctionsExtensionOpener}
      >
        {({ i18n, eventsFunctionsExtensionsState }) => (
          <ElectronMainMenu i18n={i18n}>
            <MainFrame
              i18n={i18n}
              eventsFunctionsExtensionsState={eventsFunctionsExtensionsState}
              previewLauncher={<LocalPreviewLauncher />}
              exportDialog={<ExportDialog exporters={getLocalExporters()} />}
              createDialog={
                <CreateProjectDialog
                  examplesComponent={LocalExamples}
                  startersComponent={LocalStarters}
                />
              }
              onSaveProject={LocalProjectWriter.saveProject}
              onSaveAsProject={LocalProjectWriter.saveAsProject}
              onAutoSaveProject={LocalProjectWriter.autoSaveProject}
              onChooseProject={LocalProjectOpener.chooseProjectFile}
              onReadFromPathOrURL={LocalProjectOpener.readProjectFile}
              shouldOpenAutosave={LocalProjectOpener.shouldOpenAutosave}
              resourceSources={localResourceSources}
              resourceExternalEditors={localResourceExternalEditors}
              authentification={authentification}
              extensionsLoader={makeExtensionsLoader({
                gd,
                objectsEditorService: ObjectsEditorService,
                objectsRenderingService: ObjectsRenderingService,
                filterExamples: !Window.isDev(),
              })}
              initialPathsOrURLsToOpen={appArguments['_']}
            />
          </ElectronMainMenu>
        )}
      </Providers>
    );
  }

  return app;
};
