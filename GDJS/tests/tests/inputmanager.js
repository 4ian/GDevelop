/**
 * Tests for gdjs.InputManager and related.
 */

describe('gdjs.InputManager', function() {

  const runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    resources: {
      resources: [],
    },
    properties: { windowWidth: 800, windowHeight: 600 },
  });
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });
  const inputManager = runtimeScene
  .getGame()
  .getInputManager();
  const inputTools = gdjs.evtTools.input;

  it('should handle keyboards events', function() {
    expect(inputManager.anyKeyPressed()).to.be(false);
    expect(inputManager.anyKeyReleased()).to.be(false);
    inputManager.onKeyPressed(32);
    expect(inputManager.getLastPressedKey()).to.be(32);
    inputManager.onKeyPressed(33);
    expect(inputManager.getLastPressedKey()).to.be(33);
    expect(inputManager.isKeyPressed(32)).to.be(true);
    expect(inputManager.isKeyPressed(30)).to.be(false);
    inputManager.onKeyReleased(32);
    expect(inputManager.isKeyPressed(32)).to.be(false);
    expect(inputManager.wasKeyReleased(32)).to.be(true);
    expect(inputManager.anyKeyReleased()).to.be(true);
    expect(inputManager.anyKeyPressed()).to.be(true);

    inputManager.onFrameEnded();
    expect(inputManager.wasKeyReleased(32)).to.be(false);
    expect(inputManager.anyKeyPressed()).to.be(true);
    expect(inputManager.anyKeyReleased()).to.be(false);
    expect(inputManager.isKeyPressed(33)).to.be(true);

    inputManager.onFrameEnded();
    inputManager.onKeyReleased(33);
    expect(inputManager.wasKeyReleased(33)).to.be(true);
    expect(inputManager.anyKeyPressed()).to.be(false);
    expect(inputManager.anyKeyReleased()).to.be(true);
    inputManager.onFrameEnded();
    
    // Pressed Right shift
    inputManager.onKeyPressed(16, 2);
    expect(inputManager.anyKeyPressed()).to.be(true);
    expect(inputManager.anyKeyReleased()).to.be(false);
    expect(inputManager.getLastPressedKey()).to.be(2016);
    expect(inputManager.isKeyPressed(2016)).to.be(true);
    expect(inputManager.isKeyPressed(1016)).to.be(false);

    // Pressed Control with no location - expect to default to left.
    inputManager.onKeyPressed(17);
    expect(inputManager.getLastPressedKey()).to.be(1017);
    expect(inputManager.isKeyPressed(1017)).to.be(true);
    expect(inputManager.isKeyPressed(2017)).to.be(false);

    inputManager.onKeyReleased(16, 2);
    expect(inputManager.wasKeyReleased(2016)).to.be(true);
    expect(inputManager.anyKeyReleased()).to.be(true);
    expect(inputManager.getLastPressedKey()).to.be(1017);
    expect(inputManager.wasKeyReleased(2016)).to.be(true);
    expect(inputManager.wasKeyReleased(1016)).to.be(false);
  });

  it('should handle mouse events', function() {
    inputManager.onMouseMove(500, 600);
    expect(inputManager.getMouseX()).to.be(500);
    expect(inputManager.getMouseY()).to.be(600);

    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    inputManager.onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(true);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    inputManager.onFrameEnded();

    inputManager.onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(true);
    inputManager.onFrameEnded();

    expect(
      inputManager.isMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    expect(
      inputManager.isMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON)
    ).to.be(false);
    
    expect(inputManager.isMouseInsideCanvas()).to.be(true);
    inputManager.onMouseLeave();
    expect(inputManager.isMouseInsideCanvas()).to.be(false);
    inputManager.onMouseEnter();
    expect(inputManager.isMouseInsideCanvas()).to.be(true);
  });

  it('should handle touch events', function() {
    inputManager.onTouchStart(46, 510, 610);
    inputManager.onTouchStart(10, 470, 320);

    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(true);
    expect(inputTools.getStartedTouchCount(runtimeScene)).to.be(2);
    expect(inputTools.getStartedTouchIdentifier(runtimeScene, 0)).to.be(47);
    expect(inputTools.getTouchX(runtimeScene, 47)).to.be(510);
    expect(inputTools.getTouchY(runtimeScene, 47)).to.be(610);
    expect(inputTools.getStartedTouchIdentifier(runtimeScene, 1)).to.be(11);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);
    // Events can ask touches again
    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(true);
    expect(inputTools.getStartedTouchCount(runtimeScene)).to.be(2);

    inputManager.onFrameEnded();
    inputManager.onTouchEnd(10);
    expect(inputTools.hasTouchEnded(runtimeScene, 11)).to.be(true);
    expect(inputTools.hasTouchEnded(runtimeScene, 47)).to.be(false);
    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(false);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);

    inputManager.onFrameEnded();
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(1);
  });

  it('should handle legacy and new touch events without any conflict', function() {
    inputManager.onTouchStart(46, 510, 610);
    inputManager.onTouchStart(10, 470, 320);

    // legacy ones
    expect(inputTools.popStartedTouch(runtimeScene)).to.be(true);
    expect(inputTools.getLastTouchId(runtimeScene)).to.be(47);
    expect(inputTools.getTouchX(runtimeScene, 47)).to.be(510);
    expect(inputTools.getTouchY(runtimeScene, 47)).to.be(610);
    expect(inputTools.popStartedTouch(runtimeScene)).to.be(true);
    expect(inputTools.getLastTouchId(runtimeScene)).to.be(11);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);
    expect(inputTools.hasTouchEnded(runtimeScene)).to.be(false);

    // new ones
    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(true);
    expect(inputTools.getStartedTouchCount(runtimeScene)).to.be(2);
    expect(inputTools.getStartedTouchIdentifier(runtimeScene, 0)).to.be(47);
    expect(inputTools.getTouchX(runtimeScene, 47)).to.be(510);
    expect(inputTools.getTouchY(runtimeScene, 47)).to.be(610);
    expect(inputTools.getStartedTouchIdentifier(runtimeScene, 1)).to.be(11);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);

    inputManager.onFrameEnded();
    inputManager.onTouchEnd(10);

    // legacy ones
    expect(inputTools.popEndedTouch(runtimeScene)).to.be(true);
    expect(inputTools.getLastEndedTouchId()).to.be(11);
    expect(inputTools.popEndedTouch(runtimeScene)).to.be(false);
    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(false);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);

    // new ones
    expect(inputTools.hasTouchEnded(runtimeScene, 11)).to.be(true);
    expect(inputTools.hasTouchEnded(runtimeScene, 47)).to.be(false);
    expect(inputTools.hasAnyTouchStarted(runtimeScene)).to.be(false);
    expect(inputTools.getTouchX(runtimeScene, 11)).to.be(470);
    expect(inputTools.getTouchY(runtimeScene, 11)).to.be(320);

    inputManager.onFrameEnded();
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(1);
  });

  it('should handle deprecated touch events', function() {
    inputManager.onTouchStart(46, 510, 610);
    inputManager.onTouchStart(10, 470, 320);
    expect(inputManager.getStartedTouchIdentifiers()).to.have.length(2);
    expect(inputManager.getTouchX(47)).to.be(510);
    expect(inputManager.getTouchY(47)).to.be(610);

    expect(inputManager.popStartedTouch()).to.be(47);
    expect(inputManager.popStartedTouch()).to.be(11);
    expect(inputManager.popEndedTouch()).to.be(undefined);

    inputManager.onFrameEnded();
    inputManager.onTouchEnd(10);
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(2);
    expect(inputManager.getStartedTouchIdentifiers()).to.have.length(0);
    expect(inputManager.popStartedTouch()).to.be(undefined);
    expect(inputManager.popEndedTouch()).to.be(11);
    expect(inputManager.getTouchX(11)).to.be(470);
    expect(inputManager.getTouchY(11)).to.be(320);

    inputManager.onFrameEnded();
    expect(inputManager.getAllTouchIdentifiers()).to.have.length(1);
  });

  it('should simulate (or not) mouse events', function() {
    inputManager.touchSimulateMouse();
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);
    inputManager.onTouchStart(46, 510, 610);
    expect(inputManager.isMouseButtonPressed(0)).to.be(true);
    expect(inputManager.getMouseX()).to.be(510);
    expect(inputManager.getMouseY()).to.be(610);
    inputManager.onTouchMove(46, 520, 620);
    expect(inputManager.getMouseX()).to.be(520);
    expect(inputManager.getMouseY()).to.be(620);
    inputManager.onTouchEnd(46);
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);

    inputManager.touchSimulateMouse(false);
    inputManager.onTouchStart(46, 510, 610);
    expect(inputManager.isMouseButtonPressed(0)).to.be(false);
    expect(inputManager.getMouseX()).to.be(520);
    expect(inputManager.getMouseY()).to.be(620);
  });
});

describe('gdjs.RuntimeObject.cursorOnObject', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    resources: { resources: [] }
  });
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [{ name: '', visibility: true, effects: [] }],
    variables: [],
    behaviorsSharedData: [],
    objects: [],
    instances: [],
  });

  var object = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [],
    effects: [],
  });
  object.setPosition(450, 500);

  it('should handle mouse', function() {
    runtimeGame.getInputManager().onMouseMove(100, 100);
    expect(object.cursorOnObject(runtimeScene)).to.be(false);
    runtimeGame.getInputManager().onMouseMove(450, 500);
    expect(object.cursorOnObject(runtimeScene)).to.be(true);
  });

  it('should handle touch', function() {
    runtimeGame.getInputManager().onMouseMove(0, 0);
    runtimeGame.getInputManager().touchSimulateMouse(false);

    runtimeGame.getInputManager().onTouchStart(0, 100, 100);
    expect(object.cursorOnObject(runtimeScene)).to.be(false);
    runtimeGame.getInputManager().onFrameEnded();

    runtimeGame.getInputManager().onTouchStart(1, 450, 500);
    expect(object.cursorOnObject(runtimeScene)).to.be(true);
    runtimeGame.getInputManager().onFrameEnded();

    runtimeGame.getInputManager().onTouchEnd(1);
    expect(object.cursorOnObject(runtimeScene)).to.be(true);
    runtimeGame.getInputManager().onFrameEnded();

    expect(object.cursorOnObject(runtimeScene)).to.be(false);
  });
});
