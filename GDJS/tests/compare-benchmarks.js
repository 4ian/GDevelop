// @ts-check
/**
 * Compare the benchmarks (`GDJS/tests/benchmarks`) of the current version of
 * the game engine with a base version (by default, where the branch started
 * from `origin/master`).
 *
 * Both versions are built, then the benchmarks are run alternately on each
 * version, on the same machine: the differences of speed between machines
 * (or a machine slowing down during the run) don't affect the comparison.
 *
 * Usage: node compare-benchmarks.js [--base-ref=origin/master] [--rounds=3]
 *   [--grep=<benchmark name pattern>] [--markdown=<file>] [--json=<file>]
 *   [--browser=ChromeHeadlessBenchmark]
 */
const { execFileSync, spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');
const args = require('minimist')(process.argv.slice(2), {
  string: ['base-ref', 'grep', 'markdown', 'json', 'browser'],
  default: {
    'base-ref': 'origin/master',
    rounds: 3,
    browser: 'ChromeHeadlessBenchmark',
  },
});

/** A change smaller than this is never reported as significant. */
const MINIMUM_SIGNIFICANT_CHANGE = 0.05;

const repositoryPath = path.join(__dirname, '../..');
// Relative to the repository root, as expected by `karma.conf.js`.
const builtRuntimesPath = 'GDJS/tests/.benchmark-runtimes';
const resultsPath = path.join(repositoryPath, builtRuntimesPath, 'results');

/**
 * @typedef {{
 *   name: string,
 *   samplesMs: Array<number>,
 *   counters?: {[counterName: string]: number | string | null},
 * }} BenchmarkResult
 * @typedef {'base' | 'head'} Version
 */

/**
 * @param {Array<string>} gitArgs
 * @param {string=} cwd
 */
const git = (gitArgs, cwd = repositoryPath) =>
  execFileSync('git', gitArgs, { cwd, encoding: 'utf8' }).trim();

/**
 * @param {string} gdjsPath The `GDJS` folder of the version to build.
 * @param {Version} version
 */
const buildRuntime = (gdjsPath, version) => {
  const outPath = path.join(repositoryPath, builtRuntimesPath, version);
  fs.rmSync(outPath, { recursive: true, force: true });
  execFileSync('node', ['scripts/build.js', '--out', outPath], {
    cwd: gdjsPath,
    stdio: 'inherit',
  });
};

/** @param {string} baseCommit */
const buildBaseRuntime = (baseCommit) => {
  const worktreePath = fs.mkdtempSync(
    path.join(os.tmpdir(), 'gdjs-benchmark-base-')
  );
  git(['worktree', 'add', '--detach', worktreePath, baseCommit]);
  try {
    // The dependencies of the current version are reused (they rarely change
    // and are only used to build).
    fs.symlinkSync(
      path.join(repositoryPath, 'GDJS/node_modules'),
      path.join(worktreePath, 'GDJS/node_modules'),
      'dir'
    );
    buildRuntime(path.join(worktreePath, 'GDJS'), 'base');
  } finally {
    git(['worktree', 'remove', '--force', worktreePath]);
  }
};

/**
 * @param {Version} version
 * @param {number} round
 * @returns {Array<BenchmarkResult>}
 */
const runBenchmarks = (version, round) => {
  const resultsFile = path.join(resultsPath, `${version}-${round}.json`);
  console.log(`\n⏱️  Running the benchmarks on ${version} (round ${round})...`);
  const { status } = spawnSync(
    'npx',
    [
      'karma',
      'start',
      '--single-run',
      `--browsers=${args.browser}`,
      '--benchmarksOnly',
      `--gdjsRuntimePath=${builtRuntimesPath}/${version}`,
      `--benchmarkResultsFile=${resultsFile}`,
      ...(args.grep ? [`--grep=${args.grep}`] : []),
    ],
    { cwd: __dirname, stdio: 'inherit' }
  );
  if (status !== 0) {
    console.warn(
      `⚠️  Some benchmarks failed on ${version} (round ${round}): they are reported as missing.`
    );
  }
  return fs.existsSync(resultsFile)
    ? JSON.parse(fs.readFileSync(resultsFile, 'utf8'))
    : [];
};

/** @param {Array<number>} values */
const median = (values) => {
  const sortedValues = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sortedValues.length / 2);
  return sortedValues.length % 2
    ? sortedValues[middle]
    : (sortedValues[middle - 1] + sortedValues[middle]) / 2;
};

/** @param {number} change */
const formatChange = (change) =>
  (change > 0 ? '+' : '') + (change * 100).toFixed(1) + '%';

/** @param {number} timeMs */
const formatTime = (timeMs) =>
  timeMs >= 10 ? timeMs.toFixed(1) + 'ms' : timeMs.toFixed(3) + 'ms';

/**
 * Counters don't depend on the machine: compare them exactly. A counter
 * differing between rounds of the same version is not deterministic.
 * @param {Array<BenchmarkResult>} baseResults
 * @param {Array<BenchmarkResult>} headResults
 * @returns {Array<{name: string, base: string, head: string}>}
 */
const compareCounters = (baseResults, headResults) => {
  const counterNames = new Set(
    [...baseResults, ...headResults].flatMap((result) =>
      Object.keys(result.counters || {})
    )
  );
  return [...counterNames].map((counterName) => {
    /** @param {Array<BenchmarkResult>} results */
    const formatCounter = (results) => {
      const values = [
        ...new Set(
          results.map((result) => String((result.counters || {})[counterName]))
        ),
      ];
      if (!values.length) return '-';
      return values.length === 1
        ? values[0]
        : values.join(' / ') + ' (not deterministic)';
    };
    return {
      name: counterName,
      base: formatCounter(baseResults),
      head: formatCounter(headResults),
    };
  });
};

/**
 * @param {{[version: string]: Array<Array<BenchmarkResult>>}} resultsByVersionAndRound
 */
const compareResults = (resultsByVersionAndRound) => {
  /** @type {Array<string>} */
  const benchmarkNames = [];
  for (const version of ['base', 'head']) {
    for (const roundResults of resultsByVersionAndRound[version]) {
      for (const { name } of roundResults) {
        if (!benchmarkNames.includes(name)) benchmarkNames.push(name);
      }
    }
  }

  return benchmarkNames.map((name) => {
    /** @param {Version} version */
    const getRoundResults = (version) =>
      resultsByVersionAndRound[version]
        .map((roundResults) =>
          roundResults.find((result) => result.name === name)
        )
        .filter(Boolean);
    const baseResults = getRoundResults('base');
    const headResults = getRoundResults('head');
    // Each round is summarized by its median: robust to a few slow samples
    // (garbage collection, the machine doing something else...).
    const baseMediansMs = baseResults.map((result) => median(result.samplesMs));
    const headMediansMs = headResults.map((result) => median(result.samplesMs));
    if (!baseMediansMs.length || !headMediansMs.length) {
      return {
        name,
        baseMs: baseMediansMs.length ? median(baseMediansMs) : null,
        headMs: headMediansMs.length ? median(headMediansMs) : null,
        change: null,
        changeRange: null,
        verdict: baseMediansMs.length ? 'removed or failing' : 'new',
        counters: compareCounters(baseResults, headResults),
      };
    }

    const baseMs = median(baseMediansMs);
    const headMs = median(headMediansMs);
    const change = headMs / baseMs - 1;
    // The changes measured between every round of the base and every round
    // of the head: the change is significant only if all agree.
    const roundChanges = baseMediansMs.flatMap((baseMedianMs) =>
      headMediansMs.map((headMedianMs) => headMedianMs / baseMedianMs - 1)
    );
    const changeRange = [Math.min(...roundChanges), Math.max(...roundChanges)];
    const isSignificant =
      Math.abs(change) >= MINIMUM_SIGNIFICANT_CHANGE &&
      (changeRange[0] > 0 || changeRange[1] < 0);

    return {
      name,
      baseMs,
      headMs,
      change,
      changeRange,
      verdict: !isSignificant ? 'unchanged' : change < 0 ? 'faster' : 'slower',
      counters: compareCounters(baseResults, headResults),
    };
  });
};

/**
 * @param {ReturnType<typeof compareResults>} comparisons
 * @param {{baseCommit: string, headCommit: string, rounds: number}} context
 */
const makeMarkdownReport = (
  comparisons,
  { baseCommit, headCommit, rounds }
) => {
  const verdictEmojis = {
    faster: '🚀 faster',
    slower: '🐢 slower',
    unchanged: '≈',
    new: '🆕',
    'removed or failing': '⚠️ removed or failing',
  };
  const lines = [
    '<!-- benchmark-results -->',
    '### ⏱️ Game engine benchmarks',
    '',
    `Comparing \`${headCommit.slice(0, 8)}\` to its base \`${baseCommit.slice(0, 8)}\` ` +
      '(on a pull request, the version tested is the pull request merged into its base), ' +
      `run alternately ${rounds} times on the same machine (${os.cpus()[0].model}, ` +
      `${os.cpus().length} cores, rendering without GPU).`,
    '',
    '| Benchmark | Base | This version | Change | Range between rounds | |',
    '|---|---:|---:|---:|---:|---|',
    ...comparisons.map(
      ({ name, baseMs, headMs, change, changeRange, verdict }) =>
        `| ${name} | ${baseMs === null ? '-' : formatTime(baseMs)} | ` +
        `${headMs === null ? '-' : formatTime(headMs)} | ` +
        `${change === null ? '-' : formatChange(change)} | ` +
        `${changeRange === null ? '-' : changeRange.map(formatChange).join(' to ')} | ` +
        `${verdictEmojis[verdict]} |`
    ),
    '',
    'Times are the median duration of a batch of iterations (micro benchmarks) or of a frame (scene benchmarks). ' +
      `A change is reported only when larger than ${MINIMUM_SIGNIFICANT_CHANGE * 100}% ` +
      'and measured by every pair of rounds.',
  ];

  const changedCounters = comparisons.flatMap(({ name, counters }) =>
    counters
      .filter(
        (counter) =>
          (counter.base !== '-' &&
            counter.head !== '-' &&
            counter.base !== counter.head) ||
          counter.base.includes('not deterministic') ||
          counter.head.includes('not deterministic')
      )
      .map((counter) => ({ benchmarkName: name, ...counter }))
  );
  const comparedCountersBenchmarksCount = comparisons.filter(({ counters }) =>
    counters.some((counter) => counter.base !== '-' && counter.head !== '-')
  ).length;
  lines.push(
    '',
    changedCounters.length
      ? '⚠️ **Counters changed or not deterministic** (draw calls, objects count or final state of a scene):'
      : comparedCountersBenchmarksCount
        ? `✅ The counters (draw calls, objects count and final state) of the ${comparedCountersBenchmarksCount} scene benchmarks run on both versions are unchanged.`
        : 'ℹ️ No scene benchmark ran on both versions: their counters (draw calls, objects count and final state) could not be compared.'
  );
  if (changedCounters.length) {
    lines.push(
      '',
      '| Benchmark | Counter | Base | This version |',
      '|---|---|---|---|',
      ...changedCounters.map(
        ({ benchmarkName, name, base, head }) =>
          `| ${benchmarkName} | ${name} | ${base} | ${head} |`
      )
    );
  }
  return lines.join('\n') + '\n';
};

const main = () => {
  const rounds = Number(args.rounds);
  const headCommit = git(['rev-parse', 'HEAD']);
  const baseCommit = git(['merge-base', args['base-ref'], 'HEAD']);
  fs.rmSync(resultsPath, { recursive: true, force: true });
  fs.mkdirSync(resultsPath, { recursive: true });

  console.log(
    `🏗️  Building the game engine of this version (${headCommit})...`
  );
  buildRuntime(path.join(repositoryPath, 'GDJS'), 'head');
  console.log(
    `🏗️  Building the game engine of the base version (${baseCommit})...`
  );
  buildBaseRuntime(baseCommit);

  /** @type {{[version: string]: Array<Array<BenchmarkResult>>}} */
  const resultsByVersionAndRound = { base: [], head: [] };
  for (let round = 1; round <= rounds; round++) {
    // Alternate which version runs first, so that a machine getting slower
    // (or faster) during the run affects both versions the same way.
    /** @type {Array<Version>} */
    const versions = round % 2 ? ['base', 'head'] : ['head', 'base'];
    for (const version of versions) {
      resultsByVersionAndRound[version].push(runBenchmarks(version, round));
    }
  }

  const comparisons = compareResults(resultsByVersionAndRound);
  const markdownReport = makeMarkdownReport(comparisons, {
    baseCommit,
    headCommit,
    rounds,
  });
  console.log('\n' + markdownReport);
  if (args.markdown) fs.writeFileSync(args.markdown, markdownReport);
  if (args.json) {
    fs.writeFileSync(
      args.json,
      JSON.stringify({ baseCommit, headCommit, rounds, comparisons }, null, 2)
    );
  }
};

main();
