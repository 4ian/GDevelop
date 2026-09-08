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
import PreferencesContext from '../../MainFrame/Preferences/PreferencesContext';
import { useIsGameplayTestRunInProgress } from '../../GameplayTests/GameplayTestRunner';
import { type EventsExecutionTrackingMode } from '../../EventsExecutionTracking/EventsExecutionTrackingStore';
import IconButton from '../../UI/IconButton';
import VariableTreeIcon from '../../UI/CustomSvgIcons/VariableTree';

export type PreviewAndShareButtonsProps = {|
  onPreviewWithoutHotReload: (?{ numberOfWindows: number }) => Promise<void>,
  onOpenDebugger: () => void,
  onNetworkPreview: () => void,
  onHotReloadPreview: () => void,
  onNetworkPreview: () => Promise<void>,
  onHotReloadPreview: () => Promise<void>,
  onLaunchPreviewWithDiagnosticReport: () => Promise<void>,
  setPreviewOverride: ({|
    isPreviewOverriden: boolean,
    overridenPreviewLayoutName: ?string,
    overridenPreviewExternalLayoutName: ?string,
  |}) => void,
  canDoNetworkPreview: boolean,
  isPreviewEnabled: boolean,
  hasPreviewsRunning: boolean,
  previewState: PreviewState,
  eventsExecutionTrackingMode: EventsExecutionTrackingMode,
  setEventsExecutionTrackingMode: EventsExecutionTrackingMode => void,
  isWatchedVariablesPanelOpen: boolean,
  onToggleWatchedVariablesPanel: () => void,
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
    canDoNetworkPreview,
    isPreviewEnabled,
    hasPreviewsRunning,
    previewState,
    setPreviewOverride,
    eventsExecutionTrackingMode,
    setEventsExecutionTrackingMode,
    isWatchedVariablesPanelOpen,
    onToggleWatchedVariablesPanel,
    openShareDialog,
    isSharingEnabled,
  }: PreviewAndShareButtonsProps) {
    const preferences = React.useContext(PreferencesContext);
    const { isMobile } = useResponsiveWindowSize();
    // Launching or hot-reloading a preview while a gameplay test runs would
    // interfere with it (the game also ignores these commands as a backstop).
    const isGameplayTestRunInProgress = useIsGameplayTestRunInProgress();

    const previewBuildMenuTemplate = React.useCallback(
      (i18n: I18nType) =>
        [
          {
            label: i18n._(t`Start Network Preview (Preview over WiFi/LAN)`),
            click: onNetworkPreview,
            enabled: canDoNetworkPreview && !isGameplayTestRunInProgress,
          },
          {
            label: i18n._(t`Start Preview and Debugger`),
            click: onOpenDebugger,
            enabled: !isGameplayTestRunInProgress,
          },
          preferences.values.openDiagnosticReportAutomatically
            ? null
            : {
                label: i18n._(t`Start preview with diagnostic report`),
                click: async () => {
                  await onLaunchPreviewWithDiagnosticReport();
                },
                enabled: !hasPreviewsRunning && !isGameplayTestRunInProgress,
              },
          {
            label: i18n._(t`Launch preview in...`),
            submenu: [
              {
                label: i18n._(t`A new window`),
                click: async () => {
                  await onPreviewWithoutHotReload({ numberOfWindows: 1 });
                },
                enabled: isPreviewEnabled && !isGameplayTestRunInProgress,
              },
              {
                label: i18n._(t`2 previews in 2 windows`),
                click: async () => {
                  await onPreviewWithoutHotReload({ numberOfWindows: 2 });
                },
                enabled: isPreviewEnabled && !isGameplayTestRunInProgress,
              },
              {
                label: i18n._(t`3 previews in 3 windows`),
                click: async () => {
                  onPreviewWithoutHotReload({ numberOfWindows: 3 });
                },
                enabled: isPreviewEnabled && !isGameplayTestRunInProgress,
              },
              {
                label: i18n._(t`4 previews in 4 windows`),
                click: async () => {
                  onPreviewWithoutHotReload({ numberOfWindows: 4 });
                },
                enabled: isPreviewEnabled && !isGameplayTestRunInProgress,
              },
            ],
          },
          {
            // Highlight, in the events sheets, the instructions executed by
            // the previews (which can be slowed down to follow them).
            label: i18n._(t`Follow execution`),
            submenu: [
              {
                type: 'checkbox',
                label: i18n._(t`Disabled`),
                checked: eventsExecutionTrackingMode === 'off',
                click: () => setEventsExecutionTrackingMode('off'),
              },
              {
                type: 'checkbox',
                label: i18n._(t`Normal speed`),
                checked: eventsExecutionTrackingMode === 'normal-speed',
                click: () => setEventsExecutionTrackingMode('normal-speed'),
              },
              {
                type: 'checkbox',
                label: i18n._(t`x0.1 speed`),
                checked: eventsExecutionTrackingMode === 'slow-speed',
                click: () => setEventsExecutionTrackingMode('slow-speed'),
              },
            ],
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
        ].filter(Boolean),
      [
        onNetworkPreview,
        canDoNetworkPreview,
        onOpenDebugger,
        onPreviewWithoutHotReload,
        isPreviewEnabled,
        hasPreviewsRunning,
        isGameplayTestRunInProgress,
        preferences.values.openDiagnosticReportAutomatically,
        onLaunchPreviewWithDiagnosticReport,
        previewState.overridenPreviewLayoutName,
        previewState.overridenPreviewExternalLayoutName,
        previewState.isPreviewOverriden,
        previewState.previewExternalLayoutName,
        previewState.previewLayoutName,
        setPreviewOverride,
        eventsExecutionTrackingMode,
        setEventsExecutionTrackingMode,
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
          onClick={
            hasPreviewsRunning ? onHotReloadPreview : onPreviewWithoutHotReload
          }
          disabled={!isPreviewEnabled || isGameplayTestRunInProgress}
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
        <IconButton
          size="small"
          color="default"
          selected={isWatchedVariablesPanelOpen}
          onClick={onToggleWatchedVariablesPanel}
          tooltip={t`Watch variables of the running preview`}
          id="toolbar-watched-variables-button"
        >
          <VariableTreeIcon />
        </IconButton>
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
