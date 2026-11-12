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
  initializeMonaco,
  allowTopLevelAwaitForModel,
  baseEditorOptions,
} from './MonacoSetup';

export type State = {|
  MonacoEditor: ?any,
  error: ?Error,
|};
export type Props = {|
  value: string,
  onChange: string => void,
  initialScrollTop: number,
  initialCursorColumn: number,
  initialCursorLine: number,
  saveEditorState: ({
    scrollTop: number,
    cursorColumn: number,
    cursorLine: number,
  }) => void,
  width?: number,
  height?: number,
  onEditorMounted?: () => void,
  onFocus: () => void,
  onBlur: () => void,
  allowTopLevelAwait?: boolean,
|};

export const CodeEditor = ({
  value,
  onChange,
  initialScrollTop,
  initialCursorColumn,
  initialCursorLine,
  saveEditorState,
  width,
  height,
  onEditorMounted,
  onFocus,
  onBlur,
  allowTopLevelAwait,
}: Props): React.Node => {
  const [MonacoEditor, setMonacoEditor] = React.useState<any>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const { values: preferences } = React.useContext(PreferencesContext);
  const portalContainer = React.useContext(PortalContainerContext);

  const handleEditorWillMount = React.useCallback(
    (monaco: any) => initializeMonaco(monaco, preferences.showJsTypeError),
    [preferences.showJsTypeError]
  );

  const handleEditorDidMount = React.useCallback(
    (editor: any) => {
      editor.onDidFocusEditorText(onFocus);
      editor.onDidBlurEditorText(onBlur);
      if (allowTopLevelAwait) allowTopLevelAwaitForModel(editor.getModel());

      editor.setScrollTop(initialScrollTop);
      editor.setPosition({
        column: initialCursorColumn,
        lineNumber: initialCursorLine,
      });

      if (onEditorMounted) onEditorMounted();
    },
    [
      initialCursorColumn,
      initialCursorLine,
      initialScrollTop,
      onEditorMounted,
      onFocus,
      onBlur,
      allowTopLevelAwait,
    ]
  );

  const handleLoadError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const loadMonacoEditor = React.useCallback(
    () => {
      setError(null);

      // The bundled editor uses ESM, but the worker copied to public is AMD.
      window.MonacoEnvironment = {
        getWorker: (_: string, label: string) =>
          new Worker(
            'external/monaco-editor-min/vs/base/worker/workerMain.js',
            {
              name: label,
            }
          ),
      };

      import(/* webpackChunkName: "react-monaco-editor" */ 'react-monaco-editor')
        .then(module => setMonacoEditor(oldValue => module.default))
        .catch(handleLoadError);
    },
    [handleLoadError]
  );

  // Load the editor on mount.
  React.useEffect(() => {
    loadMonacoEditor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const _handleContextMenu = React.useCallback((event: SyntheticEvent<>) => {
    // Prevent right click to bubble up and trigger the context menu
    // of the event.
    event.preventDefault();
    event.stopPropagation();
  }, []);

  const _saveEditorState = React.useCallback(
    (editor: any) => {
      const cursorPosition = editor.getPosition();
      saveEditorState({
        scrollTop: editor.getScrollTop(),
        cursorColumn: cursorPosition.column,
        cursorLine: cursorPosition.lineNumber,
      });
    },
    [saveEditorState]
  );

  // When rendered inside a popped-out window (PortalContainerContext
  // is set), use PoppedOutMonacoEditor which loads Monaco via the
  // AMD loader in the target window's context. This is necessary
  // because the webpack-bundled Monaco (react-monaco-editor) has
  // internal DOM checks that compare against the main window's
  // document.body — elements in a different window's document are
  // treated as detached and never rendered.
  if (portalContainer) {
    return (
      <PoppedOutMonacoEditor
        value={value}
        onChange={onChange}
        width={width || 600}
        height={height || 200}
        theme={preferences.codeEditorThemeName}
        fontSize={preferences.eventsSheetZoomLevel}
        showJsTypeError={preferences.showJsTypeError}
        initialScrollTop={initialScrollTop}
        initialCursorColumn={initialCursorColumn}
        initialCursorLine={initialCursorLine}
        saveEditorState={saveEditorState}
        onEditorMounted={onEditorMounted}
        onFocus={onFocus}
        onBlur={onBlur}
        allowTopLevelAwait={allowTopLevelAwait}
      />
    );
  }

  if (error) {
    return (
      <React.Fragment>
        <Text>
          <Trans>Unable to load the code editor</Trans>
        </Text>
        <RaisedButton label={<Trans>Retry</Trans>} onClick={loadMonacoEditor} />
      </React.Fragment>
    );
  }

  if (!MonacoEditor) {
    // Reserve the same dimensions as the editor that will replace this loader,
    // so that the surrounding container keeps a stable height while Monaco is
    // being loaded asynchronously. Without this, the height would grow once the
    // editor mounts, which - in the events sheet - reports a new event height
    // and makes the virtualized list jump the scroll position.
    return (
      <div style={{ width: width || 600, height: height || 200 }}>
        <PlaceholderLoader />
      </div>
    );
  }

  return (
    <div onContextMenu={_handleContextMenu}>
      <MonacoEditor
        width={width || 600}
        height={height || 200}
        language="javascript"
        theme={preferences.codeEditorThemeName}
        value={value}
        onChange={onChange}
        editorWillMount={handleEditorWillMount}
        editorDidMount={handleEditorDidMount}
        editorWillUnmount={_saveEditorState}
        options={{
          ...baseEditorOptions,
          fontSize: preferences.eventsSheetZoomLevel,
        }}
      />
    </div>
  );
};
