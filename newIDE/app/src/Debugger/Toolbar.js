// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ProfilerIcon from '../UI/CustomSvgIcons/Profiler';
import InspectorIcon from '../UI/CustomSvgIcons/Debug';
import ConsoleIcon from '../UI/CustomSvgIcons/Console';
import GraphsIcon from '../UI/CustomSvgIcons/Graphs';
import ProjectResourcesIcon from '../UI/CustomSvgIcons/ProjectResources';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import PauseIcon from '../UI/CustomSvgIcons/Pause';
import RecordIcon from '../UI/CustomSvgIcons/Record';
import StopIcon from '../UI/CustomSvgIcons/Stop';
import SkipForwardIcon from '../UI/CustomSvgIcons/SkipForward';
import VariableTreeIcon from '../UI/CustomSvgIcons/VariableTree';
import { type EventsExecutionTrackingMode } from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import TrashIcon from '../UI/CustomSvgIcons/Trash';
import RestoreIcon from '../UI/CustomSvgIcons/Restore';
import IconButton from '../UI/IconButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import ResponsiveRaisedButton from '../UI/ResponsiveRaisedButton';
import { RecordingStatusChip } from './RecordingControls';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';

const styles = {
  // Drawn on a 16px grid without any margin: slightly smaller than the others.
  restoreIcon: { fontSize: 23 },
};

type Props = {|
  // The game.
  hasDebugger: boolean,
  onLaunchDebuggerAndPreview: () => void,
  onClosePreviews: () => void,
  canStepFrame: boolean,
  onStepFrame: () => void,
  isWatchedVariablesPanelOpen: boolean,
  onToggleWatchedVariablesPanel: () => void,
  eventsExecutionTrackingMode: EventsExecutionTrackingMode,
  setEventsExecutionTrackingMode: EventsExecutionTrackingMode => void,
  onPlay: () => void,
  canPlay: boolean,
  onPause: () => void,
  canPause: boolean,
  canClear: boolean,
  onClear: () => void,
  canRestart: boolean,
  onRestart: () => void,
  // The recording.
  recordingStore: ProfilerRecordingStore,
  debuggerId: DebuggerId,
  profilingInProgress: boolean,
  canRecord: boolean,
  onStartRecording: () => void,
  onStopRecording: () => void,
  // The panels.
  isInspectorShown: boolean,
  onToggleInspector: () => void,
  canOpenInspector: boolean,
  isProfilerShown: boolean,
  onToggleProfiler: () => void,
  canOpenProfiler: boolean,
  isPerformanceShown: boolean,
  onTogglePerformance: () => void,
  canOpenPerformance: boolean,
  isResourcesShown: boolean,
  onToggleResources: () => void,
  canOpenResources: boolean,
  isConsoleShown: boolean,
  onToggleConsole: () => void,
  canOpenConsole: boolean,
|};

/**
 * The toolbar of the debugger, in three groups: the status of the recording
 * (left), the controls of the game and of the recording (center) and the
 * panels (right).
 */
export class Toolbar extends React.PureComponent<Props> {
  render(): any {
    const {
      hasDebugger,
      onLaunchDebuggerAndPreview,
      onClosePreviews,
      canStepFrame,
      onStepFrame,
      isWatchedVariablesPanelOpen,
      onToggleWatchedVariablesPanel,
      eventsExecutionTrackingMode,
      setEventsExecutionTrackingMode,
      onPlay,
      onPause,
      canPlay,
      canPause,
      canClear,
      onClear,
      canRestart,
      onRestart,
      recordingStore,
      debuggerId,
      profilingInProgress,
      canRecord,
      onStartRecording,
      onStopRecording,
      onToggleInspector,
      canOpenInspector,
      isInspectorShown,
      onToggleProfiler,
      canOpenProfiler,
      isProfilerShown,
      onTogglePerformance,
      canOpenPerformance,
      isPerformanceShown,
      onToggleResources,
      canOpenResources,
      isResourcesShown,
      onToggleConsole,
      canOpenConsole,
      isConsoleShown,
    } = this.props;

    // Following the execution of the events is set from the menu of the play
    // button, like the speed of a gameplay test run.
    const followExecutionMenuTemplate = (i18n: I18nType) => [
      {
        type: 'checkbox',
        label: i18n._(t`Don't follow the execution of the events`),
        checked: eventsExecutionTrackingMode === 'off',
        click: () => setEventsExecutionTrackingMode('off'),
      },
      {
        type: 'checkbox',
        label: i18n._(t`Follow the execution at normal speed`),
        checked: eventsExecutionTrackingMode === 'normal-speed',
        click: () => setEventsExecutionTrackingMode('normal-speed'),
      },
      {
        type: 'checkbox',
        label: i18n._(t`Follow the execution at x0.1 speed`),
        checked: eventsExecutionTrackingMode === 'slow-speed',
        click: () => setEventsExecutionTrackingMode('slow-speed'),
      },
      {
        type: 'checkbox',
        label: i18n._(t`Follow the execution frame by frame (paused)`),
        checked: eventsExecutionTrackingMode === 'frame-by-frame',
        click: () => setEventsExecutionTrackingMode('frame-by-frame'),
      },
      // Only when a game is being debugged, as it is what gets closed.
      ...(hasDebugger
        ? [
            { type: 'separator' },
            {
              label: i18n._(t`Kill the game`),
              click: onClosePreviews,
            },
          ]
        : []),
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
          {/* The same buttons as the gameplay test toolbar: a raised split
              button to start, a flat one to interrupt. */}
          {!hasDebugger ? (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onLaunchDebuggerAndPreview}
              icon={<PlayIcon />}
              label={<Trans>Debugger</Trans>}
              buildMenuTemplate={followExecutionMenuTemplate}
            />
          ) : canPause ? (
            // Also a split button: how the execution is followed must stay
            // reachable while the game is running.
            <FlatButtonWithSplitMenu
              primary
              onClick={onPause}
              icon={<PauseIcon />}
              label={<Trans>Pause the game</Trans>}
              buildMenuTemplate={followExecutionMenuTemplate}
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onPlay}
              icon={<PlayIcon />}
              label={<Trans>Resume the game</Trans>}
              disabled={!canPlay}
              buildMenuTemplate={followExecutionMenuTemplate}
            />
          )}
          <ResponsiveRaisedButton
            primary
            onClick={profilingInProgress ? onStopRecording : onStartRecording}
            disabled={!canRecord}
            icon={profilingInProgress ? <StopIcon /> : <RecordIcon />}
            label={
              profilingInProgress ? (
                <Trans>Stop recording</Trans>
              ) : (
                <Trans>Record</Trans>
              )
            }
            id="debugger-record-button"
          />
          <IconButton
            size="small"
            color="default"
            onClick={onStepFrame}
            disabled={!canStepFrame}
            tooltip={t`Advance one frame`}
          >
            <SkipForwardIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onClear}
            disabled={!canClear}
            tooltip={t`Clear recorded data`}
          >
            <TrashIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onRestart}
            disabled={!canRestart}
            tooltip={t`Restart the game`}
          >
            <RestoreIcon style={styles.restoreIcon} />
          </IconButton>
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleInspector}
            disabled={!canOpenInspector}
            selected={isInspectorShown}
            tooltip={t`Inspector`}
          >
            <InspectorIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleProfiler}
            disabled={!canOpenProfiler}
            selected={isProfilerShown}
            tooltip={t`Profiler`}
          >
            <ProfilerIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onTogglePerformance}
            disabled={!canOpenPerformance}
            selected={isPerformanceShown}
            tooltip={t`Performance`}
          >
            <GraphsIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleResources}
            disabled={!canOpenResources}
            selected={isResourcesShown}
            tooltip={t`Resources`}
          >
            <ProjectResourcesIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleConsole}
            disabled={!canOpenConsole}
            selected={isConsoleShown}
            tooltip={t`Console`}
          >
            <ConsoleIcon />
          </IconButton>
          <IconButton
            size="small"
            color="default"
            onClick={onToggleWatchedVariablesPanel}
            selected={isWatchedVariablesPanelOpen}
            tooltip={t`Watch variables`}
          >
            <VariableTreeIcon />
          </IconButton>
        </ToolbarGroup>
      </React.Fragment>
    );
  }
}

export default Toolbar;
