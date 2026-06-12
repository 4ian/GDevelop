// @flow
import * as React from 'react';
import { t, Trans } from '@lingui/macro';
import Tooltip from '@material-ui/core/Tooltip';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import Checkbox from '@material-ui/core/Checkbox';
import SkipPrevious from '@material-ui/icons/SkipPrevious';
import FastRewind from '@material-ui/icons/FastRewind';
import PlayArrow from '@material-ui/icons/PlayArrow';
import Pause from '@material-ui/icons/Pause';
import FastForward from '@material-ui/icons/FastForward';
import SkipNext from '@material-ui/icons/SkipNext';
import Add from '@material-ui/icons/Add';
import Delete from '@material-ui/icons/Delete';
import TimelineIcon from '@material-ui/icons/Timeline';
import ShowChart from '@material-ui/icons/ShowChart';
import Grain from '@material-ui/icons/Grain';
import PlaylistAdd from '@material-ui/icons/PlaylistAdd';
import PlaylistAddCheck from '@material-ui/icons/PlaylistAddCheck';
import TextField from '../UI/TextField';
import SelectField from '../UI/SelectField';
import SelectOption from '../UI/SelectOption';
import GDevelopThemeContext from '../UI/Theme/GDevelopThemeContext';
import { type UnsavedChanges } from '../MainFrame/UnsavedChangesContext';
import {
  createDefaultTimeline,
  getTimelines,
  getTimelineByIdOrName,
  makeTimelineName,
  upsertTimeline,
  type TimelineData,
  type TimelineTrack,
  type TimelinePropertyTrack,
  type TimelineKeyframe,
  type TimelineCurveDefinition,
} from './TimelineProjectStorage';

const gd: libGDevelop = global.gd;

type Props = {|
  project: gdProject,
  timelineIdOrName: ?string,
  setToolbar: (?React.Node) => void,
  unsavedChanges: ?UnsavedChanges,
  objectsContainer?: ?gdObjectsContainer,
  globalObjectsContainer?: ?gdObjectsContainer,
  initialInstances?: ?gdInitialInstancesContainer,
  selectedInstances?: Array<gdInitialInstance>,
  onGetInstanceSize?: gdInitialInstance => [number, number, number],
  onInstancesModified?: (Array<gdInitialInstance>) => void,
  onPreviewInstancesModified?: (Array<gdInitialInstance>) => void,
|};

type InitialInstancesIndex = {|
  byObjectName: Map<string, Array<gdInitialInstance>>,
  byPersistentUuid: Map<string, gdInitialInstance>,
|};

type TimelineScaleBaseDimensions = {|
  width: number,
  height: number,
|};

type TimelineKeyframeClipboard = {|
  items: Array<{|
    propertyTrackId: string,
    property: string,
    timeOffset: number,
    value: number | {| x: number, y: number |},
    ease?: any,
    curve?: TimelineCurveDefinition,
  |}>,
|};

const leftPanelWidth = 220;
const rightPanelWidth = 220;
const rulerHeight = 64;
const rowHeight = 58;
const frameRate = 60;
const timelinePlaybackStateSyncIntervalMs = 100;
const minTimelineZoom = 1;
const maxTimelineZoom = 24;
const timelineEdgeHitPadding = 24;
const fallbackTimelineScaleBaseSize = 256;
const minimumTimelineScale = 0.0001;
const minimumTimelineDimension = 0.0001;

const commonTimelineProperties: Array<string> = [
  'x',
  'y',
  'angle',
  'scaleX',
  'scaleY',
];
const spriteTimelineProperties: Array<string> = [
  ...commonTimelineProperties,
  'opacity',
  'width',
  'height',
  'animationIndex',
  'animationFrame',
  'animationSpeedScale',
];
const textTimelineProperties: Array<string> = [
  ...commonTimelineProperties,
  'opacity',
  'width',
  'height',
  'characterSize',
  'lineHeight',
];
const videoTimelineProperties: Array<string> = [
  ...commonTimelineProperties,
  'opacity',
  'width',
  'height',
  'volume',
  'playbackSpeed',
  'currentTime',
];

const discreteTimelineProperties = new Set<string>([
  'animation',
  'animationindex',
  'animationname',
]);

const getFiniteNumber = (value: any, fallback: number): number =>
  typeof value === 'number' && Number.isFinite(value) ? value : fallback;

const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, getFiniteNumber(value, min)));

const clamp01 = (value: number): number => clamp(value, 0, 1);

const isDiscreteTimelineProperty = (property: string): boolean =>
  discreteTimelineProperties.has(property.toLowerCase());

const isTextInputElement = (target: any): boolean => {
  if (!target) return false;
  const tagName = target.tagName ? target.tagName.toLowerCase() : '';
  return (
    tagName === 'input' ||
    tagName === 'textarea' ||
    tagName === 'select' ||
    !!target.isContentEditable
  );
};

const cubicBezierCoordinate = (p1: number, p2: number, t: number): number => {
  const u = 1 - t;
  return 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t;
};

const cubicBezierDerivative = (p1: number, p2: number, t: number): number => {
  const u = 1 - t;
  return 3 * u * u * p1 + 6 * u * t * (p2 - p1) + 3 * t * t * (1 - p2);
};

const solveCubicBezierT = (x1: number, x2: number, x: number): number => {
  let t = x;
  for (let index = 0; index < 8; index++) {
    const currentX = cubicBezierCoordinate(x1, x2, t) - x;
    const derivative = cubicBezierDerivative(x1, x2, t);
    if (Math.abs(currentX) < 1e-6) return t;
    if (Math.abs(derivative) < 1e-6) break;
    t -= currentX / derivative;
  }

  let min = 0;
  let max = 1;
  t = x;
  for (let index = 0; index < 10; index++) {
    const currentX = cubicBezierCoordinate(x1, x2, t);
    if (Math.abs(currentX - x) < 1e-6) return t;
    if (currentX < x) {
      min = t;
    } else {
      max = t;
    }
    t = (min + max) / 2;
  }
  return t;
};

const evaluateCubicBezier = (
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  progress: number
): number => {
  const bezierT = solveCubicBezierT(clamp01(x1), clamp01(x2), progress);
  return clamp01(cubicBezierCoordinate(y1, y2, bezierT));
};

const getKeyframeCurve = (
  keyframe: TimelineKeyframe
): TimelineCurveDefinition | null =>
  keyframe.curve !== undefined && keyframe.curve !== null
    ? keyframe.curve
    : keyframe.ease !== undefined && keyframe.ease !== null
    ? keyframe.ease
    : null;

const evaluateTimelineCurve = (
  curve: TimelineCurveDefinition | null,
  progress: number
): number => {
  const t = clamp01(progress);
  if (!curve) return t;

  if (typeof curve === 'string') {
    switch (curve) {
      case 'hold':
      case 'step':
      case 'stepped':
        return 0;
      case 'easeIn':
      case 'easeInQuad':
        return t * t;
      case 'easeOut':
      case 'easeOutQuad':
        return 1 - Math.pow(1 - t, 2);
      case 'easeInOut':
      case 'easeInOutQuad':
        return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
      case 'easeInCubic':
        return t * t * t;
      case 'easeOutCubic':
        return 1 - Math.pow(1 - t, 3);
      case 'easeInOutCubic':
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
      default:
        return t;
    }
  }

  if (Array.isArray(curve)) {
    if (curve.length < 4) return t;
    return evaluateCubicBezier(
      getFiniteNumber(curve[0], 0),
      getFiniteNumber(curve[1], 0),
      getFiniteNumber(curve[2], 1),
      getFiniteNumber(curve[3], 1),
      t
    );
  }

  if (typeof curve === 'object') {
    if (curve.type === 'preset') {
      return evaluateTimelineCurve(curve.name, t);
    }
    if (curve.type === 'steps') {
      const steps = Math.max(1, Math.floor(getFiniteNumber(curve.steps, 1)));
      return curve.position === 'start'
        ? Math.min(1, Math.ceil(t * steps) / steps)
        : Math.floor(t * steps) / steps;
    }
    if (curve.type === 'cubicBezier') {
      return evaluateCubicBezier(
        getFiniteNumber(curve.x1, 0),
        getFiniteNumber(curve.y1, 0),
        getFiniteNumber(curve.x2, 1),
        getFiniteNumber(curve.y2, 1),
        t
      );
    }
  }

  return t;
};

const getCurvePresetId = (curve: TimelineCurveDefinition | null): ?string => {
  if (!curve) return 'linear';

  if (typeof curve === 'string') {
    switch (curve) {
      case 'hold':
      case 'step':
      case 'stepped':
        return 'hold';
      case 'easeIn':
      case 'easeInQuad':
        return 'easeIn';
      case 'easeOut':
      case 'easeOutQuad':
        return 'easeOut';
      case 'easeInOut':
      case 'easeInOutQuad':
        return 'easeInOut';
      case 'linear':
        return 'linear';
      default:
        return null;
    }
  }

  if (Array.isArray(curve)) {
    if (curve.length < 4) return 'linear';
    const [x1, y1, x2, y2] = curve.map(value => getFiniteNumber(value, 0));
    if (x1 === 0.42 && y1 === 0 && x2 === 1 && y2 === 1) return 'easeIn';
    if (x1 === 0 && y1 === 0 && x2 === 0.58 && y2 === 1) return 'easeOut';
    if (x1 === 0.42 && y1 === 0 && x2 === 0.58 && y2 === 1) return 'easeInOut';
    if (x1 === 0 && y1 === 0 && x2 === 1 && y2 === 1) return 'linear';
    return null;
  }

  if (typeof curve === 'object') {
    if (curve.type === 'preset') return getCurvePresetId(curve.name);
    if (curve.type === 'steps') return 'hold';
    if (curve.type === 'cubicBezier') {
      return getCurvePresetId([curve.x1, curve.y1, curve.x2, curve.y2]);
    }
  }

  return null;
};

const getCurveModeId = (curve: TimelineCurveDefinition | null): ?string => {
  const presetId = getCurvePresetId(curve);
  if (presetId === 'hold') return 'stepped';
  if (presetId === 'linear') return 'linear';
  if (presetId) return 'bezier';
  if (Array.isArray(curve)) return 'bezier';
  if (curve && typeof curve === 'object') {
    if (curve.type === 'steps') return 'stepped';
    if (curve.type === 'cubicBezier') return 'bezier';
  }
  return null;
};

const getCurveGraphPath = (curve: TimelineCurveDefinition | null): string => {
  if (getCurveModeId(curve) === 'stepped') {
    return 'M8 82 H92 V18';
  }

  const points = [];
  for (let index = 0; index <= 32; index++) {
    const progress = index / 32;
    const easedProgress = evaluateTimelineCurve(curve, progress);
    points.push({
      x: 8 + progress * 84,
      y: 82 - easedProgress * 64,
    });
  }

  return points
    .map(
      (point, index) =>
        `${index === 0 ? 'M' : 'L'}${point.x.toFixed(2)} ${point.y.toFixed(2)}`
    )
    .join(' ');
};

const getKeyframeValueAtTime = (
  propertyTrack: TimelinePropertyTrack,
  time: number
): number | {| x: number, y: number |} => {
  const firstKeyframe = propertyTrack.keyframes[0];
  if (!firstKeyframe || timeToFrame(time) === 0) {
    return getPropertyTrackInitialValue(propertyTrack);
  }

  const nearestKeyframe = propertyTrack.keyframes.reduce(
    (nearest, keyframe) =>
      Math.abs(keyframe.time - time) < Math.abs(nearest.time - time)
        ? keyframe
        : nearest,
    firstKeyframe
  );
  return nearestKeyframe.value;
};

const createKeyframeId = (): string =>
  `keyframe-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const createTimelineId = (): string =>
  `timeline-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const createTrackId = (): string =>
  `track-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const createPropertyTrackId = (): string =>
  `property-track-${Date.now().toString(36)}-${Math.random()
    .toString(36)
    .slice(2, 8)}`;

const cloneTimelineValue = (
  value: number | {| x: number, y: number |}
): number | {| x: number, y: number |} =>
  typeof value === 'object' ? { x: value.x, y: value.y } : value;

const getDefaultTimelinePropertyValue = (
  property: string
): number | {| x: number, y: number |} => {
  switch (property) {
    case 'position':
      return { x: 0, y: 0 };
    case 'scale':
      return { x: 1, y: 1 };
    case 'scaleX':
    case 'scaleY':
      return 1;
    case 'opacity':
      return 255;
    case 'width':
    case 'height':
      return fallbackTimelineScaleBaseSize;
    case 'animationSpeedScale':
    case 'playbackSpeed':
    case 'lineHeight':
      return 1;
    case 'characterSize':
      return 20;
    case 'volume':
      return 100;
    default:
      return 0;
  }
};

const normalizeTimelineValueForProperty = (
  property: string,
  value: any,
  fallbackValue?: number | {| x: number, y: number |}
): number | {| x: number, y: number |} => {
  const fallback =
    fallbackValue !== undefined
      ? fallbackValue
      : getDefaultTimelinePropertyValue(property);

  switch (property) {
    case 'position': {
      const fallbackPosition =
        typeof fallback === 'object' ? fallback : { x: 0, y: 0 };
      return value && typeof value === 'object'
        ? {
            x: getFiniteNumber(value.x, fallbackPosition.x),
            y: getFiniteNumber(value.y, fallbackPosition.y),
          }
        : fallbackPosition;
    }
    case 'scale': {
      const fallbackScale =
        typeof fallback === 'object' ? fallback : { x: 1, y: 1 };
      if (!value || typeof value !== 'object') {
        return {
          x: Math.max(minimumTimelineScale, fallbackScale.x),
          y: Math.max(minimumTimelineScale, fallbackScale.y),
        };
      }

      const rawScaleX = getFiniteNumber(value.x, fallbackScale.x);
      const rawScaleY = getFiniteNumber(value.y, fallbackScale.y);
      return {
        x: Math.max(
          minimumTimelineScale,
          rawScaleX > 0 ? rawScaleX : fallbackScale.x
        ),
        y: Math.max(
          minimumTimelineScale,
          rawScaleY > 0 ? rawScaleY : fallbackScale.y
        ),
      };
    }
    case 'scaleX':
    case 'scaleY':
      return Math.max(
        minimumTimelineScale,
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 1)
      );
    case 'opacity':
      return clamp(
        typeof value === 'number'
          ? value
          : typeof fallback === 'number'
          ? fallback
          : 255,
        0,
        255
      );
    case 'width':
    case 'height': {
      const fallbackDimension =
        typeof fallback === 'number' ? fallback : fallbackTimelineScaleBaseSize;
      const dimension = getFiniteNumber(value, fallbackDimension);
      return Math.max(
        minimumTimelineDimension,
        dimension > 0 ? dimension : fallbackDimension
      );
    }
    case 'animationIndex':
    case 'animationFrame':
      return Math.max(
        0,
        Math.round(
          getFiniteNumber(value, typeof fallback === 'number' ? fallback : 0)
        )
      );
    case 'animationSpeedScale':
    case 'lineHeight':
      return Math.max(
        minimumTimelineScale,
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 1)
      );
    case 'characterSize':
      return Math.max(
        1,
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 20)
      );
    case 'volume':
      return clamp(
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 100),
        0,
        100
      );
    case 'playbackSpeed':
      return clamp(
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 1),
        0.5,
        2
      );
    case 'currentTime':
      return Math.max(
        0,
        getFiniteNumber(value, typeof fallback === 'number' ? fallback : 0)
      );
    case 'angle':
    default:
      return getFiniteNumber(
        value,
        typeof fallback === 'number' ? fallback : 0
      );
  }
};

const normalizeTimelineScaleAxisValue = (
  property: 'scaleX' | 'scaleY',
  value: number,
  fallbackValue: number = 1
): number => {
  const normalizedValue = normalizeTimelineValueForProperty(
    property,
    value,
    fallbackValue
  );
  return typeof normalizedValue === 'number'
    ? normalizedValue
    : Math.max(minimumTimelineScale, fallbackValue);
};

const createPropertyTrack = (
  property: string,
  value: number | {| x: number, y: number |}
): TimelinePropertyTrack => {
  const isDiscrete = isDiscreteTimelineProperty(property);
  const normalizedValue = normalizeTimelineValueForProperty(property, value);
  return {
    id: createPropertyTrackId(),
    property,
    interpolationMode: isDiscrete ? 'step' : 'continuous',
    initialValue: cloneTimelineValue(normalizedValue),
    initialEase: isDiscrete ? 'hold' : 'linear',
    initialCurve: isDiscrete ? 'stepped' : 'linear',
    keyframes: [],
  };
};

const getTimelineFrameCount = (timeline: TimelineData): number =>
  Math.max(1, Math.ceil(timeline.duration * frameRate));

const timeToFrame = (time: number): number => Math.round(time * frameRate);

const frameToTime = (frame: number, timeline: TimelineData): number =>
  clamp(frame / frameRate, 0, timeline.duration);

const getFrameLeftCss = (
  frame: number,
  viewStartFrame: number,
  visibleFrames: number
): string => {
  const ratio = (frame - viewStartFrame) / Math.max(1, visibleFrames);
  return `calc(${ratio * 100}% + ${timelineEdgeHitPadding -
    ratio * timelineEdgeHitPadding * 2}px)`;
};

const getFrameStyle = (
  frame: number,
  viewStartFrame: number,
  visibleFrames: number
) => ({
  left: getFrameLeftCss(frame, viewStartFrame, visibleFrames),
});

const getTimelineValueChannelValue = (
  value: number | {| x: number, y: number |},
  channel: 'x' | 'y' | 'value'
): number => {
  if (typeof value === 'object') {
    return channel === 'y' ? value.y : value.x;
  }
  return value;
};

const getTimelineValueChannels = (
  value: number | {| x: number, y: number |}
): Array<{| channel: 'x' | 'y' | 'value', color: string |}> =>
  typeof value === 'object'
    ? [{ channel: 'x', color: '#18A8FF' }, { channel: 'y', color: '#04D4F4' }]
    : [{ channel: 'value', color: '#18A8FF' }];

const getKeyframeFrameKey = (time: number): string =>
  String(Math.round(time * frameRate));

const getKeyframeMergeKey = (keyframe: TimelineKeyframe): string =>
  getKeyframeFrameKey(keyframe.time);

const snapTimeToTimelineFrame = (time: number): number =>
  Math.round(time * frameRate) / frameRate;

const getRenderableTimelineKeyframes = (
  propertyTrack: TimelinePropertyTrack
): Array<TimelineKeyframe> => {
  const keyframes = propertyTrack.keyframes || [];
  if (!keyframes.length) return [];

  const keyframeByFrame = new Map<string, TimelineKeyframe>();
  for (const keyframe of keyframes) {
    const snappedTime = snapTimeToTimelineFrame(keyframe.time);
    const normalizedValue = normalizeTimelineValueForProperty(
      propertyTrack.property,
      keyframe.value
    );
    keyframeByFrame.set(getKeyframeFrameKey(snappedTime), {
      ...keyframe,
      time: snappedTime,
      value: normalizedValue,
    });
  }

  return Array.from(keyframeByFrame.values()).sort((a, b) => a.time - b.time);
};

const getInitialKeyframeId = (propertyTrack: TimelinePropertyTrack): string =>
  `${propertyTrack.id}-initial`;

const getPropertyTrackInitialValue = (
  propertyTrack: TimelinePropertyTrack
): number | {| x: number, y: number |} => {
  if (
    propertyTrack.initialValue !== undefined &&
    propertyTrack.initialValue !== null
  ) {
    return normalizeTimelineValueForProperty(
      propertyTrack.property,
      propertyTrack.initialValue
    );
  }

  const keyframeAtStart = (propertyTrack.keyframes || []).find(
    keyframe =>
      getKeyframeFrameKey(snapTimeToTimelineFrame(keyframe.time)) === '0'
  );
  if (keyframeAtStart) {
    return normalizeTimelineValueForProperty(
      propertyTrack.property,
      keyframeAtStart.value
    );
  }

  return getDefaultTimelinePropertyValue(propertyTrack.property);
};

const createImplicitInitialKeyframe = (
  propertyTrack: TimelinePropertyTrack
): TimelineKeyframe => ({
  id: getInitialKeyframeId(propertyTrack),
  time: 0,
  value: getPropertyTrackInitialValue(propertyTrack),
  ease:
    propertyTrack.initialEase !== undefined
      ? propertyTrack.initialEase
      : isDiscreteTimelineProperty(propertyTrack.property)
      ? 'hold'
      : 'linear',
  curve:
    propertyTrack.initialCurve !== undefined
      ? propertyTrack.initialCurve
      : isDiscreteTimelineProperty(propertyTrack.property)
      ? 'stepped'
      : 'linear',
});

const getSamplingTimelineKeyframes = (
  propertyTrack: TimelinePropertyTrack
): Array<TimelineKeyframe> => {
  const keyframes = getRenderableTimelineKeyframes(propertyTrack);
  if (keyframes.length && getKeyframeFrameKey(keyframes[0].time) === '0') {
    return keyframes;
  }

  return [createImplicitInitialKeyframe(propertyTrack), ...keyframes];
};

const updatePropertyTrackInitialKeyframe = (
  propertyTrack: TimelinePropertyTrack,
  keyframe: TimelineKeyframe
): TimelinePropertyTrack => ({
  ...propertyTrack,
  initialValue: cloneTimelineValue(
    normalizeTimelineValueForProperty(propertyTrack.property, keyframe.value)
  ),
  initialEase:
    keyframe.ease !== undefined ? keyframe.ease : propertyTrack.initialEase,
  initialCurve:
    keyframe.curve !== undefined ? keyframe.curve : propertyTrack.initialCurve,
  keyframes: (propertyTrack.keyframes || []).filter(
    existingKeyframe => timeToFrame(existingKeyframe.time) !== 0
  ),
});

const upsertPropertyTrackKeyframe = (
  propertyTrack: TimelinePropertyTrack,
  keyframe: TimelineKeyframe
): {| propertyTrack: TimelinePropertyTrack, keyframeId: string |} => {
  const snappedTime = snapTimeToTimelineFrame(keyframe.time);
  const normalizedKeyframe = {
    ...keyframe,
    time: snappedTime,
    value: normalizeTimelineValueForProperty(
      propertyTrack.property,
      keyframe.value
    ),
  };

  if (timeToFrame(snappedTime) === 0) {
    return {
      propertyTrack: updatePropertyTrackInitialKeyframe(
        propertyTrack,
        normalizedKeyframe
      ),
      keyframeId: getInitialKeyframeId(propertyTrack),
    };
  }

  const existingKeyframe = (propertyTrack.keyframes || []).find(
    existingKeyframe =>
      timeToFrame(existingKeyframe.time) === timeToFrame(snappedTime)
  );
  const keyframeId = existingKeyframe ? existingKeyframe.id : keyframe.id;
  const nextKeyframe = existingKeyframe
    ? {
        ...existingKeyframe,
        time: normalizedKeyframe.time,
        value: normalizedKeyframe.value,
        ease:
          normalizedKeyframe.ease !== undefined
            ? normalizedKeyframe.ease
            : existingKeyframe.ease,
        curve:
          normalizedKeyframe.curve !== undefined
            ? normalizedKeyframe.curve
            : existingKeyframe.curve,
      }
    : normalizedKeyframe;

  return {
    propertyTrack: {
      ...propertyTrack,
      keyframes: (existingKeyframe
        ? propertyTrack.keyframes.map(existing =>
            existing.id === existingKeyframe.id ? nextKeyframe : existing
          )
        : [...propertyTrack.keyframes, nextKeyframe]
      ).sort((a, b) => a.time - b.time),
    },
    keyframeId,
  };
};

const getTimelineValueChannelYFromRange = (
  range: {| min: number, max: number, range: number |},
  value: number | {| x: number, y: number |},
  channel: 'x' | 'y' | 'value'
): number => {
  const channelValue = getTimelineValueChannelValue(value, channel);
  return 86 - ((channelValue - range.min) / range.range) * 72;
};

const getPropertyTrackChannelRange = (
  propertyTrack: TimelinePropertyTrack,
  channel: 'x' | 'y' | 'value'
): {| min: number, max: number, range: number |} => {
  const keyframes = getSamplingTimelineKeyframes(propertyTrack);
  if (!keyframes.length) return { min: 0, max: 1, range: 1 };

  const values = keyframes.map(keyframe =>
    getTimelineValueChannelValue(keyframe.value, channel)
  );
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const valuePadding = Math.max(1, (maxValue - minValue) * 0.18);
  const min = minValue - valuePadding;
  const max = maxValue + valuePadding;
  return { min, max, range: Math.max(1, max - min) };
};

const getTimelineGraphFrameX = (
  frame: number,
  viewStartFrame: number,
  visibleFrames: number
): number => ((frame - viewStartFrame) / Math.max(1, visibleFrames)) * 100;

const getTimelineGraphPoint = (
  propertyTrack: TimelinePropertyTrack,
  keyframe: TimelineKeyframe,
  channel: 'x' | 'y' | 'value',
  graphRange: {| min: number, max: number, range: number |},
  viewStartFrame: number,
  visibleFrames: number
): {| x: number, y: number |} => ({
  x: getTimelineGraphFrameX(
    keyframe.time * frameRate,
    viewStartFrame,
    visibleFrames
  ),
  y: getTimelineValueChannelYFromRange(graphRange, keyframe.value, channel),
});

const buildPropertyTrackGraphPaths = (
  propertyTrack: TimelinePropertyTrack,
  viewStartFrame: number,
  visibleFrames: number
): Array<{| channel: string, color: string, path: string |}> => {
  const keyframes = getSamplingTimelineKeyframes(propertyTrack);
  if (keyframes.length < 2) return [];

  const channels = getTimelineValueChannels(keyframes[0].value);
  return channels
    .map(({ channel, color }) => {
      const graphRange = getPropertyTrackChannelRange(propertyTrack, channel);
      const commands = [];

      for (let index = 0; index < keyframes.length; index++) {
        const keyframe = keyframes[index];
        const frame = keyframe.time * frameRate;
        const previousFrame =
          index > 0 ? keyframes[index - 1].time * frameRate : frame;
        const nextFrame =
          index < keyframes.length - 1
            ? keyframes[index + 1].time * frameRate
            : frame;
        if (
          frame < viewStartFrame &&
          nextFrame < viewStartFrame &&
          previousFrame < viewStartFrame
        ) {
          continue;
        }
        if (
          frame > viewStartFrame + visibleFrames &&
          nextFrame > viewStartFrame + visibleFrames &&
          previousFrame > viewStartFrame + visibleFrames
        ) {
          continue;
        }

        const point = getTimelineGraphPoint(
          propertyTrack,
          keyframe,
          channel,
          graphRange,
          viewStartFrame,
          visibleFrames
        );
        commands.push(
          `${commands.length ? 'L' : 'M'}${point.x.toFixed(
            2
          )} ${point.y.toFixed(2)}`
        );
      }

      return commands.length
        ? { channel, color, path: commands.join(' ') }
        : null;
    })
    .filter(Boolean);
};

const getTimelineValueChannelY = (
  propertyTrack: TimelinePropertyTrack,
  value: number | {| x: number, y: number |},
  channel: 'x' | 'y' | 'value'
): number => {
  const range = getPropertyTrackChannelRange(propertyTrack, channel);
  return getTimelineValueChannelYFromRange(range, value, channel);
};

const getNearestTimelineValueChannel = (
  propertyTrack: TimelinePropertyTrack,
  keyframe: TimelineKeyframe,
  clientY: number,
  element: HTMLDivElement
): 'x' | 'y' | 'value' => {
  if (typeof keyframe.value !== 'object') return 'value';

  const rect = element.getBoundingClientRect();
  const pointerY = ((clientY - rect.top) / Math.max(1, rect.height)) * 100;
  const channels = getTimelineValueChannels(keyframe.value);
  const nearest = channels.reduce((bestChannel, channel) => {
    const bestDistance = Math.abs(
      getTimelineValueChannelY(
        propertyTrack,
        keyframe.value,
        bestChannel.channel
      ) - pointerY
    );
    const distance = Math.abs(
      getTimelineValueChannelY(propertyTrack, keyframe.value, channel.channel) -
        pointerY
    );
    return distance < bestDistance ? channel : bestChannel;
  }, channels[0]);
  return nearest.channel;
};

const normalizeDraggedTimelineValue = (
  property: string,
  value: number | {| x: number, y: number |}
): number | {| x: number, y: number |} => {
  if (typeof value === 'object') {
    if (property === 'scale') {
      return {
        x: Math.max(minimumTimelineScale, getFiniteNumber(value.x, 1)),
        y: Math.max(minimumTimelineScale, getFiniteNumber(value.y, 1)),
      };
    }
    return value;
  }

  if (property === 'opacity') return clamp(value, 0, 255);
  if (property === 'volume') return clamp(value, 0, 100);
  if (property === 'width' || property === 'height') {
    return Math.max(minimumTimelineDimension, getFiniteNumber(value, 1));
  }
  if (property === 'playbackSpeed' || property === 'animationSpeedScale') {
    return Math.max(minimumTimelineScale, getFiniteNumber(value, 1));
  }
  if (property === 'scaleX' || property === 'scaleY') {
    return Math.max(minimumTimelineScale, getFiniteNumber(value, 1));
  }
  return getFiniteNumber(value, 0);
};

const offsetTimelineValueChannel = (
  property: string,
  value: number | {| x: number, y: number |},
  channel: 'x' | 'y' | 'value',
  deltaValue: number
): number | {| x: number, y: number |} => {
  if (typeof value === 'object') {
    const nextValue =
      channel === 'x'
        ? { ...value, x: value.x + deltaValue }
        : { ...value, y: value.y + deltaValue };
    return normalizeDraggedTimelineValue(property, nextValue);
  }

  return normalizeDraggedTimelineValue(property, value + deltaValue);
};

const getCubicBezierControlPoints = (
  curve: TimelineCurveDefinition | null
): {| x1: number, y1: number, x2: number, y2: number |} => {
  if (Array.isArray(curve) && curve.length >= 4) {
    return {
      x1: clamp01(getFiniteNumber(curve[0], 0.42)),
      y1: clamp01(getFiniteNumber(curve[1], 0)),
      x2: clamp01(getFiniteNumber(curve[2], 0.58)),
      y2: clamp01(getFiniteNumber(curve[3], 1)),
    };
  }

  if (curve && typeof curve === 'object' && curve.type === 'cubicBezier') {
    return {
      x1: clamp01(getFiniteNumber(curve.x1, 0.42)),
      y1: clamp01(getFiniteNumber(curve.y1, 0)),
      x2: clamp01(getFiniteNumber(curve.x2, 0.58)),
      y2: clamp01(getFiniteNumber(curve.y2, 1)),
    };
  }

  return { x1: 0.42, y1: 0, x2: 0.58, y2: 1 };
};

const getFrameLabelStep = (visibleFrames: number): number => {
  const targetLabelsCount = 16;
  const rawStep = Math.max(1, visibleFrames / targetLabelsCount);
  const steps = [1, 2, 3, 6, 12, 15, 30, 60, 120, 240, 480, 960];
  return steps.find(step => step >= rawStep) || Math.ceil(rawStep / 960) * 960;
};

const getTrackTitle = (track: TimelineTrack): string => {
  if (track.target.mode === 'runtimeBinding') {
    return track.target.bindingName || '';
  }
  return track.target.objectName || '';
};

const getTrackLabel = (track: TimelineTrack): React.Node => {
  if (track.target.mode === 'runtimeBinding') {
    return track.target.bindingName || <Trans>Runtime target</Trans>;
  }
  return track.target.objectName || <Trans>Object</Trans>;
};

const isSpine43ObjectType = (objectType: ?string): boolean =>
  objectType === 'Spine43Object' ||
  objectType === 'Spine43Object::Spine43Object';

const getRenderedInstanceDimension = (
  instance: gdInitialInstance,
  onGetInstanceSize: ?(gdInitialInstance) => [number, number, number],
  dimensionIndex: 0 | 1
): number => {
  if (!onGetInstanceSize) return 0;

  const size = onGetInstanceSize(instance);
  return size ? size[dimensionIndex] : 0;
};

const getInstanceRawWidth = (instance: gdInitialInstance): number =>
  instance.hasCustomSize()
    ? instance.getCustomWidth()
    : instance.getDefaultWidth();

const getInstanceRawHeight = (instance: gdInitialInstance): number =>
  instance.hasCustomSize()
    ? instance.getCustomHeight()
    : instance.getDefaultHeight();

const getPositiveDimension = (value: number, fallback: number): number =>
  Number.isFinite(value) && value > 0 ? value : fallback;

const areTimelineScaleValuesIdentity = (value: {|
  x: number,
  y: number,
|}): boolean =>
  Math.abs(value.x - 1) < 0.0001 && Math.abs(value.y - 1) < 0.0001;

const getInstanceScaleBaseWidth = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number =>
  getPositiveDimension(
    instance.getDefaultWidth(),
    getPositiveDimension(
      instance.hasCustomSize() ? instance.getCustomWidth() : 0,
      getPositiveDimension(
        isSpine43ObjectType(objectType)
          ? 0
          : getRenderedInstanceDimension(instance, onGetInstanceSize, 0),
        fallbackTimelineScaleBaseSize
      )
    )
  );

const getInstanceScaleBaseHeight = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number =>
  getPositiveDimension(
    instance.getDefaultHeight(),
    getPositiveDimension(
      instance.hasCustomSize() ? instance.getCustomHeight() : 0,
      getPositiveDimension(
        isSpine43ObjectType(objectType)
          ? 0
          : getRenderedInstanceDimension(instance, onGetInstanceSize, 1),
        fallbackTimelineScaleBaseSize
      )
    )
  );

const getInstanceWidth = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number =>
  getPositiveDimension(
    getInstanceRawWidth(instance),
    getInstanceScaleBaseWidth(instance, onGetInstanceSize, objectType)
  );

const getInstanceHeight = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number =>
  getPositiveDimension(
    getInstanceRawHeight(instance),
    getInstanceScaleBaseHeight(instance, onGetInstanceSize, objectType)
  );

const getInstanceScale = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): {| x: number, y: number |} => {
  const defaultWidth = getInstanceScaleBaseWidth(
    instance,
    onGetInstanceSize,
    objectType
  );
  const defaultHeight = getInstanceScaleBaseHeight(
    instance,
    onGetInstanceSize,
    objectType
  );
  const width = getInstanceWidth(instance, onGetInstanceSize, objectType);
  const height = getInstanceHeight(instance, onGetInstanceSize, objectType);
  return {
    x: getPositiveDimension(width / defaultWidth, 1),
    y: getPositiveDimension(height / defaultHeight, 1),
  };
};

const getInstanceIdentity = (instance: gdInitialInstance): string =>
  instance.getPersistentUuid() || String(instance.ptr);

const getScaleBaseDimensionsKey = (
  instance: gdInitialInstance,
  objectType: ?string
): string => `${getInstanceIdentity(instance)}:${objectType || ''}`;

const getInstanceTimelineScaleBaseDimensions = (
  instance: gdInitialInstance,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): TimelineScaleBaseDimensions => {
  const renderedWidth = getRenderedInstanceDimension(
    instance,
    onGetInstanceSize,
    0
  );
  const renderedHeight = getRenderedInstanceDimension(
    instance,
    onGetInstanceSize,
    1
  );

  if (isSpine43ObjectType(objectType)) {
    return {
      width: getPositiveDimension(
        renderedWidth,
        getInstanceScaleBaseWidth(instance, onGetInstanceSize, objectType)
      ),
      height: getPositiveDimension(
        renderedHeight,
        getInstanceScaleBaseHeight(instance, onGetInstanceSize, objectType)
      ),
    };
  }

  return {
    width: getInstanceScaleBaseWidth(instance, onGetInstanceSize, objectType),
    height: getInstanceScaleBaseHeight(instance, onGetInstanceSize, objectType),
  };
};

const getInitialInstancesSignature = (
  initialInstances: ?gdInitialInstancesContainer
): string => {
  if (!initialInstances) return '';

  const instanceIdentities = [];
  const functor = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write] - invoke is provided by the Emscripten functor.
  functor.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type] - wrapPointer accepts native pointers.
      instancePtr,
      gd.InitialInstance
    );
    instanceIdentities.push(
      `${instance.getObjectName()}:${getInstanceIdentity(instance)}`
    );
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is compatible at runtime.
  initialInstances.iterateOverInstances(functor);
  functor.delete();

  return instanceIdentities.sort().join('|');
};

const getSelectedInstancesSignature = (
  instances: Array<gdInitialInstance>
): string => {
  const instanceIdentities = new Set<string>();
  for (const instance of instances) {
    instanceIdentities.add(getInstanceIdentity(instance));
  }

  return Array.from(instanceIdentities)
    .sort()
    .join('|');
};

const getTimelineValueIdentity = (value: any): string =>
  value && typeof value === 'object'
    ? `${getFiniteNumber(value.x, 0).toFixed(3)},${getFiniteNumber(
        value.y,
        0
      ).toFixed(3)}`
    : getFiniteNumber(value, 0).toFixed(3);

const normalizeTimelinePropertyTrack = (
  propertyTrack: TimelinePropertyTrack
): {| propertyTrack: TimelinePropertyTrack, changed: boolean |} => {
  const keyframes = propertyTrack.keyframes || [];
  const keyframeByFrame = new Map<string, TimelineKeyframe>();
  let normalizedInitialValue =
    propertyTrack.initialValue !== undefined &&
    propertyTrack.initialValue !== null
      ? normalizeTimelineValueForProperty(
          propertyTrack.property,
          propertyTrack.initialValue
        )
      : getDefaultTimelinePropertyValue(propertyTrack.property);
  const defaultInitialEase = isDiscreteTimelineProperty(propertyTrack.property)
    ? 'hold'
    : 'linear';
  const defaultInitialCurve = isDiscreteTimelineProperty(propertyTrack.property)
    ? 'stepped'
    : 'linear';
  let normalizedInitialEase =
    propertyTrack.initialEase !== undefined
      ? propertyTrack.initialEase
      : defaultInitialEase;
  let normalizedInitialCurve =
    propertyTrack.initialCurve !== undefined
      ? propertyTrack.initialCurve
      : defaultInitialCurve;
  let changed = false;
  if (
    propertyTrack.initialValue === undefined ||
    propertyTrack.initialValue === null ||
    getTimelineValueIdentity(normalizedInitialValue) !==
      getTimelineValueIdentity(propertyTrack.initialValue)
  ) {
    changed = true;
  }
  if (
    propertyTrack.initialEase === undefined ||
    propertyTrack.initialCurve === undefined
  ) {
    changed = true;
  }

  for (const keyframe of keyframes) {
    const snappedTime = snapTimeToTimelineFrame(keyframe.time);
    const frameKey = getKeyframeFrameKey(snappedTime);
    const normalizedKeyframe =
      Math.abs(snappedTime - keyframe.time) > 0.000001
        ? { ...keyframe, time: snappedTime }
        : keyframe;
    const normalizedValue = normalizeTimelineValueForProperty(
      propertyTrack.property,
      normalizedKeyframe.value
    );
    const normalizedValueKeyframe =
      getTimelineValueIdentity(normalizedValue) !==
      getTimelineValueIdentity(normalizedKeyframe.value)
        ? {
            ...normalizedKeyframe,
            value: normalizedValue,
          }
        : normalizedKeyframe;
    if (normalizedValueKeyframe !== keyframe) {
      changed = true;
    }
    if (frameKey === '0') {
      normalizedInitialValue = normalizedValue;
      normalizedInitialEase =
        normalizedValueKeyframe.ease !== undefined
          ? normalizedValueKeyframe.ease
          : defaultInitialEase;
      normalizedInitialCurve =
        normalizedValueKeyframe.curve !== undefined
          ? normalizedValueKeyframe.curve
          : defaultInitialCurve;
      changed = true;
      continue;
    }
    if (keyframeByFrame.has(frameKey)) {
      changed = true;
    }
    keyframeByFrame.set(frameKey, normalizedValueKeyframe);
  }

  const normalizedKeyframes = Array.from(keyframeByFrame.values()).sort(
    (a, b) => a.time - b.time
  );

  if (!changed) {
    for (let index = 0; index < normalizedKeyframes.length; index++) {
      if (normalizedKeyframes[index] !== keyframes[index]) {
        changed = true;
        break;
      }
    }
  }

  return {
    propertyTrack: changed
      ? {
          ...propertyTrack,
          initialValue: cloneTimelineValue(normalizedInitialValue),
          initialEase: normalizedInitialEase,
          initialCurve: normalizedInitialCurve,
          keyframes: normalizedKeyframes,
        }
      : propertyTrack,
    changed,
  };
};

const splitLegacyVectorPropertyTrack = (
  propertyTrack: TimelinePropertyTrack
): {| propertyTracks: Array<TimelinePropertyTrack>, changed: boolean |} => {
  if (
    propertyTrack.property !== 'position' &&
    propertyTrack.property !== 'scale'
  ) {
    return { propertyTracks: [propertyTrack], changed: false };
  }

  const firstProperty = propertyTrack.property === 'position' ? 'x' : 'scaleX';
  const secondProperty = propertyTrack.property === 'position' ? 'y' : 'scaleY';

  const createScalarTrack = (
    property: string,
    channel: 'x' | 'y',
    keepExistingIds: boolean
  ): TimelinePropertyTrack => {
    const fallbackValue = getDefaultTimelinePropertyValue(
      propertyTrack.property
    );
    const sourceInitialValue =
      propertyTrack.initialValue !== undefined &&
      propertyTrack.initialValue !== null
        ? propertyTrack.initialValue
        : fallbackValue;
    const legacyInitialValue =
      sourceInitialValue && typeof sourceInitialValue === 'object'
        ? sourceInitialValue
        : fallbackValue && typeof fallbackValue === 'object'
        ? fallbackValue
        : { x: 0, y: 0 };

    return {
      ...propertyTrack,
      id: keepExistingIds ? propertyTrack.id : createPropertyTrackId(),
      property,
      initialValue: normalizeTimelineValueForProperty(
        property,
        legacyInitialValue[channel]
      ),
      keyframes: propertyTrack.keyframes.map(keyframe => {
        const fallbackValue = getDefaultTimelinePropertyValue(
          propertyTrack.property
        );
        const legacyValue =
          keyframe.value && typeof keyframe.value === 'object'
            ? keyframe.value
            : fallbackValue && typeof fallbackValue === 'object'
            ? fallbackValue
            : { x: 0, y: 0 };
        return {
          ...keyframe,
          id: keepExistingIds ? keyframe.id : createKeyframeId(),
          value: normalizeTimelineValueForProperty(
            property,
            legacyValue[channel]
          ),
        };
      }),
    };
  };

  return {
    propertyTracks: [
      createScalarTrack(firstProperty, 'x', true),
      createScalarTrack(secondProperty, 'y', false),
    ],
    changed: true,
  };
};

const mergeTimelinePropertyTracks = (
  keptPropertyTracks: Array<TimelinePropertyTrack>,
  incomingPropertyTracks: Array<TimelinePropertyTrack>,
  propertyTrackIdReplacements: Map<string, string>
): Array<TimelinePropertyTrack> => {
  const mergedPropertyTracks = keptPropertyTracks.slice();
  const propertyTrackIndexByProperty = new Map<string, number>();
  mergedPropertyTracks.forEach((propertyTrack, index) => {
    propertyTrackIndexByProperty.set(propertyTrack.property, index);
  });

  for (const incomingPropertyTrack of incomingPropertyTracks) {
    const keptPropertyTrackIndex = propertyTrackIndexByProperty.get(
      incomingPropertyTrack.property
    );
    if (keptPropertyTrackIndex === undefined) {
      propertyTrackIndexByProperty.set(
        incomingPropertyTrack.property,
        mergedPropertyTracks.length
      );
      mergedPropertyTracks.push(incomingPropertyTrack);
      continue;
    }

    const keptPropertyTrack = mergedPropertyTracks[keptPropertyTrackIndex];
    propertyTrackIdReplacements.set(
      incomingPropertyTrack.id,
      keptPropertyTrack.id
    );

    let nextKeptPropertyTrack = keptPropertyTrack;
    if (
      keptPropertyTrack.initialValue === undefined &&
      incomingPropertyTrack.initialValue !== undefined
    ) {
      nextKeptPropertyTrack = {
        ...nextKeptPropertyTrack,
        initialValue: cloneTimelineValue(
          normalizeTimelineValueForProperty(
            incomingPropertyTrack.property,
            incomingPropertyTrack.initialValue
          )
        ),
      };
      mergedPropertyTracks[keptPropertyTrackIndex] = nextKeptPropertyTrack;
    }

    const usedKeyframeFrames = new Set(
      nextKeptPropertyTrack.keyframes.map(getKeyframeMergeKey)
    );
    const keyframesToAdd = incomingPropertyTrack.keyframes.filter(keyframe => {
      const key = getKeyframeMergeKey(keyframe);
      if (usedKeyframeFrames.has(key)) return false;
      usedKeyframeFrames.add(key);
      return true;
    });

    if (keyframesToAdd.length) {
      mergedPropertyTracks[keptPropertyTrackIndex] = {
        ...nextKeptPropertyTrack,
        keyframes: [...nextKeptPropertyTrack.keyframes, ...keyframesToAdd].sort(
          (a, b) => a.time - b.time
        ),
      };
    }
  }

  return mergedPropertyTracks;
};

const getTimelineTrackKey = (track: TimelineTrack): ?string => {
  const target = track.target;
  if (!target) return null;

  if (target.mode === 'runtimeBinding') {
    return target.bindingName ? `runtime:${target.bindingName}` : null;
  }

  if (target.mode === 'sceneInstance' && target.instancePersistentUuid) {
    return `instance:${target.instancePersistentUuid}`;
  }

  if (target.mode === 'sceneInstance') {
    return `unresolved-instance:${track.id}`;
  }

  return target.objectName
    ? `object:${target.objectName}:${target.selection || 'first'}`
    : null;
};

const normalizeTimelineTracks = (
  tracks: Array<TimelineTrack>
): {|
  tracks: Array<TimelineTrack>,
  changed: boolean,
  propertyTrackIdReplacements: Map<string, string>,
|} => {
  const normalizedTracks: Array<TimelineTrack> = [];
  const trackIndexByKey = new Map<string, number>();
  const propertyTrackIdReplacements = new Map<string, string>();
  let changed = false;

  for (const track of tracks) {
    const target = track.target;
    if (
      !target ||
      (target.mode !== 'runtimeBinding' &&
        !target.objectName &&
        !target.instancePersistentUuid)
    ) {
      changed = true;
      continue;
    }

    let normalizedTrack = track;
    let didNormalizePropertyTracks = false;
    const normalizedPropertyTracks = [];
    for (const propertyTrack of track.propertyTracks) {
      const propertyTrackUpdate = normalizeTimelinePropertyTrack(propertyTrack);
      if (propertyTrackUpdate.changed) {
        didNormalizePropertyTracks = true;
      }
      const splitPropertyTrackUpdate = splitLegacyVectorPropertyTrack(
        propertyTrackUpdate.propertyTrack
      );
      if (splitPropertyTrackUpdate.changed) {
        didNormalizePropertyTracks = true;
      }
      normalizedPropertyTracks.push(...splitPropertyTrackUpdate.propertyTracks);
    }
    if (didNormalizePropertyTracks) {
      normalizedTrack = {
        ...track,
        propertyTracks: normalizedPropertyTracks,
      };
      changed = true;
    }

    const trackKey = getTimelineTrackKey(track);
    if (!trackKey) {
      changed = true;
      continue;
    }

    const keptTrackIndex = trackIndexByKey.get(trackKey);
    if (keptTrackIndex === undefined) {
      trackIndexByKey.set(trackKey, normalizedTracks.length);
      normalizedTracks.push(normalizedTrack);
      continue;
    }

    const keptTrack = normalizedTracks[keptTrackIndex];
    normalizedTracks[keptTrackIndex] = {
      ...keptTrack,
      propertyTracks: mergeTimelinePropertyTracks(
        keptTrack.propertyTracks,
        normalizedTrack.propertyTracks,
        propertyTrackIdReplacements
      ),
    };
    changed = true;
  }

  return { tracks: normalizedTracks, changed, propertyTrackIdReplacements };
};

const getTrackPropertyValueFromInstance = (
  instance: ?gdInitialInstance,
  property: string,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number | {| x: number, y: number |} => {
  if (!instance) {
    return getDefaultTimelinePropertyValue(property);
  }

  switch (property) {
    case 'position':
      return normalizeTimelineValueForProperty(property, {
        x: instance.getX(),
        y: instance.getY(),
      });
    case 'x':
      return normalizeTimelineValueForProperty(property, instance.getX());
    case 'y':
      return normalizeTimelineValueForProperty(property, instance.getY());
    case 'angle':
      return normalizeTimelineValueForProperty(property, instance.getAngle());
    case 'scale':
      return getInstanceScale(instance, onGetInstanceSize, objectType);
    case 'scaleX':
      return normalizeTimelineScaleAxisValue(
        'scaleX',
        getInstanceScale(instance, onGetInstanceSize, objectType).x
      );
    case 'scaleY':
      return normalizeTimelineScaleAxisValue(
        'scaleY',
        getInstanceScale(instance, onGetInstanceSize, objectType).y
      );
    case 'opacity':
      // $FlowFixMe[prop-missing] - Some generated bindings expose opacity.
      return normalizeTimelineValueForProperty(
        property,
        typeof instance.getOpacity === 'function'
          ? // $FlowFixMe[prop-missing]
            instance.getOpacity()
          : 255
      );
    case 'width':
      return getInstanceWidth(instance, onGetInstanceSize, objectType);
    case 'height':
      return getInstanceHeight(instance, onGetInstanceSize, objectType);
    default:
      return getDefaultTimelinePropertyValue(property);
  }
};

const getTimelinePropertiesForObjectType = (
  objectType: ?string
): Array<string> => {
  switch (objectType) {
    case 'Sprite':
    case 'TiledSpriteObject::TiledSprite':
    case 'PanelSpriteObject::PanelSprite':
      return spriteTimelineProperties;
    case 'TextObject::Text':
    case 'BBText::BBText':
    case 'BitmapText::BitmapText':
      return textTimelineProperties;
    case 'Video::VideoObject':
      return videoTimelineProperties;
    default:
      return commonTimelineProperties;
  }
};

const ensureSupportedPropertyTracks = (
  track: TimelineTrack,
  instance: ?gdInitialInstance,
  objectType: ?string,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number]
): {| track: TimelineTrack, changed: boolean |} => {
  if (!instance) {
    return { track, changed: false };
  }

  const existingProperties = new Set(
    track.propertyTracks.map(propertyTrack => propertyTrack.property)
  );
  const missingProperties = getTimelinePropertiesForObjectType(
    objectType
  ).filter(property => !existingProperties.has(property));
  if (!missingProperties.length) {
    return { track, changed: false };
  }

  return {
    track: {
      ...track,
      propertyTracks: [
        ...track.propertyTracks,
        ...missingProperties.map(property =>
          createPropertyTrack(
            property,
            getTrackPropertyValueFromInstance(
              instance,
              property,
              onGetInstanceSize,
              objectType
            )
          )
        ),
      ],
    },
    changed: true,
  };
};

const createPropertyTracksForObject = (
  objectType: ?string,
  instance: ?gdInitialInstance,
  existingPropertyTracks?: Array<TimelinePropertyTrack>,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number]
): Array<TimelinePropertyTrack> => {
  const existingPropertyTrackByProperty = new Map<
    string,
    TimelinePropertyTrack
  >();
  if (existingPropertyTracks) {
    for (const propertyTrack of existingPropertyTracks) {
      const propertyTrackUpdate = normalizeTimelinePropertyTrack(propertyTrack);
      const splitPropertyTrackUpdate = splitLegacyVectorPropertyTrack(
        propertyTrackUpdate.propertyTrack
      );
      for (const splitPropertyTrack of splitPropertyTrackUpdate.propertyTracks) {
        existingPropertyTrackByProperty.set(
          splitPropertyTrack.property,
          splitPropertyTrack
        );
      }
    }
  }

  if (!instance) {
    return Array.from(existingPropertyTrackByProperty.values());
  }

  return getTimelinePropertiesForObjectType(objectType).map(property => {
    const existingPropertyTrack = existingPropertyTrackByProperty.get(property);
    if (existingPropertyTrack) {
      return existingPropertyTrack;
    }

    return createPropertyTrack(
      property,
      getTrackPropertyValueFromInstance(
        instance,
        property,
        onGetInstanceSize,
        objectType
      )
    );
  });
};

const getPropertyLabel = (property: string): React.Node => {
  switch (property) {
    case 'position':
      return <Trans>Position</Trans>;
    case 'angle':
      return <Trans>Angle</Trans>;
    case 'opacity':
      return <Trans>Opacity</Trans>;
    case 'scale':
      return <Trans>Scale</Trans>;
    case 'scaleX':
      return <Trans>X scale</Trans>;
    case 'scaleY':
      return <Trans>Y scale</Trans>;
    case 'width':
      return <Trans>Width</Trans>;
    case 'height':
      return <Trans>Height</Trans>;
    case 'animationIndex':
      return <Trans>Animation</Trans>;
    case 'animationFrame':
      return <Trans>Animation frame</Trans>;
    case 'animationSpeedScale':
      return <Trans>Animation speed</Trans>;
    case 'characterSize':
      return <Trans>Font size</Trans>;
    case 'lineHeight':
      return <Trans>Line height</Trans>;
    case 'volume':
      return <Trans>Volume</Trans>;
    case 'playbackSpeed':
      return <Trans>Playback speed</Trans>;
    case 'currentTime':
      return <Trans>Video time</Trans>;
    case 'x':
      return <Trans>X position</Trans>;
    case 'y':
      return <Trans>Y position</Trans>;
    default:
      return property;
  }
};

const getObjectNames = (
  project: gdProject,
  objectsContainer?: ?gdObjectsContainer,
  globalObjectsContainer?: ?gdObjectsContainer
): Array<string> => {
  const names = new Set<string>();
  const addContainerObjects = (container: ?gdObjectsContainer) => {
    if (!container) return;
    for (let index = 0; index < container.getObjectsCount(); index++) {
      names.add(container.getObjectAt(index).getName());
    }
  };

  addContainerObjects(objectsContainer);
  addContainerObjects(globalObjectsContainer || project.getObjects());
  return Array.from(names).sort();
};

const findObjectByName = (
  project: gdProject,
  objectsContainer: ?gdObjectsContainer,
  globalObjectsContainer: ?gdObjectsContainer,
  objectName: ?string
): ?gdObject => {
  if (!objectName) return null;
  if (objectsContainer && objectsContainer.hasObjectNamed(objectName)) {
    return objectsContainer.getObject(objectName);
  }

  const globalObjects = globalObjectsContainer || project.getObjects();
  if (globalObjects && globalObjects.hasObjectNamed(objectName)) {
    return globalObjects.getObject(objectName);
  }

  return null;
};

const getObjectTypeByName = (
  project: gdProject,
  objectsContainer: ?gdObjectsContainer,
  globalObjectsContainer: ?gdObjectsContainer,
  objectName: ?string
): ?string => {
  const object = findObjectByName(
    project,
    objectsContainer,
    globalObjectsContainer,
    objectName
  );
  return object ? object.getType() : null;
};

const getTrackObjectType = (
  project: gdProject,
  objectsContainer: ?gdObjectsContainer,
  globalObjectsContainer: ?gdObjectsContainer,
  track: TimelineTrack
): ?string =>
  getObjectTypeByName(
    project,
    objectsContainer,
    globalObjectsContainer,
    track.target.objectName
  );

const createTrackForInstance = (
  instance: gdInitialInstance,
  objectType: ?string,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number]
): TimelineTrack => {
  const instancePersistentUuid = instance.getPersistentUuid();
  const objectName = instance.getObjectName();
  return {
    id: createTrackId(),
    type: 'object',
    target: instancePersistentUuid
      ? {
          mode: 'sceneInstance',
          objectName,
          instancePersistentUuid,
          selection: 'first',
        }
      : {
          mode: 'objectName',
          objectName,
          selection: 'first',
        },
    propertyTracks: createPropertyTracksForObject(
      objectType,
      instance,
      undefined,
      onGetInstanceSize
    ),
  };
};

const getInitialInstancesIndex = (
  initialInstances: ?gdInitialInstancesContainer
): InitialInstancesIndex => {
  const byObjectName: Map<string, Array<gdInitialInstance>> = new Map();
  const byPersistentUuid: Map<string, gdInitialInstance> = new Map();
  if (!initialInstances) {
    return { byObjectName, byPersistentUuid };
  }

  const functor = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write] - invoke is provided by the Emscripten functor.
  functor.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type] - wrapPointer accepts native pointers.
      instancePtr,
      gd.InitialInstance
    );
    const objectName = instance.getObjectName();
    const persistentUuid = instance.getPersistentUuid();
    if (objectName) {
      const instances = byObjectName.get(objectName) || [];
      instances.push(instance);
      byObjectName.set(objectName, instances);
    }
    if (persistentUuid) {
      byPersistentUuid.set(persistentUuid, instance);
    }
  };
  // $FlowFixMe[incompatible-type] - JSFunctor is compatible at runtime.
  initialInstances.iterateOverInstances(functor);
  functor.delete();
  return { byObjectName, byPersistentUuid };
};

const findInitialInstancesForTrack = (
  track: TimelineTrack,
  initialInstancesIndex: InitialInstancesIndex
): Array<gdInitialInstance> => {
  const target = track.target;
  if (!target) return [];

  if (target.mode === 'sceneInstance' && target.instancePersistentUuid) {
    const instance = initialInstancesIndex.byPersistentUuid.get(
      target.instancePersistentUuid
    );
    if (instance) {
      return [instance];
    }
    return [];
  }

  const instances = target.objectName
    ? initialInstancesIndex.byObjectName.get(target.objectName) || []
    : [];
  return target.selection === 'all' ? instances : instances.slice(0, 1);
};

const isInitialInstanceAvailable = (
  instance: gdInitialInstance,
  initialInstancesIndex: InitialInstancesIndex,
  hasInitialInstancesContainer: boolean
): boolean => {
  if (!hasInitialInstancesContainer) return true;

  const persistentUuid = instance.getPersistentUuid();
  if (persistentUuid) {
    return initialInstancesIndex.byPersistentUuid.has(persistentUuid);
  }

  const objectName = instance.getObjectName();
  if (!objectName) return false;

  const instanceIdentity = getInstanceIdentity(instance);
  return (initialInstancesIndex.byObjectName.get(objectName) || []).some(
    liveInstance => getInstanceIdentity(liveInstance) === instanceIdentity
  );
};

const isTrackTargetMissingSceneInstance = (
  track: TimelineTrack,
  initialInstancesIndex: InitialInstancesIndex,
  hasInitialInstancesContainer: boolean
): boolean => {
  if (!hasInitialInstancesContainer) return false;

  const target = track.target;
  return !!(
    target.mode === 'sceneInstance' &&
    target.instancePersistentUuid &&
    !initialInstancesIndex.byPersistentUuid.has(target.instancePersistentUuid)
  );
};

const doesTrackTargetInstance = (
  track: TimelineTrack,
  instance: gdInitialInstance
): boolean => {
  const target = track.target;
  const objectName = instance.getObjectName();
  const persistentUuid = instance.getPersistentUuid();

  if (target.mode === 'sceneInstance') {
    return !!(
      persistentUuid &&
      target.instancePersistentUuid &&
      target.instancePersistentUuid === persistentUuid
    );
  }

  if (!objectName || target.objectName !== objectName) {
    return false;
  }

  return target.mode === 'objectName' && !persistentUuid;
};

const findTrackForInstance = (
  tracks: Array<TimelineTrack>,
  instance: gdInitialInstance
): ?TimelineTrack =>
  tracks.find(track => doesTrackTargetInstance(track, instance));

const findTimelineKeyframePair = (
  keyframes: Array<TimelineKeyframe>,
  time: number
): ?{|
  from: TimelineKeyframe,
  to: TimelineKeyframe,
  localT: number,
|} => {
  if (!keyframes.length) return null;
  if (keyframes.length === 1 || time <= keyframes[0].time) {
    return { from: keyframes[0], to: keyframes[0], localT: 0 };
  }

  const lastKeyframe = keyframes[keyframes.length - 1];
  if (time >= lastKeyframe.time) {
    return { from: lastKeyframe, to: lastKeyframe, localT: 1 };
  }

  let low = 0;
  let high = keyframes.length - 2;
  while (low <= high) {
    const index = Math.floor((low + high) / 2);
    const from = keyframes[index];
    const to = keyframes[index + 1];

    if (time < from.time) {
      high = index - 1;
      continue;
    }

    if (time > to.time) {
      low = index + 1;
      continue;
    }

    const duration = to.time - from.time;
    return {
      from,
      to,
      localT: duration > 0 ? clamp01((time - from.time) / duration) : 1,
    };
  }

  return null;
};

const interpolateTimelineValue = (
  propertyTrack: TimelinePropertyTrack,
  time: number
): number | {| x: number, y: number |} | null => {
  const keyframes = getSamplingTimelineKeyframes(propertyTrack);
  if (!keyframes.length) return null;

  const pair = findTimelineKeyframePair(keyframes, time);
  if (!pair) return null;

  const { from, to, localT } = pair;
  if (
    from === to ||
    isDiscreteTimelineProperty(propertyTrack.property) ||
    propertyTrack.interpolationMode === 'step' ||
    propertyTrack.interpolationMode === 'hold' ||
    propertyTrack.interpolationMode === 'keyframe'
  ) {
    return localT >= 1 ? to.value : from.value;
  }

  const easedT = evaluateTimelineCurve(getKeyframeCurve(from), localT);
  if (typeof from.value === 'object' && typeof to.value === 'object') {
    return {
      x: from.value.x + (to.value.x - from.value.x) * easedT,
      y: from.value.y + (to.value.y - from.value.y) * easedT,
    };
  }
  if (typeof from.value === 'number' && typeof to.value === 'number') {
    return from.value + (to.value - from.value) * easedT;
  }
  return from.value;
};

const getPropertyValueFromInitialInstance = (
  instance: gdInitialInstance,
  propertyName: string,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number | {| x: number, y: number |} | null => {
  if (propertyName === 'position') {
    return normalizeTimelineValueForProperty(propertyName, {
      x: instance.getX(),
      y: instance.getY(),
    });
  }
  if (propertyName === 'x' || propertyName === 'X') {
    return getFiniteNumber(instance.getX(), 0);
  }
  if (propertyName === 'y' || propertyName === 'Y') {
    return getFiniteNumber(instance.getY(), 0);
  }
  if (propertyName === 'angle' || propertyName === 'Angle') {
    return normalizeTimelineValueForProperty('angle', instance.getAngle());
  }
  if (propertyName === 'scale' || propertyName === 'Scale') {
    return getInstanceScale(instance, onGetInstanceSize, objectType);
  }
  if (propertyName === 'scaleX' || propertyName === 'ScaleX') {
    return normalizeTimelineScaleAxisValue(
      'scaleX',
      getInstanceScale(instance, onGetInstanceSize, objectType).x
    );
  }
  if (propertyName === 'scaleY' || propertyName === 'ScaleY') {
    return normalizeTimelineScaleAxisValue(
      'scaleY',
      getInstanceScale(instance, onGetInstanceSize, objectType).y
    );
  }
  if (propertyName === 'width' || propertyName === 'Width') {
    return getInstanceWidth(instance, onGetInstanceSize, objectType);
  }
  if (propertyName === 'height' || propertyName === 'Height') {
    return getInstanceHeight(instance, onGetInstanceSize, objectType);
  }
  if (
    (propertyName === 'opacity' || propertyName === 'Opacity') &&
    // $FlowFixMe[prop-missing] - Some generated bindings expose opacity.
    typeof instance.getOpacity === 'function'
  ) {
    // $FlowFixMe[prop-missing] - Some generated bindings expose opacity.
    return normalizeTimelineValueForProperty('opacity', instance.getOpacity());
  }
  if (
    propertyName === 'animationIndex' &&
    // $FlowFixMe[prop-missing] - Sprite initial instances store animation here.
    typeof instance.getRawDoubleProperty === 'function'
  ) {
    // $FlowFixMe[prop-missing]
    return normalizeTimelineValueForProperty(
      'animationIndex',
      instance.getRawDoubleProperty('animation')
    );
  }
  if (
    propertyName === 'animationFrame' &&
    // $FlowFixMe[prop-missing] - Sprite initial instances store animation frame here.
    typeof instance.getRawDoubleProperty === 'function'
  ) {
    // $FlowFixMe[prop-missing]
    return normalizeTimelineValueForProperty(
      'animationFrame',
      instance.getRawDoubleProperty('animationFrame')
    );
  }

  return null;
};

const getCurrentTimelineValueIdentity = (
  instance: gdInitialInstance,
  propertyName: string,
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): ?string => {
  const value = getPropertyValueFromInitialInstance(
    instance,
    propertyName,
    onGetInstanceSize,
    objectType
  );
  return value === null ? null : getTimelineValueIdentity(value);
};

const isTimelineScaleProperty = (propertyName: string): boolean =>
  propertyName === 'scale' ||
  propertyName === 'Scale' ||
  propertyName === 'scaleX' ||
  propertyName === 'ScaleX' ||
  propertyName === 'scaleY' ||
  propertyName === 'ScaleY';

const applyValueToInitialInstance = (
  instance: gdInitialInstance,
  propertyName: string,
  value: number | {| x: number, y: number |},
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string,
  scaleBaseDimensions?: ?TimelineScaleBaseDimensions
) => {
  if (propertyName === 'position' && typeof value === 'object') {
    const normalizedValue = normalizeTimelineValueForProperty(
      propertyName,
      value
    );
    if (typeof normalizedValue === 'object') {
      instance.setX(normalizedValue.x);
      instance.setY(normalizedValue.y);
    }
  } else if (
    (propertyName === 'x' || propertyName === 'X') &&
    typeof value === 'number'
  ) {
    instance.setX(getFiniteNumber(value, instance.getX()));
  } else if (
    (propertyName === 'y' || propertyName === 'Y') &&
    typeof value === 'number'
  ) {
    instance.setY(getFiniteNumber(value, instance.getY()));
  } else if (
    (propertyName === 'angle' || propertyName === 'Angle') &&
    typeof value === 'number'
  ) {
    instance.setAngle(normalizeTimelineValueForProperty('angle', value));
  } else if (
    (propertyName === 'scale' || propertyName === 'Scale') &&
    typeof value === 'object'
  ) {
    const normalizedValue = normalizeTimelineValueForProperty(
      'scale',
      value,
      getInstanceScale(instance, onGetInstanceSize, objectType)
    );
    if (typeof normalizedValue !== 'object') return;

    if (
      isSpine43ObjectType(objectType) &&
      areTimelineScaleValuesIdentity(normalizedValue)
    ) {
      instance.setHasCustomSize(false);
      return;
    }

    const baseWidth =
      scaleBaseDimensions && scaleBaseDimensions.width > 0
        ? scaleBaseDimensions.width
        : getInstanceScaleBaseWidth(instance, onGetInstanceSize, objectType);
    const baseHeight =
      scaleBaseDimensions && scaleBaseDimensions.height > 0
        ? scaleBaseDimensions.height
        : getInstanceScaleBaseHeight(instance, onGetInstanceSize, objectType);
    instance.setHasCustomSize(true);
    instance.setCustomWidth(
      Math.max(minimumTimelineDimension, baseWidth * normalizedValue.x)
    );
    instance.setCustomHeight(
      Math.max(minimumTimelineDimension, baseHeight * normalizedValue.y)
    );
  } else if (
    (propertyName === 'scaleX' ||
      propertyName === 'ScaleX' ||
      propertyName === 'scaleY' ||
      propertyName === 'ScaleY') &&
    typeof value === 'number'
  ) {
    const currentScale = getInstanceScale(
      instance,
      onGetInstanceSize,
      objectType
    );
    const nextScale = {
      x:
        propertyName === 'scaleX' || propertyName === 'ScaleX'
          ? normalizeTimelineScaleAxisValue('scaleX', value, currentScale.x)
          : currentScale.x,
      y:
        propertyName === 'scaleY' || propertyName === 'ScaleY'
          ? normalizeTimelineScaleAxisValue('scaleY', value, currentScale.y)
          : currentScale.y,
    };

    if (
      isSpine43ObjectType(objectType) &&
      areTimelineScaleValuesIdentity(nextScale)
    ) {
      instance.setHasCustomSize(false);
      return;
    }

    const baseWidth =
      scaleBaseDimensions && scaleBaseDimensions.width > 0
        ? scaleBaseDimensions.width
        : getInstanceScaleBaseWidth(instance, onGetInstanceSize, objectType);
    const baseHeight =
      scaleBaseDimensions && scaleBaseDimensions.height > 0
        ? scaleBaseDimensions.height
        : getInstanceScaleBaseHeight(instance, onGetInstanceSize, objectType);
    instance.setHasCustomSize(true);
    instance.setCustomWidth(
      Math.max(minimumTimelineDimension, baseWidth * nextScale.x)
    );
    instance.setCustomHeight(
      Math.max(minimumTimelineDimension, baseHeight * nextScale.y)
    );
  } else if (
    (propertyName === 'width' || propertyName === 'Width') &&
    typeof value === 'number'
  ) {
    instance.setHasCustomSize(true);
    instance.setCustomWidth(
      normalizeTimelineValueForProperty(
        'width',
        value,
        getInstanceWidth(instance, onGetInstanceSize, objectType)
      )
    );
  } else if (
    (propertyName === 'height' || propertyName === 'Height') &&
    typeof value === 'number'
  ) {
    instance.setHasCustomSize(true);
    instance.setCustomHeight(
      normalizeTimelineValueForProperty(
        'height',
        value,
        getInstanceHeight(instance, onGetInstanceSize, objectType)
      )
    );
  } else if (
    (propertyName === 'opacity' || propertyName === 'Opacity') &&
    typeof value === 'number' &&
    // $FlowFixMe[prop-missing] - Some generated bindings expose opacity.
    typeof instance.setOpacity === 'function'
  ) {
    // $FlowFixMe[prop-missing]
    instance.setOpacity(normalizeTimelineValueForProperty('opacity', value));
  } else if (
    propertyName === 'animationIndex' &&
    typeof value === 'number' &&
    // $FlowFixMe[prop-missing] - Sprite initial instances store animation here.
    typeof instance.setRawDoubleProperty === 'function'
  ) {
    // $FlowFixMe[prop-missing]
    instance.setRawDoubleProperty(
      'animation',
      normalizeTimelineValueForProperty('animationIndex', value)
    );
  } else if (
    propertyName === 'animationFrame' &&
    typeof value === 'number' &&
    // $FlowFixMe[prop-missing] - Sprite initial instances store animation frame here.
    typeof instance.setRawDoubleProperty === 'function'
  ) {
    // $FlowFixMe[prop-missing]
    instance.setRawDoubleProperty(
      'animationFrame',
      normalizeTimelineValueForProperty('animationFrame', value)
    );
  }
};

const normalizeValueForInitialInstance = (
  instance: gdInitialInstance,
  propertyName: string,
  value: number | {| x: number, y: number |},
  onGetInstanceSize?: ?(gdInitialInstance) => [number, number, number],
  objectType?: ?string
): number | {| x: number, y: number |} => {
  if (
    (propertyName === 'scale' || propertyName === 'Scale') &&
    typeof value === 'object'
  ) {
    return normalizeTimelineValueForProperty(
      'scale',
      value,
      getInstanceScale(instance, onGetInstanceSize, objectType)
    );
  }

  if (
    (propertyName === 'scaleX' ||
      propertyName === 'ScaleX' ||
      propertyName === 'scaleY' ||
      propertyName === 'ScaleY') &&
    typeof value === 'number'
  ) {
    const currentScale = getInstanceScale(
      instance,
      onGetInstanceSize,
      objectType
    );
    return propertyName === 'scaleY' || propertyName === 'ScaleY'
      ? normalizeTimelineScaleAxisValue('scaleY', value, currentScale.y)
      : normalizeTimelineScaleAxisValue('scaleX', value, currentScale.x);
  }

  if (
    (propertyName === 'opacity' || propertyName === 'Opacity') &&
    typeof value === 'number'
  ) {
    return normalizeTimelineValueForProperty('opacity', value);
  }

  if (
    (propertyName === 'width' ||
      propertyName === 'Width' ||
      propertyName === 'height' ||
      propertyName === 'Height' ||
      propertyName === 'currentTime') &&
    typeof value === 'number'
  ) {
    const canonicalProperty =
      propertyName === 'Width'
        ? 'width'
        : propertyName === 'Height'
        ? 'height'
        : propertyName;
    const fallback =
      canonicalProperty === 'width'
        ? getInstanceWidth(instance, onGetInstanceSize, objectType)
        : canonicalProperty === 'height'
        ? getInstanceHeight(instance, onGetInstanceSize, objectType)
        : undefined;
    return normalizeTimelineValueForProperty(
      canonicalProperty,
      value,
      fallback
    );
  }

  if (
    (propertyName === 'animationIndex' || propertyName === 'animationFrame') &&
    typeof value === 'number'
  ) {
    return normalizeTimelineValueForProperty(propertyName, value);
  }

  if (
    (propertyName === 'animationSpeedScale' ||
      propertyName === 'characterSize' ||
      propertyName === 'lineHeight') &&
    typeof value === 'number'
  ) {
    return normalizeTimelineValueForProperty(propertyName, value);
  }

  if (propertyName === 'volume' && typeof value === 'number') {
    return normalizeTimelineValueForProperty(propertyName, value);
  }

  if (propertyName === 'playbackSpeed' && typeof value === 'number') {
    return normalizeTimelineValueForProperty(propertyName, value);
  }

  return normalizeTimelineValueForProperty(propertyName, value);
};

const styles = {
  root: {
    width: '100%',
    flex: 1,
    height: '100%',
    minHeight: 0,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#252525',
    color: '#D9D9D9',
    overflow: 'hidden',
  },
  topBar: {
    minHeight: 78,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'stretch',
    background: '#3B3B3B',
    borderBottom: '1px solid #171717',
  },
  modeTabs: {
    width: leftPanelWidth,
    borderRight: '1px solid #1B1B1B',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  tabRow: {
    display: 'flex',
    alignItems: 'center',
    height: 32,
    paddingLeft: 8,
    gap: 4,
  },
  tab: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    padding: '0 10px',
    borderRadius: 3,
    color: '#EAEAEA',
    background: '#2D2D2D',
    border: '1px solid #161616',
    fontSize: 12,
  },
  tabInactive: {
    background: '#464646',
    color: '#BEBEBE',
  },
  toolCluster: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    padding: '6px 8px',
  },
  mainTools: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    minWidth: 0,
    padding: '0 8px',
    flexWrap: 'wrap',
  },
  transport: {
    display: 'flex',
    alignItems: 'center',
    gap: 2,
    paddingRight: 10,
    borderRight: '1px solid #222',
  },
  formStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    rowGap: 4,
    minWidth: 0,
    paddingLeft: 10,
    flexWrap: 'wrap',
  },
  fieldLabel: {
    color: '#BDBDBD',
    fontSize: 11,
    lineHeight: '14px',
  },
  center: {
    flex: 1,
    minHeight: 0,
    display: 'flex',
  },
  leftTracks: {
    width: leftPanelWidth,
    flexShrink: 0,
    background: '#303030',
    borderRight: '1px solid #151515',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  rightCurves: {
    width: rightPanelWidth,
    flexShrink: 0,
    background: '#303030',
    borderLeft: '1px solid #151515',
    display: 'flex',
    flexDirection: 'column',
  },
  timelineArea: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    background: '#1F1F1F',
    overflow: 'hidden',
  },
  ruler: {
    height: rulerHeight,
    flexShrink: 0,
    position: 'relative',
    borderBottom: '1px solid #111',
    cursor: 'pointer',
    overflow: 'hidden',
    background:
      'repeating-linear-gradient(to right, #3A3A3A 0, #3A3A3A 1px, transparent 1px, transparent 32px)',
  },
  frameGuide: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    background: '#2E2E2E',
    pointerEvents: 'none',
  },
  frameLabel: {
    position: 'absolute',
    top: 10,
    transform: 'translateX(-50%)',
    color: '#8E8E8E',
    fontSize: 12,
    pointerEvents: 'none',
  },
  playhead: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: 1,
    background: '#19DDEB',
    pointerEvents: 'none',
    zIndex: 4,
  },
  playheadHead: {
    position: 'absolute',
    top: 0,
    left: -5,
    width: 0,
    height: 0,
    borderLeft: '5px solid transparent',
    borderRight: '5px solid transparent',
    borderTop: '8px solid #19DDEB',
  },
  rows: {
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    position: 'relative',
  },
  trackHeaderSpacer: {
    height: rulerHeight,
    borderBottom: '1px solid #111',
    background: '#2C2C2C',
  },
  trackLabelsRows: {
    flex: 1,
    minHeight: 0,
    overflowX: 'hidden',
    overflowY: 'auto',
    scrollbarWidth: 'thin',
  },
  trackLabel: {
    height: rowHeight,
    borderBottom: '1px solid #171717',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
    padding: '0 8px',
    color: '#D5D5D5',
    fontSize: 12,
  },
  trackLabelSelected: {
    background: 'rgba(25, 221, 235, 0.11)',
    boxShadow: 'inset 3px 0 0 #19DDEB',
  },
  trackMainLabel: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '16px',
  },
  propertyName: {
    color: '#9A9A9A',
    fontSize: 11,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '14px',
  },
  propertyRowName: {
    color: '#D5D5D5',
    fontSize: 12,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: '16px',
  },
  mutedTrackTools: {
    width: 128,
    flexShrink: 0,
  },
  trackLane: {
    height: rowHeight,
    position: 'relative',
    borderBottom: '1px solid #171717',
    cursor: 'pointer',
    overflow: 'hidden',
    background:
      'repeating-linear-gradient(to right, #2C2C2C 0, #2C2C2C 1px, transparent 1px, transparent 64px)',
  },
  centerLine: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '50%',
    height: 1,
    background: '#0F0F0F',
  },
  trackGraphSvg: {
    position: 'absolute',
    left: timelineEdgeHitPadding,
    right: timelineEdgeHitPadding,
    top: 0,
    bottom: 0,
    width: `calc(100% - ${timelineEdgeHitPadding * 2}px)`,
    height: '100%',
    overflow: 'visible',
    pointerEvents: 'none',
    zIndex: 1,
  },
  trackGraphPath: {
    fill: 'none',
    strokeWidth: 1.7,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    opacity: 0.88,
    filter: 'drop-shadow(0 0 2px rgba(24,168,255,0.35))',
  },
  keyframe: {
    position: 'absolute',
    top: '50%',
    width: 10,
    height: 10,
    marginLeft: -5,
    marginTop: -5,
    transform: 'rotate(45deg)',
    borderRadius: 2,
    background: '#E9E9E9',
    border: '1px solid #111',
    boxSizing: 'border-box',
    zIndex: 3,
  },
  selectionBox: {
    position: 'absolute',
    border: '1px solid #19DDEB',
    background: 'rgba(25, 221, 235, 0.16)',
    pointerEvents: 'none',
    zIndex: 5,
  },
  marker: {
    position: 'absolute',
    top: 33,
    width: 8,
    height: 8,
    marginLeft: -4,
    transform: 'rotate(45deg)',
    background: '#FF8A3D',
    border: '1px solid #141414',
  },
  bottomBar: {
    height: 28,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    background: '#303030',
    borderTop: '1px solid #151515',
  },
  scrollRail: {
    height: 10,
    borderRadius: 8,
    margin: '0 16px',
    flex: 1,
    background: '#171717',
    border: '1px solid #666',
    position: 'relative',
    cursor: 'pointer',
  },
  scrollThumb: {
    position: 'absolute',
    top: 2,
    bottom: 2,
    borderRadius: 5,
    background: '#D8D8D8',
    cursor: 'grab',
  },
  curveHeader: {
    height: 40,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '0 8px',
    borderBottom: '1px solid #171717',
    background: '#383838',
    color: '#E3E3E3',
    fontSize: 12,
  },
  curveViewport: {
    margin: 8,
    flex: 1,
    minHeight: 0,
    borderRadius: 3,
    border: '1px solid #181818',
    background:
      'linear-gradient(to right, rgba(255,255,255,0.08) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.08) 1px, transparent 1px), #555',
    backgroundSize: '28px 28px',
    position: 'relative',
  },
  curveLine: {
    position: 'absolute',
    left: 24,
    right: 24,
    top: '45%',
    height: 2,
    background: '#3AC7F2',
    transform: 'skewY(-12deg)',
    boxShadow: '0 0 5px rgba(58,199,242,0.45)',
  },
  curveSvg: {
    position: 'absolute',
    inset: 0,
    width: '100%',
    height: '100%',
    overflow: 'visible',
  },
  curveHandleLine: {
    stroke: '#8DEBFF',
    strokeWidth: 1,
    opacity: 0.75,
  },
  curveHandle: {
    fill: '#FFCF4A',
    stroke: '#111',
    strokeWidth: 1,
    cursor: 'grab',
  },
  curveHint: {
    position: 'absolute',
    left: 8,
    right: 8,
    bottom: 6,
    color: '#C7C7C7',
    fontSize: 11,
    textAlign: 'center',
    pointerEvents: 'none',
  },
  curveFooter: {
    display: 'flex',
    gap: 4,
    padding: 8,
    borderTop: '1px solid #171717',
  },
  compactButton: {
    minWidth: 34,
    height: 28,
    padding: '0 8px',
    color: '#E9E9E9',
    background: '#4B4B4B',
    border: '1px solid #202020',
  },
  toolbarIconButtonTooltipWrapper: {
    display: 'inline-flex',
  },
};

const ToolbarIconButton = ({
  title,
  onClick,
  children,
  color,
  disabled,
}: {|
  title: React.Node,
  onClick: () => void,
  children: React.Node,
  color?: string,
  disabled?: boolean,
|}) => {
  const button = (
    <IconButton
      size="small"
      onClick={onClick}
      disabled={disabled}
      style={{
        width: 26,
        height: 26,
        padding: 3,
        borderRadius: 3,
        background: '#555',
        border: '1px solid #222',
        color: disabled ? '#888' : color || '#F0F0F0',
      }}
    >
      {children}
    </IconButton>
  );

  return (
    <Tooltip title={title}>
      <span style={styles.toolbarIconButtonTooltipWrapper}>{button}</span>
    </Tooltip>
  );
};

export default function TimelineEditor({
  project,
  timelineIdOrName,
  setToolbar,
  unsavedChanges,
  objectsContainer,
  globalObjectsContainer,
  initialInstances,
  selectedInstances = [],
  onGetInstanceSize,
  onInstancesModified,
  onPreviewInstancesModified,
}: Props): React.Node {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const [playheadTime, setPlayheadTime] = React.useState(0);
  const [isPlayingPreview, setIsPlayingPreview] = React.useState(false);
  const [selectedPropertyTrackId, setSelectedPropertyTrackId] = React.useState(
    ''
  );
  const [selectedKeyframeIds, setSelectedKeyframeIds] = React.useState<
    Array<string>
  >([]);
  const [, setTimelineListRevision] = React.useState(0);
  const [
    observedSelectionSignature,
    setObservedSelectionSignature,
  ] = React.useState(() => getSelectedInstancesSignature(selectedInstances));
  const [
    observedInitialInstancesSignature,
    setObservedInitialInstancesSignature,
  ] = React.useState(() => getInitialInstancesSignature(initialInstances));
  const [newTimelineName, setNewTimelineName] = React.useState(() =>
    makeTimelineName(project, 'Timeline')
  );
  const [timeline, setTimeline] = React.useState<TimelineData>(() => {
    const existingTimeline =
      timelineIdOrName && getTimelineByIdOrName(project, timelineIdOrName);
    return (
      existingTimeline ||
      createDefaultTimeline(makeTimelineName(project, 'Timeline'))
    );
  });
  const [timelineZoom, setTimelineZoom] = React.useState(minTimelineZoom);
  const [viewStartFrame, setViewStartFrame] = React.useState(0);
  const [isPanningTimeline, setIsPanningTimeline] = React.useState(false);
  const [isScrubbingTimeline, setIsScrubbingTimeline] = React.useState(false);
  const [isDraggingScrollThumb, setIsDraggingScrollThumb] = React.useState(
    false
  );
  const [isSelectingKeyframes, setIsSelectingKeyframes] = React.useState(false);
  const [isDraggingKeyframes, setIsDraggingKeyframes] = React.useState(false);
  const [draggingCurveHandle, setDraggingCurveHandle] = React.useState<?(
    | 'in'
    | 'out'
  )>(null);
  const [selectionBox, setSelectionBox] = React.useState<?{|
    propertyTrackId?: string,
    isMultiTrack?: boolean,
    left: number,
    top: number,
    width: number,
    height: number,
    keyframeIds?: Array<string>,
  |}>(null);
  const timelineRootRef = React.useRef<?HTMLDivElement>(null);
  const timelineAreaRef = React.useRef<?HTMLDivElement>(null);
  const curveViewportRef = React.useRef<?HTMLDivElement>(null);
  const leftTrackRowsRef = React.useRef<?HTMLDivElement>(null);
  const timelineRowsRef = React.useRef<?HTMLDivElement>(null);
  const scrollRailRef = React.useRef<?HTMLDivElement>(null);
  const scrubStateRef = React.useRef<?{|
    element: HTMLDivElement,
    propertyTrackId?: string,
  |}>(null);
  const panStateRef = React.useRef<?{|
    startClientX: number,
    startFrame: number,
    visibleFrames: number,
    width: number,
  |}>(null);
  const scrollThumbDragStateRef = React.useRef<?{|
    startClientX: number,
    startFrame: number,
    railWidth: number,
  |}>(null);
  const marqueeSelectionStateRef = React.useRef<?{|
    startClientX: number,
    startClientY: number,
    element: HTMLDivElement,
    propertyTrackId: string,
    additive: boolean,
    baseSelectedKeyframeIds: Array<string>,
    hasMoved: boolean,
    multiTrack: boolean,
  |}>(null);
  const keyframeDragStateRef = React.useRef<?any>(null);
  const suppressedAutoImportUuidsRef = React.useRef<Set<string>>(new Set());
  const lastAppliedPreviewValuesRef = React.useRef<Map<string, string>>(
    new Map()
  );
  const firstFrameAutoRecordSnapshotRef = React.useRef<Map<string, string>>(
    new Map()
  );
  const scaleBaseDimensionsRef = React.useRef<
    Map<string, TimelineScaleBaseDimensions>
  >(new Map());
  const keyframeClipboardRef = React.useRef<?TimelineKeyframeClipboard>(null);
  const initialInstancesIndex = React.useMemo(
    () => getInitialInstancesIndex(initialInstances),
    // Rebuild the index when the mutable GDevelop container content changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [initialInstances, observedInitialInstancesSignature]
  );
  const notifyPreviewInstancesModified =
    onPreviewInstancesModified || onInstancesModified;
  const playheadTimeRef = React.useRef(playheadTime);
  const timelineRef = React.useRef(timeline);
  const timelineViewportMetricsRef = React.useRef<{|
    safeViewStartFrame: number,
    visibleFrames: number,
    maxViewStartFrame: number,
  |}>({
    safeViewStartFrame: 0,
    visibleFrames: 1,
    maxViewStartFrame: 0,
  });
  const initialInstancesIndexRef = React.useRef<InitialInstancesIndex>(
    initialInstancesIndex
  );
  const notifyPreviewInstancesModifiedRef = React.useRef(
    notifyPreviewInstancesModified
  );
  const onGetInstanceSizeRef = React.useRef(onGetInstanceSize || null);
  const selectedKeyframeIdsSet = React.useMemo(
    () => new Set(selectedKeyframeIds),
    [selectedKeyframeIds]
  );
  const selectedInstanceIds = React.useMemo(
    () => {
      const instanceIds = new Set<string>();
      for (const instance of selectedInstances) {
        instanceIds.add(getInstanceIdentity(instance));
      }
      return instanceIds;
    },
    // The editor selection can mutate in place, so the observed signature is
    // used to force this memo to refresh when the visible selection changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedInstances, observedSelectionSignature]
  );
  const visibleTimelineTracks = React.useMemo(
    () => {
      if (!selectedInstanceIds.size) {
        return timeline.tracks;
      }

      return timeline.tracks.filter(track => {
        const trackInstances = findInitialInstancesForTrack(
          track,
          initialInstancesIndex
        );
        if (trackInstances.length) {
          return trackInstances.some(instance =>
            selectedInstanceIds.has(getInstanceIdentity(instance))
          );
        }

        return selectedInstances.some(instance =>
          doesTrackTargetInstance(track, instance)
        );
      });
    },
    [
      initialInstancesIndex,
      selectedInstanceIds,
      selectedInstances,
      timeline.tracks,
    ]
  );
  const propertyTrackRows: Array<{|
    track: TimelineTrack,
    propertyTrack: TimelinePropertyTrack,
    propertyTrackIndex: number,
  |}> = React.useMemo(
    () => {
      const rows = [];
      visibleTimelineTracks.forEach(track => {
        track.propertyTracks.forEach((propertyTrack, propertyTrackIndex) => {
          rows.push({ track, propertyTrack, propertyTrackIndex });
        });
      });
      return rows;
    },
    [visibleTimelineTracks]
  );
  const updateTimelinePlayheadDom = React.useCallback((time: number) => {
    const root = timelineRootRef.current;
    if (!root) return;

    const {
      safeViewStartFrame,
      visibleFrames,
    } = timelineViewportMetricsRef.current;
    root.style.setProperty(
      '--timeline-playhead-left',
      getFrameLeftCss(timeToFrame(time), safeViewStartFrame, visibleFrames)
    );
  }, []);

  React.useEffect(
    () => {
      setToolbar(null);
      return () => setToolbar(null);
    },
    [setToolbar]
  );

  React.useEffect(
    () => {
      const visiblePropertyTrackIds = new Set(
        propertyTrackRows.map(row => row.propertyTrack.id)
      );
      if (
        selectedPropertyTrackId &&
        visiblePropertyTrackIds.has(selectedPropertyTrackId)
      ) {
        return;
      }

      const nextPropertyTrackId = propertyTrackRows.length
        ? propertyTrackRows[0].propertyTrack.id
        : '';
      if (selectedPropertyTrackId !== nextPropertyTrackId) {
        setSelectedPropertyTrackId(nextPropertyTrackId);
      }
      if (selectedKeyframeIds.length) {
        setSelectedKeyframeIds([]);
      }
      if (selectionBox) {
        setSelectionBox(null);
      }
    },
    [
      propertyTrackRows,
      selectedKeyframeIds.length,
      selectedPropertyTrackId,
      selectionBox,
    ]
  );

  React.useEffect(
    () => {
      const updateObservedSelectionSignature = () => {
        const nextSelectionSignature = getSelectedInstancesSignature(
          selectedInstances
        );
        setObservedSelectionSignature(previousSelectionSignature =>
          previousSelectionSignature === nextSelectionSignature
            ? previousSelectionSignature
            : nextSelectionSignature
        );
      };

      updateObservedSelectionSignature();
      const intervalId = setInterval(updateObservedSelectionSignature, 150);
      return () => clearInterval(intervalId);
    },
    [selectedInstances]
  );

  React.useEffect(
    () => {
      const updateObservedInitialInstancesSignature = () => {
        const nextInitialInstancesSignature = getInitialInstancesSignature(
          initialInstances
        );
        setObservedInitialInstancesSignature(previousSignature =>
          previousSignature === nextInitialInstancesSignature
            ? previousSignature
            : nextInitialInstancesSignature
        );
      };

      updateObservedInitialInstancesSignature();
      const intervalId = setInterval(
        updateObservedInitialInstancesSignature,
        200
      );
      return () => clearInterval(intervalId);
    },
    [initialInstances]
  );

  React.useEffect(
    () => {
      const existingTimeline =
        timelineIdOrName && getTimelineByIdOrName(project, timelineIdOrName);
      if (existingTimeline) {
        timelineRef.current = existingTimeline;
        setTimeline(existingTimeline);
        setPlayheadTime(time => {
          const nextTime = clamp(time, 0, existingTimeline.duration);
          playheadTimeRef.current = nextTime;
          return nextTime;
        });
      }
    },
    [project, timelineIdOrName]
  );

  React.useEffect(
    () => {
      suppressedAutoImportUuidsRef.current.clear();
      lastAppliedPreviewValuesRef.current.clear();
    },
    [timeline.id]
  );

  React.useEffect(
    () => {
      if (!isPlayingPreview) {
        playheadTimeRef.current = playheadTime;
      }
    },
    [isPlayingPreview, playheadTime]
  );

  React.useEffect(
    () => {
      timelineRef.current = timeline;
    },
    [timeline]
  );

  React.useEffect(
    () => {
      initialInstancesIndexRef.current = initialInstancesIndex;
      scaleBaseDimensionsRef.current.clear();
      lastAppliedPreviewValuesRef.current.clear();
    },
    [initialInstancesIndex]
  );

  React.useEffect(
    () => {
      notifyPreviewInstancesModifiedRef.current = notifyPreviewInstancesModified;
    },
    [notifyPreviewInstancesModified]
  );

  React.useEffect(
    () => {
      onGetInstanceSizeRef.current = onGetInstanceSize || null;
    },
    [onGetInstanceSize]
  );

  const applyTimelinePreviewAtTime = React.useCallback(
    (time: number, checkCurrentValue?: boolean = false) => {
      const notifyPreviewInstancesModified =
        notifyPreviewInstancesModifiedRef.current;
      const onGetInstanceSize = onGetInstanceSizeRef.current;
      const timeline = timelineRef.current;
      const initialInstancesIndex = initialInstancesIndexRef.current;
      if (!(timeline.tracks || []).length) return;

      const modifiedInstances = new Set<gdInitialInstance>();
      for (const track of timeline.tracks || []) {
        const instances = findInitialInstancesForTrack(
          track,
          initialInstancesIndex
        );
        if (!instances.length) continue;
        const trackObjectType =
          getTrackObjectType(
            project,
            objectsContainer,
            globalObjectsContainer,
            track
          ) ||
          getObjectTypeByName(
            project,
            objectsContainer,
            globalObjectsContainer,
            instances[0].getObjectName()
          );

        for (const propertyTrack of track.propertyTracks || []) {
          const value = interpolateTimelineValue(propertyTrack, time);
          if (value === null) continue;

          for (const instance of instances) {
            let scaleBaseDimensions = null;
            if (isTimelineScaleProperty(propertyTrack.property)) {
              const scaleBaseDimensionsKey = getScaleBaseDimensionsKey(
                instance,
                trackObjectType
              );
              scaleBaseDimensions = scaleBaseDimensionsRef.current.get(
                scaleBaseDimensionsKey
              );
              if (!scaleBaseDimensions) {
                scaleBaseDimensions = getInstanceTimelineScaleBaseDimensions(
                  instance,
                  onGetInstanceSize,
                  trackObjectType
                );
                scaleBaseDimensionsRef.current.set(
                  scaleBaseDimensionsKey,
                  scaleBaseDimensions
                );
              }
            }

            const normalizedValue = normalizeValueForInitialInstance(
              instance,
              propertyTrack.property,
              value,
              onGetInstanceSize,
              trackObjectType
            );
            const previewValueKey = `${getInstanceIdentity(instance)}:${
              propertyTrack.property
            }`;
            const previewValueIdentity = getTimelineValueIdentity(
              normalizedValue
            );
            if (
              lastAppliedPreviewValuesRef.current.get(previewValueKey) ===
              previewValueIdentity
            ) {
              if (!checkCurrentValue) {
                continue;
              }
              const currentValueIdentity = getCurrentTimelineValueIdentity(
                instance,
                propertyTrack.property,
                onGetInstanceSize,
                trackObjectType
              );
              if (currentValueIdentity === previewValueIdentity) {
                continue;
              }
            }

            applyValueToInitialInstance(
              instance,
              propertyTrack.property,
              normalizedValue,
              onGetInstanceSize,
              trackObjectType,
              scaleBaseDimensions
            );
            lastAppliedPreviewValuesRef.current.set(
              previewValueKey,
              previewValueIdentity
            );
            modifiedInstances.add(instance);
          }
        }
      }

      if (modifiedInstances.size) {
        if (notifyPreviewInstancesModified) {
          notifyPreviewInstancesModified(Array.from(modifiedInstances));
        }
      }
    },
    [globalObjectsContainer, objectsContainer, project]
  );

  React.useEffect(
    () => {
      if (!timelineIdOrName) {
        upsertTimeline(project, timeline);
        setTimelineListRevision(revision => revision + 1);
      }
    },
    // Run once when opening a fallback editor without a project-tree item.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  React.useEffect(
    () => {
      if (!isPlayingPreview) {
        return;
      }

      let frameId;
      let lastFrameTime = null;
      let lastStateSyncTime = 0;
      const tick = frameTime => {
        const currentTimeline = timelineRef.current;
        const duration = Math.max(0, currentTimeline.duration || 0);
        const speed = currentTimeline.speed || 1;
        const deltaTime =
          lastFrameTime === null
            ? 1 / frameRate
            : Math.min((frameTime - lastFrameTime) / 1000, 0.1) * speed;
        lastFrameTime = frameTime;

        let nextTime = playheadTimeRef.current + deltaTime;
        let shouldStop = false;
        if (duration <= 0) {
          nextTime = 0;
          shouldStop = true;
        } else if (nextTime >= duration) {
          if (currentTimeline.loop) {
            nextTime = nextTime % duration;
          } else {
            nextTime = duration;
            shouldStop = true;
          }
        } else if (nextTime < 0) {
          nextTime = 0;
          shouldStop = true;
        }

        playheadTimeRef.current = nextTime;
        applyTimelinePreviewAtTime(nextTime);
        updateTimelinePlayheadDom(nextTime);

        const nextFrame = timeToFrame(nextTime);
        const viewportMetrics = timelineViewportMetricsRef.current;
        if (
          nextFrame < viewportMetrics.safeViewStartFrame ||
          nextFrame >
            viewportMetrics.safeViewStartFrame + viewportMetrics.visibleFrames
        ) {
          const nextViewStartFrame = clamp(
            nextFrame - viewportMetrics.visibleFrames * 0.5,
            0,
            viewportMetrics.maxViewStartFrame
          );
          timelineViewportMetricsRef.current = {
            ...viewportMetrics,
            safeViewStartFrame: nextViewStartFrame,
          };
          setViewStartFrame(nextViewStartFrame);
          updateTimelinePlayheadDom(nextTime);
        }

        if (
          shouldStop ||
          frameTime - lastStateSyncTime >= timelinePlaybackStateSyncIntervalMs
        ) {
          lastStateSyncTime = frameTime;
          setPlayheadTime(nextTime);
        }

        if (shouldStop) {
          setIsPlayingPreview(false);
          return;
        }

        frameId = requestAnimationFrame(tick);
      };

      frameId = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(frameId);
    },
    [applyTimelinePreviewAtTime, isPlayingPreview, updateTimelinePlayheadDom]
  );

  React.useEffect(
    () => {
      if (isPlayingPreview) return;
      const currentTime = playheadTimeRef.current;
      if (currentTime !== playheadTime) {
        setPlayheadTime(currentTime);
        return;
      }
      applyTimelinePreviewAtTime(currentTime, true);
    },
    [applyTimelinePreviewAtTime, isPlayingPreview, playheadTime]
  );

  const saveTimeline = React.useCallback(
    (nextTimeline: TimelineData) => {
      timelineRef.current = nextTimeline;
      setTimeline(nextTimeline);
      upsertTimeline(project, nextTimeline);
      setTimelineListRevision(revision => revision + 1);
      if (unsavedChanges) {
        unsavedChanges.triggerUnsavedChanges();
      }
    },
    [project, unsavedChanges]
  );

  const setTimelinePlayheadTime = React.useCallback(
    (nextTimeOrUpdater: number | (number => number)) => {
      setPlayheadTime(currentTime => {
        const rawNextTime =
          typeof nextTimeOrUpdater === 'function'
            ? nextTimeOrUpdater(currentTime)
            : nextTimeOrUpdater;
        const duration = Math.max(0, timelineRef.current.duration || 0);
        const nextTime = clamp(rawNextTime, 0, duration);
        playheadTimeRef.current = nextTime;
        return nextTime;
      });
    },
    []
  );

  const startTimelinePreview = React.useCallback(
    () => {
      const currentTimeline = timelineRef.current;
      const duration = Math.max(0, currentTimeline.duration || 0);
      if (duration <= 0) {
        setTimelinePlayheadTime(0);
        setIsPlayingPreview(false);
        return;
      }

      setTimelinePlayheadTime(time =>
        time >= duration || time < 0 ? 0 : clamp(time, 0, duration)
      );
      setIsPlayingPreview(true);
    },
    [setTimelinePlayheadTime]
  );

  const updateTimeline = React.useCallback(
    (changes: $Shape<TimelineData>) => {
      const nextTimeline = {
        ...timeline,
        ...changes,
      };
      saveTimeline(nextTimeline);
    },
    [saveTimeline, timeline]
  );

  const timelineChoices = getTimelines(project);

  const objectNames = React.useMemo(
    () => getObjectNames(project, objectsContainer, globalObjectsContainer),
    [project, objectsContainer, globalObjectsContainer]
  );

  const createTimeline = React.useCallback(
    () => {
      const timelineName = makeTimelineName(
        project,
        newTimelineName.trim() || 'Timeline'
      );
      const nextTimeline = {
        ...createDefaultTimeline(timelineName),
        id: createTimelineId(),
      };
      timelineRef.current = nextTimeline;
      playheadTimeRef.current = 0;
      setTimeline(nextTimeline);
      setTimelinePlayheadTime(0);
      setSelectedPropertyTrackId('');
      setSelectedKeyframeIds([]);
      upsertTimeline(project, nextTimeline);
      setTimelineListRevision(revision => revision + 1);
      setNewTimelineName(makeTimelineName(project, 'Timeline'));
      if (unsavedChanges) {
        unsavedChanges.triggerUnsavedChanges();
      }
    },
    [newTimelineName, project, setTimelinePlayheadTime, unsavedChanges]
  );

  const selectTimeline = React.useCallback(
    (timelineId: string) => {
      const selectedTimeline = getTimelineByIdOrName(project, timelineId);
      if (!selectedTimeline) return;

      timelineRef.current = selectedTimeline;
      setTimeline(selectedTimeline);
      setTimelinePlayheadTime(time =>
        clamp(time, 0, selectedTimeline.duration)
      );
      setSelectedPropertyTrackId('');
      setSelectedKeyframeIds([]);
    },
    [project, setTimelinePlayheadTime]
  );

  const writeKeyframesAtPlayhead = React.useCallback(
    (writeMode: 'selected' | 'all' | 'changed'): boolean => {
      const currentTimeline = timelineRef.current;
      let workingTracks = currentTimeline.tracks;
      const uniqueSelectedInstancesById = new Map<string, gdInitialInstance>();
      for (const instance of selectedInstances) {
        uniqueSelectedInstancesById.set(
          getInstanceIdentity(instance),
          instance
        );
      }

      const selectedInstance =
        Array.from(uniqueSelectedInstancesById.values())[0] || null;
      const selectedPropertyOwnerTrack = workingTracks.find(track =>
        track.propertyTracks.some(
          propertyTrack => propertyTrack.id === selectedPropertyTrackId
        )
      );
      const selectedPropertyNameForWrite = selectedPropertyOwnerTrack
        ? (
            selectedPropertyOwnerTrack.propertyTracks.find(
              propertyTrack => propertyTrack.id === selectedPropertyTrackId
            ) || selectedPropertyOwnerTrack.propertyTracks[0]
          ).property
        : null;
      let selectedTrack: ?TimelineTrack =
        selectedPropertyOwnerTrack || workingTracks[0] || null;
      let targetInitialInstance: ?gdInitialInstance = null;
      let createdTrackForSelectedInstance = false;

      if (selectedInstance) {
        targetInitialInstance = selectedInstance;
        let trackForSelectedInstance = findTrackForInstance(
          workingTracks,
          selectedInstance
        );
        if (!trackForSelectedInstance) {
          trackForSelectedInstance = createTrackForInstance(
            selectedInstance,
            getObjectTypeByName(
              project,
              objectsContainer,
              globalObjectsContainer,
              selectedInstance.getObjectName()
            ),
            onGetInstanceSize
          );
          workingTracks = [...workingTracks, trackForSelectedInstance];
          createdTrackForSelectedInstance = true;
        }
        selectedTrack =
          selectedPropertyOwnerTrack &&
          doesTrackTargetInstance(selectedPropertyOwnerTrack, selectedInstance)
            ? selectedPropertyOwnerTrack
            : trackForSelectedInstance;
      }

      if (!selectedTrack || !selectedTrack.propertyTracks.length) return false;

      if (!targetInitialInstance) {
        targetInitialInstance =
          findInitialInstancesForTrack(
            selectedTrack,
            initialInstancesIndex
          )[0] || null;
      }

      const targetObjectType = targetInitialInstance
        ? getObjectTypeByName(
            project,
            objectsContainer,
            globalObjectsContainer,
            targetInitialInstance.getObjectName()
          ) ||
          getTrackObjectType(
            project,
            objectsContainer,
            globalObjectsContainer,
            selectedTrack
          )
        : getTrackObjectType(
            project,
            objectsContainer,
            globalObjectsContainer,
            selectedTrack
          );

      if (targetInitialInstance) {
        const ensuredTrackUpdate = ensureSupportedPropertyTracks(
          selectedTrack,
          targetInitialInstance,
          targetObjectType,
          onGetInstanceSize
        );
        if (ensuredTrackUpdate.changed) {
          const ensuredTrackId = ensuredTrackUpdate.track.id;
          selectedTrack = ensuredTrackUpdate.track;
          workingTracks = workingTracks.map(track =>
            track.id === ensuredTrackId ? ensuredTrackUpdate.track : track
          );
        }
      }

      const selectedTrackForWrite = selectedTrack;
      if (!selectedTrackForWrite.propertyTracks.length) return false;

      const selectedPropertyTrack = selectedTrackForWrite.propertyTracks.find(
        propertyTrack => propertyTrack.id === selectedPropertyTrackId
      );
      const selectedPropertyByName = selectedPropertyNameForWrite
        ? selectedTrackForWrite.propertyTracks.find(
            propertyTrack =>
              propertyTrack.property === selectedPropertyNameForWrite
          )
        : null;
      const targetPropertyTrack =
        selectedPropertyTrack ||
        selectedPropertyByName ||
        selectedTrackForWrite.propertyTracks[0];
      if (!targetPropertyTrack) return false;

      const keyframeTime = clamp(
        snapTimeToTimelineFrame(playheadTimeRef.current),
        0,
        currentTimeline.duration
      );

      const getReferenceValue = (
        propertyTrack: TimelinePropertyTrack
      ): number | {| x: number, y: number |} => {
        const interpolatedTimelineValue = interpolateTimelineValue(
          propertyTrack,
          keyframeTime
        );
        return interpolatedTimelineValue !== null
          ? interpolatedTimelineValue
          : getKeyframeValueAtTime(propertyTrack, keyframeTime);
      };

      const getCurrentValue = (
        propertyTrack: TimelinePropertyTrack
      ): number | {| x: number, y: number |} => {
        const fallbackValue = getReferenceValue(propertyTrack);
        const currentInstanceValue = targetInitialInstance
          ? getPropertyValueFromInitialInstance(
              targetInitialInstance,
              propertyTrack.property,
              onGetInstanceSize,
              targetObjectType
            )
          : null;
        const rawValue =
          currentInstanceValue !== null ? currentInstanceValue : fallbackValue;
        return targetInitialInstance
          ? normalizeValueForInitialInstance(
              targetInitialInstance,
              propertyTrack.property,
              rawValue,
              onGetInstanceSize,
              targetObjectType
            )
          : rawValue;
      };

      const propertyTracksToWrite =
        writeMode === 'selected'
          ? [targetPropertyTrack]
          : writeMode === 'changed'
          ? createdTrackForSelectedInstance
            ? selectedTrackForWrite.propertyTracks
            : targetInitialInstance
            ? selectedTrackForWrite.propertyTracks.filter(propertyTrack => {
                const currentValue = getCurrentValue(propertyTrack);
                const referenceValue = getReferenceValue(propertyTrack);
                return (
                  getTimelineValueIdentity(currentValue) !==
                  getTimelineValueIdentity(referenceValue)
                );
              })
            : []
          : selectedTrackForWrite.propertyTracks;

      if (!propertyTracksToWrite.length) return false;

      const propertyTracksToWriteIds = new Set(
        propertyTracksToWrite.map(propertyTrack => propertyTrack.id)
      );
      const nextSelectedKeyframeIds = [];
      let firstWrittenPropertyTrackId = propertyTracksToWrite[0].id;

      const nextTimeline = {
        ...currentTimeline,
        tracks: workingTracks.map(track =>
          track.id === selectedTrackForWrite.id
            ? {
                ...track,
                propertyTracks: track.propertyTracks.map(propertyTrack =>
                  propertyTracksToWriteIds.has(propertyTrack.id)
                    ? (() => {
                        const isDiscreteKeyframe = isDiscreteTimelineProperty(
                          propertyTrack.property
                        );
                        const newKeyframe: TimelineKeyframe = {
                          id: createKeyframeId(),
                          time: keyframeTime,
                          value: getCurrentValue(propertyTrack),
                          ease: isDiscreteKeyframe ? 'hold' : 'linear',
                          curve: isDiscreteKeyframe ? 'stepped' : 'linear',
                        };
                        const upsertResult = upsertPropertyTrackKeyframe(
                          propertyTrack,
                          newKeyframe
                        );
                        nextSelectedKeyframeIds.push(upsertResult.keyframeId);
                        if (!firstWrittenPropertyTrackId) {
                          firstWrittenPropertyTrackId = propertyTrack.id;
                        }
                        return upsertResult.propertyTrack;
                      })()
                    : propertyTrack
                ),
              }
            : track
        ),
      };

      saveTimeline(nextTimeline);
      setSelectedPropertyTrackId(firstWrittenPropertyTrackId);
      setSelectionBox(null);
      setSelectedKeyframeIds(Array.from(new Set(nextSelectedKeyframeIds)));
      applyTimelinePreviewAtTime(keyframeTime, true);
      return true;
    },
    [
      applyTimelinePreviewAtTime,
      globalObjectsContainer,
      initialInstancesIndex,
      objectsContainer,
      project,
      saveTimeline,
      onGetInstanceSize,
      selectedPropertyTrackId,
      selectedInstances,
    ]
  );

  const addKeyframeAtPlayhead = React.useCallback(
    () => {
      writeKeyframesAtPlayhead('selected');
    },
    [writeKeyframesAtPlayhead]
  );

  const addAllTrackKeyframesAtPlayhead = React.useCallback(
    () => {
      writeKeyframesAtPlayhead('all');
    },
    [writeKeyframesAtPlayhead]
  );

  const addChangedTrackKeyframesAtPlayhead = React.useCallback(
    () => {
      writeKeyframesAtPlayhead('changed');
    },
    [writeKeyframesAtPlayhead]
  );

  const deleteSelectedKeyframe = React.useCallback(
    () => {
      if (!selectedKeyframeIds.length) return;

      const selectedKeyframes = new Set(selectedKeyframeIds);
      const nextTimeline = {
        ...timeline,
        tracks: timeline.tracks.map(track => ({
          ...track,
          propertyTracks: track.propertyTracks.map(propertyTrack => ({
            ...propertyTrack,
            keyframes: propertyTrack.keyframes.filter(
              keyframe => !selectedKeyframes.has(keyframe.id)
            ),
          })),
        })),
      };
      setSelectedKeyframeIds([]);
      setSelectionBox(null);
      saveTimeline(nextTimeline);
    },
    [saveTimeline, selectedKeyframeIds, timeline]
  );

  const copySelectedKeyframes = React.useCallback(
    (): boolean => {
      if (!selectedKeyframeIds.length) return false;

      const selectedKeyframes = new Set(selectedKeyframeIds);
      const copiedItems = [];
      let firstCopiedTime = Infinity;
      timeline.tracks.forEach(track => {
        track.propertyTracks.forEach(propertyTrack => {
          getSamplingTimelineKeyframes(propertyTrack).forEach(keyframe => {
            if (!selectedKeyframes.has(keyframe.id)) return;

            firstCopiedTime = Math.min(firstCopiedTime, keyframe.time);
            copiedItems.push({
              propertyTrackId: propertyTrack.id,
              property: propertyTrack.property,
              time: keyframe.time,
              value: cloneTimelineValue(keyframe.value),
              ease: keyframe.ease,
              curve: keyframe.curve,
            });
          });
        });
      });

      if (!copiedItems.length || firstCopiedTime === Infinity) return false;

      keyframeClipboardRef.current = {
        items: copiedItems.map(item => ({
          propertyTrackId: item.propertyTrackId,
          property: item.property,
          timeOffset: snapTimeToTimelineFrame(item.time - firstCopiedTime),
          value: cloneTimelineValue(item.value),
          ease: item.ease,
          curve: item.curve,
        })),
      };
      return true;
    },
    [selectedKeyframeIds, timeline.tracks]
  );

  const pasteKeyframesAtPlayhead = React.useCallback(
    (): boolean => {
      const clipboard = keyframeClipboardRef.current;
      if (!clipboard || !clipboard.items.length) return false;

      const currentTimeline = timelineRef.current;
      const pasteStartTime = clamp(
        snapTimeToTimelineFrame(playheadTimeRef.current),
        0,
        currentTimeline.duration
      );
      const pastedKeyframeIds = [];
      let didPaste = false;
      const nextTimeline = {
        ...currentTimeline,
        tracks: currentTimeline.tracks.map(track => ({
          ...track,
          propertyTracks: track.propertyTracks.map(propertyTrack => {
            let nextPropertyTrack = propertyTrack;
            for (const item of clipboard.items) {
              if (item.propertyTrackId !== propertyTrack.id) continue;

              const upsertResult = upsertPropertyTrackKeyframe(
                nextPropertyTrack,
                {
                  id: createKeyframeId(),
                  time: clamp(
                    pasteStartTime + item.timeOffset,
                    0,
                    currentTimeline.duration
                  ),
                  value: cloneTimelineValue(item.value),
                  ease: item.ease,
                  curve: item.curve,
                }
              );
              nextPropertyTrack = upsertResult.propertyTrack;
              pastedKeyframeIds.push(upsertResult.keyframeId);
              didPaste = true;
            }
            return nextPropertyTrack;
          }),
        })),
      };

      if (!didPaste) return false;

      saveTimeline(nextTimeline);
      setSelectedKeyframeIds(Array.from(new Set(pastedKeyframeIds)));
      setSelectionBox(null);
      applyTimelinePreviewAtTime(playheadTimeRef.current, true);
      return true;
    },
    [applyTimelinePreviewAtTime, saveTimeline]
  );

  const cutSelectedKeyframes = React.useCallback(
    (): boolean => {
      if (!copySelectedKeyframes()) return false;

      deleteSelectedKeyframe();
      return true;
    },
    [copySelectedKeyframes, deleteSelectedKeyframe]
  );

  React.useEffect(
    () => {
      const onKeyDown = (event: any) => {
        if (isTextInputElement(event.target)) return;

        const key = String(event.key || '').toLowerCase();
        const hasPrimaryModifier = event.ctrlKey || event.metaKey;
        if (hasPrimaryModifier && key === 'c') {
          if (copySelectedKeyframes()) {
            event.preventDefault();
          }
          return;
        }

        if (hasPrimaryModifier && key === 'v') {
          if (pasteKeyframesAtPlayhead()) {
            event.preventDefault();
          }
          return;
        }

        if (hasPrimaryModifier && key === 'x') {
          if (cutSelectedKeyframes()) {
            event.preventDefault();
          }
          return;
        }

        if (
          !hasPrimaryModifier &&
          !event.altKey &&
          (key === 'delete' || key === 'backspace')
        ) {
          if (selectedKeyframeIds.length) {
            event.preventDefault();
            deleteSelectedKeyframe();
          }
          return;
        }

        if (
          !hasPrimaryModifier &&
          !event.altKey &&
          (key === 'k' || key === 's')
        ) {
          event.preventDefault();
          addKeyframeAtPlayhead();
          return;
        }

        if (!hasPrimaryModifier && !event.altKey && key === 'n') {
          event.preventDefault();
          addAllTrackKeyframesAtPlayhead();
          return;
        }

        if (!hasPrimaryModifier && !event.altKey && key === 'm') {
          event.preventDefault();
          addChangedTrackKeyframesAtPlayhead();
        }
      };

      window.addEventListener('keydown', onKeyDown);
      return () => window.removeEventListener('keydown', onKeyDown);
    },
    [
      addAllTrackKeyframesAtPlayhead,
      addChangedTrackKeyframesAtPlayhead,
      addKeyframeAtPlayhead,
      copySelectedKeyframes,
      cutSelectedKeyframes,
      deleteSelectedKeyframe,
      pasteKeyframesAtPlayhead,
      selectedKeyframeIds.length,
    ]
  );

  const updateTrackTarget = React.useCallback(
    (trackId: string, objectName: string) => {
      const objectType = getObjectTypeByName(
        project,
        objectsContainer,
        globalObjectsContainer,
        objectName
      );
      const firstInstance = (initialInstancesIndex.byObjectName.get(
        objectName
      ) || [])[0];

      saveTimeline({
        ...timeline,
        tracks: timeline.tracks.map(track =>
          track.id === trackId
            ? {
                ...track,
                target: {
                  mode: 'objectName',
                  objectName,
                  selection: 'first',
                },
                propertyTracks: createPropertyTracksForObject(
                  objectType,
                  firstInstance,
                  track.propertyTracks,
                  onGetInstanceSize
                ),
              }
            : track
        ),
      });
      setSelectedPropertyTrackId('');
      setSelectedKeyframeIds([]);
    },
    [
      globalObjectsContainer,
      initialInstancesIndex,
      objectsContainer,
      onGetInstanceSize,
      project,
      saveTimeline,
      timeline,
    ]
  );

  const deleteTrack = React.useCallback(
    (trackId: string) => {
      const trackToDelete = timeline.tracks.find(track => track.id === trackId);
      if (!trackToDelete) return;

      const deletedPropertyTrackIds = new Set(
        trackToDelete.propertyTracks.map(propertyTrack => propertyTrack.id)
      );
      const deletedKeyframeIds = new Set<string>();
      trackToDelete.propertyTracks.forEach(propertyTrack => {
        propertyTrack.keyframes.forEach(keyframe => {
          deletedKeyframeIds.add(keyframe.id);
        });
      });
      if (trackToDelete.target.instancePersistentUuid) {
        suppressedAutoImportUuidsRef.current.add(
          trackToDelete.target.instancePersistentUuid
        );
      }
      if (deletedPropertyTrackIds.has(selectedPropertyTrackId)) {
        setSelectedPropertyTrackId('');
      }
      setSelectedKeyframeIds(keyframeIds =>
        keyframeIds.filter(keyframeId => !deletedKeyframeIds.has(keyframeId))
      );

      saveTimeline({
        ...timeline,
        tracks: timeline.tracks.filter(track => track.id !== trackId),
      });
    },
    [saveTimeline, selectedPropertyTrackId, timeline]
  );

  React.useEffect(
    () => {
      const uniqueSelectedInstancesByUuid = new Map<
        string,
        gdInitialInstance
      >();
      for (const instance of selectedInstances) {
        if (
          !isInitialInstanceAvailable(
            instance,
            initialInstancesIndex,
            !!initialInstances
          )
        ) {
          continue;
        }
        uniqueSelectedInstancesByUuid.set(
          getInstanceIdentity(instance),
          instance
        );
      }
      const uniqueSelectedInstances = Array.from(
        uniqueSelectedInstancesByUuid.values()
      );
      const selectedInstanceUuids = new Set(
        uniqueSelectedInstances.map(getInstanceIdentity)
      );
      suppressedAutoImportUuidsRef.current.forEach(uuid => {
        if (!selectedInstanceUuids.has(uuid)) {
          suppressedAutoImportUuidsRef.current.delete(uuid);
        }
      });

      const normalizedTracksUpdate = normalizeTimelineTracks(timeline.tracks);
      const propertyTrackIdReplacement = normalizedTracksUpdate.propertyTrackIdReplacements.get(
        selectedPropertyTrackId
      );
      if (propertyTrackIdReplacement) {
        setSelectedPropertyTrackId(propertyTrackIdReplacement);
      }
      let didNormalizeTracks = normalizedTracksUpdate.changed;
      const normalizedTracksWithoutMissingInstances = normalizedTracksUpdate.tracks.filter(
        track => {
          const shouldKeepTrack = !isTrackTargetMissingSceneInstance(
            track,
            initialInstancesIndex,
            !!initialInstances
          );
          if (!shouldKeepTrack) {
            didNormalizeTracks = true;
            if (track.target.instancePersistentUuid) {
              suppressedAutoImportUuidsRef.current.add(
                track.target.instancePersistentUuid
              );
            }
          }
          return shouldKeepTrack;
        }
      );
      const normalizedTracks = normalizedTracksWithoutMissingInstances.map(
        track => {
          const trackInstance = findInitialInstancesForTrack(
            track,
            initialInstancesIndex
          )[0];
          const supportedTrackUpdate = ensureSupportedPropertyTracks(
            track,
            trackInstance,
            getObjectTypeByName(
              project,
              objectsContainer,
              globalObjectsContainer,
              trackInstance
                ? trackInstance.getObjectName()
                : track.target.objectName
            ) ||
              getTrackObjectType(
                project,
                objectsContainer,
                globalObjectsContainer,
                track
              ),
            onGetInstanceSize
          );
          if (supportedTrackUpdate.changed) {
            didNormalizeTracks = true;
          }
          return supportedTrackUpdate.track;
        }
      );
      const keptPropertyTrackIds = new Set<string>();
      const keptKeyframeIds = new Set<string>();
      normalizedTracks.forEach(track => {
        track.propertyTracks.forEach(propertyTrack => {
          keptPropertyTrackIds.add(propertyTrack.id);
          keptKeyframeIds.add(getInitialKeyframeId(propertyTrack));
          propertyTrack.keyframes.forEach(keyframe => {
            keptKeyframeIds.add(keyframe.id);
          });
        });
      });
      if (
        selectedPropertyTrackId &&
        !keptPropertyTrackIds.has(selectedPropertyTrackId)
      ) {
        setSelectedPropertyTrackId('');
      }
      setSelectedKeyframeIds(keyframeIds =>
        keyframeIds.filter(keyframeId => keptKeyframeIds.has(keyframeId))
      );

      if (!uniqueSelectedInstances.length) {
        setSelectedPropertyTrackId('');
        setSelectedKeyframeIds([]);
        if (didNormalizeTracks) {
          saveTimeline({
            ...timeline,
            tracks: normalizedTracks,
          });
        }
        return;
      }

      const focusTrack = (track: ?TimelineTrack) => {
        if (!track || !track.propertyTracks.length) return;

        setSelectedPropertyTrackId(currentPropertyTrackId =>
          track.propertyTracks.some(
            propertyTrack => propertyTrack.id === currentPropertyTrackId
          )
            ? currentPropertyTrackId
            : track.propertyTracks[0].id
        );
      };

      let selectedTrack: ?TimelineTrack = null;
      for (const instance of uniqueSelectedInstances) {
        const track = findTrackForInstance(normalizedTracks, instance);
        if (track) {
          selectedTrack = track;
          break;
        }
      }

      const selectedInstancesToAdd = uniqueSelectedInstances.filter(
        instance => {
          const instanceIdentity = getInstanceIdentity(instance);
          return (
            !findTrackForInstance(normalizedTracks, instance) &&
            !suppressedAutoImportUuidsRef.current.has(instanceIdentity)
          );
        }
      );
      if (!selectedInstancesToAdd.length) {
        focusTrack(selectedTrack);
        if (didNormalizeTracks) {
          saveTimeline({
            ...timeline,
            tracks: normalizedTracks,
          });
        }
        return;
      }

      const tracksToAdd = selectedInstancesToAdd.map(instance =>
        createTrackForInstance(
          instance,
          getObjectTypeByName(
            project,
            objectsContainer,
            globalObjectsContainer,
            instance.getObjectName()
          ),
          onGetInstanceSize
        )
      );
      const tracks =
        normalizedTracks.length === 1 &&
        !normalizedTracks[0].target.objectName &&
        !normalizedTracks[0].target.instancePersistentUuid
          ? tracksToAdd
          : [...normalizedTracks, ...tracksToAdd];

      focusTrack(selectedTrack || tracksToAdd[0]);

      saveTimeline({
        ...timeline,
        tracks,
      });
    },
    [
      globalObjectsContainer,
      initialInstances,
      initialInstancesIndex,
      objectsContainer,
      observedSelectionSignature,
      onGetInstanceSize,
      project,
      saveTimeline,
      selectedInstances,
      selectedPropertyTrackId,
      timeline,
    ]
  );

  const frameCount = getTimelineFrameCount(timeline);
  const visibleFrames = Math.min(
    frameCount,
    Math.max(1, frameCount / timelineZoom)
  );
  const maxViewStartFrame = Math.max(0, frameCount - visibleFrames);
  const safeViewStartFrame = clamp(viewStartFrame, 0, maxViewStartFrame);
  const playheadFrame = timeToFrame(playheadTime);
  const playheadLeftCss = `var(--timeline-playhead-left, ${getFrameLeftCss(
    playheadFrame,
    safeViewStartFrame,
    visibleFrames
  )})`;
  React.useEffect(
    () => {
      timelineViewportMetricsRef.current = {
        safeViewStartFrame,
        visibleFrames,
        maxViewStartFrame,
      };
      updateTimelinePlayheadDom(playheadTimeRef.current);
    },
    [
      maxViewStartFrame,
      safeViewStartFrame,
      updateTimelinePlayheadDom,
      visibleFrames,
    ]
  );
  React.useEffect(
    () => {
      updateTimelinePlayheadDom(playheadTime);
    },
    [playheadTime, updateTimelinePlayheadDom]
  );
  const frameLabels = React.useMemo(
    () => {
      const labels = [];
      const labelStep = getFrameLabelStep(visibleFrames);
      const firstVisibleFrame = Math.max(
        0,
        Math.ceil(safeViewStartFrame / labelStep) * labelStep
      );
      const lastVisibleFrame = Math.min(
        frameCount,
        safeViewStartFrame + visibleFrames
      );

      for (
        let frame = firstVisibleFrame;
        frame <= lastVisibleFrame;
        frame += labelStep
      ) {
        labels.push(frame);
      }

      if (safeViewStartFrame === 0 && labels[0] !== 0) {
        labels.unshift(0);
      }

      return labels;
    },
    [frameCount, safeViewStartFrame, visibleFrames]
  );
  const selectedPropertyTrack =
    propertyTrackRows
      .map(row => row.propertyTrack)
      .find(propertyTrack => propertyTrack.id === selectedPropertyTrackId) ||
    (propertyTrackRows[0] && propertyTrackRows[0].propertyTrack);

  React.useEffect(
    () => {
      firstFrameAutoRecordSnapshotRef.current.clear();
    },
    [observedSelectionSignature, playheadFrame, timeline.id]
  );

  React.useEffect(
    () => {
      if (isPlayingPreview || !selectedInstances.length) {
        return;
      }

      const sampleCurrentFrameValues = (allowSave: boolean) => {
        const keyframeTime = clamp(
          snapTimeToTimelineFrame(playheadTimeRef.current),
          0,
          timelineRef.current.duration
        );
        const keyframeFrame = timeToFrame(keyframeTime);

        const snapshot = firstFrameAutoRecordSnapshotRef.current;
        const uniqueSelectedInstancesById = new Map<
          string,
          gdInitialInstance
        >();
        for (const instance of selectedInstances) {
          uniqueSelectedInstancesById.set(
            getInstanceIdentity(instance),
            instance
          );
        }

        const currentTimeline = timelineRef.current;
        let workingTracks = currentTimeline.tracks;
        let didChange = false;

        for (const instance of uniqueSelectedInstancesById.values()) {
          const instanceIdentity = getInstanceIdentity(instance);
          const objectName = instance.getObjectName();
          const objectType = getObjectTypeByName(
            project,
            objectsContainer,
            globalObjectsContainer,
            objectName
          );
          const properties = getTimelinePropertiesForObjectType(objectType);
          let targetTrack = findTrackForInstance(workingTracks, instance);

          for (const property of properties) {
            const currentValue = getPropertyValueFromInitialInstance(
              instance,
              property,
              onGetInstanceSize,
              objectType
            );
            if (currentValue === null) continue;

            const normalizedValue = normalizeValueForInitialInstance(
              instance,
              property,
              currentValue,
              onGetInstanceSize,
              objectType
            );
            const currentIdentity = getTimelineValueIdentity(normalizedValue);
            const snapshotKey = `${instanceIdentity}:${property}:${keyframeFrame}`;
            const previewValueKey = `${instanceIdentity}:${property}`;

            if (
              lastAppliedPreviewValuesRef.current.get(previewValueKey) ===
              currentIdentity
            ) {
              snapshot.set(snapshotKey, currentIdentity);
              continue;
            }

            const existingPropertyTrack = targetTrack
              ? targetTrack.propertyTracks.find(
                  propertyTrack => propertyTrack.property === property
                )
              : null;
            const storedIdentity = existingPropertyTrack
              ? keyframeFrame === 0
                ? getTimelineValueIdentity(
                    getPropertyTrackInitialValue(existingPropertyTrack)
                  )
                : getTimelineValueIdentity(
                    interpolateTimelineValue(
                      existingPropertyTrack,
                      keyframeTime
                    )
                  )
              : currentIdentity;
            const previousIdentity = snapshot.get(snapshotKey);
            const shouldRecord =
              allowSave &&
              ((previousIdentity !== undefined &&
                previousIdentity !== currentIdentity) ||
                (previousIdentity === undefined &&
                  storedIdentity !== currentIdentity));

            snapshot.set(snapshotKey, currentIdentity);
            if (!shouldRecord) {
              continue;
            }

            if (!targetTrack) {
              targetTrack = createTrackForInstance(
                instance,
                objectType,
                onGetInstanceSize
              );
              workingTracks = [...workingTracks, targetTrack];
            }

            const trackId = targetTrack.id;
            const targetTrackIndex = workingTracks.findIndex(
              track => track.id === trackId
            );
            if (targetTrackIndex === -1) continue;

            const trackToUpdate = workingTracks[targetTrackIndex];
            const hasPropertyTrack = trackToUpdate.propertyTracks.some(
              propertyTrack => propertyTrack.property === property
            );
            const propertyTracks = hasPropertyTrack
              ? trackToUpdate.propertyTracks
              : [
                  ...trackToUpdate.propertyTracks,
                  createPropertyTrack(property, normalizedValue),
                ];

            const nextTrack = {
              ...trackToUpdate,
              propertyTracks: propertyTracks.map(propertyTrack =>
                propertyTrack.property === property
                  ? keyframeFrame === 0
                    ? {
                        ...propertyTrack,
                        initialValue: cloneTimelineValue(normalizedValue),
                        keyframes: propertyTrack.keyframes.filter(
                          keyframe => timeToFrame(keyframe.time) !== 0
                        ),
                      }
                    : upsertPropertyTrackKeyframe(propertyTrack, {
                        id: createKeyframeId(),
                        time: keyframeTime,
                        value: cloneTimelineValue(normalizedValue),
                      }).propertyTrack
                  : propertyTrack
              ),
            };
            workingTracks = [
              ...workingTracks.slice(0, targetTrackIndex),
              nextTrack,
              ...workingTracks.slice(targetTrackIndex + 1),
            ];
            targetTrack = nextTrack;
            didChange = true;
          }
        }

        if (didChange) {
          saveTimeline({
            ...currentTimeline,
            tracks: workingTracks,
          });
        }
      };

      sampleCurrentFrameValues(false);
      const intervalId = setInterval(() => sampleCurrentFrameValues(true), 120);
      return () => clearInterval(intervalId);
    },
    [
      globalObjectsContainer,
      isPlayingPreview,
      objectsContainer,
      observedSelectionSignature,
      onGetInstanceSize,
      playheadFrame,
      project,
      saveTimeline,
      selectedInstances,
    ]
  );

  const curveEditableKeyframes = React.useMemo(
    () => {
      const selectedIds = new Set(selectedKeyframeIds);
      if (!selectedIds.size) return [];

      const outgoingKeyframes: Array<TimelineKeyframe> = [];
      const incomingFallbackKeyframes: Array<TimelineKeyframe> = [];
      timeline.tracks.forEach(track => {
        track.propertyTracks.forEach(propertyTrack => {
          const keyframes = getSamplingTimelineKeyframes(propertyTrack);
          keyframes.forEach((keyframe, index) => {
            if (!selectedIds.has(keyframe.id)) return;

            if (
              index < keyframes.length - 1 &&
              keyframes[index + 1].time > keyframe.time
            ) {
              outgoingKeyframes.push(keyframe);
            } else if (index > 0) {
              incomingFallbackKeyframes.push(keyframes[index - 1]);
            }
          });
        });
      });

      const editableKeyframes = outgoingKeyframes.length
        ? outgoingKeyframes
        : incomingFallbackKeyframes;
      const seenIds = new Set<string>();
      return editableKeyframes.filter(keyframe => {
        if (seenIds.has(keyframe.id)) return false;
        seenIds.add(keyframe.id);
        return true;
      });
    },
    [selectedKeyframeIds, timeline.tracks]
  );
  const curveEditableKeyframeIds = React.useMemo(
    () => curveEditableKeyframes.map(keyframe => keyframe.id),
    [curveEditableKeyframes]
  );
  const selectedCurveDefinition =
    curveEditableKeyframes.length &&
    curveEditableKeyframes.every(
      keyframe =>
        getCurveModeId(getKeyframeCurve(keyframe)) ===
        getCurveModeId(getKeyframeCurve(curveEditableKeyframes[0]))
    )
      ? getKeyframeCurve(curveEditableKeyframes[0])
      : curveEditableKeyframes.length
      ? null
      : selectedPropertyTrack &&
        getSamplingTimelineKeyframes(selectedPropertyTrack)[0]
      ? getKeyframeCurve(getSamplingTimelineKeyframes(selectedPropertyTrack)[0])
      : 'linear';
  const selectedCurveModeId =
    getCurveModeId(selectedCurveDefinition) || 'linear';
  const selectedCurveGraphPath = getCurveGraphPath(selectedCurveDefinition);
  const selectedCurveControlPoints = getCubicBezierControlPoints(
    selectedCurveDefinition
  );
  const curvePresetOptions = React.useMemo(
    () => [
      { id: 'stepped', label: <Trans>Stepped</Trans>, curve: 'stepped' },
      { id: 'linear', label: <Trans>Linear</Trans>, curve: 'linear' },
      {
        id: 'bezier',
        label: <Trans>Bezier</Trans>,
        curve: { type: 'cubicBezier', x1: 0.42, y1: 0, x2: 0.58, y2: 1 },
      },
    ],
    []
  );

  const applyCurveToSelectedKeyframes = React.useCallback(
    (curve: TimelineCurveDefinition, ease: any) => {
      if (!curveEditableKeyframeIds.length) return;

      const selectedKeyframes = new Set(curveEditableKeyframeIds);
      const nextTimeline = {
        ...timeline,
        tracks: timeline.tracks.map(track => ({
          ...track,
          propertyTracks: track.propertyTracks.map(propertyTrack => {
            const shouldUpdateInitial = selectedKeyframes.has(
              getInitialKeyframeId(propertyTrack)
            );
            return {
              ...propertyTrack,
              initialEase: shouldUpdateInitial
                ? ease
                : propertyTrack.initialEase,
              initialCurve: shouldUpdateInitial
                ? curve
                : propertyTrack.initialCurve,
              keyframes: propertyTrack.keyframes.map(keyframe =>
                selectedKeyframes.has(keyframe.id)
                  ? {
                      ...keyframe,
                      ease,
                      curve,
                    }
                  : keyframe
              ),
            };
          }),
        })),
      };
      lastAppliedPreviewValuesRef.current.clear();
      saveTimeline(nextTimeline);
      applyTimelinePreviewAtTime(playheadTimeRef.current, true);
    },
    [
      applyTimelinePreviewAtTime,
      curveEditableKeyframeIds,
      saveTimeline,
      timeline,
    ]
  );

  const applyCurvePreset = React.useCallback(
    (curvePresetId: string) => {
      if (!curveEditableKeyframeIds.length) return;

      const curvePreset = curvePresetOptions.find(
        preset => preset.id === curvePresetId
      );
      if (!curvePreset) return;

      applyCurveToSelectedKeyframes(
        curvePreset.curve,
        curvePresetId === 'stepped' ? 'hold' : curvePresetId
      );
    },
    [
      applyCurveToSelectedKeyframes,
      curveEditableKeyframeIds,
      curvePresetOptions,
    ]
  );

  React.useEffect(
    () => {
      if (!draggingCurveHandle) return;

      const onMouseMove = (event: any) => {
        if (!curveViewportRef.current) return;

        const rect = curveViewportRef.current.getBoundingClientRect();
        const viewX =
          ((event.clientX - rect.left) / Math.max(1, rect.width)) * 100;
        const viewY =
          ((event.clientY - rect.top) / Math.max(1, rect.height)) * 100;
        const controlX = clamp01((viewX - 8) / 84);
        const controlY = clamp01((82 - viewY) / 64);
        const currentControlPoints = getCubicBezierControlPoints(
          selectedCurveDefinition
        );
        const nextCurve =
          draggingCurveHandle === 'out'
            ? {
                type: 'cubicBezier',
                ...currentControlPoints,
                x1: controlX,
                y1: controlY,
              }
            : {
                type: 'cubicBezier',
                ...currentControlPoints,
                x2: controlX,
                y2: controlY,
              };

        applyCurveToSelectedKeyframes(nextCurve, 'bezier');
      };
      const onMouseUp = () => {
        setDraggingCurveHandle(null);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [
      applyCurveToSelectedKeyframes,
      draggingCurveHandle,
      selectedCurveDefinition,
    ]
  );

  React.useEffect(
    () => {
      if (!selectionBox) return;
      if (isSelectingKeyframes) return;
      if (selectedKeyframeIds.length <= 1) {
        setSelectionBox(null);
        return;
      }

      const selectedKeyframesSet = new Set(selectedKeyframeIds);
      if (
        !selectionBox.keyframeIds ||
        selectionBox.keyframeIds.some(
          keyframeId => !selectedKeyframesSet.has(keyframeId)
        )
      ) {
        setSelectionBox(null);
      }
    },
    [isSelectingKeyframes, selectedKeyframeIds, selectionBox]
  );

  React.useEffect(
    () => {
      setViewStartFrame(startFrame => clamp(startFrame, 0, maxViewStartFrame));
    },
    [maxViewStartFrame]
  );

  React.useEffect(
    () => {
      if (!isPlayingPreview) return;

      if (
        playheadFrame < safeViewStartFrame ||
        playheadFrame > safeViewStartFrame + visibleFrames
      ) {
        setViewStartFrame(
          clamp(playheadFrame - visibleFrames * 0.5, 0, maxViewStartFrame)
        );
      }
    },
    [
      isPlayingPreview,
      maxViewStartFrame,
      playheadFrame,
      safeViewStartFrame,
      visibleFrames,
    ]
  );

  const setClampedViewStartFrame = React.useCallback(
    (nextStartFrame: number) => {
      setViewStartFrame(clamp(nextStartFrame, 0, maxViewStartFrame));
    },
    [maxViewStartFrame]
  );

  const setPlayheadFrame = React.useCallback(
    (frame: number) => {
      const nextFrame = Math.round(clamp(frame, 0, frameCount));
      setTimelinePlayheadTime(frameToTime(nextFrame, timeline));
    },
    [frameCount, setTimelinePlayheadTime, timeline]
  );

  const syncLeftTrackRowsScroll = React.useCallback((event: any) => {
    if (!leftTrackRowsRef.current) return;
    leftTrackRowsRef.current.scrollTop = event.currentTarget.scrollTop;
  }, []);

  const syncTimelineRowsScrollFromLeft = React.useCallback((event: any) => {
    if (!timelineRowsRef.current) return;
    timelineRowsRef.current.scrollTop = event.currentTarget.scrollTop;
  }, []);

  const onLeftTrackRowsWheel = React.useCallback((event: any) => {
    const timelineRows = timelineRowsRef.current;
    const leftTrackRows = leftTrackRowsRef.current;
    if (!timelineRows || !leftTrackRows) return;

    event.preventDefault();
    timelineRows.scrollTop += event.deltaY;
    if (event.deltaX) {
      timelineRows.scrollLeft += event.deltaX;
    }
    leftTrackRows.scrollTop = timelineRows.scrollTop;
  }, []);

  const getFrameFromClientX = React.useCallback(
    (clientX: number, element: HTMLDivElement): number => {
      const rect = element.getBoundingClientRect();
      const usableWidth = Math.max(1, rect.width - timelineEdgeHitPadding * 2);
      const pointerRatio = clamp(
        (clientX - rect.left - timelineEdgeHitPadding) / usableWidth,
        0,
        1
      );
      return safeViewStartFrame + pointerRatio * visibleFrames;
    },
    [safeViewStartFrame, visibleFrames]
  );

  const beginTimelinePan = React.useCallback(
    (clientX: number) => {
      const timelineArea = timelineAreaRef.current;
      if (!timelineArea) return;

      panStateRef.current = {
        startClientX: clientX,
        startFrame: safeViewStartFrame,
        visibleFrames,
        width: timelineArea.getBoundingClientRect().width,
      };
      setIsPanningTimeline(true);
    },
    [safeViewStartFrame, visibleFrames]
  );

  const onTimelineMouseDown = React.useCallback(
    (event: SyntheticMouseEvent<HTMLDivElement>, propertyTrackId?: string) => {
      if (event.button === 1) {
        event.preventDefault();
        beginTimelinePan(event.clientX);
        return;
      }

      if (event.button !== 0) return;

      event.preventDefault();
      if (propertyTrackId) {
        const multiTrack = event.shiftKey && !!timelineRowsRef.current;
        const selectionElement = multiTrack
          ? timelineRowsRef.current
          : event.currentTarget;
        if (!selectionElement) return;

        marqueeSelectionStateRef.current = {
          startClientX: event.clientX,
          startClientY: event.clientY,
          element: selectionElement,
          propertyTrackId,
          additive: event.shiftKey || event.ctrlKey || event.metaKey,
          baseSelectedKeyframeIds: selectedKeyframeIds,
          hasMoved: false,
          multiTrack,
        };
        setSelectedPropertyTrackId(propertyTrackId);
        setSelectionBox(null);
        setIsSelectingKeyframes(true);
        return;
      }

      setPlayheadFrame(getFrameFromClientX(event.clientX, event.currentTarget));
      if (propertyTrackId) {
        setSelectedPropertyTrackId(propertyTrackId);
      }
      scrubStateRef.current = {
        element: event.currentTarget,
        propertyTrackId,
      };
      setIsScrubbingTimeline(true);
    },
    [
      beginTimelinePan,
      getFrameFromClientX,
      selectedKeyframeIds,
      setPlayheadFrame,
    ]
  );

  const onTimelineWheel = React.useCallback(
    (event: SyntheticWheelEvent<HTMLDivElement>) => {
      event.preventDefault();

      const timelineArea = timelineAreaRef.current;
      if (!timelineArea) return;

      const rect = timelineArea.getBoundingClientRect();
      const width = Math.max(1, rect.width);

      if (!event.ctrlKey) {
        const delta = event.deltaX || event.deltaY;
        setClampedViewStartFrame(
          safeViewStartFrame + (delta / width) * visibleFrames
        );
        return;
      }

      const pointerRatio = clamp((event.clientX - rect.left) / width, 0, 1);
      const frameUnderPointer =
        safeViewStartFrame + pointerRatio * visibleFrames;
      const zoomDelta = event.deltaY < 0 ? 1.15 : 1 / 1.15;
      const nextZoom = clamp(
        timelineZoom * zoomDelta,
        minTimelineZoom,
        maxTimelineZoom
      );
      const nextVisibleFrames = Math.min(
        frameCount,
        Math.max(1, frameCount / nextZoom)
      );
      const nextMaxViewStartFrame = Math.max(0, frameCount - nextVisibleFrames);

      setTimelineZoom(nextZoom);
      setViewStartFrame(
        clamp(
          frameUnderPointer - pointerRatio * nextVisibleFrames,
          0,
          nextMaxViewStartFrame
        )
      );
    },
    [
      frameCount,
      safeViewStartFrame,
      setClampedViewStartFrame,
      timelineZoom,
      visibleFrames,
    ]
  );

  const onScrollRailMouseDown = React.useCallback(
    (event: SyntheticMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !scrollRailRef.current) return;

      event.preventDefault();
      const rect = scrollRailRef.current.getBoundingClientRect();
      const pointerRatio = clamp(
        (event.clientX - rect.left) / Math.max(1, rect.width),
        0,
        1
      );
      setClampedViewStartFrame(pointerRatio * frameCount - visibleFrames * 0.5);
    },
    [frameCount, setClampedViewStartFrame, visibleFrames]
  );

  const onScrollThumbMouseDown = React.useCallback(
    (event: SyntheticMouseEvent<HTMLDivElement>) => {
      if (event.button !== 0 || !scrollRailRef.current) return;

      event.preventDefault();
      event.stopPropagation();
      scrollThumbDragStateRef.current = {
        startClientX: event.clientX,
        startFrame: safeViewStartFrame,
        railWidth: scrollRailRef.current.getBoundingClientRect().width,
      };
      setIsDraggingScrollThumb(true);
    },
    [safeViewStartFrame]
  );

  const beginKeyframeDrag = React.useCallback(
    (
      event: SyntheticMouseEvent<HTMLSpanElement>,
      propertyTrack: TimelinePropertyTrack,
      keyframe: TimelineKeyframe,
      nextSelectedKeyframeIds: Array<string>,
      draggedChannel?: 'x' | 'y' | 'value'
    ) => {
      const laneElement = event.currentTarget.parentElement;
      if (!laneElement) return;

      const selectedKeyframesSet = new Set(nextSelectedKeyframeIds);
      const clickedChannel =
        draggedChannel ||
        getNearestTimelineValueChannel(
          propertyTrack,
          keyframe,
          event.clientY,
          ((laneElement: any): HTMLDivElement)
        );
      const snapshots = [];
      timeline.tracks.forEach(track => {
        track.propertyTracks.forEach(trackPropertyTrack => {
          getSamplingTimelineKeyframes(trackPropertyTrack).forEach(
            trackKeyframe => {
              if (!selectedKeyframesSet.has(trackKeyframe.id)) return;

              snapshots.push({
                keyframeId: trackKeyframe.id,
                propertyTrackId: trackPropertyTrack.id,
                property: trackPropertyTrack.property,
                time: trackKeyframe.time,
                value: trackKeyframe.value,
                ease: trackKeyframe.ease,
                curve: trackKeyframe.curve,
                channel:
                  typeof trackKeyframe.value === 'object'
                    ? clickedChannel === 'value'
                      ? 'x'
                      : clickedChannel
                    : 'value',
                valueRange: getPropertyTrackChannelRange(
                  trackPropertyTrack,
                  typeof trackKeyframe.value === 'object'
                    ? clickedChannel === 'value'
                      ? 'x'
                      : clickedChannel
                    : 'value'
                ),
              });
            }
          );
        });
      });

      keyframeDragStateRef.current = {
        startClientX: event.clientX,
        startClientY: event.clientY,
        element: ((laneElement: any): HTMLDivElement),
        timeline,
        snapshots,
        hasMoved: false,
      };
      setIsDraggingKeyframes(true);
    },
    [timeline]
  );

  React.useEffect(
    () => {
      if (!isPanningTimeline) return;

      const onMouseMove = (event: any) => {
        const panState = panStateRef.current;
        if (!panState) return;

        const deltaFrames =
          ((panState.startClientX - event.clientX) /
            Math.max(1, panState.width)) *
          panState.visibleFrames;
        setClampedViewStartFrame(panState.startFrame + deltaFrames);
      };
      const onMouseUp = () => {
        panStateRef.current = null;
        setIsPanningTimeline(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [isPanningTimeline, setClampedViewStartFrame]
  );

  React.useEffect(
    () => {
      if (!isDraggingKeyframes) return;

      const onMouseMove = (event: any) => {
        const dragState = keyframeDragStateRef.current;
        if (!dragState) return;

        const dragDistance = Math.hypot(
          event.clientX - dragState.startClientX,
          event.clientY - dragState.startClientY
        );
        if (!dragState.hasMoved && dragDistance < 3) {
          return;
        }
        dragState.hasMoved = true;

        const startFrame = getFrameFromClientX(
          dragState.startClientX,
          dragState.element
        );
        const currentFrame = getFrameFromClientX(
          event.clientX,
          dragState.element
        );
        const deltaTime = Math.round(currentFrame - startFrame) / frameRate;
        const deltaPixelsY = event.clientY - dragState.startClientY;
        const selectedKeyframes = new Set(
          dragState.snapshots.map(snapshot => snapshot.keyframeId)
        );
        const snapshotByKeyframeId = new Map(
          dragState.snapshots.map(snapshot => [snapshot.keyframeId, snapshot])
        );

        const nextTimeline = {
          ...dragState.timeline,
          tracks: dragState.timeline.tracks.map(track => ({
            ...track,
            propertyTracks: track.propertyTracks.map(propertyTrack => {
              const getDraggedValueDelta = snapshot =>
                (-(deltaPixelsY / Math.max(1, dragState.element.clientHeight)) *
                  100 *
                  snapshot.valueRange.range) /
                72;
              let nextPropertyTrack = propertyTrack;
              const initialSnapshot = snapshotByKeyframeId.get(
                getInitialKeyframeId(propertyTrack)
              );

              if (initialSnapshot) {
                nextPropertyTrack = updatePropertyTrackInitialKeyframe(
                  nextPropertyTrack,
                  {
                    id: getInitialKeyframeId(propertyTrack),
                    time: 0,
                    value: offsetTimelineValueChannel(
                      initialSnapshot.property,
                      initialSnapshot.value,
                      initialSnapshot.channel,
                      getDraggedValueDelta(initialSnapshot)
                    ),
                    ease: initialSnapshot.ease,
                    curve: initialSnapshot.curve,
                  }
                );
              }

              let draggedKeyframeAtStart: ?TimelineKeyframe = null;
              const nextKeyframes = nextPropertyTrack.keyframes
                .map(keyframe => {
                  if (!selectedKeyframes.has(keyframe.id)) return keyframe;

                  const snapshot = snapshotByKeyframeId.get(keyframe.id);
                  if (!snapshot) return keyframe;

                  const draggedKeyframe = {
                    ...keyframe,
                    time: snapTimeToTimelineFrame(
                      clamp(
                        snapshot.time + deltaTime,
                        0,
                        dragState.timeline.duration
                      )
                    ),
                    value: offsetTimelineValueChannel(
                      snapshot.property,
                      snapshot.value,
                      snapshot.channel,
                      getDraggedValueDelta(snapshot)
                    ),
                  };

                  if (timeToFrame(draggedKeyframe.time) === 0) {
                    draggedKeyframeAtStart = draggedKeyframe;
                    return null;
                  }

                  return draggedKeyframe;
                })
                .filter(Boolean)
                .sort((a, b) => a.time - b.time);

              if (draggedKeyframeAtStart) {
                return updatePropertyTrackInitialKeyframe(
                  {
                    ...nextPropertyTrack,
                    keyframes: ((nextKeyframes: any): Array<TimelineKeyframe>),
                  },
                  draggedKeyframeAtStart
                );
              }

              return {
                ...nextPropertyTrack,
                keyframes: ((nextKeyframes: any): Array<TimelineKeyframe>),
              };
            }),
          })),
        };

        saveTimeline(nextTimeline);
        applyTimelinePreviewAtTime(playheadTimeRef.current, true);
      };
      const onMouseUp = () => {
        keyframeDragStateRef.current = null;
        setIsDraggingKeyframes(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [
      applyTimelinePreviewAtTime,
      getFrameFromClientX,
      isDraggingKeyframes,
      saveTimeline,
    ]
  );

  React.useEffect(
    () => {
      if (!isScrubbingTimeline) return;

      const onMouseMove = (event: any) => {
        const scrubState = scrubStateRef.current;
        if (!scrubState) return;

        setPlayheadFrame(
          getFrameFromClientX(event.clientX, scrubState.element)
        );
        if (scrubState.propertyTrackId) {
          setSelectedPropertyTrackId(scrubState.propertyTrackId);
        }
      };
      const onMouseUp = () => {
        scrubStateRef.current = null;
        setIsScrubbingTimeline(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [
      getFrameFromClientX,
      isScrubbingTimeline,
      setPlayheadFrame,
      setSelectedPropertyTrackId,
    ]
  );

  React.useEffect(
    () => {
      if (!isSelectingKeyframes) return;

      const onMouseMove = (event: any) => {
        const marqueeState = marqueeSelectionStateRef.current;
        if (!marqueeState) return;

        const dragDistance = Math.hypot(
          event.clientX - marqueeState.startClientX,
          event.clientY - marqueeState.startClientY
        );
        if (!marqueeState.hasMoved && dragDistance < 4) {
          return;
        }
        marqueeState.hasMoved = true;

        const rect = marqueeState.element.getBoundingClientRect();
        const startX = clamp(
          marqueeState.startClientX - rect.left,
          0,
          rect.width
        );
        const startY = clamp(
          marqueeState.startClientY - rect.top,
          0,
          rect.height
        );
        const currentX = clamp(event.clientX - rect.left, 0, rect.width);
        const currentY = clamp(event.clientY - rect.top, 0, rect.height);
        const boxTop =
          Math.min(startY, currentY) +
          (marqueeState.multiTrack ? marqueeState.element.scrollTop : 0);
        setSelectionBox({
          propertyTrackId: marqueeState.multiTrack
            ? undefined
            : marqueeState.propertyTrackId,
          isMultiTrack: marqueeState.multiTrack,
          left: Math.min(startX, currentX),
          top: boxTop,
          width: Math.abs(currentX - startX),
          height: Math.abs(currentY - startY),
          keyframeIds: [],
        });
      };
      const onMouseUp = (event: any) => {
        const marqueeState = marqueeSelectionStateRef.current;
        if (marqueeState) {
          if (!marqueeState.hasMoved) {
            setPlayheadFrame(
              getFrameFromClientX(event.clientX, marqueeState.element)
            );
            setSelectedPropertyTrackId(marqueeState.propertyTrackId);
            if (!marqueeState.additive) {
              setSelectedKeyframeIds([]);
              setSelectionBox(null);
            }
            marqueeSelectionStateRef.current = null;
            setIsSelectingKeyframes(false);
            return;
          }

          const startFrame = getFrameFromClientX(
            marqueeState.startClientX,
            marqueeState.element
          );
          const endFrame = getFrameFromClientX(
            event.clientX,
            marqueeState.element
          );
          const minFrame = Math.floor(Math.min(startFrame, endFrame));
          const maxFrame = Math.ceil(Math.max(startFrame, endFrame));
          const rect = marqueeState.element.getBoundingClientRect();
          const startX = clamp(
            marqueeState.startClientX - rect.left,
            0,
            rect.width
          );
          const startY = clamp(
            marqueeState.startClientY - rect.top,
            0,
            rect.height
          );
          const currentX = clamp(event.clientX - rect.left, 0, rect.width);
          const currentY = clamp(event.clientY - rect.top, 0, rect.height);
          const boxTop =
            Math.min(startY, currentY) +
            (marqueeState.multiTrack ? marqueeState.element.scrollTop : 0);

          const getSelectedIdsForPropertyTrack = propertyTrack =>
            getSamplingTimelineKeyframes(propertyTrack)
              .filter(keyframe => {
                const frame = timeToFrame(keyframe.time);
                return frame >= minFrame && frame <= maxFrame;
              })
              .map(keyframe => keyframe.id);
          let selectedIds = [];
          let selectionPropertyTrackId = marqueeState.propertyTrackId;

          if (marqueeState.multiTrack) {
            const minContentY =
              Math.min(startY, currentY) + marqueeState.element.scrollTop;
            const maxContentY =
              Math.max(startY, currentY) + marqueeState.element.scrollTop;
            let firstSelectedRowPropertyTrackId = null;

            propertyTrackRows.forEach((row, rowIndex) => {
              const rowTop = rowIndex * rowHeight;
              const rowBottom = rowTop + rowHeight;
              if (rowBottom < minContentY || rowTop > maxContentY) {
                return;
              }

              if (!firstSelectedRowPropertyTrackId) {
                firstSelectedRowPropertyTrackId = row.propertyTrack.id;
              }
              selectedIds = [
                ...selectedIds,
                ...getSelectedIdsForPropertyTrack(row.propertyTrack),
              ];
            });

            if (firstSelectedRowPropertyTrackId) {
              selectionPropertyTrackId = firstSelectedRowPropertyTrackId;
            }
          } else {
            const propertyTrackRow = propertyTrackRows.find(
              row => row.propertyTrack.id === marqueeState.propertyTrackId
            );
            selectedIds = propertyTrackRow
              ? getSelectedIdsForPropertyTrack(propertyTrackRow.propertyTrack)
              : [];
          }

          const uniqueSelectedIds = Array.from(new Set(selectedIds));
          const nextSelectedIds = marqueeState.additive
            ? Array.from(
                new Set([
                  ...marqueeState.baseSelectedKeyframeIds,
                  ...uniqueSelectedIds,
                ])
              )
            : uniqueSelectedIds;

          setSelectedKeyframeIds(nextSelectedIds);
          setSelectedPropertyTrackId(selectionPropertyTrackId);
          setSelectionBox(
            nextSelectedIds.length > 1
              ? {
                  propertyTrackId: marqueeState.multiTrack
                    ? undefined
                    : marqueeState.propertyTrackId,
                  isMultiTrack: marqueeState.multiTrack,
                  left: Math.min(startX, currentX),
                  top: boxTop,
                  width: Math.abs(currentX - startX),
                  height: Math.abs(currentY - startY),
                  keyframeIds: nextSelectedIds,
                }
              : null
          );
        }

        marqueeSelectionStateRef.current = null;
        setIsSelectingKeyframes(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [
      getFrameFromClientX,
      isSelectingKeyframes,
      propertyTrackRows,
      setPlayheadFrame,
    ]
  );

  React.useEffect(
    () => {
      if (!isDraggingScrollThumb) return;

      const onMouseMove = (event: any) => {
        const dragState = scrollThumbDragStateRef.current;
        if (!dragState) return;

        const deltaFrames =
          ((event.clientX - dragState.startClientX) /
            Math.max(1, dragState.railWidth)) *
          frameCount;
        setClampedViewStartFrame(dragState.startFrame + deltaFrames);
      };
      const onMouseUp = () => {
        scrollThumbDragStateRef.current = null;
        setIsDraggingScrollThumb(false);
      };

      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('mouseup', onMouseUp);
      return () => {
        window.removeEventListener('mousemove', onMouseMove);
        window.removeEventListener('mouseup', onMouseUp);
      };
    },
    [frameCount, isDraggingScrollThumb, setClampedViewStartFrame]
  );

  const scrollThumbWidthPercent =
    frameCount === 0 ? 100 : clamp((visibleFrames / frameCount) * 100, 4, 100);
  const scrollThumbLeftPercent =
    frameCount === 0
      ? 0
      : clamp(
          (safeViewStartFrame / frameCount) * 100,
          0,
          100 - scrollThumbWidthPercent
        );

  return (
    <div
      ref={timelineRootRef}
      style={{
        ...styles.root,
        cursor: isPanningTimeline ? 'grabbing' : undefined,
      }}
    >
      <div style={styles.topBar}>
        <div style={styles.modeTabs}>
          <div style={styles.tabRow}>
            <div style={styles.tab}>
              <TimelineIcon fontSize="small" />
              <Trans>Graph</Trans>
            </div>
            <div style={{ ...styles.tab, ...styles.tabInactive }}>
              <Grain fontSize="small" />
              <Trans>Dope Sheet</Trans>
            </div>
          </div>
          <div style={styles.toolCluster}>
            <ToolbarIconButton
              title={<Trans>Add keyframe (K/S)</Trans>}
              onClick={addKeyframeAtPlayhead}
            >
              <Add fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Add keyframes for all tracks (N)</Trans>}
              onClick={addAllTrackKeyframesAtPlayhead}
            >
              <PlaylistAdd fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Add keyframes for changed tracks (M)</Trans>}
              onClick={addChangedTrackKeyframesAtPlayhead}
            >
              <PlaylistAddCheck fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Delete selected keyframe</Trans>}
              onClick={deleteSelectedKeyframe}
              disabled={!selectedKeyframeIds.length}
            >
              <Delete fontSize="small" />
            </ToolbarIconButton>
          </div>
        </div>
        <div style={styles.mainTools}>
          <div style={styles.transport}>
            <ToolbarIconButton
              title={<Trans>Go to start</Trans>}
              onClick={() => setTimelinePlayheadTime(0)}
            >
              <SkipPrevious fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Previous frame</Trans>}
              onClick={() =>
                setTimelinePlayheadTime(time =>
                  clamp(time - 1 / frameRate, 0, timeline.duration)
                )
              }
            >
              <FastRewind fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={
                isPlayingPreview ? <Trans>Pause</Trans> : <Trans>Play</Trans>
              }
              onClick={() =>
                isPlayingPreview
                  ? setIsPlayingPreview(false)
                  : startTimelinePreview()
              }
              color="#1EE7F2"
            >
              {isPlayingPreview ? (
                <Pause fontSize="small" />
              ) : (
                <PlayArrow fontSize="small" />
              )}
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Next frame</Trans>}
              onClick={() =>
                setTimelinePlayheadTime(time =>
                  clamp(time + 1 / frameRate, 0, timeline.duration)
                )
              }
            >
              <FastForward fontSize="small" />
            </ToolbarIconButton>
            <ToolbarIconButton
              title={<Trans>Go to end</Trans>}
              onClick={() => setTimelinePlayheadTime(timeline.duration)}
            >
              <SkipNext fontSize="small" />
            </ToolbarIconButton>
          </div>
          <div style={styles.formStrip}>
            <label>
              <div style={styles.fieldLabel}>
                <Trans>Animation</Trans>
              </div>
              <div style={{ width: 132 }}>
                <SelectField
                  margin="none"
                  fullWidth
                  value={timeline.id}
                  onChange={(event, index, value) => selectTimeline(value)}
                >
                  {timelineChoices.map(timelineChoice => (
                    <SelectOption
                      key={timelineChoice.id}
                      value={timelineChoice.id}
                      label={timelineChoice.name}
                      shouldNotTranslate
                    />
                  ))}
                </SelectField>
              </div>
            </label>
            <label>
              <div style={styles.fieldLabel}>
                <Trans>New animation</Trans>
              </div>
              <TextField
                margin="none"
                value={newTimelineName}
                onChange={(event, value) => setNewTimelineName(value)}
                style={{ width: 132 }}
                inputStyle={{ color: gdevelopTheme.text.color.primary }}
              />
            </label>
            <ToolbarIconButton
              title={<Trans>Create a new animation</Trans>}
              onClick={createTimeline}
            >
              <Add fontSize="small" />
            </ToolbarIconButton>
            <label>
              <div style={styles.fieldLabel}>
                <Trans>Timeline</Trans>
              </div>
              <TextField
                margin="none"
                value={timeline.name}
                onChange={(event, value) => updateTimeline({ name: value })}
                style={{ width: 150 }}
                inputStyle={{ color: gdevelopTheme.text.color.primary }}
              />
            </label>
            <label>
              <div style={styles.fieldLabel}>
                <Trans>Total frames</Trans>
              </div>
              <TextField
                type="number"
                margin="none"
                value={frameCount}
                min={1}
                step={1}
                onChange={(event, value) => {
                  const totalFrames = Math.max(
                    1,
                    Math.round(parseFloat(value) || frameCount)
                  );
                  const duration = totalFrames / frameRate;
                  setTimelinePlayheadTime(time => clamp(time, 0, duration));
                  updateTimeline({ duration });
                }}
                style={{ width: 76 }}
                inputStyle={{ color: gdevelopTheme.text.color.primary }}
              />
            </label>
            <label>
              <div style={styles.fieldLabel}>
                <Trans>Speed</Trans>
              </div>
              <TextField
                type="number"
                margin="none"
                value={timeline.speed}
                min={0.05}
                step={0.05}
                onChange={(event, value) =>
                  updateTimeline({ speed: parseFloat(value) || 1 })
                }
                style={{ width: 66 }}
                inputStyle={{ color: gdevelopTheme.text.color.primary }}
              />
            </label>
            <label
              style={{
                display: 'flex',
                alignItems: 'center',
                color: '#D9D9D9',
                fontSize: 12,
              }}
            >
              <Checkbox
                size="small"
                checked={timeline.loop}
                onChange={(event, checked) => updateTimeline({ loop: checked })}
                style={{ color: '#1EE7F2', padding: 4 }}
              />
              <Trans>Loop</Trans>
            </label>
            <span style={{ color: '#1EE7F2', fontSize: 12 }}>
              <Trans>Frame {playheadFrame}</Trans>
            </span>
          </div>
        </div>
        <div style={styles.rightCurves}>
          <div style={styles.curveHeader}>
            <span>
              <ShowChart fontSize="small" style={{ verticalAlign: 'middle' }} />{' '}
              <Trans>Curves</Trans>
            </span>
          </div>
        </div>
      </div>
      <div style={styles.center}>
        <div style={styles.leftTracks}>
          <div style={styles.trackHeaderSpacer} />
          <div
            style={styles.trackLabelsRows}
            ref={leftTrackRowsRef}
            onScroll={syncTimelineRowsScrollFromLeft}
            onWheel={onLeftTrackRowsWheel}
          >
            {propertyTrackRows.map(
              ({ track, propertyTrack, propertyTrackIndex }) => {
                const isFirstPropertyTrack = propertyTrackIndex === 0;
                return (
                  <div
                    key={`${track.id}-${propertyTrack.id}`}
                    style={
                      selectedPropertyTrackId === propertyTrack.id
                        ? { ...styles.trackLabel, ...styles.trackLabelSelected }
                        : styles.trackLabel
                    }
                    onMouseDown={() => {
                      setSelectedPropertyTrackId(propertyTrack.id);
                      setSelectionBox(null);
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={styles.trackMainLabel}
                        title={getTrackTitle(track)}
                      >
                        {isFirstPropertyTrack ? (
                          getTrackLabel(track)
                        ) : (
                          <span style={{ color: '#8F8F8F' }}>
                            {getTrackLabel(track)}
                          </span>
                        )}
                      </div>
                      <div
                        style={
                          selectedPropertyTrackId === propertyTrack.id
                            ? styles.propertyRowName
                            : styles.propertyName
                        }
                        title={String(propertyTrack.property)}
                      >
                        {getPropertyLabel(propertyTrack.property)}
                      </div>
                    </div>
                    {isFirstPropertyTrack ? (
                      <React.Fragment>
                        <div style={{ width: 96 }}>
                          <SelectField
                            margin="none"
                            fullWidth
                            value={track.target.objectName || ''}
                            translatableHintText={t`Object`}
                            onChange={(event, index, value) =>
                              updateTrackTarget(track.id, value)
                            }
                          >
                            {(track.target.objectName &&
                            !objectNames.includes(track.target.objectName)
                              ? [track.target.objectName, ...objectNames]
                              : objectNames
                            ).map(objectName => (
                              <SelectOption
                                key={objectName}
                                value={objectName}
                                label={objectName}
                                shouldNotTranslate
                              />
                            ))}
                          </SelectField>
                        </div>
                        <ToolbarIconButton
                          title={<Trans>Delete object animation</Trans>}
                          onClick={() => deleteTrack(track.id)}
                          color="#FFB6B6"
                        >
                          <Delete fontSize="small" />
                        </ToolbarIconButton>
                      </React.Fragment>
                    ) : (
                      <div style={styles.mutedTrackTools} />
                    )}
                  </div>
                );
              }
            )}
          </div>
        </div>
        <div
          style={styles.timelineArea}
          ref={timelineAreaRef}
          onWheel={onTimelineWheel}
        >
          <div
            style={styles.ruler}
            onMouseDown={event => onTimelineMouseDown(event)}
          >
            {frameLabels.map(frame => (
              <span
                key={`guide-${frame}`}
                style={{
                  ...styles.frameGuide,
                  ...getFrameStyle(frame, safeViewStartFrame, visibleFrames),
                }}
              />
            ))}
            {frameLabels.map(frame => (
              <span
                key={frame}
                style={{
                  ...styles.frameLabel,
                  ...getFrameStyle(frame, safeViewStartFrame, visibleFrames),
                }}
              >
                {frame}
              </span>
            ))}
            {timeline.markers.map(marker => (
              <Tooltip key={marker.id || marker.name} title={marker.name}>
                <span
                  style={{
                    ...styles.marker,
                    ...getFrameStyle(
                      timeToFrame(marker.time),
                      safeViewStartFrame,
                      visibleFrames
                    ),
                  }}
                />
              </Tooltip>
            ))}
            <div
              style={{
                ...styles.playhead,
                left: playheadLeftCss,
              }}
            >
              <div style={styles.playheadHead} />
            </div>
          </div>
          <div
            style={styles.rows}
            ref={timelineRowsRef}
            onScroll={syncLeftTrackRowsScroll}
          >
            {selectionBox && selectionBox.isMultiTrack ? (
              <div
                style={{
                  ...styles.selectionBox,
                  left: selectionBox.left,
                  top: selectionBox.top,
                  width: selectionBox.width,
                  height: selectionBox.height,
                }}
              />
            ) : null}
            {propertyTrackRows.map(({ track, propertyTrack }) => (
              <div
                key={`${track.id}-${propertyTrack.id}`}
                style={styles.trackLane}
                onMouseDown={event =>
                  onTimelineMouseDown(event, propertyTrack.id)
                }
              >
                {frameLabels.map(frame => (
                  <span
                    key={`lane-guide-${propertyTrack.id}-${frame}`}
                    style={{
                      ...styles.frameGuide,
                      ...getFrameStyle(
                        frame,
                        safeViewStartFrame,
                        visibleFrames
                      ),
                    }}
                  />
                ))}
                <div style={styles.centerLine} />
                <svg
                  style={styles.trackGraphSvg}
                  viewBox="0 0 100 100"
                  preserveAspectRatio="none"
                >
                  {buildPropertyTrackGraphPaths(
                    propertyTrack,
                    safeViewStartFrame,
                    visibleFrames
                  ).map(pathInfo => (
                    <path
                      key={`${propertyTrack.id}-${pathInfo.channel}`}
                      d={pathInfo.path}
                      style={styles.trackGraphPath}
                      stroke={pathInfo.color}
                      vectorEffect="non-scaling-stroke"
                    />
                  ))}
                </svg>
                {getSamplingTimelineKeyframes(propertyTrack).flatMap(keyframe =>
                  getTimelineValueChannels(keyframe.value).map(
                    ({ channel, color }) => (
                      <Tooltip
                        key={`${keyframe.id}-${channel}`}
                        title={
                          <span>
                            {getPropertyLabel(propertyTrack.property)}
                            {channel === 'value'
                              ? ''
                              : ` ${channel.toUpperCase()}`}{' '}
                            - <Trans>Frame {timeToFrame(keyframe.time)}</Trans>
                          </span>
                        }
                      >
                        <span
                          style={{
                            ...styles.keyframe,
                            ...getFrameStyle(
                              keyframe.time * frameRate,
                              safeViewStartFrame,
                              visibleFrames
                            ),
                            top: `${getTimelineValueChannelY(
                              propertyTrack,
                              keyframe.value,
                              channel
                            )}%`,
                            background: selectedKeyframeIdsSet.has(keyframe.id)
                              ? '#FFCF4A'
                              : color,
                            borderColor: selectedKeyframeIdsSet.has(keyframe.id)
                              ? '#FFFFFF'
                              : '#111',
                          }}
                          onMouseDown={event => {
                            event.preventDefault();
                            event.stopPropagation();
                            setSelectionBox(null);
                            const shouldToggleSelection =
                              event.ctrlKey || event.metaKey;
                            const shouldAddToSelection = event.shiftKey;
                            setTimelinePlayheadTime(keyframe.time);
                            setSelectedPropertyTrackId(propertyTrack.id);
                            const nextSelectedKeyframeIds = shouldToggleSelection
                              ? selectedKeyframeIds.includes(keyframe.id)
                                ? selectedKeyframeIds.filter(
                                    keyframeId => keyframeId !== keyframe.id
                                  )
                                : [...selectedKeyframeIds, keyframe.id]
                              : shouldAddToSelection
                              ? selectedKeyframeIds.includes(keyframe.id)
                                ? selectedKeyframeIds
                                : [...selectedKeyframeIds, keyframe.id]
                              : selectedKeyframeIds.includes(keyframe.id)
                              ? selectedKeyframeIds
                              : [keyframe.id];
                            setSelectedKeyframeIds(nextSelectedKeyframeIds);
                            if (nextSelectedKeyframeIds.includes(keyframe.id)) {
                              beginKeyframeDrag(
                                event,
                                propertyTrack,
                                keyframe,
                                nextSelectedKeyframeIds,
                                channel
                              );
                            }
                          }}
                        />
                      </Tooltip>
                    )
                  )
                )}
                {selectionBox &&
                !selectionBox.isMultiTrack &&
                selectionBox.propertyTrackId === propertyTrack.id ? (
                  <div
                    style={{
                      ...styles.selectionBox,
                      left: selectionBox.left,
                      top: selectionBox.top,
                      width: selectionBox.width,
                      height: selectionBox.height,
                    }}
                  />
                ) : null}
                <div
                  style={{
                    ...styles.playhead,
                    left: playheadLeftCss,
                    opacity: 0.75,
                  }}
                />
              </div>
            ))}
          </div>
          <div style={styles.bottomBar}>
            <div
              style={styles.scrollRail}
              ref={scrollRailRef}
              onMouseDown={onScrollRailMouseDown}
            >
              <div
                style={{
                  ...styles.scrollThumb,
                  left: `${scrollThumbLeftPercent}%`,
                  width: `${scrollThumbWidthPercent}%`,
                  cursor: isDraggingScrollThumb ? 'grabbing' : 'grab',
                }}
                onMouseDown={onScrollThumbMouseDown}
              />
            </div>
          </div>
        </div>
        <div style={styles.rightCurves}>
          <div style={styles.curveViewport} ref={curveViewportRef}>
            <svg style={styles.curveSvg} viewBox="0 0 100 100">
              <path
                d={selectedCurveGraphPath}
                fill="none"
                stroke="#3AC7F2"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="4.5"
                y="78.5"
                width="7"
                height="7"
                transform="rotate(45 8 82)"
                fill="#19DDEB"
                stroke="#111"
                strokeWidth="1"
              />
              <rect
                x="88.5"
                y="14.5"
                width="7"
                height="7"
                transform="rotate(45 92 18)"
                fill="#19DDEB"
                stroke="#111"
                strokeWidth="1"
              />
              {curveEditableKeyframeIds.length > 0 &&
              selectedCurveModeId === 'bezier' ? (
                <React.Fragment>
                  <line
                    x1="8"
                    y1="82"
                    x2={8 + selectedCurveControlPoints.x1 * 84}
                    y2={82 - selectedCurveControlPoints.y1 * 64}
                    style={styles.curveHandleLine}
                  />
                  <line
                    x1="92"
                    y1="18"
                    x2={8 + selectedCurveControlPoints.x2 * 84}
                    y2={82 - selectedCurveControlPoints.y2 * 64}
                    style={styles.curveHandleLine}
                  />
                  <circle
                    cx={8 + selectedCurveControlPoints.x1 * 84}
                    cy={82 - selectedCurveControlPoints.y1 * 64}
                    r="3.8"
                    style={styles.curveHandle}
                    onMouseDown={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDraggingCurveHandle('out');
                    }}
                  />
                  <circle
                    cx={8 + selectedCurveControlPoints.x2 * 84}
                    cy={82 - selectedCurveControlPoints.y2 * 64}
                    r="3.8"
                    style={styles.curveHandle}
                    onMouseDown={event => {
                      event.preventDefault();
                      event.stopPropagation();
                      setDraggingCurveHandle('in');
                    }}
                  />
                </React.Fragment>
              ) : null}
            </svg>
            <div style={styles.curveHint}>
              {selectedKeyframeIds.length ? (
                curveEditableKeyframeIds.length ? (
                  <Trans>
                    Curve edits the selected key's outgoing segment, or the
                    previous segment for the last key
                  </Trans>
                ) : (
                  <Trans>Select a keyframe with a neighboring key</Trans>
                )
              ) : (
                <Trans>Select keyframes to edit their curve</Trans>
              )}
            </div>
          </div>
          <div style={styles.curveFooter}>
            {curvePresetOptions.map(curvePreset => (
              <Button
                key={curvePreset.id}
                size="small"
                style={{
                  ...styles.compactButton,
                  background:
                    selectedCurveModeId === curvePreset.id
                      ? '#207B89'
                      : '#4B4B4B',
                  color: curveEditableKeyframeIds.length
                    ? '#E9E9E9'
                    : '#9B9B9B',
                }}
                disabled={!curveEditableKeyframeIds.length}
                onClick={() => applyCurvePreset(curvePreset.id)}
              >
                {curvePreset.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
