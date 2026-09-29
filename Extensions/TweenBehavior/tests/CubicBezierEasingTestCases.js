/**
 * Cubic-bezier cases shared by the runtime tests (Karma, global script) and
 * the editor tests (Jest, `require`), so that both implementations stay equal.
 */
(function (root) {
  const cubicBezierEasingTestCases = {
    validIdentifiers: [
      ['cubic-bezier(.91,.17,.08,.88)', [0.91, 0.17, 0.08, 0.88]],
      ['  CUBIC-BEZIER( .91 , .17 , .08 , .88 )  ', [0.91, 0.17, 0.08, 0.88]],
      ['cubic-bezier(1e-1,2.5e1,1E0,-3)', [0.1, 25, 1, -3]],
      ['cubic-bezier(0,-0.56,1,1.56)', [0, -0.56, 1, 1.56]],
    ],
    invalidIdentifiers: [
      'cubic-bezier(-0.1,0,1,1)',
      'cubic-bezier(0,0,1.1,1)',
      'cubic-bezier(0,0,1)',
      'cubic-bezier(0,0,1,1,0)',
      'cubic-bezier(NaN,0,1,1)',
      'cubic-bezier(.1,.2,.3,.4',
      '',
      'easeInQuad',
      'toString',
    ],
    // [points, [[progress, expected value], ...]], with a tolerance of 1e-3.
    easingSamples: [
      [
        [0.42, 0, 0.58, 1],
        [
          [0, 0],
          [0.25, 0.129162],
          [0.5, 0.5],
          [0.75, 0.870838],
          [1, 1],
        ],
      ],
      [
        [0, 0, 1, 1],
        [
          [0, 0],
          [0.25, 0.25],
          [0.5, 0.5],
          [0.75, 0.75],
          [1, 1],
        ],
      ],
      [
        [0.91, 0.17, 0.08, 0.88],
        [
          [0, 0],
          [1, 1],
        ],
      ],
    ],
    sampleTolerance: 1e-3,
  };

  if (typeof module !== 'undefined' && module.exports) {
    module.exports = cubicBezierEasingTestCases;
  } else {
    root.cubicBezierEasingTestCases = cubicBezierEasingTestCases;
  }
})(this);
