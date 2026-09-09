// @flow
import { t, Trans } from '@lingui/macro';
import { type I18n as I18nType } from '@lingui/core';
import { type MenuItemTemplate } from '../UI/Menu/Menu.flow';
import * as React from 'react';
import { ToolbarGroup } from '../UI/Toolbar';
import ToolbarSeparator from '../UI/ToolbarSeparator';
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
import {
  type DebuggerPlaySpeed,
  type LaunchDebuggerAndPreviewOptions,
} from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import IconButton from '../UI/IconButton';
import RaisedButtonWithSplitMenu from '../UI/RaisedButtonWithSplitMenu';
import FlatButtonWithSplitMenu from '../UI/FlatButtonWithSplitMenu';
import { RecordingStatusChip } from './RecordingControls';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type DebuggerId } from '../ExportAndShare/PreviewLauncher.flow';

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
 * The toolbar of the debugger, in four groups: the status of the recording,
 * the controls of the game, the recording, and the panels.
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
              buildMenuTemplate={gameMenuTemplate}
            />
          ) : canPause ? (
            <FlatButtonWithSplitMenu
              primary
              onClick={onPause}
              icon={<PauseIcon />}
              label={<Trans>Pause the game</Trans>}
              buildMenuTemplate={gameMenuTemplate}
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onPlay}
              icon={<PlayIcon />}
              label={<Trans>Resume the game</Trans>}
              disabled={!canPlay}
              buildMenuTemplate={gameMenuTemplate}
            />
          )}
          <IconButton
            size="small"
            color="default"
            onClick={onStepFrame}
            disabled={!canStepFrame}
            tooltip={t`Advance one frame`}
          >
            <SkipForwardIcon />
          </IconButton>
          <ToolbarSeparator />
          {profilingInProgress ? (
            <FlatButtonWithSplitMenu
              primary
              onClick={onStopRecording}
              disabled={!canRecord}
              icon={<StopIcon />}
              label={<Trans>Stop recording</Trans>}
              buildMenuTemplate={recordMenuTemplate}
              id="debugger-record-button"
            />
          ) : (
            <RaisedButtonWithSplitMenu
              primary
              onClick={onStartRecording}
              disabled={!canRecord}
              icon={<RecordIcon />}
              label={<Trans>Record</Trans>}
              buildMenuTemplate={recordMenuTemplate}
              id="debugger-record-button"
            />
          )}
        </ToolbarGroup>
        <ToolbarGroup lastChild>
          <ToolbarSeparator />
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
