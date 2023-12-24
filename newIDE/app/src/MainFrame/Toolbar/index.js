// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import PreviewAndShareButtons, {
  type PreviewAndShareButtonsProps,
} from './PreviewAndShareButtons';
import ProjectManagerIcon from '../../UI/CustomSvgIcons/ProjectManager';
import FloppyIcon from '../../UI/CustomSvgIcons/Floppy';
import IconButton from '../../UI/IconButton';
import { Spacer } from '../../UI/Grid';
import HistoryIcon from '../../UI/CustomSvgIcons/History';
import OpenedVersionStatusChip from '../../VersionHistory/OpenedVersionStatusChip';
import type { OpenedVersionStatus } from '../../VersionHistory';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import { getStatusColor } from '../../VersionHistory/Utils';

export type MainFrameToolbarProps = {|
  showProjectButtons: boolean,
  toggleProjectManager: () => void,
  openShareDialog: () => void,
  onSave: () => Promise<void>,
  canSave: boolean,
  onOpenVersionHistory: () => void,
  checkedOutVersionStatus?: ?OpenedVersionStatus,
  onQuitVersionHistory: () => Promise<void>,
  canQuitVersionHistory: boolean,

  ...PreviewAndShareButtonsProps,
|};

export type ToolbarInterface = {|
  setEditorToolbar: (React.Node | null) => void,
|};

type LeftButtonsToolbarGroupProps = {|
  toggleProjectManager: () => void,
  onSave: () => Promise<void>,
  onOpenVersionHistory: () => void,
  checkedOutVersionStatus?: ?OpenedVersionStatus,
  onQuitVersionHistory: () => Promise<void>,
  canQuitVersionHistory: boolean,
  canSave: boolean,
|};

const LeftButtonsToolbarGroup = React.memo<LeftButtonsToolbarGroupProps>(
  function LeftButtonsToolbarGroup(props) {
    return (
      <ToolbarGroup firstChild>
        <IconButton
          size="small"
          id="main-toolbar-project-manager-button"
          onClick={props.toggleProjectManager}
          tooltip={t`Project Manager`}
          color="default"
        >
          <ProjectManagerIcon />
        </IconButton>
        <IconButton
          size="small"
          id="toolbar-history-button"
          onClick={props.onOpenVersionHistory}
          tooltip={t`Open version history`}
          color="default"
          disabled={false}
        >
          <HistoryIcon />
        </IconButton>
        <IconButton
          size="small"
          id="toolbar-save-button"
          onClick={props.onSave}
          tooltip={t`Save project`}
          color="default"
          disabled={!props.canSave}
        >
          <FloppyIcon />
        </IconButton>
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
      <Toolbar borderBottomColor={borderBottomColor}>
        {props.showProjectButtons ? (
          <>
            <LeftButtonsToolbarGroup
              toggleProjectManager={props.toggleProjectManager}
              onSave={props.onSave}
              canSave={props.canSave}
              onOpenVersionHistory={props.onOpenVersionHistory}
              checkedOutVersionStatus={props.checkedOutVersionStatus}
              onQuitVersionHistory={props.onQuitVersionHistory}
              canQuitVersionHistory={props.canQuitVersionHistory}
            />
            <ToolbarGroup>
              <Spacer />
              <PreviewAndShareButtons
                onPreviewWithoutHotReload={props.onPreviewWithoutHotReload}
                onOpenDebugger={props.onOpenDebugger}
                onNetworkPreview={props.onNetworkPreview}
                onHotReloadPreview={props.onHotReloadPreview}
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
