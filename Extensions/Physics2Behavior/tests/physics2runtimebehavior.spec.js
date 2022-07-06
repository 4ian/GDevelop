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

class BehaviorTest extends gdjs.RuntimeBehavior {
  collisionsStartedThisFrame = [];
  collisionsEndedThisFrame = [];
  currentCollisions = [];
  other;
  isPostEventActivated = false;
  isPreEventActivated = false;

  constructor(runtimeScene, behaviorData, owner) {
    super(runtimeScene, behaviorData, owner);
    this.collisionsStartedThisFrame = behaviorData.collisionsStartedThisFrame;
    this.collisionsEndedThisFrame = behaviorData.collisionsEndedThisFrame;
    this.currentCollisions = behaviorData.currentCollisions;
    this.other = behaviorData.other;
  }

  activatePostEvent(activate) {
    this.isPostEventActivated = activate;
  }
  activatePreEvent(activate) {
    this.isPreEventActivated = activate;
  }

  setExpectedCollisions({ started, collision, stopped }) {
    this.collisionsStartedThisFrame = started;
    this.currentCollisions = collision;
    this.collisionsEndedThisFrame = stopped;
  }

  doStepPreEvents() {
    if (this.isPreEventActivated) {
      const physicsBehavior = this.owner.getBehavior('Physics2');
      assertCollision(this.owner, this.other, {
        started: this.collisionsStartedThisFrame,
        collision: this.currentCollisions,
        stopped: this.collisionsEndedThisFrame,
      });
    }
  }

  doStepPostEvents() {
    if (this.isPostEventActivated) {
      const physicsBehavior = this.owner.getBehavior('Physics2');
      assertCollision(this.owner, this.other, {
        started: this.collisionsStartedThisFrame,
        collision: this.currentCollisions,
        stopped: this.collisionsEndedThisFrame,
      });
    }
  }
}

gdjs.registerBehavior('Physics2::BehaviorTest', BehaviorTest);

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
  describe('Behavior activation and reactivation', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });

    it('should not leave a living body after removing an object', () => {
      const object = createObject(runtimeScene);

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      if (!behavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      // First render to have the behavior set up
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.getBody()).not.to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(1);
      expect(behavior._sharedData._registeredBehaviors.has(behavior)).to.be(
        true
      );

      // Delete object from scene
      object.deleteFromScene(runtimeScene);
      expect(behavior.destroyedDuringFrameLogic).to.be(true);
      expect(behavior.getBody()).to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(0);
      expect(behavior._sharedData._registeredBehaviors.has(behavior)).to.be(
        false
      );

      // Call a few methods on the behavior
      behavior.setLinearDamping(2);
      behavior.setGravityScale(2);

      // Body should still not exist
      expect(behavior.getBody()).to.be(null);
    });

    it("doesn't raise errors if an object with a deactivated physics2 behavior is removed", () => {
      const object = createObject(runtimeScene);

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      if (!behavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      // First render to have the behavior set up
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.getBody()).not.to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(1);
      expect(behavior._sharedData._registeredBehaviors.has(behavior)).to.be(
        true
      );

      object.activateBehavior('Physics2', false);
      expect(behavior.getBody()).to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(0);
      expect(behavior._sharedData._registeredBehaviors.has(behavior)).to.be(
        false
      );

      object.deleteFromScene(runtimeScene);

      expect(behavior.destroyedDuringFrameLogic).to.be(true);
      expect(behavior.getBody()).to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(0);
    });

    it("should not recreate object's body when setting or getting behavior properties", () => {
      const object = createObject(runtimeScene);

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      if (!behavior) {
        throw new Error('Behavior not found, test cannot be run.');
      }

      // First render to have the behavior set up
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.getBody()).not.to.be(null);

      // Deactivate behavior
      object.activateBehavior('Physics2', false);
      expect(behavior.getBody()).to.be(null);

      // Call bunch of methods that should have no impact on the object's body
      behavior.setDensity(123);
      behavior.setRestitution(0.5);
      behavior.getLinearVelocityLength();
      behavior.applyImpulse(10, -20, 0, 0);
      behavior.getMassCenterX();

      // Object's body should still not exist
      expect(behavior.getBody()).to.be(null);

      // Reactivate behavior
      object.activateBehavior('Physics2', true);
      expect(behavior.getBody()).not.to.be(null);

      // Behavior should have recorded what was called with its setters while it was de-activated.
      expect(behavior.getDensity()).to.be(123);
      expect(behavior.getRestitution()).to.be(0.5);
    });

    it('should clear contacts when deactivating the physics2 behavior', () => {
      const fps = 60;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // Create objects not in contact
      const object1 = createObject(runtimeScene, { bodyType: 'Dynamic' });
      object1.setPosition(100, 0);
      const object2 = createObject(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      object1.setPosition(0, 0);

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const object1Behavior = object1.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const object2Behavior = object2.getBehavior('Physics2');
      if (!object2Behavior || !object1Behavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      expect(object1Behavior.getBody()).not.to.be(null);
      expect(object2Behavior.getBody()).not.to.be(null);
      expect(object1Behavior._sharedData._registeredBehaviors.size).to.be(2);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object1Behavior)
      ).to.be(true);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object2Behavior)
      ).to.be(true);

      // Put objects in contact and asset collision started during the frame
      runtimeScene.setEventsFunction(() => {
        object1.setPosition(10, 0);
        object2.setPosition(20, 0);
        assertCollision(object1, object2, {
          started: true,
          collision: true,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);

      // After post event, collision should be present
      assertCollision(object1, object2, {
        started: true,
        collision: true,
        stopped: false,
      });

      // Reset scene events
      runtimeScene.setEventsFunction(() => {});

      // Deactivate physics behavior and test that collisions are cleared.
      object1.activateBehavior('Physics2', false);
      assertCollision(object1, object2, {
        started: false,
        collision: false,
        // It should be false because the condition does not have sense anymore
        // since the behavior is deactivated.
        stopped: false,
      });
      // Objects should have 0 contacts in memory.
      expect(object1Behavior.currentContacts.length).to.be(0);
      expect(object1Behavior.contactsEndedThisFrame.length).to.be(0);
      expect(object1Behavior.contactsStartedThisFrame.length).to.be(0);
      expect(object1Behavior._sharedData._registeredBehaviors.size).to.be(1);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object1Behavior)
      ).to.be(false);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object2Behavior)
      ).to.be(true);

      runtimeScene.renderAndStep(1000 / fps);

      // Reactivate physics behavior and test contact
      // is not immediately back on but after the first render.
      object1.activateBehavior('Physics2', true);
      expect(object1Behavior.currentContacts.length).to.be(0);
      expect(object1Behavior.contactsEndedThisFrame.length).to.be(0);
      expect(object1Behavior.contactsStartedThisFrame.length).to.be(0);
      expect(object1Behavior._sharedData._registeredBehaviors.size).to.be(2);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object1Behavior)
      ).to.be(true);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object2Behavior)
      ).to.be(true);

      runtimeScene.setEventsFunction(() => {
        assertCollision(object1, object2, {
          started: true,
          collision: true,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);

      assertCollision(object1, object2, {
        started: true,
        collision: true,
        stopped: false,
      });
    });
  });

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
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBounced = false;
      let stepIndex = 0;

      runtimeScene.setEventsFunction(() => {
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
      });
      while (stepIndex < 10 && !hasBounced) {
        runtimeScene.renderAndStep(1000 / fps);
        stepIndex++;
      }

      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: true,
      });

      runtimeScene.setEventsFunction(() => {});
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: false,
        stopped: false,
      });

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
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBegunBouncing = false;
      let stepIndex = 0;

      runtimeScene.setEventsFunction(() => {
        if (movingObjectBehavior.getLinearVelocityY() > 0) {
          // If the moving object has a positive velocity, it hasn't bounced
          // on the static object
          assertCollision(movingObject, staticObject, {
            started: false,
            collision: false,
            stopped: false,
          });
        } else {
          hasBegunBouncing = true;
          // At first frame, collision should have only started
          expect(movingObject.getY() < staticObject.getY()).to.be(true);
          assertCollision(movingObject, staticObject, {
            started: true,
            collision: true,
            stopped: false,
          });
        }
      });

      while (stepIndex < 10 && !hasBegunBouncing) {
        runtimeScene.renderAndStep(1000 / fps);
        stepIndex++;
      }

      if (!hasBegunBouncing) {
        throw new Error(
          'Start of contact was not detected, nothing was tested.'
        );
      }

      // At next frame, end of collision should be detected
      let hasFinishedBouncing = false;

      runtimeScene.setEventsFunction(() => {
        hasFinishedBouncing = true;
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });

      runtimeScene.renderAndStep(1000 / fps);

      if (!hasFinishedBouncing) {
        throw new Error('End of contact was not detected, nothing was tested.');
      }
    });

    it('should not detect a contact while already in contact as a new one (the contact jittered).', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      runtimeScene.setEventsFunction(() => {
        // Manually call onContactEnd and onContactBegin methods to simulate
        // a loss of contact followed by a contact beginning during the event.
        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));

        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });

        movingObject
          .getBehavior('Physics2')
          .onContactBegin(staticObject.getBehavior('Physics2'));

        assertCollision(movingObject, staticObject, {
          started: false,
          collision: true,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
    });

    it('should not detect a new contact if the contact ended and jittered.', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 4);
      movingObject.setPosition(0, 0);
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      runtimeScene.renderAndStep(1000 / fps);

      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      runtimeScene.setEventsFunction(() => {
        // Manually call onContactEnd and onContactBegin methods to simulate
        // a loss of contact followed by a contact beginning and another loss
        // of contact during the event.
        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });

        movingObject
          .getBehavior('Physics2')
          .onContactBegin(staticObject.getBehavior('Physics2'));

        // Started is false because it is like the jittered contact case.
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: true,
          stopped: false,
        });

        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
    });

    it('it should end collision on resize (body updated in pre-event).', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }

      runtimeScene.setEventsFunction(() => {
        assertCollision(movingObject, staticObject, {
          started: true,
          collision: true,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      // Resize (postEvent operation).
      runtimeScene.setEventsFunction(() => {
        movingObject.setCustomWidthAndHeight(5, 5);

        // Body should be updated next frame.
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: true,
          stopped: false,
        });
      });

      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: true,
        stopped: false,
      });
      runtimeScene.setEventsFunction(() => {
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: false,
        stopped: true,
      });
    });

    it('it should end collision on object destruction (loss of contact begins during event).', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const movingObject = createObject(runtimeScene);
      const staticObject = createObject(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }

      runtimeScene.setEventsFunction(() => {
        assertCollision(movingObject, staticObject, {
          started: true,
          collision: true,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      // Destroy (postEvent operation).
      runtimeScene.setEventsFunction(() => {
        movingObject.deleteFromScene(runtimeScene);

        // Collision should be reset on destroyed object and
        // added to contactsEndedThisFrame array of the other object.
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: false,
        });
        assertCollision(staticObject, movingObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });

      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: false,
        stopped: false,
      });
      assertCollision(staticObject, movingObject, {
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

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
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

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
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

      /** @type {gdjs.Physics2RuntimeBehavior | null} */
      const behavior = object.getBehavior('Physics2');
      /** @type {gdjs.Physics2RuntimeBehavior | null} */
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

  describe('Behavior interaction with other objects behaviors and extensions.', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });
    it('BehaviorTest should have access to current started and ended contacts in postEvent.', () => {
      const fps = 2;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const staticObject = createObject(runtimeScene, {
        bodyType: 'Static',
      });
      // Creating the object with the other behavior after the Physics2 only one
      // should make its behavior's post event play after the Physics2 post event.
      const movingObjectWithOtherBehavior = createObject(runtimeScene);
      movingObjectWithOtherBehavior.addNewBehavior({
        name: 'BehaviorTest',
        type: 'Physics2::BehaviorTest',
        other: staticObject,
      });
      runtimeScene.addObject(movingObjectWithOtherBehavior);

      /** @type {BehaviorTest | null} */
      const behaviorTest = movingObjectWithOtherBehavior.getBehavior(
        'BehaviorTest'
      );
      if (!behaviorTest) {
        throw new Error('Test behavior not found, test cannot be run.');
      }

      staticObject.setPosition(0, 25);
      movingObjectWithOtherBehavior.setPosition(0, 0);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObjectWithOtherBehavior.getBehavior(
        'Physics2'
      );
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }

      movingObjectBehavior.setLinearVelocityY(40000);
      let hasBounced = false;
      let stepIndex = 0;
      behaviorTest.activatePostEvent(true);

      runtimeScene.setEventsFunction(() => {
        if (movingObjectBehavior.getLinearVelocityY() > 0) {
          const expectedCollisionTest = {
            started: false,
            collision: false,
            stopped: false,
          };
          // If the moving object has a positive velocity, it hasn't bounced
          // on the static object
          assertCollision(
            movingObjectWithOtherBehavior,
            staticObject,
            expectedCollisionTest
          );
          behaviorTest.setExpectedCollisions(expectedCollisionTest);
        } else {
          hasBounced = true;
          const expectedCollisionTest = {
            started: true,
            collision: true,
            stopped: true,
          };
          expect(
            movingObjectWithOtherBehavior.getY() < staticObject.getY()
          ).to.be(true);
          assertCollision(
            movingObjectWithOtherBehavior,
            staticObject,
            expectedCollisionTest
          );
          behaviorTest.setExpectedCollisions(expectedCollisionTest);
        }
      });
      while (stepIndex < 10 && !hasBounced) {
        runtimeScene.renderAndStep(1000 / fps);
        stepIndex++;
      }

      assertCollision(movingObjectWithOtherBehavior, staticObject, {
        started: true,
        collision: true,
        stopped: true,
      });

      runtimeScene.setEventsFunction(() => {
        behaviorTest.setExpectedCollisions({
          started: false,
          collision: false,
          stopped: false,
        });
      });
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObjectWithOtherBehavior, staticObject, {
        started: false,
        collision: false,
        stopped: false,
      });

      if (!hasBounced) {
        throw new Error('Contact did not happen, nothing was tested.');
      }
    });
  });
});
