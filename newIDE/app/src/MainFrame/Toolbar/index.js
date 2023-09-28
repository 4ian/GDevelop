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

export type MainFrameToolbarProps = {|
  showProjectButtons: boolean,
  toggleProjectManager: () => void,
  openShareDialog: () => void,
  onSave: () => Promise<void>,
  canSave: boolean,

  ...PreviewAndShareButtonsProps,
|};

export type ToolbarInterface = {|
  setEditorToolbar: (React.Node | null) => void,
|};

type LeftButtonsToolbarGroupProps = {|
  toggleProjectManager: () => void,
  onSave: () => Promise<void>,
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
          id="toolbar-save-button"
          onClick={props.onSave}
          tooltip={t`Save project`}
          color="default"
          disabled={!props.canSave}
        >
          <FloppyIcon />
        </IconButton>
      </ToolbarGroup>
    );
  }
);

export default React.forwardRef<MainFrameToolbarProps, ToolbarInterface>(
  function MainframeToolbar(props: MainFrameToolbarProps, ref) {
    const [editorToolbar, setEditorToolbar] = React.useState<?React.Node>(null);
    React.useImperativeHandle(ref, () => ({
      setEditorToolbar,
    }));

    return (
      <Toolbar>
        {props.showProjectButtons ? (
          <>
            <LeftButtonsToolbarGroup
              toggleProjectManager={props.toggleProjectManager}
              onSave={props.onSave}
              canSave={props.canSave}
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
