describe('gdjs.PlatformerObjectRuntimeBehavior Benchmark', function () {
  let runtimeScene;
  let objects;
  const duplicateCount = 60;
  const stepCount = 6000;

  beforeEach(function () {
    runtimeScene = makePlatformerTestRuntimeScene();

    objects = new Array(duplicateCount);
    for (let i = 0; i < duplicateCount; ++i) {
      // Put a platformer object on a platform
      object = new gdjs.RuntimeObject(runtimeScene, {
        name: 'obj1',
        type: '',
        behaviors: [
          {
            type: 'PlatformBehavior::PlatformerObjectBehavior',
            name: 'auto1',
            gravity: 1500,
            maxFallingSpeed: 1500,
            acceleration: 500,
            deceleration: 1500,
            maxSpeed: 500,
            jumpSpeed: 900,
            canGrabPlatforms: true,
            ignoreDefaultControls: true,
            slopeMaxAngle: 60,
            jumpSustainTime: 0.2,
            roundCoordinates: true,
          },
        ],
      });
      object.getWidth = function () {
        return 10;
      };
      object.getHeight = function () {
        return 20;
      };
      runtimeScene.addObject(object);
      object.setPosition(100 * i + 60 * 5, 400 * i - 32);
      objects[i] = object;

      // Put a platform.
      for (let p = 0; p < 10; ++p) {
        const platform = addPlatformObject(runtimeScene);
        platform.setPosition(100 * i + p * platform.getWidth(), 400 * i - 10);
      }
    }
  });

  it('benchmark', function () {
    this.timeout(30000);

    for (let b = 0; b < 10; ++b) {
      const benchmarkSuite = makeBenchmarkSuite({
        benchmarksCount: 1,
        iterationsCount: stepCount,
      });
      benchmarkSuite.add('jump in loop', (t) => {
        for (let i = 0; i < duplicateCount; ++i) {
          const object = objects[i];
          if (t % 60 == i % 60) {
            object.getBehavior('auto1').simulateJumpKey();
          }
          if (t + (i % 61) < 31) {
            object.getBehavior('auto1').simulateRightKey();
          }
          if (t + (i % 61) >= 31) {
            object.getBehavior('auto1').simulateLeftKey();
          }
        }
        runtimeScene.renderAndStep(1000 / 60);
      });
      console.log(benchmarkSuite.run());
    }
  });
});
