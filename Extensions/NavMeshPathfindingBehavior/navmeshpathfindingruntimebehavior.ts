/*
GDevelop - NavMesh Pathfinding Behavior Extension
Copyright (c) 2010-2021 Florian Rival (Florian.Rival@gmail.com)
 */

//import {NavMesh} from "./navmesh";

namespace gdjs {
  /**
   * NavMeshPathfindingRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   */
  export class NavMeshPathfindingRuntimeBehavior extends gdjs.RuntimeBehavior {
    // Behavior configuration:
    _allowDiagonals: boolean = true;
    _acceleration: float;
    _maxSpeed: float;
    _angularMaxSpeed: float;
    _rotateObject: boolean;
    _angleOffset: float;
    _extraBorder: float;

    // Attributes used for traveling on the path:
    _path: Array<FloatPoint> = [];
    _pathFound: boolean = false;
    _speed: float = 0;
    _angularSpeed: float = 0;
    _timeOnSegment: float = 0;
    _totalSegmentTime: float = 0;
    _currentSegment: integer = 0;
    _reachedEnd: boolean = false;
    _movementAngle: float = 0;

    _manager: NavMeshPathfindingObstaclesManager;

    /** Used to draw traces for debugging */
    _lastUsedObstacleCellPadding: float | null = null;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData: any,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);

      this._acceleration = behaviorData.acceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._extraBorder = behaviorData.extraBorder;
      this._manager = gdjs.NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
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
      if (oldBehaviorData.extraBorder !== newBehaviorData.extraBorder) {
        this.setExtraBorder(newBehaviorData.extraBorder);
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
        Math.abs(
          gdjs.evtTools.common.angleDifference(this._movementAngle, degreeAngle)
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

    setExtraBorder(extraBorder: float): void {
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
        return this._path[index][1] / this._manager._isometricRatio;
      }
      return 0;
    }

    getNextNodeIndex() {
      return Math.min(this._currentSegment + 1, this._path.length - 1);
    }

    getNodeCount(): integer {
      return this._path.length;
    }

    getNextNodeX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const nextIndex = Math.min(
        this._currentSegment + 1,
        this._path.length - 1
      );
      return this._path[nextIndex][0];
    }

    getNextNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const nextIndex = Math.min(
        this._currentSegment + 1,
        this._path.length - 1
      );
      return this._path[nextIndex][1] / this._manager._isometricRatio;
    }

    getPreviousNodeX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const previousIndex = Math.min(
        this._currentSegment,
        this._path.length - 1
      );
      return this._path[previousIndex][0];
    }

    getPreviousNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const previousIndex = Math.min(
        this._currentSegment,
        this._path.length - 1
      );
      return this._path[previousIndex][1] / this._manager._isometricRatio;
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
      return (
        this._path[this._path.length - 1][1] / this._manager._isometricRatio
      );
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
      // TODO the center may not be the best thing to use if the object doesn't rotate
      const centerX = this.owner.getCenterXInScene();
      const centerY = this.owner.getCenterYInScene();
      for (const hitBox of this.owner.getHitBoxes()) {
        for (const vertex of hitBox.vertices) {
          const deltaX = vertex[0] - centerX;
          // to have the same unit on x and y
          const deltaY = (vertex[1] - centerY) * this._manager._isometricRatio;
          const radiusSq = deltaX * deltaX + deltaY * deltaY;
          radiusSqMax = Math.max(radiusSq, radiusSqMax);
        }
      }
      // Round to avoid to flicker between 2 NavMesh
      // because of trigonometry rounding errors.
      // Round the padding on cellSize to avoid almost identical NavMesh
      const obstacleCellPadding = Math.max(
        0,
        Math.round(
          (Math.sqrt(radiusSqMax) + this._extraBorder) / this._manager._cellSize
        )
      );
      this._lastUsedObstacleCellPadding = obstacleCellPadding;
      const navMesh = this._manager.getNavMesh(obstacleCellPadding);

      //TODO The pathfinding could use something like RBush to look for
      // the the polygons at start and target locations.
      //TODO If the target is not on the mesh, find the nearest position
      // maybe the same with the origin to avoid to be stuck.
      const path = navMesh.findPath(
        {
          x: this.owner.getX(),
          y: this.owner.getY() * this._manager._isometricRatio,
        },
        { x: x, y: y * this._manager._isometricRatio }
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

    /**
     * Draw the navigation mesh on a shape painter object for debugging purpose
     * @param shapePainter
     */
    drawNavMesh(shapePainter: gdjs.ShapePainterRuntimeObject) {
      if (!shapePainter || this._lastUsedObstacleCellPadding === null) {
        return;
      }

      shapePainter.clear();

      const navMesh = this._manager.getNavMesh(
        this._lastUsedObstacleCellPadding
      );
      for (const navPoly of navMesh.getPolygons()) {
        const polygon = navPoly.getPoints();
        if (polygon.length === 0) continue;
        for (let index = 1; index < polygon.length; index++) {
          // It helps to spot vertices with 180° between edges.
          shapePainter.drawCircle(
            polygon[index].x,
            polygon[index].y / this._manager._isometricRatio,
            3
          );
        }
      }
      for (const navPoly of navMesh.getPolygons()) {
        const polygon = navPoly.getPoints();
        if (polygon.length === 0) continue;
        shapePainter.beginFillPath(
          polygon[0].x,
          polygon[0].y / this._manager._isometricRatio
        );
        for (let index = 1; index < polygon.length; index++) {
          shapePainter.drawPathLineTo(
            polygon[index].x,
            polygon[index].y / this._manager._isometricRatio
          );
        }
        shapePainter.closePath();
        shapePainter.endFillPath();
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
      // In case of isometry, convert coords back in screen.
      this.owner.setY(newPos[1] / this._manager._isometricRatio);
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
