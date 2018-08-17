// @flow
import * as React from 'react';
import { setupAutocompletions } from './LocalCodeEditorAutocompletions';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from 'material-ui/RaisedButton';

export type State = {|
  MonacoEditor: ?any,
  error: ?Error,
|};
export type Props = {|
  value: string,
  onChange: string => void,
  width: number,
|};

const monacoEditorOptions = {
  scrollBeyondLastLine: false,
  minimap: {
    enabled: false,
  },
};

// There is only a single instance of monaco living, keep track
// of if its initialized or not.
let monacoInitialized = false;

export class CodeEditor extends React.Component<Props, State> {
  state = {
    MonacoEditor: null,
    error: null,
  };

  setupEditor(editor: any, monaco: any) {
    if (monacoInitialized) {
      console.log('Monaco editor already set up');
      return;
    }
    monacoInitialized = true;

    monaco.languages.typescript.javascriptDefaults.setCompilerOptions({
      // noLib: true,
      target: monaco.languages.typescript.ScriptTarget.ES6,
      allowNonTsExtensions: true,
      allowJs: true,
      checkJs: true,
    });
    setupAutocompletions(monaco);
  }

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
    import(/* webpackChunkName: "react-monaco-editor" */ 'react-monaco-editor')
      .then(module =>
        this.setState({
          MonacoEditor: module.default,
        })
      )
      .catch(this.handleLoadError);
  }

  render() {
    const { MonacoEditor, error } = this.state;
    if (error) {
      return (
        <React.Fragment>
          <p>Unable to load the code editor</p>
          <RaisedButton label="Retry" onClick={this.loadMonacoEditor} />
        </React.Fragment>
      );
    }

    if (!MonacoEditor) {
      return <PlaceholderLoader />;
    }

    return (
      <MonacoEditor
        width={this.props.width || 600}
        height="400"
        language="javascript"
        theme="vs-dark"
        value={this.props.value}
        onChange={this.props.onChange}
        editorDidMount={this.setupEditor}
        options={monacoEditorOptions}
      />
    );
  }
}
