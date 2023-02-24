// @flow
import * as React from 'react';
import { dataObjectToProps } from '../../../../Utils/HTMLDataset';
import { mapVector } from '../../../../Utils/MapFor';
import useForceUpdate from '../../../../Utils/UseForceUpdate';

const styles = {
  point: { cursor: 'move' },
  containerStyle: {
    position: 'relative',
    width: '100%',
    height: '100%',
  },
};

const pointKindIdentifiers = {
  NORMAL: 1,
  ORIGIN: 2,
  CENTER: 3,
};
type PointKind = 1 | 2 | 3;

const getPointName = (kind: PointKind, point: gdPoint): string =>
  kind === pointKindIdentifiers.ORIGIN
    ? 'Origin'
    : kind === pointKindIdentifiers.CENTER
    ? 'Center'
    : point.getName();

type Props = {|
  pointsContainer: gdSprite, // Could potentially be generalized to other things than Sprite in the future.
  imageWidth: number,
  imageHeight: number,
  offsetTop: number,
  offsetLeft: number,
  imageZoomFactor: number,
  onPointsUpdated: () => void,
  highlightedPointName: ?string,
  selectedPointName: ?string,
  onClickPoint: string => void,
|};

type State = {|
  draggedPoint: ?gdPoint,
  draggedPointKind: ?PointKind,
|};

const PointsPreview = (props: Props) => {
  const svgRef = React.useRef<React.ElementRef<'svg'> | null>(null);
  const [state, setState] = React.useState<State>({
    draggedPoint: null,
    draggedPointKind: null,
  });

  const {
    pointsContainer,
    imageWidth,
    imageHeight,
    offsetTop,
    offsetLeft,
    imageZoomFactor,
    highlightedPointName,
    selectedPointName,
    onClickPoint,
    onPointsUpdated,
  } = props;

  const forceUpdate = useForceUpdate();

  /**
   * @returns The cursor position in the frame basis.
   */
  const getCursorOnFrame = React.useCallback((event: any):
    | [number, number]
    | null => {
    if (!svgRef.current) return null;

    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const pointOnScreen = svgRef.current.createSVGPoint();
    pointOnScreen.x = event.clientX;
    pointOnScreen.y = event.clientY;
    // $FlowExpectedError Flow doesn't have SVG typings yet (@facebook/flow#4551)
    const screenToSvgMatrix = svgRef.current.getScreenCTM().inverse();
    const pointOnSvg = pointOnScreen.matrixTransform(screenToSvgMatrix);

    return [pointOnSvg.x, pointOnSvg.y];
  }, []);

  const onStartDragPoint = React.useCallback(
    (draggedPoint: gdPoint, draggedPointKind: PointKind) => {
      if (state.draggedPoint) return;
      setState({
        draggedPoint,
        draggedPointKind,
      });
    },
    [state.draggedPoint]
  );

  const onEndDragPoint = React.useCallback(
    () => {
      const draggingWasDone = !!state.draggedPoint;
      if (draggingWasDone) {
        onPointsUpdated();
        // Select point at the end of the drag
        if (state.draggedPointKind && state.draggedPoint) {
          onClickPoint(
            getPointName(state.draggedPointKind, state.draggedPoint)
          );
        }
      }
      setState({
        draggedPoint: null,
        draggedPointKind: null,
      });
    },
    [state.draggedPoint, state.draggedPointKind, onPointsUpdated, onClickPoint]
  );

  /**
   * Move a point with the mouse. A similar dragging implementation is done in
   * CollisionMasksPreview (but with svg elements).
   *
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  const onPointerMove = React.useCallback(
    (event: any) => {
      /** The cursor position in the frame basis. */
      const cursorOnFrame = getCursorOnFrame(event);
      if (!cursorOnFrame) {
        return;
      }
      const { draggedPoint, draggedPointKind } = state;
      if (!draggedPoint || !draggedPointKind) return;

      const cursorX = cursorOnFrame[0] / imageZoomFactor;
      const cursorY = cursorOnFrame[1] / imageZoomFactor;

      if (draggedPointKind === pointKindIdentifiers.CENTER) {
        props.pointsContainer.setDefaultCenterPoint(false);
      }
      draggedPoint.setX(cursorX);
      draggedPoint.setY(cursorY);

      forceUpdate();
    },
    [
      forceUpdate,
      getCursorOnFrame,
      imageZoomFactor,
      props.pointsContainer,
      state,
    ]
  );

  const renderPoint = React.useCallback(
    (name: string, x: number, y: number, kind: PointKind, point: gdPoint) => {
      const pointName = getPointName(kind, point);

      return (
        <circle
          onPointerDown={() => onStartDragPoint(point, kind)}
          {...dataObjectToProps({ draggable: 'true' })}
          key={`point-${name}`}
          fill={
            pointName === highlightedPointName
              ? 'rgba(0,0,0,0.75)'
              : pointName === selectedPointName
              ? 'rgba(107,175,255,0.75)'
              : 'rgba(255,133,105,0.75)'
          }
          stroke={pointName === highlightedPointName ? 'white' : undefined}
          strokeWidth={2}
          cx={x}
          cy={y}
          r={7}
          style={styles.point}
        />
      );
    },
    [highlightedPointName, onStartDragPoint, selectedPointName]
  );

  const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
  const points = mapVector(nonDefaultPoints, (point, i) =>
    renderPoint(
      point.getName(),
      point.getX() * imageZoomFactor,
      point.getY() * imageZoomFactor,
      pointKindIdentifiers.NORMAL,
      point
    )
  );

  const originPoint = pointsContainer.getOrigin();
  const centerPoint = pointsContainer.getCenter();
  const automaticCenterPosition = pointsContainer.isDefaultCenterPoint();

  const svgStyle = {
    position: 'absolute',
    top: offsetTop || 0,
    left: offsetLeft || 0,
    width: imageWidth * imageZoomFactor,
    height: imageHeight * imageZoomFactor,
    overflow: 'visible',
  };

  return (
    <div
      style={styles.containerStyle}
      onPointerMove={onPointerMove}
      onPointerUp={onEndDragPoint}
    >
      <svg style={svgStyle} ref={svgRef}>
        {points}
        {renderPoint(
          'Origin',
          originPoint.getX() * imageZoomFactor,
          originPoint.getY() * imageZoomFactor,
          pointKindIdentifiers.ORIGIN,
          originPoint
        )}
        {renderPoint(
          'Center',
          (automaticCenterPosition ? imageWidth / 2 : centerPoint.getX()) *
            imageZoomFactor,
          (automaticCenterPosition ? imageHeight / 2 : centerPoint.getY()) *
            imageZoomFactor,
          pointKindIdentifiers.CENTER,
          centerPoint
        )}
      </svg>
    </div>
  );
};

export default PointsPreview;
