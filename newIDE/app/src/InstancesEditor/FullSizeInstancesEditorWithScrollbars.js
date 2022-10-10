// @flow
import React from 'react';
import ViewPosition from './ViewPosition';
import throttle from 'lodash/throttle';
import InstancesEditor, {
  type InstancesEditorPropsWithoutSizeAndScroll,
} from './index';
import { ScreenTypeMeasurer } from '../UI/Reponsive/ScreenTypeMeasurer';
import { FullSizeMeasurer } from '../UI/FullSizeMeasurer';
import useForceUpdate from '../Utils/UseForceUpdate';

const SCROLLBAR_DETECTION_WIDTH = 50;
const SCROLLBAR_TRACK_WIDTH = 16;
const SCROLLBAR_THUMB_WIDTH = 8;
const SCROLLBAR_SIZE = 200;
const SCROLLBAR_MARGIN = (SCROLLBAR_TRACK_WIDTH - SCROLLBAR_THUMB_WIDTH) / 2;

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
    outline: '1px solid #FAFAFA',
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

  const xValue = React.useRef(0);
  const yValue = React.useRef(0);
  const xMin = React.useRef(-5000);
  const xMax = React.useRef(5000);
  const yMin = React.useRef(-5000);
  const yMax = React.useRef(5000);
  const canvasWidth = React.useRef(0);
  const canvasHeight = React.useRef(0);
  const xStartScrollValue = React.useRef(0);
  const yStartScrollValue = React.useRef(0);

  const forceUpdate = useForceUpdate();

  const hideScrollbarsAfterDelay = React.useCallback(
    () => {
      if (timeoutHidingScrollbarsId.current) {
        clearTimeout(timeoutHidingScrollbarsId.current);
      }
      timeoutHidingScrollbarsId.current = setTimeout(() => {
        console.log('clearing timeout function');
        showScrollbars.current = false;
        forceUpdate();
      }, 1500);
    },
    [forceUpdate]
  );

  // If the mouse stops moving, hide the scrollbars after a delay.
  const mouseOutDetectionZoneHandler = React.useCallback(
    (e: MouseEvent) => {
      hideScrollbarsAfterDelay();
    },
    [hideScrollbarsAfterDelay]
  );

  const handleXChange = React.useCallback(
    (distanceMouseScrolledX: number) => {
      const mouseToPositionRatio =
        (xMax.current - xMin.current) / canvasWidth.current;
      console.log(
        xStartScrollValue.current,
        distanceMouseScrolledX,
        mouseToPositionRatio,
        canvasWidth.current
      );
      const newXValue =
        xStartScrollValue.current +
        distanceMouseScrolledX * mouseToPositionRatio;
      console.log(newXValue);
      xValue.current = newXValue;
      if (editorRef.current) {
        editorRef.current.scrollTo(newXValue, yValue.current);
      }
      forceUpdate();
    },
    [forceUpdate]
  );

  const handleYChange = React.useCallback(
    (distanceMouseScrolledY: number) => {
      const mouseToPositionRatio =
        (yMax.current - yMin.current) / canvasHeight.current;
      const newYValue =
        yStartScrollValue.current +
        distanceMouseScrolledY * mouseToPositionRatio;
      yValue.current = newYValue;
      if (editorRef.current) {
        editorRef.current.scrollTo(xValue.current, newYValue);
      }
      forceUpdate();
    },
    [forceUpdate]
  );

  const makeMouseMoveXHandler = React.useCallback(
    (initialMousePosition: number) => (e: MouseEvent) => {
      handleXChange(e.clientX - initialMousePosition);
    },
    [handleXChange]
  );

  const makeMouseMoveYHandler = React.useCallback(
    (initialMousePosition: number) => (e: MouseEvent) => {
      handleYChange(e.clientY - initialMousePosition);
    },
    [handleYChange]
  );

  const makeMouseUpXThumbHandler = React.useCallback(
    mouseMoveHandler => (e: MouseEvent) => {
      // If the user releases the mouse outside of the detection zone, we want to hide the scrollbars.
      if (
        e.target !== xScrollbarDetectionZone.current &&
        e.target !== xScrollbarTrack.current &&
        e.target !== xScrollbarThumb.current
      ) {
        console.log('x', e.target);
        console.log('Mouse up outside of detection zone');
        hideScrollbarsAfterDelay();
      }
      document.removeEventListener('mousemove', mouseMoveHandler);
    },
    [hideScrollbarsAfterDelay]
  );

  const mouseDownXThumbHandler = React.useCallback(
    (e: MouseEvent) => {
      console.log('mouse down on x thumb');
      const mouseMoveHandler = makeMouseMoveXHandler(e.clientX);
      const mouseUpHandler = makeMouseUpXThumbHandler(mouseMoveHandler);
      xStartScrollValue.current = xValue.current;
      // If the user is scrolling, we don't want to hide the scrollbars,
      // in case they are scrolling outside of the detection zone.
      if (timeoutHidingScrollbarsId.current) {
        console.log('Clearing timeout');
        clearTimeout(timeoutHidingScrollbarsId.current);
        timeoutHidingScrollbarsId.current = null;
      }

      document.addEventListener('mousemove', mouseMoveHandler);
      document.addEventListener('mouseup', mouseUpHandler);
    },
    [makeMouseMoveXHandler, makeMouseUpXThumbHandler]
  );

  const makeMouseUpYThumbHandler = React.useCallback(
    mouseMoveHandler => (e: MouseEvent) => {
      // If the user releases the mouse outside of the detection zone, we want to hide the scrollbars.
      if (
        e.target !== yScrollbarDetectionZone.current &&
        e.target !== yScrollbarTrack.current &&
        e.target !== yScrollbarThumb.current
      ) {
        console.log('y', e.target);
        console.log('Mouse up outside of detection zone');
        hideScrollbarsAfterDelay();
      }
      document.removeEventListener('mousemove', mouseMoveHandler);
    },
    [hideScrollbarsAfterDelay]
  );

  const mouseDownYThumbHandler = React.useCallback(
    (e: MouseEvent) => {
      console.log('mouse down on y thumb');
      const mouseMoveHandler = makeMouseMoveYHandler(e.clientY);
      const mouseUpHandler = makeMouseUpYThumbHandler(mouseMoveHandler);
      yStartScrollValue.current = yValue.current;
      // If the user is scrolling, we don't want to hide the scrollbars,
      // in case they are scrolling outside of the detection zone.
      if (timeoutHidingScrollbarsId.current) {
        console.log('Clearing timeout');
        clearTimeout(timeoutHidingScrollbarsId.current);
        timeoutHidingScrollbarsId.current = null;
      }

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

      console.log('registering events');

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

  // If the mouse is moved inside the detection zones, show the scrollbars.
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
        console.log('setandadjust');
        hideScrollbarsAfterDelay();
      }
      forceUpdate();
    },
    [forceUpdate, hideScrollbarsAfterDelay]
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
        50, // Throttle the updates after a scroll to avoid make lots of updates in a row that would kill CPU
        { leading: false, trailing: true }
      )(),
    [setAndAdjust]
  );

  React.useEffect(
    () => {
      if (editorRef.current) {
        handleViewPositionChange(editorRef.current.getViewPosition());
      }
    },
    [editorRef, handleViewPositionChange]
  );

  // Ensure the X Scrollbar doesn't go out of bounds.
  const minXScrollbarLeftPosition = '0%';
  const maxXScrollbarLeftPosition = `calc(100% - ${SCROLLBAR_SIZE}px)`;
  const expectedXScrollbarLeftPosition = `calc(${((xValue.current -
    xMin.current) /
    (xMax.current - xMin.current)) *
    100 +
    '%'} - ${SCROLLBAR_SIZE}px / 2)`;
  const xScrollbarLeftPosition = `max(min(${expectedXScrollbarLeftPosition}, ${maxXScrollbarLeftPosition}), ${minXScrollbarLeftPosition})`;

  // Ensure the Y Scrollbar doesn't go out of bounds.
  const minYScrollbarTopPosition = '0%';
  const maxYScrollbarTopPosition = `calc(100% - ${SCROLLBAR_SIZE}px)`;
  const expectedYScrollbarTopPosition = `calc(${((yValue.current -
    yMin.current) /
    (yMax.current - yMin.current)) *
    100 +
    '%'} - ${SCROLLBAR_SIZE}px / 2)`;
  const yScrollbarTopPosition = `max(min(${expectedYScrollbarTopPosition}, ${maxYScrollbarTopPosition}), ${minYScrollbarTopPosition})`;

  return (
    <ScreenTypeMeasurer>
      {screenType => (
        <FullSizeMeasurer>
          {({ width, height }) => (
            <div style={styles.container}>
              <InstancesEditor
                onViewPositionChanged={
                  screenType !== 'touch' ? handleViewPositionChange : noop
                }
                ref={(editor: ?InstancesEditor) => {
                  wrappedEditorRef && wrappedEditorRef(editor);
                  if (editor) {
                    editorRef.current = editor;
                  }
                }}
                width={width}
                height={height}
                screenType={screenType}
                {...otherProps}
              />
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
              {/* {screenType !== 'touch' && (
                  <Slider
                    color="secondary"
                    value={
                      ((Value - xMin) /
                        (xMax - xMin)) *
                      100
                    }
                    onChange={_handleXChange}
                    style={styles.xScrollbar}
                    orientation="horizontal"
                    onChangeCommitted={event => event.target.blur()}
                  />
                )}
                {screenType !== 'touch' && (
                  <Slider
                    color="secondary"
                    value={
                      ((yValue - yMin) /
                        (yMax - yMin)) *
                      100
                    }
                    onChange={_handleYChange}
                    style={styles.yScrollbar}
                    orientation="vertical"
                    onChangeCommitted={event => event.target.blur()}
                  />
                )} */}
            </div>
          )}
        </FullSizeMeasurer>
      )}
    </ScreenTypeMeasurer>
  );
};

export default FullSizeInstancesEditorWithScrollbars;
