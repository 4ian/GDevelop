/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */

//import {NavMesh} from "./navmesh";

namespace gdjs {
  /**
   * NavMeshPathfindingRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   */
  export class NavMeshPathfindingRuntimeBehavior extends gdjs.RuntimeBehavior {
    _path: Array<FloatPoint> = [];

    //Behavior configuration:
    _allowDiagonals: boolean = true;
    _acceleration: float;
    _maxSpeed: float;
    _angularMaxSpeed: float;
    _rotateObject: boolean;
    _angleOffset: float;
    _extraBorder: float = 0;

    //Attributes used for traveling on the path:
    _pathFound: boolean = false;
    _speed: float = 0;
    _angularSpeed: float = 0;
    _timeOnSegment: float = 0;
    _totalSegmentTime: float = 0;
    _currentSegment: integer = 0;
    _reachedEnd: boolean = false;
    _manager: NavMeshPathfindingObstaclesManager;
    _movementAngle: float = 0;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);

      this._acceleration = behaviorData.acceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._manager =
        gdjs.NavMeshPathfindingObstaclesManager.getManager(runtimeScene);
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.acceleration !== newBehaviorData.acceleration) {
        this.setAcceleration(newBehaviorData.acceleration);
      }
      if (oldBehaviorData.maxSpeed !== newBehaviorData.maxSpeed) {
        this.setMaxSpeed(newBehaviorData.maxSpeed);
      }
      if (oldBehaviorData.angularMaxSpeed !== newBehaviorData.angularMaxSpeed) {
        this.setAngularMaxSpeed(newBehaviorData.angularMaxSpeed);
      }
      if (oldBehaviorData.rotateObject !== newBehaviorData.rotateObject) {
        this.setRotateObject(newBehaviorData.rotateObject);
      }
      if (oldBehaviorData.angleOffset !== newBehaviorData.angleOffset) {
        this.setAngleOffset(newBehaviorData.angleOffset);
      }
      return true;
    }

    setAcceleration(acceleration: float): void {
      this._acceleration = acceleration;
    }

    getAcceleration() {
      return this._acceleration;
    }

    setMaxSpeed(maxSpeed: float): void {
      this._maxSpeed = maxSpeed;
    }

    getMaxSpeed() {
      return this._maxSpeed;
    }

    setSpeed(speed: float): void {
      this._speed = speed;
    }

    getSpeed() {
      return this._speed;
    }

    getMovementAngle() {
      return this._movementAngle;
    }

    movementAngleIsAround(degreeAngle: float, tolerance: float) {
      return (
        gdjs.evtTools.common.angleDifference(
          this._movementAngle,
          degreeAngle
        ) <= tolerance
      );
    }

    setAngularMaxSpeed(angularMaxSpeed: float): void {
      this._angularMaxSpeed = angularMaxSpeed;
    }

    getAngularMaxSpeed() {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset: float): void {
      this._angleOffset = angleOffset;
    }

    getAngleOffset() {
      return this._angleOffset;
    }

    setExtraBorder(extraBorder): void {
      this._extraBorder = extraBorder;
    }

    getExtraBorder() {
      return this._extraBorder;
    }

    allowDiagonals(allow: boolean) {
      this._allowDiagonals = allow;
    }

    diagonalsAllowed() {
      return this._allowDiagonals;
    }

    setRotateObject(allow: boolean): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    getNodeX(index: integer): float {
      if (index < this._path.length) {
        return this._path[index][0];
      }
      return 0;
    }

    getNodeY(index: integer): float {
      if (index < this._path.length) {
        return this._path[index][1];
      }
      return 0;
    }

    getNextNodeIndex() {
      if (this._currentSegment + 1 < this._path.length) {
        return this._currentSegment + 1;
      } else {
        return this._path.length - 1;
      }
    }

    getNodeCount(): integer {
      return this._path.length;
    }

    getNextNodeX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      if (this._currentSegment + 1 < this._path.length) {
        return this._path[this._currentSegment + 1][0];
      } else {
        return this._path[this._path.length - 1][0];
      }
    }

    getNextNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      if (this._currentSegment + 1 < this._path.length) {
        return this._path[this._currentSegment + 1][1];
      } else {
        return this._path[this._path.length - 1][1];
      }
    }

    getLastNodeX(): float {
      if (this._path.length < 2) {
        return 0;
      }
      if (this._currentSegment < this._path.length - 1) {
        return this._path[this._currentSegment][0];
      } else {
        return this._path[this._path.length - 1][0];
      }
    }

    getLastNodeY(): float {
      if (this._path.length < 2) {
        return 0;
      }
      if (this._currentSegment < this._path.length - 1) {
        return this._path[this._currentSegment][1];
      } else {
        return this._path[this._path.length - 1][1];
      }
    }

    getDestinationX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1][0];
    }

    getDestinationY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1][1];
    }

    /**
     * Return true if the latest call to moveTo succeeded.
     */
    pathFound() {
      return this._pathFound;
    }

    /**
     * Return true if the object reached its destination.
     */
    destinationReached() {
      return this._reachedEnd;
    }

    /**
     * Compute and move on the path to the specified destination.
     */
    moveTo(runtimeScene: gdjs.RuntimeScene, x: float, y: float) {
      //TODO Add a non-blocking padding property to make the path farer from the obstacle if possible?
      // It may need to have several contour lines with a one cell increment
      // and do a dichotomy like this:
      // * find path with obstacleCellPaddingMax (infinity if not found)
      // * find path with obstacleCellPaddingMin
      // * path length delta < detourMax ?
      //   * yes: take PaddingMax path
      //   * no: do the dichotomy
      // The contour lines may be needed if there is objects of different size anyway.

      let radiusSqMax = 0;
      const centerX = this.owner.getCenterXInScene();
      const centerY = this.owner.getCenterYInScene();
      for (const hitBox of this.owner.getHitBoxes()) {
        for (const vertex of hitBox.vertices) {
          const deltaX = vertex[0] - centerX;
          const deltaY = vertex[1] - centerY;
          const radiusSq = deltaX * deltaX + deltaY * deltaY;
          radiusSqMax = Math.max(radiusSq, radiusSqMax);
        }
      }
      const radiusMax = Math.sqrt(radiusSqMax);

      const navMesh = this._manager.getNavMesh(
        runtimeScene,
        radiusMax + this._extraBorder
      );

      //TODO if the target is not on the mesh, find the nearest position
      // maybe the same with the origin to avoid to be stuck.
      const path = navMesh.findPath(
        { x: this.owner.getX(), y: this.owner.getY() },
        { x: x, y: y }
      );
      if (path) {
        this._pathFound = true;
        this._path = path.map(({ x, y }) => [x, y]);
        this._enterSegment(0);
        return;
      }
      // No path found
      this._pathFound = false;
    }

    drawCells(shapePainter: gdjs.ShapePainterRuntimeObject) {
      // for (const polygon of this.meshPolygons) {
      //   shapePainter.beginFillPath(polygon[0].x, polygon[0].y);
      //   for (let index = 1; index < polygon.length; index++) {
      //     shapePainter.drawPathLineTo(polygon[index].x, polygon[index].y);
      //   }
      //   shapePainter.closePath();
      //   shapePainter.endFillPath();
      // }
      // for (const polygon of this.meshPolygons) {
      //   shapePainter.drawPathMoveTo(polygon[0].x, polygon[0].y);
      //   for (let index = 1; index < polygon.length; index++) {
      //     shapePainter.drawPathLineTo(polygon[index].x, polygon[index].y);
      //   }
      //   shapePainter.closePath();
      // }
      shapePainter._renderer.clear();
      for (const polygon of this._manager.meshPolygons) {
        const last = polygon.length - 1;
        //shapePainter.drawRectangle(polygon[last].x - 8, polygon[last].y - 8, polygon[last].x + 8, polygon[last].y + 8);
        //shapePainter.drawCircle(polygon[0].x, polygon[0].y, 8);
        for (let index = 0; index < polygon.length; index++) {
          shapePainter.drawLine(
            polygon[index].x,
            polygon[index].y,
            polygon[(index + 1) % polygon.length].x,
            polygon[(index + 1) % polygon.length].y,
            1
          );
        }
      }
    }

    _enterSegment(segmentNumber: integer) {
      if (this._path.length === 0) {
        return;
      }
      this._currentSegment = segmentNumber;
      if (this._currentSegment < this._path.length - 1) {
        const pathX =
          this._path[this._currentSegment + 1][0] -
          this._path[this._currentSegment][0];
        const pathY =
          this._path[this._currentSegment + 1][1] -
          this._path[this._currentSegment][1];
        this._totalSegmentTime = Math.sqrt(pathX * pathX + pathY * pathY);
        this._timeOnSegment = 0;
        this._reachedEnd = false;
        this._movementAngle =
          ((Math.atan2(pathY, pathX) * 180) / Math.PI + 360) % 360;
      } else {
        this._reachedEnd = true;
        this._speed = 0;
      }
    }

    isMoving() {
      return !(this._path.length === 0 || this._reachedEnd);
    }

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
      if (this._path.length === 0 || this._reachedEnd) {
        return;
      }

      //Update the speed of the object
      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;
      this._speed += this._acceleration * timeDelta;
      if (this._speed > this._maxSpeed) {
        this._speed = this._maxSpeed;
      }
      this._angularSpeed = this._angularMaxSpeed;

      //Update the time on the segment and change segment if needed
      this._timeOnSegment += this._speed * timeDelta;
      if (
        this._timeOnSegment >= this._totalSegmentTime &&
        this._currentSegment < this._path.length
      ) {
        this._enterSegment(this._currentSegment + 1);
      }

      //Position object on the segment and update its angle
      let newPos = [0, 0];
      let pathAngle = this.owner.getAngle();
      if (this._currentSegment < this._path.length - 1) {
        newPos[0] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][0],
          this._path[this._currentSegment + 1][0],
          this._timeOnSegment / this._totalSegmentTime
        );
        newPos[1] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][1],
          this._path[this._currentSegment + 1][1],
          this._timeOnSegment / this._totalSegmentTime
        );
        pathAngle =
          gdjs.toDegrees(
            Math.atan2(
              this._path[this._currentSegment + 1][1] -
                this._path[this._currentSegment][1],
              this._path[this._currentSegment + 1][0] -
                this._path[this._currentSegment][0]
            )
          ) + this._angleOffset;
      } else {
        newPos = this._path[this._path.length - 1];
      }
      this.owner.setX(newPos[0]);
      this.owner.setY(newPos[1]);
      if (this._rotateObject) {
        this.owner.rotateTowardAngle(
          pathAngle,
          this._angularSpeed,
          runtimeScene
        );
      }
    }

    doStepPostEvents(runtimeScene: gdjs.RuntimeScene) {}
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshPathfindingBehavior',
    gdjs.NavMeshPathfindingRuntimeBehavior
  );
}
