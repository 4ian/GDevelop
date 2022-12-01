// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import ToolbarIcon from '../../UI/ToolbarIcon';
import TextButton from '../../UI/TextButton';
import ElementWithMenu from '../../UI/Menu/ElementWithMenu';
import { type PreviewState } from '../PreviewState';
import GDevelopThemeContext from '../../UI/Theme/ThemeContext';

export type PreviewAndPublishButtonsProps = {|
  onPreviewWithoutHotReload: () => void,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  onHotReloadPreview: () => void,
  setPreviewOverride: ({|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  canDoNetworkPreview: boolean,
  isPreviewEnabled: boolean,
  hasPreviewsRunning: boolean,
  previewState: PreviewState,
  exportProject: () => void,
  hasProject: boolean,
|};

export default function PreviewAndPublishButtons({
  onPreviewWithoutHotReload,
  onNetworkPreview,
  onOpenDebugger,
  onHotReloadPreview,
  canDoNetworkPreview,
  isPreviewEnabled,
  hasPreviewsRunning,
  previewState,
  setPreviewOverride,
  exportProject,
  hasProject,
}: PreviewAndPublishButtonsProps) {
  const theme = React.useContext(GDevelopThemeContext);
  const debugBuildMenuTemplate = React.useCallback(
    (i18n: I18nType) => [
      {
        label: i18n._(t`Start Network Preview (Preview over WiFi/LAN)`),
        click: onNetworkPreview,
        enabled: canDoNetworkPreview,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Start Preview with Debugger and Performance Profiler`),
        click: onOpenDebugger,
      },
    ],
    [onNetworkPreview, onOpenDebugger, canDoNetworkPreview]
  );
  const previewBuildMenuTemplate = React.useCallback(
    (i18n: I18nType) => [
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
    ],
    [
      onPreviewWithoutHotReload,
      isPreviewEnabled,
      hasPreviewsRunning,
      setPreviewOverride,
      previewState,
    ]
  );

  const onClickPreview = event => {
    if (event.target) event.target.blur();
    onHotReloadPreview();
  };

  return (
    <React.Fragment>
      <ElementWithMenu
        element={
          <ToolbarIcon
            disabled={!isPreviewEnabled}
            src="res/ribbon_default/bug32.png"
            tooltip={t`Advanced preview options (debugger, network preview...)`}
          />
        }
        buildMenuTemplate={debugBuildMenuTemplate}
      />
      <ElementWithMenu
        element={
          <TextButton
            onClick={onClickPreview}
            disabled={!isPreviewEnabled}
            icon={
              <img
                alt="Preview"
                src={
                  hasPreviewsRunning
                    ? 'res/ribbon_default/hotReload64.png'
                    : previewState.isPreviewOverriden
                    ? 'res/ribbon_default/previewOverride32.png'
                    : 'res/ribbon_default/preview64.png'
                }
                width={32}
                height={32}
                style={{
                  filter: !isPreviewEnabled
                    ? 'grayscale(100%)'
                    : theme.gdevelopIconsCSSFilter,
                }}
              />
            }
            label={
              hasPreviewsRunning ? (
                <Trans>Update</Trans>
              ) : (
                <Trans>Preview</Trans>
              )
            }
            id={'toolbar-preview-button'}
            exceptionalTooltipForToolbar={
              hasPreviewsRunning ? (
                <Trans>
                  Apply changes to the running preview, right click for more
                </Trans>
              ) : previewState.isPreviewOverriden ? (
                <Trans>Preview is overridden, right click for more</Trans>
              ) : previewState.previewExternalLayoutName ? (
                <Trans>
                  Launch a preview of the external layout inside the scene,
                  right click for more
                </Trans>
              ) : (
                <Trans>
                  Launch a preview of the scene, right click for more
                </Trans>
              )
            }
          />
        }
        openMenuWithSecondaryClick
        buildMenuTemplate={previewBuildMenuTemplate}
      />
      <TextButton
        onClick={exportProject}
        disabled={!hasProject}
        icon={
          <img
            alt="Publish"
            src={'res/ribbon_default/networkicon32.png'}
            width={32}
            height={32}
            style={{
              filter: !hasProject
                ? 'grayscale(100%)'
                : theme.gdevelopIconsCSSFilter,
            }}
          />
        }
        label={<Trans>Publish</Trans>}
        id={'toolbar-publish-button'}
        exceptionalTooltipForToolbar={
          <Trans>Export the game (Web, Android, iOS...)</Trans>
        }
      />
    </React.Fragment>
  );
}
