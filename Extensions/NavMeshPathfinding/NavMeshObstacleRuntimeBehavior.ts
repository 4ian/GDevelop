namespace gdjs {
  export interface RuntimeInstanceContainer {
    navMeshObstaclesManager: gdjs.NavMeshObstaclesManager;
  }

  const cubePositions = [
    0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5, -0.5, 0.5,
    -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5,
  ];
  const cubeIndices = [
    0, 1, 2, 1, 3, 2, 4, 5, 6, 5, 7, 6, 4, 6, 2, 6, 8, 2, 7, 5, 1, 5, 3, 1, 6,
    7, 8, 7, 1, 8, 2, 3, 4, 3, 5, 4,
  ];

  const isModel3D = (
    object: gdjs.RuntimeObject
  ): object is gdjs.Model3DRuntimeObject => {
    //@ts-ignore We are checking if the methods are present.
    return object._modelResourceName;
  };

  /**
   * NavMeshObstaclesManager manages the common objects shared by objects
   * having a pathfinding behavior: In particular, the obstacles behaviors are
   * required to declare themselves (see
   * `NavMeshObstaclesManager.addObstacle`) to the manager of their
   * associated container (see `NavMeshObstaclesManager.getManager`).
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshObstaclesManager {
    instanceContainer: gdjs.RuntimeInstanceContainer;
    obstacles = new Set<NavMeshObstacleRuntimeBehavior>();
    characters = new Set<NavMeshCharacterRuntimeBehavior>();
    is3D = false;
    navMesh: RecastNav.NavMesh | null = null;
    private navMeshConfig: Partial<RecastNav.SoloNavMeshGeneratorConfig> = {
      cs: 10,
      ch: 10,
      walkableSlopeAngle: 50,
      walkableHeight: 15,
      detailSampleMaxError: 50,
      walkableClimb: 2,
      walkableRadius: 1,
    };
    cellSize: float = 10;
    cellDepth: float = 10;
    walkableRadius: float = -1;
    walkableDepth: float = 150;
    stairHeightMax: float = 20;
    speedScaleY: float = 1;
    inverseSpeedScaleY: float = 1;
    timeSinceLastNavMeshLastRebuild: float = 1;
    isNavMeshDirty = true;
    isFirstFrame = true;
    crowd: RecastNav.Crowd | null = null;
    hasStepped = false;
    debuggerRenderer: gdjs.NavMeshDebuggerRenderer | null = null;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this.instanceContainer = instanceContainer;
      if (!sharedData) {
        // It can happens when there is no object with the character behavior.
        return;
      }
      this.cellSize = Math.max(0, sharedData.cellSize) || 10;
      this.cellDepth = sharedData.cellDepth;
      this.navMeshConfig.detailSampleMaxError = sharedData.cellDepth * 5;
      this.navMeshConfig.walkableSlopeAngle = sharedData.slopeMaxAngle;
      this.stairHeightMax = sharedData.stairHeightMax;
      this.walkableDepth = sharedData.walkableDepth;
      this.walkableRadius = sharedData.walkableRadius;
      this.speedScaleY =
        sharedData.speedScaleY > 0 ? sharedData.speedScaleY : 1;
      this.inverseSpeedScaleY = 1 / this.speedScaleY;
    }

    /**
     * Get the obstacles manager of an instance container.
     */
    static getManager(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): gdjs.NavMeshObstaclesManager {
      if (!instanceContainer.navMeshObstaclesManager) {
        // Create the shared manager if necessary.
        const initialData =
          instanceContainer.getInitialSharedDataForBehavior('NavMeshCharacter');
        instanceContainer.navMeshObstaclesManager =
          new gdjs.NavMeshObstaclesManager(instanceContainer, initialData);
      }
      return instanceContainer.navMeshObstaclesManager;
    }

    step(timeDelta: float): void {
      if (this.hasStepped) {
        return;
      }
      this.hasStepped = true;
      this.timeSinceLastNavMeshLastRebuild += timeDelta;
      // Don't try to build the nav mesh before the events get a chance
      // to build the level.
      if (!this.isFirstFrame) {
        this.rebuildNavMeshIfNeeded();
      }
      this.isFirstFrame = false;

      if (!this.crowd) {
        return;
      }
      for (const character of this.characters) {
        character.teleportAgentToObjectIfNeeded();
      }
      this.crowd.update(timeDelta); //1 / 60, timeDelta, 8);
    }

    invalidateNavMesh(): void {
      this.isNavMeshDirty = true;
    }

    rebuildNavMeshIfNeeded(): void {
      if (!this.isNavMeshDirty || this.timeSinceLastNavMeshLastRebuild < 1) {
        return;
      }
      this.timeSinceLastNavMeshLastRebuild = 0;
      this.isNavMeshDirty = false;
      const positions: Array<float> = [];
      const indices: Array<integer> = [];
      for (const obstacle of this.obstacles) {
        const object = obstacle.owner;
        if (gdjs.Base3DHandler.is3D(object)) {
          if (isModel3D(object) && obstacle._shape === 'Mesh') {
            this.addMeshFor(object, obstacle, positions, indices);
          } else {
            this.addBoxFor(object, positions, indices);
          }
        } else if (!this.is3D) {
          this.addPolygonsFor(object, positions, indices);
        }
      }
      if (!this.is3D) {
        this.addGroundFor2D(positions, indices);
        this.navMeshConfig.walkableClimb = 0.1;
        this.navMeshConfig.walkableHeight = 2;
        this.navMeshConfig.ch = this.cellSize;
      } else {
        const walkableClimbMin =
          this.navMeshConfig.walkableSlopeAngle &&
          this.navMeshConfig.walkableSlopeAngle > 40
            ? 2
            : 1;
        this.navMeshConfig.walkableClimb = Math.max(
          walkableClimbMin,
          this.stairHeightMax / this.cellDepth
        );
        this.navMeshConfig.walkableHeight = this.walkableDepth / this.cellDepth;
        this.navMeshConfig.ch = this.cellDepth;
      }
      this.navMeshConfig.cs = this.cellSize;

      let characterRadiusMax = 0;
      for (const character of this.characters) {
        characterRadiusMax = Math.max(
          characterRadiusMax,
          character.getRadius()
        );
      }
      this.navMeshConfig.walkableRadius =
        (this.walkableRadius < 0 ? characterRadiusMax : this.walkableRadius) /
        this.cellSize;

      const result = RecastNav.generateSoloNavMesh(
        positions,
        indices,
        this.navMeshConfig
      );
      if (result.success) {
        const oldNavMesh = this.navMesh;
        const oldCrowd = this.crowd;
        this.navMesh = result.navMesh;
        this.crowd = new RecastNav.Crowd(this.navMesh, {
          maxAgents: this.characters.size + 100,
          maxAgentRadius: characterRadiusMax,
        });
        for (const character of this.characters) {
          this.buildCharacterAgent(character);
        }
        if (this.debuggerRenderer) {
          this.debuggerRenderer.renderFor3D();
        }

        if (oldNavMesh) {
          oldNavMesh.destroy();
        }
        if (oldCrowd) {
          oldCrowd.destroy();
        }
      }
    }

    setDebugDrawEnabled(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      enableDebugDraw: boolean
    ): void {
      if (!this.debuggerRenderer) {
        this.debuggerRenderer = new gdjs.NavMeshDebuggerRenderer(this);
      }
      this.debuggerRenderer.setEnabled(instanceContainer, enableDebugDraw);
    }

    private addGroundFor2D(
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const game = this.instanceContainer.getGame();
      let minX = 0;
      let minY = 0;
      let maxX = game.getGameResolutionWidth();
      let maxY = game.getGameResolutionHeight();
      if (positions.length > 0) {
        minX = Number.POSITIVE_INFINITY;
        minY = Number.POSITIVE_INFINITY;
        maxX = Number.NEGATIVE_INFINITY;
        maxY = Number.NEGATIVE_INFINITY;
        for (let index = 0; index + 2 < positions.length; index += 3) {
          const x = positions[index];
          const y = positions[index + 2];
          minX = Math.min(minX, x);
          minY = Math.min(minY, y);
          maxX = Math.max(maxX, x);
          maxY = Math.max(maxY, y);
        }
        const gameSize = Math.max(
          game.getGameResolutionWidth(),
          game.getGameResolutionHeight()
        );
        // Extends the area in case it's not closed by obstacles
        // and characters may be expected to go around them.
        minX -= gameSize;
        minY -= gameSize;
        maxX += gameSize;
        maxY += gameSize;
      }
      const width = maxX - minX;
      const height = (maxY - minY) * this.inverseSpeedScaleY;
      const centerX = (maxX + minX) / 2;
      const centerY = ((maxY + minY) / 2) * this.inverseSpeedScaleY;

      const zMax = -1;
      const zMin = -this.cellSize;
      const depth = zMax - zMin;
      const centerZ = (zMax + zMin) / 2;
      const indicesOffset = Math.round(positions.length / 3);
      for (let index = 0; index + 2 < cubePositions.length; index = index + 3) {
        let x = cubePositions[index];
        let y = cubePositions[index + 2];
        let z = cubePositions[index + 1];

        x *= width;
        y *= height;
        z *= depth;

        x += centerX;
        y += centerY;
        z += centerZ;

        // Y is the top for Recast
        positions.push(x, z, y);
      }
      for (const vertexIndex of cubeIndices) {
        indices.push(vertexIndex + indicesOffset);
      }
    }

    private addPolygonsFor(
      object: gdjs.RuntimeObject,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const vertexFlags: Array<boolean> = [];
      for (const hitBox of object.getHitBoxes()) {
        let indicesOffset = Math.round(positions.length / 3);
        const vertices: Array<Point> = hitBox.vertices.map(([x, y]) => ({
          x,
          y,
        }));
        if (
          getSignedAreaX2(
            vertices[0].x,
            vertices[0].y,
            vertices[1].x,
            vertices[1].y,
            vertices[2].x,
            vertices[2].y
          ) > 0
        ) {
          vertices.reverse();
        }
        const zMax = this.cellSize;
        const zMin = -1;
        triangulate(
          vertices,
          vertexFlags,
          (p1: Point, p2: Point, p3: Point) => {
            // Top
            positions.push(p1.x, zMax, p1.y * this.inverseSpeedScaleY);
            positions.push(p2.x, zMax, p2.y * this.inverseSpeedScaleY);
            positions.push(p3.x, zMax, p3.y * this.inverseSpeedScaleY);
            indices.push(
              indicesOffset + 0,
              indicesOffset + 1,
              indicesOffset + 2
            );
            // Bottom
            positions.push(p1.x, zMin, p1.y * this.inverseSpeedScaleY);
            positions.push(p2.x, zMin, p2.y * this.inverseSpeedScaleY);
            positions.push(p3.x, zMin, p3.y * this.inverseSpeedScaleY);
            indices.push(
              indicesOffset + 3,
              indicesOffset + 5,
              indicesOffset + 4
            );
            indicesOffset += 6;
          }
        );
        for (let index = 0; index < vertices.length; index++) {
          const vertex = vertices[index];
          // Side
          positions.push(vertex.x, zMax, vertex.y * this.inverseSpeedScaleY);
          positions.push(vertex.x, zMin, vertex.y * this.inverseSpeedScaleY);
          indices.push(indicesOffset + 0, indicesOffset + 1, indicesOffset + 2);
          indices.push(indicesOffset + 3, indicesOffset + 2, indicesOffset + 1);
          indicesOffset += 2;
        }
        const vertex = vertices[0];
        positions.push(vertex.x, zMax, vertex.y * this.inverseSpeedScaleY);
        positions.push(vertex.x, zMin, vertex.y * this.inverseSpeedScaleY);
      }
    }

    private addBoxFor(
      object: gdjs.AbstractRuntimeObject3D,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const point = new THREE.Vector3();
      const euler = new THREE.Euler();
      euler.order = 'ZYX';

      const indicesOffset = Math.round(positions.length / 3);
      for (let index = 0; index + 2 < cubePositions.length; index = index + 3) {
        let x = cubePositions[index];
        let y = cubePositions[index + 2];
        let z = cubePositions[index + 1];

        x *= object.getWidth();
        y *= object.getHeight();
        z *= object.getDepth();

        point.set(x, y, z);
        euler.set(
          gdjs.toRad(object.getRotationX()),
          gdjs.toRad(object.getRotationY()),
          gdjs.toRad(object.getAngle())
        );
        point.applyEuler(euler);

        x = object.getCenterXInScene() + point.x;
        y = object.getCenterYInScene() + point.y;
        z = object.getCenterZInScene() + point.z;

        // Y is the top for Recast
        positions.push(x, z, y);
      }
      for (const vertexIndex of cubeIndices) {
        indices.push(vertexIndex + indicesOffset);
      }
    }

    private addMeshFor(
      model3DRuntimeObject: gdjs.Model3DRuntimeObject,
      obstacle: NavMeshObstacleRuntimeBehavior,
      positions: Array<float>,
      indices: Array<integer>
    ): void {
      const originalModel = model3DRuntimeObject
        .getInstanceContainer()
        .getGame()
        .getModel3DManager()
        .getModel(
          obstacle._meshShapeResourceName ||
            model3DRuntimeObject._modelResourceName ||
            ''
        );

      const modelInCube = new THREE.Group();
      modelInCube.rotation.order = 'ZYX';
      const root = THREE_ADDONS.SkeletonUtils.clone(originalModel.scene);
      modelInCube.add(root);

      const data = model3DRuntimeObject._data.content;
      model3DRuntimeObject._renderer.stretchModelIntoUnitaryCube(
        modelInCube,
        data.rotationX,
        data.rotationY,
        data.rotationZ
      );

      const threeObject = new THREE.Group();
      threeObject.rotation.order = 'ZYX';
      threeObject.add(modelInCube);
      const object = model3DRuntimeObject;
      const width = object.getWidth();
      const height = object.getHeight();
      const depth = object.getDepth();
      threeObject.scale.set(
        object.isFlippedX() ? -width : width,
        object.isFlippedY() ? -height : height,
        object.isFlippedZ() ? -depth : depth
      );
      threeObject.position.set(
        object.getCenterXInScene(),
        object.getCenterYInScene(),
        object.getCenterZInScene()
      );
      threeObject.rotation.set(
        gdjs.toRad(object.getRotationX()),
        gdjs.toRad(object.getRotationY()),
        gdjs.toRad(object.getAngle())
      );

      threeObject.updateMatrixWorld();

      // For indexed triangles
      const vector3 = new THREE.Vector3();

      threeObject.traverse((object3d) => {
        const mesh = object3d as THREE.Mesh;
        if (!mesh.isMesh) {
          return;
        }
        const indicesOffset = Math.round(positions.length / 3);
        const positionAttribute = mesh.geometry.getAttribute('position');
        object3d.getWorldScale(vector3);
        // Negate it because we swap Y and Z.
        const shouldTrianglesBeFlipped = !(
          vector3.x * vector3.y * vector3.z <
          0
        );
        const index = mesh.geometry.getIndex();
        if (index) {
          for (let i = 0; i < positionAttribute.count; i++) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);
          }
          for (let i = 0; i < index.count; i += 3) {
            indices.push(
              indicesOffset + index.getX(shouldTrianglesBeFlipped ? i + 1 : i),
              indicesOffset + index.getX(shouldTrianglesBeFlipped ? i : i + 1),
              indicesOffset + index.getX(i + 2)
            );
          }
        } else {
          for (let i = 0; i < positionAttribute.count; i += 3) {
            vector3.fromBufferAttribute(positionAttribute, i);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            vector3.fromBufferAttribute(positionAttribute, i + 1);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            vector3.fromBufferAttribute(positionAttribute, i + 2);
            object3d.localToWorld(vector3);
            positions.push(vector3.x, vector3.z, vector3.y);

            indices.push(
              indicesOffset + (shouldTrianglesBeFlipped ? i + 1 : i),
              indicesOffset + (shouldTrianglesBeFlipped ? i : i + 1),
              indicesOffset + i + 2
            );
          }
        }
      });
    }

    buildCharacterAgent(character: NavMeshCharacterRuntimeBehavior): void {
      if (!this.navMesh || !this.crowd) {
        return;
      }
      const owner = character.owner;
      const navMeshQuery = new RecastNav.NavMeshQuery(this.navMesh);
      const { success: hasFoundOrigin, point: origin } =
        navMeshQuery.findClosestPoint(
          {
            x: owner.getX(),
            y: gdjs.Base3DHandler.is3D(owner) ? owner.getZ() : 0,
            z: this.is3D
              ? owner.getY()
              : owner.getY() * this.inverseSpeedScaleY,
          },
          {
            halfExtents: {
              x: 100,
              y: this.is3D ? 100 : this.cellSize / 2 - 0.5,
              z: 100,
            },
          }
        );
      navMeshQuery.destroy();
      if (!hasFoundOrigin) {
        character._agent = null;
        return;
      }

      character._crowdAgentParams.radius = character.getRadius();
      character._crowdAgentParams.height = gdjs.Base3DHandler.is3D(owner)
        ? owner.getDepth()
        : 1;
      const agent = this.crowd
        ? this.crowd.addAgent(origin, character._crowdAgentParams)
        : null;

      const oldAgent = character._agent;
      character._agent = agent;
      if (agent) {
        if (character.pathFound() && !character.destinationReached()) {
          character.moveTo(
            character.getDestinationX(),
            character.getDestinationY(),
            character.getDestinationZ()
          );
        }
        if (oldAgent) {
          agent.raw.set_vel(0, oldAgent.raw.get_vel(0));
          agent.raw.set_vel(1, oldAgent.raw.get_vel(1));
          agent.raw.set_vel(2, oldAgent.raw.get_vel(2));
        }
      }
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(obstacle: NavMeshObstacleRuntimeBehavior): void {
      this.obstacles.add(obstacle);
      if (gdjs.Base3DHandler.is3D(obstacle.owner)) {
        this.is3D = true;
      }
      this.invalidateNavMesh();
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(obstacle: NavMeshObstacleRuntimeBehavior): void {
      this.obstacles.delete(obstacle);
      this.invalidateNavMesh();
    }

    /**
     * Add a character to the list of existing characters.
     */
    addCharacter(character: NavMeshCharacterRuntimeBehavior): void {
      if (this.characters.has(character)) {
        return;
      }
      this.characters.add(character);
      if (gdjs.Base3DHandler.is3D(character.owner)) {
        this.is3D = true;
      }
      this.buildCharacterAgent(character);
    }

    /**
     * Remove a character from the list of existing characters.
     */
    removeCharacter(character: NavMeshCharacterRuntimeBehavior): void {
      this.characters.delete(character);
      if (this.crowd && character._agent) {
        this.crowd.removeAgent(character._agent);
        character._agent = null;
      }
    }
  }

  /** @category Behaviors > NavMesh pathfinding */
  export namespace NavMeshObstaclesManager {
    /**
     * Enable or disable the debug draw.
     * @param instanceContainer The current container.
     * @param enableDebugDraw true to enable the debug draw, false to disable it.
     */
    export const enableDebugDraw = function (
      instanceContainer: gdjs.RuntimeInstanceContainer,
      enableDebugDraw: boolean
    ): void {
      if (enableDebugDraw) {
        // Make sure the debug layer will be displayed.
        // We never set it back to false because users might have enabled hit-box
        // debug draw with the other action.
        instanceContainer._debugDrawEnabled = true;
      }
      const manager =
        gdjs.NavMeshObstaclesManager.getManager(instanceContainer);
      manager.setDebugDrawEnabled(instanceContainer, enableDebugDraw);
    };
  }

  /**
   * NavMeshObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Character Behavior.
   * @category Behaviors > NavMesh pathfinding
   */
  export class NavMeshObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _shape: string;
    _meshShapeResourceName: string;

    _oldX: float = 0;
    _oldY: float = 0;
    _oldZ: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _oldDepth: float = 0;
    _oldRotationX: float = 0;
    _oldRotationY: float = 0;
    _oldRotationZ: float = 0;
    _manager: NavMeshObstaclesManager;
    _registeredInManager: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._shape = behaviorData.shape;
      this._meshShapeResourceName = behaviorData.meshShapeResourceName;
      this._manager = NavMeshObstaclesManager.getManager(instanceContainer);

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.shape !== undefined) {
        this._shape = behaviorData.shape;
        this._manager.invalidateNavMesh();
      }
      if (behaviorData.meshShapeResourceName !== undefined) {
        this._meshShapeResourceName = behaviorData.meshShapeResourceName;
        this._manager.invalidateNavMesh();
      }
      return true;
    }

    override onDestroy() {
      if (this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
    }

    override doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!this.activated() && this._registeredInManager) {
        this._manager.removeObstacle(this);
        this._registeredInManager = false;
      } else {
        if (this.activated() && !this._registeredInManager) {
          this._manager.addObstacle(this);
          this._registeredInManager = true;
        }
      }

      const newX = this.owner.getX();
      const newY = this.owner.getY();
      const newWidth = this.owner.getWidth();
      const newHeight = this.owner.getHeight();
      const newRotationZ = this.owner.getAngle();
      let newZ = 0;
      let newDepth = 0;
      let newRotationX = 0;
      let newRotationY = 0;
      if (gdjs.Base3DHandler.is3D(this.owner)) {
        newZ = this.owner.getZ();
        newDepth = this.owner.getDepth();
        newRotationX = this.owner.getRotationX();
        newRotationY = this.owner.getRotationY();
      }
      if (
        this._oldX !== newX ||
        this._oldY !== newY ||
        this._oldZ !== newZ ||
        this._oldWidth !== newWidth ||
        this._oldHeight !== newHeight ||
        this._oldDepth !== newDepth ||
        this._oldRotationX !== newRotationX ||
        this._oldRotationY !== newRotationY ||
        this._oldRotationZ !== newRotationZ
      ) {
        if (this._registeredInManager) {
          this._manager.invalidateNavMesh();
        }
        this._oldX = newX;
        this._oldY = newY;
        this._oldZ = newZ;
        this._oldWidth = newWidth;
        this._oldHeight = newHeight;
        this._oldDepth = newDepth;
        this._oldRotationX = newRotationX;
        this._oldRotationY = newRotationY;
        this._oldRotationZ = newRotationZ;
      }
    }

    override doStepPostEvents(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ) {}

    override onActivate() {
      if (this._registeredInManager) {
        return;
      }
      this._manager.addObstacle(this);
      this._registeredInManager = true;
    }

    override onDeActivate() {
      if (!this._registeredInManager) {
        return;
      }
      this._manager.removeObstacle(this);
      this._registeredInManager = false;
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshObstacleBehavior',
    gdjs.NavMeshObstacleRuntimeBehavior
  );

  // The following code is inspired from Critterai
  // https://github.com/stevefsp/critterai
  interface Point {
    x: number;
    y: number;
  }

  /**
   * Attempts to triangulate a polygon.
   *
   * @param vertices the polygon to be triangulate.
   * The content is manipulated during the operation
   * and it will be left in an undefined state at the end of
   * the operation.
   * @param vertexFlags only used internally
   * @param outTriangles is called for each triangle derived
   * from the original polygon.
   */
  function triangulate(
    vertices: Array<Point>,
    vertexFlags: Array<boolean>,
    outTriangles: (p1: Point, p2: Point, p3: Point) => void
  ): void {
    // Terminology, concepts and such:
    //
    // This algorithm loops around the edges of a polygon looking for
    // new internal edges to add that will partition the polygon into a
    // new valid triangle internal to the starting polygon. During each
    // iteration the shortest potential new edge is selected to form that
    // iteration's new triangle.
    //
    // Triangles will only be formed if a single new edge will create
    // a triangle. Two new edges will never be added during a single
    // iteration. This means that the triangulated portions of the
    // original polygon will only contain triangles and the only
    // non-triangle polygon will exist in the untriangulated portion
    // of the original polygon.
    //
    // "Partition edge" refers to a potential new edge that will form a
    // new valid triangle.
    //
    // "Center" vertex refers to the vertex in a potential new triangle
    // which, if the triangle is formed, will be external to the
    // remaining untriangulated portion of the polygon. Since it
    // is now external to the polygon, it can't be used to form any
    // new triangles.
    //
    // Some documentation refers to "iPlus2" even though the variable is
    // not in scope or does not exist for that section of code. For
    // documentation purposes, iPlus2 refers to the 2nd vertex after the
    // primary vertex.
    // E.g.: i, iPlus1, and iPlus2.
    //
    // Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#triangulation

    // Loop through all vertices, flagging all indices that represent
    // a center vertex of a valid new triangle.
    vertexFlags.length = vertices.length;
    for (let i = 0; i < vertices.length; i++) {
      const iPlus1 = (i + 1) % vertices.length;
      const iPlus2 = (i + 2) % vertices.length;
      // A triangle formed by i, iPlus1, and iPlus2 will result
      // in a valid internal triangle.
      // Flag the center vertex (iPlus1) to indicate a valid triangle
      // location.
      vertexFlags[iPlus1] = isValidPartition(i, iPlus2, vertices);
    }

    // Loop through the vertices creating triangles. When there is only a
    // single triangle left,  the operation is complete.
    //
    // When a valid triangle is formed, remove its center vertex. So for
    // each loop, a single vertex will be removed.
    //
    // At the start of each iteration the indices list is in the following
    // state:
    // - Represents a simple polygon representing the un-triangulated
    //   portion of the original polygon.
    // - All valid center vertices are flagged.
    while (vertices.length > 3) {
      // Find the shortest new valid edge.

      // NOTE: i and iPlus1 are defined in two different scopes in
      // this section. So be careful.

      // Loop through all indices in the remaining polygon.
      let minLengthSq = Number.MAX_VALUE;
      let minLengthSqVertexIndex = -1;
      for (let i = 0; i < vertices.length; i++) {
        if (vertexFlags[(i + 1) % vertices.length]) {
          // Indices i, iPlus1, and iPlus2 are known to form a
          // valid triangle.
          const vert = vertices[i];
          const vertPlus2 = vertices[(i + 2) % vertices.length];

          // Determine the length of the partition edge.
          // (i -> iPlus2)
          const deltaX = vertPlus2.x - vert.x;
          const deltaY = vertPlus2.y - vert.y;
          const lengthSq = deltaX * deltaX + deltaY * deltaY;

          if (lengthSq < minLengthSq) {
            minLengthSq = lengthSq;
            minLengthSqVertexIndex = i;
          }
        }
      }

      if (minLengthSqVertexIndex === -1)
        // Could not find a new triangle. Triangulation failed.
        // This happens if there are three or more vertices
        // left, but none of them are flagged as being a
        // potential center vertex.
        return;

      let i = minLengthSqVertexIndex;
      let iPlus1 = (i + 1) % vertices.length;

      // Add the new triangle to the output.
      outTriangles(
        vertices[i],
        vertices[iPlus1],
        vertices[(i + 2) % vertices.length]
      );

      // iPlus1, the "center" vert in the new triangle, is now external
      // to the untriangulated portion of the polygon. Remove it from
      // the vertices list since it cannot be a member of any new
      // triangles.
      vertices.splice(iPlus1, 1);
      vertexFlags.splice(iPlus1, 1);

      if (iPlus1 === 0 || iPlus1 >= vertices.length) {
        // The vertex removal has invalidated iPlus1 and/or i. So
        // force a wrap, fixing the indices so they reference the
        // correct indices again. This only occurs when the new
        // triangle is formed across the wrap location of the polygon.
        // Case 1: i = 14, iPlus1 = 15, iPlus2 = 0
        // Case 2: i = 15, iPlus1 = 0, iPlus2 = 1;
        i = vertices.length - 1;
        iPlus1 = 0;
      }

      // At this point i and iPlus1 refer to the two indices from a
      // successful triangulation that will be part of another new
      // triangle. We now need to re-check these indices to see if they
      // can now be the center index in a potential new partition.
      vertexFlags[i] = isValidPartition(
        (i - 1 + vertices.length) % vertices.length,
        iPlus1,
        vertices
      );
      vertexFlags[iPlus1] = isValidPartition(
        i,
        (i + 2) % vertices.length,
        vertices
      );
    }

    // Only 3 vertices remain.
    // Add their triangle to the output list.
    outTriangles(vertices[0], vertices[1], vertices[2]);
  }

  /**
   * Check if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   *
   * I.e. the line segment AB is internal to the polygon and will not
   * cross existing line segments.
   *
   * Assumptions:
   * - The vertices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment formed by vertex A and vertex B will
   * form a valid partition of the polygon.
   */
  function isValidPartition(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    //  First check whether the segment AB lies within the internal
    //  angle formed at A (this is the faster check).
    //  If it does, then perform the more costly check.
    return (
      liesWithinInternalAngle(indexA, indexB, vertices) &&
      !hasIllegalEdgeIntersection(indexA, indexB, vertices)
    );
  }

  /**
   * Check if vertex B lies within the internal angle of the polygon
   * at vertex A.
   *
   * Vertex B does not have to be within the polygon border. It just has
   * be be within the area encompassed by the internal angle formed at
   * vertex A.
   *
   * This operation is a fast way of determining whether a line segment
   * can possibly form a valid polygon partition. If this test returns
   * FALSE, then more expensive checks can be skipped.
   *
   * Visualizations: http://www.critterai.org/projects/nmgen_study/polygen.html#anglecheck
   *
   * Special case:
   * FALSE is returned if vertex B lies directly on either of the rays
   * cast from vertex A along its associated polygon edges. So the test
   * on vertex B is exclusive of the polygon edges.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * -indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if vertex B lies within the internal angle of
   * the polygon at vertex A.
   */
  function liesWithinInternalAngle(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the main vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Get pointers to the vertices just before and just after vertA.
    const vertexAMinus =
      vertices[(indexA - 1 + vertices.length) % vertices.length];
    const vertexAPlus = vertices[(indexA + 1) % vertices.length];

    // First, find which of the two angles formed by the line segments
    //  AMinus->A->APlus is internal to (pointing towards) the polygon.
    // Then test to see if B lies within the area formed by that angle.

    // TRUE if A is left of or on line AMinus->APlus
    if (
      isLeftOrCollinear(
        vertexA.x,
        vertexA.y,
        vertexAMinus.x,
        vertexAMinus.y,
        vertexAPlus.x,
        vertexAPlus.y
      )
    )
      // The angle internal to the polygon is <= 180 degrees
      // (non-reflex angle).
      // Test to see if B lies within this angle.
      return (
        isLeft(
          // TRUE if B is left of line A->AMinus
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        ) &&
        // TRUE if B is right of line A->APlus
        isRight(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        )
      );

    // The angle internal to the polygon is > 180 degrees (reflex angle).
    // Test to see if B lies within the external (<= 180 degree) angle and
    // flip the result. (If B lies within the external angle, it can't
    // lie within the internal angle)
    return !(
      // TRUE if B is left of or on line A->APlus
      (
        isLeftOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAPlus.x,
          vertexAPlus.y
        ) &&
        // TRUE if B is right of or on line A->AMinus
        isRightOrCollinear(
          vertexB.x,
          vertexB.y,
          vertexA.x,
          vertexA.y,
          vertexAMinus.x,
          vertexAMinus.y
        )
      )
    );
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B.
   */
  function isLeft(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) < 0;
  }

  /**
   * Check if point P is to the left of line AB when looking
   * from A to B or is collinear with line AB.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the left of line AB when looking
   * from A to B, or is collinear with line AB.
   */
  function isLeftOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) <= 0;
  }

  /**
   * Check if point P is to the right of line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of line AB when looking
   * from A to B.
   */
  function isRight(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) > 0;
  }

  /**
   * Check if point P is to the right of or on line AB when looking
   * from A to B.
   * @param px The x-value of the point to test.
   * @param py The y-value of the point to test.
   * @param ax The x-value of the point (ax, ay) that is point A on line AB.
   * @param ay The y-value of the point (ax, ay) that is point A on line AB.
   * @param bx The x-value of the point (bx, by) that is point B on line AB.
   * @param by The y-value of the point (bx, by) that is point B on line AB.
   * @return TRUE if point P is to the right of or on line AB when looking
   * from A to B.
   */
  function isRightOrCollinear(
    px: integer,
    py: integer,
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer
  ): boolean {
    return getSignedAreaX2(ax, ay, px, py, bx, by) >= 0;
  }

  /**
   * The absolute value of the returned value is two times the area of the
   * triangle defined by points (A, B, C).
   *
   * A positive value indicates:
   * - Counterclockwise wrapping of the points.
   * - Point B lies to the right of line AC, looking from A to C.
   *
   * A negative value indicates:
   * - Clockwise wrapping of the points.<
   * - Point B lies to the left of line AC, looking from A to C.
   *
   * A value of zero indicates that all points are collinear or
   * represent the same point.
   *
   * This is a fast operation.
   *
   * @param ax The x-value for point (ax, ay) for vertex A of the triangle.
   * @param ay The y-value for point (ax, ay) for vertex A of the triangle.
   * @param bx The x-value for point (bx, by) for vertex B of the triangle.
   * @param by The y-value for point (bx, by) for vertex B of the triangle.
   * @param cx The x-value for point (cx, cy) for vertex C of the triangle.
   * @param cy The y-value for point (cx, cy) for vertex C of the triangle.
   * @return The signed value of two times the area of the triangle defined
   * by the points (A, B, C).
   */
  function getSignedAreaX2(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer
  ): integer {
    // References:
    // http://softsurfer.com/Archive/algorithm_0101/algorithm_0101.htm#Modern%20Triangles
    // http://mathworld.wolfram.com/TriangleArea.html (Search for "signed")
    return (bx - ax) * (cy - ay) - (cx - ax) * (by - ay);
  }

  /**
   * Check if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   *
   * Assumptions:
   * - The vertices and indices arguments define a valid simple polygon
   * with vertices wrapped clockwise.
   * - indexA != indexB
   *
   * Behavior is undefined if the arguments to not meet these
   * assumptions
   *
   * @param indexA the index of the vertex that will form the segment AB.
   * @param indexB the index of the vertex that will form the segment AB.
   * @param vertices a polygon wrapped clockwise.
   * @return true if the line segment AB intersects any edges not already
   * connected to one of the two vertices.
   */
  function hasIllegalEdgeIntersection(
    indexA: integer,
    indexB: integer,
    vertices: Point[]
  ): boolean {
    // Get pointers to the primary vertices being tested.
    const vertexA = vertices[indexA];
    const vertexB = vertices[indexB];

    // Loop through the polygon edges.
    for (
      let edgeBeginIndex = 0;
      edgeBeginIndex < vertices.length;
      edgeBeginIndex++
    ) {
      const edgeEndIndex = (edgeBeginIndex + 1) % vertices.length;
      if (
        edgeBeginIndex === indexA ||
        edgeBeginIndex === indexB ||
        edgeEndIndex === indexA ||
        edgeEndIndex === indexB
      ) {
        continue;
      }
      // Neither of the test indices are endpoints of this edge.
      // Get this edge's vertices.
      const edgeBegin = vertices[edgeBeginIndex];
      const edgeEnd = vertices[edgeEndIndex];
      if (
        (edgeBegin.x === vertexA.x && edgeBegin.y === vertexA.y) ||
        (edgeBegin.x === vertexB.x && edgeBegin.y === vertexB.y) ||
        (edgeEnd.x === vertexA.x && edgeEnd.y === vertexA.y) ||
        (edgeEnd.x === vertexB.x && edgeEnd.y === vertexB.y)
      ) {
        // One of the test vertices is co-located
        // with one of the endpoints of this edge (this is a
        // test of the actual position of the vertices rather than
        // simply the index check performed earlier).
        // Skip this edge.
        continue;
      }
      // This edge is not connected to either of the test vertices.
      // If line segment AB intersects  with this edge, then the
      // intersection is illegal.
      // I.e. New edges cannot cross existing edges.
      if (
        segmentsIntersect(
          vertexA.x,
          vertexA.y,
          vertexB.x,
          vertexB.y,
          edgeBegin.x,
          edgeBegin.y,
          edgeEnd.x,
          edgeEnd.y
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Returns TRUE if line segment AB intersects with line segment CD in any
   * manner. Either collinear or at a single point.
   * @param ax The x-value for point (ax, ay) in line segment AB.
   * @param ay The y-value for point (ax, ay) in line segment AB.
   * @param bx The x-value for point (bx, by) in line segment AB.
   * @param by The y-value for point (bx, by) in line segment AB.
   * @param cx The x-value for point (cx, cy) in line segment CD.
   * @param cy The y-value for point (cx, cy) in line segment CD.
   * @param dx The x-value for point (dx, dy) in line segment CD.
   * @param dy The y-value for point (dx, dy) in line segment CD.
   * @return TRUE if line segment AB intersects with line segment CD in any
   * manner.
   */
  function segmentsIntersect(
    ax: integer,
    ay: integer,
    bx: integer,
    by: integer,
    cx: integer,
    cy: integer,
    dx: integer,
    dy: integer
  ): boolean {
    // This is modified 2D line-line intersection/segment-segment
    // intersection test.

    const deltaABx = bx - ax;
    const deltaABy = by - ay;
    const deltaCAx = ax - cx;
    const deltaCAy = ay - cy;
    const deltaCDx = dx - cx;
    const deltaCDy = dy - cy;

    const numerator = deltaCAy * deltaCDx - deltaCAx * deltaCDy;
    const denominator = deltaABx * deltaCDy - deltaABy * deltaCDx;

    // Perform early exit tests.
    if (denominator === 0 && numerator !== 0) {
      // If numerator is zero, then the lines are colinear.
      // Since it isn't, then the lines must be parallel.
      return false;
    }

    // Lines intersect. But do the segments intersect?

    // Forcing float division on both of these via casting of the
    // denominator.
    const factorAB = numerator / denominator;
    const factorCD = (deltaCAy * deltaABx - deltaCAx * deltaABy) / denominator;

    // Determine the type of intersection
    if (
      factorAB >= 0.0 &&
      factorAB <= 1.0 &&
      factorCD >= 0.0 &&
      factorCD <= 1.0
    ) {
      return true; // The two segments intersect.
    }

    // The lines intersect, but segments to not.

    return false;
  }
}
