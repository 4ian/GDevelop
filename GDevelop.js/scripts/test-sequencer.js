const Sequencer = require('@jest/test-sequencer').default;

// Test files that take much longer than the others (especially with the
// 'debug-sanitizers' build variant in CI). Jest's default sequencer only
// sorts by file size, which schedules them late: a single worker is then
// stuck running one of them while the other workers are idle, which bounds
// the total run time. Run them first instead.
const slowestTestFiles = [
  'Serializer.js',
  'GDJSBooleanOperatorsCodeGenerationIntegrationTests.js',
  'GDJSDisabledCodeGenerationIntegrationTests.js',
];

class SlowestFirstSequencer extends Sequencer {
  sort(tests) {
    const defaultOrder = super.sort(Array.from(tests));
    const rank = (test) => {
      const index = slowestTestFiles.findIndex((fileName) =>
        test.path.endsWith('/' + fileName)
      );
      return index === -1 ? slowestTestFiles.length : index;
    };
    // Stable sort: known slow files first (in the order listed above),
    // then the default order (largest file first).
    return defaultOrder
      .map((test, index) => ({ test, index }))
      .sort((a, b) => rank(a.test) - rank(b.test) || a.index - b.index)
      .map(({ test }) => test);
  }
}

module.exports = SlowestFirstSequencer;
