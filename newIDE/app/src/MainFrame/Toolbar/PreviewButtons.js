// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { type PreviewState } from '../PreviewState';

export type PreviewButtonsProps = {|
  onPreviewWithoutHotReload: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  onHotReloadPreview: () => void,
  setPreviewOverride: ({|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  showNetworkPreviewButton: boolean,
  isPreviewEnabled: boolean,
  hasPreviewsRunning: boolean,
  previewState: PreviewState,
|};

export default function PreviewButtons({
  onPreviewWithoutHotReload,
  onNetworkPreview,
  onOpenDebugger,
  onHotReloadPreview,
  showNetworkPreviewButton,
  isPreviewEnabled,
  hasPreviewsRunning,
  previewState,
  setPreviewOverride,
}: PreviewButtonsProps) {
  const previewIcon = (
    <ToolbarIcon
      onClick={onHotReloadPreview}
      disabled={!isPreviewEnabled}
      src={
        hasPreviewsRunning
          ? 'res/ribbon_default/hotReload64.png'
          : previewState.isPreviewOverriden
          ? 'res/ribbon_default/previewOverride32.png'
          : 'res/ribbon_default/preview64.png'
      }
      tooltip={
        hasPreviewsRunning
          ? t`Apply changes to the running preview, right click for more`
          : previewState.isPreviewOverriden
          ? t`Preview is overridden, right click for more`
          : previewState.previewExternalLayoutName
          ? t`Launch a preview of the external layout inside the scene, right click for more`
          : t`Launch a preview of the scene, right click for more`
      }
    />
  );

  return (
    <React.Fragment>
      <ElementWithMenu
        element={previewIcon}
        openMenuWithSecondaryClick
        buildMenuTemplate={(i18n: I18nType) => [
          {
            label: i18n._(t`Launch another preview in a new window`),
            click: onPreviewWithoutHotReload,
            enabled: isPreviewEnabled && hasPreviewsRunning,
          },
          { type: 'separator' },
          ...(previewState.overridenPreviewLayoutName
            ? [
                {
                  type: 'checkbox',
                  label: previewState.overridenPreviewExternalLayoutName
                    ? i18n._(
                        t`Start all previews from external layout ${
                          previewState.overridenPreviewExternalLayoutName
                        }`
                      )
                    : i18n._(
                        t`Start all previews from scene ${
                          previewState.overridenPreviewLayoutName
                        }`
                      ),
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
              ? i18n._(
                  t`Use this external layout inside this scene to start all previews`
                )
              : i18n._(t`Use this scene to start all previews`),
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
          buildMenuTemplate={(i18n: I18nType) => [
            {
              label: i18n._(t`Start Network Preview (Preview over WiFi/LAN)`),
              click: () => onNetworkPreview(),
            },
            { type: 'separator' },
            {
              label: i18n._(
                t`Start Preview with Debugger and Performance Profiler`
              ),
              click: () => onOpenDebugger(),
            },
          ]}
        />
      )}
    </React.Fragment>
  );
}
