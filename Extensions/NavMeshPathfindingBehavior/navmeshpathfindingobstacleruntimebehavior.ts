/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * PathfindingObstaclesManager manages the common objects shared by objects having a
   * pathfinding behavior: In particular, the obstacles behaviors are required to declare
   * themselves (see `PathfindingObstaclesManager.addObstacle`) to the manager of their associated scene
   * (see `gdjs.NavMeshPathfindingRuntimeBehavior.obstaclesManagers`).
   */
  export class NavMeshPathfindingObstaclesManager {
    _obstacles: Set<RuntimeObject>;

    // extension configuration
    _isometricRatio: float;
    _cellSize: float;
    _areaLeftBound: integer;
    _areaTopBound: integer;
    _areaRightBound: integer;
    _areaBottomBound: integer;

    /**
     * The navigation meshes by moving object size
     * (rounded on _cellSize)
     */
    _navMeshes: Map<integer, gdjs.NavMesh> = new Map();

    /**
     * @param object The object
     */
    constructor(runtimeScene: gdjs.RuntimeScene, sharedData) {
      this._obstacles = new Set();
      const game = runtimeScene.getGame();

      const viewpoint = sharedData.viewpoint;
      //TODO can an id be used instead of the label? Does it work with translations?
      if (viewpoint === 'Isometry 2:1 (26.565°)') {
        this._isometricRatio = 2;
      } else if (viewpoint === 'True Isometry (30°)') {
        this._isometricRatio = Math.sqrt(3);
      } else {
        this._isometricRatio = 1;
      }
      this._cellSize = sharedData.cellSize > 0 ? sharedData.cellSize : 10;
      if (
        sharedData.areaLeftBound === 0 &&
        sharedData.areaTopBound === 0 &&
        sharedData.areaRightBound === 0 &&
        sharedData.areaBottomBound === 0
      ) {
        this._areaLeftBound = 0;
        this._areaTopBound = 0;
        this._areaRightBound = game.getGameResolutionWidth();
        this._areaBottomBound = game.getGameResolutionHeight();
      } else {
        this._areaLeftBound = sharedData.areaLeftBound;
        this._areaTopBound = sharedData.areaTopBound;
        this._areaRightBound = sharedData.areaRightBound;
        this._areaBottomBound = sharedData.areaBottomBound;
      }
    }

    /**
     * Get the obstacles manager of a scene.
     */
    static getManager(runtimeScene: any): NavMeshPathfindingObstaclesManager {
      if (!runtimeScene.navMeshPathfindingObstaclesManager) {
        const initialData = runtimeScene.getInitialSharedDataForBehavior(
          'NavMeshPathfindingObstacleBehavior'
        );
        //Create the shared manager if necessary.
        runtimeScene.navMeshPathfindingObstaclesManager = new gdjs.NavMeshPathfindingObstaclesManager(
          runtimeScene,
          initialData
        );
      }
      return runtimeScene.navMeshPathfindingObstaclesManager;
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstacles.add(pathfindingObstacleBehavior.owner);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstacles.delete(pathfindingObstacleBehavior.owner);
    }

    public static invalidateNavMesh(runtimeScene: any) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      manager.invalidateNavMesh();
    }

    public invalidateNavMesh() {
      this._navMeshes.clear();
    }

    getNavMesh(obstacleCellPadding: integer): NavMesh {
      let navMesh = this._navMeshes.get(obstacleCellPadding);
      if (!navMesh) {
        const grid = new gdjs.RasterizationGrid(
          this._areaLeftBound,
          this._areaTopBound,
          this._areaRightBound,
          this._areaBottomBound,
          this._cellSize,
          // make cells square in the world
          this._cellSize / this._isometricRatio
        );
        gdjs.ObstacleRasterizer.rasterizeObstacles(grid, this._obstacles);
        gdjs.RegionGenerator.generateDistanceField(grid);
        gdjs.RegionGenerator.generateRegions(grid, obstacleCellPadding);
        //TODO make threshold configurable ?
        // 1 seems to be a good value.
        const threshold = 1;
        const contours = gdjs.ContourBuilder.buildContours(grid, threshold);
        const meshField = gdjs.ConvexPolygonGenerator.splitToConvexPolygons(
          contours,
          16
        );
        // scaleY = isometricRatio to keep the same unit length on the 2 axis for the pathfinding
        const scaledMeshField = gdjs.GridCoordinateConverter.convertFromGridBasis(
          grid,
          meshField,
          this._isometricRatio
        );
        navMesh = new gdjs.NavMesh(scaledMeshField);
        this._navMeshes.set(obstacleCellPadding, navMesh);
      }
      return navMesh;
    }
  }

  /**
   * NavMeshPathfindingObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Pathfinding Behavior.
   */
  export class NavMeshPathfindingObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: NavMeshPathfindingObstaclesManager;
    _registeredInManager: boolean = false;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData: any,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
      this._manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    updateFromBehaviorData(
      oldBehaviorData: any,
      newBehaviorData: any
    ): boolean {
      return true;
    }

    onDestroy() {
      if (this._manager && this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
    }

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
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
          this._manager.removeObstacle(this);
          this._manager.addObstacle(this);
        }
        this._oldX = this.owner.getX();
        this._oldY = this.owner.getY();
        this._oldWidth = this.owner.getWidth();
        this._oldHeight = this.owner.getHeight();
      }
    }

    doStepPostEvents(runtimeScene: gdjs.RuntimeScene) {}

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
  }
  gdjs.registerBehavior(
    'NavMeshPathfinding::NavMeshPathfindingObstacleBehavior',
    gdjs.NavMeshPathfindingObstacleRuntimeBehavior
  );
}
