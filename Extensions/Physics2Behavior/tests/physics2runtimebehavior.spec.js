describe('Physics2RuntimeBehavior', () => {
  const delay = (ms) => new Promise((res) => setTimeout(res, ms));

  beforeEach(async function () {
    // TODO find a clean way to wait for the Box2D library to load.
    for (let index = 0; index < 200 && !window.Box2D; index++) {
      await delay(5);
    }
    if (!window.Box2D) {
      throw new Error('Timeout loading Box2D.');
    }
  });

  class FakeAutoRemoveBehavior extends gdjs.RuntimeBehavior {
    shouldDeleteInPreEvent = false;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
    }

    setShouldAutoRemoveInPreEvent(shouldDeleteInPreEvent) {
      this.shouldDeleteInPreEvent = shouldDeleteInPreEvent;
    }

    doStepPreEvents(runtimeScene) {
      if (this.shouldDeleteInPreEvent) {
        this.owner.deleteFromScene(runtimeScene);
      }
    }
  }

  gdjs.registerBehavior(
    'Physics2::FakeAutoRemoveBehavior',
    FakeAutoRemoveBehavior
  );

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
    const runtimeGame = gdjs.getPixiRuntimeGame();
    const runtimeScene = new gdjs.TestRuntimeScene(runtimeGame);
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

  function createObjectWithPhysicsBehavior(runtimeScene, behaviorProperties) {
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
    /** @type {{behavior: gdjs.Physics2RuntimeBehavior, object: gdjs.RuntimeObject}} */
    return { object, behavior: object.getBehavior('Physics2') };
  }

  describe('Behavior activation and reactivation', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });

    it('should not leave a living body after removing an object', () => {
      const { object, behavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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
      const { object, behavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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
      const { object, behavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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

    it('should not resolve collision before the 1st frame events', () => {
      const fps = 60;
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // Create objects in contact
      const {
        object: object1,
        behavior: object1Behavior,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Dynamic',
      });
      object1.setPosition(10, 0);
      const {
        object: object2,
        behavior: object2Behavior,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      object2.setPosition(20, 0);

      // First frame
      runtimeScene.renderAndStep(1000 / fps);

      // The object has not moved.
      expect(object1.getX()).to.be(10);
      expect(object1.getY()).to.be(0);
      expect(object2.getX()).to.be(20);
      expect(object2.getY()).to.be(0);
    });

    it('should clear contacts when deactivating the physics2 behavior', () => {
      const fps = 60;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // The behavior doesn't call Box2D step at the 1st frame.
      runtimeScene.renderAndStep(1000 / fps);

      // Create objects not in contact
      const {
        object: object1,
        behavior: object1Behavior,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Dynamic',
      });
      object1.setPosition(100, 0);
      const {
        object: object2,
        behavior: object2Behavior,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      object1.setPosition(0, 0);

      expect(object1Behavior.getBody()).not.to.be(null);
      expect(object2Behavior.getBody()).not.to.be(null);
      expect(object1Behavior._sharedData._registeredBehaviors.size).to.be(2);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object1Behavior)
      ).to.be(true);
      expect(
        object1Behavior._sharedData._registeredBehaviors.has(object2Behavior)
      ).to.be(true);

      // Put objects in contact and assert collision started during the frame
      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        object1.setPosition(10, 0);
        object2.setPosition(20, 0);
      });

      // After post event, collision should be present
      assertCollision(object1, object2, {
        started: true,
        collision: true,
        stopped: false,
      });

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

      runtimeScene.renderAndStep(1000 / fps);

      assertCollision(object1, object2, {
        started: true,
        collision: true,
        stopped: false,
      });
    });

    it('should not raise an error if the object is deleted before its physics2 pre-event is run', () => {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          // Make FakeAutoRemover run before the Physics2 behavior.
          {
            name: 'FakeAutoRemover',
            type: 'Physics2::FakeAutoRemoveBehavior',
          },
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
          },
        ],
        variables: [],
        effects: [],
      });
      object.setCustomWidthAndHeight(10, 10);
      runtimeScene.addObject(object);

      /** @type {FakeAutoRemoveBehavior} */
      const fakeAutoRemoverBehavior = object.getBehavior('FakeAutoRemover');
      const behavior = object.getBehavior('Physics2');

      // First render to have the behavior set up
      runtimeScene.renderAndStep(1000 / 60);
      expect(behavior.getBody()).not.to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(1);
      expect(behavior._sharedData._registeredBehaviors.has(behavior)).to.be(
        true
      );

      fakeAutoRemoverBehavior.setShouldAutoRemoveInPreEvent(true);
      runtimeScene.renderAndStep(1000 / 60);

      expect(behavior.destroyedDuringFrameLogic).to.be(true);
      expect(behavior.getBody()).to.be(null);
      expect(behavior._sharedData._registeredBehaviors.size).to.be(0);
    });
  });

  describe('Contacts computation', () => {
    let runtimeGame;
    let runtimeScene;
    beforeEach(() => {
      [runtimeGame, runtimeScene] = createGameWithSceneWithPhysics2SharedData();
    });

    it('should detect a collision even if the contact stated and ended during the same frame', () => {
      // Use a low fps to reproduce more easily.
      const fps = 2;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const {
        object: movingObject,
        behavior: movingObjectBehavior,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        object: staticObject,
        behavior: staticObjectBehavior,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
      });
      staticObject.setPosition(0, 25);
      movingObject.setPosition(0, 0);
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBounced = false;
      for (let stepIndex = 0; stepIndex < 10 && !hasBounced; stepIndex++) {
        runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
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
      }

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

    it("should detect a collision when the contact doesn't end the same frame it started", () => {
      // Use a high fps to reproduce more easily.
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      const {
        behavior: movingObjectBehavior,
        object: movingObject,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        behavior: staticObjectBehavior,
        object: staticObject,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
      });
      staticObject.setPosition(0, 25);
      movingObject.setPosition(0, 0);
      movingObjectBehavior.setLinearVelocityY(40000);

      let hasBegunBouncing = false;
      for (
        let stepIndex = 0;
        stepIndex < 10 && !hasBegunBouncing;
        stepIndex++
      ) {
        runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
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
      }

      if (!hasBegunBouncing) {
        throw new Error(
          'Start of contact was not detected, nothing was tested.'
        );
      }

      // At next frame, end of collision should be detected
      let hasFinishedBouncing = false;
      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        hasFinishedBouncing = true;
        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });

      if (!hasFinishedBouncing) {
        throw new Error('End of contact was not detected, nothing was tested.');
      }
    });

    it('should not detect a new contact while already in contact with that same object (the contact jittered).', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // The behavior doesn't call Box2D step at the 1st frame.
      runtimeScene.renderAndStep(1000 / fps);

      const {
        behavior: movingObjectBehavior,
        object: movingObject,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        behavior: staticObjectBehavior,
        object: staticObject,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);

      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        // Manually call onContactEnd and onContactBegin methods to simulate
        // a loss of contact followed by a contact beginning during the preEvent.
        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));

        movingObject
          .getBehavior('Physics2')
          .onContactBegin(staticObject.getBehavior('Physics2'));

        assertCollision(movingObject, staticObject, {
          started: false,
          collision: true,
          stopped: false,
        });
      });
    });

    it('should not detect a new contact if the contact ended and jittered.', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // The behavior doesn't call Box2D step at the 1st frame.
      runtimeScene.renderAndStep(1000 / fps);

      const {
        behavior: movingObjectBehavior,
        object: movingObject,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        behavior: staticObjectBehavior,
        object: staticObject,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 4);
      movingObject.setPosition(0, 0);
      runtimeScene.renderAndStep(1000 / fps);

      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        // Manually call onContactEnd and onContactBegin methods to simulate
        // a loss of contact followed by a contact beginning and another loss
        // of contact during the event.
        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));

        movingObject
          .getBehavior('Physics2')
          .onContactBegin(staticObject.getBehavior('Physics2'));

        movingObject
          .getBehavior('Physics2')
          .onContactEnd(staticObject.getBehavior('Physics2'));

        assertCollision(movingObject, staticObject, {
          started: false,
          collision: false,
          stopped: true,
        });
      });
    });

    it('it should end collision on resize (body updated in pre-event).', () => {
      const fps = 50;
      runtimeGame.setGameResolutionSize(1000, 1000);
      runtimeScene._timeManager.getElapsedTime = function () {
        return (1 / fps) * 1000;
      };

      // The behavior doesn't call Box2D step at the 1st frame.
      runtimeScene.renderAndStep(1000 / fps);

      const {
        behavior: movingObjectBehavior,
        object: movingObject,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        behavior: staticObjectBehavior,
        object: staticObject,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);
      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      // Resize.
      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        movingObject.setCustomWidthAndHeight(5, 5);
      });
      assertCollision(movingObject, staticObject, {
        started: false,
        collision: true,
        stopped: false,
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

      // The behavior doesn't call Box2D step at the 1st frame.
      runtimeScene.renderAndStep(1000 / fps);

      const {
        behavior: movingObjectBehavior,
        object: movingObject,
      } = createObjectWithPhysicsBehavior(runtimeScene);
      const {
        behavior: staticObjectBehavior,
        object: staticObject,
      } = createObjectWithPhysicsBehavior(runtimeScene, {
        bodyType: 'Static',
        restitution: 0,
      });
      staticObject.setPosition(0, 9);
      movingObject.setPosition(0, 0);

      runtimeScene.renderAndStep(1000 / fps);
      assertCollision(movingObject, staticObject, {
        started: true,
        collision: true,
        stopped: false,
      });

      // Destroy (handled by postEvent).
      runtimeScene.renderAndStepWithEventsFunction(1000 / fps, () => {
        movingObject.deleteFromScene(runtimeScene);
      });

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

      const { behavior } = createObjectWithPhysicsBehavior(runtimeScene);
      const { behavior: otherBehavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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

      const { behavior } = createObjectWithPhysicsBehavior(runtimeScene);
      const { behavior: otherBehavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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

      const { behavior } = createObjectWithPhysicsBehavior(runtimeScene);
      const { behavior: otherBehavior } = createObjectWithPhysicsBehavior(
        runtimeScene
      );

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
