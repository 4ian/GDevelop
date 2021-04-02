// @flow
import * as React from 'react';
import { mapVector } from '../../../../Utils/MapFor';
import useForceUpdate from '../../../../Utils/UseForceUpdate';

const styles = {
  container: {
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

type Props = {|
  pointsContainer: gdSprite, // Could potentially be generalized to other things than Sprite in the future.
  imageWidth: number,
  imageHeight: number,
  offsetTop: number,
  offsetLeft: number,
  imageZoomFactor: number,
  onPointsUpdated: () => void,
|};

type State = {|
  draggedPoint: ?gdPoint,
  draggedPointKind: ?PointKind,
|};

const PointsPreview = (props: Props) => {
  const frameRef = React.useRef<React.ElementRef<'div'> | null>(null);
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
  } = props;

  const forceUpdate = useForceUpdate();

  const onStartDragPoint = (
    draggedPoint: gdPoint,
    draggedPointKind: PointKind
  ) => {
    if (state.draggedPoint) return;
    setState({
      draggedPoint,
      draggedPointKind,
    });
  };

  const onEndDragPoint = () => {
    const draggingWasDone = !!state.draggedPoint;
    if (draggingWasDone) props.onPointsUpdated();
    setState({
      draggedPoint: null,
      draggedPointKind: null,
    });
  };

  /**
   * Move a point with the mouse. A similar dragging implementation is done in
   * CollisionMasksPreview (but with svg elements).
   *
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  const onMouseMove = (event: any) => {
    const { draggedPoint, draggedPointKind } = state;
    if (!draggedPoint || !frameRef.current) return;

    const frameBoundingRect = frameRef.current.getBoundingClientRect();
    const xOnFrame = event.clientX - frameBoundingRect.left;
    const yOnFrame = event.clientY - frameBoundingRect.top;

    if (draggedPointKind === pointKindIdentifiers.CENTER) {
      props.pointsContainer.setDefaultCenterPoint(false);
    }
    draggedPoint.setX(xOnFrame / imageZoomFactor);
    draggedPoint.setY(yOnFrame / imageZoomFactor);
    forceUpdate();
  };

  const renderPoint = (
    name: string,
    x: number,
    y: number,
    kind: PointKind,
    point: gdPoint
  ) => {
    const imageSrc =
      kind === pointKindIdentifiers.ORIGIN
        ? 'res/originPoint.png'
        : kind === pointKindIdentifiers.CENTER
        ? 'res/centerPoint.png'
        : 'res/point.png';
    return (
      <img
        src={imageSrc}
        style={{
          position: 'absolute',
          left: x,
          top: y,
          transform: 'translate(-6px, -5px)',
          cursor: 'move',
        }}
        alt=""
        key={name}
        draggable={false}
        onPointerDown={() => {
          onStartDragPoint(point, kind);
        }}
      />
    );
  };

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

  const frameStyle = {
    position: 'absolute',
    top: offsetTop,
    left: offsetLeft,
    width: imageWidth * imageZoomFactor,
    height: imageHeight * imageZoomFactor,
  };

  return (
    <div
      style={styles.container}
      onPointerMove={onMouseMove}
      onPointerUp={onEndDragPoint}
    >
      <div style={frameStyle} ref={frameRef}>
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
          (!automaticCenterPosition ? centerPoint.getX() : imageWidth / 2) *
            imageZoomFactor,
          (!automaticCenterPosition ? centerPoint.getY() : imageHeight / 2) *
            imageZoomFactor,
          pointKindIdentifiers.CENTER,
          centerPoint
        )}
      </div>
    </div>
  );
};

export default PointsPreview;
