// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { type PreviewState } from '../PreviewState.flow';

export type PreviewButtonsProps = {|
  onPreview: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  setPreviewOverride: ({|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  showNetworkPreviewButton: boolean,
  isPreviewEnabled: boolean,
  previewState: PreviewState,
|};

export default function PreviewButtons({
  onPreview,
  onNetworkPreview,
  onOpenDebugger,
  showNetworkPreviewButton,
  isPreviewEnabled,
  previewState,
  setPreviewOverride,
}: PreviewButtonsProps) {
  const previewIcon = (
    <ToolbarIcon
      onClick={onPreview}
      disabled={!isPreviewEnabled}
      src={
        previewState.isPreviewOverriden
          ? 'res/ribbon_default/previewOverride32.png'
          : 'res/ribbon_default/preview32.png'
      }
      tooltip={
        previewState.isPreviewOverriden
          ? t`Preview is overridden, right click for more`
          : previewState.previewExternalLayoutName
          ? t`Launch a preview of the external layout inside the scene, right click for more`
          : t`Launch a preview of the scene, right click for more`
      }
    />
  );

  // TOOD: i18n
  return (
    <React.Fragment>
      <ElementWithMenu
        element={previewIcon}
        openMenuWithSecondaryClick
        buildMenuTemplate={() => [
          ...(previewState.overridenPreviewLayoutName
            ? [
                {
                  type: 'checkbox',
                  label: previewState.overridenPreviewExternalLayoutName
                    ? 'Start all previews from external layout ' +
                      previewState.overridenPreviewExternalLayoutName
                    : 'Start all previews from scene ' +
                      previewState.overridenPreviewLayoutName,
                  checked: previewState.isPreviewOverriden,
                  click: () =>
                    setPreviewOverride({
                      isPreviewOverriden: !previewState.isPreviewOverriden,
                      overridenPreviewLayoutName:
                        previewState.overridenPreviewLayoutName,
                      overridenPreviewExternalLayoutName:
                        previewState.overridenPreviewExternalLayoutName,
                    }),
                },
                { type: 'separator' },
              ]
            : []),
          {
            label: previewState.previewExternalLayoutName
              ? 'Use this external layout inside this scene to start all previews'
              : 'Use this scene to start all previews',
            click: () =>
              setPreviewOverride({
                isPreviewOverriden: true,
                overridenPreviewLayoutName: previewState.previewLayoutName,
                overridenPreviewExternalLayoutName:
                  previewState.previewExternalLayoutName,
              }),
            enabled:
              previewState.previewLayoutName !==
                previewState.overridenPreviewLayoutName ||
              previewState.previewExternalLayoutName !==
                previewState.overridenPreviewExternalLayoutName,
          },
        ]}
      />
      {showNetworkPreviewButton && (
        <ElementWithMenu
          element={
            <ToolbarIcon
              disabled={!isPreviewEnabled}
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
