// @flow
import * as React from 'react';

import WindowPortal from '../UI/WindowPortal';
import AlertProvider from '../UI/Alert/AlertProvider';
import useAlertDialog from '../UI/Alert/useAlertDialog';
import { FullThemeProvider } from '../UI/Theme/FullThemeProvider';
import { SpecificDimensionsWindowSizeProvider } from '../UI/Responsive/ResponsiveWindowMeasurer';
import DragAndDropContextProvider from '../UI/DragAndDrop/DragAndDropContextProvider';
import { type ProjectScopedContainersAccessor } from '../InstructionOrExpression/EventsScope';
import { type HotReloadPreviewButtonProps } from '../HotReload/HotReloadPreviewButton';
import Window from '../Utils/Window';
import { getHelpLink } from '../Utils/HelpLink';
import VariablesEditorRedesignWindow, {
  REFERENCE_GEOMETRY,
  type RedesignVariable,
} from './VariablesEditorRedesignWindow';
import {
  applyVariablesEditorRedesignSession,
  cancelVariablesEditorRedesignSession,
  createVariablesEditorRedesignSession,
  getVariablesEditorRedesignTitle,
  previewVariablesEditorRedesignSession,
} from './VariablesEditorRedesignModel';
import styles from './VariablesEditorRedesignWindowPortal.module.css';

type Props = {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onClose: () => void,
  focusRequestId: number,
|};

type ContentProps = {|
  projectScopedContainersAccessor: ProjectScopedContainersAccessor,
  hotReloadPreviewButtonProps: HotReloadPreviewButtonProps,
  onClose: () => void,
|};

const VariablesEditorRedesignContent = ({
  projectScopedContainersAccessor,
  hotReloadPreviewButtonProps,
  onClose,
}: ContentProps): React.Node => {
  const session = React.useMemo(
    () => createVariablesEditorRedesignSession(projectScopedContainersAccessor),
    [projectScopedContainersAccessor]
  );
  const hasFinished = React.useRef(false);
  const { showAlert } = useAlertDialog();

  React.useEffect(
    () => () => {
      if (!hasFinished.current) {
        cancelVariablesEditorRedesignSession(session);
      }
    },
    [session]
  );

  const cancel = React.useCallback(
    () => {
      if (!hasFinished.current) {
        cancelVariablesEditorRedesignSession(session);
        hasFinished.current = true;
      }
      onClose();
    },
    [onClose, session]
  );

  const apply = React.useCallback(
    (variables: Array<RedesignVariable>) => {
      try {
        applyVariablesEditorRedesignSession({ session, variables });
        hasFinished.current = true;
        onClose();
      } catch (error) {
        console.error('Unable to apply redesigned variable changes:', error);
        showAlert({
          title: 'Unable to apply variables',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while applying the variables.',
        }).then(() => {
          if (session.released) {
            hasFinished.current = true;
            onClose();
          }
        });
      }
    },
    [onClose, session, showAlert]
  );

  const runPreview = React.useCallback(
    (variables: Array<RedesignVariable>) => {
      try {
        previewVariablesEditorRedesignSession({ session, variables });
        // Variable identifiers can affect generated code, matching the legacy
        // variables dialog's `isCodeGenerationRequired` preview behavior.
        hotReloadPreviewButtonProps
          .launchProjectCodeAndDataPreview()
          .catch(error => {
            console.error('Unable to launch variables preview:', error);
            showAlert({
              title: 'Unable to launch preview',
              message:
                error instanceof Error
                  ? error.message
                  : 'An unexpected error occurred while launching the preview.',
            });
          });
      } catch (error) {
        console.error('Unable to preview redesigned variable changes:', error);
        showAlert({
          title: 'Unable to preview variables',
          message:
            error instanceof Error
              ? error.message
              : 'An unexpected error occurred while preparing the preview.',
        });
      }
    },
    [hotReloadPreviewButtonProps, session, showAlert]
  );

  const openHelp = React.useCallback(() => {
    const helpLink = getHelpLink('/all-features/variables');
    if (helpLink) Window.openExternalURL(helpLink);
  }, []);

  return (
    <div className={styles.windowRoot}>
      <VariablesEditorRedesignWindow
        variant="overview"
        title={session.title}
        scopes={session.scopes}
        initialVariables={session.variables}
        primaryScopeId={session.primaryScopeId}
        showDesignCallout={false}
        onCancel={cancel}
        onApply={apply}
        onRunPreview={runPreview}
        onHelp={openHelp}
      />
    </div>
  );
};

/** Hosts the real, staged variables editor in a dedicated workbench window. */
const VariablesEditorRedesignWindowPortal = ({
  projectScopedContainersAccessor,
  hotReloadPreviewButtonProps,
  onClose,
  focusRequestId,
}: Props): React.Node => {
  const [externalWindow, setExternalWindow] = React.useState<?any>(null);
  const scope = projectScopedContainersAccessor.getScope();
  const title = getVariablesEditorRedesignTitle(scope);

  return (
    <WindowPortal
      title={title}
      initialWidth={REFERENCE_GEOMETRY.overview.width}
      initialHeight={REFERENCE_GEOMETRY.overview.height}
      onClose={onClose}
      onWindowReady={setExternalWindow}
      focusRequestId={focusRequestId}
      renderContent={({ windowSize }) => (
        <SpecificDimensionsWindowSizeProvider
          innerWidth={windowSize.width}
          innerHeight={windowSize.height}
        >
          <FullThemeProvider forcedThemeName="Dark">
            <AlertProvider>
              <DragAndDropContextProvider
                key={
                  externalWindow
                    ? 'variables-editor-external-window'
                    : 'variables-editor-main-window-fallback'
                }
                window={externalWindow}
              >
                <VariablesEditorRedesignContent
                  projectScopedContainersAccessor={
                    projectScopedContainersAccessor
                  }
                  hotReloadPreviewButtonProps={hotReloadPreviewButtonProps}
                  onClose={onClose}
                />
              </DragAndDropContextProvider>
            </AlertProvider>
          </FullThemeProvider>
        </SpecificDimensionsWindowSizeProvider>
      )}
    />
  );
};

export default VariablesEditorRedesignWindowPortal;
