// @flow

/**
 * The easing functions used by the Tween extension.
 *
 * Kept in sync with `Extensions/TweenBehavior/TweenManager.ts` (the runtime),
 * which cannot be imported in the IDE. They are only used to draw previews.
 * `parseCubicBezierOrNull` and `createCubicBezierEasing` are part of this copy.
 */
export type EasingFunction = (pos: number) => number;

// prettier-ignore
export const easingFunctions: { [string]: EasingFunction } = {
  linear: pos => pos,

  easeInQuad: pos => Math.pow(pos, 2),
  easeOutQuad: pos => -(Math.pow(pos - 1, 2) - 1),
  easeInOutQuad: pos =>
    (pos /= 0.5) < 1 ? 0.5 * Math.pow(pos, 2) : -0.5 * ((pos -= 2) * pos - 2),

  easeInCubic: pos => Math.pow(pos, 3),
  easeOutCubic: pos => Math.pow(pos - 1, 3) + 1,
  easeInOutCubic: pos =>
    (pos /= 0.5) < 1
      ? 0.5 * Math.pow(pos, 3)
      : 0.5 * (Math.pow(pos - 2, 3) + 2),

  easeInQuart: pos => Math.pow(pos, 4),
  easeOutQuart: pos => -(Math.pow(pos - 1, 4) - 1),
  easeInOutQuart: pos =>
    (pos /= 0.5) < 1
      ? 0.5 * Math.pow(pos, 4)
      : -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2),

  easeInQuint: pos => Math.pow(pos, 5),
  easeOutQuint: pos => Math.pow(pos - 1, 5) + 1,
  easeInOutQuint: pos =>
    (pos /= 0.5) < 1
      ? 0.5 * Math.pow(pos, 5)
      : 0.5 * (Math.pow(pos - 2, 5) + 2),

  easeInSine: pos => -Math.cos(pos * (Math.PI / 2)) + 1,
  easeOutSine: pos => Math.sin(pos * (Math.PI / 2)),
  easeInOutSine: pos => -0.5 * (Math.cos(Math.PI * pos) - 1),

  easeInExpo: pos => (pos === 0 ? 0 : Math.pow(2, 10 * (pos - 1))),
  easeOutExpo: pos => (pos === 1 ? 1 : -Math.pow(2, -10 * pos) + 1),
  easeInOutExpo: pos => {
    if (pos === 0) return 0;
    if (pos === 1) return 1;
    if ((pos /= 0.5) < 1) return 0.5 * Math.pow(2, 10 * (pos - 1));
    return 0.5 * (-Math.pow(2, -10 * --pos) + 2);
  },

  easeInCirc: pos => -(Math.sqrt(1 - pos * pos) - 1),
  easeOutCirc: pos => Math.sqrt(1 - Math.pow(pos - 1, 2)),
  easeInOutCirc: pos =>
    (pos /= 0.5) < 1
      ? -0.5 * (Math.sqrt(1 - pos * pos) - 1)
      : 0.5 * (Math.sqrt(1 - (pos -= 2) * pos) + 1),

  easeOutBounce: pos => {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  },

  easeInBack: pos => {
    const s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },
  easeOutBack: pos => {
    const s = 1.70158;
    return (pos = pos - 1) * pos * ((s + 1) * pos + s) + 1;
  },
  easeInOutBack: pos => {
    let s = 1.70158;
    if ((pos /= 0.5) < 1) {
      return 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s));
    }
    return 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },

  elastic: pos =>
    -1 * Math.pow(4, -8 * pos) * Math.sin(((pos * 6 - 1) * (2 * Math.PI)) / 2) +
    1,

  swingFromTo: pos => {
    let s = 1.70158;
    return (pos /= 0.5) < 1
      ? 0.5 * (pos * pos * (((s *= 1.525) + 1) * pos - s))
      : 0.5 * ((pos -= 2) * pos * (((s *= 1.525) + 1) * pos + s) + 2);
  },
  swingFrom: pos => {
    const s = 1.70158;
    return pos * pos * ((s + 1) * pos - s);
  },
  swingTo: pos => {
    const s = 1.70158;
    return (pos -= 1) * pos * ((s + 1) * pos + s) + 1;
  },

  bounce: pos => {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75;
    } else if (pos < 2.5 / 2.75) {
      return 7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375;
    } else {
      return 7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375;
    }
  },
  bouncePast: pos => {
    if (pos < 1 / 2.75) {
      return 7.5625 * pos * pos;
    } else if (pos < 2 / 2.75) {
      return 2 - (7.5625 * (pos -= 1.5 / 2.75) * pos + 0.75);
    } else if (pos < 2.5 / 2.75) {
      return 2 - (7.5625 * (pos -= 2.25 / 2.75) * pos + 0.9375);
    } else {
      return 2 - (7.5625 * (pos -= 2.625 / 2.75) * pos + 0.984375);
    }
  },

  easeFromTo: pos =>
    (pos /= 0.5) < 1
      ? 0.5 * Math.pow(pos, 4)
      : -0.5 * ((pos -= 2) * Math.pow(pos, 3) - 2),
  easeFrom: pos => Math.pow(pos, 4),
  easeTo: pos => Math.pow(pos, 0.25),
};

export const allEasingNames: Array<string> = Object.keys(easingFunctions);

/*!
 * BezierEasing - use bezier curve for transition easing function
 * by Gaëtan Renaudeau 2014 - 2015 – MIT License
 * https://github.com/gre/bezier-easing
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */
const NEWTON_ITERATIONS = 4;
const NEWTON_MIN_SLOPE = 0.001;
const SUBDIVISION_PRECISION = 0.0000001;
const SUBDIVISION_MAX_ITERATIONS = 10;
const SPLINE_TABLE_SIZE = 11;
const SAMPLE_STEP_SIZE = 1.0 / (SPLINE_TABLE_SIZE - 1.0);
const CUBIC_BEZIER_DECIMALS = 3;

const CUBIC_BEZIER_NUMBER =
  '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:[eE][+-]?\\d+)?';
const CUBIC_BEZIER_PATTERN = new RegExp(
  '^\\s*cubic-bezier\\s*\\(\\s*(' +
    CUBIC_BEZIER_NUMBER +
    ')\\s*,\\s*(' +
    CUBIC_BEZIER_NUMBER +
    ')\\s*,\\s*(' +
    CUBIC_BEZIER_NUMBER +
    ')\\s*,\\s*(' +
    CUBIC_BEZIER_NUMBER +
    ')\\s*\\)\\s*$',
  'i'
);

export type CubicBezierPoints = [number, number, number, number];

const bezierCoefficientA = (a1: number, a2: number): number =>
  1.0 - 3.0 * a2 + 3.0 * a1;
const bezierCoefficientB = (a1: number, a2: number): number =>
  3.0 * a2 - 6.0 * a1;
const bezierCoefficientC = (a1: number): number => 3.0 * a1;

const calcBezier = (t: number, a1: number, a2: number): number =>
  ((bezierCoefficientA(a1, a2) * t + bezierCoefficientB(a1, a2)) * t +
    bezierCoefficientC(a1)) *
  t;

const getSlope = (t: number, a1: number, a2: number): number =>
  3.0 * bezierCoefficientA(a1, a2) * t * t +
  2.0 * bezierCoefficientB(a1, a2) * t +
  bezierCoefficientC(a1);

const binarySubdivide = (
  x: number,
  a: number,
  b: number,
  x1: number,
  x2: number
): number => {
  let currentX = 0;
  let currentT = 0;
  let i = 0;
  do {
    currentT = a + (b - a) / 2.0;
    currentX = calcBezier(currentT, x1, x2) - x;
    if (currentX > 0.0) {
      b = currentT;
    } else {
      a = currentT;
    }
  } while (
    Math.abs(currentX) > SUBDIVISION_PRECISION &&
    ++i < SUBDIVISION_MAX_ITERATIONS
  );
  return currentT;
};

const newtonRaphsonIterate = (
  x: number,
  guessT: number,
  x1: number,
  x2: number
): number => {
  for (let i = 0; i < NEWTON_ITERATIONS; ++i) {
    const currentSlope = getSlope(guessT, x1, x2);
    if (currentSlope === 0.0) {
      return guessT;
    }
    const currentX = calcBezier(guessT, x1, x2) - x;
    guessT -= currentX / currentSlope;
  }
  return guessT;
};

/** Parse a `cubic-bezier(x1,y1,x2,y2)` string. Return `null` if the string is not valid. */
export const parseCubicBezierOrNull = (
  identifier: string
): ?CubicBezierPoints => {
  const match = CUBIC_BEZIER_PATTERN.exec(identifier);
  if (!match) return null;

  const x1 = Number(match[1]);
  const y1 = Number(match[2]);
  const x2 = Number(match[3]);
  const y2 = Number(match[4]);
  if (
    !Number.isFinite(x1) ||
    !Number.isFinite(y1) ||
    !Number.isFinite(x2) ||
    !Number.isFinite(y2) ||
    x1 < 0 ||
    x1 > 1 ||
    x2 < 0 ||
    x2 > 1
  ) {
    return null;
  }
  return [x1, y1, x2, y2];
};

export const createCubicBezierEasing = (
  points: CubicBezierPoints
): EasingFunction => {
  const [x1, y1, x2, y2] = points;
  if (x1 === y1 && x2 === y2) {
    return easingFunctions.linear;
  }

  const sampleValues: Float32Array | Array<number> =
    typeof Float32Array === 'function'
      ? new Float32Array(SPLINE_TABLE_SIZE)
      : new Array(SPLINE_TABLE_SIZE);
  for (let i = 0; i < SPLINE_TABLE_SIZE; ++i) {
    sampleValues[i] = calcBezier(i * SAMPLE_STEP_SIZE, x1, x2);
  }

  const getTForX = (x: number): number => {
    let intervalStart = 0.0;
    let currentSample = 1;
    const lastSample = SPLINE_TABLE_SIZE - 1;

    for (
      ;
      currentSample !== lastSample && sampleValues[currentSample] <= x;
      ++currentSample
    ) {
      intervalStart += SAMPLE_STEP_SIZE;
    }
    --currentSample;

    const dist =
      (x - sampleValues[currentSample]) /
      (sampleValues[currentSample + 1] - sampleValues[currentSample]);
    const guessForT = intervalStart + dist * SAMPLE_STEP_SIZE;
    const initialSlope = getSlope(guessForT, x1, x2);
    if (initialSlope >= NEWTON_MIN_SLOPE) {
      return newtonRaphsonIterate(x, guessForT, x1, x2);
    }
    if (initialSlope === 0.0) {
      return guessForT;
    }
    return binarySubdivide(
      x,
      intervalStart,
      intervalStart + SAMPLE_STEP_SIZE,
      x1,
      x2
    );
  };

  return (progress: number): number => {
    if (progress === 0 || progress === 1) {
      return progress;
    }
    return calcBezier(getTForX(progress), y1, y2);
  };
};

/** Round to the precision kept in a cubic-bezier value (3 decimals, no `-0`). */
export const roundCubicBezierNumber = (value: number): number => {
  const rounded = Number(value.toFixed(CUBIC_BEZIER_DECIMALS));
  return rounded === 0 ? 0 : rounded;
};

const formatCubicBezierNumber = (value: number): string =>
  // Compact form: 0.91 -> .91, -0.56 -> -.56.
  String(roundCubicBezierNumber(value)).replace(/^(-?)0\./, '$1.');

/** Return `cubic-bezier(.91,.17,.08,.88)`, with a maximum of 3 decimals. */
export const formatCubicBezier = (points: CubicBezierPoints): string =>
  'cubic-bezier(' + points.map(formatCubicBezierNumber).join(',') + ')';

/** CSS `ease`. */
export const cssEasePoints: CubicBezierPoints = [0.25, 0.1, 0.25, 1];

/** Shown as the custom-curve example in the editor. */
export const customEasingExampleIdentifier: string = formatCubicBezier(
  cssEasePoints
);

export const getBuiltInEasingFunction = (name: string): ?EasingFunction =>
  easingFunctions.hasOwnProperty(name) ? easingFunctions[name] : null;

/** Return a built-in easing or a custom easing. Return `null` if the identifier is not valid. */
export const getEasingFunction = (
  easingIdentifier: string
): ?EasingFunction => {
  const builtInEasing = getBuiltInEasingFunction(easingIdentifier);
  if (builtInEasing) return builtInEasing;
  const points = parseCubicBezierOrNull(easingIdentifier);
  return points ? createCubicBezierEasing(points) : null;
};

export type EasingValueRange = {| min: number, max: number |};

/**
 * Lowest and highest values of an easing, sampled over [0, 1]. The range always
 * includes 0 and 1, so it is wider for easings that overshoot.
 */
export const getEasingValueRange = (
  easingFunction: EasingFunction,
  samplesCount: number
): EasingValueRange => {
  let min = 0;
  let max = 1;
  for (let i = 0; i <= samplesCount; i++) {
    const value = easingFunction(i / samplesCount);
    if (!Number.isFinite(value)) continue;
    min = Math.min(min, value);
    max = Math.max(max, value);
  }
  return { min, max };
};

/**
 * Check if a list of choices (from a `stringWithSelector` parameter) is a list
 * of easings, so that a preview of the curve can be shown.
 */
export const isEasingChoiceList = (choices: Array<string>): boolean =>
  choices.length > 1 &&
  choices.every(choice => !!getBuiltInEasingFunction(choice));
