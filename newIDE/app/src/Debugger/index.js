// @flow
import { Trans } from '@lingui/macro';

import * as React from 'react';
import Toolbar from './Toolbar';
import DebuggerContent from './DebuggerContent';
import DebuggerSelector from './DebuggerSelector';
import { Column } from '../UI/Grid';
import PlaceholderLoader from '../UI/PlaceholderLoader';
import PlaceholderMessage from '../UI/PlaceholderMessage';
import Background from '../UI/Background';
import optionalRequire from '../Utils/OptionalRequire';
import EmptyMessage from '../UI/EmptyMessage';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

//Each game connected to the debugger server is identified by a unique number
export type DebuggerId = number;

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
|};

type State = {|
  debuggerServerStarted: boolean,
  debuggerServerError: ?any,

  debuggerIds: Array<DebuggerId>,
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
    debuggerServerStarted: false,
    debuggerServerError: null,
    debuggerIds: [],
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
        onOpenProfiler={() => {
          if (this._debuggerContents[this.state.selectedId])
            this._debuggerContents[this.state.selectedId].openProfiler();
        }}
      />
    );
  }

  componentDidMount() {
    if (this.props.isActive) {
      this._startServer();
    }
  }

  componentWillReceiveProps(nextProps: Props) {
    if (nextProps.isActive && !this.props.isActive) {
      this._startServer();
    }
  }

  componentWillUnmount() {
    this._removeServerListeners();
  }

  _removeServerListeners = () => {
    if (!ipcRenderer) return;

    ipcRenderer.removeAllListeners('debugger-send-message-done');
    ipcRenderer.removeAllListeners('debugger-error-received');
    ipcRenderer.removeAllListeners('debugger-connection-closed');
    ipcRenderer.removeAllListeners('debugger-connection-opened');
    ipcRenderer.removeAllListeners('debugger-start-server-done');
    ipcRenderer.removeAllListeners('debugger-message-received');
  };

  _startServer = () => {
    if (!ipcRenderer) return;

    this.setState({
      debuggerServerStarted: false,
    });
    this._removeServerListeners();

    ipcRenderer.on('debugger-error-received', (event, err) => {
      this.setState(
        {
          debuggerServerError: err,
        },
        () => this.updateToolbar()
      );
    });

    ipcRenderer.on('debugger-connection-closed', (event, { id }) => {
      const { debuggerIds, selectedId } = this.state;
      const remainingDebuggerIds = debuggerIds.filter(
        debuggerId => debuggerId !== id
      );
      this.setState(
        {
          debuggerIds: remainingDebuggerIds,
          selectedId:
            selectedId !== id
              ? selectedId
              : remainingDebuggerIds.length
              ? remainingDebuggerIds[remainingDebuggerIds.length - 1]
              : selectedId,
        },
        () => this.updateToolbar()
      );
    });

    ipcRenderer.on('debugger-connection-opened', (event, { id }) => {
      this.setState(
        {
          debuggerIds: [...this.state.debuggerIds, id],
          selectedId: id,
        },
        () => this.updateToolbar()
      );
    });

    ipcRenderer.on('debugger-start-server-done', event => {
      this.setState(
        {
          debuggerServerStarted: true,
        },
        () => this.updateToolbar()
      );
    });

    ipcRenderer.on('debugger-message-received', (event, { id, message }) => {
      console.log('Processing message received for debugger');
      try {
        const data = JSON.parse(message);
        this._handleMessage(id, data);
      } catch (e) {
        console.warn(
          'Error while parsing message received from debugger client:',
          e
        );
      }
    });
    ipcRenderer.send('debugger-start-server');
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
    } else {
      console.warn(
        'Unknown command received from debugger client:',
        data.command
      );
    }
  };

  _play = (id: DebuggerId) => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: '{"command": "play"}',
    });
  };

  _pause = (id: DebuggerId) => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: '{"command": "pause"}',
    });
  };

  _refresh = (id: DebuggerId) => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: '{"command": "refresh"}',
    });
  };

  _edit = (id: DebuggerId, path: Array<string>, newValue: any) => {
    if (!ipcRenderer) return false;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: JSON.stringify({
        command: 'set',
        path,
        newValue,
      }),
    });

    setTimeout(() => this._refresh(id), 100);
    return true;
  };

  _call = (id: DebuggerId, path: Array<string>, args: Array<any>) => {
    if (!ipcRenderer) return false;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: JSON.stringify({
        command: 'call',
        path,
        args,
      }),
    });

    setTimeout(() => this._refresh(id), 100);
    return true;
  };

  _startProfiler = (id: DebuggerId) => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: '{"command": "profiler.start"}',
    });
  };

  _stopProfiler = (id: DebuggerId) => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', {
      id,
      message: '{"command": "profiler.stop"}',
    });
  };

  _hasSelectedDebugger = () => {
    const { selectedId, debuggerIds } = this.state;
    return debuggerIds.indexOf(selectedId) !== -1;
  };

  render() {
    const {
      debuggerServerError,
      debuggerServerStarted,
      selectedId,
      debuggerIds,
      debuggerGameData,
      profilerOutputs,
      profilingInProgress,
    } = this.state;

    return (
      <Background>
        {!debuggerServerStarted && !debuggerServerError && (
          <PlaceholderMessage>
            <PlaceholderLoader />
            <p>
              <Trans>Debugger is starting...</Trans>
            </p>
          </PlaceholderMessage>
        )}
        {!debuggerServerStarted && debuggerServerError && (
          <PlaceholderMessage>
            <p>
              <Trans>
                Unable to start the debugger server! Make sure that you are
                authorized to run servers on this computer.
              </Trans>
            </p>
          </PlaceholderMessage>
        )}
        {debuggerServerStarted && (
          <Column expand noMargin>
            <DebuggerSelector
              selectedId={selectedId}
              debuggerIds={debuggerIds}
              onChooseDebugger={id =>
                this.setState({
                  selectedId: id,
                })
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
