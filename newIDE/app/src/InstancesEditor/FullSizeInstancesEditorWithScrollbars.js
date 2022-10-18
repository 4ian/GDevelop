// @flow
import React from 'react';
import ViewPosition from './ViewPosition';
import throttle from 'lodash/throttle';
import InstancesEditor, {
  type InstancesEditorPropsWithoutSizeAndScroll,
} from './index';
import { useScreenType } from '../UI/Reponsive/ScreenTypeMeasurer';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import useForceUpdate from '../Utils/UseForceUpdate';
import { useDebounce } from '../Utils/UseDebounce';
import Rectangle from '../Utils/Rectangle';

const SCROLLBAR_DETECTION_WIDTH = 50;
const SCROLLBAR_TRACK_WIDTH = 16;
const SCROLLBAR_THUMB_WIDTH = 8;
const SCROLLBAR_SIZE = 200;
const VERTICAL_SCROLLBAR_PADDING = 1;
const HORIZONTAL_SCROLLBAR_PADDING = 3;

const THROTTLE_TIME = 1000 / 60; // 60 FPS

const styles = {
  container: {
    overflow: 'hidden',
  },
  xScrollbarTrack: {
    position: 'absolute',
    left: 0,
    right: SCROLLBAR_TRACK_WIDTH - VERTICAL_SCROLLBAR_PADDING,
    bottom: 0,
    paddingBottom: HORIZONTAL_SCROLLBAR_PADDING,
  },
  xThumb: {
    position: 'relative',
    width: SCROLLBAR_SIZE,
    height: SCROLLBAR_THUMB_WIDTH,
    backgroundColor: '#8d8d8dcc', // Theme-invariant color
    border: '1px solid transparent',
    boxSizing: 'border-box',
    backgroundClip: 'content-box',
    borderRadius: 4,
    pointerEvents: 'all',
  },
  yScrollbarTrack: {
    position: 'absolute',
    top: 0,
    bottom: SCROLLBAR_TRACK_WIDTH - HORIZONTAL_SCROLLBAR_PADDING,
    right: 0,
    paddingRight: VERTICAL_SCROLLBAR_PADDING,
  },
  yThumb: {
    position: 'relative',
    height: SCROLLBAR_SIZE,
    width: SCROLLBAR_THUMB_WIDTH,
    backgroundColor: '#8d8d8dcc', // Theme-invariant color
    border: '1px solid transparent',
    boxSizing: 'border-box',
    backgroundClip: 'content-box',
    borderRadius: 4,
    pointerEvents: 'all',
  },
};

type Props = {|
  ...InstancesEditorPropsWithoutSizeAndScroll,
  wrappedEditorRef: ?(?InstancesEditor) => void,
|};

const noop = () => {};

const FullSizeInstancesEditorWithScrollbars = (props: Props) => {
  const { wrappedEditorRef, ...otherProps } = props;

  const editorRef = React.useRef<?InstancesEditor>(null);
  const xScrollbarTrack = React.useRef<?HTMLDivElement>(null);
  const xScrollbarThumb = React.useRef<?HTMLDivElement>(null);
  const yScrollbarTrack = React.useRef<?HTMLDivElement>(null);
  const yScrollbarThumb = React.useRef<?HTMLDivElement>(null);

  const showScrollbars = React.useRef(false);
  const timeoutHidingScrollbarsId = React.useRef<?TimeoutID>(null);
  const isDragging = React.useRef(false);

  const xValue = React.useRef(0);
  const yValue = React.useRef(0);
  const xMin = React.useRef(-5000);
  const xMax = React.useRef(5000);
  const yMin = React.useRef(-5000);
  const yMax = React.useRef(5000);
  const canvasWidth = React.useRef(0);
  const canvasHeight = React.useRef(0);

  const forceUpdate = useForceUpdate();

  const canvasRectangle = React.useMemo(() => new Rectangle(), []);

  if (editorRef.current) {
    const elementBoundingRect = editorRef.current.getBoundingClientRect();
    canvasRectangle.set({
      left: elementBoundingRect.left,
      top: elementBoundingRect.top,
      right: elementBoundingRect.right - SCROLLBAR_DETECTION_WIDTH,
      bottom: elementBoundingRect.bottom - SCROLLBAR_DETECTION_WIDTH,
    });
  }

  const hideScrollbarsAfterDelay = React.useCallback(
    () => {
      if (timeoutHidingScrollbarsId.current) {
        clearTimeout(timeoutHidingScrollbarsId.current);
      }
      timeoutHidingScrollbarsId.current = setTimeout(() => {
        showScrollbars.current = false;
        forceUpdate();
      }, 1500);
    },
    [forceUpdate]
  );

  const hideScrollbarsAfterDelayDebounced = useDebounce(() => {
    hideScrollbarsAfterDelay();
  }, 500);

  const onMouseMoveOverInstanceEditor = React.useCallback(
    (event: MouseEvent) => {
      if (!editorRef.current) {
        return;
      }
      let shouldDisplayScrollBars = false;

      shouldDisplayScrollBars = !canvasRectangle.containsPoint(
        event.clientX,
        event.clientY
      );

      if (shouldDisplayScrollBars) {
        if (!showScrollbars.current) {
          showScrollbars.current = true;
          forceUpdate();
        }
        if (timeoutHidingScrollbarsId.current) {
          clearTimeout(timeoutHidingScrollbarsId.current);
          timeoutHidingScrollbarsId.current = null;
        }
      } else {
        if (!isDragging.current) {
          hideScrollbarsAfterDelay();
        }
      }
    },
    [canvasRectangle, forceUpdate, hideScrollbarsAfterDelay]
  );

  // When the mouse is moving after dragging the thumb:
  // - calculate the distance scrolled
  // - update the thumb position with the value
  // - scroll the editor to the new position
  const makeMouseMoveXHandler = React.useCallback(
    (initialMousePosition: number, initialXValue: number) =>
      throttle(
        (e: MouseEvent) => {
          if (!canvasWidth.current) {
            console.error('canvasWidth not initialized');
            return;
          }
          const newMousePosition = e.clientX;
          const distanceMouseScrolledX =
            newMousePosition - initialMousePosition;
          const mouseToPositionRatio =
            (xMax.current - xMin.current) / canvasWidth.current;
          const newXValue =
            initialXValue + distanceMouseScrolledX * mouseToPositionRatio;
          xValue.current = newXValue;
          if (editorRef.current) {
            editorRef.current.scrollTo(newXValue, yValue.current);
          }
          forceUpdate();
        },
        THROTTLE_TIME,
        { leading: false, trailing: true }
      ),
    [forceUpdate]
  );
  const makeMouseMoveYHandler = React.useCallback(
    (initialMousePosition: number, initialYValue: number) =>
      throttle(
        (e: MouseEvent) => {
          if (!canvasHeight.current) {
            console.error('canvasHeight not initialized');
            return;
          }
          const newMousePosition = e.clientY;
          const distanceMouseScrolledY =
            newMousePosition - initialMousePosition;
          const mouseToPositionRatio =
            (yMax.current - yMin.current) / canvasHeight.current;
          const newYValue =
            initialYValue + distanceMouseScrolledY * mouseToPositionRatio;
          yValue.current = newYValue;
          if (editorRef.current) {
            editorRef.current.scrollTo(xValue.current, newYValue);
          }
          forceUpdate();
        },
        THROTTLE_TIME,
        { leading: false, trailing: true }
      ),
    [forceUpdate]
  );

  // When the user releases the thumb, we need to stop listening to mouse move and up events.
  // In the case the user releases outside of the detection zone, we need to hide the scrollbars.
  const makeMouseUpXThumbHandler = React.useCallback(
    mouseMoveHandler =>
      function mouseUpHandler(e: MouseEvent) {
        isDragging.current = false;
        // If the user releases the mouse outside of the detection zone, we want to hide the scrollbars.
        if (
          e.target !== xScrollbarTrack.current &&
          e.target !== xScrollbarThumb.current
        ) {
          hideScrollbarsAfterDelay();
        }
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      },
    [hideScrollbarsAfterDelay]
  );
  const makeMouseUpYThumbHandler = React.useCallback(
    mouseMoveHandler =>
      function mouseUpHandler(e: MouseEvent) {
        isDragging.current = false;
        // If the user releases the mouse outside of the detection zone, we want to hide the scrollbars.
        if (
          e.target !== yScrollbarTrack.current &&
          e.target !== yScrollbarThumb.current
        ) {
          hideScrollbarsAfterDelay();
        }
        document.removeEventListener('mousemove', mouseMoveHandler);
        document.removeEventListener('mouseup', mouseUpHandler);
      },
    [hideScrollbarsAfterDelay]
  );

  // When the user clicks on the thumbs, we register new events:
  // - mousemove: to move the thumb
  // - mouseup: to stop moving the thumb
  // We also note down where the user clicked on the thumb, so that we can
  // move the thumb relative to this position.
  const mouseDownXThumbHandler = React.useCallback(
    (e: MouseEvent) => {
      isDragging.current = true;
      const initialDragPosition = e.clientX;
      // xStartScrollValue.current = xValue.current;
      const mouseMoveHandler = makeMouseMoveXHandler(
        initialDragPosition,
        xValue.current
      );
      const mouseUpHandler = makeMouseUpXThumbHandler(mouseMoveHandler);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    },
    [makeMouseMoveXHandler, makeMouseUpXThumbHandler]
  );
  const mouseDownYThumbHandler = React.useCallback(
    (e: MouseEvent) => {
      isDragging.current = true;
      const initialDragPosition = e.clientY;
      const mouseMoveHandler = makeMouseMoveYHandler(
        initialDragPosition,
        yValue.current
      );
      const mouseUpHandler = makeMouseUpYThumbHandler(mouseMoveHandler);

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    },
    [makeMouseMoveYHandler, makeMouseUpYThumbHandler]
  );

  // Add the mouse down events once on mount.
  React.useEffect(
    () => {
      const xScrollbarThumbElement = xScrollbarThumb.current;
      const yScrollbarThumbElement = yScrollbarThumb.current;
      if (!xScrollbarThumbElement || !yScrollbarThumbElement) return;

      xScrollbarThumbElement.addEventListener(
        'mousedown',
        mouseDownXThumbHandler
      );
      yScrollbarThumbElement.addEventListener(
        'mousedown',
        mouseDownYThumbHandler
      );
    },
    [mouseDownXThumbHandler, mouseDownYThumbHandler]
  );

  const setAndAdjust = React.useCallback(
    ({
      newXValue,
      newYValue,
      newWidth,
      newHeight,
    }: {
      newXValue: number,
      newYValue: number,
      newWidth: number,
      newHeight: number,
    }) => {
      xMax.current = Math.max(Math.abs(newXValue) + 100, xMax.current);
      yMax.current = Math.max(Math.abs(newYValue) + 100, yMax.current);
      xMin.current = -xMax.current;
      yMin.current = -yMax.current;
      xValue.current = newXValue;
      yValue.current = newYValue;
      canvasWidth.current = newWidth;
      canvasHeight.current = newHeight;
      if (!showScrollbars.current) {
        showScrollbars.current = true;
      }
      hideScrollbarsAfterDelayDebounced();
      forceUpdate();
    },
    [forceUpdate, hideScrollbarsAfterDelayDebounced]
  );

  const handleViewPositionChange = React.useCallback(
    (viewPosition: ?ViewPosition) =>
      throttle(
        () => {
          if (!viewPosition) return;

          setAndAdjust({
            newXValue: viewPosition.getViewX(),
            newYValue: viewPosition.getViewY(),
            newWidth: viewPosition.getWidth(),
            newHeight: viewPosition.getHeight(),
          });
        },
        THROTTLE_TIME, // Throttle the updates after a scroll to avoid make lots of updates in a row that would kill CPU.
        { leading: false, trailing: true }
      )(),
    [setAndAdjust]
  );

  // Ensure the X Scrollbar doesn't go out of bounds.
  const minXScrollbarLeftPosition = '0%';
  const maxXScrollbarLeftPosition = `calc(100% - ${SCROLLBAR_SIZE}px - ${SCROLLBAR_TRACK_WIDTH}px)`;
  const expectedXScrollbarLeftPosition = `calc(${((xValue.current -
    xMin.current) /
    (xMax.current - xMin.current)) *
    100 +
    '%'} - ${SCROLLBAR_SIZE}px / 2)`;
  const xScrollbarLeftPosition = `max(min(${expectedXScrollbarLeftPosition}, ${maxXScrollbarLeftPosition}), ${minXScrollbarLeftPosition})`;

  // Ensure the Y Scrollbar doesn't go out of bounds.
  const minYScrollbarTopPosition = '0%';
  const maxYScrollbarTopPosition = `calc(100% - ${SCROLLBAR_SIZE}px - ${SCROLLBAR_TRACK_WIDTH}px)`;
  const expectedYScrollbarTopPosition = `calc(${((yValue.current -
    yMin.current) /
    (yMax.current - yMin.current)) *
    100 +
    '%'} - ${SCROLLBAR_SIZE}px / 2)`;
  const yScrollbarTopPosition = `max(min(${expectedYScrollbarTopPosition}, ${maxYScrollbarTopPosition}), ${minYScrollbarTopPosition})`;

  const screenType = useScreenType();

  return (
    <FullSizeMeasurer>
      {({ width, height }) => (
        <div style={styles.container}>
          {width !== undefined && height !== undefined && (
            <InstancesEditor
              onViewPositionChanged={
                screenType !== 'touch' ? handleViewPositionChange : noop
              }
              ref={(editor: ?InstancesEditor) => {
                wrappedEditorRef && wrappedEditorRef(editor);
                editorRef.current = editor;
              }}
              width={width}
              height={height}
              screenType={screenType}
              onMouseMove={onMouseMoveOverInstanceEditor}
              {...otherProps}
            />
          )}
          {screenType !== 'touch' && (
            <div
              style={{
                ...styles.yScrollbarTrack,
                // Keep it in the DOM, so we can register the mouse down event.
                visibility: showScrollbars.current ? 'visible' : 'hidden',
              }}
              ref={yScrollbarTrack}
            >
              <div
                style={{
                  ...styles.yThumb,
                  top: yScrollbarTopPosition,
                }}
                ref={yScrollbarThumb}
              />
            </div>
          )}
          {screenType !== 'touch' && (
            <div
              style={{
                ...styles.xScrollbarTrack,
                // Keep it in the DOM, so we can register the mouse down event.
                visibility: showScrollbars.current ? 'visible' : 'hidden',
              }}
              ref={xScrollbarTrack}
            >
              <div
                style={{
                  ...styles.xThumb,
                  marginLeft: xScrollbarLeftPosition,
                }}
                ref={xScrollbarThumb}
              />
            </div>
          )}
        </div>
      )}
    </FullSizeMeasurer>
  );
};

export default FullSizeInstancesEditorWithScrollbars;
