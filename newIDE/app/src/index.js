import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import ExternalEditor from './ExternalEditor';
import Window from './Utils/Window';
import LocalPreviewLauncher from './Export/LocalPreviewLauncher';
import LocalExportDialog from './Export/LocalExportDialog';
import injectTapEventPlugin from 'react-tap-event-plugin';
import registerServiceWorker from './registerServiceWorker';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

const appArguments = Window.getArguments();

let app = null;
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
  app = <MainFrame
    onLayoutPreview={LocalPreviewLauncher.launchLayoutPreview}
    onExternalLayoutPreview={LocalPreviewLauncher.launchExternalLayoutPreview}
    exportDialogComponent={LocalExportDialog}
  />;
}

ReactDOM.render(app, document.getElementById('root'));
registerServiceWorker();