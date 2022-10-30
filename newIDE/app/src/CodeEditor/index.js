// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import { setupAutocompletions } from './LocalCodeEditorAutocompletions';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import { getAllThemes } from './Theme';

export type State = {|
  MonacoEditor: ?any,
  error: ?Error,
|};
export type Props = {|
  value: string,
  onChange: string => void,
  width?: number,
  height?: number,
  onEditorMounted?: () => void,
  onFocus: () => void,
  onBlur: () => void,
|};

const monacoEditorOptions = {
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

// There is only a single instance of monaco living, keep track
// of if its initialized or not.
let monacoCompletionsInitialized = false;
let monacoThemesInitialized = false;

export class CodeEditor extends React.Component<Props, State> {
  state = {
    MonacoEditor: null,
    error: null,
  };

  setupEditorThemes = (monaco: any) => {
    if (!monacoThemesInitialized) {
      monacoThemesInitialized = true;

      getAllThemes().forEach(codeEditorTheme => {
        // Builtin themes don't have themeData, don't redefine them.
        if (codeEditorTheme.themeData) {
          monaco.editor.defineTheme(
            codeEditorTheme.themeName,
            codeEditorTheme.themeData
          );
        }
      });
    }
  };

  setUpSaveOnEditorBlur = (editor: any) => {
    editor.onDidBlurEditorText(this.props.onBlur);
  };
  setUpEditorFocus = (editor: any) => {
    editor.onDidFocusEditorText(this.props.onFocus);
  };

  setupEditorCompletions = (editor: any, monaco: any) => {
    this.setUpEditorFocus(editor);
    this.setUpSaveOnEditorBlur(editor);
    if (!monacoCompletionsInitialized) {
      monacoCompletionsInitialized = true;

      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        // noLib: true,
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
        allowJs: true,
        checkJs: true,
      });
      setupAutocompletions(monaco);
    }

    if (this.props.onEditorMounted) this.props.onEditorMounted();
  };

  componentDidMount() {
    this.loadMonacoEditor();
  }

  handleLoadError(error: Error) {
    this.setState({
      error,
    });
  }

  loadMonacoEditor() {
    this.setState({
      error: null,
    });

    // Define the global variable used by Monaco Editor to find its worker
    // (used, at least, for auto-completions).
    window.MonacoEnvironment = {
      getWorkerUrl: function(workerId, label) {
        return 'external/monaco-editor-min/vs/base/worker/workerMain.js';
      },
    };

    import(/* webpackChunkName: "react-monaco-editor" */ 'react-monaco-editor')
      .then(module =>
        this.setState({
          MonacoEditor: module.default,
        })
      )
      .catch(this.handleLoadError);
  }

  _handleContextMenu = (event: SyntheticEvent<>) => {
    // Prevent right click to bubble up and trigger the context menu
    // of the event.
    event.preventDefault();
    event.stopPropagation();
  };

  render() {
    const { MonacoEditor, error } = this.state;
    if (error) {
      return (
        <React.Fragment>
          <Text>
            <Trans>Unable to load the code editor</Trans>
          </Text>
          <RaisedButton
            label={<Trans>Retry</Trans>}
            onClick={this.loadMonacoEditor}
          />
        </React.Fragment>
      );
    }

    if (!MonacoEditor) {
      return <PlaceholderLoader />;
    }

    return (
      <div onContextMenu={this._handleContextMenu}>
        <PreferencesContext.Consumer>
          {({ values: preferences }) => (
            <MonacoEditor
              width={this.props.width || 600}
              height={this.props.height || 200}
              language="javascript"
              theme={preferences.codeEditorThemeName}
              value={this.props.value}
              onChange={this.props.onChange}
              editorWillMount={this.setupEditorThemes}
              editorDidMount={this.setupEditorCompletions}
              options={{
                ...monacoEditorOptions,
                fontSize: preferences.eventsSheetZoomLevel,

                // Wrap the code at either the viewport width
                // (so no need to scroll horizontally
                // on small code editors) or at 80 columns max
                // (as a good practice).
                wordWrap: 'on',
              }}
            />
          )}
        </PreferencesContext.Consumer>
      </div>
    );
  }
}
