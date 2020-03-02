// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';

type Props = {|
  onPreview: () => void,
  isPreviewOverride: boolean,
  previewFirstSceneName: string,
  setScenePreview: () => void,
  togglePreviewOverride: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  showNetworkPreviewButton: boolean,
  showPreviewButton: boolean,
|};

export default class PreviewButtons extends React.Component<Props> {
  render() {
    const {
      onPreview,
      isPreviewOverride,
      previewFirstSceneName,
      setScenePreview,
      togglePreviewOverride,
      onNetworkPreview,
      onOpenDebugger,
      showNetworkPreviewButton,
      showPreviewButton,
    } = this.props;

    return (
      <React.Fragment>
        {showPreviewButton && (
          <ElementWithMenu
            element={
              <ToolbarIcon
                onClick={onPreview}
                src={
                  isPreviewOverride
                    ? 'res/ribbon_default/previewOverride32.png'
                    : 'res/ribbon_default/preview32.png'
                }
                tooltip={
                  isPreviewOverride
                    ? t`Preview is overridden, right click for more`
                    : t`Launch a preview of the scene, right click for more`
                }
              />
            }
            openMenuWithSecondaryClick
            buildMenuTemplate={() => [
              {
                type: 'checkbox',
                label: previewFirstSceneName
                  ? 'Use scene ' + previewFirstSceneName + ' for preview'
                  : 'Use this scene for preview',
                checked: isPreviewOverride,
                click: () => {
                  if (!previewFirstSceneName) {
                    setScenePreview();
                  }
                  togglePreviewOverride();
                },
              },
              { type: 'separator' },
              {
                label: 'Always use this scene to start the previews',
                click: () => setScenePreview(),
              },
            ]}
          />
        )}
        {showNetworkPreviewButton && (
          <ElementWithMenu
            element={
              <ToolbarIcon
                src="res/ribbon_default/bug32.png"
                tooltip={t`Advanced preview options (debugger, network preview...)`}
              />
            }
            buildMenuTemplate={() => [
              {
                label: 'Network preview (Preview over WiFi/LAN)',
                click: () => onNetworkPreview(),
              },
              { type: 'separator' },
              {
                label: 'Preview with debugger and performance profiler',
                click: () => onOpenDebugger(),
              },
            ]}
          />
        )}
      </React.Fragment>
    );
  }
}
