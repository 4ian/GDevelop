function assertCollision(object1, object2, options) {
  expect(
    gdjs.Physics2RuntimeBehavior.hasCollisionStartedBetween(
      object1,
      object2,
      'Physics2'
    )
  ).to.be(options.started);
  expect(
    gdjs.Physics2RuntimeBehavior.areObjectsColliding(
      object1,
      object2,
      'Physics2'
    )
  ).to.be(options.collision);
  expect(
    gdjs.Physics2RuntimeBehavior.hasCollisionStoppedBetween(
      object1,
      object2,
      'Physics2'
    )
  ).to.be(options.stopped);
}

function createGameWithSceneWithPhysics2SharedData() {
  const runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    resources: { resources: [] },
    properties: { windowWidth: 1000, windowHeight: 1000 },
  });
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);
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
  });

  runtimeScene.setInitialSharedDataForBehavior('Physics2', {
    gravityX: 0,
    gravityY: 0,
    scaleX: 1,
    scaleY: 1,
  });
  return [runtimeGame, runtimeScene];
}

function createObject(runtimeScene, behaviorProperties) {
  const object = new gdjs.TestRuntimeObject(runtimeScene, {
    name: 'obj1',
    type: '',
    behaviors: [
      {
        name: 'Physics2',
        type: 'Physics2::Physics2Behavior',
        bodyType: 'Dynamic',
        bullet: false,
        fixedRotation: true,
        canSleep: false,
        shape: 'Box',
        shapeDimensionA: 0,
        shapeDimensionB: 0,
        shapeOffsetX: 0,
        shapeOffsetY: 0,
        polygonOrigin: 'Center',
        vertices: [],
        density: 1.0,
        friction: 0.01,
        restitution: 1,
        linearDamping: 0,
        angularDamping: 0.1,
        gravityScale: 1,
        layers: 1,
        masks: 1,
        ...behaviorProperties,
      },
    ],
    variables: [],
    effects: [],
  });
  object.setCustomWidthAndHeight(10, 10);
  runtimeScene.addObject(object);
  return object;
}

describe('Physics2RuntimeBehavior', () => {
  describe('Contacts computation', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });

    it('should bounce during the frame (at low fps), collision should be detected, as well as start and stop of the collision', () => {
      const fps = 2;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, { bodyType: 'Static' });
      staticObject.setPosition(0, 25);
      movingObject.setPosition(0, 0);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBounced = false;
      let stepIndex = 0;
      while (stepIndex < 10 && !hasBounced) {
        runtimeScene.renderAndStep(1000 / fps);
        if (movingObjectBehavior.getLinearVelocityY() > 0) {
          // If the moving object has a positive velocity, it hasn't bounced
          // on the static object
          assertCollision(movingObject, staticObject, {
            started: false,
            collision: false,
            stopped: false,
          });
        } else {
          hasBounced = true;
          expect(movingObject.getY() < staticObject.getY()).to.be(true);
          assertCollision(movingObject, staticObject, {
            started: true,
            collision: true,
            stopped: true,
          });
        }

        stepIndex++;
      }
      if (!hasBounced) {
        throw new Error('Contact did not happen, nothing was tested.');
      }
    });

    it('should begin to bounce during the frame (at high fps), collision should be detected, as well as start of the collision, but not the end', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, { bodyType: 'Static' });
      staticObject.setPosition(0, 25);
      movingObject.setPosition(0, 0);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBounced = false;
      let stepIndex = 0;
      while (stepIndex < 10 && !hasBounced) {
        runtimeScene.renderAndStep(1000 / fps);
        if (movingObjectBehavior.getLinearVelocityY() > 0) {
          // If the moving object has a positive velocity, it hasn't bounced
          // on the static object
          assertCollision(movingObject, staticObject, {
            started: false,
            collision: false,
            stopped: false,
          });
        } else {
          hasBounced = true;
          expect(movingObject.getY() < staticObject.getY()).to.be(true);
          assertCollision(movingObject, staticObject, {
            started: true,
            collision: true,
            stopped: false,
          });
        }

        stepIndex++;
      }
      if (!hasBounced) {
        throw new Error('Contact did not happen, nothing was tested.');
      }

      runtimeScene.renderAndStep(1000 / fps);

      // At next frame, end of collision should be detected
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: false,
        stopped: true,
      });
    });
  });

  describe('onContactBegin', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });

    it('should add behavior to list of started contacts', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);

      const object = createObject(runtimeScene);
      const otherObject = createObject(runtimeScene);

      const behavior = object.getBehavior('Physics2');
      const otherBehavior = otherObject.getBehavior('Physics2');
      if (!behavior || !otherBehavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      behavior.onContactBegin(otherBehavior);

      expect(behavior.contactsStartedThisFrame.length).to.be(1);
      expect(behavior.contactsStartedThisFrame[0]).to.be(otherBehavior);
    });

    it('should add behavior to list of started contacts and ended contacts', () => {
      // From the user point of view the objects are colliding but it could be
      // quick enough for it to happen between 2 game frames (the physics model
      // uses modelling sub-steps). So contact beginning and end should be detected.
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);

      const object = createObject(runtimeScene);
      const otherObject = createObject(runtimeScene);

      const behavior = object.getBehavior('Physics2');
      const otherBehavior = otherObject.getBehavior('Physics2');
      if (!behavior || !otherBehavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      behavior.onContactBegin(otherBehavior);

      expect(behavior.contactsStartedThisFrame.length).to.be(1);
      expect(behavior.contactsStartedThisFrame[0]).to.be(otherBehavior);
      expect(behavior.contactsEndedThisFrame.length).to.be(0);

      behavior.onContactEnd(otherBehavior);

      expect(behavior.contactsStartedThisFrame.length).to.be(1);
      expect(behavior.contactsStartedThisFrame[0]).to.be(otherBehavior);
      expect(behavior.contactsEndedThisFrame.length).to.be(1);
      expect(behavior.contactsEndedThisFrame[0]).to.be(otherBehavior);
    });

    it('should not add behavior to list of started contacts if the behavior is also present in the list of ended contacts', () => {
      // From the user point of view the objects are staying in contact with each other.
      // They would be surprised if the conditions for a contact beginning and
      // end were true.
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);

      const object = createObject(runtimeScene);
      const otherObject = createObject(runtimeScene);

      const behavior = object.getBehavior('Physics2');
      const otherBehavior = otherObject.getBehavior('Physics2');
      if (!behavior || !otherBehavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      behavior.onContactEnd(otherBehavior);

      expect(behavior.contactsStartedThisFrame.length).to.be(0);
      expect(behavior.contactsEndedThisFrame.length).to.be(1);
      expect(behavior.contactsEndedThisFrame[0]).to.be(otherBehavior);

      behavior.onContactBegin(otherBehavior);

      expect(behavior.contactsStartedThisFrame.length).to.be(0);
      expect(behavior.contactsEndedThisFrame.length).to.be(0);
    });
  });
});
