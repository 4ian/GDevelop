// @ts-check

describe('gdjs.SpriteRuntimeObject', function () {
  const runtimeGame = gdjs.getPixiRuntimeGame();
  var runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  const makeSpriteRuntimeObjectWithCustomHitBox = (runtimeScene) =>
    new gdjs.SpriteRuntimeObject(runtimeScene, {
      name: 'obj1',
      type: 'Sprite',
      updateIfNotVisible: false,
      variables: [],
      behaviors: [],
      effects: [],
      animations: [
        {
          name: 'NewObject2',
          useMultipleDirections: false,
          directions: [
            {
              looping: false,
              timeBetweenFrames: 1,
              sprites: [
                {
                  hasCustomCollisionMask: true,
                  image: 'NewObject2-2.png',
                  points: [],
                  originPoint: {
                    name: 'origine',
                    x: 32,
                    y: 16,
                  },
                  centerPoint: {
                    automatic: false,
                    name: 'centre',
                    x: 64,
                    y: 31,
                  },
                  customCollisionMask: [
                    [
                      {
                        x: 12.5,
                        y: 1,
                      },
                      {
                        x: 41.5,
                        y: 2,
                      },
                      {
                        x: 55.5,
                        y: 31,
                      },
                      {
                        x: 24.5,
                        y: 30,
                      },
                    ],
                  ],
                },
              ],
            },
          ],
        },
      ],
    });

  it('benchmark getAABB of rotated vs non rotated sprite, with custom hitboxes, origin and center', function () {
    this.timeout(20000);
    const object = makeSpriteRuntimeObjectWithCustomHitBox(runtimeScene);

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 60,
      iterationsCount: 60000,
    });
    benchmarkSuite
      .add(
        'getAABB of a non rotated sprite, with custom hitboxes, origin and center',
        (i) => {
          object.setAngle(0);
          object.setX(i);
          object.getAABB();
        }
      )
      .add(
        'getAABB of a rotated sprite, with custom hitboxes, origin and center',
        (i) => {
          object.setAngle(90);
          object.setX(i);
          object.getAABB();
        }
      );

    console.log(benchmarkSuite.run());
  });
});
