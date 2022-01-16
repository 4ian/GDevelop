/*
GDevelop - NavMesh Pathfinding Behavior Extension
Copyright (c) 2010-2021 Florian Rival (Florian.Rival@gmail.com)
 */

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
    _collisionShape: string;
    _extraBorder: float;

    // Attributes used for traveling on the path:
    _path: Array<FloatPoint> = [];
    _pathFound: boolean = false;
    _speed: float = 0;
    _angularSpeed: float = 0;
    _distanceOnSegment: float = 0;
    _totalSegmentDistance: float = 0;
    _currentSegment: integer = 0;
    _reachedEnd: boolean = false;
    _movementAngle: float = 0;

    _manager: NavMeshPathfindingObstaclesManager;

    /** Used to draw traces for debugging */
    _lastUsedObstacleCellPadding: float | null = null;
    _isVisualDebugEnabled: boolean = false;
    _debugColor: integer = 0x000000;
    _debugOpacity: float = 1;

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
      this._collisionShape = behaviorData.collisionShape;
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
      if (oldBehaviorData.collisionShape !== newBehaviorData.collisionShape) {
        this.setCollisionShape(newBehaviorData.collisionShape);
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

    setCollisionShape(collisionShape: string): void {
      this._collisionShape = collisionShape;
    }

    getCollisionShape() {
      return this._collisionShape;
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
      let radiusSqMax = 0;
      if (this._collisionShape !== 'Dot at center') {
        const centerX = this.owner.getCenterXInScene();
        const centerY = this.owner.getCenterYInScene();
        for (const hitBox of this.owner.getHitBoxes()) {
          for (const vertex of hitBox.vertices) {
            const deltaX = vertex[0] - centerX;
            // to have the same unit on x and y
            const deltaY =
              (vertex[1] - centerY) * this._manager._isometricRatio;
            const radiusSq = deltaX * deltaX + deltaY * deltaY;
            radiusSqMax = Math.max(radiusSq, radiusSqMax);
          }
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
        this._totalSegmentDistance = Math.sqrt(pathX * pathX + pathY * pathY);
        this._distanceOnSegment = 0;
        this._reachedEnd = false;
        this._movementAngle =
          (gdjs.toDegrees(Math.atan2(pathY, pathX)) + 360) % 360;
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

      // Update the speed of the object
      const timeDelta = this.owner.getElapsedTime(runtimeScene) / 1000;
      const previousSpeed = this._speed;
      if (this._speed !== this._maxSpeed) {
        this._speed += this._acceleration * timeDelta;
        if (this._speed > this._maxSpeed) {
          this._speed = this._maxSpeed;
        }
      }
      this._angularSpeed = this._angularMaxSpeed;

      // Update the time on the segment and change segment if needed
      // Use a Verlet integration to be frame rate independent.
      this._distanceOnSegment +=
        ((this._speed + previousSpeed) / 2) * timeDelta;
      const remainingDistanceOnSegment =
        this._totalSegmentDistance - this._distanceOnSegment;
      if (
        remainingDistanceOnSegment <= 0 &&
        this._currentSegment < this._path.length
      ) {
        this._enterSegment(this._currentSegment + 1);
        this._distanceOnSegment = -remainingDistanceOnSegment;
      }

      // Position object on the segment and update its angle
      let newPos = [0, 0];
      if (this._currentSegment < this._path.length - 1) {
        newPos[0] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][0],
          this._path[this._currentSegment + 1][0],
          this._distanceOnSegment / this._totalSegmentDistance
        );
        newPos[1] = gdjs.evtTools.common.lerp(
          this._path[this._currentSegment][1],
          this._path[this._currentSegment + 1][1],
          this._distanceOnSegment / this._totalSegmentDistance
        );
        if (
          this._rotateObject &&
          this.owner.getAngle() !== this._movementAngle + this._angleOffset
        ) {
          this.owner.rotateTowardAngle(
            this._movementAngle + this._angleOffset,
            this._angularSpeed,
            runtimeScene
          );
        }
      } else {
        newPos = this._path[this._path.length - 1];
      }
      this.owner.setX(newPos[0]);
      // In case of isometry, convert coords back in screen.
      this.owner.setY(newPos[1] / this._manager._isometricRatio);
    }

    /**
     * Draw the navigation mesh on a shape painter object for debugging purpose
     * @param shapePainter
     * @param rgbColor semicolon separated decimal values
     */
    setVisualDebugEnabled(
      isVisualDebugEnabled: boolean,
      rgbColor: string,
      opacity: integer
    ) {
      this._isVisualDebugEnabled = isVisualDebugEnabled;
      const colors = rgbColor.split(';');
      if (colors.length < 3) {
        return;
      }
      this._debugColor = parseInt(
        gdjs.rgbToHex(
          parseInt(colors[0], 10),
          parseInt(colors[1], 10),
          parseInt(colors[2], 10)
        ),
        16
      );
      this._debugOpacity = opacity / 255;
    }

    doDebugRendering(instanceContainer: gdjs.RuntimeInstanceContainer): void {
      if (!this._isVisualDebugEnabled) {
        return;
      }
      const graphics = instanceContainer.getDebuggerRenderer().getDebugRenderer();
      if (!graphics) {
        return;
      }

      // TODO find a way to rebuild drawing only when necessary.

      if (this._lastUsedObstacleCellPadding === null) {
        return;
      }

      const layer = instanceContainer.getLayer(this.owner.getLayer());
      graphics.lineStyle(
        1,
        this._debugColor,
        Math.min(1, this._debugOpacity * 2)
      );
      // Draw the navigation mesh on a shape painter object for debugging purpose
      const navMesh = this._manager.getNavMesh(
        this._lastUsedObstacleCellPadding
      );
      let point: FloatPoint = [0, 0];
      for (const navPoly of navMesh.getPolygons()) {
        const polygon = navPoly.getPoints();
        if (polygon.length === 0) continue;
        for (let index = 1; index < polygon.length; index++) {
          point = layer.convertInverseCoords(
            polygon[index].x,
            polygon[index].y / this._manager._isometricRatio,
            0,
            point
          );
          // It helps to spot vertices with 180° between edges.
          graphics.drawCircle(point[0], point[1], 3);
        }
      }
      for (const navPoly of navMesh.getPolygons()) {
        const polygon = navPoly.getPoints();
        if (polygon.length === 0) continue;
        graphics.beginFill(this._debugColor, this._debugOpacity);
        point = layer.convertInverseCoords(
          polygon[0].x,
          polygon[0].y / this._manager._isometricRatio,
          0,
          point
        );
        graphics.moveTo(point[0], point[1]);
        for (let index = 1; index < polygon.length; index++) {
          point = layer.convertInverseCoords(
            polygon[index].x,
            polygon[index].y / this._manager._isometricRatio,
            0,
            point
          );
          graphics.lineTo(point[0], point[1]);
        }
        graphics.closePath();
        graphics.endFill();
      }
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshPathfindingBehavior',
    gdjs.NavMeshPathfindingRuntimeBehavior
  );
}
