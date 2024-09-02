namespace gdjs {
  /**
   * Does nothing apart from allowing to reporting errors.
   */
  export class MinimalDebuggerClient extends gdjs.AbstractDebuggerClient {
    constructor(runtimeGame: RuntimeGame) {
      super(runtimeGame);
    }

    protected _sendMessage(message: string) {}
  }

  //Register the class to let the engine use it.
  // @ts-ignore
  export const DebuggerClient = WindowMessageDebuggerClient;
}
