// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { LineStackLayout } from '../../UI/Layout';
import { type PreviewState } from '../PreviewState';
import PreviewIcon from '../../UI/CustomSvgIcons/Preview';
import UpdateIcon from '../../UI/CustomSvgIcons/Update';
import PublishIcon from '../../UI/CustomSvgIcons/Publish';
import FlatButtonWithSplitMenu from '../../UI/FlatButtonWithSplitMenu';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import ResponsiveRaisedButton from '../../UI/ResponsiveRaisedButton';

export type PreviewAndShareButtonsProps = {|
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
  openShareDialog: () => void,
  isSharingEnabled: boolean,
|};

const PreviewAndShareButtons = React.memo<PreviewAndShareButtonsProps>(
  function PreviewAndShareButtons({
    onPreviewWithoutHotReload,
    onNetworkPreview,
    onOpenDebugger,
    onHotReloadPreview,
    canDoNetworkPreview,
    isPreviewEnabled,
    hasPreviewsRunning,
    previewState,
    setPreviewOverride,
    openShareDialog,
    isSharingEnabled,
  }: PreviewAndShareButtonsProps) {
    const { isMobile } = useResponsiveWindowSize();

    const previewBuildMenuTemplate = React.useCallback(
      (i18n: I18nType) => [
        {
          label: i18n._(t`Start Network Preview (Preview over WiFi/LAN)`),
          click: onNetworkPreview,
          enabled: canDoNetworkPreview,
        },
        {
          label: i18n._(t`Start Preview and Debugger`),
          click: onOpenDebugger,
        },
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
        onNetworkPreview,
        onOpenDebugger,
        canDoNetworkPreview,
      ]
    );

    // Create a separate function to avoid the button passing its event as
    // the first argument.
    const onShareClick = React.useCallback(
      () => {
        openShareDialog();
      },
      [openShareDialog]
    );

    return (
      <LineStackLayout noMargin>
        <FlatButtonWithSplitMenu
          primary
          onClick={onHotReloadPreview}
          disabled={!isPreviewEnabled}
          icon={hasPreviewsRunning ? <UpdateIcon /> : <PreviewIcon />}
          label={
            !isMobile ? (
              hasPreviewsRunning ? (
                <Trans>Update</Trans>
              ) : (
                <Trans>Preview</Trans>
              )
            ) : null
          }
          id="toolbar-preview-button"
          buildMenuTemplate={previewBuildMenuTemplate}
        />
        <ResponsiveRaisedButton
          primary
          onClick={onShareClick}
          disabled={!isSharingEnabled}
          icon={<PublishIcon />}
          label={<Trans>Share</Trans>}
          // This ID is used for guided lessons, let's keep it stable.
          id="toolbar-publish-button"
        />
      </LineStackLayout>
    );
  }
);

export default PreviewAndShareButtons;
