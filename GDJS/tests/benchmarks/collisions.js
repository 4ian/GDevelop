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

  /**
   * @param {string} name
   * @param {number} enemiesCount
   * @param {number | null} bulletsCount The number of bullets, or null to test the enemies with themselves.
   */
  const benchmarkCollisions = (name, enemiesCount, bulletsCount) => {
    const random = makeSeededRandom(enemiesCount);
    const allEnemies = createObjects('Enemy', enemiesCount, random);
    const allBullets =
      bulletsCount === null
        ? allEnemies
        : createObjects('Bullet', bulletsCount, random);

    // Like the code generated for events, lists are refilled before each
    // condition, as the condition removes the objects not picked.
    const enemies = [];
    const bullets = [];
    const enemiesLists = Hashtable.newFrom({ Enemy: enemies });
    const bulletsLists =
      bulletsCount === null
        ? enemiesLists
        : Hashtable.newFrom({ Bullet: bullets });

    const benchmarkSuite = makeBenchmarkSuite({
      benchmarksCount: 30,
      // About the same duration for each objects count, with a brute-force
      // test of every pair of objects.
      iterationsCount: Math.ceil(
        1000000 / (enemiesCount * (bulletsCount || enemiesCount))
      ),
    });
    benchmarkSuite.add(name, () => {
      gdjs.copyArray(allEnemies, enemies);
      if (bulletsCount !== null) gdjs.copyArray(allBullets, bullets);
      gdjs.evtTools.object.hitBoxesCollisionTest(
        enemiesLists,
        bulletsLists,
        false,
        runtimeScene,
        false
      );
    });
    console.log(benchmarkSuite.run());
  };

  for (const objectsCount of [10, 30, 100, 500, 1000]) {
    it(`benchmark ${objectsCount} objects colliding with ${objectsCount} other objects`, function () {
      this.timeout(60000);
      benchmarkCollisions(
        `hitBoxesCollisionTest of ${objectsCount} objects with ${objectsCount} objects`,
        objectsCount,
        objectsCount
      );
    });
  }

  it('benchmark 1 object colliding with 1000 objects', function () {
    this.timeout(60000);
    benchmarkCollisions(
      'hitBoxesCollisionTest of 1 object with 1000 objects',
      1,
      1000
    );
  });

  it('benchmark 10 objects colliding with 1000 objects', function () {
    this.timeout(60000);
    benchmarkCollisions(
      'hitBoxesCollisionTest of 10 objects with 1000 objects',
      10,
      1000
    );
  });

  it('benchmark 1000 objects colliding with 1 object', function () {
    this.timeout(60000);
    benchmarkCollisions(
      'hitBoxesCollisionTest of 1000 objects with 1 object',
      1000,
      1
    );
  });

  it('benchmark 500 objects colliding with themselves', function () {
    this.timeout(60000);
    benchmarkCollisions(
      'hitBoxesCollisionTest of 500 objects with themselves',
      500,
      null
    );
  });
});
