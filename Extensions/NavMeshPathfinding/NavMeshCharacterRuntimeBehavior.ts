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

    // Behavior configuration:
    _angularMaxSpeed: float;
    _rotateObject: boolean;
    _angleOffset: float;
    _radius: float;
    _agent: RecastNav.CrowdAgent | null = null;
    _crowdAgentParams: Partial<RecastNav.CrowdAgentParams> = {
      radius: 40,
      height: 100,
      maxAcceleration: 1000,
      maxSpeed: 300,
      collisionQueryRange: 120,
      separationWeight: 1.0,
    };

    // Attributes used for traveling on the path:
    _angularSpeed: float = 0;
    _pathFound: boolean = false;
    _reachedEnd: boolean = false;
    _movementAngle: float = 0;

    _manager: NavMeshObstaclesManager;

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
      this._angularMaxSpeed = behaviorData.angularMaxSpeed;
      this._rotateObject = behaviorData.rotateObject;
      this._angleOffset = behaviorData.angleOffset;
      this._radius = behaviorData.radius;
      this._crowdAgentParams.maxAcceleration = behaviorData.acceleration;
      this._crowdAgentParams.maxSpeed = behaviorData.maxSpeed;
      this._crowdAgentParams.collisionQueryRange =
        behaviorData.avoidanceSightRange;

      this._manager =
        gdjs.NavMeshObstaclesManager.getManager(instanceContainer);
      this._manager.addCharacter(this);
    }

    override applyBehaviorOverriding(behaviorData): boolean {
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
      return true;
    }

    override getNetworkSyncData(
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

    override updateFromNetworkSyncData(
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

    override onActivate() {
      this._manager.addCharacter(this);
    }

    override onDeActivate() {
      this._manager.removeCharacter(this);
    }

    /**
     * Compute and move on the path to the specified destination.
     */
    moveTo(x: float, y: float, z: float) {
      this._path = [];
      this._manager.rebuildNavMeshIfNeeded();
      if (!this._manager.navMesh) {
        console.log("Can't build the nav mesh");
        this._pathFound = false;
        return;
      }

      // Start searching for a path
      const navMeshQuery = new RecastNav.NavMeshQuery(this._manager.navMesh);

      const { success: hasFindDestination, point: destination } =
        navMeshQuery.findClosestPoint(
          {
            x,
            y: z,
            z: this._manager.is3D ? y : y * this._manager.inverseSpeedScaleY,
          },
          { halfExtents: { x: 100, y: 100, z: 100 } }
        );
      if (!hasFindDestination) {
        this._pathFound = false;
        console.log("Can't find destination", x, y, z);
        return;
      }

      if (!this._agent) {
        console.log('No agent');
        this._pathFound = false;
        return;
      }
      this.teleportAgentToObjectIfNeeded();
      this._pathFound = this._agent.requestMoveTarget(destination);
      console.log(
        'hasFindPath',
        this._pathFound,
        this.owner.x,
        this.owner.y,
        //@ts-ignore
        this.owner.getZ ? this.owner.getZ() : 0,
        ' -> ',
        x,
        y,
        z
      );
      if (this._pathFound) {
        this._reachedEnd = false;
      }
    }

    teleportAgentToObjectIfNeeded(): void {
      const agent = this._agent;
      if (!agent) {
        return;
      }
      const oldX = this.owner.getX();
      const oldY = this.owner.getY();
      //@ts-ignore
      const oldZ = this.owner.getZ ? this.owner.getZ() : 0;

      let expectedX = agent.raw.get_npos(0);
      let expectedY = this._manager.is3D
        ? agent.raw.get_npos(2)
        : agent.raw.get_npos(2) * this._manager.speedScaleY;
      //@ts-ignore
      let expectedZ = this.owner.getZ ? agent.raw.get_npos(1) : 0;

      if (oldX !== expectedX || oldY !== expectedY || oldZ !== expectedZ) {
        agent.teleport({
          x: oldX,
          y: oldZ,
          z: this._manager.is3D
            ? oldY
            : oldY * this._manager.inverseSpeedScaleY,
        });
        this._path = [];
        this._pathFound = false;
        console.log('Teleport to', oldX, oldY, oldZ);
      }
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      const timeDelta = this.owner.getElapsedTime() / 1000;
      // The wrapper interpolation seems bugged, so we don't use it.
      this._manager.step(timeDelta);

      const agent = this._agent;
      if (!agent) {
        return;
      }

      // Path found: memorize it
      // We can't get the agent path before a first step, so we do it here.
      if (this._path.length === 0 && agent.raw.ncorners > 0) {
        const path = agent.corners();
        path.push(agent.target());
        for (const point of path) {
          const y = point.y;
          point.y = point.z;
          point.z = y;
          if (!this._manager.is3D) {
            point.y *= this._manager.speedScaleY;
          }
        }
        this._path = path;
        console.log('path', this._path);
      }

      let newX = agent.raw.get_npos(0);
      let newY = this._manager.is3D
        ? agent.raw.get_npos(2)
        : agent.raw.get_npos(2) * this._manager.speedScaleY;
      let newZ = agent.raw.get_npos(1);

      //console.log("newZ", newZ);

      const destinationX = this.getDestinationX();
      const destinationY = this.getDestinationY();
      const destinationZ = this.getDestinationZ();

      const velocity = agent.desiredVelocity();
      const velocityX = velocity.x;
      const velocityY = velocity.z;
      if (
        Math.abs(velocityX) + Math.abs(velocityY) > 0 &&
        // Avoid to rotate strangely at the end of the path
        (Math.abs(destinationX - newX) > 3 || Math.abs(destinationY - newY) > 3)
      ) {
        this._movementAngle = gdjs.evtTools.common.mod(
          gdjs.toDegrees(Math.atan2(velocityY, velocityX)),
          360
        );
      }
      if (
        this._rotateObject &&
        this.owner.getAngle() !== this._movementAngle + this._angleOffset
      ) {
        this.rotateTowardAngle(this._movementAngle + this._angleOffset);
      }
      if (
        Math.abs(newX - destinationX) < 1 &&
        Math.abs(newY - destinationY) < 1 &&
        //@ts-ignore
        (!this.owner.getZ || Math.abs(newZ - destinationZ) < 1)
      ) {
        this._reachedEnd = true;
        agent.resetMoveTarget();
        console.log('Reached end');
      }
      this.owner.setX(newX);
      this.owner.setY(newY);
      //@ts-ignore
      if (this.owner.setZ) {
        //@ts-ignore
        this.owner.setZ(newZ);
      }
    }

    /**
     * @param angle The targeted angle.
     * @param speed The rotation speed. 0 for an immediate rotation to the target angle.
     */
    private rotateTowardAngle(angle: float): void {
      const angularDiff = gdjs.evtTools.common.angleDifference(
        this.owner.getAngle(),
        angle
      );
      const diffWasPositive = angularDiff >= 0;

      const timeDelta = this.owner.getElapsedTime() / 1000;
      this._angularSpeed =
        (diffWasPositive ? -1.0 : 1.0) * this._angularMaxSpeed;

      let newAngle = this.owner.getAngle() + this._angularSpeed * timeDelta;

      if (
        // @ts-ignore
        (gdjs.evtTools.common.angleDifference(newAngle, angle) > 0) ^
        diffWasPositive
      ) {
        newAngle = angle;
      }
      this.owner.setAngle(newAngle);
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {
      this._manager.hasStepped = false;
    }

    getRadius(): float {
      return (
        this._radius ||
        Math.min(this.owner.getWidth(), this.owner.getHeight()) / 2
      );
    }

    setAcceleration(acceleration: float): void {
      this._crowdAgentParams.maxAcceleration = acceleration;
      if (this._agent) {
        this._agent.setParameters(this._crowdAgentParams);
      }
    }

    getAcceleration(): float {
      return this._crowdAgentParams.maxAcceleration || 0;
    }

    setMaxSpeed(maxSpeed: float): void {
      this._crowdAgentParams.maxSpeed = maxSpeed;
      if (this._agent) {
        this._agent.setParameters(this._crowdAgentParams);
      }
    }

    getMaxSpeed(): float {
      return this._crowdAgentParams.maxSpeed || 0;
    }

    setSpeed(speed: float): void {
      if (this._agent) {
        const velocity = this._agent.desiredVelocityObstacleAdjusted();
        const oldSpeed = Math.hypot(velocity.x, velocity.y, velocity.z);
        if (oldSpeed === 0) {
          this._agent.requestMoveVelocity({ x: speed, y: 0, z: 0 });
        } else {
          const ratio = speed / oldSpeed;
          this._agent.requestMoveVelocity({
            x: velocity.x * ratio,
            y: velocity.y * ratio,
            z: velocity.z * ratio,
          });
        }
      }
    }

    getSpeed(): float {
      if (!this._agent) {
        return 0;
      }
      const velocity = this._agent.desiredVelocity();

      return Math.hypot(velocity.x, velocity.y, velocity.z);
    }

    getMovementAngle(): float {
      return this._movementAngle;
    }

    movementAngleIsAround(degreeAngle: float, tolerance: float): boolean {
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

    setRotateObject(allow: boolean): void {
      this._rotateObject = allow;
    }

    isObjectRotated(): boolean {
      return this._rotateObject;
    }

    getNodeX(index: integer): float {
      if (index < this._path.length) {
        return this._path[index].x;
      }
      return 0;
    }

    getNodeY(index: integer): float {
      if (index < this._path.length) {
        return this._path[index].y;
      }
      return 0;
    }

    getNodeZ(index: integer): float {
      if (index < this._path.length) {
        return this._path[index].z;
      }
      return 0;
    }

    getNextNodeIndex() {
      if (!this._agent) {
        return 0;
      }
      const remainingNodes = this._agent.raw.ncorners;
      return remainingNodes === 0
        ? this._path.length - 1
        : this._path.length - remainingNodes;
    }

    getNodeCount(): integer {
      return this._path.length;
    }

    getNextNodeX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const nextNodeIndex = this.getNextNodeIndex();
      return this._path[nextNodeIndex].x;
    }

    getNextNodeY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const nextNodeIndex = this.getNextNodeIndex();
      return this._path[nextNodeIndex].y;
    }

    getNextNodeZ(): float {
      if (this._path.length === 0) {
        return 0;
      }
      const nextNodeIndex = this.getNextNodeIndex();
      return this._path[nextNodeIndex].z;
    }

    getPreviousNodeIndex() {
      if (!this._agent) {
        return 0;
      }
      const remainingNodes = this._agent.raw.ncorners;
      return remainingNodes === this._path.length
        ? 0
        : this._path.length - remainingNodes - 1;
    }

    getPreviousNodeX(): float {
      if (this._path.length < 2) {
        return 0;
      }
      const previousNodeIndex = this.getPreviousNodeIndex();
      return this._path[previousNodeIndex].x;
    }

    getPreviousNodeY(): float {
      if (this._path.length < 2) {
        return 0;
      }
      const previousNodeIndex = this.getPreviousNodeIndex();
      return this._path[previousNodeIndex].y;
    }

    getPreviousNodeZ(): float {
      if (this._path.length < 2) {
        return 0;
      }
      const previousNodeIndex = this.getPreviousNodeIndex();
      return this._path[previousNodeIndex].z;
    }

    getDestinationX(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1].x;
    }

    getDestinationY(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1].y;
    }

    getDestinationZ(): float {
      if (this._path.length === 0) {
        return 0;
      }
      return this._path[this._path.length - 1].z;
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
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshCharacterBehavior',
    gdjs.NavMeshCharacterRuntimeBehavior
  );
}
