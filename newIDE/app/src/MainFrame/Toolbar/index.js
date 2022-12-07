// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import PreviewAndPublishButtons, {
  type PreviewAndPublishButtonsProps,
} from './PreviewAndPublishButtons';
import ProjectManagerIcon from '../../UI/CustomSvgIcons/ProjectManager';
import IconButton from '../../UI/IconButton';

export type MainFrameToolbarProps = {|
  showProjectButtons: boolean,
  toggleProjectManager: () => void,
  exportProject: () => void,

  ...PreviewAndPublishButtonsProps,
|};

export type ToolbarInterface = {|
  setEditorToolbar: (React.Node | null) => void,
|};

export default React.forwardRef<MainFrameToolbarProps, ToolbarInterface>(
  function MainframeToolbar(props: MainFrameToolbarProps, ref) {
    const [
      editorToolbarNode,
      setEditorToolbarNode,
    ] = React.useState<React.Node | null>(null);
    const setEditorToolbar = React.useCallback(
      (editorToolbarNode: React.Node | null) => {
        setEditorToolbarNode(editorToolbarNode);
      },
      []
    );
    React.useImperativeHandle(ref, () => ({
      setEditorToolbar,
    }));

    return (
      <Toolbar>
        {props.showProjectButtons ? (
          <>
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
            </ToolbarGroup>
            <ToolbarGroup>
              <PreviewAndPublishButtons
                onPreviewWithoutHotReload={props.onPreviewWithoutHotReload}
                onOpenDebugger={props.onOpenDebugger}
                onNetworkPreview={props.onNetworkPreview}
                onHotReloadPreview={props.onHotReloadPreview}
                setPreviewOverride={props.setPreviewOverride}
                canDoNetworkPreview={props.canDoNetworkPreview}
                isPreviewEnabled={props.isPreviewEnabled}
                previewState={props.previewState}
                hasPreviewsRunning={props.hasPreviewsRunning}
                exportProject={props.exportProject}
              />
            </ToolbarGroup>
          </>
        ) : null}
        {editorToolbarNode || <ToolbarGroup />}
      </Toolbar>
    );
  }
);
