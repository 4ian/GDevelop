// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import PreviewAndShareButtons, {
  type PreviewAndShareButtonsProps,
} from './PreviewAndShareButtons';
import IconButton from '../../UI/IconButton';
import { Spacer } from '../../UI/Grid';
import HistoryIcon from '../../UI/CustomSvgIcons/History';
import OpenedVersionStatusChip from '../../VersionHistory/OpenedVersionStatusChip';
import type { OpenedVersionStatus } from '../../VersionHistory';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { getStatusColor } from '../../VersionHistory/Utils';
import SaveProjectIcon from '../SaveProjectIcon';
import CustomToolbarButton, {
  type ToolbarButtonConfig,
} from '../CustomToolbarButton';
import { runNpmScript } from '../../Utils/NpmScriptExecutor';
import { type FileMetadata } from '../../ProjectsStorage';
import PreferencesContext from '../Preferences/PreferencesContext';
import NpmScriptConfirmDialog from './NpmScriptConfirmDialog';

export type MainFrameToolbarProps = {|
  showProjectButtons: boolean,
  openShareDialog: () => void,
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  canSave: boolean,
  onOpenVersionHistory: () => void,
  checkedOutVersionStatus?: ?OpenedVersionStatus,
  onQuitVersionHistory: () => Promise<void>,
  canQuitVersionHistory: boolean,
  hidden: boolean,
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,

  ...PreviewAndShareButtonsProps,
|};

export type ToolbarInterface = {|
  setEditorToolbar: (React.Node | null) => void,
|};

type LeftButtonsToolbarGroupProps = {|
  onSave: (options?: {|
    skipNewVersionWarning: boolean,
  |}) => Promise<?FileMetadata>,
  onOpenVersionHistory: () => void,
  checkedOutVersionStatus?: ?OpenedVersionStatus,
  onQuitVersionHistory: () => Promise<void>,
  canQuitVersionHistory: boolean,
  canSave: boolean,
  toolbarButtons: Array<ToolbarButtonConfig>,
  projectPath: ?string,
|};

const LeftButtonsToolbarGroup = React.memo<LeftButtonsToolbarGroupProps>(
  function LeftButtonsToolbarGroup(props) {
    const {
      values: { disableNpmScriptConfirmation },
      setDisableNpmScriptConfirmation,
    } = React.useContext(PreferencesContext);

    const [confirmDialogOpen, setConfirmDialogOpen] = React.useState(false);
    const [pendingNpmScript, setPendingNpmScript] = React.useState<?string>(
      null
    );

    const handleCustomButtonClick = React.useCallback(
      (npmScript: string) => {
        if (!props.projectPath) return;

        // Check if confirmation is needed (stored in user preferences)
        if (!disableNpmScriptConfirmation) {
          setPendingNpmScript(npmScript);
          setConfirmDialogOpen(true);
          return;
        }

        runNpmScript(props.projectPath, npmScript);
      },
      [props.projectPath, disableNpmScriptConfirmation]
    );

    const handleConfirm = React.useCallback(
      (dontShowAgain: boolean) => {
        setConfirmDialogOpen(false);
        if (dontShowAgain) {
          setDisableNpmScriptConfirmation(true);
        }
        if (pendingNpmScript && props.projectPath) {
          runNpmScript(props.projectPath, pendingNpmScript);
        }
        setPendingNpmScript(null);
      },
      [pendingNpmScript, props.projectPath, setDisableNpmScriptConfirmation]
    );

    const handleDismiss = React.useCallback(() => {
      setConfirmDialogOpen(false);
      setPendingNpmScript(null);
    }, []);

    const scriptNames = props.toolbarButtons.map(b => b.npmScript).join(', ');

    return (
      <>
        <NpmScriptConfirmDialog
          open={confirmDialogOpen}
          scriptNames={scriptNames}
          onConfirm={handleConfirm}
          onDismiss={handleDismiss}
        />
        <ToolbarGroup firstChild>
          <IconButton
            size="small"
            id="toolbar-history-button"
            onClick={props.onOpenVersionHistory}
            tooltip={t`Open version history`}
            color="default"
          >
            <HistoryIcon />
          </IconButton>
          <SaveProjectIcon
            id="toolbar-save-button"
            onSave={props.onSave}
            canSave={props.canSave}
          />
          {props.toolbarButtons.map((button, index) => (
            <CustomToolbarButton
              key={index}
              name={button.name}
              icon={button.icon}
              onClick={() => handleCustomButtonClick(button.npmScript)}
            />
          ))}
          {props.checkedOutVersionStatus && (
            <div
              style={{
                // Leave margin between the chip that has a Cross icon to click and the
                // Play icon to preview the project. It's to avoid a mis-click that would
                // quit the version history instead of previewing the game.
                marginRight: 20,
              }}
            >
              <OpenedVersionStatusChip
                onQuit={props.onQuitVersionHistory}
                disableQuitting={!props.canQuitVersionHistory}
                openedVersionStatus={props.checkedOutVersionStatus}
              />
            </div>
          )}
        </ToolbarGroup>
      </>
    );
  }
);

export default React.forwardRef<MainFrameToolbarProps, ToolbarInterface>(
  function MainframeToolbar(props: MainFrameToolbarProps, ref) {
    const gdevelopTheme = React.useContext(GDevelopThemeContext);
    const [editorToolbar, setEditorToolbar] = React.useState<?React.Node>(null);

    React.useImperativeHandle(ref, () => ({
      setEditorToolbar,
    }));

    const borderBottomColor = React.useMemo(
      () => {
        if (!props.checkedOutVersionStatus) return null;
        return getStatusColor(
          gdevelopTheme,
          props.checkedOutVersionStatus.status
        );
      },
      [props.checkedOutVersionStatus, gdevelopTheme]
    );

    return (
      <Toolbar borderBottomColor={borderBottomColor} hidden={props.hidden}>
        {props.showProjectButtons ? (
          <>
            <LeftButtonsToolbarGroup
              onSave={props.onSave}
              canSave={props.canSave}
              onOpenVersionHistory={props.onOpenVersionHistory}
              checkedOutVersionStatus={props.checkedOutVersionStatus}
              onQuitVersionHistory={props.onQuitVersionHistory}
              canQuitVersionHistory={props.canQuitVersionHistory}
              toolbarButtons={props.toolbarButtons}
              projectPath={props.projectPath}
            />
            <ToolbarGroup>
              <Spacer />
              <PreviewAndShareButtons
                onPreviewWithoutHotReload={props.onPreviewWithoutHotReload}
                onOpenDebugger={props.onOpenDebugger}
                onNetworkPreview={props.onNetworkPreview}
                onHotReloadPreview={props.onHotReloadPreview}
                onLaunchPreviewWithDiagnosticReport={
                  props.onLaunchPreviewWithDiagnosticReport
                }
                setPreviewOverride={props.setPreviewOverride}
                canDoNetworkPreview={props.canDoNetworkPreview}
                isPreviewEnabled={props.isPreviewEnabled}
                previewState={props.previewState}
                hasPreviewsRunning={props.hasPreviewsRunning}
                openShareDialog={props.openShareDialog}
                isSharingEnabled={props.isSharingEnabled}
              />
              <Spacer />
            </ToolbarGroup>
          </>
        ) : null}
        {editorToolbar || <ToolbarGroup />}
      </Toolbar>
    );
  }
);
