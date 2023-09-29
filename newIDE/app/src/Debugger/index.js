// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Toolbar from './Toolbar';
import DebuggerContent from './DebuggerContent';
import DebuggerSelector from './DebuggerSelector';
import { Column } from '../UI/Grid';
import Text from '../UI/Text';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import Background from '../UI/Background';
import EmptyMessage from '../UI/EmptyMessage';
import {
  type PreviewDebuggerServer,
  type DebuggerId,
} from '../ExportAndShare/PreviewLauncher.flow';
import { type Log, LogsManager } from './DebuggerConsole';

export type ProfilerMeasuresSection = {|
  time: number,
  subsections: { [string]: ProfilerMeasuresSection },
|};

export type ProfilerOutput = {|
  framesAverageMeasures: ProfilerMeasuresSection,
  stats: {
    framesCount: number,
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
|};

type State = {|
  debuggerServerState: 'started' | 'stopped',
  debuggerServerError: ?any,
  debuggerIds: Array<DebuggerId>,
  unregisterDebuggerServerCallbacks: ?() => void,

  debuggerGameData: { [DebuggerId]: any },
  profilerOutputs: { [DebuggerId]: ProfilerOutput },
  profilingInProgress: { [DebuggerId]: boolean },
  gameIsPaused: { [DebuggerId]: boolean },
  selectedId: DebuggerId,
  logs: { [DebuggerId]: Array<Log> },
|};

/**
 * Start the debugger server, listen to commands received and issue commands to it.
 */
export default class Debugger extends React.Component<Props, State> {
  state = {
    debuggerServerState: this.props.previewDebuggerServer.getServerState(),
    debuggerServerError: null,
    debuggerIds: this.props.previewDebuggerServer.getExistingDebuggerIds(),
    unregisterDebuggerServerCallbacks: null,
    debuggerGameData: {},
    profilerOutputs: {},
    profilingInProgress: {},
    gameIsPaused: {},
    selectedId: 0,
    logs: {},
  };

  _debuggerContents: { [DebuggerId]: ?DebuggerContent } = {};
  _debuggerLogs: Map<number, LogsManager> = new Map();

  updateToolbar = () => {
    const { selectedId, gameIsPaused } = this.state;

    const selectedDebuggerContents = this._debuggerContents[
      this.state.selectedId
    ];

    this.props.setToolbar(
      <Toolbar
        onPlay={() => this._play(this.state.selectedId)}
        onPause={() => this._pause(this.state.selectedId)}
        canPlay={this._hasSelectedDebugger() && gameIsPaused[selectedId]}
        canPause={this._hasSelectedDebugger() && !gameIsPaused[selectedId]}
        canOpenProfiler={this._hasSelectedDebugger()}
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

  _getLogsManager(id: number): LogsManager {
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
        this.setState(
          ({
            selectedId,
            debuggerGameData,
            profilerOutputs,
            profilingInProgress,
            gameIsPaused,
          }) => {
            // Remove any data bound to the instance that might have been stored.
            // Otherwise this would be a memory leak.
            if (debuggerGameData[id]) delete debuggerGameData[id];
            if (profilerOutputs[id]) delete profilerOutputs[id];
            if (profilingInProgress[id]) delete profilingInProgress[id];
            if (gameIsPaused[id]) delete gameIsPaused[id];

            return {
              debuggerIds,
              selectedId:
                selectedId !== id
                  ? selectedId
                  : debuggerIds.length
                  ? debuggerIds[debuggerIds.length - 1]
                  : selectedId,
              debuggerGameData,
              profilerOutputs,
              profilingInProgress,
              gameIsPaused,
            };
          },
          () => this.updateToolbar()
        );
      },
      onConnectionOpened: ({ id, debuggerIds }) => {
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
  };

  _handleMessage = (id: DebuggerId, data: any) => {
    if (data.command === 'dump') {
      this.setState({
        debuggerGameData: {
          ...this.state.debuggerGameData,
          [id]: data.payload,
        },
      });
    } else if (data.command === 'profiler.output') {
      this.setState({
        profilerOutputs: {
          ...this.state.profilerOutputs,
          [id]: data.payload,
        },
      });
    } else if (data.command === 'profiler.started') {
      this.setState(state => ({
        profilingInProgress: { ...state.profilingInProgress, [id]: true },
      }));
    } else if (data.command === 'profiler.stopped') {
      this.setState(state => ({
        profilingInProgress: { ...state.profilingInProgress, [id]: false },
      }));
    } else if (data.command === 'game.resumed') {
      this.setState(
        state => ({
          gameIsPaused: { ...state.gameIsPaused, [id]: false },
        }),
        () => this.updateToolbar()
      );
    } else if (data.command === 'game.paused') {
      this.setState(
        state => ({
          gameIsPaused: { ...state.gameIsPaused, [id]: true },
        }),
        () => this.updateToolbar()
      );
    } else if (data.command === 'hotReloader.logs') {
      // Nothing to do.
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

    this.setState(
      state => ({
        gameIsPaused: { ...state.gameIsPaused, [id]: false },
      }),
      () => this.updateToolbar()
    );
  };

  _pause = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'pause' });

    this.setState(
      state => ({
        gameIsPaused: { ...state.gameIsPaused, [id]: true },
      }),
      () => this.updateToolbar()
    );
  };

  _refresh = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'refresh' });
  };

  _edit = (id: DebuggerId, path: Array<string>, newValue: any) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, {
      command: 'set',
      path,
      newValue,
    });

    setTimeout(() => this._refresh(id), 100);
    return true;
  };

  _call = (id: DebuggerId, path: Array<string>, args: Array<any>) => {
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
    previewDebuggerServer.sendMessage(id, { command: 'profiler.start' });
  };

  _stopProfiler = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'profiler.stop' });
  };

  _hasSelectedDebugger = () => {
    const { selectedId, debuggerIds } = this.state;
    return debuggerIds.indexOf(selectedId) !== -1;
  };

  render() {
    const {
      debuggerServerError,
      debuggerServerState,
      selectedId,
      debuggerIds,
      debuggerGameData,
      profilerOutputs,
      profilingInProgress,
    } = this.state;

    return (
      <Background>
        {debuggerServerState === 'stopped' && !debuggerServerError && (
          <PlaceholderMessage>
            <PlaceholderLoader />
            <Text>
              <Trans>Debugger is starting...</Trans>
            </Text>
          </PlaceholderMessage>
        )}
        {debuggerServerState === 'stopped' && debuggerServerError && (
          <PlaceholderMessage>
            <Text>
              <Trans>
                Unable to start the debugger server! Make sure that you are
                authorized to run servers on this computer.
              </Trans>
            </Text>
          </PlaceholderMessage>
        )}
        {debuggerServerState === 'started' && (
          <Column expand noMargin>
            <DebuggerSelector
              selectedId={selectedId}
              debuggerIds={debuggerIds}
              onChooseDebugger={id =>
                this.setState(
                  {
                    selectedId: id,
                  },
                  () => this.updateToolbar()
                )
              }
            />
            {this._hasSelectedDebugger() && (
              <DebuggerContent
                ref={debuggerContent =>
                  (this._debuggerContents[selectedId] = debuggerContent)
                }
                gameData={debuggerGameData[selectedId]}
                onPlay={() => this._play(selectedId)}
                onPause={() => this._pause(selectedId)}
                onRefresh={() => this._refresh(selectedId)}
                onEdit={(path, args) => this._edit(selectedId, path, args)}
                onCall={(path, args) => this._call(selectedId, path, args)}
                onStartProfiler={() => this._startProfiler(selectedId)}
                onStopProfiler={() => this._stopProfiler(selectedId)}
                profilerOutput={profilerOutputs[selectedId]}
                profilingInProgress={profilingInProgress[selectedId]}
                logsManager={this._getLogsManager(selectedId)}
                onOpenedEditorsChanged={this.updateToolbar}
              />
            )}
            {!this._hasSelectedDebugger() && (
              <EmptyMessage>
                <Trans>
                  Run a preview and you will be able to inspect it with the
                  debugger.
                </Trans>
              </EmptyMessage>
            )}
          </Column>
        )}
      </Background>
    );
  }
}
