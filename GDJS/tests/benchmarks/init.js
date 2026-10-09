// @ts-check

/**
 * @typedef {{
 *   name: string,
 *   samplesMs: Array<number>,
 *   counters?: {[counterName: string]: number | string | null},
 * }} BenchmarkResult
 */

/**
 * Send a benchmark result to the karma reporter writing the results file
 * read by `compare-benchmarks.js`. `samplesMs` are the measures to compare,
 * `counters` are values that must not depend on the machine (draw calls,
 * objects count...).
 * @param {BenchmarkResult} benchmarkResult
 */
const reportBenchmarkResult = (benchmarkResult) => {
  // @ts-ignore - Karma API to send information to the reporters.
  if (window.__karma__) window.__karma__.info({ benchmarkResult });
};

/**
 * A pseudo-random generator, so that benchmarks always create the same
 * objects at the same positions.
 * @param {number} seed
 * @returns {() => number} A function returning a number in [0, 1[.
 */
const makeSeededRandom = (seed) => {
  // Mulberry32 (https://gist.github.com/tommyettinger/46a874533244883189143505d203312c).
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

/**
 * Helper allowing to run a benchmark of the time spent the execute a certain
 * number of iterations of one or more functions.
 *
 * The first tenth of the batches are a warm-up (not measured), so that the
 * JavaScript engine optimizes the functions before they are measured.
 *
 * @param {{benchmarksCount?: number, iterationsCount?: number}} options
 */
const makeBenchmarkSuite = (options = {}) => {
  /** @type {{[benchmarkName: string]: Array<number>}} */
  const benchmarkTimings = {};
  const benchmarksCount = options.benchmarksCount || 200;
  const iterationsCount = options.iterationsCount || 100000;
  const warmUpBenchmarksCount = Math.ceil(benchmarksCount / 10);
  /** @type {Array<{title: string, fn: (i: number) => void}>} */
  const testCases = [];

  const suite = {
    /**
     * @param {string} title
     * @param {(i: number) => void} fn
     */
    add: (title, fn) => {
      testCases.push({ title, fn });
      return suite;
    },
    run: () => {
      for (
        let benchmarkIndex = -warmUpBenchmarksCount;
        benchmarkIndex < benchmarksCount;
        benchmarkIndex++
      ) {
        testCases.forEach((testCase) => {
          const description = testCase.title + '(' + iterationsCount + 'x)';
          const start = performance.now();
          for (let i = 0; i < iterationsCount; i++) {
            testCase.fn(i);
          }
          const duration = performance.now() - start;
          if (benchmarkIndex < 0) return;
          benchmarkTimings[description] = benchmarkTimings[description] || [];
          benchmarkTimings[description].push(duration);
        });
      }

      /** @type {{[benchmarkName: string]: number}} */
      const results = {};
      for (const benchmarkName in benchmarkTimings) {
        reportBenchmarkResult({
          name: benchmarkName,
          samplesMs: benchmarkTimings[benchmarkName],
        });
        results[benchmarkName] =
          benchmarkTimings[benchmarkName].reduce(
            (sum, value) => sum + value,
            0
          ) / benchmarksCount;
      }
      return results;
    },
  };
  return suite;
};
