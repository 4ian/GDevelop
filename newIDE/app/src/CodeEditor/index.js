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

      // Enable type checking of JavaScript files
      monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
        // TODO: Uncomment to activate type checking of JS files, once autocompletions are all handled properly.
        // ...monaco.languages.typescript.javascriptDefaults.getCompilerOptions()
        target: monaco.languages.typescript.ScriptTarget.ES6,
        allowNonTsExtensions: true,
        allowJs: true,
        checkJs: true,
      });

      // Activate checks - though this won't work for .d.ts classes/funcions for
      // some reason. See:
      // https://microsoft.github.io/monaco-editor/playground.html?source=v0.52.0#XQAAAALxBQAAAAAAAABBqQkHQ5NjdMjwa-jY7SIQ9S7DNlzs5W-mwj0fe1ZCDRFc9ws9XQE0SJE1jc2VKxhaLFIw9vEWSxW3yscw90T9lfa8wm3bKzPN7npWhYaA4x4rxLXXBbB2_OnRSToJ21hOUR_hS9pG2m6stSYmFVtipRHVTrIB91DOr8dFz_2f6wKJhg_ghHcsBt-hKnlu-qt2H4NuwdaqfbMd6vqkrLY5fzdHCB8FZIGGUDanilP6QXPTpV0rme8fvINUj2BklEotLylw-HHch53nHQMCabAMh3iNqg8S_rHB5OZg2IxLB-8POziUzSwFrTcfwxftX7gi3ZIWNPyf4vJOFtRKVr3hJLIKUGJew4RN0hYb1SnPUm1x6B8hb8I5-9WqAgbYz6E0ntlpOU4jvw6zty4iIJ4GQFuyQ1ys6LtVNKef1bnBs7fDr3xFb3LOW7E4RMonCTxapW3_DQvpQ_x4psM1GYFKMZZXr0lCRvrFs4PBf0uXMwEeTfC1PurLOeoNNEEZFLutUE1ojQVjkTgxZC_HCheas9sKTtZRsJ0i6qDWJh3PbNocPFIbvPQ5la2NXuQIph1oaGrDjqgoirRoexyKumFnXVLkvKVoTdglfgXLwEaoheNdItwJfWKdPqmHh18GTsk8Df_mr8zt3r-pLUtNvB6220ZAKaswAMPR0yDrfHfz_7vWaBfDy6yykp-ROV0Ckt2qV83DVNrHW9HNm4e0WC1ByFoDOB8AdJzjQye8YD3aCwy8ft4sSOGvSeNo2FOPoqd2TU-Sr58fhP09rWes4Vgrv1MhMlUtZ5zBNSL_Mpb1R32H8hrNShgxxaT0r048_u6-nFbkNKq-VCjTlFuUoTW-3y8b1UrYxSmTkjmp-KCc9ObqKgzbRV5tPIX_sqYqVCJFOZN0Nndp4s6xm7qmVPi8SMcDfCD4zfPWBpanAohwTcIIbXPJqggntHxMUFvH7h85mh3AZoJ5FPz2v387LTrxdqOZZW7kTGqSl-Y8NHsa_znjlaNDOU-qywr5DypPbH3_wOm2XMeQNg0jX1bBtIoh_PG5BWMQNlJmQRlDnmDtueZf_nTzQw
      //
      // TODO: Uncomment to activate type checking of JS files, once autocompletions are all handled properly.
      //
      // monaco.languages.typescript.javascriptDefaults.setDiagnosticsOptions({
      //   ...monaco.languages.typescript.javascriptDefaults.getDiagnosticsOptions(),
      //   noSemanticValidation: false,
      //   noSuggestionDiagnostics: false,
      //   noSyntaxValidation: false,
      // });

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
