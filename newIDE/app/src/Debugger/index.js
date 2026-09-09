// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Toolbar from './Toolbar';
import DebuggerContent from './DebuggerContent';
import DebuggerSelector from './DebuggerSelector';
import { Column, Line } from '../UI/Grid';
import { EmptyPlaceholder } from '../UI/EmptyPlaceholder';
import PlayIcon from '../UI/CustomSvgIcons/Preview';
import Text from '../UI/Text';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import Background from '../UI/Background';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';
import { type Log, LogsManager } from './DebuggerConsole';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type ResourcesDebugState } from './Resources/ResourcesDebugTypes';
import AuthenticatedUserContext from '../Profile/AuthenticatedUserContext';
import { isProfilerAccessAllowed } from './ProfilerAccess';
import Window from '../Utils/Window';
import classes from './Debugger.module.css';
import {
  type DebuggerPlaySpeed,
  type LaunchDebuggerAndPreviewOptions,
} from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import { UseCommandHook } from '../CommandPalette/CommandHooks';

export type ResourcesDebugSnapshot = {|
  state: ?ResourcesDebugState,
  lastUpdatedAt: number,
  lastError: ?string,
|};

// Mirrors `gdjs.FrameMeasureOutput`: a plain tree (no back-references),
// as sent by the game's profiler.
export type ProfilerMeasuresSection = {|
  time: number,
  subsections: { [string]: ProfilerMeasuresSection },
|};

export type ProfilerOutput = {|
  framesAverageMeasures: ProfilerMeasuresSection,
  stats: {
    framesCount: number,
    // Optional: only sent by game engines recent enough to measure them,
    // and only meaningful for a game that renders in 3D.
    shaderProgramsCount?: number,
    shaderProgramCompilationsCount?: number,
    framesWithShaderCompilationCount?: number,
    averageDrawCallsCount?: number,
    averageTrianglesCount?: number,
    geometriesCount?: number,
    texturesCount?: number,
  },
|};

/**
 * Returns true if a log is a warning or debug log from a library out of our control that we do not want to bother users with.
 * This is used in Debugger#_handleMessage below to filter out those kinds of messages.
 */
const isUnavoidableLibraryWarning = ({ group, message }: Log): boolean =>
  group === 'JavaScript' &&
  (message.includes('Electron Security Warning') ||
    message.includes('Warning: This is a browser-targeted Firebase bundle'));

type Props = {|
  project: gdProject,
  setToolbar: React.Node => void,
  previewDebuggerServer: PreviewDebuggerServer,
  onLaunchDebuggerAndPreview: (?LaunchDebuggerAndPreviewOptions) => void,
  onClosePreviews: () => void,
  isWatchedVariablesPanelOpen: boolean,
  onToggleWatchedVariablesPanel: () => void,
  debuggerPlaySpeed: DebuggerPlaySpeed,
  setDebuggerPlaySpeed: DebuggerPlaySpeed => void,
|};

type State = {|
  debuggerServerState: 'started' | 'starting' | 'stopped',
  debuggerServerError: ?any,
  debuggerIds: Array<DebuggerId>,
  unregisterDebuggerServerCallbacks: ?() => void,

  debuggerGameData: { [DebuggerId]: any },
  profilingInProgress: { [DebuggerId]: boolean },
  resourcesDebugSnapshots: { [DebuggerId]: ResourcesDebugSnapshot },
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  selectedId: DebuggerId,
  logs: { [DebuggerId]: Array<Log> },
  /** True for a moment after a screenshot key was pressed: the panels are hidden. */
  isScreenshotShieldShown: boolean,
  /** Start recording the game as soon as it is restarted. */
  shouldRecordOnLaunch: boolean,
  shouldClearOnRecord: boolean,
|};

/** How long the panels stay hidden after a screenshot key was pressed. */
const SCREENSHOT_SHIELD_DURATION_MS = 2000;

/**
 * Start the debugger server, listen to commands received and issue commands to it.
 */
export default class Debugger extends React.Component<Props, State> {
  static contextType: typeof AuthenticatedUserContext = AuthenticatedUserContext;
  // $FlowFixMe[missing-local-annot]
  state = {
    debuggerServerState: (this.props.previewDebuggerServer.getServerState():
      | 'started'
      | 'starting'
      | 'stopped'),
    debuggerServerError: null,
    debuggerIds: (this.props.previewDebuggerServer.getExistingDebuggerIds(): Array<DebuggerId>),
    unregisterDebuggerServerCallbacks: null,
    debuggerGameData: {},
    profilingInProgress: {},
    resourcesDebugSnapshots: {},
    debuggerStatus: {},
    selectedId: '0',
    logs: {},
    isScreenshotShieldShown: false,
    shouldRecordOnLaunch: false,
    shouldClearOnRecord: true,
  };
  _screenshotShieldTimeoutId: ?TimeoutID = null;
  _wasProfilerAccessAllowed: boolean = false;

  /**
   * The profiler, performance and resources panels are for the allowed users
   * only (everyone in development).
   */
  _isProfilerAccessAllowed = (): boolean =>
    isProfilerAccessAllowed(
      this.context ? this.context.profile : null,
      Window.isDev()
    );

  /**
   * The screenshot shield: the window is protected against captures by the
   * system (desktop app on Windows), and the panels are hidden for a moment
   * when a screenshot key is pressed (the only thing a page can notice).
   */
  _onWindowKeyDown = (event: KeyboardEvent) => {
    if (event.key !== 'PrintScreen' && event.key !== 'Snapshot') return;
    this._showScreenshotShield();
  };

  _onWindowKeyUp = (event: KeyboardEvent) => {
    // Print Screen is only reported on key up by some browsers.
    if (event.key !== 'PrintScreen' && event.key !== 'Snapshot') return;
    this._showScreenshotShield();
  };

  _showScreenshotShield = () => {
    if (this._screenshotShieldTimeoutId) {
      clearTimeout(this._screenshotShieldTimeoutId);
    }
    this.setState({ isScreenshotShieldShown: true });
    this._screenshotShieldTimeoutId = setTimeout(() => {
      this._screenshotShieldTimeoutId = null;
      this.setState({ isScreenshotShieldShown: false });
    }, SCREENSHOT_SHIELD_DURATION_MS);
  };

  _debuggerContents: { [DebuggerId]: ?DebuggerContent } = {};
  /**
   * The games to record as soon as they say they are running: the ones just
   * launched or restarted while recording on launch is asked for.
   */
  _recordOnConnectionIds: Set<DebuggerId> = new Set();
  _debuggerLogs: Map<DebuggerId, LogsManager> = new Map();
  // The recordings of the profiler, out of the state: chunks arrive twice a
  // second and the panels re-render on their own.
  _profilerRecordingStore: ProfilerRecordingStore = new ProfilerRecordingStore();

  updateToolbar = () => {
    const { selectedId, debuggerStatus } = this.state;

    const selectedDebuggerContents = this._debuggerContents[
      this.state.selectedId
    ];

    const isSelectedDebuggerPaused = debuggerStatus[selectedId]
      ? debuggerStatus[selectedId].isPaused
      : false;

    this.props.setToolbar(
      <Toolbar
        hasDebugger={this._hasSelectedDebugger()}
        onLaunchDebuggerAndPreview={this.props.onLaunchDebuggerAndPreview}
        onClosePreviews={this.props.onClosePreviews}
        canStepFrame={this._hasSelectedDebugger() && isSelectedDebuggerPaused}
        onStepFrame={() => this._stepFrame(this.state.selectedId)}
        isWatchedVariablesPanelOpen={this.props.isWatchedVariablesPanelOpen}
        onToggleWatchedVariablesPanel={this.props.onToggleWatchedVariablesPanel}
        debuggerPlaySpeed={this.props.debuggerPlaySpeed}
        setDebuggerPlaySpeed={this.props.setDebuggerPlaySpeed}
        onPlay={() => this._play(this.state.selectedId)}
        onPause={() => this._pause(this.state.selectedId)}
        canPlay={this._hasSelectedDebugger() && isSelectedDebuggerPaused}
        canPause={this._hasSelectedDebugger() && !isSelectedDebuggerPaused}
        recordingStore={this._profilerRecordingStore}
        debuggerId={selectedId}
        profilingInProgress={!!this.state.profilingInProgress[selectedId]}
        canRecord={
          this._hasSelectedDebugger() && this._isProfilerAccessAllowed()
        }
        onStartRecording={() => this._startProfiler(this.state.selectedId)}
        onStopRecording={() => this._stopProfiler(this.state.selectedId)}
        canClear={this._hasSelectedDebugger()}
        onClear={() => this._clear(this.state.selectedId)}
        canRestart={this._hasSelectedDebugger()}
        onRestart={() => this._restart(this.state.selectedId)}
        shouldRecordOnLaunch={this.state.shouldRecordOnLaunch}
        onToggleRecordOnLaunch={() =>
          this.setState(
            state => ({ shouldRecordOnLaunch: !state.shouldRecordOnLaunch }),
            () => this.updateToolbar()
          )
        }
        shouldClearOnRecord={this.state.shouldClearOnRecord}
        onToggleClearOnRecord={() =>
          this.setState(
            state => ({ shouldClearOnRecord: !state.shouldClearOnRecord }),
            () => this.updateToolbar()
          )
        }
        canOpenInspector={this._hasSelectedDebugger()}
        isInspectorShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isInspectorShown()
        }
        onToggleInspector={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleInspector();
        }}
        canOpenProfiler={
          this._hasSelectedDebugger() && this._isProfilerAccessAllowed()
        }
        isProfilerShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isProfilerShown()
        }
        onToggleProfiler={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleProfiler();
        }}
        canOpenConsole={this._hasSelectedDebugger()}
        isConsoleShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isConsoleShown()
        }
        onToggleConsole={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleConsole();
        }}
        canOpenPerformance={
          this._hasSelectedDebugger() && this._isProfilerAccessAllowed()
        }
        isPerformanceShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isPerformanceShown()
        }
        onTogglePerformance={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].togglePerformance();
        }}
        canOpenResources={
          this._hasSelectedDebugger() && this._isProfilerAccessAllowed()
        }
        isResourcesShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isResourcesShown()
        }
        onToggleResources={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleResources();
        }}
      />
    );
  };

  componentDidMount() {
    this._registerServerCallbacks();
    this._wasProfilerAccessAllowed = this._isProfilerAccessAllowed();
    window.addEventListener('keydown', this._onWindowKeyDown);
    window.addEventListener('keyup', this._onWindowKeyUp);
  }

  componentDidUpdate() {
    // The user logged in or out: the toolbar and the panels follow.
    const isProfilerAccessAllowed = this._isProfilerAccessAllowed();
    if (isProfilerAccessAllowed !== this._wasProfilerAccessAllowed) {
      this._wasProfilerAccessAllowed = isProfilerAccessAllowed;
      this.updateToolbar();
    }
  }

  componentWillUnmount() {
    if (this.state.unregisterDebuggerServerCallbacks) {
      this.state.unregisterDebuggerServerCallbacks();
    }
    window.removeEventListener('keydown', this._onWindowKeyDown);
    window.removeEventListener('keyup', this._onWindowKeyUp);
    if (this._screenshotShieldTimeoutId) {
      clearTimeout(this._screenshotShieldTimeoutId);
    }
  }

  _getLogsManager(id: DebuggerId): LogsManager {
    let result = this._debuggerLogs.get(id);
    if (!result) {
      result = new LogsManager();
      this._debuggerLogs.set(id, result);
    }
    return result;
  }

  _registerServerCallbacks = () => {
    const { previewDebuggerServer } = this.props;
    const { unregisterDebuggerServerCallbacks } = this.state;
    if (
      unregisterDebuggerServerCallbacks &&
      previewDebuggerServer.getServerState() === 'started'
    )
      return; // Server already started and callbacks registered

    if (unregisterDebuggerServerCallbacks) unregisterDebuggerServerCallbacks(); // Unregister old callbacks, if any

    // Register new callbacks
    const unregisterCallbacks = previewDebuggerServer.registerCallbacks({
      onErrorReceived: err => {
        this.setState(
          {
            debuggerServerError: err,
          },
          () => this.updateToolbar()
        );
      },
      onConnectionClosed: ({ id, debuggerIds }) => {
        this._debuggerLogs.delete(id);
        this._profilerRecordingStore.clear(id);
        this.setState(
          ({
            selectedId,
            debuggerGameData,
            profilingInProgress,
            resourcesDebugSnapshots,
            debuggerStatus,
          }) => {
            // Remove any data bound to the instance that might have been stored.
            // Otherwise this would be a memory leak.
            if (debuggerGameData[id]) delete debuggerGameData[id];
            if (profilingInProgress[id]) delete profilingInProgress[id];
            if (resourcesDebugSnapshots[id]) delete resourcesDebugSnapshots[id];
            if (debuggerStatus[id]) delete debuggerStatus[id];

            return {
              debuggerIds,
              selectedId:
                selectedId !== id
                  ? selectedId
                  : debuggerIds.length
                  ? debuggerIds[debuggerIds.length - 1]
                  : selectedId,
              debuggerGameData,
              profilingInProgress,
              resourcesDebugSnapshots,
              debuggerStatus,
            };
          },
          () => this.updateToolbar()
        );
      },
      onConnectionOpened: ({ id, debuggerIds }) => {
        // The game is not ready to record yet: it is when it sends its status.
        if (this.state.shouldRecordOnLaunch) {
          this._recordOnConnectionIds.add(id);
        }
        this.setState(
          {
            debuggerIds,
            selectedId: id,
          },
          () => this.updateToolbar()
        );
      },
      onConnectionErrored: ({ id, errorMessage }) => {
        this._getLogsManager(id).addLog({
          type: 'error',
          timestamp: performance.now(),
          group: 'Debugger connection',
          message: 'The debugger connection errored: ' + errorMessage,
        });
      },
      onServerStateChanged: () => {
        this.setState(
          {
            debuggerServerState: previewDebuggerServer.getServerState(),
          },
          () => this.updateToolbar()
        );
      },
      onHandleParsedMessage: ({ id, parsedMessage }) => {
        this._handleMessage(id, parsedMessage);
      },
    });
    this.setState({
      unregisterDebuggerServerCallbacks: unregisterCallbacks,
    });

    // Fetch the status of each debugger client.
    previewDebuggerServer.getExistingDebuggerIds().forEach(debuggerId => {
      previewDebuggerServer.sendMessage(debuggerId, { command: 'getStatus' });
    });
  };

  _handleMessage = (id: DebuggerId, data: any) => {
    if (data.command === 'dump') {
      this.setState({
        debuggerGameData: {
          ...this.state.debuggerGameData,
          [id]: data.payload,
        },
      });
    } else if (data.command === 'status') {
      this.setState(
        state => ({
          debuggerStatus: {
            ...state.debuggerStatus,
            [id]: data.payload,
          },
        }),
        () => this.updateToolbar()
      );
      // A paused game (by the debugger, or by a "pause" action used as a
      // breakpoint in the events) keeps its recording: each frame advanced by
      // hand then records exactly one frame.
      if (data.payload && this._recordOnConnectionIds.has(id)) {
        this._recordOnConnectionIds.delete(id);
        this._startProfiler(id);
      }
    } else if (data.command === 'profiler.output') {
      this._profilerRecordingStore.onOutput(id, data.payload);
    } else if (data.command === 'profiler.started') {
      this._profilerRecordingStore.onStarted(id, data.payload);
      this.setState(
        state => ({
          profilingInProgress: { ...state.profilingInProgress, [id]: true },
        }),
        () => this.updateToolbar()
      );
    } else if (data.command === 'profiler.chunk') {
      this._profilerRecordingStore.onChunk(id, data.payload);
    } else if (data.command === 'profiler.stopped') {
      this._profilerRecordingStore.onStopped(id, data.payload);
      this.setState(
        state => ({
          profilingInProgress: { ...state.profilingInProgress, [id]: false },
        }),
        () => this.updateToolbar()
      );
    } else if (data.command === 'resources.dumped') {
      // Answered to `_requestResourcesDebugState` (see `sendMessageWithResponse`).
    } else if (data.command === 'expressionValue') {
      // Answered to the events sheets (see EventsExecutionTracking).
    } else if (data.command === 'hotReloader.logs') {
      // Nothing to do.
    } else if (data.command === 'updateInstances') {
      // Nothing to do.
    } else if (data.command === 'eventsExecutionTracker.output') {
      // Handled by the events sheets (see EventsExecutionTracking).
    } else if (data.command === 'console.log') {
      // Filter out unavoidable warnings that do not concern non-engine devs.
      if (isUnavoidableLibraryWarning(data.payload)) return;
      this._getLogsManager(id).addLog(data.payload);
    } else {
      console.warn(
        'Unknown command received from debugger client:',
        data.command
      );
    }
  };

  _play = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'play' });

    // Pause status is transmitted by the game (using `status`).
  };

  /** Advance the paused game of one frame (frame by frame debugging). */
  _stepFrame = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'stepFrame' });
  };

  _pause = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'pause' });

    // Pause status is transmitted by the game (using `status`).
  };

  _refresh = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'refresh' });
  };

  _edit = (id: DebuggerId, path: Array<string>, newValue: any): any => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, {
      command: 'set',
      path,
      newValue,
    });

    setTimeout(() => this._refresh(id), 100);
    return true;
  };

  _call = (id: DebuggerId, path: Array<string>, args: Array<any>): any => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, {
      command: 'call',
      path,
      args,
    });

    setTimeout(() => this._refresh(id), 100);
    return true;
  };

  _startProfiler = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    if (!this._isProfilerAccessAllowed()) return;
    // Recording again starts from a blank slate, unless asked otherwise.
    if (this.state.shouldClearOnRecord && !this.state.profilingInProgress[id]) {
      this._forgetRecordedData(id);
    }
    // A paused game is left paused: each frame advanced by hand then records
    // exactly one frame, which is how the events are debugged frame by frame.
    previewDebuggerServer.sendMessage(id, { command: 'profiler.start' });
  };

  _stopProfiler = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'profiler.stop' });
  };

  /**
   * Forget everything recorded about a preview (recording, logs, inspected
   * data, resources). A running recording is stopped, not started again: the
   * user chooses when to record anew.
   */
  _clear = (id: DebuggerId) => {
    if (this.state.profilingInProgress[id]) this._stopProfiler(id);
    this._forgetRecordedData(id);
  };

  /** Forget the recording, logs, inspected data and resources of a preview. */
  _forgetRecordedData = (id: DebuggerId) => {
    this._profilerRecordingStore.clear(id);
    this._getLogsManager(id).clear();
    this.setState(state => {
      const debuggerGameData = { ...state.debuggerGameData };
      const resourcesDebugSnapshots = { ...state.resourcesDebugSnapshots };
      delete debuggerGameData[id];
      delete resourcesDebugSnapshots[id];
      return { debuggerGameData, resourcesDebugSnapshots };
    });
  };

  /**
   * Restart the game from scratch: caches emptied, resources downloaded
   * again, and everything recorded about it forgotten.
   */
  _restart = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    this._clear(id);
    // The game comes back as a new connection, recorded again if recording
    // on launch is asked for (see `onConnectionOpened`).
    previewDebuggerServer.sendMessage(id, {
      command: 'hardReload',
      payload: { clearCaches: true },
    });
  };

  /**
   * Read what is at the given path in the running game (an object selected in
   * the inspector), so that its values can be refreshed while it runs.
   * Resolves to null if the game did not answer.
   */
  _inspectPath = async (
    id: DebuggerId,
    path: Array<string>
  ): Promise<Object | null> => {
    const { previewDebuggerServer } = this.props;
    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse(
        { command: 'inspector.dump', payload: { path } },
        id
      );
      return answer.payload || null;
    } catch (error) {
      // The game did not answer in time (closed, or busy).
      return null;
    }
  };

  /**
   * Ask the game for the state of its resources. On failure, the previous
   * snapshot is kept and the error is shown.
   */
  _requestResourcesDebugState = async (id: DebuggerId): Promise<void> => {
    const { previewDebuggerServer } = this.props;
    const previousSnapshot = this.state.resourcesDebugSnapshots[id];
    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse(
        { command: 'resources.dump' },
        id,
        // A game with a lot of resources needs more than the default second
        // to build and send its answer.
        10000
      );
      const payload = answer.payload;
      if (!payload || payload.error) {
        throw new Error(payload ? payload.error : 'No payload in the answer.');
      }
      this.setState(state => ({
        resourcesDebugSnapshots: {
          ...state.resourcesDebugSnapshots,
          [id]: { state: payload, lastUpdatedAt: Date.now(), lastError: null },
        },
      }));
    } catch (error) {
      this.setState(state => ({
        resourcesDebugSnapshots: {
          ...state.resourcesDebugSnapshots,
          [id]: {
            state: previousSnapshot ? previousSnapshot.state : null,
            lastUpdatedAt: previousSnapshot
              ? previousSnapshot.lastUpdatedAt
              : 0,
            lastError: error.message || String(error),
          },
        },
      }));
    }
  };

  _hasSelectedDebugger = (): any => {
    const { selectedId, debuggerIds } = this.state;
    if (debuggerIds.indexOf(selectedId) === -1) return false;

    const debuggerStatus = this.state.debuggerStatus[selectedId];
    if (debuggerStatus && debuggerStatus.isInGameEdition) return false;

    return true;
  };

  render(): any {
    const {
      debuggerServerError,
      debuggerServerState,
      selectedId,
      debuggerStatus,
      debuggerGameData,
      profilingInProgress,
      resourcesDebugSnapshots,
      debuggerIds,
    } = this.state;

    if (debuggerServerState === 'stopped' && debuggerServerError) {
      return (
        <Background>
          <PlaceholderMessage>
            <Text>
              <Trans>
                Unable to start the debugger server! Make sure that you are
                authorized to run servers on this computer.
              </Trans>
            </Text>
          </PlaceholderMessage>
        </Background>
      );
    }

    if (debuggerServerState === 'starting') {
      return (
        <Background>
          <PlaceholderMessage>
            <PlaceholderLoader />
            <Text>
              <Trans>Debugger is starting...</Trans>
            </Text>
          </PlaceholderMessage>
        </Background>
      );
    }

    // The debugger server is only started when a preview is launched, so a
    // stopped server is displayed like a started one without any preview
    // running (it will be started as soon as a preview is launched).
    // A recording can only be started on a preview that is running and that
    // the user is allowed to profile.
    const canRecord =
      this._hasSelectedDebugger() && this._isProfilerAccessAllowed();
    const isRecording = !!profilingInProgress[selectedId];

    return (
      <Background>
        <UseCommandHook
          name="TOGGLE_PROFILER_RECORDING"
          enabled={canRecord}
          command={{
            handler: () =>
              isRecording
                ? this._stopProfiler(selectedId)
                : this._startProfiler(selectedId),
          }}
        />
        <UseCommandHook
          name="START_PROFILER_RECORDING"
          enabled={canRecord && !isRecording}
          command={{ handler: () => this._startProfiler(selectedId) }}
        />
        <UseCommandHook
          name="STOP_PROFILER_RECORDING"
          enabled={canRecord && isRecording}
          command={{ handler: () => this._stopProfiler(selectedId) }}
        />
        {this.state.isScreenshotShieldShown && (
          <div className={classes.screenshotShield} />
        )}
        <Column expand noMargin>
          <DebuggerSelector
            selectedId={selectedId}
            debuggerStatus={debuggerStatus}
            onChooseDebugger={id =>
              this.setState(
                {
                  selectedId: id,
                },
                () => this.updateToolbar()
              )
            }
          />
          {this._hasSelectedDebugger() ? (
            <DebuggerContent
              ref={debuggerContent =>
                (this._debuggerContents[selectedId] = debuggerContent)
              }
              gameData={debuggerGameData[selectedId]}
              onPlay={() => this._play(selectedId)}
              onPause={() => this._pause(selectedId)}
              onRefresh={() => this._refresh(selectedId)}
              onInspectPath={path => this._inspectPath(selectedId, path)}
              onEdit={(path, args) => this._edit(selectedId, path, args)}
              onCall={(path, args) => this._call(selectedId, path, args)}
              profilingInProgress={!!profilingInProgress[selectedId]}
              profilerRecordingStore={this._profilerRecordingStore}
              debuggerId={selectedId}
              resourcesDebugSnapshot={resourcesDebugSnapshots[selectedId]}
              onRequestResourcesDebugState={() =>
                this._requestResourcesDebugState(selectedId)
              }
              isProfilerAccessAllowed={this._isProfilerAccessAllowed()}
              isDebuggerConnected={debuggerIds.includes(selectedId)}
              isDebuggerPaused={
                !!debuggerStatus[selectedId] &&
                debuggerStatus[selectedId].isPaused
              }
              logsManager={this._getLogsManager(selectedId)}
              onOpenedEditorsChanged={this.updateToolbar}
            />
          ) : (
            // Centered in the whole panel, like an empty events sheet.
            <Line expand justifyContent="center" alignItems="center">
              <EmptyPlaceholder
                title={<Trans>Start a preview to debug it</Trans>}
                description={
                  <Trans>Inspect, watch and profile a running game.</Trans>
                }
                actionLabel={<Trans>Debugger</Trans>}
                actionIcon={<PlayIcon />}
                helpPagePath="/interface/debugger"
                actionButtonId="start-preview-and-debugger-button"
                onAction={this.props.onLaunchDebuggerAndPreview}
              />
            </Line>
          )}
        </Column>
      </Background>
    );
  }
}
