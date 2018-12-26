// @flow
import React from 'react';
import { mapVector } from '../../../../Utils/MapFor';

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
  onPointsUpdated: () => void,
|};

type State = {|
  draggedPoint: ?gdPoint,
  draggedPointKind: ?PointKind,
|};

export default class PointsPreview extends React.Component<Props, State> {
  _container: ?any;
  state = {
    draggedPoint: null,
    draggedPointKind: null,
  };

  _onStartDragPoint = (draggedPoint: gdPoint, draggedPointKind: PointKind) => {
    if (this.state.draggedPoint) return;

    this.setState({
      draggedPoint,
      draggedPointKind,
    });
  };

  _onEndDragPoint = () => {
    const draggingWasDone = !!this.state.draggedPoint;
    this.setState(
      {
        draggedPoint: null,
        draggedPointKind: null,
      },
      () => {
        if (draggingWasDone) this.props.onPointsUpdated();
      }
    );
  };

  /**
   * Move a point with the mouse. A similar dragging implementation is done in
   * CollisionMasksPreview (but with svg elements).
   *
   * If custom zoom is added, this should be adapted to properly set point coordinates.
   * TODO: This could be optimized by avoiding the forceUpdate (not sure if worth it though).
   */
  _onMouseMove = (event: any) => {
    const { draggedPoint, draggedPointKind } = this.state;
    if (!draggedPoint || !this._container) return;

    const containerBoundingRect = this._container.getBoundingClientRect();
    const xOnContainer = event.clientX - containerBoundingRect.left;
    const yOnContainer = event.clientY - containerBoundingRect.top;

    if (draggedPointKind === pointKindIdentifiers.CENTER) {
      this.props.pointsContainer.setDefaultCenterPoint(false);
    }
    draggedPoint.setX(xOnContainer);
    draggedPoint.setY(yOnContainer);
    this.forceUpdate();
  };

  _renderPoint = (
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
        onPointerDown={() => {
          this._onStartDragPoint(point, kind);
        }}
      />
    );
  };

  render() {
    const { pointsContainer, imageWidth, imageHeight } = this.props;
    const nonDefaultPoints = pointsContainer.getAllNonDefaultPoints();
    const points = mapVector(nonDefaultPoints, (point, i) =>
      this._renderPoint(
        point.getName(),
        point.getX(),
        point.getY(),
        pointKindIdentifiers.NORMAL,
        point
      )
    );

    const originPoint = pointsContainer.getOrigin();
    const centerPoint = pointsContainer.getCenter();
    const automaticCenterPosition = pointsContainer.isDefaultCenterPoint();

    return (
      <div
        style={styles.container}
        onPointerMove={this._onMouseMove}
        onPointerUp={this._onEndDragPoint}
        ref={container => (this._container = container)}
      >
        {points}
        {this._renderPoint(
          'Origin',
          originPoint.getX(),
          originPoint.getY(),
          pointKindIdentifiers.ORIGIN,
          originPoint
        )}
        {this._renderPoint(
          'Center',
          !automaticCenterPosition ? centerPoint.getX() : imageWidth / 2,
          !automaticCenterPosition ? centerPoint.getY() : imageHeight / 2,
          pointKindIdentifiers.CENTER,
          centerPoint
        )}
      </div>
    );
  }
}
