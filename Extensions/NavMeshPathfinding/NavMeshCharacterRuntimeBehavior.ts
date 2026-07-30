/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2010-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  const loadRecast = async () => {
    try {
      const module = await import('./recast-navigation.wasm.js');
      const initializeRecast = module.default;
      if (!initializeRecast) {
        throw new Error('No default export found in Recast.');
      }

      const Recast = await initializeRecast();

      await RecastNav.init();
      console.log('Initialized Recast');
      //@ts-ignore
      window.Recast = Recast;
    } catch (err) {
      console.error('Unable to load Recast navigation mesh library.', err);
      throw err;
    }
  };
  gdjs.registerAsynchronouslyLoadingLibraryPromise(loadRecast());

  interface NavMeshCharacterNetworkSyncDataType {
    // Syncing the path and its position on it should be enough to have a good prediction.
    path: RecastNav.Vector3[];
    pf: boolean;
    sp: number;
    as: number;
    cs: number;
    tss: number;
    re: boolean;
    ma: number;
    dos: number;
  }

  /** @category Behaviors > 2D Pathfinding */
  export interface NavMeshCharacterNetworkSyncData extends BehaviorNetworkSyncData {
    props: NavMeshCharacterNetworkSyncDataType;
  }

  /**
   * NavMeshCharacterRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   * @category Behaviors > 2D Pathfinding
   */
  export class NavMeshCharacterRuntimeBehavior extends gdjs.RuntimeBehavior {
    _path: Array<RecastNav.Vector3> = [];
    /** Used by the path simplification algorithm */
    static _smoothingResultVertices: Array<FloatPoint> = [];
    /** Used by the path simplification algorithm */
    static _smoothingWorkingVertices: Array<FloatPoint> = [];

    //Behavior configuration:
    _allowDiagonals: boolean;
    _acceleration: float;
    _maxSpeed: float;
    _angularMaxSpeed: float;
    _rotateObject: boolean;
    _angleOffset: float;
    _cellWidth: float;
    _cellHeight: float;
    _gridOffsetX: float;
    _gridOffsetY: float;
    _extraBorder: float;
    _smoothingMaxCellGap: float;

    //Attributes used for traveling on the path:
    _pathFound: boolean = false;
    _speed: float = 0;
    _angularSpeed: float = 0;
    _distanceOnSegment: float = 0;
    _totalSegmentDistance: float = 0;
    _currentSegment: integer = 0;
    _reachedEnd: boolean = false;
    _manager: NavMeshObstaclesManager;

    _movementAngle: float = 0;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);

      //The path computed and followed by the object (Array of arrays containing x and y position)
      if (this._path === undefined) {
      } else {
        this._path.length = 0;
      }
      this._allowDiagonals = behaviorData.allowDiagonals;
      this._acceleration = behaviorData.acceleration;
      this._maxSpeed = behaviorData.maxSpeed;
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._cellWidth = behaviorData.cellWidth;
      this._cellHeight = behaviorData.cellHeight;
      this._gridOffsetX = behaviorData.gridOffsetX || 0;
      this._gridOffsetY = behaviorData.gridOffsetY || 0;
      this._extraBorder = behaviorData.extraBorder;
      this._smoothingMaxCellGap = behaviorData.smoothingMaxCellGap || 0;

      // TODO Remove
      this._acceleration = 1000;
      this._maxSpeed = 300;
      this._angularMaxSpeed = 360;
      this._rotateObject = true;
      this._angleOffset = 0;
      this._angularSpeed = this._angularMaxSpeed;

      this._manager =
        gdjs.NavMeshObstaclesManager.getManager(instanceContainer);
      this._manager.addCharacter(this);
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.allowDiagonals !== undefined) {
        this.allowDiagonals(behaviorData.allowDiagonals);
      }
      if (behaviorData.acceleration !== undefined) {
        this.setAcceleration(behaviorData.acceleration);
      }
      if (behaviorData.maxSpeed !== undefined) {
        this.setMaxSpeed(behaviorData.maxSpeed);
      }
      if (behaviorData.angularMaxSpeed !== undefined) {
        this.setAngularMaxSpeed(behaviorData.angularMaxSpeed);
      }
      if (behaviorData.rotateObject !== undefined) {
        this.setRotateObject(behaviorData.rotateObject);
      }
      if (behaviorData.angleOffset !== undefined) {
        this.setAngleOffset(behaviorData.angleOffset);
      }
      if (behaviorData.cellWidth !== undefined) {
        this.setCellWidth(behaviorData.cellWidth);
      }
      if (behaviorData.cellHeight !== undefined) {
        this.setCellHeight(behaviorData.cellHeight);
      }
      if (behaviorData.gridOffsetX !== undefined) {
        this._gridOffsetX = behaviorData.gridOffsetX;
      }
      if (behaviorData.gridOffsetY !== undefined) {
        this._gridOffsetY = behaviorData.gridOffsetY;
      }
      if (behaviorData.extraBorder !== undefined) {
        this.setExtraBorder(behaviorData.extraBorder);
      }
      if (behaviorData.smoothingMaxCellGap !== undefined) {
        this._smoothingMaxCellGap = behaviorData.smoothingMaxCellGap;
      }
      return true;
    }

    getNetworkSyncData(
      options: GetNetworkSyncDataOptions
    ): NavMeshCharacterNetworkSyncData {
      return {
        ...super.getNetworkSyncData(options),
        props: {
          path: this._path,
          pf: this._pathFound,
          sp: this._speed,
          as: this._angularSpeed,
          cs: this._currentSegment,
          tss: this._totalSegmentDistance,
          re: this._reachedEnd,
          ma: this._movementAngle,
          dos: this._distanceOnSegment,
        },
      };
    }

    updateFromNetworkSyncData(
      networkSyncData: NavMeshCharacterNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);
      const behaviorSpecificProps = networkSyncData.props;
      if (behaviorSpecificProps.path !== undefined) {
        this._path = behaviorSpecificProps.path;
      }
      if (behaviorSpecificProps.pf !== undefined) {
        this._pathFound = behaviorSpecificProps.pf;
      }
      if (behaviorSpecificProps.sp !== undefined) {
        this._speed = behaviorSpecificProps.sp;
      }
      if (behaviorSpecificProps.as !== undefined) {
        this._angularSpeed = behaviorSpecificProps.as;
      }
      if (
        behaviorSpecificProps.cs !== undefined &&
        behaviorSpecificProps.cs !== this._currentSegment
      ) {
        this._currentSegment = behaviorSpecificProps.cs;
      }
      if (behaviorSpecificProps.tss !== undefined) {
        this._totalSegmentDistance = behaviorSpecificProps.tss;
      }
      if (behaviorSpecificProps.re !== undefined) {
        this._reachedEnd = behaviorSpecificProps.re;
      }
      if (behaviorSpecificProps.ma !== undefined) {
        this._movementAngle = behaviorSpecificProps.ma;
      }
      if (behaviorSpecificProps.dos !== undefined) {
        this._distanceOnSegment = behaviorSpecificProps.dos;
      }
    }

    onActivate() {
      if (this._registeredInManager) {
        return;
      }
      this._manager.addCharacter(this);
      this._registeredInManager = true;
    }

    onDeActivate() {
      if (!this._registeredInManager) {
        return;
      }
      this._manager.removeCharacter(this);
      this._registeredInManager = false;
    }

    setCellWidth(width: float): void {
      this._cellWidth = width;
    }

    getCellWidth(): float {
      return this._cellWidth;
    }

    setCellHeight(height: float): void {
      this._cellHeight = height;
    }

    getCellHeight(): float {
      return this._cellHeight;
    }

    setGridOffsetX(gridOffsetX: float): void {
      this._gridOffsetX = gridOffsetX;
    }

    getGridOffsetX(): float {
      return this._gridOffsetX;
    }

    setGridOffsetY(gridOffsetY: float): void {
      this._gridOffsetY = gridOffsetY;
    }

    getGridOffsetY(): float {
      return this._gridOffsetY;
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
    moveTo(x: float, y: float, z: float) {
      const owner = this.owner;

      if (!this._manager.navMesh) {
        this._manager.rebuildNavMesh();
      }
      if (!this._manager.navMesh) {
        console.log("Can't build the nav mesh");
        return;
      }

      // Start searching for a path
      const navMeshQuery = new RecastNav.NavMeshQuery(this._manager.navMesh);

      const { success: hasFindDestination, point: destination } =
        navMeshQuery.findClosestPoint(
          { x, y: z, z: y },
          { halfExtents: { x: 100, y: 100, z: 100 } }
        );
      if (!hasFindDestination) {
        this._pathFound = false;
        console.log("Can't find destination", x, y, z);
        return;
      }

      const agent = this._manager.characterAgents.get(this);
      if (!agent) {
        console.log('No agent');
        return;
      }
      const hasFindPath = agent.requestMoveTarget(destination);
      console.log('hasFindPath', hasFindPath);
    }

    _enterSegment(segmentNumber: integer) {
      if (this._path.length === 0) {
        return;
      }
      this._currentSegment = segmentNumber;
      if (this._currentSegment < this._path.length - 1) {
        const pathX =
          this._path[this._currentSegment + 1].x -
          this._path[this._currentSegment].x;
        const pathY =
          this._path[this._currentSegment + 1].y -
          this._path[this._currentSegment].y;
        const pathZ =
          this._path[this._currentSegment + 1].z -
          this._path[this._currentSegment].z;
        this._totalSegmentDistance = Math.hypot(pathX, pathY, pathZ);
        this._distanceOnSegment = 0;
        this._reachedEnd = false;
        this._movementAngle =
          (gdjs.toDegrees(Math.atan2(pathY, pathX)) + 360) % 360;
      } else {
        this._reachedEnd = true;
        this._speed = 0;
      }
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const timeDelta = this.owner.getElapsedTime() / 1000;
      this._manager.step(timeDelta);

      const agent = this._manager.characterAgents.get(this);
      if (!agent) {
        return;
      }

      const oldX = this.owner.getX();
      const oldY = this.owner.getY();
      const newX = agent.interpolatedPosition.x;
      const newY = agent.interpolatedPosition.z;
      const newZ = agent.interpolatedPosition.y;
      this.owner.setX(newX);
      this.owner.setY(newY);
      this.owner.setZ(newZ);

      if (newX != oldX && newY != oldY) {
        this._movementAngle = gdjs.toDegrees(
          Math.atan2(newY - oldY, newX - oldX)
        );
      }
      if (
        this._rotateObject &&
        this.owner.getAngle() !== this._movementAngle + this._angleOffset
      ) {
        this.owner.rotateTowardAngle(
          this._movementAngle + this._angleOffset,
          this._angularSpeed
        );
      }
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._manager.hasStepped = false;
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshCharacterBehavior',
    gdjs.NavMeshCharacterRuntimeBehavior
  );
}
