// @ts-check
describe('gdjs.DraggableRuntimeBehavior', function () {
  const runtimeGame = gdjs.getPixiRuntimeGame();
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);
  runtimeScene.loadFromScene({
    layers: [
      {
        name: '',
        visibility: true,
        cameras: [],
        effects: [],
        ambientLightColorR: 127,
        ambientLightColorB: 127,
        ambientLightColorG: 127,
        isLightingLayer: false,
        followBaseLayerCamera: false,
      },
    ],
    variables: [],
    r: 0,
    v: 0,
    b: 0,
    mangledName: 'Scene1',
    name: 'Scene1',
    stopSoundsOnStartup: false,
    title: '',
    behaviorsSharedData: [],
    objects: [],
    instances: [],
    usedResources: [],
  });

  var object = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [{ name: 'Behavior1', type: 'DraggableBehavior::Draggable' }],
    variables: [],
    effects: [],
  });
  object.setCustomWidthAndHeight(10, 10);
  var object2 = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [
      {
        name: 'Behavior1',
        type: 'DraggableBehavior::Draggable',
        // @ts-ignore - properties are not typed
        checkCollisionMask: true,
      },
    ],
    variables: [],
    effects: [],
  });
  object2.setCustomWidthAndHeight(10, 10);
  runtimeScene.addObject(object);
  runtimeScene.addObject(object2);

  describe('(mouse)', function () {
    it('can drag an object', function () {
      object.setPosition(450, 500);

      // Drag'n'drop
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(450, 500);
      runtimeGame
        .getInputManager()
        .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame
        .getInputManager()
        .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(600);

      // Mouse move without dragging
      runtimeGame.getInputManager().onMouseMove(600, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(600);

      // Start dragging again
      runtimeGame.getInputManager().onMouseMove(750, 600);
      runtimeGame
        .getInputManager()
        .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(850, 700);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame
        .getInputManager()
        .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(850);
      expect(object.getY()).to.be(700);
    });

    it('can drag an object without collision mask check', function () {
      object.setPosition(450, 500);
      object.setAngle(45);

      // Dragged point is in the bounding box but not in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(450, 500);
      runtimeGame
        .getInputManager()
        .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame
        .getInputManager()
        .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(600);

      object.setAngle(0);
    });

    it('can drag an object with collision mask check', function () {
      object2.setPosition(450, 500);
      object2.setAngle(45);

      // Dragged point is in the bounding box but not in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(450, 500);
      runtimeGame
        .getInputManager()
        .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame
        .getInputManager()
        .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object2.getX()).to.be(450);
      expect(object2.getY()).to.be(500);

      // Dragged point is in the bounding box and in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(455, 505);
      runtimeGame
        .getInputManager()
        .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onMouseMove(855, 705);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame
        .getInputManager()
        .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object2.getX()).to.be(850);
      expect(object2.getY()).to.be(700);
      object2.setAngle(0);
    });

    [false, true].forEach((firstInFront) => {
      it(`must drag the object in front (${
        firstInFront ? '1st object' : '2nd object'
      } in front)`, function () {
        object.setPosition(450, 500);
        object2.setPosition(450, 500);
        if (firstInFront) {
          object.setZOrder(2);
          object2.setZOrder(1);
        } else {
          object.setZOrder(1);
          object2.setZOrder(2);
        }

        // Drag'n'drop
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame.getInputManager().onMouseMove(450, 500);
        runtimeGame
          .getInputManager()
          .onMouseButtonPressed(gdjs.InputManager.MOUSE_LEFT_BUTTON);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame.getInputManager().onMouseMove(750, 600);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame
          .getInputManager()
          .onMouseButtonReleased(gdjs.InputManager.MOUSE_LEFT_BUTTON);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();

        if (firstInFront) {
          // The 1st object moved
          expect(object.getX()).to.be(750);
          expect(object.getY()).to.be(600);
          expect(object2.getX()).to.be(450);
          expect(object2.getY()).to.be(500);
        } else {
          // The 2nd object moved
          expect(object.getX()).to.be(450);
          expect(object.getY()).to.be(500);
          expect(object2.getX()).to.be(750);
          expect(object2.getY()).to.be(600);
        }
      });
    });
  });
  describe('(touch)', function () {
    it('can drag an object', function () {
      runtimeGame.getInputManager().touchSimulateMouse(false);
      object.setPosition(450, 500);

      // Drag'n'drop
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
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

      // Move another unrelated touch
      runtimeGame.getInputManager().onTouchMove(1, 750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(1, 850, 700);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(600);

      // Start drag'n'drop with another touch
      runtimeGame.getInputManager().onTouchEnd(1);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchStart(1, 750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(1, 850, 700);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchEnd(1);

      expect(object.getX()).to.be(850);
      expect(object.getY()).to.be(700);
    });

    it('can drag an object without collision mask check', function () {
      object.setPosition(450, 500);
      object.setAngle(45);

      // Dragged point is in the bounding box but not in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchStart(0, 450, 500);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(0, 750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onTouchEnd(0);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(600);

      object.setAngle(0);
    });

    it('can drag an object with collision mask check', function () {
      object2.setPosition(450, 500);
      object2.setAngle(45);

      // Dragged point is in the bounding box but not in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchStart(0, 450, 500);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(0, 750, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchEnd(0);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object2.getX()).to.be(450);
      expect(object2.getY()).to.be(500);

      // Dragged point is in the bounding box but not in hitbox
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchStart(0, 455, 505);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(0, 855, 705);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchEnd(0);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();

      expect(object2.getX()).to.be(850);
      expect(object2.getY()).to.be(700);
      object2.setAngle(0);
    });

    it('can drag 2 objects with multitouch', function () {
      runtimeGame.getInputManager().touchSimulateMouse(false);
      object.setPosition(450, 500);
      object2.setPosition(650, 600);

      // Drag'n'drop
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchStart(2, 450, 500);
      runtimeGame.getInputManager().onTouchStart(1, 650, 600);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchMove(2, 750, 700);
      runtimeGame.getInputManager().onTouchMove(1, 100, 200);
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
      runtimeGame.getInputManager().onTouchEnd(1);
      runtimeGame.getInputManager().onTouchEnd(2);

      expect(object.getX()).to.be(750);
      expect(object.getY()).to.be(700);
      expect(object2.getX()).to.be(100);
      expect(object2.getY()).to.be(200);

      // Avoid side effects on the following test cases
      runtimeScene.renderAndStep(1000 / 60);
      runtimeGame.getInputManager().onFrameEnded();
    });

    [false, true].forEach((firstInFront) => {
      it(`must drag the object in front (${
        firstInFront ? '1st object' : '2nd object'
      } in front)`, function () {
        object.setPosition(450, 500);
        object2.setPosition(450, 500);
        if (firstInFront) {
          object.setZOrder(2);
          object2.setZOrder(1);
        } else {
          object.setZOrder(1);
          object2.setZOrder(2);
        }

        // Drag'n'drop
        runtimeGame.getInputManager().touchSimulateMouse(false);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame.getInputManager().onTouchStart(1, 10, 20);
        runtimeGame.getInputManager().onTouchStart(0, 450, 500);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame.getInputManager().onTouchMove(0, 750, 600);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();
        runtimeGame.getInputManager().onTouchEnd(0);
        runtimeGame.getInputManager().onTouchEnd(1);
        runtimeScene.renderAndStep(1000 / 60);
        runtimeGame.getInputManager().onFrameEnded();

        if (firstInFront) {
          // The 1st object moved
          expect(object.getX()).to.be(750);
          expect(object.getY()).to.be(600);
          expect(object2.getX()).to.be(450);
          expect(object2.getY()).to.be(500);
        } else {
          // The 2nd object moved
          expect(object.getX()).to.be(450);
          expect(object.getY()).to.be(500);
          expect(object2.getX()).to.be(750);
          expect(object2.getY()).to.be(600);
        }
      });
    });
  });
});
