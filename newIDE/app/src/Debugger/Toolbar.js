// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import PauseIcon from '../UI/CustomSvgIcons/Pause';
import RecordIcon from '../UI/CustomSvgIcons/Record';
import StopIcon from '../UI/CustomSvgIcons/Stop';
import SkipForwardIcon from '../UI/CustomSvgIcons/SkipForward';
import VariableTreeIcon from '../UI/CustomSvgIcons/VariableTree';
import {
  type DebuggerPlaySpeed,
  type LaunchDebuggerAndPreviewOptions,
} from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import IconButton from '../UI/IconButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import { RecordingStatusChip } from './RecordingControls';
import { useIsGameplayTestRunInProgress } from '../GameplayTests/GameplayTestRunner';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';
import { DEBUGGER_PANELS, type DebuggerPanelName } from './DebuggerPanels';

type Props = {|
  // The game.
  hasDebugger: boolean,
  onLaunchDebuggerAndPreview: (?LaunchDebuggerAndPreviewOptions) => void,
  onClosePreviews: () => void,
  canStepFrame: boolean,
  onStepFrame: () => void,
  isWatchedVariablesPanelOpen: boolean,
  onToggleWatchedVariablesPanel: () => void,
  debuggerPlaySpeed: DebuggerPlaySpeed,
  setDebuggerPlaySpeed: DebuggerPlaySpeed => void,
  onPlay: () => void,
  canPlay: boolean,
  onPause: () => void,
  canPause: boolean,
  canClear: boolean,
  onClear: () => void,
  canRestart: boolean,
  onRestart: () => void,
  shouldRecordOnLaunch: boolean,
  onToggleRecordOnLaunch: () => void,
  shouldClearOnRecord: boolean,
  onToggleClearOnRecord: () => void,
  // The recording.
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  profilingInProgress: boolean,
  canRecord: boolean,
  onStartRecording: () => void,
  onStopRecording: () => void,
  // The recorded data, kept outside of the project: exported to a file the
  // user stores where they want, and read back from it.
  canExportRecording: boolean,
  onExportRecording: () => void,
  onImportRecording: () => void,
  canCompareToBaseline: boolean,
  isBaseline: boolean,
  onToggleBaseline: () => void,
  // The panels.
  canOpenPanels: boolean,
  shownPanelNames: Array<DebuggerPanelName>,
  onTogglePanel: DebuggerPanelName => void,
|};

/**
 * The toolbar of the debugger, in four groups: the status of the recording,
 * the controls of the game, the recording, and the panels.
 */
export class ToolbarContent extends React.PureComponent<{|
  ...Props,
  isGameplayTestRunInProgress: boolean,
|}> {
  render(): any {
    const {
      isGameplayTestRunInProgress,
      hasDebugger,
      onLaunchDebuggerAndPreview,
      onClosePreviews,
      canStepFrame,
      onStepFrame,
      isWatchedVariablesPanelOpen,
      onToggleWatchedVariablesPanel,
      debuggerPlaySpeed,
      setDebuggerPlaySpeed,
      onPlay,
      onPause,
      canPlay,
      canPause,
      canClear,
      onClear,
      canRestart,
      onRestart,
      shouldRecordOnLaunch,
      onToggleRecordOnLaunch,
      shouldClearOnRecord,
      onToggleClearOnRecord,
      recordingStore,
      debuggerId,
      profilingInProgress,
      canRecord,
      onStartRecording,
      onStopRecording,
      canExportRecording,
      onExportRecording,
      onImportRecording,
      canCompareToBaseline,
      isBaseline,
      onToggleBaseline,
      canOpenPanels,
      shownPanelNames,
      onTogglePanel,
    } = this.props;

    // The menu of the main button: the speed the game plays at while debugged
    // and, once it runs, what can be done to it (restart, kill).
    const gameMenuTemplate = (i18n: I18nType): Array<MenuItemTemplate> => [
      {
        type: 'checkbox',
        label: i18n._(t`Run at normal speed`),
        checked: debuggerPlaySpeed === 'normal',
        click: () => setDebuggerPlaySpeed('normal'),
      },
      {
        type: 'checkbox',
        label: i18n._(t`Run at 0.1x speed`),
        checked: debuggerPlaySpeed === 'slow',
        click: () => setDebuggerPlaySpeed('slow'),
      },
      { type: 'separator' },
      {
        type: 'checkbox',
        label: i18n._(t`Start recording when the game launches or restarts`),
        checked: shouldRecordOnLaunch,
        click: onToggleRecordOnLaunch,
      },
      ...(hasDebugger
        ? [
            { type: 'separator' },
            {
              label: i18n._(t`Restart the game`),
              click: onRestart,
              enabled: canRestart,
            },
            {
              label: i18n._(t`Kill the game`),
              click: onClosePreviews,
            },
          ]
        : []),
      // A closed game whose recording is kept: its record button is disabled,
      // and its menu with it, so clearing is offered here.
      ...(!hasDebugger && canClear
        ? [
            { type: 'separator' },
            {
              label: i18n._(t`Clear the recorded data`),
              click: onClear,
            },
          ]
        : []),
      // Importing lives here rather than in the record menu: that one is
      // disabled while no game runs, which is exactly when a recording taken
      // weeks ago is opened.
      { type: 'separator' },
      {
        label: i18n._(t`Import a recording…`),
        click: onImportRecording,
      },
    ];

    const recordMenuTemplate = (i18n: I18nType): Array<MenuItemTemplate> => [
      {
        type: 'checkbox',
        label: i18n._(t`Clear the recorded data when recording again`),
        checked: shouldClearOnRecord,
        click: onToggleClearOnRecord,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Export the recorded data…`),
        click: onExportRecording,
        enabled: canExportRecording,
      },
      {
        type: 'checkbox',
        label: i18n._(t`Compare the other recordings to this one`),
        checked: isBaseline,
        click: onToggleBaseline,
        enabled: canCompareToBaseline,
      },
      { type: 'separator' },
      {
        label: i18n._(t`Clear the recorded data`),
        click: onClear,
        enabled: canClear,
      },
    ];

    return (
      <React.Fragment>
        <ToolbarGroup firstChild>
          <RecordingStatusChip
            recordingStore={recordingStore}
            debuggerId={debuggerId}
            profilingInProgress={profilingInProgress}
          />
        </ToolbarGroup>
        <ToolbarGroup>
          {!hasDebugger ? (
            <RaisedButtonWithSplitMenu
              primary
              onClick={() => onLaunchDebuggerAndPreview()}
              icon={<PlayIcon />}
              label={<Trans>Debugger</Trans>}
              disabled={isGameplayTestRunInProgress}
              buildMenuTemplate={gameMenuTemplate}
            />
          ) : canPause ? (
            <FlatButtonWithSplitMenu
              primary
              onClick={onPause}
              icon={<PauseIcon />}
              label={<Trans>Pause the game</Trans>}
              disabled={isGameplayTestRunInProgress}
              buildMenuTemplate={gameMenuTemplate}
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onPlay}
              icon={<PlayIcon />}
              label={<Trans>Resume the game</Trans>}
              disabled={!canPlay || isGameplayTestRunInProgress}
              buildMenuTemplate={gameMenuTemplate}
            />
          )}
          <IconButton
            size="small"
            color="default"
            onClick={onStepFrame}
            disabled={!canStepFrame || isGameplayTestRunInProgress}
            tooltip={t`Advance one frame`}
          >
            <SkipForwardIcon />
          </IconButton>
          <ToolbarSeparator />
          {profilingInProgress ? (
            <FlatButtonWithSplitMenu
              primary
              onClick={onStopRecording}
              disabled={!canRecord || isGameplayTestRunInProgress}
              icon={<StopIcon />}
              label={<Trans>Stop recording</Trans>}
              buildMenuTemplate={recordMenuTemplate}
              id="debugger-record-button"
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onStartRecording}
              disabled={!canRecord || isGameplayTestRunInProgress}
              icon={<RecordIcon />}
              label={<Trans>Record</Trans>}
              buildMenuTemplate={recordMenuTemplate}
              id="debugger-record-button"
            />
          )}
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleWatchedVariablesPanel}
            selected={isWatchedVariablesPanelOpen}
            tooltip={t`Watch variables`}
          >
            <VariableTreeIcon />
          </IconButton>
          <ToolbarSeparator />
          {DEBUGGER_PANELS.map(({ name, icon: PanelIcon, title }) => (
            <IconButton
              key={name}
              size="small"
              color="default"
              onClick={() => onTogglePanel(name)}
              disabled={!canOpenPanels}
              selected={shownPanelNames.includes(name)}
              tooltip={title}
            >
              <PanelIcon />
            </IconButton>
          ))}
        </ToolbarGroup>
      </React.Fragment>
    );
  }
}

/**
 * While a gameplay test runs, the game belongs to the test: pausing it,
 * stepping it, recording it or launching another preview would all interfere
 * with the run, exactly as the preview buttons do.
 */
export const Toolbar = (props: Props): React.Node => (
  <ToolbarContent
    {...props}
    isGameplayTestRunInProgress={useIsGameplayTestRunInProgress()}
  />
);

export default Toolbar;
