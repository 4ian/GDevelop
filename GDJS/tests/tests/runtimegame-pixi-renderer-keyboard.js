/**
 * Tests for the keyboard events handling of gdjs.RuntimeGamePixiRenderer.
 */

describe('gdjs.RuntimeGamePixiRenderer keyboard events', () => {
  const isMacLike = !!navigator.platform.match(/(Mac|iPhone|iPod|iPad)/i);
  const Z_KEY = 90;
  const META_KEY_CODE = 91;

  /** A document on which the renderer binds its handlers, with a controllable focus. */
  const makeFakeDocument = canvas => {
    const fakeDocument = {
      activeElement: canvas,
      addEventListener: () => {},
      removeEventListener: () => {},
      body: document.body,
    };
    return fakeDocument;
  };
  const makeFakeWindow = () => ({
    addEventListener: () => {},
    removeEventListener: () => {},
    innerWidth: 800,
    innerHeight: 600,
  });

  const setUp = () => {
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const renderer = runtimeGame.getRenderer();
    const canvas = document.createElement('canvas');
    renderer.initializeCanvas(canvas);
    const fakeDocument = makeFakeDocument(canvas);
    renderer.bindStandardEvents(
      runtimeGame.getInputManager(),
      makeFakeWindow(),
      fakeDocument
    );
    return { inputManager: runtimeGame.getInputManager(), fakeDocument, canvas };
  };

  const keyEvent = (code, keyCode, extra) => ({
    code,
    keyCode,
    location: 0,
    repeat: false,
    metaKey: false,
    preventDefault: () => {},
    ...extra,
  });

  it('releases a key pressed with Cmd when Cmd is released, even if a DOM element got the focus (macOS)', function () {
    if (!isMacLike) this.skip();
    const { inputManager, fakeDocument, canvas } = setUp();

    // Cmd+Z: on macOS, the "keyup" of Z is never received while Cmd is held.
    fakeDocument.onkeydown(keyEvent('MetaLeft', META_KEY_CODE, { metaKey: true }));
    fakeDocument.onkeydown(keyEvent('KeyZ', Z_KEY, { metaKey: true }));
    expect(inputManager.isKeyPressed(Z_KEY)).to.be(true);

    // Something (like the undo triggered by the shortcut) gave the focus to
    // a DOM element before Cmd is released.
    fakeDocument.activeElement = document.createElement('input');
    fakeDocument.onkeyup(keyEvent('MetaLeft', META_KEY_CODE));

    // Z must not be stuck as pressed: the next Cmd+Z must be seen as a new press.
    expect(inputManager.isKeyPressed(Z_KEY)).to.be(false);
    inputManager.onFrameEnded();
    fakeDocument.activeElement = canvas;
    fakeDocument.onkeydown(keyEvent('MetaLeft', META_KEY_CODE, { metaKey: true }));
    fakeDocument.onkeydown(keyEvent('KeyZ', Z_KEY, { metaKey: true }));
    expect(inputManager.wasKeyJustPressed(Z_KEY)).to.be(true);

    // Clean up.
    fakeDocument.onkeyup(keyEvent('MetaLeft', META_KEY_CODE));
    inputManager.onFrameEnded();
  });

  it('releases a key pressed for the game even if a DOM element got the focus in the meantime (Ctrl+Z on Windows)', () => {
    const { inputManager, fakeDocument, canvas } = setUp();
    const CTRL_KEY_CODE = 17;

    // Ctrl+Z, with the focus on the game.
    fakeDocument.onkeydown(keyEvent('ControlLeft', CTRL_KEY_CODE, { ctrlKey: true }));
    fakeDocument.onkeydown(keyEvent('KeyZ', Z_KEY, { ctrlKey: true }));
    expect(inputManager.isKeyPressed(Z_KEY)).to.be(true);

    // The undo triggered by the shortcut gave the focus to a DOM element
    // before the keys are released.
    fakeDocument.activeElement = document.createElement('input');
    fakeDocument.onkeyup(keyEvent('KeyZ', Z_KEY, { ctrlKey: true }));
    fakeDocument.onkeyup(keyEvent('ControlLeft', CTRL_KEY_CODE));

    // Neither key must be stuck: the next Ctrl+Z must be seen as a new press.
    expect(inputManager.isKeyPressed(Z_KEY)).to.be(false);
    expect(inputManager.isKeyPressed(CTRL_KEY_CODE)).to.be(false);
    inputManager.onFrameEnded();
    fakeDocument.activeElement = canvas;
    fakeDocument.onkeydown(keyEvent('ControlLeft', CTRL_KEY_CODE, { ctrlKey: true }));
    fakeDocument.onkeydown(keyEvent('KeyZ', Z_KEY, { ctrlKey: true }));
    expect(inputManager.wasKeyJustPressed(Z_KEY)).to.be(true);

    fakeDocument.onkeyup(keyEvent('KeyZ', Z_KEY));
    fakeDocument.onkeyup(keyEvent('ControlLeft', CTRL_KEY_CODE));
    inputManager.onFrameEnded();
  });

  it('still ignores the keys typed in a focused DOM element', () => {
    const { inputManager, fakeDocument } = setUp();
    fakeDocument.activeElement = document.createElement('input');
    fakeDocument.onkeydown(keyEvent('KeyZ', Z_KEY));
    expect(inputManager.isKeyPressed(Z_KEY)).to.be(false);
    fakeDocument.onkeyup(keyEvent('KeyZ', Z_KEY));
    expect(inputManager.anyKeyPressed()).to.be(false);
  });
});
