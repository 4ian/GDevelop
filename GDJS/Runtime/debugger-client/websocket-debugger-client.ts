namespace gdjs {
  const logger = new gdjs.Logger('Debugger client (websocket)');

  /**
   * This debugger client connects to a websocket server, exchanging
   * and receiving messages with this server.
   */
  export class WebsocketDebuggerClient extends gdjs.AbstractDebuggerClient {
    _ws: WebSocket | null;

    /**
     * @param path - The path of the property to modify, starting from the RuntimeGame.
     */
    constructor(runtimeGame: RuntimeGame) {
      super(runtimeGame);
      this._ws = null;
      if (typeof WebSocket === 'undefined') {
        logger.log("WebSocket is not defined, the debugger won't work.");
        return;
      }

      const that = this;
      try {
        // Find the WebSocket server to connect to using the address that was stored
        // in the options by the editor. If not, try the default address, though it's unlikely
        // to work - which is ok, the game can run without a debugger server.
        const runtimeGameOptions = runtimeGame.getAdditionalOptions();
        const address =
          (runtimeGameOptions &&
            runtimeGameOptions.websocketDebuggerServerAddress) ||
          '127.0.0.1';
        const port =
          (runtimeGameOptions &&
            runtimeGameOptions.websocketDebuggerServerPort) ||
          '3030';
        this._ws = new WebSocket('ws://' + address + ':' + port + '/');
      } catch (e) {
        logger.log(
          "WebSocket could not initialize, debugger/hot-reload won't work."
        );
        return;
      }
      this._ws.onopen = function open() {
        logger.info('Debugger connection open');
      };
      this._ws.onclose = function close() {
        logger.info('Debugger connection closed');
      };
      this._ws.onerror = function errored(error) {
        logger.warn('Debugger client error:', error);
      };
      this._ws.onmessage = function incoming(message) {
        let data: any = null;
        try {
          data = JSON.parse(message.data);
        } catch (error) {
          logger.info('Debugger received a badly formatted message:', error);
        }
        that.handleCommand(data);
      };
    }

    protected _sendMessage(message: string) {
      if (!this._ws) {
        logger.warn('No connection to debugger opened to send a message.');
        return;
      }
      if (this._ws.readyState === 1) this._ws.send(message);
    }
  }

  //Register the class to let the engine use it.
  // @ts-ignore
  export const DebuggerClient = WebsocketDebuggerClient;
}
