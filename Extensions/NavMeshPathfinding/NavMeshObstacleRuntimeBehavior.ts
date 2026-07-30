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
    crowd: RecastNav.Crowd | null = null;
    characterAgents = new Map<
      NavMeshCharacterRuntimeBehavior,
      RecastNav.CrowdAgent | null
    >();
    hasStepped = false;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    /**
     * Get the obstacles manager of an instance container.
     */
    static getManager(instanceContainer: gdjs.RuntimeInstanceContainer) {
      if (!instanceContainer.navMeshObstaclesManager) {
        //Create the shared manager if necessary.
        instanceContainer.navMeshObstaclesManager =
          new gdjs.NavMeshObstaclesManager(instanceContainer);
      }
      return instanceContainer.navMeshObstaclesManager;
    }

    step(timeDelta: float) {
      if (this.hasStepped) {
        return;
      }
      this.hasStepped = true;

      if (!this.crowd) {
        return;
      }
      this.crowd.update(1 / 60, timeDelta, 8);
    }

    rebuildNavMesh() {
      const navMeshConfig: Partial<RecastNav.SoloNavMeshGeneratorConfig> = {
        borderSize: 0,
        cs: 10,
        ch: 10,
        walkableSlopeAngle: 60,
        walkableHeight: 10,
        walkableClimb: 2,
        walkableRadius: 1,
        maxEdgeLen: 12,
        maxSimplificationError: 1.3,
        minRegionArea: 8,
        mergeRegionArea: 20,
        maxVertsPerPoly: 6,
        detailSampleDist: 6,
        detailSampleMaxError: 10,
      };

      const positions: Array<float> = [];
      const indices: Array<integer> = [];

      const euler = new THREE.Euler();
      euler.order = 'ZYX';
      const point = new THREE.Vector3();

      for (const obstacle of this.obstacles) {
        //@ts-ignore
        const object: gdjs.RuntimeObject3D = obstacle.owner;
        const indicesOffset = Math.round(positions.length / 3);
        for (
          let index = 0;
          index + 2 < cubePositions.length;
          index = index + 3
        ) {
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

      const result = RecastNav.generateSoloNavMesh(
        positions,
        indices,
        navMeshConfig
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
      }
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
            y: owner.getZ(),
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
      const agent = this.crowd
        ? this.crowd.addAgent(origin, {
            radius: 40,
            height: 100,
            maxAcceleration: 1000,
            maxSpeed: 300,
            collisionQueryRange: 60,
            pathOptimizationRange: 0.0,
            separationWeight: 1.0,
          })
        : null;
      this.characterAgents.set(character, agent);
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(pathfindingObstacleBehavior: NavMeshObstacleRuntimeBehavior) {
      this.obstacles.add(pathfindingObstacleBehavior);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshObstacleRuntimeBehavior
    ) {
      this.obstacles.delete(pathfindingObstacleBehavior);
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
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
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
      //Make sure the obstacle is or is not in the obstacles manager.
      if (!this.activated() && this._registeredInManager) {
        this._manager.removeObstacle(this);
        this._registeredInManager = false;
      } else {
        if (this.activated() && !this._registeredInManager) {
          this._manager.addObstacle(this);
          this._registeredInManager = true;
        }
      }

      //Track changes in size or position
      if (
        this._oldX !== this.owner.getX() ||
        this._oldY !== this.owner.getY() ||
        this._oldWidth !== this.owner.getWidth() ||
        this._oldHeight !== this.owner.getHeight()
      ) {
        if (this._registeredInManager) {
          // TODO Notify that the mesh is out of date?
        }
        this._oldX = this.owner.getX();
        this._oldY = this.owner.getY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
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
