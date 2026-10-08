// @ts-check
describe('gdjs.evtTools.tween cubic-bezier easing', () => {
  const tween = gdjs.evtTools.tween;
  // @ts-ignore - loaded as a global script before the specs.
  const testCases = cubicBezierEasingTestCases;
  // Matches CUSTOM_EASING_CACHE_MAX_ENTRIES in TweenManager.ts.
  const customEasingCacheMaxEntries = 256;

  // The cache is shared by every test: never reuse an identifier.
  let uniqueIdentifierCount = 0;
  const newCustomIdentifier = () =>
    `cubic-bezier(0,${++uniqueIdentifierCount},1,0.5)`;
  const newUnknownIdentifier = () =>
    `unknown-easing-${++uniqueIdentifierCount}`;

  const getWarningMessages = (log) =>
    log
      .getCalls()
      .filter((call) => call.args[0] === 'Tween' && call.args[2] === 'warning')
      .map((call) => call.args[1]);

  it('parses a valid cubic-bezier value', () => {
    testCases.validIdentifiers.forEach(([identifier, points]) => {
      expect(tween.parseCubicBezierOrNull(identifier)).to.eql(points);
    });
  });

  it('rejects an invalid cubic-bezier value', () => {
    testCases.invalidIdentifiers.forEach((identifier) => {
      expect(tween.parseCubicBezierOrNull(identifier)).to.be(null);
    });
  });

  it('computes the expected eased values', () => {
    testCases.easingSamples.forEach(([points, samples]) => {
      const easing = tween.createCubicBezierEasing(points);
      samples.forEach(([progress, expected]) => {
        expect(easing(progress)).to.be.within(
          expected - testCases.sampleTolerance,
          expected + testCases.sampleTolerance
        );
      });
    });
  });

  it('returns exactly 0 at 0 and exactly 1 at 1', () => {
    const easing = tween.createCubicBezierEasing([0.91, 0.17, 0.08, 0.88]);
    expect(easing(0)).to.be(0);
    expect(easing(1)).to.be(1);
  });

  it('does not use Object.prototype for an unknown name', () => {
    expect(tween.getEasingFunction('toString')).to.be(null);
  });

  it('keeps one function for one custom easing identifier', () => {
    const identifier = newCustomIdentifier();
    expect(tween.getEasingFunction(identifier)).to.be(
      tween.getEasingFunction(identifier)
    );
  });

  it('warns once for an unknown easing identifier', () => {
    const log = sinon.spy(gdjs.Logger.getLoggerOutput(), 'log');
    try {
      const identifier = newUnknownIdentifier();
      tween.getEasingFunction(identifier);
      tween.getEasingFunction(identifier);
      expect(getWarningMessages(log).length).to.be(1);
    } finally {
      log.restore();
    }
  });

  it('forgets the least recently used custom easing when the cache is full', () => {
    const identifiers = [];
    const functions = [];
    for (let index = 0; index < customEasingCacheMaxEntries; index++) {
      const identifier = newCustomIdentifier();
      identifiers.push(identifier);
      functions.push(tween.getEasingFunction(identifier));
    }

    // Evicts identifiers[0].
    tween.getEasingFunction(newCustomIdentifier());
    // Makes identifiers[1] the most recently used.
    expect(tween.getEasingFunction(identifiers[1])).to.be(functions[1]);
    // Evicts identifiers[2], not identifiers[1].
    const recreated = tween.getEasingFunction(identifiers[0]);
    expect(recreated).not.to.be(null);
    expect(recreated).not.to.be(functions[0]);

    expect(tween.getEasingFunction(identifiers[1])).to.be(functions[1]);
    expect(tween.getEasingFunction(identifiers[2])).not.to.be(functions[2]);
  });

  it('warns again only after an unknown identifier leaves the cache', () => {
    const log = sinon.spy(gdjs.Logger.getLoggerOutput(), 'log');
    try {
      const evictedIdentifier = newUnknownIdentifier();
      tween.getEasingFunction(evictedIdentifier);
      const firstCustomIdentifier = newCustomIdentifier();
      tween.getEasingFunction(firstCustomIdentifier);
      for (let index = 0; index < customEasingCacheMaxEntries - 2; index++) {
        tween.getEasingFunction(newCustomIdentifier());
      }
      log.resetHistory();

      const newIdentifier = newUnknownIdentifier();
      tween.getEasingFunction(newIdentifier);
      tween.getEasingFunction(firstCustomIdentifier);
      tween.getEasingFunction(evictedIdentifier);

      const messages = getWarningMessages(log);
      expect(messages.length).to.be(2);
      expect(
        messages.filter((message) => message.includes(newIdentifier)).length
      ).to.be(1);
      expect(
        messages.filter((message) => message.includes(evictedIdentifier)).length
      ).to.be(1);
    } finally {
      log.restore();
    }
  });

  it('eases a value with a custom easing', () => {
    const eased = tween.ease('cubic-bezier(.42,0,.58,1)', 0, 100, 0.25);
    expect(eased).to.be.within(12.816, 13.016);
    expect(eased).not.to.be(tween.ease('linear', 0, 100, 0.25));
  });
});
