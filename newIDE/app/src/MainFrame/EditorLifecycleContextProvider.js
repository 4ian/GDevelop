// @flow
import * as React from 'react';

export type EditorLifecycleState = {|
  isEditorReady: boolean,
  hasPreviewsRunning: boolean,
|};

const defaultValue: EditorLifecycleState = {
  isEditorReady: false,
  hasPreviewsRunning: false,
};

const EditorLifecycleContext: React.Context<EditorLifecycleState> = React.createContext<EditorLifecycleState>(
  defaultValue
);

export const useEditorLifecycleContext = (): EditorLifecycleState =>
  React.useContext(EditorLifecycleContext);

type EditorLifecycleContextProviderProps = {|
  isEditorReady: boolean,
  hasPreviewsRunning: boolean,
  children: React.Node,
|};

const EditorLifecycleContextProvider: React.ComponentType<EditorLifecycleContextProviderProps> = React.memo(
  ({
    isEditorReady,
    hasPreviewsRunning,
    children,
  }: EditorLifecycleContextProviderProps): React.Node => {
    const editorLifecycleValue = React.useMemo(
      () => ({
        isEditorReady,
        hasPreviewsRunning,
      }),
      [isEditorReady, hasPreviewsRunning]
    );
    return (
      <EditorLifecycleContext.Provider value={editorLifecycleValue}>
        {children}
      </EditorLifecycleContext.Provider>
    );
  }
);

export default EditorLifecycleContextProvider;
