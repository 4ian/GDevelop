// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';

export type PreviewButtonSettings = {|
  isPreviewFirstSceneOverriden: boolean,
  previewFirstSceneName: string,
  useSceneAsPreviewFirstScene: ?() => void,
  togglePreviewFirstSceneOverride: ?() => void,
|};

export const emptyPreviewButtonSettings: PreviewButtonSettings = {
  isPreviewFirstSceneOverriden: false,
  previewFirstSceneName: '',
  useSceneAsPreviewFirstScene: null,
  togglePreviewFirstSceneOverride: null,
};

type Props = {|
  onPreview: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  showNetworkPreviewButton: boolean,
  showPreviewButton: boolean,
  previewButtonSettings: PreviewButtonSettings,
|};

export default function PreviewButtons({
  onPreview,
  onNetworkPreview,
  onOpenDebugger,
  showNetworkPreviewButton,
  showPreviewButton,
  previewButtonSettings,
}: Props) {
  const {
    isPreviewFirstSceneOverriden,
    previewFirstSceneName,
    useSceneAsPreviewFirstScene,
    togglePreviewFirstSceneOverride,
  } = previewButtonSettings;

  const canOverridePreviewFirstScene =
    useSceneAsPreviewFirstScene && togglePreviewFirstSceneOverride;
  const previewIcon = (
    <ToolbarIcon
      onClick={onPreview}
      src={
        isPreviewFirstSceneOverriden
          ? 'res/ribbon_default/previewOverride32.png'
          : 'res/ribbon_default/preview32.png'
      }
      tooltip={
        !canOverridePreviewFirstScene
          ? t`Launch a preview of the scene`
          : isPreviewFirstSceneOverriden
          ? t`Preview is overridden, right click for more`
          : t`Launch a preview of the scene, right click for more`
      }
    />
  );

  return (
    <React.Fragment>
      {showPreviewButton &&
        (!canOverridePreviewFirstScene ? (
          previewIcon
        ) : (
          <ElementWithMenu
            element={previewIcon}
            openMenuWithSecondaryClick
            buildMenuTemplate={() => [
              ...(previewFirstSceneName
                ? [
                    {
                      type: 'checkbox',
                      label:
                        'Start all previews from scene ' +
                        previewFirstSceneName,
                      checked: isPreviewFirstSceneOverriden,
                      click: togglePreviewFirstSceneOverride,
                    },
                    { type: 'separator' },
                  ]
                : []),
              {
                label: 'Use this scene to start all previews',
                click: useSceneAsPreviewFirstScene,
              },
            ]}
          />
        ))}
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
