// @flow
import * as React from 'react';
import GDevelopThemeContext from './Theme/GDevelopThemeContext';
import { getEasingFunction } from '../Utils/Easings';

type Props = {|
  /** The name of the easing, as used by the Tween extension (e.g. "easeInOutQuad"). */
  easingName: string,
  width?: number,
  height?: number,
  style?: Object,
|};

const SAMPLES_COUNT = 60;

/**
 * Compute the SVG paths (curve and 0/1 guide lines) for an easing function,
 * in a box of the given size. The vertical range always includes 0 and 1, and is
 * extended for easings that overshoot (back, elastic, bounce...).
 */
export const getEasingPreviewPaths = (
  easingName: string,
  width: number,
  height: number,
  padding: number
): ?{| curvePath: string, startGuideY: number, endGuideY: number |} => {
  const easingFunction = getEasingFunction(easingName);
  if (!easingFunction) return null;

  const points = [];
  let minValue = 0;
  let maxValue = 1;
  for (let i = 0; i <= SAMPLES_COUNT; i++) {
    const pos = i / SAMPLES_COUNT;
    const value = easingFunction(pos);
    if (!Number.isFinite(value)) continue;
    points.push([pos, value]);
    minValue = Math.min(minValue, value);
    maxValue = Math.max(maxValue, value);
  }

  const drawableWidth = width - 2 * padding;
  const drawableHeight = height - 2 * padding;
  const valueRange = maxValue - minValue || 1;
  const toX = (pos: number) => padding + pos * drawableWidth;
  const toY = (value: number) =>
    padding +
    drawableHeight -
    ((value - minValue) / valueRange) * drawableHeight;

  const curvePath = points
    .map(
      ([pos, value], index) =>
        `${index === 0 ? 'M' : 'L'}${toX(pos).toFixed(2)} ${toY(value).toFixed(
          2
        )}`
    )
    .join(' ');

  return {
    curvePath,
    startGuideY: toY(0),
    endGuideY: toY(1),
  };
};

/**
 * A small graph showing the shape of an easing function (value over time).
 */
const EasingPreview = ({
  easingName,
  width = 40,
  height = 28,
  style,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const paths = React.useMemo(
    () => getEasingPreviewPaths(easingName, width, height, 2),
    [easingName, width, height]
  );
  if (!paths) return null;

  return (
    <svg
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={style}
      aria-label={easingName}
      role="img"
    >
      <line
        x1={0}
        x2={width}
        y1={paths.startGuideY}
        y2={paths.startGuideY}
        stroke={gdevelopTheme.text.color.disabled}
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <line
        x1={0}
        x2={width}
        y1={paths.endGuideY}
        y2={paths.endGuideY}
        stroke={gdevelopTheme.text.color.disabled}
        strokeWidth={1}
        strokeDasharray="2 2"
      />
      <path
        d={paths.curvePath}
        fill="none"
        stroke={gdevelopTheme.palette.secondary}
        strokeWidth={1.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

export default EasingPreview;
