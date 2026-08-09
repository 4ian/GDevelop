// @flow
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import { LineStackLayout } from '../../UI/Layout';
import { type PreviewState } from '../PreviewState';
import PreviewIcon from '../../UI/CustomSvgIcons/Preview';
import UpdateIcon from '../../UI/CustomSvgIcons/Update';
import FlatButtonWithSplitMenu from '../../UI/FlatButtonWithSplitMenu';
import { useResponsiveWindowSize } from '../../UI/Responsive/ResponsiveWindowMeasurer';
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { blurActiveElementBeforeUiTransition } from '../../UI/MaterialUISpecificUtil';

export type PreviewAndShareButtonsProps = {|
  onPreviewWithoutHotReload: (
    ?{|
      numberOfWindows?: number,
      forceAlwaysOnTopInPreview?: boolean,
    |}
  ) => Promise<void>,
  onOpenDebugger: () => void | Promise<boolean>,
  onNetworkPreview: () => void,
  onHotReloadPreview: () => void,
  onNetworkPreview: () => Promise<void>,
  onHotReloadPreview: () => Promise<void>,
  onLaunchPreviewWithDiagnosticReport: () => Promise<void>,
  displayCollisionShapesInPreview: boolean,
  setDisplayCollisionShapesInPreview: boolean => void,
  displaySignalAnimationsInPreview: boolean,
  setDisplaySignalAnimationsInPreview: boolean => void,
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

const PreviewAndShareButtons: React.ComponentType<PreviewAndShareButtonsProps> = React.memo<PreviewAndShareButtonsProps>(
  function PreviewAndShareButtons({
    onPreviewWithoutHotReload,
    onNetworkPreview,
    onOpenDebugger,
    onHotReloadPreview,
    onLaunchPreviewWithDiagnosticReport,
    displayCollisionShapesInPreview,
    setDisplayCollisionShapesInPreview,
    displaySignalAnimationsInPreview,
    setDisplaySignalAnimationsInPreview,
    canDoNetworkPreview,
    isPreviewEnabled,
    hasPreviewsRunning,
    previewState,
    setPreviewOverride,
    openShareDialog,
    isSharingEnabled,
  }: PreviewAndShareButtonsProps) {
    const preferences = React.useContext(PreferencesContext);
    const { isMobile } = useResponsiveWindowSize();

    const previewBuildMenuTemplate = React.useCallback(
      (i18n: I18nType) =>
        [
          {
            label: i18n._(t`Start Local Preview`),
            click: onNetworkPreview,
            enabled: canDoNetworkPreview,
          },
          preferences.values.openDiagnosticReportAutomatically
            ? null
            : {
                label: i18n._(t`Start preview with diagnostic report`),
                click: async () => {
                  await onLaunchPreviewWithDiagnosticReport();
                },
                enabled: !hasPreviewsRunning,
              },
          {
            label: i18n._(t`Launch preview in...`),
            submenu: [
              {
                label: i18n._(t`A new window`),
                click: async () => {
                  await onPreviewWithoutHotReload({ numberOfWindows: 1 });
                },
                enabled: isPreviewEnabled,
              },
              {
                label: i18n._(t`2 previews in 2 windows`),
                click: async () => {
                  await onPreviewWithoutHotReload({ numberOfWindows: 2 });
                },
                enabled: isPreviewEnabled,
              },
              {
                label: i18n._(t`3 previews in 3 windows`),
                click: async () => {
                  onPreviewWithoutHotReload({ numberOfWindows: 3 });
                },
                enabled: isPreviewEnabled,
              },
              {
                label: i18n._(t`4 previews in 4 windows`),
                click: async () => {
                  onPreviewWithoutHotReload({ numberOfWindows: 4 });
                },
                enabled: isPreviewEnabled,
              },
            ],
          },
          {
            type: 'checkbox',
            label: i18n._(t`Display collision shapes`),
            checked: displayCollisionShapesInPreview,
            click: () =>
              setDisplayCollisionShapesInPreview(
                !displayCollisionShapesInPreview
              ),
          },
          {
            type: 'checkbox',
            label: i18n._(t`Display Signal Animations`),
            checked: displaySignalAnimationsInPreview,
            click: () =>
              setDisplaySignalAnimationsInPreview(
                !displaySignalAnimationsInPreview
              ),
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
          { type: 'separator' },
          {
            label: i18n._(t`Export & Share`),
            click: openShareDialog,
            enabled: isSharingEnabled,
          },
        ].filter(Boolean),
      [
        onNetworkPreview,
        canDoNetworkPreview,
        onPreviewWithoutHotReload,
        isPreviewEnabled,
        hasPreviewsRunning,
        preferences.values.openDiagnosticReportAutomatically,
        onLaunchPreviewWithDiagnosticReport,
        displayCollisionShapesInPreview,
        setDisplayCollisionShapesInPreview,
        displaySignalAnimationsInPreview,
        setDisplaySignalAnimationsInPreview,
        previewState.overridenPreviewLayoutName,
        previewState.overridenPreviewExternalLayoutName,
        previewState.isPreviewOverriden,
        previewState.previewExternalLayoutName,
        previewState.previewLayoutName,
        setPreviewOverride,
        openShareDialog,
        isSharingEnabled,
      ]
    );

    const onPreviewButtonClick = React.useCallback(
      async () => {
        blurActiveElementBeforeUiTransition();

        if (hasPreviewsRunning) {
          await onHotReloadPreview();
          return;
        }

        await onOpenDebugger();
      },
      [hasPreviewsRunning, onHotReloadPreview, onOpenDebugger]
    );

    return (
      <LineStackLayout noMargin>
        <FlatButtonWithSplitMenu
          primary
          onClick={onPreviewButtonClick}
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
          splitMenuButtonId="toolbar-preview-split-menu-button"
          // $FlowFixMe[incompatible-type]
          buildMenuTemplate={previewBuildMenuTemplate}
        />
      </LineStackLayout>
    );
  }
);

export default PreviewAndShareButtons;
