// @ts-check

describe('gdjs.evtTools.object.hitBoxesCollisionTest', function () {
  const runtimeGame = gdjs.getPixiRuntimeGame();
  const runtimeScene = new gdjs.RuntimeScene(runtimeGame);

  /**
   * Objects of 32x32 pixels spread on an area growing with their number, so
   * that each object overlaps about the same number of others.
   * @param {string} name
   * @param {number} count
   * @param {() => number} random
   */
  const createObjects = (name, count, random) => {
    const areaSize = Math.sqrt(count) * 64;
    const objects = [];
    for (let i = 0; i < count; i++) {
      const object = new gdjs.TestRuntimeObject(runtimeScene, {
        name,
        type: '',
        behaviors: [],
        effects: [],
        variables: [],
      });
      object.setCustomWidthAndHeight(32, 32);
      object.setPosition(random() * areaSize, random() * areaSize);
      objects.push(object);
    }
    return objects;
  };

  for (const objectsCount of [10, 100, 500, 1000]) {
    it(`benchmark ${objectsCount} objects colliding with ${objectsCount} other objects`, function () {
      this.timeout(60000);
      const random = makeSeededRandom(objectsCount);
      const allEnemies = createObjects('Enemy', objectsCount, random);
      const allBullets = createObjects('Bullet', objectsCount, random);

      // Like the code generated for events, lists are refilled before each
      // condition, as the condition removes the objects not picked.
      const enemies = [];
      const bullets = [];
      const enemiesLists = Hashtable.newFrom({ Enemy: enemies });
      const bulletsLists = Hashtable.newFrom({ Bullet: bullets });

      const benchmarkSuite = makeBenchmarkSuite({
        benchmarksCount: 30,
        // About the same duration for each objects count, with a brute-force
        // test of every pair of objects.
        iterationsCount: Math.ceil(1000000 / (objectsCount * objectsCount)),
      });
      benchmarkSuite.add(
        `hitBoxesCollisionTest of ${objectsCount} objects with ${objectsCount} objects`,
        () => {
          gdjs.copyArray(allEnemies, enemies);
          gdjs.copyArray(allBullets, bullets);
          gdjs.evtTools.object.hitBoxesCollisionTest(
            enemiesLists,
            bulletsLists,
            false,
            runtimeScene,
            false
          );
        }
      );
      console.log(benchmarkSuite.run());
    });
  }
});
