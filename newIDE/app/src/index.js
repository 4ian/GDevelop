import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import Window from './Utils/Window';
import ExportDialog from './Export/ExportDialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import registerServiceWorker from './registerServiceWorker';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table

// Import for Electron powered IDE.
import ExternalEditor from './ExternalEditor';
import optionalRequire from './Utils/OptionalRequire.js';
import LocalPreviewLauncher from './Export/LocalPreviewLauncher';
import LocalExport from './Export/LocalExport';
import LocalS3Export from './Export/LocalS3Export';
import LocalCreateDialog from './ProjectCreation/LocalCreateDialog';
const electron = optionalRequire('electron');

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

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
        <MainFrame />
      </ExternalEditor>
    );
  } else {
    app = (
      <MainFrame
        onLayoutPreview={LocalPreviewLauncher.launchLayoutPreview}
        onExternalLayoutPreview={LocalPreviewLauncher.launchExternalLayoutPreview}
        exportDialog={<ExportDialog tabs={[{
          name: 'Upload online',
          ExportComponent: LocalS3Export
        }, {
          name: 'Export to a folder',
          ExportComponent: LocalExport
        }]} />}
        createDialog={<LocalCreateDialog />}
      />
    );
  }
} else {
  app = (
    <MainFrame />
  );
}

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();
