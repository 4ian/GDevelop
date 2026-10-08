// @flow
import * as React from 'react';
import { type ProfilerRecordingRange } from './ProfilerRecording/ProfilerRecordingStore';

/** How fast the wheel zooms: exponential, so that zooms compose. */
const WHEEL_ZOOM_SPEED = 0.002;

type Props = {|
  /** The width of the timeline, in CSS pixels. */
  width: number,
  /** Everything that can be looked at: the view never leaves it. */
  bounds: ProfilerRecordingRange,
  /** What is looked at now. */
  view: ProfilerRecordingRange,
  onChangeView: (view: ProfilerRecordingRange) => void,
  /** The narrowest view the wheel can zoom to. */
  minSpanMs: number,
|};

/**
 * The horizontal zoom and pan of a timeline drawn in a canvas, shared by the
 * timelines of the debugger: the wheel zooms around the time under the mouse,
 * a drag moves the view, and the view always stays inside the bounds.
 *
 * The view itself is kept by the timeline (it can reset it, or derive it from
 * something else): this only computes the next one.
 */
export const useTimelineViewport = ({
  width,
  bounds,
  view,
  onChangeView,
  minSpanMs,
}: Props): {|
  /** The span of the view, never zero (safe to divide by). */
  viewSpanMs: number,
  timeToX: (timeMs: number) => number,
  xToTime: (x: number) => number,
  /** Zoom in or out (by the delta of a wheel), keeping the time at `x` still. */
  zoomAroundX: (x: number, wheelDeltaY: number) => void,
  startPan: (x: number) => void,
  /** Moves the view if a pan is in progress, and tells if one is. */
  panTo: (x: number) => boolean,
  /** Ends the pan, returning where it started (null if there was none). */
  endPan: () => ?number,
|} => {
  const panStartRef = React.useRef<?{|
    x: number,
    view: ProfilerRecordingRange,
  |}>(null);

  const viewSpanMs = Math.max(0.001, view.toMs - view.fromMs);
  const timeToX = React.useCallback(
    (timeMs: number) => ((timeMs - view.fromMs) / viewSpanMs) * width,
    [view.fromMs, viewSpanMs, width]
  );
  const xToTime = React.useCallback(
    (x: number) => view.fromMs + (x / width) * viewSpanMs,
    [view.fromMs, viewSpanMs, width]
  );

  const zoomAroundX = (x: number, wheelDeltaY: number) => {
    if (!width) return;
    const anchorMs = xToTime(x);
    const zoomFactor = Math.exp(wheelDeltaY * WHEEL_ZOOM_SPEED);
    const newSpanMs = Math.max(
      minSpanMs,
      Math.min(bounds.toMs - bounds.fromMs, viewSpanMs * zoomFactor)
    );
    let fromMs = anchorMs - (x / width) * newSpanMs;
    fromMs = Math.max(bounds.fromMs, Math.min(bounds.toMs - newSpanMs, fromMs));
    onChangeView({ fromMs, toMs: fromMs + newSpanMs });
  };

  const startPan = (x: number) => {
    panStartRef.current = { x, view };
  };

  const panTo = (x: number): boolean => {
    const panStart = panStartRef.current;
    if (!panStart || !width) return false;
    const deltaMs = ((panStart.x - x) / width) * viewSpanMs;
    let fromMs = panStart.view.fromMs + deltaMs;
    fromMs = Math.max(
      bounds.fromMs,
      Math.min(bounds.toMs - viewSpanMs, fromMs)
    );
    onChangeView({ fromMs, toMs: fromMs + viewSpanMs });
    return true;
  };

  const endPan = (): ?number => {
    const panStart = panStartRef.current;
    panStartRef.current = null;
    return panStart ? panStart.x : null;
  };

  return {
    viewSpanMs,
    timeToX,
    xToTime,
    zoomAroundX,
    startPan,
    panTo,
    endPan,
  };
};
