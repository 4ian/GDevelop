/*
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  declare var rbush: any;

  /**
   * PathfindingObstaclesManager manages the common objects shared by objects having a
   * pathfinding behavior: In particular, the obstacles behaviors are required to declare
   * themselves (see `PathfindingObstaclesManager.addObstacle`) to the manager of their associated scene
   * (see `gdjs.NavMeshPathfindingRuntimeBehavior.obstaclesManagers`).
   */
  export class NavMeshPathfindingObstaclesManager {
    _obstaclesRBush: any;
    _obstacles: Set<NavMeshPathfindingObstacleRuntimeBehavior>;
    _cellSize: integer;
    _areaLeftBound: integer;
    _areaTopBound: integer;
    _areaRightBound: integer;
    _areaBottomBound: integer;

    // for the path finding algorithm
    _navMeshes: Map<integer, gdjs.NavMesh> = new Map();
    /** Used to draw traces for debugging */
    meshPolygons: Point[][] = [];

    /**
     * @param object The object
     */
    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._obstaclesRBush = new rbush(9, [
        '.owner.getAABB().min[0]',
        '.owner.getAABB().min[1]',
        '.owner.getAABB().max[0]',
        '.owner.getAABB().max[1]',
      ]);
      this._obstacles = new Set();
      const game = runtimeScene.getGame();
      this._cellSize = Number.parseInt(
        game.getExtensionProperty('NavMeshPathfinding', 'CellSize') || '10'
      );
      this._areaLeftBound = Number.parseInt(
        game.getExtensionProperty('NavMeshPathfinding', 'AreaLeftBound') || '0'
      );
      this._areaTopBound = Number.parseInt(
        game.getExtensionProperty('NavMeshPathfinding', 'AreaTopBound') || '0'
      );
      this._areaRightBound = Number.parseInt(
        game.getExtensionProperty('NavMeshPathfinding', 'AreaRightBound') ||
          game.getGameResolutionWidth().toString()
      );
      this._areaBottomBound = Number.parseInt(
        game.getExtensionProperty('NavMeshPathfinding', 'AreaBottomBound') ||
          game.getGameResolutionHeight().toString()
      );
    }

    /**
     * Get the obstacles manager of a scene.
     */
    static getManager(runtimeScene): NavMeshPathfindingObstaclesManager {
      if (!runtimeScene.pathfindingObstaclesManager) {
        //Create the shared manager if necessary.
        runtimeScene.pathfindingObstaclesManager =
          new gdjs.NavMeshPathfindingObstaclesManager(runtimeScene);
      }
      return runtimeScene.pathfindingObstaclesManager;
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstaclesRBush.insert(pathfindingObstacleBehavior);
      this._obstacles.add(pathfindingObstacleBehavior);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstaclesRBush.remove(pathfindingObstacleBehavior);
      this._obstacles.delete(pathfindingObstacleBehavior);
    }

    public static invalidateNavMesh(runtimeScene) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(runtimeScene);
      console.log("invalidateNavMesh: " + manager);
      manager._navMeshes.clear();
    }

    getNavMesh(
      runtimeScene: gdjs.RuntimeScene,
      obstaclePadding: integer
    ): NavMesh {
      // Round the padding on cellSize to avoid almost identical NavMesh
      const obstacleCellPadding = Math.ceil(obstaclePadding / this._cellSize);

      let navMesh = this._navMeshes.get(obstacleCellPadding);
      if (!navMesh) {
        const grid = new gdjs.RasterizationGrid(
          this._areaLeftBound,
          this._areaTopBound,
          this._areaRightBound,
          this._areaBottomBound,
          this._cellSize
        );
        console.log('grid: ' + grid.dimX() + ' ' + grid.dimY());
        const objects = Array.from(this._obstacles).map(
          (obstacle) => obstacle.owner
        );
        gdjs.NavMeshGenerator.rasterizeObstacles(grid, objects);
        console.log(
          '\n' +
            grid.cells
              .map((cellRow) =>
                cellRow.map((cell) => (cell.isObstacle ? '#' : '.')).join('')
              )
              .join('\n') +
            '\n'
        );
        gdjs.NavMeshGenerator.generateDistanceField(grid);
        gdjs.NavMeshGenerator.generateRegions(grid, obstacleCellPadding);
        const contours = gdjs.NavMeshGenerator.buildContours(grid);
        //this.meshPolygons = contours.map(polygon => polygon.map(point => ({x: cellSize * point.x + grid.originX, y: cellSize * point.y + grid.originY})));
        const polyMeshField = gdjs.NavMeshGenerator.buildMesh(contours, 16);
        const polygons = polyMeshField.map((polygon) =>
          polygon.map((point) => ({
            x: this._cellSize * point.x + grid.originX,
            y: this._cellSize * point.y + grid.originY,
          }))
        );
        this.meshPolygons = polygons;
        console.log('polygons.length: ' + polygons.length);
        console.log(
          polygons
            .map((polygon) =>
              polygon
                .map((point) => '(' + point.x + ' ' + point.y + ')')
                .join(', ')
            )
            .join('\n')
        );
        navMesh = new gdjs.NavMesh(polygons);
        this._navMeshes.set(obstacleCellPadding, navMesh);
      }
      return navMesh;
    }

    /**
     * Returns all the platforms around the specified object.
     * @param maxMovementLength The maximum distance, in pixels, the object is going to do.
     * @return An array with all platforms near the object.
     */
    getAllObstaclesAround(
      x: float,
      y: float,
      radius: float,
      result: gdjs.NavMeshPathfindingObstacleRuntimeBehavior[]
    ): any {
      const searchArea = gdjs.staticObject(
        PathfindingObstaclesManager.prototype.getAllObstaclesAround
      );
      // @ts-ignore
      searchArea.minX = x - radius;
      // @ts-ignore
      searchArea.minY = y - radius;
      // @ts-ignore
      searchArea.maxX = x + radius;
      // @ts-ignore
      searchArea.maxY = y + radius;
      const nearbyPlatforms = this._obstaclesRBush.search(searchArea);
      result.length = 0;
      result.push.apply(result, nearbyPlatforms);
    }
  }

  /**
   * NavMeshPathfindingObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Pathfinding Behavior.
   */
  export class NavMeshPathfindingObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _impassable: boolean = true;
    _cost: float = 1;
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: NavMeshPathfindingObstaclesManager;
    _registeredInManager: boolean = false;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
      this._manager =
        NavMeshPathfindingObstaclesManager.getManager(runtimeScene);

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
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

    getAABB() {
      return this.owner.getAABB();
    }

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
    'NavMeshPathfinding::NavMeshPathfindingObstacleBehavior',
    gdjs.NavMeshPathfindingObstacleRuntimeBehavior
  );
}
