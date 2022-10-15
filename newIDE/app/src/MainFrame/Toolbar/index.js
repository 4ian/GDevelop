// @flow
import { t } from '@lingui/macro';
import * as React from 'react';
import { Toolbar, ToolbarGroup } from '../../UI/Toolbar';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ToolbarSeparator from '../../UI/ToolbarSeparator';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import Window from '../../Utils/Window';
import PreviewAndPublishButtons, {
  type PreviewAndPublishButtonsProps,
} from './PreviewAndPublishButtons';

export type MainFrameToolbarProps = {|
  showProjectIcons: boolean,
  hasProject: boolean,
  toggleProjectManager: () => void,
  requestUpdate: ?() => void,
  simulateUpdateDownloaded: ?() => void,
  simulateUpdateAvailable: ?() => void,
  exportProject: () => void,
  ...PreviewAndPublishButtonsProps,
|};

export type ToolbarInterface = {|
  setEditorToolbar: any => void,
|};

export default React.forwardRef<MainFrameToolbarProps, ToolbarInterface>(
  function MainframeToolbar(props: MainFrameToolbarProps, ref) {
    const isDev = Window.isDev();

    const [editorToolbar, setEditorToolbar] = React.useState<?any>(null);
    React.useImperativeHandle(ref, () => ({
      setEditorToolbar,
    }));

    return (
      <Toolbar>
        <ToolbarGroup firstChild>
          {props.showProjectIcons && (
            <ToolbarIcon
              onClick={props.toggleProjectManager}
              src="res/ribbon_default/projectManager32.png"
              disabled={!props.hasProject}
              tooltip={t`Project manager`}
            />
          )}
          {isDev && props.showProjectIcons && <ToolbarSeparator />}
          {isDev && (
            <ElementWithMenu
              element={<ToolbarIcon src="res/ribbon_default/bug32.png" />}
              buildMenuTemplate={() => [
                {
                  label: 'Simulate update downloaded',
                  disabled: !props.simulateUpdateDownloaded,
                  click: () => {
                    props.simulateUpdateDownloaded &&
                      props.simulateUpdateDownloaded();
                  },
                },
                {
                  label: 'Simulate update available',
                  disabled: !props.simulateUpdateAvailable,
                  click: () => {
                    props.simulateUpdateAvailable &&
                      props.simulateUpdateAvailable();
                  },
                },
              ]}
            />
          )}
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
            hasProject={props.hasProject}
          />
        </ToolbarGroup>
        {editorToolbar || <ToolbarGroup />}
      </Toolbar>
    );
  }
);
