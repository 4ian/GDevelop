// @ts-check

/**
 * Micro benchmarks of the in-game editor instances data index.
 *
 * They compare the indexed lookup (used by the editor to know if an instance
 * is locked/sealed/hidden) with the linear scan that was used before, so that
 * a regression of the complexity is visible in `compare-benchmarks.js`.
 */
describe('In-game editor instances data lookups', function () {
  /**
   * @param {number} index
   * @returns {InstanceData}
   */
  const makeInstanceData = (index) => ({
    name: 'Object',
    persistentUuid: 'instance-' + index,
    x: index,
    y: 0,
    z: 0,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer: '',
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    depth: 0,
    locked: false,
    sealed: false,
    hidden: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  for (const instancesCount of [1000, 5000, 10000]) {
    it(`benchmark lookup with ${instancesCount} instances`, function () {
      this.timeout(120000);

      const instances = [];
      for (let index = 0; index < instancesCount; index++) {
        instances.push(makeInstanceData(index));
      }

      const instancesIndex = new gdjs.InGameEditorInstancesDataIndex();
      instancesIndex.addAll(instances);

      // A prime number, so that the looked up UUIDs cycle through all the
      // instances instead of always hitting the same ones.
      const steps = 7919;
      let iteration = 0;
      const nextUuid = () =>
        'instance-' + ((iteration++ * steps) % instancesCount);

      const benchmarkSuite = makeBenchmarkSuite({
        benchmarksCount: 30,
        iterationsCount: Math.max(100, Math.floor(200000 / instancesCount)),
      });

      benchmarkSuite.add(`linear scan (${instancesCount} instances)`, () => {
        const persistentUuid = nextUuid();
        instances.find(
          (instance) => instance.persistentUuid === persistentUuid
        );
      });

      benchmarkSuite.add(`indexed lookup (${instancesCount} instances)`, () => {
        instancesIndex.getByPersistentUuid(nextUuid());
      });

      benchmarkSuite.add(`add all (${instancesCount} instances)`, () => {
        const index = new gdjs.InGameEditorInstancesDataIndex();
        index.addAll(instances);
      });

      console.log(benchmarkSuite.run());
    });
  }
});
