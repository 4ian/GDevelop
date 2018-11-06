/**
 * Helper allowing to run a benchmark of the time spent the execute a certain
 * number of iterations of one or more functions.
 *
 * Note that this could surely be replaced by a more robust solution like
 * Benchmark.js
 *
 * @param {*} options
 */
let makeBenchmarkSuite = (options = {}) => {
  const benchmarkTimings = {};
  const benchmarksCount = options.benchmarksCount || 1000;
  const iterationsCount = options.iterationsCount || 100000;
  const testCases = [];

  const suite = {};
  suite.add = (title, fn) => {
    testCases.push({ title, fn });
    return suite;
  };
  suite.run = () => {
    for (
      let benchmarkIndex = 0;
      benchmarkIndex < benchmarksCount;
      benchmarkIndex++
    ) {
      testCases.forEach(testCase => {
        const description = testCase.title + '(' + iterationsCount + 'x)';
        const start = performance.now();
        for (let i = 0; i < iterationsCount; i++) {
          testCase.fn(i);
        }
        benchmarkTimings[description] = benchmarkTimings[description] || [];
        benchmarkTimings[description].push(performance.now() - start);
      });
    }

    const results = {};
    for (let benchmarkName in benchmarkTimings) {
      results[benchmarkName] =
        benchmarkTimings[benchmarkName].reduce((sum, value) => sum + value, 0) /
        benchmarksCount;
    }
    return results;
  };
  return suite;
};
