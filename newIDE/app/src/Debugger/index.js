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
import AlertMessage from '../UI/AlertMessage';
import DismissableAlertMessage from '../UI/DismissableAlertMessage';
import FlatButton from '../UI/FlatButton';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
  type DebuggerStatus,
} from '../ExportAndShare/PreviewLauncher.flow';
import { type Log, LogsManager } from './DebuggerConsole';
import { ProfilerRecordingStore } from './ProfilerRecording/ProfilerRecordingStore';
import { type ResourcesDebugState } from './Resources/ResourcesDebugTypes';
import {
  type InspectorCall,
  type InspectorCallResult,
} from './GDJSInspectorDescriptions';
import {
  type DebuggerPlaySpeed,
  type LaunchDebuggerAndPreviewOptions,
} from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import { UseCommandHook } from '../CommandPalette/CommandHooks';
import EventsExecutionTrackingContext from '../EventsExecutionTracking/EventsExecutionTrackingContext';
import { EventsExecutionTrackingStore } from '../EventsExecutionTracking/EventsExecutionTrackingStore';

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
  /** Start recording the game as soon as it is restarted. */
  shouldRecordOnLaunch: boolean,
  shouldClearOnRecord: boolean,
|};

/**
 * Start the debugger server, listen to commands received and issue commands to it.
 */
export default class Debugger extends React.Component<Props, State> {
  /**
   * The store fed by the previews, shared with the events sheets: clearing
   * the recorded data must also clear the durations they show.
   */
  static contextType: React.Context<EventsExecutionTrackingStore> = EventsExecutionTrackingContext;

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
    shouldRecordOnLaunch: false,
    shouldClearOnRecord: true,
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
        canRecord={this._hasSelectedDebugger()}
        onStartRecording={() => this._startProfiler(this.state.selectedId)}
        onStopRecording={() => this._stopProfiler(this.state.selectedId)}
        canClear={this._canShowSelectedDebugger()}
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
        canOpenInspector={this._canShowSelectedDebugger()}
        isInspectorShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isInspectorShown()
        }
        onToggleInspector={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleInspector();
        }}
        canOpenProfiler={this._canShowSelectedDebugger()}
        isProfilerShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isProfilerShown()
        }
        onToggleProfiler={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleProfiler();
        }}
        canOpenConsole={this._canShowSelectedDebugger()}
        isConsoleShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isConsoleShown()
        }
        onToggleConsole={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].toggleConsole();
        }}
        canOpenPerformance={this._canShowSelectedDebugger()}
        isPerformanceShown={
          !!selectedDebuggerContents &&
          selectedDebuggerContents.isPerformanceShown()
        }
        onTogglePerformance={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].togglePerformance();
        }}
        canOpenResources={this._canShowSelectedDebugger()}
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
  }

  componentWillUnmount() {
    if (this.state.unregisterDebuggerServerCallbacks) {
      this.state.unregisterDebuggerServerCallbacks();
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
        const status = this.state.debuggerStatus[id];
        // What a closed game recorded stays readable, until it is cleared or
        // another game is launched. A game embedded in an editor, or a game
        // that never said it was running, has nothing worth keeping.
        const isKept = !!status && !status.isInGameEdition;
        if (!isKept) {
          this._forgetDebugger(id);
        } else if (this.state.profilingInProgress[id]) {
          // The game will not say it stopped recording: its recording ends
          // with its last frame.
          this._profilerRecordingStore.onStopped(id, null);
        }
        this.setState(
          ({ selectedId, profilingInProgress }) => ({
            debuggerIds,
            profilingInProgress: isKept
              ? { ...profilingInProgress, [id]: false }
              : profilingInProgress,
            // A kept game stays selected. Otherwise another running game is
            // selected, never the game embedded in the editor.
            selectedId:
              selectedId !== id || isKept
                ? selectedId
                : this._pickRunningDebuggerId(debuggerIds) || selectedId,
          }),
          () => this.updateToolbar()
        );
      },
      onConnectionOpened: ({ id, debuggerIds }) => {
        const isPreview = previewDebuggerServer
          .getExistingPreviewDebuggerIds()
          .includes(id);
        // A new game takes over what the closed ones left on screen.
        if (isPreview) this._carryOverClosedDebuggersData(id, debuggerIds);
        // The game is not ready to record yet: it is when it sends its status.
        if (this.state.shouldRecordOnLaunch) {
          this._recordOnConnectionIds.add(id);
        }
        this.setState(
          state => ({
            debuggerIds,
            // The game embedded in the editor is never what is debugged.
            selectedId: isPreview ? id : state.selectedId,
          }),
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
      // A game paused from the debugger keeps its recording: each frame
      // advanced by hand then records exactly one frame. The "pause" action
      // used as a breakpoint in the events stops the recording instead: it is
      // there to look at the game at one exact moment.
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
      // The inspector is not kept up to date while recording (it would be
      // both costly and unreadable): once the recording is over, it is
      // refreshed so that the panel shows the state the game ended on,
      // instead of waiting for the user to hit "Refresh".
      this._refresh(id);
    } else if (
      data.command === 'inspector.dumped' ||
      data.command === 'inspector.called'
    ) {
      // Answered to the inspector (see `sendMessageWithResponse`).
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
    // Recording again starts from a blank slate, unless asked otherwise. What
    // is inspected is kept: throwing it away would unmount the tree of the
    // Inspector, folding everything the user had opened.
    if (this.state.shouldClearOnRecord && !this.state.profilingInProgress[id]) {
      this._forgetRecordedData(id, { keepInspectedData: true });
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
    // Asked explicitly: the durations shown on the events sheets go too.
    this.context.clear();
    if (this.state.profilingInProgress[id]) this._stopProfiler(id);
    if (!this.state.debuggerIds.includes(id)) {
      // Clearing a closed game leaves nothing of it.
      this._forgetDebugger(id);
      return;
    }
    this._forgetRecordedData(id);
    // The Inspector was emptied: ask the game for its state again, instead of
    // leaving an empty tree until the user hits refresh.
    this._refresh(id);
  };

  /**
   * Forget the recording, logs, inspected data and resources of a preview.
   * `keepInspectedData` leaves the tree of the Inspector alone, for the
   * clears that are not asked for by the user.
   */
  _forgetRecordedData = (
    id: DebuggerId,
    options: {| keepInspectedData: boolean |} = { keepInspectedData: false }
  ) => {
    this._profilerRecordingStore.clear(id);
    this._getLogsManager(id).clear();
    this.setState(state => {
      const debuggerGameData = { ...state.debuggerGameData };
      const resourcesDebugSnapshots = { ...state.resourcesDebugSnapshots };
      if (!options.keepInspectedData) delete debuggerGameData[id];
      delete resourcesDebugSnapshots[id];
      return { debuggerGameData, resourcesDebugSnapshots };
    });
  };

  /**
   * Forget everything about a game: what it recorded and its status, so that
   * it disappears from the debugger.
   */
  _forgetDebugger = (id: DebuggerId) => {
    this._forgetRecordedData(id);
    this._debuggerLogs.delete(id);
    this.setState(
      state => {
        const debuggerStatus = { ...state.debuggerStatus };
        const profilingInProgress = { ...state.profilingInProgress };
        delete debuggerStatus[id];
        delete profilingInProgress[id];
        return { debuggerStatus, profilingInProgress };
      },
      () => this.updateToolbar()
    );
  };

  /**
   * A game was just launched: the last values of the game it replaces are
   * given to it, so that the panels keep showing what they showed until the
   * new game sends its own. The closed games are then forgotten, so that
   * recordings do not pile up. The logs are not carried over: a console is
   * the story of one run, and mixing two of them would read as one.
   */
  _carryOverClosedDebuggersData = (
    newDebuggerId: DebuggerId,
    connectedDebuggerIds: Array<DebuggerId>
  ) => {
    const closedIds = Object.keys(this.state.debuggerStatus).filter(
      id => !connectedDebuggerIds.includes(id)
    );
    // The last one closed is the one that was being read.
    const previousId = closedIds[closedIds.length - 1];
    if (previousId !== undefined && previousId !== newDebuggerId) {
      this._profilerRecordingStore.transfer(previousId, newDebuggerId);
      this.setState(state => {
        const debuggerGameData = { ...state.debuggerGameData };
        const resourcesDebugSnapshots = { ...state.resourcesDebugSnapshots };
        if (
          debuggerGameData[previousId] &&
          debuggerGameData[newDebuggerId] === undefined
        ) {
          debuggerGameData[newDebuggerId] = debuggerGameData[previousId];
        }
        if (
          resourcesDebugSnapshots[previousId] &&
          resourcesDebugSnapshots[newDebuggerId] === undefined
        ) {
          resourcesDebugSnapshots[newDebuggerId] =
            resourcesDebugSnapshots[previousId];
        }
        return { debuggerGameData, resourcesDebugSnapshots };
      });
    }
    closedIds.forEach(id => this._forgetDebugger(id));
  };

  /** The last game running in a preview, ignoring the game embedded in the editor. */
  _pickRunningDebuggerId = (debuggerIds: Array<DebuggerId>): ?DebuggerId => {
    const { debuggerStatus } = this.state;
    for (let index = debuggerIds.length - 1; index >= 0; index--) {
      const id = debuggerIds[index];
      const status = debuggerStatus[id];
      if (!status || !status.isInGameEdition) return id;
    }
    return null;
  };

  /**
   * True when the selected game was closed but what it recorded is kept: the
   * panels stay readable until they are cleared or another game is launched.
   */
  _hasKeptDataForSelectedDebugger = (): boolean => {
    const { selectedId, debuggerIds, debuggerStatus } = this.state;
    if (debuggerIds.includes(selectedId)) return false;
    const status = debuggerStatus[selectedId];
    return !!status && !status.isInGameEdition;
  };

  /** True when there is something to show: a running game, or a closed one whose data is kept. */
  _canShowSelectedDebugger = (): boolean =>
    this._hasSelectedDebugger() || this._hasKeptDataForSelectedDebugger();

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
      // `0`, `""` and `false` are values to show, not missing answers.
      return answer.payload !== undefined ? answer.payload : null;
    } catch (error) {
      // The game did not answer in time (closed, or busy).
      return null;
    }
  };

  /**
   * Call functions on what is at the given path in the running game (the
   * expressions of the behaviors of an inspected object) and read what they
   * return. Resolves to null if the game did not answer.
   */
  _readValues = async (
    id: DebuggerId,
    path: Array<string>,
    calls: Array<InspectorCall>
  ): Promise<Array<InspectorCallResult> | null> => {
    const { previewDebuggerServer } = this.props;
    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse(
        { command: 'inspector.call', payload: { path, calls } },
        id
      );
      return Array.isArray(answer.payload) ? answer.payload : null;
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
    // A recording can only be started on a preview that is running.
    const canRecord = this._hasSelectedDebugger();
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
        <Column expand noMargin>
          <DebuggerSelector
            selectedId={selectedId}
            debuggerStatus={debuggerStatus}
            connectedDebuggerIds={debuggerIds}
            onChooseDebugger={id =>
              this.setState(
                {
                  selectedId: id,
                },
                () => this.updateToolbar()
              )
            }
          />
          {/* What the numbers of every panel are worth knowing: the game is
              watched, and being watched costs it. */}
          <DismissableAlertMessage
            kind="info"
            identifier="debugger-slows-the-game-down"
          >
            <Trans>
              A game watched by the debugger sends a lot of data, and recording
              asks for more: it can run slower than it would on its own.
            </Trans>
          </DismissableAlertMessage>
          {this._hasKeptDataForSelectedDebugger() && (
            <AlertMessage
              kind="info"
              renderRightButton={() => (
                <FlatButton
                  label={<Trans>Clear</Trans>}
                  onClick={() => this._clear(selectedId)}
                />
              )}
            >
              <Trans>
                This game was closed. What it recorded is kept until it is
                cleared or another game is launched.
              </Trans>
            </AlertMessage>
          )}
          {this._canShowSelectedDebugger() ? (
            <DebuggerContent
              ref={debuggerContent =>
                (this._debuggerContents[selectedId] = debuggerContent)
              }
              gameData={debuggerGameData[selectedId]}
              onPlay={() => this._play(selectedId)}
              onPause={() => this._pause(selectedId)}
              onRefresh={() => this._refresh(selectedId)}
              onInspectPath={path => this._inspectPath(selectedId, path)}
              onReadValues={(path, calls) =>
                this._readValues(selectedId, path, calls)
              }
              onEdit={(path, args) => this._edit(selectedId, path, args)}
              onCall={(path, args) => this._call(selectedId, path, args)}
              profilingInProgress={!!profilingInProgress[selectedId]}
              canRecord={canRecord}
              onStartRecording={() => this._startProfiler(selectedId)}
              profilerRecordingStore={this._profilerRecordingStore}
              debuggerId={selectedId}
              resourcesDebugSnapshot={resourcesDebugSnapshots[selectedId]}
              onRequestResourcesDebugState={() =>
                this._requestResourcesDebugState(selectedId)
              }
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
