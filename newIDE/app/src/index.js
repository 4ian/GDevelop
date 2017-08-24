import 'element-closest';
import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import BetaIntroDialog from './MainFrame/BetaIntroDialog';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import { sendProgramOpening } from './Utils/Analytics/EventSender';
import injectTapEventPlugin from 'react-tap-event-plugin';
import registerServiceWorker from './registerServiceWorker';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table

// Import for browser only IDE
import BrowserS3PreviewLauncher from './Export/BrowserS3PreviewLauncher';
import BrowserCreateDialog from './ProjectCreation/BrowserCreateDialog';
import BrowserProjectOpener from './ProjectsStorage/BrowserProjectOpener';

// Import for Electron powered IDE.
import ExternalEditor from './ExternalEditor';
import optionalRequire from './Utils/OptionalRequire.js';
import LocalPreviewLauncher from './Export/LocalPreviewLauncher';
import LocalExport from './Export/LocalExport';
import LocalS3Export from './Export/LocalS3Export';
import LocalMobileExport from './Export/LocalMobileExport';
import LocalCreateDialog from './ProjectCreation/LocalCreateDialog';
import localResourceSources from './ResourcesEditor/LocalResourceSources';
import LocalProjectWriter from './ProjectsStorage/LocalProjectWriter';
import LocalProjectOpener from './ProjectsStorage/LocalProjectOpener';
import ElectronEventsBridge from './MainFrame/ElectronEventsBridge';
const electron = optionalRequire('electron');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

Window.setUpContextMenu();

let app = null;

if (electron) {
  const appArguments = Window.getArguments();
  if (appArguments['server-port']) {
    app = (
      <ExternalEditor
        serverPort={appArguments['server-port']}
        isIntegrated={appArguments['mode'] === 'integrated'}
        editor={appArguments['editor']}
        editedElementName={appArguments['edited-element-name']}
      >
        <MainFrame resourceSources={localResourceSources} />
      </ExternalEditor>
    );
  } else {
    app = (
      <ElectronEventsBridge>
        <MainFrame
          onLayoutPreview={LocalPreviewLauncher.launchLayoutPreview}
          onExternalLayoutPreview={
            LocalPreviewLauncher.launchExternalLayoutPreview
          }
          exportDialog={
            <ExportDialog
              tabs={[
                {
                  name: 'Upload online',
                  ExportComponent: LocalS3Export,
                },
                {
                  name: 'Export to a folder',
                  ExportComponent: LocalExport,
                },
                {
                  name: 'Export to iOS/Android app',
                  ExportComponent: LocalMobileExport,
                },
              ]}
            />
          }
          createDialog={<LocalCreateDialog />}
          introDialog={<BetaIntroDialog />}
          onSaveProject={LocalProjectWriter.saveProject}
          onChooseProject={LocalProjectOpener.chooseProjectFile}
          onReadFromPathOrURL={LocalProjectOpener.readProjectJSONFile}
          resourceSources={localResourceSources}
        />
      </ElectronEventsBridge>
    );
  }
} else {
  app = (
    <MainFrame
      onLayoutPreview={BrowserS3PreviewLauncher.launchLayoutPreview}
      createDialog={<BrowserCreateDialog />}
      onReadFromPathOrURL={BrowserProjectOpener.readInternalFile}
    />
  );
}

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
sendProgramOpening();
