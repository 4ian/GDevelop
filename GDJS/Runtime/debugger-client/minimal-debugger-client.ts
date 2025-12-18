namespace gdjs {
  /**
   * Does nothing apart from allowing to reporting errors.
   * @category Debugging > Debugger Client
   */
  export class MinimalDebuggerClient extends gdjs.AbstractDebuggerClient {
    constructor(runtimeGame: RuntimeGame) {
      super(runtimeGame);
    }

    protected _sendMessage(message: string) {}
  }

  //Register the class to let the engine use it.
  /** @category Debugging > Debugger Client */
  // @ts-ignore
  export const DebuggerClient = WindowMessageDebuggerClient;
}
