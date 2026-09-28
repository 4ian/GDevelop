// @ts-check
describe('gdjs.evtTools.tween cubic-bezier easing', () => {
  const tween = gdjs.evtTools.tween;
  // Matches CUSTOM_EASING_CACHE_MAX_ENTRIES in TweenManager.ts.
  const customEasingCacheMaxEntries = 256;

  beforeEach(() => {
    tween.clearCustomEasingCache();
  });

  it('parses a cubic-bezier value', () => {
    expect(
      tween.parseCubicBezierOrNull('cubic-bezier(.91,.17,.08,.88)')
    ).to.eql([0.91, 0.17, 0.08, 0.88]);
    expect(
      tween.parseCubicBezierOrNull('  CUBIC-BEZIER( .91 , .17 , .08 , .88 )  ')
    ).to.eql([0.91, 0.17, 0.08, 0.88]);
    expect(
      tween.parseCubicBezierOrNull('cubic-bezier(1e-1,2.5e1,1E0,-3)')
    ).to.eql([0.1, 25, 1, -3]);
  });

  it('rejects an invalid cubic-bezier value', () => {
    expect(tween.parseCubicBezierOrNull('cubic-bezier(-0.1,0,1,1)')).to.be(
      null
    );
    expect(tween.parseCubicBezierOrNull('cubic-bezier(0,0,1.1,1)')).to.be(null);
    expect(tween.parseCubicBezierOrNull('cubic-bezier(0,0,1)')).to.be(null);
    expect(tween.parseCubicBezierOrNull('cubic-bezier(0,0,1,1,0)')).to.be(null);
    expect(tween.parseCubicBezierOrNull('cubic-bezier(NaN,0,1,1)')).to.be(null);
    expect(tween.parseCubicBezierOrNull('')).to.be(null);
    expect(tween.parseCubicBezierOrNull('easeInQuad')).to.be(null);
  });

  it('gives the same values as linear for cubic-bezier(0,0,1,1)', () => {
    const easing = tween.createCubicBezierEasing([0, 0, 1, 1]);
    [0, 0.25, 0.5, 0.75, 1].forEach((progress) => {
      expect(easing(progress)).to.be(tween.easingFunctions.linear(progress));
    });
  });

  it('matches CSS ease-in-out', () => {
    const easing = tween.createCubicBezierEasing([0.42, 0, 0.58, 1]);
    const references = [
      [0, 0],
      [0.25, 0.129162],
      [0.5, 0.5],
      [0.75, 0.870838],
      [1, 1],
    ];
    references.forEach(([progress, expected]) => {
      expect(easing(progress)).to.be.within(expected - 1e-3, expected + 1e-3);
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
    const first = tween.getEasingFunction('cubic-bezier(.42,0,.58,1)');
    const second = tween.getEasingFunction('cubic-bezier(.42,0,.58,1)');
    expect(first).to.be(second);
  });

  it('warns once for an unknown easing identifier', () => {
    const log = sinon.spy(gdjs.Logger.getLoggerOutput(), 'log');
    try {
      tween.getEasingFunction('not-a-real-easing');
      tween.getEasingFunction('not-a-real-easing');
      const warningCount = log
        .getCalls()
        .filter(
          (call) => call.args[0] === 'Tween' && call.args[2] === 'warning'
        ).length;
      expect(warningCount).to.be(1);
    } finally {
      log.restore();
    }
  });

  it('forgets the oldest custom easing when the cache is full', () => {
    const identifierAt = (index) => `cubic-bezier(0,${index + 1},1,1)`;
    const functions = [];
    for (let index = 0; index < customEasingCacheMaxEntries; index++) {
      functions.push(tween.getEasingFunction(identifierAt(index)));
    }

    const extraIdentifier = 'cubic-bezier(0,0.5,1,0)';
    const extra = tween.getEasingFunction(extraIdentifier);
    expect(tween.getEasingFunction(identifierAt(1))).to.be(functions[1]);
    expect(tween.getEasingFunction(extraIdentifier)).to.be(extra);

    const oldestAgain = tween.getEasingFunction(identifierAt(0));
    expect(oldestAgain).not.to.be(null);
    expect(oldestAgain).not.to.be(functions[0]);
    expect(tween.getEasingFunction(identifierAt(2))).to.be(functions[2]);
  });

  it('warns again only after an unknown identifier leaves the cache', () => {
    const log = sinon.spy(gdjs.Logger.getLoggerOutput(), 'log');
    const warningMessages = () =>
      log
        .getCalls()
        .filter(
          (call) => call.args[0] === 'Tween' && call.args[2] === 'warning'
        )
        .map((call) => call.args[1]);
    try {
      tween.getEasingFunction('evicted-easing');
      for (let index = 0; index < customEasingCacheMaxEntries - 1; index++) {
        tween.getEasingFunction(`cubic-bezier(0,${index + 1},1,1)`);
      }
      log.resetHistory();

      tween.getEasingFunction('new-easing');
      tween.getEasingFunction('cubic-bezier(0,1,1,1)');
      tween.getEasingFunction('evicted-easing');

      const messages = warningMessages();
      expect(messages.length).to.be(2);
      expect(
        messages.filter((message) => message.includes('new-easing')).length
      ).to.be(1);
      expect(
        messages.filter((message) => message.includes('evicted-easing')).length
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
