// @flow
import {
  type CubicBezierPoints,
  cssEasePoints,
  parseCubicBezierOrNull,
} from '../../Utils/Easings';

export type CubicBezierPreset = {|
  name: string,
  points: CubicBezierPoints,
|};

const linearPoints: CubicBezierPoints = [0, 0, 1, 1];

export const cssCubicBezierPresets: Array<CubicBezierPreset> = [
  { name: 'ease', points: cssEasePoints },
  { name: 'ease-in', points: [0.42, 0, 1, 1] },
  { name: 'ease-out', points: [0, 0, 0.58, 1] },
  { name: 'ease-in-out', points: [0.42, 0, 0.58, 1] },
  { name: 'linear', points: linearPoints },
];

// Bézier approximations from https://easings.net (maximum error 0.05).
const builtInEasingApproximations: { [string]: CubicBezierPoints } = {
  easeInSine: [0.12, 0, 0.39, 0],
  easeOutSine: [0.61, 1, 0.88, 1],
  easeInOutSine: [0.37, 0, 0.63, 1],
  easeInQuad: [0.11, 0, 0.5, 0],
  easeOutQuad: [0.5, 1, 0.89, 1],
  easeInOutQuad: [0.45, 0, 0.55, 1],
  easeInCubic: [0.32, 0, 0.67, 0],
  easeOutCubic: [0.33, 1, 0.68, 1],
  easeInOutCubic: [0.65, 0, 0.35, 1],
  easeInQuart: [0.5, 0, 0.75, 0],
  easeOutQuart: [0.25, 1, 0.5, 1],
  easeInOutQuart: [0.76, 0, 0.24, 1],
  easeInQuint: [0.64, 0, 0.78, 0],
  easeOutQuint: [0.22, 1, 0.36, 1],
  easeInOutQuint: [0.83, 0, 0.17, 1],
  easeInExpo: [0.7, 0, 0.84, 0],
  easeOutExpo: [0.16, 1, 0.3, 1],
  easeInOutExpo: [0.87, 0, 0.13, 1],
  easeInCirc: [0.55, 0, 1, 0.45],
  easeOutCirc: [0, 0.55, 0.45, 1],
  easeInOutCirc: [0.85, 0, 0.15, 1],
  easeInBack: [0.36, 0, 0.66, -0.56],
  easeOutBack: [0.34, 1.56, 0.64, 1],
  easeInOutBack: [0.68, -0.6, 0.32, 1.6],
};

// Built-in easings whose formula is identical to another built-in easing.
const builtInEasingAliases: { [string]: string } = {
  swingFrom: 'easeInBack',
  swingTo: 'easeOutBack',
  swingFromTo: 'easeInOutBack',
  easeFrom: 'easeInQuart',
  easeFromTo: 'easeInOutQuart',
};

export const builtInEasingApproximationPresets: Array<CubicBezierPreset> = Object.keys(
  builtInEasingApproximations
).map(name => ({
  name,
  points: builtInEasingApproximations[name],
}));

export const getBuiltInEasingApproximation = (
  name: string
): ?CubicBezierPoints => builtInEasingApproximations[name] || null;

/**
 * Control points the dialog starts from: CSS `ease` when the built-in easing has
 * no approximation. `easingIdentifier` is the unquoted parameter value, or null.
 */
export const getInitialCubicBezierPoints = (
  easingIdentifier: ?string
): CubicBezierPoints => {
  if (!easingIdentifier) return cssEasePoints;
  const customPoints = parseCubicBezierOrNull(easingIdentifier);
  if (customPoints) return customPoints;
  if (easingIdentifier === 'linear') return linearPoints;
  return (
    getBuiltInEasingApproximation(
      builtInEasingAliases[easingIdentifier] || easingIdentifier
    ) || cssEasePoints
  );
};
