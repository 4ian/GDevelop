// @ts-check
describe('gdjs.DraggableRuntimeBehavior', function () {
  const {
    runtimeGame,
    runtimeScene,
  } = gdjs.makeTestRuntimeGameAndRuntimeScene();

  var object = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [{ name: 'Behavior1', type: 'DraggableBehavior::Draggable' }],
    variables: [],
    effects: [],
  });
  var object2 = new gdjs.RuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [{ name: 'Behavior1', type: 'DraggableBehavior::Draggable' }],
    variables: [],
    effects: [],
  });
  runtimeScene.addObject(object);
  runtimeScene.addObject(object2);

  it('should handle mouse', function () {
    object.setPosition(450, 500);

    //Drag'n'drop
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onMouseMove(450, 500);
    runtimeGame
      .getInputManager()
      .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onMouseMove(750, 600);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame
      .getInputManager()
      .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    runtimeScene.renderAndStep(1000 / 60);

    expect(object.getX()).to.be(750);
    expect(object.getY()).to.be(600);

    //Mouse move with dragging
    runtimeGame.getInputManager().onMouseMove(600, 600);
    runtimeScene.renderAndStep(1000 / 60);

    expect(object.getX()).to.be(750);
    expect(object.getY()).to.be(600);

    //Start dragging again
    runtimeGame.getInputManager().onMouseMove(750, 600);
    runtimeGame
      .getInputManager()
      .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onMouseMove(850, 700);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame
      .getInputManager()
      .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
    runtimeScene.renderAndStep(1000 / 60);

    expect(object.getX()).to.be(850);
    expect(object.getY()).to.be(700);
  });
  it('should handle touches', function () {
    runtimeGame.getInputManager().touchSimulateMouse(false);
    object.setPosition(450, 500);

    //Drag'n'drop
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchStart(1, 10, 20);
    runtimeGame.getInputManager().onTouchStart(0, 450, 500);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onFrameEnded();
    runtimeGame.getInputManager().onTouchMove(0, 750, 600);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onFrameEnded();
    runtimeGame.getInputManager().onTouchEnd(0);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onFrameEnded();

    expect(object.getX()).to.be(750);
    expect(object.getY()).to.be(600);

    //Move another unrelated touch
    runtimeGame.getInputManager().onTouchMove(1, 750, 600);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchMove(1, 850, 700);
    runtimeScene.renderAndStep(1000 / 60);

    expect(object.getX()).to.be(750);
    expect(object.getY()).to.be(600);

    //Start drag'n'drop with another touch
    runtimeGame.getInputManager().onTouchEnd(1);
    runtimeGame.getInputManager().onFrameEnded();
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchStart(1, 750, 600);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchMove(1, 850, 700);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchEnd(1);
    runtimeGame.getInputManager().onFrameEnded();

    expect(object.getX()).to.be(850);
    expect(object.getY()).to.be(700);
  });
  it('should handle multitouch', function () {
    runtimeGame.getInputManager().touchSimulateMouse(false);
    object.setPosition(450, 500);
    object2.setPosition(650, 600);

    //Drag'n'drop
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onTouchStart(2, 450, 500);
    runtimeGame.getInputManager().onTouchStart(1, 650, 600);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onFrameEnded();
    runtimeGame.getInputManager().onTouchMove(2, 750, 700);
    runtimeGame.getInputManager().onTouchMove(1, 100, 200);
    runtimeScene.renderAndStep(1000 / 60);
    runtimeGame.getInputManager().onFrameEnded();
    runtimeGame.getInputManager().onTouchEnd(2);

    expect(object.getX()).to.be(750);
    expect(object.getY()).to.be(700);
    expect(object2.getX()).to.be(100);
    expect(object2.getY()).to.be(200);
  });
});
