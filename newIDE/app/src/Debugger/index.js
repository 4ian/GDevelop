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
} from '../Export/PreviewLauncher.flow';

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

type Props = {|
  project: gdProject,
  setToolbar: React.Node => void,
  isActive: boolean,
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
  selectedId: DebuggerId,
|};

/**
 * Start the debugger server, listen to commands received and issue commands to it.
 * This is only supported on Electron runtime for now.
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
    selectedId: 0,
  };

  _debuggerContents: { [DebuggerId]: ?DebuggerContent } = {};

  updateToolbar() {
    if (!this.props.isActive) return;

    this.props.setToolbar(
      <Toolbar
        onPlay={() => this._play(this.state.selectedId)}
        onPause={() => this._pause(this.state.selectedId)}
        canPlay={this._hasSelectedDebugger()}
        canPause={this._hasSelectedDebugger()}
        canOpenProfiler={this._hasSelectedDebugger()}
        onOpenProfiler={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].openProfiler();
        }}
      />
    );
  }

  componentDidMount() {
    if (this.props.isActive) {
      this._registerServerCallbacks();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isActive && !this.props.isActive) {
      this._registerServerCallbacks();
    }
  }

  componentWillUnmount() {
    if (this.state.unregisterDebuggerServerCallbacks) {
      this.state.unregisterDebuggerServerCallbacks();
    }
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
        this.setState(
          ({ selectedId }) => ({
            debuggerIds,
            selectedId:
              selectedId !== id
                ? selectedId
                : debuggerIds.length
                ? debuggerIds[debuggerIds.length - 1]
                : selectedId,
          }),
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
    } else if (data.command === 'hotReloader.logs') {
      // Nothing to do.
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
  };

  _pause = (id: DebuggerId) => {
    const { previewDebuggerServer } = this.props;
    previewDebuggerServer.sendMessage(id, { command: 'pause' });
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
