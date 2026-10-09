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
   * @param {(enemiesLists: ObjectsLists, bulletsLists: ObjectsLists) => void} condition
   */
  const benchmarkCondition = (name, enemiesCount, bulletsCount, condition) => {
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
      // Batches long enough to measure both testing every pair of objects
      // and a faster algorithm (proportional to the number of objects).
      iterationsCount: Math.ceil(
        Math.max(
          1000000 / (enemiesCount * (bulletsCount || enemiesCount)),
          10000 / (enemiesCount + (bulletsCount || enemiesCount))
        )
      ),
    });
    benchmarkSuite.add(name, () => {
      gdjs.copyArray(allEnemies, enemies);
      if (bulletsCount !== null) gdjs.copyArray(allBullets, bullets);
      condition(enemiesLists, bulletsLists);
    });
    console.log(benchmarkSuite.run());
  };

  /**
   * @param {string} name
   * @param {number} enemiesCount
   * @param {number | null} bulletsCount
   */
  const benchmarkCollisions = (name, enemiesCount, bulletsCount) =>
    benchmarkCondition(
      name,
      enemiesCount,
      bulletsCount,
      (enemiesLists, bulletsLists) =>
        gdjs.evtTools.object.hitBoxesCollisionTest(
          enemiesLists,
          bulletsLists,
          false,
          runtimeScene,
          false
        )
    );

  /**
   * @param {number} distance
   * @param {number} enemiesCount
   * @param {number | null} bulletsCount
   */
  const benchmarkDistances = (distance, enemiesCount, bulletsCount) =>
    benchmarkCondition(
      `distanceTest (${distance} pixels) of ${enemiesCount} objects with ` +
        (bulletsCount === null ? 'themselves' : `${bulletsCount} objects`),
      enemiesCount,
      bulletsCount,
      (enemiesLists, bulletsLists) =>
        gdjs.evtTools.object.distanceTest(
          enemiesLists,
          bulletsLists,
          distance,
          false
        )
    );

  /** @type {Array<[number, number | null]>} */
  const distanceScenarios = [
    [10, 10],
    [30, 30],
    [100, 100],
    [500, 500],
    [1000, 1000],
    [1, 1000],
    [10, 1000],
    [1000, 1],
    [500, null],
  ];
  for (const [enemiesCount, bulletsCount] of distanceScenarios) {
    it(`benchmark distances between ${enemiesCount} objects and ${bulletsCount || 'themselves'}`, function () {
      this.timeout(60000);
      benchmarkDistances(100, enemiesCount, bulletsCount);
    });
  }

  it('benchmark distances between objects all close to each other', function () {
    this.timeout(60000);
    benchmarkDistances(100000, 500, 500);
  });

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
