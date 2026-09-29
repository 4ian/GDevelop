// @flow
import * as React from 'react';
import { t } from '@lingui/macro';
import { I18n } from '@lingui/react';
import { type I18n as I18nType } from '@lingui/core';
import GDevelopThemeContext from '../Theme/GDevelopThemeContext';
import { type CubicBezierPoints } from '../../Utils/Easings';
import { type MessageDescriptor } from '../../Utils/i18n/MessageDescriptor.flow';

export const curveEditorPadding = 16;
const curveEditorStep = 0.01;
const defaultYMin = -0.5;
const defaultYMax = 1.5;
// Extra range so a handle past the default window stays inside the graph.
const visibleYMargin = 0.1;

type Props = {|
  points: CubicBezierPoints,
  onChange: (points: CubicBezierPoints) => void,
  onRelease?: () => void,
  size?: number,
|};

type HandleIndex = 0 | 1;

type Handle = {|
  handleIndex: HandleIndex,
  // The curve end the handle is linked to: (0, 0) or (1, 1).
  anchor: number,
  color: string,
  label: MessageDescriptor,
|};

export const clampCurveX = (x: number): number => Math.min(1, Math.max(0, x));

const roundToCurveEditorStep = (value: number): number => {
  const rounded = Math.round(value / curveEditorStep) * curveEditorStep;
  return rounded === 0 ? 0 : Number(rounded.toFixed(2));
};

const getControlPoint = (
  points: CubicBezierPoints,
  handleIndex: HandleIndex
): [number, number] =>
  handleIndex === 0 ? [points[0], points[1]] : [points[2], points[3]];

/** Replace one control point. `x` is clamped to [0, 1]. */
const withControlPoint = (
  points: CubicBezierPoints,
  handleIndex: HandleIndex,
  x: number,
  y: number
): CubicBezierPoints => {
  const [x1, y1, x2, y2] = points;
  const clampedX = clampCurveX(x);
  return handleIndex === 0 ? [clampedX, y, x2, y2] : [x1, y1, clampedX, y];
};

export const getVisibleYRange = (
  points: CubicBezierPoints
): {| yMin: number, yMax: number |} => {
  let yMin = defaultYMin;
  let yMax = defaultYMax;
  [points[1], points[3]].forEach(y => {
    if (y < yMin) yMin = y - visibleYMargin;
    if (y > yMax) yMax = y + visibleYMargin;
  });
  return { yMin, yMax };
};

/**
 * Move one control point to a pointer position in SVG user space.
 * `skipRounding` is set when Alt is held.
 */
export const getPointsFromPointerPosition = ({
  points,
  handleIndex,
  svgX,
  svgY,
  size,
  yMin,
  yMax,
  skipRounding,
}: {|
  points: CubicBezierPoints,
  handleIndex: HandleIndex,
  svgX: number,
  svgY: number,
  size: number,
  yMin: number,
  yMax: number,
  skipRounding: boolean,
|}): CubicBezierPoints => {
  const drawable = size - 2 * curveEditorPadding;
  const rawX = (svgX - curveEditorPadding) / drawable;
  const rawY = yMax - ((svgY - curveEditorPadding) / drawable) * (yMax - yMin);
  const round = skipRounding ? value => value : roundToCurveEditorStep;
  return withControlPoint(points, handleIndex, round(rawX), round(rawY));
};

const moveControlPoint = (
  points: CubicBezierPoints,
  handleIndex: HandleIndex,
  key: string,
  shiftKey: boolean
): CubicBezierPoints => {
  const step = shiftKey ? 0.1 : curveEditorStep;
  let dx = 0;
  let dy = 0;
  if (key === 'ArrowLeft') dx = -step;
  else if (key === 'ArrowRight') dx = step;
  else if (key === 'ArrowUp') dy = step;
  else if (key === 'ArrowDown') dy = -step;
  else return points;

  const [x, y] = getControlPoint(points, handleIndex);
  return withControlPoint(
    points,
    handleIndex,
    roundToCurveEditorStep(x + dx),
    roundToCurveEditorStep(y + dy)
  );
};

const readSvgPoint = (
  svg: any,
  clientX: number,
  clientY: number
): ?{| x: number, y: number |} => {
  const matrix = svg.getScreenCTM();
  if (!matrix) return null;
  const point = svg.createSVGPoint();
  point.x = clientX;
  point.y = clientY;
  const svgPoint = point.matrixTransform(matrix.inverse());
  return { x: svgPoint.x, y: svgPoint.y };
};

const distanceSquared = (
  fromX: number,
  fromY: number,
  toX: number,
  toY: number
): number => (fromX - toX) * (fromX - toX) + (fromY - toY) * (fromY - toY);

const CubicBezierCurveEditor = ({
  points,
  onChange,
  onRelease,
  size = 240,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const svgRef = React.useRef<any>(null);
  const dragHandleRef = React.useRef<?HandleIndex>(null);
  const [lockedYRange, setLockedYRange] = React.useState<?{|
    yMin: number,
    yMax: number,
  |}>(null);
  const [
    focusedHandleIndex,
    setFocusedHandleIndex,
  ] = React.useState<?HandleIndex>(null);

  const yRange = lockedYRange || getVisibleYRange(points);
  const { yMin, yMax } = yRange;
  const drawable = size - 2 * curveEditorPadding;
  const toSvgX = (x: number): number => curveEditorPadding + x * drawable;
  const toSvgY = (y: number): number =>
    curveEditorPadding + ((yMax - y) / (yMax - yMin)) * drawable;
  const boxLeft = toSvgX(0);
  const boxRight = toSvgX(1);
  const boxTop = toSvgY(1);
  const boxBottom = toSvgY(0);

  const [x1, y1, x2, y2] = points;
  const guideColor = gdevelopTheme.text.color.disabled;
  const handles: Array<Handle> = [
    {
      handleIndex: 0,
      anchor: 0,
      color: gdevelopTheme.palette.primary,
      label: t`Control point 1`,
    },
    {
      handleIndex: 1,
      anchor: 1,
      color: gdevelopTheme.palette.secondary,
      label: t`Control point 2`,
    },
  ];

  const applyPointer = (
    handleIndex: HandleIndex,
    event: SyntheticPointerEvent<>
  ) => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgPoint = readSvgPoint(svg, event.clientX, event.clientY);
    if (!svgPoint) return;
    onChange(
      getPointsFromPointerPosition({
        points,
        handleIndex,
        svgX: svgPoint.x,
        svgY: svgPoint.y,
        size,
        yMin,
        yMax,
        skipRounding: event.altKey,
      })
    );
  };

  const startDrag = (
    handleIndex: HandleIndex,
    event: SyntheticPointerEvent<>
  ) => {
    const svg = svgRef.current;
    if (svg) svg.setPointerCapture(event.pointerId);
    dragHandleRef.current = handleIndex;
    setLockedYRange(getVisibleYRange(points));
    setFocusedHandleIndex(handleIndex);
  };

  const endDrag = () => {
    if (dragHandleRef.current === null) return;
    dragHandleRef.current = null;
    setLockedYRange(null);
    if (onRelease) onRelease();
  };

  const onPointerMove = (event: SyntheticPointerEvent<>) => {
    const handleIndex = dragHandleRef.current;
    if (handleIndex !== 0 && handleIndex !== 1) return;
    applyPointer(handleIndex, event);
  };

  const onBackgroundPointerDown = (event: SyntheticPointerEvent<>) => {
    const svg = svgRef.current;
    if (!svg) return;
    const svgPoint = readSvgPoint(svg, event.clientX, event.clientY);
    if (!svgPoint) return;
    const distanceToHandle = (handleIndex: HandleIndex): number => {
      const [x, y] = getControlPoint(points, handleIndex);
      return distanceSquared(svgPoint.x, svgPoint.y, toSvgX(x), toSvgY(y));
    };
    const handleIndex = distanceToHandle(0) <= distanceToHandle(1) ? 0 : 1;
    startDrag(handleIndex, event);
    applyPointer(handleIndex, event);
  };

  const onHandleKeyDown = (
    handleIndex: HandleIndex,
    event: SyntheticKeyboardEvent<>
  ) => {
    const nextPoints = moveControlPoint(
      points,
      handleIndex,
      event.key,
      event.shiftKey
    );
    if (nextPoints === points) return;
    event.preventDefault();
    onChange(nextPoints);
  };

  const renderHandleLine = ({ handleIndex, anchor, color }: Handle) => {
    const [x, y] = getControlPoint(points, handleIndex);
    return (
      <line
        key={handleIndex}
        x1={toSvgX(anchor)}
        y1={toSvgY(anchor)}
        x2={toSvgX(x)}
        y2={toSvgY(y)}
        stroke={color}
        pointerEvents="none"
      />
    );
  };

  const renderHandle = (
    { handleIndex, color, label }: Handle,
    i18n: I18nType
  ): React.Node => {
    const [x, y] = getControlPoint(points, handleIndex);
    const focused = focusedHandleIndex === handleIndex;
    return (
      <g
        key={handleIndex}
        transform={`translate(${toSvgX(x)} ${toSvgY(y)})`}
        tabIndex={0}
        role="slider"
        aria-label={i18n._(label)}
        aria-valuemin={0}
        aria-valuemax={1}
        aria-valuenow={x}
        aria-valuetext={`${x}, ${y}`}
        onPointerDown={event => {
          event.stopPropagation();
          event.currentTarget.focus();
          startDrag(handleIndex, event);
        }}
        onKeyDown={event => onHandleKeyDown(handleIndex, event)}
        onFocus={() => setFocusedHandleIndex(handleIndex)}
        onBlur={() =>
          setFocusedHandleIndex(current =>
            current === handleIndex ? null : current
          )
        }
        style={{ cursor: 'pointer', outline: 'none' }}
      >
        {focused ? (
          <circle r={12} fill="none" stroke={color} strokeWidth={2} />
        ) : null}
        <circle r={8} fill={color} />
      </g>
    );
  };

  return (
    <I18n>
      {({ i18n }) => (
        <svg
          ref={svgRef}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          role="group"
          aria-label={i18n._(t`Easing curve`)}
          style={{ touchAction: 'none', display: 'block', overflow: 'visible' }}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          <rect
            x={0}
            y={0}
            width={size}
            height={size}
            fill="transparent"
            style={{ cursor: 'crosshair' }}
            onPointerDown={onBackgroundPointerDown}
          />
          {([
            [boxLeft, boxTop, boxRight, boxTop],
            [boxLeft, boxBottom, boxRight, boxBottom],
            [boxLeft, boxTop, boxLeft, boxBottom],
            [boxRight, boxTop, boxRight, boxBottom],
          ]: Array<[number, number, number, number]>).map(
            ([x1, y1, x2, y2], index) => (
              <line
                key={index}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={guideColor}
                strokeDasharray="4 4"
                strokeLinecap="butt"
                pointerEvents="none"
              />
            )
          )}
          {handles.map(renderHandleLine)}
          <path
            d={`M ${toSvgX(0)} ${toSvgY(0)} C ${toSvgX(x1)} ${toSvgY(
              y1
            )}, ${toSvgX(x2)} ${toSvgY(y2)}, ${toSvgX(1)} ${toSvgY(1)}`}
            fill="none"
            stroke={gdevelopTheme.palette.secondary}
            strokeWidth={2}
            pointerEvents="none"
          />
          {handles.map(handle => renderHandle(handle, i18n))}
        </svg>
      )}
    </I18n>
  );
};

export default CubicBezierCurveEditor;
