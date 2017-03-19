import React from 'react';
import ReactDOM from 'react-dom';
import MainFrame from './MainFrame';
import ExternalEditor from './ExternalEditor';
import injectTapEventPlugin from 'react-tap-event-plugin';
import 'react-virtualized/styles.css'; // Styles for react-virtualized Table

// Needed for onTouchTap
// http://stackoverflow.com/a/34015469/988941
injectTapEventPlugin();

ReactDOM.render(
  <ExternalEditor>
    <MainFrame />
  </ExternalEditor>,
  document.getElementById('root')
);
