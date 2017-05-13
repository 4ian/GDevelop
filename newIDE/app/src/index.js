import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import ExternalEditor from './ExternalEditor';
import Window from './Utils/Window';
import injectTapEventPlugin from 'react-tap-event-plugin';
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
    >
      <MainFrame
        selectedEditor={appArguments['editor']}
        editedElementName={appArguments['edited-element-name']}
      />
    </ExternalEditor>
  );
} else {
  app = <MainFrame />;
}

ReactDOM.render(app, document.getElementById('root'));
