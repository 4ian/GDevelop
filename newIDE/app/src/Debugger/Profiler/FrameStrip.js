// @flow
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import {
  type ProfilerFrame,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  SLOW_FRAME_THRESHOLD_MS,
  findFirstFrameIndexAtOrAfter,
  formatGameTime,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import { useCanvasWithDevicePixelRatio } from '../useCanvasWithDevicePixelRatio';
import classes from './Profiler.module.css';

type Props = {|
  frames: Array<ProfilerFrame>,
  /** The whole recording. */
  bounds: ProfilerRecordingRange,
  selectedRange: ?ProfilerRecordingRange,
  onSelectRange: (range: ?ProfilerRecordingRange) => void,
  sceneChanges: Array<{| atMs: number, sceneName: string |}>,
|};

/** Frames longer than this are drawn at the full height of the strip. */
const MAX_DISPLAYED_FRAME_MS = SLOW_FRAME_THRESHOLD_MS * 3;
/** A drag shorter than this selects a single frame. */
const DRAG_THRESHOLD_PX = 3;

/**
 * One bar per recorded frame, as tall as the frame was long: the overview of
 * a recording, where a range is selected by dragging (or one frame by
 * clicking). Double click to select everything again.
 */
const FrameStrip = ({
  frames,
  bounds,
  selectedRange,
  onSelectRange,
  sceneChanges,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    containerRef,
    canvasRef,
    size,
    getContext,
  } = useCanvasWithDevicePixelRatio();
  const [dragRange, setDragRange] = React.useState<?ProfilerRecordingRange>(
    null
  );
  const dragStartRef = React.useRef<?{| x: number, timeMs: number |}>(null);

  const spanMs = Math.max(1, bounds.toMs - bounds.fromMs);
  const timeToX = React.useCallback(
    (timeMs: number) => ((timeMs - bounds.fromMs) / spanMs) * size.width,
    [bounds.fromMs, spanMs, size.width]
  );
  const xToTime = React.useCallback(
    (x: number) =>
      bounds.fromMs +
      (Math.max(0, Math.min(size.width, x)) / size.width) * spanMs,
    [bounds.fromMs, spanMs, size.width]
  );

  React.useEffect(
    () => {
      const context = getContext();
      if (!context) return;
      const { width, height } = size;
      const backgroundColor = gdevelopTheme.palette.alternateCanvasColor;
      const textColor = gdevelopTheme.text.color.secondary;
      const primaryColor = gdevelopTheme.chart.dataColor1;
      const errorColor = gdevelopTheme.statusIndicator.error;

      context.clearRect(0, 0, width, height);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);

      const labelHeight = 14;
      const barsTop = labelHeight;
      const barsHeight = height - barsTop - 2;
      const heightForMs = (durationMs: number) =>
        Math.max(
          1,
          (Math.min(durationMs, MAX_DISPLAYED_FRAME_MS) /
            MAX_DISPLAYED_FRAME_MS) *
            barsHeight
        );

      // The bars of the frames.
      for (const frame of frames) {
        const x = timeToX(frame.frameStartTimeMs);
        const barWidth = Math.max(
          1,
          (frame.frameDurationMs / spanMs) * width - 0.5
        );
        const barHeight = heightForMs(frame.frameDurationMs);
        context.fillStyle =
          frame.frameDurationMs > SLOW_FRAME_THRESHOLD_MS
            ? errorColor
            : primaryColor;
        context.fillRect(
          Math.floor(x),
          barsTop + barsHeight - barHeight,
          barWidth,
          barHeight
        );
      }

      // The 60 frames per second line.
      const thresholdY =
        barsTop + barsHeight - heightForMs(SLOW_FRAME_THRESHOLD_MS);
      context.strokeStyle = textColor;
      context.setLineDash([3, 3]);
      context.lineWidth = 1;
      context.beginPath();
      context.moveTo(0, thresholdY + 0.5);
      context.lineTo(width, thresholdY + 0.5);
      context.stroke();
      context.setLineDash([]);

      // Scene changes.
      context.font = `10px ${gdevelopTheme.chart.fontFamily}`;
      context.textBaseline = 'top';
      context.fillStyle = textColor;
      for (const sceneChange of sceneChanges) {
        const x = Math.floor(timeToX(sceneChange.atMs)) + 0.5;
        context.strokeStyle = textColor;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
        context.fillText(sceneChange.sceneName, x + 3, 1);
      }

      // The selection: everything else is dimmed.
      const shownSelection = dragRange || selectedRange;
      if (shownSelection) {
        const fromX = timeToX(shownSelection.fromMs);
        const toX = timeToX(shownSelection.toMs);
        // Dim what is outside of the selection with the canvas color.
        context.globalAlpha = 0.5;
        context.fillStyle = gdevelopTheme.palette.canvasColor;
        context.fillRect(0, 0, Math.max(0, fromX), height);
        context.fillRect(toX, 0, Math.max(0, width - toX), height);
        context.globalAlpha = 1;
        context.strokeStyle = gdevelopTheme.chart.textColor;
        context.lineWidth = 1;
        context.strokeRect(
          Math.floor(fromX) + 0.5,
          0.5,
          Math.max(1, Math.floor(toX - fromX)),
          height - 1
        );
      }
    },
    [
      frames,
      bounds,
      selectedRange,
      dragRange,
      sceneChanges,
      size,
      spanMs,
      timeToX,
      getContext,
      gdevelopTheme,
    ]
  );

  const getLocalX = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return 0;
    return event.clientX - container.getBoundingClientRect().left;
  };

  const selectFrameAt = (timeMs: number) => {
    if (!frames.length) return;
    const nextIndex = findFirstFrameIndexAtOrAfter(frames, timeMs);
    const frame =
      frames[nextIndex] && frames[nextIndex].frameStartTimeMs === timeMs
        ? frames[nextIndex]
        : frames[Math.max(0, nextIndex - 1)];
    onSelectRange({
      fromMs: frame.frameStartTimeMs,
      toMs: frame.frameStartTimeMs + frame.frameDurationMs,
    });
  };

  const onMouseDown = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    const x = getLocalX(event);
    dragStartRef.current = { x, timeMs: xToTime(x) };
    setDragRange(null);
  };

  const onMouseMove = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart) return;
    const x = getLocalX(event);
    if (Math.abs(x - dragStart.x) < DRAG_THRESHOLD_PX) return;
    const timeMs = xToTime(x);
    setDragRange({
      fromMs: Math.min(dragStart.timeMs, timeMs),
      toMs: Math.max(dragStart.timeMs, timeMs),
    });
  };

  const endDrag = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const dragStart = dragStartRef.current;
    if (!dragStart) return;
    dragStartRef.current = null;
    const x = getLocalX(event);
    if (Math.abs(x - dragStart.x) < DRAG_THRESHOLD_PX) {
      setDragRange(null);
      selectFrameAt(dragStart.timeMs);
      return;
    }
    const timeMs = xToTime(x);
    setDragRange(null);
    onSelectRange({
      fromMs: Math.min(dragStart.timeMs, timeMs),
      toMs: Math.max(dragStart.timeMs, timeMs),
    });
  };

  return (
    <div
      ref={containerRef}
      className={classes.frameStrip}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endDrag}
      onMouseLeave={event => {
        if (dragStartRef.current) endDrag(event);
      }}
      onDoubleClick={() => onSelectRange(null)}
      title={`${formatGameTime(bounds.fromMs)} to ${formatGameTime(
        bounds.toMs
      )}`}
    >
      <canvas ref={canvasRef} className={classes.canvas} />
    </div>
  );
};

export default FrameStrip;
