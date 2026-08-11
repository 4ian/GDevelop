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
    d: RecastNav.Vector3;
    pf: boolean;
    as: number;
    re: boolean;
    ma: number;
  }

  /** @category Behaviors > NavMesh pathfinding */
  export interface NavMeshCharacterNetworkSyncData
    extends BehaviorNetworkSyncData {
    props: NavMeshCharacterNetworkSyncDataType;
  }

  /**
   * NavMeshCharacterRuntimeBehavior represents a behavior allowing objects to
   * follow a path computed to avoid obstacles.
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshCharacterRuntimeBehavior extends gdjs.RuntimeBehavior {
    _path: Array<RecastNav.Vector3> = [];

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

    _oldX: float = 0;
    _oldY: float = 0;
    _oldZ: float = 0;

    // Attributes used for traveling on the path:
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
      if (behaviorData.radius !== undefined) {
        this._radius = behaviorData.radius;
        this._manager.invalidateNavMesh();
      }
      if (behaviorData.avoidanceSightRange !== undefined) {
        this._crowdAgentParams.collisionQueryRange =
          behaviorData.avoidanceSightRange;
      }
      return true;
    }

    override getNetworkSyncData(
      options: GetNetworkSyncDataOptions
    ): NavMeshCharacterNetworkSyncData {
      return {
        ...super.getNetworkSyncData(options),
        props: {
          d: this._path[this._path.length - 1] || null,
          pf: this._pathFound,
          as: this._angularMaxSpeed,
          re: this._reachedEnd,
          ma: this._movementAngle,
        },
      };
    }

    override updateFromNetworkSyncData(
      networkSyncData: NavMeshCharacterNetworkSyncData,
      options: UpdateFromNetworkSyncDataOptions
    ): void {
      super.updateFromNetworkSyncData(networkSyncData, options);
      const behaviorSpecificProps = networkSyncData.props;
      if (behaviorSpecificProps.d !== undefined) {
        // TODO Try a more reliable synchronization by overriding the path using the low level API.
        const destination = this._path[this._path.length - 1];
        if (behaviorSpecificProps.d === null) {
          if (destination) {
            this.stop();
          }
        } else if (
          !destination ||
          destination.x !== behaviorSpecificProps.d.x ||
          destination.y !== behaviorSpecificProps.d.y ||
          destination.z !== behaviorSpecificProps.d.z
        ) {
          this.moveTo(
            behaviorSpecificProps.d.x,
            behaviorSpecificProps.d.y,
            behaviorSpecificProps.d.z
          );
        }
      }
      if (behaviorSpecificProps.pf !== undefined) {
        this._pathFound = behaviorSpecificProps.pf;
      }
      if (behaviorSpecificProps.as !== undefined) {
        this._angularMaxSpeed = behaviorSpecificProps.as;
      }
      if (behaviorSpecificProps.re !== undefined) {
        this._reachedEnd = behaviorSpecificProps.re;
      }
      if (behaviorSpecificProps.ma !== undefined) {
        this._movementAngle = behaviorSpecificProps.ma;
      }
    }

    override onActivate() {
      this._manager.addCharacter(this);
    }

    override onDeActivate() {
      this._manager.removeCharacter(this);
    }

    override onDestroy() {
      this._manager.removeCharacter(this);
    }

    stop(): void {
      if (!this._agent) {
        return;
      }
      this._path = [];
      this._pathFound = false;
      this._reachedEnd = false;
      this._agent.resetMoveTarget();
    }

    /**
     * Compute and move on the path to the specified destination.
     */
    moveTo(x: float, y: float, z: float): void {
      this._path = [];
      this._manager.rebuildNavMeshIfNeeded();
      if (!this._manager.navMesh || !this._agent) {
        this._pathFound = false;
        return;
      }

      const navMeshQuery = new RecastNav.NavMeshQuery(this._manager.navMesh);
      const { success: hasFoundOrigin, point: origin } =
        navMeshQuery.findClosestPoint(
          {
            x: this.owner.getX(),
            y: gdjs.Base3DHandler.is3D(this.owner) ? this.owner.getZ() : 0,
            z: this._manager.is3D
              ? this.owner.getY()
              : this.owner.getY() * this._manager.inverseSpeedScaleY,
          },
          {
            halfExtents: {
              x: 100,
              y: this._manager.is3D
                ? 100
                : gdjs.NavMeshObstaclesManager.cellHeightFor2D,
              z: 100,
            },
          }
        );
      if (!hasFoundOrigin) {
        navMeshQuery.destroy();
        this._pathFound = false;
        return;
      }
      const agentInitialPosition = this._agent.position();
      // Teleporting the agent resets its velocity and move target,
      // so it's only done (and rolled back) when actually needed.
      let hasTeleported = false;
      if (
        agentInitialPosition.x !== origin.x ||
        agentInitialPosition.y !== origin.y ||
        agentInitialPosition.z !== origin.z
      ) {
        this._agent.teleport(origin);
        hasTeleported = true;
      }

      const { success: hasFoundDestination, point: destination } =
        navMeshQuery.findClosestPoint(
          {
            x,
            y: z,
            z: this._manager.is3D ? y : y * this._manager.inverseSpeedScaleY,
          },
          {
            halfExtents: {
              x: 100,
              y: this._manager.is3D
                ? 100
                : gdjs.NavMeshObstaclesManager.cellHeightFor2D,
              z: 100,
            },
          }
        );
      navMeshQuery.destroy();
      if (!hasFoundDestination) {
        this._pathFound = false;
        if (hasTeleported) {
          this._agent.teleport(agentInitialPosition);
        }
        return;
      }

      this._pathFound = this._agent.requestMoveTarget(destination);
      if (this._pathFound) {
        this._reachedEnd = false;
        const newX = origin.x;
        const newY = this._manager.is3D
          ? origin.z
          : origin.z * this._manager.speedScaleY;
        const newZ = origin.y;
        this.owner.setX(newX);
        this.owner.setY(newY);
        if (gdjs.Base3DHandler.is3D(this.owner)) {
          this.owner.setZ(newZ);
        }
        this._oldX = newX;
        this._oldY = newY;
        this._oldZ = newZ;
      } else if (hasTeleported) {
        this._agent.teleport(agentInitialPosition);
      }
    }

    teleportAgentToObjectIfNeeded(): void {
      if (
        this._oldX === this.owner.getX() &&
        this._oldY === this.owner.getY() &&
        (!gdjs.Base3DHandler.is3D(this.owner) ||
          this._oldZ === this.owner.getZ())
      ) {
        return;
      }
      if (!this._agent) {
        // Try to create the agent at the new object position.
        this._manager.buildCharacterAgent(this);
        return;
      }
      const agent = this._agent;
      const oldX = this.owner.getX();
      const oldY = this.owner.getY();
      // For 2D we keep the agent position for Z because the ground may not be
      // at 0 because of rasterization.
      const oldZ = gdjs.Base3DHandler.is3D(this.owner)
        ? this.owner.getZ()
        : agent.raw.get_npos(1);

      agent.teleport({
        x: oldX,
        y: oldZ,
        z: this._manager.is3D ? oldY : oldY * this._manager.inverseSpeedScaleY,
      });
      this._path = [];
      this._pathFound = false;
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
      }

      let newX = agent.raw.get_npos(0);
      let newY = this._manager.is3D
        ? agent.raw.get_npos(2)
        : agent.raw.get_npos(2) * this._manager.speedScaleY;
      let newZ = agent.raw.get_npos(1);

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
        this.owner.rotateTowardAngle(
          this._movementAngle + this._angleOffset,
          this._angularMaxSpeed
        );
      }
      if (
        Math.abs(newX - destinationX) < 1 &&
        Math.abs(newY - destinationY) < 1 &&
        (!gdjs.Base3DHandler.is3D(this.owner) ||
          Math.abs(newZ - destinationZ) < 1)
      ) {
        this._reachedEnd = true;
        agent.resetMoveTarget();
      }
      this.owner.setX(newX);
      this.owner.setY(newY);
      if (gdjs.Base3DHandler.is3D(this.owner)) {
        this.owner.setZ(newZ);
      }
      this._oldX = newX;
      this._oldY = newY;
      this._oldZ = newZ;
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
        const velocityX = this._agent.raw.get_vel(0);
        const velocityY = this._agent.raw.get_vel(1);
        const velocityZ = this._agent.raw.get_vel(2);
        const oldSpeed = Math.hypot(velocityX, velocityY, velocityZ);
        if (oldSpeed === 0) {
          this._agent.requestMoveVelocity({ x: speed, y: 0, z: 0 });
        } else {
          const ratio = speed / oldSpeed;

          this._agent.raw.set_vel(0, velocityX * ratio);
          this._agent.raw.set_vel(1, velocityY * ratio);
          this._agent.raw.set_vel(2, velocityZ * ratio);
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

    getAngularMaxSpeed(): float {
      return this._angularMaxSpeed;
    }

    setAngleOffset(angleOffset: float): void {
      this._angleOffset = angleOffset;
    }

    getAngleOffset(): float {
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

    getNextNodeIndex(): integer {
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

    getPreviousNodeIndex(): integer {
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
    pathFound(): boolean {
      return this._pathFound;
    }

    /**
     * Return true if the object reached its destination.
     */
    destinationReached(): boolean {
      return this._reachedEnd;
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshCharacterBehavior',
    gdjs.NavMeshCharacterRuntimeBehavior
  );
}
