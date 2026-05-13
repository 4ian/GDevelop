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
  enableJsTypeDiagnostics,
  applyElectronClipboardPatch,
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
}: Props): React.Node => {
  const [MonacoEditor, setMonacoEditor] = React.useState<any>(null);
  const [error, setError] = React.useState<Error | null>(null);

  const { values: preferences } = React.useContext(PreferencesContext);
  const portalContainer = React.useContext(PortalContainerContext);

  const setupEditorThemes = React.useCallback((monaco: any) => {
    registerThemes(monaco);
  }, []);

  const setUpSaveOnEditorBlur = React.useCallback(
    (editor: any) => {
      editor.onDidBlurEditorText(onBlur);
    },
    [onBlur]
  );
  const setUpEditorFocus = React.useCallback(
    (editor: any) => {
      editor.onDidFocusEditorText(onFocus);
    },
    [onFocus]
  );

  const setupEditorCompletions = React.useCallback(
    (editor: any, monaco: any) => {
      setUpEditorFocus(editor);
      setUpSaveOnEditorBlur(editor);
      initializeCompletions(monaco);
      applyElectronClipboardPatch(editor, monaco);

      if (preferences.showJsTypeError) {
        enableJsTypeDiagnostics(monaco);
      }

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
      preferences.showJsTypeError,
      setUpEditorFocus,
      setUpSaveOnEditorBlur,
    ]
  );

  const handleLoadError = React.useCallback((error: Error) => {
    setError(error);
  }, []);

  const loadMonacoEditor = React.useCallback(
    () => {
      setError(null);

      // Define the global variable used by Monaco Editor to find its worker
      // (used, at least, for auto-completions).
      window.MonacoEnvironment = {
        getWorkerUrl: function(workerId, label) {
          return 'external/monaco-editor-min/vs/base/worker/workerMain.js';
        },
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
    (editor: any, monaco: any) => {
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
    return <PlaceholderLoader />;
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
        editorWillMount={setupEditorThemes}
        editorDidMount={setupEditorCompletions}
        editorWillUnmount={_saveEditorState}
        options={{
          ...baseEditorOptions,
          fontSize: preferences.eventsSheetZoomLevel,
        }}
      />
    </div>
  );
};
