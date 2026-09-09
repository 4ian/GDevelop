// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import EmptyMessage from '../../UI/EmptyMessage';
import {
  type ProfilerFrame,
  type ProfilerRecordingRange,
} from '../ProfilerRecording/ProfilerRecordingStore';
import {
  formatGameTime,
  formatMilliseconds,
} from '../ProfilerRecording/ProfilerRecordingAggregation';
import { useCanvasWithDevicePixelRatio } from '../useCanvasWithDevicePixelRatio';
import { getSectionColor } from '../themeColors';
import Paper from '../../UI/Paper';
import classes from './Profiler.module.css';

type Props = {|
  frames: Array<ProfilerFrame>,
  names: Array<string>,
  range: ProfilerRecordingRange,
|};

/** Above this many frames, the chart would be unreadable: ask to zoom in. */
export const MAX_FRAMES_IN_FLAME_CHART = 120;
const RULER_HEIGHT = 18;
const ROW_HEIGHT = 18;
const MIN_TEXT_WIDTH_PX = 30;
const tooltipPaperStyle = { padding: '6px 8px', maxWidth: 240 };

type HoveredSpan = {|
  frame: ProfilerFrame,
  spanIndex: number,
  x: number,
  y: number,
|};

/**
 * The sections of the selected frames, drawn like the flame chart of a
 * browser: time from left to right, nesting from top to bottom. Wheel to
 * zoom, drag to pan, double click to see the whole selection again.
 */
const FlameChart = ({ frames, names, range }: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    containerRef,
    canvasRef,
    size,
    getContext,
  } = useCanvasWithDevicePixelRatio();
  const [view, setView] = React.useState<ProfilerRecordingRange>(range);
  const [hoveredSpan, setHoveredSpan] = React.useState<?HoveredSpan>(null);
  const panStartRef = React.useRef<?{|
    x: number,
    view: ProfilerRecordingRange,
  |}>(null);

  // Look at the whole selection whenever it changes.
  React.useEffect(
    () => {
      setView(range);
    },
    [range.fromMs, range.toMs] // eslint-disable-line react-hooks/exhaustive-deps
  );

  const viewSpanMs = Math.max(0.001, view.toMs - view.fromMs);
  const timeToX = React.useCallback(
    (timeMs: number) => ((timeMs - view.fromMs) / viewSpanMs) * size.width,
    [view.fromMs, viewSpanMs, size.width]
  );

  const maxDepth = React.useMemo(
    () => {
      let depth = 0;
      for (const frame of frames) {
        for (const spanDepth of frame.depths) {
          if (spanDepth > depth) depth = spanDepth;
        }
      }
      return depth;
    },
    [frames]
  );

  const isTooManyFrames = frames.length > MAX_FRAMES_IN_FLAME_CHART;

  React.useEffect(
    () => {
      const context = getContext();
      if (!context || isTooManyFrames) return;
      const { width, height } = size;
      const backgroundColor = gdevelopTheme.palette.alternateCanvasColor;
      const textColor = gdevelopTheme.text.color.primary;
      const secondaryTextColor = gdevelopTheme.text.color.secondary;

      context.clearRect(0, 0, width, height);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
      context.font = `11px ${gdevelopTheme.chart.fontFamily}`;
      context.textBaseline = 'middle';

      // Frame boundaries and the ruler.
      for (const frame of frames) {
        const startX = timeToX(frame.frameStartTimeMs);
        const endX = timeToX(frame.frameStartTimeMs + frame.frameDurationMs);
        if (endX < 0 || startX > width) continue;
        context.strokeStyle = secondaryTextColor;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(Math.floor(startX) + 0.5, 0);
        context.lineTo(Math.floor(startX) + 0.5, height);
        context.stroke();
        if (endX - startX > 60) {
          context.fillStyle = secondaryTextColor;
          context.fillText(
            `#${frame.frameIndex} ${formatMilliseconds(frame.frameDurationMs)}`,
            startX + 4,
            RULER_HEIGHT / 2,
            endX - startX - 8
          );
        }
      }

      // The spans.
      for (const frame of frames) {
        for (let spanIndex = 0; spanIndex < frame.nameIds.length; spanIndex++) {
          const spanStartMs =
            frame.frameStartTimeMs + frame.startsMs[spanIndex];
          const startX = timeToX(spanStartMs);
          const spanWidth = (frame.durationsMs[spanIndex] / viewSpanMs) * width;
          if (startX + spanWidth < 0 || startX > width || spanWidth < 0.3) {
            continue;
          }
          const y = RULER_HEIGHT + frame.depths[spanIndex] * ROW_HEIGHT;
          const name = names[frame.nameIds[spanIndex]] || '?';
          const isHovered =
            hoveredSpan &&
            hoveredSpan.frame === frame &&
            hoveredSpan.spanIndex === spanIndex;
          context.fillStyle = getSectionColor(gdevelopTheme, name);
          context.fillRect(
            startX,
            y + 1,
            Math.max(0.5, spanWidth - 0.5),
            ROW_HEIGHT - 2
          );
          if (isHovered) {
            context.strokeStyle = textColor;
            context.lineWidth = 1.5;
            context.strokeRect(
              startX,
              y + 1,
              Math.max(0.5, spanWidth - 0.5),
              ROW_HEIGHT - 2
            );
          }
          if (spanWidth > MIN_TEXT_WIDTH_PX) {
            context.fillStyle = gdevelopTheme.text.color.primary;
            context.fillText(
              name,
              Math.max(2, startX) + 3,
              y + ROW_HEIGHT / 2,
              Math.min(spanWidth, width - Math.max(0, startX)) - 6
            );
          }
        }
      }
    },
    [
      frames,
      names,
      view,
      viewSpanMs,
      size,
      hoveredSpan,
      isTooManyFrames,
      gdevelopTheme,
      timeToX,
      getContext,
    ]
  );

  const getLocalPosition = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0 };
    const rectangle = container.getBoundingClientRect();
    return {
      x: event.clientX - rectangle.left,
      y: event.clientY - rectangle.top,
    };
  };

  const findSpanAt = (x: number, y: number): ?HoveredSpan => {
    if (y < RULER_HEIGHT) return null;
    const depth = Math.floor((y - RULER_HEIGHT) / ROW_HEIGHT);
    const timeMs = view.fromMs + (x / size.width) * viewSpanMs;
    for (const frame of frames) {
      if (
        timeMs < frame.frameStartTimeMs ||
        timeMs > frame.frameStartTimeMs + frame.frameDurationMs
      ) {
        continue;
      }
      const relativeMs = timeMs - frame.frameStartTimeMs;
      for (
        let spanIndex = frame.nameIds.length - 1;
        spanIndex >= 0;
        spanIndex--
      ) {
        if (
          frame.depths[spanIndex] === depth &&
          relativeMs >= frame.startsMs[spanIndex] &&
          relativeMs <= frame.startsMs[spanIndex] + frame.durationsMs[spanIndex]
        ) {
          return { frame, spanIndex, x, y };
        }
      }
    }
    return null;
  };

  const onWheel = (event: SyntheticWheelEvent<HTMLDivElement>) => {
    if (!size.width) return;
    event.preventDefault();
    const { x } = getLocalPosition(event);
    const anchorMs = view.fromMs + (x / size.width) * viewSpanMs;
    const zoomFactor = Math.exp(event.deltaY * 0.002);
    const newSpanMs = Math.max(
      0.05,
      Math.min(range.toMs - range.fromMs, viewSpanMs * zoomFactor)
    );
    let fromMs = anchorMs - (x / size.width) * newSpanMs;
    fromMs = Math.max(range.fromMs, Math.min(range.toMs - newSpanMs, fromMs));
    setView({ fromMs, toMs: fromMs + newSpanMs });
  };

  const onMouseDown = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    if (event.button !== 0) return;
    panStartRef.current = { x: getLocalPosition(event).x, view };
  };

  const onMouseMove = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const { x, y } = getLocalPosition(event);
    const panStart = panStartRef.current;
    if (panStart && size.width) {
      const deltaMs = ((panStart.x - x) / size.width) * viewSpanMs;
      let fromMs = panStart.view.fromMs + deltaMs;
      fromMs = Math.max(
        range.fromMs,
        Math.min(range.toMs - viewSpanMs, fromMs)
      );
      setView({ fromMs, toMs: fromMs + viewSpanMs });
      setHoveredSpan(null);
      return;
    }
    setHoveredSpan(findSpanAt(x, y));
  };

  const endPan = () => {
    panStartRef.current = null;
  };

  if (isTooManyFrames) {
    return (
      <div className={classes.flameChart}>
        <EmptyMessage>
          <Trans>
            {frames.length} frames are selected: select fewer frames (at most{' '}
            {MAX_FRAMES_IN_FLAME_CHART}) on the strip above to see them in
            detail here. The table below still covers the whole selection.
          </Trans>
        </EmptyMessage>
      </div>
    );
  }

  const chartHeight = RULER_HEIGHT + (maxDepth + 1) * ROW_HEIGHT + 4;
  const hoveredName = hoveredSpan
    ? names[hoveredSpan.frame.nameIds[hoveredSpan.spanIndex]] || '?'
    : null;

  return (
    <div
      ref={containerRef}
      className={classes.flameChart}
      style={{ height: Math.max(80, chartHeight) }}
      onWheel={onWheel}
      onMouseDown={onMouseDown}
      onMouseMove={onMouseMove}
      onMouseUp={endPan}
      onMouseLeave={() => {
        endPan();
        setHoveredSpan(null);
      }}
      onDoubleClick={() => setView(range)}
    >
      <canvas ref={canvasRef} className={classes.canvas} />
      {hoveredSpan && hoveredName != null && (
        <div
          className={classes.tooltip}
          style={{
            left: Math.min(hoveredSpan.x + 12, Math.max(0, size.width - 240)),
            top: hoveredSpan.y + 14,
          }}
        >
          <Paper background="light" elevation={4} style={tooltipPaperStyle}>
            <Text noMargin size="body-small">
              {hoveredName}
            </Text>
            <Text noMargin size="body-small" color="secondary">
              {formatMilliseconds(
                hoveredSpan.frame.durationsMs[hoveredSpan.spanIndex]
              )}{' '}
              (
              {(
                (hoveredSpan.frame.durationsMs[hoveredSpan.spanIndex] /
                  Math.max(0.001, hoveredSpan.frame.frameDurationMs)) *
                100
              ).toFixed(1)}
              % of frame #{hoveredSpan.frame.frameIndex}) at{' '}
              {formatGameTime(
                hoveredSpan.frame.frameStartTimeMs +
                  hoveredSpan.frame.startsMs[hoveredSpan.spanIndex]
              )}
            </Text>
          </Paper>
        </div>
      )}
    </div>
  );
};

export default FlameChart;
