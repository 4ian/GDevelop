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
import { UseCommandHook } from '../CommandPalette/CommandHooks';
import {
  getIsGameplayTestRunInProgress,
  subscribeToGameplayTestRunInProgress,
} from '../GameplayTests/GameplayTestRunner';
import EventsExecutionTrackingContext from '../EventsExecutionTracking/EventsExecutionTrackingContext';
import {
  type DebuggerRecordingMetadata,
  DebuggerRecordingFileError,
  getRecordingFromFile,
  makeDebuggerRecordingFile,
} from './Export/DebuggerRecordingFile';
import {
  exportDebuggerRecording,
  importDebuggerRecording,
} from './Export/DebuggerRecordingIO';
import { EventsExecutionTrackingStore } from '../EventsExecutionTracking/EventsExecutionTrackingStore';
import ComparisonWarnings from './ComparisonWarnings';
import {
  getRecordingsState,
  forgetRecordedData,
  forgetDebugger,
  getClosedDebuggerIds,
  getCarriedOverDebuggerId,
  carryOverClosedDebuggersData,
  addImportedRecording,
  pickRunningDebuggerId,
} from './DebuggerRecordingsState';
import { DEBUGGER_PANELS, type DebuggerPanelName } from './DebuggerPanels';
import { type DebuggerSession } from './DebuggerSessionContext';
import { RESOURCES_DUMP_TIMEOUT_MS } from './DebuggerConstants';

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
  debuggerSession: DebuggerSession,
  /** Start recording the game as soon as it is launched or restarted. */
  shouldRecordOnLaunch: boolean,
  setShouldRecordOnLaunch: boolean => void,
  shouldClearOnRecord: boolean,
  setShouldClearOnRecord: boolean => void,
|};

/** What an answer of the game holds, or why there is none. */
type GameAnswer = {| payload: any, error: ?Error |};

/** For the messages that need nothing to be done when received. */
const ignoreMessage = () => {};

type State = {|
  debuggerServerState: 'started' | 'starting' | 'stopped',
  debuggerServerError: ?any,
  debuggerIds: Array<DebuggerId>,
  unregisterDebuggerServerCallbacks: ?() => void,

  debuggerGameData: { [DebuggerId]: any },
  /** The games whose last state was too large to be sent whole. */
  truncatedGameDataIds: { [DebuggerId]: boolean },
  profilingInProgress: { [DebuggerId]: boolean },
  resourcesDebugSnapshots: { [DebuggerId]: ResourcesDebugSnapshot },
  debuggerStatus: { [DebuggerId]: DebuggerStatus },
  selectedId: DebuggerId,
  logs: { [DebuggerId]: Array<Log> },
  /**
   * What each imported recording holds, kept apart from `debuggerStatus` so
   * that launching a preview does not forget it: comparing two runs weeks
   * apart is exactly when a preview is launched again.
   */
  importedRecordings: { [DebuggerId]: DebuggerRecordingMetadata },
  /** The recording every panel compares the current one to, if any. */
  baselineDebuggerId: ?DebuggerId,
  /** What went wrong with the last import, shown until it is dismissed. */
  importError: ?string,
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
    truncatedGameDataIds: {},
    profilingInProgress: {},
    resourcesDebugSnapshots: {},
    debuggerStatus: {},
    selectedId: '0',
    logs: {},
    importedRecordings: {},
    baselineDebuggerId: null,
    importError: null,
  };
  /** Numbers the imported recordings, so that each has an id of its own. */
  _importedRecordingsCount: number = 0;
  _debuggerContents: { [DebuggerId]: ?DebuggerContent } = {};
  /**
   * The games to record as soon as they say they are running: the ones just
   * launched or restarted while recording on launch is asked for.
   */
  _recordOnConnectionIds: Set<DebuggerId> = new Set();
  _debuggerLogs: Map<DebuggerId, LogsManager> = new Map();
  _unsubscribeFromGameplayTestRun: ?() => void = null;
  // The recordings of the profiler, out of the state: chunks arrive twice a
  // second and the panels re-render on their own.
  _profilerRecordingStore: ProfilerRecordingStore = new ProfilerRecordingStore();

  updateToolbar = () => {
    const { selectedId, debuggerStatus } = this.state;
    const { debuggerSession } = this.props;

    const selectedDebuggerContents = this._debuggerContents[
      this.state.selectedId
    ];

    const isSelectedDebuggerPaused = debuggerStatus[selectedId]
      ? debuggerStatus[selectedId].isPaused
      : false;

    this.props.setToolbar(
      <Toolbar
        hasDebugger={this._hasSelectedDebugger()}
        onLaunchDebuggerAndPreview={debuggerSession.onLaunchDebuggerAndPreview}
        onClosePreviews={debuggerSession.onClosePreviews}
        canStepFrame={this._hasSelectedDebugger() && isSelectedDebuggerPaused}
        onStepFrame={() => this._stepFrame(this.state.selectedId)}
        isWatchedVariablesPanelOpen={
          debuggerSession.isWatchedVariablesPanelOpen
        }
        onToggleWatchedVariablesPanel={
          debuggerSession.onToggleWatchedVariablesPanel
        }
        debuggerPlaySpeed={debuggerSession.debuggerPlaySpeed}
        setDebuggerPlaySpeed={debuggerSession.setDebuggerPlaySpeed}
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
        canExportRecording={this._canShowSelectedDebugger()}
        onExportRecording={() => this._exportRecording(this.state.selectedId)}
        onImportRecording={this._importRecording}
        canCompareToBaseline={this._canShowSelectedDebugger()}
        isBaseline={this.state.baselineDebuggerId === this.state.selectedId}
        onToggleBaseline={() => this._toggleBaseline(this.state.selectedId)}
        canClear={this._canShowSelectedDebugger()}
        onClear={() => this._clear(this.state.selectedId)}
        canRestart={this._hasSelectedDebugger()}
        onRestart={() => this._restart(this.state.selectedId)}
        shouldRecordOnLaunch={this.props.shouldRecordOnLaunch}
        onToggleRecordOnLaunch={() =>
          this.props.setShouldRecordOnLaunch(!this.props.shouldRecordOnLaunch)
        }
        shouldClearOnRecord={this.props.shouldClearOnRecord}
        onToggleClearOnRecord={() =>
          this.props.setShouldClearOnRecord(!this.props.shouldClearOnRecord)
        }
        canOpenPanels={this._canShowSelectedDebugger()}
        shownPanelNames={
          selectedDebuggerContents
            ? DEBUGGER_PANELS.map(({ name }) => name).filter(name =>
                selectedDebuggerContents.isPanelShown(name)
              )
            : []
        }
        onTogglePanel={this._togglePanel}
      />
    );
  };

  _togglePanel = (panelName: DebuggerPanelName) => {
    const selectedDebuggerContents = this._debuggerContents[
      this.state.selectedId
    ];
    if (selectedDebuggerContents)
      selectedDebuggerContents.togglePanel(panelName);
  };

  componentDidMount() {
    this._registerServerCallbacks();
    // A gameplay test starting or ending changes what can be done to the
    // game: the buttons that act on it follow.
    this._unsubscribeFromGameplayTestRun = subscribeToGameplayTestRunInProgress(
      () => {
        this.forceUpdate();
        this.updateToolbar();
      }
    );
  }

  componentDidUpdate(prevProps: Props, prevState: State) {
    // The events sheets read the values of the preview chosen here.
    if (prevState.selectedId !== this.state.selectedId) {
      this.context.setTargetDebuggerId(this.state.selectedId);
    }
    // The toolbar is built once, when asked: it follows what the main frame
    // and the preferences change (the callbacks change on every render of
    // the main frame, and are not compared).
    const { debuggerSession } = this.props;
    const previousDebuggerSession = prevProps.debuggerSession;
    if (
      previousDebuggerSession.debuggerPlaySpeed !==
        debuggerSession.debuggerPlaySpeed ||
      previousDebuggerSession.isWatchedVariablesPanelOpen !==
        debuggerSession.isWatchedVariablesPanelOpen ||
      prevProps.shouldRecordOnLaunch !== this.props.shouldRecordOnLaunch ||
      prevProps.shouldClearOnRecord !== this.props.shouldClearOnRecord
    ) {
      this.updateToolbar();
    }
  }

  componentWillUnmount() {
    this.context.setTargetDebuggerId(null);
    if (this.state.unregisterDebuggerServerCallbacks) {
      this.state.unregisterDebuggerServerCallbacks();
    }
    if (this._unsubscribeFromGameplayTestRun) {
      this._unsubscribeFromGameplayTestRun();
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
                : pickRunningDebuggerId(
                    debuggerIds,
                    this.state.debuggerStatus
                  ) || selectedId,
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
        if (this.props.shouldRecordOnLaunch) {
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

  /** What is done with each message sent by a game, by command. */
  _messageHandlers: {
    [command: string]: (id: DebuggerId, data: any) => void,
  } = {
    dump: (id, data) => {
      this.setState({
        debuggerGameData: {
          ...this.state.debuggerGameData,
          [id]: data.payload,
        },
        truncatedGameDataIds: {
          ...this.state.truncatedGameDataIds,
          [id]: !!data.isTruncated,
        },
      });
    },
    status: (id, data) => {
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
    },
    'profiler.output': (id, data) => {
      this._profilerRecordingStore.onOutput(id, data.payload);
    },
    'profiler.started': (id, data) => {
      this._profilerRecordingStore.onStarted(id, data.payload);
      this.setState(
        state => ({
          profilingInProgress: { ...state.profilingInProgress, [id]: true },
        }),
        () => this.updateToolbar()
      );
    },
    'profiler.chunk': (id, data) => {
      this._profilerRecordingStore.onChunk(id, data.payload);
    },
    'profiler.stopped': (id, data) => {
      this._profilerRecordingStore.onStopped(id, data.payload);
      this.setState(
        state => ({
          profilingInProgress: { ...state.profilingInProgress, [id]: false },
        }),
        () => this.updateToolbar()
      );
      // Nothing is asked to the game here: the inspector follows the
      // selected element by itself, and the whole game is only sent on an
      // explicit refresh or pause.
    },
    // Answered to the inspector (see `_requestFromGame`).
    'inspector.dumped': ignoreMessage,
    'inspector.called': ignoreMessage,
    // Answered to `_requestResourcesDebugState` (see `_requestFromGame`).
    'resources.dumped': ignoreMessage,
    // Answered to the events sheets (see EventsExecutionTracking).
    expressionValue: ignoreMessage,
    'hotReloader.logs': ignoreMessage,
    updateInstances: ignoreMessage,
    // Handled by the events sheets (see EventsExecutionTracking).
    'eventsExecutionTracker.output': ignoreMessage,
    'console.log': (id, data) => {
      // Filter out unavoidable warnings that do not concern non-engine devs.
      if (isUnavoidableLibraryWarning(data.payload)) return;
      this._getLogsManager(id).addLog(data.payload);
    },
  };

  _handleMessage = (id: DebuggerId, data: any) => {
    // Own properties only: a command named like a method of every object
    // (`toString`...) is unknown too.
    if (
      !Object.prototype.hasOwnProperty.call(this._messageHandlers, data.command)
    ) {
      console.warn(
        'Unknown command received from debugger client:',
        data.command
      );
      return;
    }
    this._messageHandlers[data.command](id, data);
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
    // The inspector reads the edited element again by itself: the whole game
    // is not asked for.
    return true;
  };

  _call = (id: DebuggerId, path: Array<string>, args: Array<any>): any => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, {
      command: 'call',
      path,
      args,
    });
    // The inspector reads the edited element again by itself: the whole game
    // is not asked for.
    return true;
  };

  _startProfiler = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    // Recording again starts from a blank slate, unless asked otherwise. What
    // is inspected is kept: throwing it away would unmount the tree of the
    // Inspector, folding everything the user had opened.
    if (this.props.shouldClearOnRecord && !this.state.profilingInProgress[id]) {
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
    // Everything is forgotten and starts again from scratch: the state of the
    // game is only asked for again when the user refreshes or pauses.
    this._forgetRecordedData(id);
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
    this.setState(state =>
      forgetRecordedData(getRecordingsState(state), id, options)
    );
  };

  /** The recording and the logs of a game, which live out of the state. */
  _forgetDebuggerStores = (id: DebuggerId) => {
    this._profilerRecordingStore.clear(id);
    this._getLogsManager(id).clear();
    this._debuggerLogs.delete(id);
  };

  /**
   * Forget everything about a game: what it recorded and its status, so that
   * it disappears from the debugger.
   */
  _forgetDebugger = (id: DebuggerId) => {
    this._forgetDebuggerStores(id);
    this.setState(
      state => forgetDebugger(getRecordingsState(state), id),
      () => this.updateToolbar()
    );
  };

  /**
   * A game was just launched: it takes over what the closed games left on
   * screen (see `carryOverClosedDebuggersData`). The logs are not carried
   * over: a console is the story of one run, and mixing two of them would
   * read as one.
   */
  _carryOverClosedDebuggersData = (
    newDebuggerId: DebuggerId,
    connectedDebuggerIds: Array<DebuggerId>
  ) => {
    const closedIds = getClosedDebuggerIds(
      this.state.debuggerStatus,
      connectedDebuggerIds
    );
    const previousId = getCarriedOverDebuggerId(closedIds, newDebuggerId);
    if (previousId != null) {
      this._profilerRecordingStore.transfer(previousId, newDebuggerId);
    }
    closedIds.forEach(id => this._forgetDebuggerStores(id));
    this.setState(
      state =>
        carryOverClosedDebuggersData(
          getRecordingsState(state),
          newDebuggerId,
          closedIds
        ),
      () => this.updateToolbar()
    );
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

  /** An imported recording, read only: nothing can be played or recorded on it. */
  _isImportedDebugger = (id: DebuggerId): boolean =>
    !!this.state.importedRecordings[id];

  /**
   * True when there is something to show: a running game, a closed one whose
   * data is kept, or a recording read from a file.
   */
  _canShowSelectedDebugger = (): boolean =>
    this._hasSelectedDebugger() ||
    this._hasKeptDataForSelectedDebugger() ||
    this._isImportedDebugger(this.state.selectedId);

  /**
   * Write everything recorded about a preview to a file the user keeps where
   * they want: nothing of the debugger is ever stored in the project.
   */
  _exportRecording = async (id: DebuggerId) => {
    const { project } = this.props;
    const resourcesDebugSnapshot = this.state.resourcesDebugSnapshots[id];
    try {
      const file = makeDebuggerRecordingFile({
        projectName: project.getName(),
        recording: this._profilerRecordingStore.getRecording(id),
        resourcesDebugState: resourcesDebugSnapshot
          ? resourcesDebugSnapshot.state
          : null,
        logs: this._getLogsManager(id).logs,
      });
      await exportDebuggerRecording(file);
    } catch (error) {
      console.error('Unable to export the recorded data:', error);
      this.setState({
        importError: 'The recorded data could not be written to a file.',
      });
    }
  };

  /**
   * Read a recording from a file and show it as a game of its own, read
   * only: it is selected right away, which is what the user asked for.
   */
  _importRecording = async () => {
    let file;
    try {
      file = await importDebuggerRecording();
    } catch (error) {
      console.error('Unable to import a recording:', error);
      this.setState({
        importError:
          error instanceof DebuggerRecordingFileError
            ? error.message
            : 'This file could not be read as a recording.',
      });
      return;
    }
    if (!file) return;

    const recording = getRecordingFromFile(file);
    if (!recording) {
      this.setState({ importError: 'This recording holds no frames.' });
      return;
    }

    const id = `imported:${++this._importedRecordingsCount}`;
    this._profilerRecordingStore.setRecording(id, recording);
    const logsManager = this._getLogsManager(id);
    // The console keeps its logs newest first, and adding one puts it on
    // top: they are replayed oldest first to come back in their own order.
    logsManager.logs.length = 0;
    file.logs
      .slice()
      .reverse()
      .forEach(log => logsManager.addLog(log));

    const importedFile = file;
    this.setState(
      state => ({
        ...addImportedRecording(
          getRecordingsState(state),
          id,
          importedFile.metadata,
          importedFile.resources
        ),
        selectedId: id,
        importError: null,
      }),
      () => this.updateToolbar()
    );
  };

  /**
   * Keep a recording as the reference every panel compares to, so that what
   * an optimisation changed is read as a difference and not from memory.
   */
  _toggleBaseline = (id: DebuggerId) => {
    this.setState(
      state => ({
        baselineDebuggerId: state.baselineDebuggerId === id ? null : id,
      }),
      () => this.updateToolbar()
    );
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
   * Ask the game something and wait for its answer: resolves to what the game
   * answered, or to why it did not (closed, or busy, when it did not answer in
   * time). Each caller chooses what a missing answer means.
   */
  _requestFromGame = async (
    id: DebuggerId,
    command: string,
    payload?: Object,
    timeoutMs?: number
  ): Promise<GameAnswer> => {
    const { previewDebuggerServer } = this.props;
    try {
      const answer = await previewDebuggerServer.sendMessageWithResponse(
        payload === undefined ? { command } : { command, payload },
        id,
        timeoutMs
      );
      return { payload: answer.payload, error: null };
    } catch (error) {
      return { payload: undefined, error };
    }
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
    const { payload } = await this._requestFromGame(id, 'inspector.dump', {
      path,
    });
    // `0`, `""` and `false` are values to show, not missing answers.
    return payload !== undefined ? payload : null;
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
    const { payload } = await this._requestFromGame(id, 'inspector.call', {
      path,
      calls,
    });
    return Array.isArray(payload) ? payload : null;
  };

  /**
   * Ask the game for the state of its resources. On failure, the previous
   * snapshot is kept and the error is shown.
   */
  _requestResourcesDebugState = async (id: DebuggerId): Promise<void> => {
    const previousSnapshot = this.state.resourcesDebugSnapshots[id];
    const { payload, error } = await this._requestFromGame(
      id,
      'resources.dump',
      undefined,
      RESOURCES_DUMP_TIMEOUT_MS
    );
    const errorMessage = error
      ? error.message || String(error)
      : !payload
      ? 'No payload in the answer.'
      : payload.error
      ? String(payload.error)
      : null;
    if (errorMessage === null) {
      this.setState(state => ({
        resourcesDebugSnapshots: {
          ...state.resourcesDebugSnapshots,
          [id]: { state: payload, lastUpdatedAt: Date.now(), lastError: null },
        },
      }));
      return;
    }
    this.setState(state => ({
      resourcesDebugSnapshots: {
        ...state.resourcesDebugSnapshots,
        [id]: {
          state: previousSnapshot ? previousSnapshot.state : null,
          lastUpdatedAt: previousSnapshot ? previousSnapshot.lastUpdatedAt : 0,
          lastError: errorMessage,
        },
      },
    }));
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
      importedRecordings,
      baselineDebuggerId,
      importError,
    } = this.state;
    const isImportedRecordingSelected = !!importedRecordings[selectedId];
    // Compared to another recording, unless it is the reference itself.
    const baselineRecording =
      baselineDebuggerId && baselineDebuggerId !== selectedId
        ? this._profilerRecordingStore.getRecording(baselineDebuggerId)
        : null;
    const baselineResourcesDebugSnapshot =
      baselineDebuggerId && baselineDebuggerId !== selectedId
        ? resourcesDebugSnapshots[baselineDebuggerId]
        : null;
    const selectedMetadata = importedRecordings[selectedId];
    const selectedProjectName = selectedMetadata
      ? selectedMetadata.projectName
      : this.props.project
      ? this.props.project.getName()
      : null;

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
    // A recording can only be started on a preview that is running, and not
    // while a gameplay test owns the game (as for the toolbar buttons).
    const canRecord =
      this._hasSelectedDebugger() && !getIsGameplayTestRunInProgress();
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
            importedRecordings={importedRecordings}
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
          {baselineRecording && (
            <ComparisonWarnings
              baselineMetadata={
                baselineDebuggerId
                  ? importedRecordings[baselineDebuggerId]
                  : null
              }
              selectedProjectName={selectedProjectName}
              baselineFramesCount={baselineRecording.frames.length}
            />
          )}
          {importError && (
            <AlertMessage
              kind="error"
              onHide={() => this.setState({ importError: null })}
            >
              {importError}
            </AlertMessage>
          )}
          {isImportedRecordingSelected && (
            <AlertMessage
              kind="info"
              renderRightButton={() => (
                <FlatButton
                  label={<Trans>Close</Trans>}
                  onClick={() => this._clear(selectedId)}
                />
              )}
            >
              <Trans>
                This recording was read from a file: it is read only, and it is
                gone from the editor once closed. The file it came from is
                untouched.
              </Trans>
            </AlertMessage>
          )}
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
              isGameDataTruncated={
                !!this.state.truncatedGameDataIds[selectedId]
              }
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
              baselineRecording={baselineRecording}
              canRecord={canRecord}
              onStartRecording={() => this._startProfiler(selectedId)}
              profilerRecordingStore={this._profilerRecordingStore}
              debuggerId={selectedId}
              resourcesDebugSnapshot={resourcesDebugSnapshots[selectedId]}
              baselineResourcesDebugState={
                baselineResourcesDebugSnapshot
                  ? baselineResourcesDebugSnapshot.state
                  : null
              }
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
                onAction={this.props.debuggerSession.onLaunchDebuggerAndPreview}
              />
            </Line>
          )}
        </Column>
      </Background>
    );
  }
}
