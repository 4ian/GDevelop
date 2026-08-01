/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

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
   * associated container (see
   * `gdjs.PathfindingRuntimeBehavior.obstaclesManagers`).
   * @category Behaviors > 2D Pathfinding
   */
  export class NavMeshObstaclesManager {
    obstacles = new Set<NavMeshObstacleRuntimeBehavior>();
    navMesh: RecastNav.NavMesh | null = null;
    timeSinceLastNavMeshLastRebuild: float = 1;
    isNavMeshDirty = true;
    isFirstFrame = true;
    crowd: RecastNav.Crowd | null = null;
    characterAgents = new Map<
      NavMeshCharacterRuntimeBehavior,
      RecastNav.CrowdAgent | null
    >();
    hasStepped = false;
    private navMeshConfig: Partial<RecastNav.SoloNavMeshGeneratorConfig> = {
      cs: 10,
      ch: 10,
      walkableSlopeAngle: 50,
      walkableHeight: 10,
      detailSampleMaxError: 50,
    };

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer, sharedData) {
      this.navMeshConfig.cs = sharedData.cellSize;
      this.navMeshConfig.ch = sharedData.cellDepth;
      this.navMeshConfig.detailSampleMaxError = sharedData.cellDepth * 5;
      this.navMeshConfig.walkableSlopeAngle = sharedData.slopeMaxAngle;
    }

    /**
     * Get the obstacles manager of an instance container.
     */
    static getManager(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!instanceContainer.navMeshObstaclesManager) {
        // Create the shared manager if necessary.
        const initialData =
          instanceContainer.getInitialSharedDataForBehavior('NavMeshCharacter');
        instanceContainer.navMeshObstaclesManager =
          new gdjs.NavMeshObstaclesManager(instanceContainer, initialData);
      }
      return instanceContainer.navMeshObstaclesManager;
    }

    step(timeDelta: float) {
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
      this.crowd.update(1 / 60, timeDelta, 8);
    }

    invalidateNavMesh() {
      this.isNavMeshDirty = true;
    }

    rebuildNavMeshIfNeeded() {
      if (!this.isNavMeshDirty || this.timeSinceLastNavMeshLastRebuild < 1) {
        return;
      }
      console.log('Rebuild the NavMesh');
      this.timeSinceLastNavMeshLastRebuild = 0;
      const positions: Array<float> = [];
      const indices: Array<integer> = [];
      for (const obstacle of this.obstacles) {
        //@ts-ignore
        const object: gdjs.RuntimeObject3D = obstacle.owner;
        if (obstacle._shape === 'Mesh' && isModel3D(object)) {
          this.addMeshFor(object, obstacle, positions, indices);
        } else {
          this.addBoxFor(object, positions, indices);
        }
      }

      const result = RecastNav.generateSoloNavMesh(
        positions,
        indices,
        this.navMeshConfig
      );
      if (result.success) {
        this.navMesh = result.navMesh;
        this.crowd = new RecastNav.Crowd(this.navMesh, {
          maxAgents: 100,
          maxAgentRadius: 50,
        });
        for (const character of this.characterAgents.keys()) {
          this.rebuildCharacterAgent(character);
        }
        this.isNavMeshDirty = false;
      }
    }

    private addBoxFor(
      object: gdjs.RuntimeObject3D,
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

    private rebuildCharacterAgent(character: NavMeshCharacterRuntimeBehavior) {
      if (!this.navMesh || !this.crowd) {
        this.characterAgents.set(character, null);
        return;
      }
      const owner = character.owner;
      const navMeshQuery = new RecastNav.NavMeshQuery(this.navMesh);
      const { success: hasFindOrigin, point: origin } =
        navMeshQuery.findClosestPoint(
          {
            x: owner.getX(),
            //@ts-ignore
            y: owner.getZ ? owner.getZ() : 0,
            z: owner.getY(),
          },
          { halfExtents: { x: 100, y: 100, z: 100 } }
        );
      if (!hasFindOrigin) {
        console.log(
          "Can't find origin",
          owner.getX(),
          owner.getY(),
          owner.getZ()
        );
        return;
      }

      character._crowdAgentParams.radius =
        character._radius || Math.min(owner.getWidth(), owner.getHeight());
      character._crowdAgentParams.height =
        //@ts-ignore
        owner.getDepth
          ? //@ts-ignore
            owner.getDepth()
          : 1;
      const agent = this.crowd
        ? this.crowd.addAgent(origin, character._crowdAgentParams)
        : null;

      if (agent) {
        const oldAgent = this.characterAgents.get(character);
        if (oldAgent) {
          agent.requestMoveTarget(oldAgent.target());
        }
      }
      this.characterAgents.set(character, agent);
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(pathfindingObstacleBehavior: NavMeshObstacleRuntimeBehavior) {
      this.obstacles.add(pathfindingObstacleBehavior);
      this.invalidateNavMesh();
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshObstacleRuntimeBehavior
    ) {
      this.obstacles.delete(pathfindingObstacleBehavior);
      this.invalidateNavMesh();
    }

    /**
     * Add a character to the list of existing characters.
     */
    addCharacter(character: NavMeshCharacterRuntimeBehavior) {
      if (this.characterAgents.get(character)) {
        return;
      }
      this.rebuildCharacterAgent(character);
    }

    /**
     * Remove a character from the list of existing characters.
     */
    removeCharacter(character: NavMeshCharacterRuntimeBehavior) {
      this.characterAgents.delete(character);
    }
  }

  /**
   * NavMeshObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Pathfinding Behavior.
   * @category Behaviors > 2D Pathfinding
   */
  export class NavMeshObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _impassable: boolean;
    _cost: float;
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
      this._impassable = behaviorData.impassable;
      this._cost = behaviorData.cost;
      this._shape = behaviorData.shape;
      this._meshShapeResourceName = behaviorData.meshShapeResourceName || '';
      this._manager = NavMeshObstaclesManager.getManager(instanceContainer);

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    override applyBehaviorOverriding(behaviorData): boolean {
      if (behaviorData.impassable !== undefined) {
        this.setImpassable(behaviorData.impassable);
      }
      if (behaviorData.cost !== undefined) {
        this.setCost(behaviorData.cost);
      }
      return true;
    }

    onDestroy() {
      if (this._manager && this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
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
      //@ts-ignore
      const newZ = this.owner.getZ ? this.owner.getZ() : 0;
      const newWidth = this.owner.getWidth();
      const newHeight = this.owner.getHeight();
      //@ts-ignore
      const newDepth = this.owner.getDepth ? this.owner.getDepth() : 0;
      //@ts-ignore
      const newRotationX = this.owner.getRotationX
        ? //@ts-ignore
          this.owner.getRotationX()
        : 0;
      //@ts-ignore
      const newRotationY = this.owner.getRotationY
        ? //@ts-ignore
          this.owner.getRotationY()
        : 0;
      //@ts-ignore
      const newRotationZ = this.owner.getRotationZ
        ? //@ts-ignore
          this.owner.getRotationZ()
        : 0;
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

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onActivate() {
      if (this._registeredInManager) {
        return;
      }
      this._manager.addObstacle(this);
      this._registeredInManager = true;
    }

    onDeActivate() {
      if (!this._registeredInManager) {
        return;
      }
      this._manager.removeObstacle(this);
      this._registeredInManager = false;
    }

    getCost() {
      return this._cost;
    }

    setCost(cost: float): void {
      this._cost = cost;
    }

    isImpassable(): boolean {
      return this._impassable;
    }

    setImpassable(impassable: boolean): void {
      this._impassable = impassable;
    }
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshObstacleBehavior',
    gdjs.NavMeshObstacleRuntimeBehavior
  );
}
