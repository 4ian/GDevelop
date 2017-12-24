import 'element-closest';
import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import CreateProjectDialog from './ProjectCreation/CreateProjectDialog';
import { sendProgramOpening } from './Utils/Analytics/EventSender';
import { installRaven } from './Utils/Analytics/Raven';
import { installFullstory } from './Utils/Analytics/Fullstory';
import registerServiceWorker from './registerServiceWorker';
import './UI/iconmoon-font.css'; // Styles for Iconmoon font.
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table

// Import for browser only IDE
import BrowserS3PreviewLauncher from './Export/BrowserS3PreviewLauncher';
import BrowserExport from './Export/BrowserExport';
import BrowserExamples from './ProjectCreation/BrowserExamples';
import BrowserProjectOpener from './ProjectsStorage/BrowserProjectOpener';
import BrowserSaveDialog from './ProjectsStorage/BrowserSaveDialog';
import BrowserIntroDialog from './MainFrame/BrowserIntroDialog';
import browserResourceSources from './ResourcesEditor/BrowserResourceSources';

// Import for Electron powered IDE.
import ExternalEditor from './ExternalEditor';
import optionalRequire from './Utils/OptionalRequire.js';
import LocalPreviewLauncher from './Export/LocalPreviewLauncher';
import LocalExport from './Export/LocalExport';
import LocalS3Export from './Export/LocalS3Export';
import LocalCordovaExport from './Export/LocalCordovaExport';
import LocalCocos2dExport from './Export/LocalCocos2dExport';
import LocalExamples from './ProjectCreation/LocalExamples';
import localResourceSources from './ResourcesEditor/LocalResourceSources';
import LocalProjectWriter from './ProjectsStorage/LocalProjectWriter';
import LocalProjectOpener from './ProjectsStorage/LocalProjectOpener';
import ElectronEventsBridge from './MainFrame/ElectronEventsBridge';
import LocalIntroDialog from './MainFrame/LocalIntroDialog';
const electron = optionalRequire('electron');

installRaven();
installFullstory();

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
                  name: 'iOS/Android app',
                  ExportComponent: LocalCordovaExport,
                },
                {
                  name: 'Cocos2d-JS',
                  ExportComponent: LocalCocos2dExport,
                  advanced: true,
                },
              ]}
            />
          }
          createDialog={
            <CreateProjectDialog examplesComponent={LocalExamples} />
          }
          introDialog={<LocalIntroDialog />}
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
      exportDialog={
        <ExportDialog
          tabs={[
            {
              name: 'Export your game (coming soon)',
              ExportComponent: BrowserExport,
            },
          ]}
        />
      }
      createDialog={<CreateProjectDialog examplesComponent={BrowserExamples} />}
      introDialog={<BrowserIntroDialog />}
      saveDialog={<BrowserSaveDialog />}
      onReadFromPathOrURL={BrowserProjectOpener.readInternalFile}
      resourceSources={browserResourceSources}
    />
  );
}

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
sendProgramOpening();
