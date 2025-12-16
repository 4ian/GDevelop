namespace gdjs {
  const logger = new gdjs.Logger('Debugger client (window message)');

  /**
   * This debugger client connects to the parent window, exchanging
   * and receiving messages using `postMessage` and the `message` event listener.
   * @group Debugging
   * @category Debugger Client
   */
  export class WindowMessageDebuggerClient extends gdjs.AbstractDebuggerClient {
    _opener: Window | null = null;

    constructor(runtimeGame: RuntimeGame) {
      super(runtimeGame);

      // Opener is either the `opener` for popups, or the `parent` if the game
      // is running as an iframe (notably: in-game edition).
      this._opener = window.opener || null;
      if (!this._opener && window.parent !== window) {
        this._opener = window.parent;
      }

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
