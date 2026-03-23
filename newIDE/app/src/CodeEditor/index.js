// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import RaisedButton from '../UI/RaisedButton';
import Text from '../UI/Text';
import PreferencesContext from '../MainFrame/Preferences/PreferencesContext';
import PortalContainerContext from '../UI/PortalContainerContext';
import PoppedOutMonacoEditor from './PoppedOutMonacoEditor';
import {
  registerThemes,
  initializeCompletions,
  baseEditorOptions,
} from './MonacoSetup';

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

export class CodeEditor extends React.Component<Props, State> {
  // $FlowFixMe[missing-local-annot]
  state = {
    MonacoEditor: null,
    error: null,
  };

  setupEditorThemes = (monaco: any) => {
    registerThemes(monaco);
  };

  setupEditorCompletions = (editor: any, monaco: any) => {
    editor.onDidFocusEditorText(this.props.onFocus);
    editor.onDidBlurEditorText(this.props.onBlur);
    initializeCompletions(monaco);
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
      // $FlowFixMe[method-unbinding]
      .catch(this.handleLoadError);
  }

  _handleContextMenu = (event: SyntheticEvent<>) => {
    // Prevent right click to bubble up and trigger the context menu
    // of the event.
    event.preventDefault();
    event.stopPropagation();
  };

  render(): any {
    return (
      <PortalContainerContext.Consumer>
        {portalContainer => {
          // When rendered inside a popped-out window (PortalContainerContext
          // is set), use PoppedOutMonacoEditor which loads Monaco via the
          // AMD loader in the target window's context. This is necessary
          // because the webpack-bundled Monaco (react-monaco-editor) has
          // internal DOM checks that compare against the main window's
          // document.body — elements in a different window's document are
          // treated as detached and never rendered.
          if (portalContainer) {
            return (
              <PreferencesContext.Consumer>
                {({ values: preferences }) => (
                  <PoppedOutMonacoEditor
                    value={this.props.value}
                    onChange={this.props.onChange}
                    width={this.props.width || 600}
                    height={this.props.height || 200}
                    theme={preferences.codeEditorThemeName}
                    fontSize={preferences.eventsSheetZoomLevel}
                    onEditorMounted={this.props.onEditorMounted}
                    onFocus={this.props.onFocus}
                    onBlur={this.props.onBlur}
                  />
                )}
              </PreferencesContext.Consumer>
            );
          }

          const { MonacoEditor, error } = this.state;
          if (error) {
            return (
              <React.Fragment>
                <Text>
                  <Trans>Unable to load the code editor</Trans>
                </Text>
                <RaisedButton
                  label={<Trans>Retry</Trans>}
                  // $FlowFixMe[method-unbinding]
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
                      ...baseEditorOptions,
                      fontSize: preferences.eventsSheetZoomLevel,
                    }}
                  />
                )}
              </PreferencesContext.Consumer>
            </div>
          );
        }}
      </PortalContainerContext.Consumer>
    );
  }
}
