// @ts-check

describe('Errors of the code of extensions in the in-game editor', function () {
  /**
   * A test game in edition mode, keeping the errors it is asked to report.
   * @returns {Promise<{runtimeGame: gdjs.RuntimeGame, reportedErrors: Array<{error: unknown, origin: {phase: string, type?: string}}>}>}
   */
  const makeEditedGame = async () => {
    // A game of its own (not the one shared by the tests), as it is changed.
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets({});
    /** @type {Array<{error: unknown, origin: {phase: string, type?: string}}>} */
    const reportedErrors = [];
    runtimeGame.isInGameEdition = () => true;
    runtimeGame.reportInGameEditorExtensionError = (error, origin) => {
      reportedErrors.push({ error, origin });
    };
    return { runtimeGame, reportedErrors };
  };

  /** A custom object whose events throw, like generated code would. */
  class ThrowingCustomObject extends gdjs.CustomRuntimeObject3D {
    /**
     * @param {gdjs.RuntimeInstanceContainer} parent
     * @param {ObjectData & gdjs.CustomObjectConfiguration} objectData
     */
    constructor(parent, objectData) {
      super(parent, objectData, undefined);
      this.onCreated();
    }
    onCreated() {
      throw new Error('onCreated failed');
    }
    /** @param {gdjs.RuntimeInstanceContainer} parent */
    doStepPostEvents(parent) {
      throw new Error('doStepPostEvents failed');
    }
  }

  /** @param {gdjs.RuntimeGame} runtimeGame */
  const createThrowingCustomObject = (runtimeGame) => {
    const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
    const customObject = new ThrowingCustomObject(runtimeScene, {
      name: 'MyCustomObject',
      type: 'MyExtension::MyEventsBasedObject',
      variant: '',
      isInnerAreaFollowingParentSize: false,
      variables: [],
      behaviors: [],
      effects: [],
      content: { width: 0, height: 0, depth: 0 },
    });
    return { runtimeScene, customObject };
  };

  it('reports the errors of the events of a custom object instead of throwing them', async () => {
    const { runtimeGame, reportedErrors } = await makeEditedGame();

    const { customObject } = createThrowingCustomObject(runtimeGame);
    // What the update of the object calls at each frame of the editor.
    customObject.doStepPostEvents(customObject.getChildrenContainer());

    expect(
      reportedErrors.map(({ error, origin }) => ({
        message: error instanceof Error ? error.message : '',
        ...origin,
      }))
    ).to.eql([
      {
        message: 'onCreated failed',
        phase: 'onCreated',
        type: 'MyExtension::MyEventsBasedObject',
      },
      {
        message: 'doStepPostEvents failed',
        phase: 'doStepPostEvents',
        type: 'MyExtension::MyEventsBasedObject',
      },
    ]);
  });

  it('still throws outside of the in-game editor', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();

    expect(() => createThrowingCustomObject(runtimeGame)).to.throwError(
      /onCreated failed/
    );
  });

  it('sends each error once per second to the editor, with its extension found in the stack and its count', async () => {
    const runtimeGame = await gdjs.getPixiRuntimeGameWithAssets();
    /** @type {Array<any>} */
    const sentMessages = [];
    class TestDebuggerClient extends gdjs.AbstractDebuggerClient {
      /** @param {string} message */
      _sendMessage(message) {
        sentMessages.push(JSON.parse(message));
      }
    }
    // Not loaded in the tests: the client creates one.
    const InGameDebugger = gdjs.InGameDebugger;
    // @ts-ignore
    gdjs.InGameDebugger = class {};
    const debuggerClient = new TestDebuggerClient(runtimeGame);
    gdjs.InGameDebugger = InGameDebugger;

    const error = new Error('Cannot read properties of undefined');
    error.stack = [
      'TypeError: Cannot read properties of undefined',
      '    at Terrain.update (http://localhost/extensions-code/gdjs-evtsext-myextension-definehelperclasses.js:12:5)',
    ].join('\n');
    for (let i = 0; i < 3; i++) {
      debuggerClient.reportInGameEditorExtensionError(error, {
        phase: 'editorCallback',
      });
    }

    const errorMessages = sentMessages.filter(
      (message) => message.command === 'inGameEditor.extensionError'
    );
    expect(errorMessages.length).to.be(1);
    expect(errorMessages[0].payload).to.eql({
      key: 'editorCallback||MyExtension|Cannot read properties of undefined',
      extensionName: 'MyExtension',
      phase: 'editorCallback',
      type: null,
      message: 'Cannot read properties of undefined',
      stack: error.stack,
      count: 1,
    });
  });
});
