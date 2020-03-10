// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';

export type PreviewButtonSettings = {|
  isPreviewFirstSceneOverriden: boolean,
  previewFirstSceneName: string,
  useSceneAsPreviewFirstScene: () => void,
  togglePreviewFirstSceneOverride: () => void,
|};

export const emptyPreviewButtonSettings = {
  isPreviewFirstSceneOverriden: null,
  previewFirstSceneName: '',
  useSceneAsPreviewFirstScene: () => {},
  togglePreviewFirstSceneOverride: () => {},
};

type Props = {|
  onPreview: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  showNetworkPreviewButton: boolean,
  showPreviewButton: boolean,
  previewButtonSettings: PreviewButtonSettings,
|};

export default class PreviewButtons extends React.Component<
  Props,
  PreviewButtonSettings
> {
  render() {
    const {
      onPreview,
      onNetworkPreview,
      onOpenDebugger,
      showNetworkPreviewButton,
      showPreviewButton,
    } = this.props;

    const {
      isPreviewFirstSceneOverriden,
      previewFirstSceneName,
      useSceneAsPreviewFirstScene,
      togglePreviewFirstSceneOverride,
    } = this.props.previewButtonSettings;

    return (
      <React.Fragment>
        {showPreviewButton && (
          <ElementWithMenu
            element={
              <ToolbarIcon
                onClick={onPreview}
                src={
                  isPreviewFirstSceneOverriden
                    ? 'res/ribbon_default/previewOverride32.png'
                    : 'res/ribbon_default/preview32.png'
                }
                tooltip={
                  isPreviewFirstSceneOverriden
                    ? t`Preview is overridden, right click for more`
                    : t`Launch a preview of the scene, right click for more`
                }
              />
            }
            openMenuWithSecondaryClick
            buildMenuTemplate={() => {
              if (isPreviewFirstSceneOverriden === null) return [];
              return [
                {
                  type: 'checkbox',
                  label: previewFirstSceneName
                    ? 'Use scene ' + previewFirstSceneName + ' for preview'
                    : 'Use this scene for preview',
                  checked: isPreviewFirstSceneOverriden,
                  click: () => {
                    togglePreviewFirstSceneOverride();
                    if (!previewFirstSceneName) {
                      useSceneAsPreviewFirstScene();
                    }
                  },
                },
                { type: 'separator' },
                {
                  label: 'Always use this scene to start the previews',
                  click: () => useSceneAsPreviewFirstScene(),
                },
              ];
            }}
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
