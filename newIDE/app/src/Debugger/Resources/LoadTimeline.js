// @flow
import { Trans } from '@lingui/macro';
import * as React from 'react';
import GDevelopThemeContext from '../../UI/Theme/GDevelopThemeContext';
import Text from '../../UI/Text';
import FlatButton from '../../UI/FlatButton';
import { type ProfilerRecordingRange } from '../ProfilerRecording/ProfilerRecordingStore';
import { formatGameTime } from '../ProfilerRecording/ProfilerRecordingAggregation';
import { useCanvasWithDevicePixelRatio } from '../useCanvasWithDevicePixelRatio';
import { getResourceKindColor } from '../themeColors';
import Paper from '../../UI/Paper';
import {
  describeOrigin,
  formatBytes,
  formatDurationMs,
  getLoadDurationMs,
  type ResourceLoadRecord,
  type ResourcesDebugState,
} from './ResourcesDebugTypes';
import RangeBrush from '../RangeBrush';
import classes from './Resources.module.css';

type Props = {|
  state: ResourcesDebugState,
  /** The resources shown (after filtering). */
  records: Array<ResourceLoadRecord>,
  /** The recording of the profiler, to show where it is on the timeline. */
  profilerRecordingRange: ?ProfilerRecordingRange,
  selectedResourceName: ?string,
  onSelectResource: (?string) => void,
  /** Changes when the user asks to look at the selected resource (F key). */
  focusRequest: ?{| resourceName: string, requestId: number |},
|};

const RULER_HEIGHT = 16;
const ROW_HEIGHT = 6;
const ROW_GAP = 1;
const tooltipPaperStyle = { padding: '6px 8px', maxWidth: 280 };

type TimelineRow = {|
  record: ResourceLoadRecord,
  startMs: number,
  loadedMs: number,
  endMs: number,
|};

/**
 * When each resource was loaded, from the start of the game: one thin bar
 * per resource (download, then processing), sorted by start. Wheel to zoom,
 * drag to pan, double click to see everything.
 */
const LoadTimeline = ({
  state,
  records,
  profilerRecordingRange,
  selectedResourceName,
  onSelectResource,
  focusRequest,
}: Props): React.Node => {
  const gdevelopTheme = React.useContext(GDevelopThemeContext);
  const {
    containerRef,
    canvasRef,
    size,
    getContext,
  } = useCanvasWithDevicePixelRatio();
  const [view, setView] = React.useState<?ProfilerRecordingRange>(null);
  const [hoveredRow, setHoveredRow] = React.useState<?{|
    row: TimelineRow,
    x: number,
    y: number,
  |}>(null);
  const panStartRef = React.useRef<?{|
    x: number,
    y: number,
    view: ProfilerRecordingRange,
    verticalScrollPx: number,
  |}>(null);

  const rows: Array<TimelineRow> = React.useMemo(
    () =>
      records
        .filter(record => record.loadStartedAtMs != null)
        .map(record => {
          const startMs = record.loadStartedAtMs || 0;
          const loadedMs =
            record.loadedAtMs != null ? record.loadedAtMs : startMs;
          const endMs =
            record.readyAtMs != null
              ? record.readyAtMs
              : record.status === 'loading' || record.status === 'processing'
              ? state.generatedAtMs
              : loadedMs;
          return { record, startMs, loadedMs, endMs: Math.max(endMs, startMs) };
        })
        .sort((a, b) => a.startMs - b.startMs),
    [records, state.generatedAtMs]
  );

  const bounds: ProfilerRecordingRange = React.useMemo(
    () => {
      let fromMs = 0;
      let toMs = state.generatedAtMs;
      for (const row of rows) toMs = Math.max(toMs, row.endMs);
      return { fromMs, toMs: Math.max(toMs, fromMs + 1) };
    },
    [rows, state.generatedAtMs]
  );
  // By default, look at the loadings themselves: a game that loaded
  // everything at startup would otherwise show a thin bar in an empty strip.
  const fittedView: ProfilerRecordingRange = React.useMemo(
    () => {
      if (!rows.length) return bounds;
      let fromMs = Infinity;
      let toMs = -Infinity;
      for (const row of rows) {
        fromMs = Math.min(fromMs, row.startMs);
        toMs = Math.max(toMs, row.endMs);
      }
      const paddingMs = Math.max(10, (toMs - fromMs) * 0.05);
      return {
        fromMs: Math.max(bounds.fromMs, fromMs - paddingMs),
        toMs: Math.min(bounds.toMs, toMs + paddingMs),
      };
    },
    [rows, bounds]
  );
  const shownView = view || fittedView;

  // Zoom on a resource when asked (F key on the selected row).
  React.useEffect(
    () => {
      if (!focusRequest) return;
      const row = rows.find(
        row => row.record.name === focusRequest.resourceName
      );
      if (!row) return;
      const durationMs = Math.max(10, row.endMs - row.startMs);
      setView({
        fromMs: Math.max(bounds.fromMs, row.startMs - durationMs * 0.5),
        toMs: Math.min(bounds.toMs, row.endMs + durationMs * 0.5),
      });
    },
    [focusRequest] // eslint-disable-line react-hooks/exhaustive-deps
  );
  const viewSpanMs = Math.max(1, shownView.toMs - shownView.fromMs);
  const timeToX = React.useCallback(
    (timeMs: number) => ((timeMs - shownView.fromMs) / viewSpanMs) * size.width,
    [shownView.fromMs, viewSpanMs, size.width]
  );

  // Vertical zoom: 1 fits every row in the strip, more makes rows taller
  // (and the strip scrollable).
  const [verticalZoom, setVerticalZoom] = React.useState(1);
  const [verticalScrollPx, setVerticalScrollPx] = React.useState(0);
  const rowsAreaHeight = Math.max(1, size.height - RULER_HEIGHT);
  const rowStride =
    Math.min(ROW_HEIGHT + ROW_GAP, rowsAreaHeight / Math.max(1, rows.length)) *
    verticalZoom;
  const maximumVerticalScrollPx = Math.max(
    0,
    rows.length * rowStride - rowsAreaHeight
  );
  const clampedVerticalScrollPx = Math.min(
    verticalScrollPx,
    maximumVerticalScrollPx
  );

  React.useEffect(
    () => {
      const context = getContext();
      if (!context) return;
      const { width, height } = size;
      const backgroundColor = gdevelopTheme.palette.alternateCanvasColor;
      const textColor = gdevelopTheme.text.color.primary;
      const secondaryTextColor = gdevelopTheme.text.color.secondary;

      context.clearRect(0, 0, width, height);
      context.fillStyle = backgroundColor;
      context.fillRect(0, 0, width, height);
      context.font = `10px ${gdevelopTheme.chart.fontFamily}`;
      context.textBaseline = 'top';

      // The profiler recording window.
      if (profilerRecordingRange) {
        const fromX = timeToX(profilerRecordingRange.fromMs);
        const toX = timeToX(profilerRecordingRange.toMs);
        context.fillStyle = gdevelopTheme.chart.dataColor1;
        context.globalAlpha = 0.12;
        context.fillRect(fromX, 0, Math.max(1, toX - fromX), height);
        context.globalAlpha = 1;
      }

      // Scene changes.
      for (const sceneChange of state.sceneChanges) {
        const x = Math.floor(timeToX(sceneChange.atMs)) + 0.5;
        if (x < 0 || x > width) continue;
        context.strokeStyle = secondaryTextColor;
        context.lineWidth = 1;
        context.beginPath();
        context.moveTo(x, 0);
        context.lineTo(x, height);
        context.stroke();
        context.fillStyle = secondaryTextColor;
        context.fillText(sceneChange.sceneName, x + 3, 2);
      }

      // The ruler ticks.
      const tickCount = Math.max(2, Math.floor(width / 90));
      context.fillStyle = secondaryTextColor;
      for (let tickIndex = 0; tickIndex <= tickCount; tickIndex++) {
        const timeMs = shownView.fromMs + (viewSpanMs * tickIndex) / tickCount;
        const x = timeToX(timeMs);
        context.fillText(
          formatGameTime(timeMs),
          Math.min(x + 2, width - 44),
          RULER_HEIGHT - 12
        );
      }

      // The bars.
      rows.forEach((row, rowIndex) => {
        const y = RULER_HEIGHT + rowIndex * rowStride - clampedVerticalScrollPx;
        const barHeight = Math.max(1, rowStride - ROW_GAP);
        if (y + barHeight < RULER_HEIGHT || y > height) return;
        const startX = timeToX(row.startMs);
        const loadedX = timeToX(row.loadedMs);
        const endX = timeToX(row.endMs);
        if (endX < 0 || startX > width) return;
        const isSelected = row.record.name === selectedResourceName;
        const isHovered = hoveredRow && hoveredRow.row === row;
        const color =
          row.record.status === 'error'
            ? gdevelopTheme.statusIndicator.error
            : getResourceKindColor(gdevelopTheme, row.record.kind, rowIndex);
        // Download: full color. Processing: lighter.
        context.fillStyle = color;
        context.fillRect(startX, y, Math.max(1, loadedX - startX), barHeight);
        context.globalAlpha = 0.5;
        context.fillRect(loadedX, y, Math.max(0, endX - loadedX), barHeight);
        context.globalAlpha = 1;
        // Unloads: a mark.
        for (const unload of row.record.unloadHistory) {
          const unloadX = Math.floor(timeToX(unload.unloadedAtMs)) + 0.5;
          context.strokeStyle = textColor;
          context.beginPath();
          context.moveTo(unloadX, y);
          context.lineTo(unloadX, y + barHeight);
          context.stroke();
        }
        if (isSelected || isHovered) {
          context.strokeStyle = textColor;
          context.lineWidth = 1;
          context.strokeRect(
            startX - 0.5,
            y - 0.5,
            Math.max(2, endX - startX) + 1,
            barHeight + 1
          );
        }
      });
    },
    [
      rows,
      state.sceneChanges,
      shownView,
      viewSpanMs,
      size,
      rowStride,
      clampedVerticalScrollPx,
      hoveredRow,
      selectedResourceName,
      profilerRecordingRange,
      timeToX,
      getContext,
      gdevelopTheme,
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

  const findRowAt = (x: number, y: number): ?TimelineRow => {
    if (y < RULER_HEIGHT) return null;
    const rowIndex = Math.floor(
      (y - RULER_HEIGHT + clampedVerticalScrollPx) / rowStride
    );
    const row = rows[rowIndex];
    if (!row) return null;
    const timeMs = shownView.fromMs + (x / size.width) * viewSpanMs;
    // A few pixels of tolerance, as bars can be thinner than a pixel.
    const toleranceMs = (3 / size.width) * viewSpanMs;
    return timeMs >= row.startMs - toleranceMs &&
      timeMs <= row.endMs + toleranceMs
      ? row
      : null;
  };

  const onWheel = (event: SyntheticWheelEvent<HTMLDivElement>) => {
    if (!size.width) return;
    event.preventDefault();
    if (event.ctrlKey || event.metaKey) {
      // Ctrl + wheel: vertical zoom, anchored on the row under the mouse.
      const { y } = getLocalPosition(event);
      const zoomFactor = Math.exp(-event.deltaY * 0.002);
      const newVerticalZoom = Math.max(
        1,
        Math.min(20, verticalZoom * zoomFactor)
      );
      const anchorRowPx = y - RULER_HEIGHT + clampedVerticalScrollPx;
      const newScrollPx =
        (anchorRowPx * newVerticalZoom) / verticalZoom - (y - RULER_HEIGHT);
      setVerticalZoom(newVerticalZoom);
      setVerticalScrollPx(Math.max(0, newScrollPx));
      return;
    }
    if (event.shiftKey) {
      // Shift + wheel: vertical scroll.
      setVerticalScrollPx(
        Math.max(
          0,
          Math.min(
            maximumVerticalScrollPx,
            clampedVerticalScrollPx + event.deltaY
          )
        )
      );
      return;
    }
    const { x } = getLocalPosition(event);
    const anchorMs = shownView.fromMs + (x / size.width) * viewSpanMs;
    const zoomFactor = Math.exp(event.deltaY * 0.002);
    const newSpanMs = Math.max(
      10,
      Math.min(bounds.toMs - bounds.fromMs, viewSpanMs * zoomFactor)
    );
    let fromMs = anchorMs - (x / size.width) * newSpanMs;
    fromMs = Math.max(bounds.fromMs, Math.min(bounds.toMs - newSpanMs, fromMs));
    setView({ fromMs, toMs: fromMs + newSpanMs });
  };

  const onMouseMove = (event: SyntheticMouseEvent<HTMLDivElement>) => {
    const { x, y } = getLocalPosition(event);
    const panStart = panStartRef.current;
    if (panStart && size.width) {
      const deltaMs = ((panStart.x - x) / size.width) * viewSpanMs;
      let fromMs = panStart.view.fromMs + deltaMs;
      fromMs = Math.max(
        bounds.fromMs,
        Math.min(bounds.toMs - viewSpanMs, fromMs)
      );
      setView({ fromMs, toMs: fromMs + viewSpanMs });
      // Dragging also scrolls vertically when the rows are zoomed.
      setVerticalScrollPx(
        Math.max(
          0,
          Math.min(
            maximumVerticalScrollPx,
            panStart.verticalScrollPx + (panStart.y - y)
          )
        )
      );
      setHoveredRow(null);
      return;
    }
    const row = findRowAt(x, y);
    setHoveredRow(row ? { row, x, y } : null);
  };

  return (
    <div className={classes.section}>
      <div className={classes.sectionTitleRow}>
        <Text noMargin size="body-small" color="secondary">
          <Trans>
            When each resource was loaded ({rows.length} resources), since the
            game started
          </Trans>
        </Text>
        {profilerRecordingRange && (
          <FlatButton
            label={<Trans>Focus on the recording</Trans>}
            onClick={() =>
              setView({
                fromMs: Math.max(bounds.fromMs, profilerRecordingRange.fromMs),
                toMs: Math.min(bounds.toMs, profilerRecordingRange.toMs),
              })
            }
          />
        )}
      </div>
      <div
        ref={containerRef}
        className={classes.loadTimeline}
        onWheel={onWheel}
        onMouseDown={event => {
          if (event.button !== 0) return;
          const { x, y } = getLocalPosition(event);
          panStartRef.current = {
            x,
            y,
            view: shownView,
            verticalScrollPx: clampedVerticalScrollPx,
          };
        }}
        onMouseMove={onMouseMove}
        onMouseUp={event => {
          const panStart = panStartRef.current;
          panStartRef.current = null;
          if (
            panStart &&
            Math.abs(getLocalPosition(event).x - panStart.x) < 3
          ) {
            const { x, y } = getLocalPosition(event);
            const row = findRowAt(x, y);
            onSelectResource(
              row && row.record.name !== selectedResourceName
                ? row.record.name
                : null
            );
          }
        }}
        onMouseLeave={() => {
          panStartRef.current = null;
          setHoveredRow(null);
        }}
        onDoubleClick={() => {
          setView(null);
          setVerticalZoom(1);
          setVerticalScrollPx(0);
        }}
      >
        <canvas ref={canvasRef} className={classes.canvas} />
        {hoveredRow && (
          <div
            className={classes.tooltip}
            style={{
              left: Math.min(hoveredRow.x + 12, Math.max(0, size.width - 280)),
              top: Math.min(hoveredRow.y + 14, Math.max(0, size.height - 70)),
            }}
          >
            <Paper background="light" elevation={4} style={tooltipPaperStyle}>
              <Text noMargin size="body-small">
                {hoveredRow.row.record.name} ({hoveredRow.row.record.kind})
              </Text>
              <Text noMargin size="body-small" color="secondary">
                {describeOrigin(hoveredRow.row.record.origin)} - started at{' '}
                {formatGameTime(hoveredRow.row.startMs)}, took{' '}
                {formatDurationMs(getLoadDurationMs(hoveredRow.row.record))}
                {hoveredRow.row.record.estimatedMemoryBytes != null
                  ? ` - ${formatBytes(
                      hoveredRow.row.record.estimatedMemoryBytes
                    )}`
                  : ''}
              </Text>
            </Paper>
          </div>
        )}
      </div>
      <RangeBrush
        bounds={bounds}
        range={shownView}
        onChange={setView}
        formatTime={formatGameTime}
      />
    </div>
  );
};

export default LoadTimeline;
