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

const SCROLLBAR_DETECTION_WIDTH = 50;
const SCROLLBAR_TRACK_WIDTH = 16;
const SCROLLBAR_THUMB_WIDTH = 8;
const SCROLLBAR_SIZE = 200;
const SCROLLBAR_MARGIN = (SCROLLBAR_TRACK_WIDTH - SCROLLBAR_THUMB_WIDTH) / 2;

const THROTTLE_TIME = 1000 / 60; // 60 FPS

const styles = {
  container: {
    overflow: 'hidden',
  },
  xScrollbarDetectionZone: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    height: SCROLLBAR_DETECTION_WIDTH,
  },
  xScrollbarTrack: {
    position: 'relative',
    display: 'inline-block',
    width: '100%',
    marginTop: SCROLLBAR_DETECTION_WIDTH - SCROLLBAR_TRACK_WIDTH,
    marginRight: SCROLLBAR_TRACK_WIDTH - SCROLLBAR_MARGIN, // leave some margin for the vertical scrollbar
    height: SCROLLBAR_TRACK_WIDTH,
  },
  xThumb: {
    position: 'relative',
    width: SCROLLBAR_SIZE,
    marginTop: SCROLLBAR_MARGIN,
    height: SCROLLBAR_THUMB_WIDTH,
    backgroundColor: '#1D1D26',
    outline: '2px solid #FAFAFA',
    opacity: 0.3,
    borderRadius: 4,
  },
  yScrollbarDetectionZone: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    right: 0,
    width: SCROLLBAR_DETECTION_WIDTH,
  },
  yScrollbarTrack: {
    position: 'relative',
    display: 'inline-block',
    height: '100%',
    marginLeft: SCROLLBAR_DETECTION_WIDTH - SCROLLBAR_TRACK_WIDTH,
    marginBottom: SCROLLBAR_TRACK_WIDTH - SCROLLBAR_MARGIN, // leave some margin for the vertical scrollbar
    width: SCROLLBAR_TRACK_WIDTH,
  },
  yThumb: {
    position: 'relative',
    height: SCROLLBAR_SIZE,
    marginLeft: SCROLLBAR_MARGIN,
    width: SCROLLBAR_THUMB_WIDTH,
    backgroundColor: '#1D1D26',
    outline: '1px solid #FAFAFA',
    opacity: 0.3,
    borderRadius: 4,
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
  const xScrollbarDetectionZone = React.useRef<?HTMLDivElement>(null);
  const xScrollbarTrack = React.useRef<?HTMLDivElement>(null);
  const xScrollbarThumb = React.useRef<?HTMLDivElement>(null);
  const yScrollbarDetectionZone = React.useRef<?HTMLDivElement>(null);
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

  // If the mouse gets out of the detection zone, whilst not dragging, hide the scrollbars.
  const mouseOutDetectionZoneHandler = React.useCallback(
    (e: MouseEvent) => {
      if (!isDragging.current) {
        hideScrollbarsAfterDelay();
      }
    },
    [hideScrollbarsAfterDelay]
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
          e.target !== xScrollbarDetectionZone.current &&
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
          e.target !== yScrollbarDetectionZone.current &&
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

  // When the mouse is over the detection zone, show the scrollbars,
  // and ensure the timeout to hide them is cleared.
  const mouseOverDetectionZoneHandler = React.useCallback(
    (e: MouseEvent) => {
      if (!showScrollbars.current) {
        showScrollbars.current = true;
        forceUpdate();
      }
      if (timeoutHidingScrollbarsId.current) {
        clearTimeout(timeoutHidingScrollbarsId.current);
        timeoutHidingScrollbarsId.current = null;
      }
    },
    [forceUpdate]
  );

  // Add the mouse over and out events once on mount.
  React.useEffect(
    () => {
      const xScrollbarDetectionZoneElement = xScrollbarDetectionZone.current;
      const yScrollbarDetectionZoneElement = yScrollbarDetectionZone.current;
      if (!xScrollbarDetectionZoneElement || !yScrollbarDetectionZoneElement)
        return;

      xScrollbarDetectionZoneElement.addEventListener(
        'mouseover',
        mouseOverDetectionZoneHandler
      );
      xScrollbarDetectionZoneElement.addEventListener(
        'mouseout',
        mouseOutDetectionZoneHandler
      );
      yScrollbarDetectionZoneElement.addEventListener(
        'mouseover',
        mouseOverDetectionZoneHandler
      );
      yScrollbarDetectionZoneElement.addEventListener(
        'mouseout',
        mouseOutDetectionZoneHandler
      );
    },
    [mouseOverDetectionZoneHandler, mouseOutDetectionZoneHandler]
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
              {...otherProps}
            />
          )}
          {screenType !== 'touch' && (
            <div
              style={styles.yScrollbarDetectionZone}
              ref={yScrollbarDetectionZone}
            >
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
            </div>
          )}
          {screenType !== 'touch' && (
            <div
              style={styles.xScrollbarDetectionZone}
              ref={xScrollbarDetectionZone}
            >
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
            </div>
          )}
        </div>
      )}
    </FullSizeMeasurer>
  );
};

export default FullSizeInstancesEditorWithScrollbars;
