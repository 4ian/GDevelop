// @flow
import * as React from 'react';
import Toolbar from './Toolbar';
import DebuggerContent from './DebuggerContent';
import optionalRequire from '../Utils/OptionalRequire';
const electron = optionalRequire('electron');
const ipcRenderer = electron ? electron.ipcRenderer : null;

type Props = {|
  project: gdProject,
  setToolbar: (React.Node) => void,
  isActive: boolean,
|};
type State = {|
  debuggerServerStarted: boolean,
  debuggerServerError: ?any,
  debuggerConnectionOpen: boolean,
  gameData: ?any,
|};

export default class Debugger extends React.Component<Props, State> {
  state = {
    debuggerServerStarted: false,
    debuggerServerError: null,
    debuggerConnectionOpen: false,
    gameData: null,
  };

  updateToolbar() {
    this.props.setToolbar(
      <Toolbar
        onPlay={this._play}
        onPause={this._pause}
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

  _startServer = () => {
    if (!ipcRenderer) return;

    this.setState({
      debuggerServerStarted: false,
    });

    ipcRenderer.removeAllListeners('debugger-send-message-done');

    ipcRenderer.removeAllListeners('debugger-error-received');
    ipcRenderer.on('debugger-error-received', (event, err) => {
      this.setState({
        debuggerServerError: err,
      });
    });

    ipcRenderer.removeAllListeners('debugger-connection-closed');
    ipcRenderer.on('debugger-connection-closed', event => {
      this.setState({
        debuggerConnectionOpen: false,
      });
    });

    ipcRenderer.removeAllListeners('debugger-connection-opened');
    ipcRenderer.on('debugger-connection-opened', event => {
      this.setState({
        debuggerConnectionOpen: true,
      });
    });

    ipcRenderer.removeAllListeners('debugger-start-server-done');
    ipcRenderer.on('debugger-start-server-done', event => {
      this.setState({
        debuggerServerStarted: true,
      });
    });

    ipcRenderer.removeAllListeners('debugger-message-received');
    ipcRenderer.on('debugger-message-received', (event, message) => {
      console.log('Processing message received for debugger');
      try {
        const data = JSON.parse(message);
        this._handleMessage(data);
      } catch (e) {
        console.warn(
          'Error while parsing message received from debugger client:',
          e
        );
      }
    });
    ipcRenderer.send('debugger-start-server');
  };

  _handleMessage = (data: any) => {
    if (data.command === 'dump') {
      this.setState({
        gameData: data.payload,
      });
    } else {
      console.warn("Unknown command received from debugger client:", data.command);
    }
  };

  _play = () => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', '{"command": "play"}');
  };

  _pause = () => {
    if (!ipcRenderer) return;

    ipcRenderer.send('debugger-send-message', '{"command": "pause"}');
  };

  render() {
    const {
      debuggerServerError,
      debuggerServerStarted,
      debuggerConnectionOpen,
      gameData,
    } = this.state;

    return (
      <DebuggerContent
        debuggerServerError={debuggerServerError}
        debuggerServerStarted={debuggerServerStarted}
        debuggerConnectionOpen={debuggerConnectionOpen}
        gameData={gameData}
        onPlay={this._play}
        onPause={this._pause}
      />
    );
  }
}
