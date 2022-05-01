namespace gdjs {
  const logger = new gdjs.Logger('Debugger client (window message)');

  /**
   * This debugger client connects to the parent window, exchanging
   * and receiving messages using `postMessage` and the `message` event listener.
   */
  export class WindowMessageDebuggerClient extends gdjs.AbstractDebuggerClient {
    _opener: Window | null = null;

    /**
     * @param path - The path of the property to modify, starting from the RuntimeGame.
     */
    constructor(runtimeGame: RuntimeGame) {
      super(runtimeGame);

      this._opener = window.opener || null;
      if (!this._opener) {
        logger.info("`window.opener` not existing, the debugger won't work.");
        return;
      }

      window.addEventListener('message', (event) => {
        const data = event.data;
        this.handleCommand(data);
      });
    }

    protected _sendMessage(message: string) {
      if (!this._opener) return;

      try {
        this._opener.postMessage(message, '*');
      } catch (error) {
        this._originalConsole.warn(
          'Error while sending a message to the debugger:',
          error
        );
      }
    }
  }

  //Register the class to let the engine use it.
  // @ts-ignore
  export const DebuggerClient = WindowMessageDebuggerClient;
}
