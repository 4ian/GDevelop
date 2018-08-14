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
import ElectronEventsBridge from './MainFrame/ElectronEventsBridge';
import LocalJsExtensionsLoader from './JsExtensionsLoader/LocalJsExtensionsLoader';

export const create = (authentification: Authentification) => {
  Window.setUpContextMenu();

  let app = null;
  const appArguments = Window.getArguments();

  if (appArguments['server-port']) {
    app = (
      <ExternalEditor
        serverPort={appArguments['server-port']}
        isIntegrated={appArguments['mode'] === 'integrated'}
        editor={appArguments['editor']}
        editedElementName={appArguments['edited-element-name']}
      >
        <MainFrame
          resourceSources={localResourceSources}
          authentification={authentification}
          onReadFromPathOrURL={() => Promise.reject('Should never be called')}
          resourceExternalEditors={localResourceExternalEditors}
          initialPathsOrURLsToOpen={[]}
        />
      </ExternalEditor>
    );
  } else {
    app = (
      <ElectronEventsBridge>
        <MainFrame
          previewLauncher={<LocalPreviewLauncher />}
          exportDialog={<ExportDialog exporters={getLocalExporters()} />}
          createDialog={
            <CreateProjectDialog
              examplesComponent={LocalExamples}
              startersComponent={LocalStarters}
            />
          }
          onSaveProject={LocalProjectWriter.saveProject}
          onChooseProject={LocalProjectOpener.chooseProjectFile}
          onReadFromPathOrURL={LocalProjectOpener.readProjectJSONFile}
          resourceSources={localResourceSources}
          resourceExternalEditors={localResourceExternalEditors}
          authentification={authentification}
          extensionsLoader={new LocalJsExtensionsLoader()}
          initialPathsOrURLsToOpen={appArguments['_']}
        />
      </ElectronEventsBridge>
    ); 
  }

  return app;
}