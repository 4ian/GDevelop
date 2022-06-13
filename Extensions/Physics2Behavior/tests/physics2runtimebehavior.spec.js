// TODO: find a way to add assertions at events time to enable this test.
describe.skip('Physics2RuntimeBehavior', () => {
  describe('Contacts computation', () => {
    const fps = 1;
    const runtimeGame = new gdjs.RuntimeGame({
      variables: [],
      resources: { resources: [] },
      // @ts-ignore
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

    runtimeScene._timeManager.getElapsedTime = function () {
      return (1 / fps) * 1000;
    };

    function createObject(behaviorProperties) {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            name: 'Physics2',
            type: 'Physics2::Physics2Behavior',
            bodyType: 'Dynamic',
            bullet: false,
            fixedRotation: false,
            canSleep: true,
            shape: 'Circle',
            shapeDimensionA: 0,
            shapeDimensionB: 0,
            shapeOffsetX: 0,
            shapeOffsetY: 0,
            polygonOrigin: 'Center',
            vertices: [],
            density: 1.0,
            friction: 0.01,
            restitution: 0.1,
            linearDamping: 0.01,
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

    it('should bounce', () => {
      runtimeGame.setGameResolutionSize(1000, 1000);

      const movingObject = createObject();
      const staticObject = createObject({ bodyType: 'Static' });
      staticObject.setPosition(500, 805);
      movingObject.setPosition(500, 780);
      const staticObjectBehavior = staticObject.getBehavior('Physics2');
      const movingObjectBehavior = movingObject.getBehavior('Physics2');
      if (!staticObjectBehavior || !movingObjectBehavior) {
        throw new Error('Behaviors not found, test cannot be run.');
      }
      movingObjectBehavior.setLinearVelocityY(40000);
      // behavior.applyImpulse(0, 10000, 0, 0);

      let hasChecked = false;
      let stepIndex = 0;
      while (stepIndex < 10 && !hasChecked) {
        if (movingObjectBehavior.getLinearVelocityY() < 0) {
          hasChecked = true;
          expect(movingObject.getY() < staticObject.getY()).to.be(true);
          expect(movingObjectBehavior.getLinearVelocityY() < 0).to.be(true);
          expect(
            gdjs.Physics2RuntimeBehavior.hasCollisionStartedBetween(
              movingObject,
              staticObject,
              'Physics2'
            )
          ).to.be(true);
          hasChecked = true;
        }
        runtimeScene.renderAndStep(100 / fps);

        stepIndex++;
      }
      if (!hasChecked) {
        throw new Error('Contact did not happen, nothing was tested.');
      }
    });
  });
});
