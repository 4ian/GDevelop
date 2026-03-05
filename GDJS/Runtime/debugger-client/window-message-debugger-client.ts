namespace gdjs {
  const logger = new gdjs.Logger('Debugger client (window message)');

  /**
   * This debugger client connects to the parent window, exchanging
   * and receiving messages using `postMessage` and the `message` event listener.
   * @category Debugging > Debugger Client
   */
  export class WindowMessageDebuggerClient extends gdjs.AbstractDebuggerClient {
    _opener: Window | null = null;
    private _onWindowMessage = (event: MessageEvent) => {
      const data = event.data;
      this.handleCommand(data);
    };

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

      window.addEventListener('message', this._onWindowMessage);
    }

    dispose() {
      window.removeEventListener('message', this._onWindowMessage);
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
  /** @category Debugging > Debugger Client */
  // @ts-ignore
  export const DebuggerClient = WindowMessageDebuggerClient;
}
