/*
GDevelop - NavMesh Pathfinding Behavior Extension
Copyright (c) 2013-2021 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  /**
   * PathfindingObstaclesManager manages the common objects shared by objects having a
   * pathfinding behavior: In particular, the obstacles behaviors are required to declare
   * themselves (see `PathfindingObstaclesManager.addObstacle`) to the manager of their associated scene
   * (see `gdjs.NavMeshPathfindingRuntimeBehavior.obstaclesManagers`).
   */
  export class NavMeshPathfindingObstaclesManager {
    _obstacles: Set<gdjs.RuntimeObject>;

    _polygonIterableAdapter: PolygonIterableAdapter;
    _navMeshGenerator: gdjs.NavMeshPathfinding.NavMeshGenerator | null = null;

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
    _navMeshes: Map<integer, gdjs.NavMeshPathfinding.NavMesh> = new Map();
    /**
     * Used while NavMeshes update is disabled to remember to do the update
     * when it's enable back.
     */
    _navMeshesAreUpToDate = true;
    /**
     * This allows to continue finding paths with the old NavMeshes while
     * moving obstacles.
     */
    _navMeshesUpdateIsEnabled = true;

    constructor(runtimeScene: gdjs.RuntimeScene, sharedData) {
      this._obstacles = new Set();
      this._polygonIterableAdapter = new PolygonIterableAdapter();
      const game = runtimeScene.getGame();

      const viewpoint = sharedData.viewpoint;
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
      this.invalidateNavMesh();
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstacles.delete(pathfindingObstacleBehavior.owner);
      this.invalidateNavMesh();
    }

    private invalidateNavMesh() {
      if (this._navMeshesUpdateIsEnabled) {
        this._navMeshes.clear();
        this._navMeshesAreUpToDate = true;
      } else {
        this._navMeshesAreUpToDate = false;
      }
    }

    public setNavMeshesUpdateEnabled(navMeshesUpdateIsEnabled: boolean) {
      this._navMeshesUpdateIsEnabled = navMeshesUpdateIsEnabled;
      if (navMeshesUpdateIsEnabled && !this._navMeshesAreUpToDate) {
        this._navMeshes.clear();
        this._navMeshesAreUpToDate = true;
      }
    }

    public static setNavMeshesUpdateEnabled(
      runtimeScene: any,
      navMeshesUpdateIsEnabled: boolean
    ) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      manager.setNavMeshesUpdateEnabled(navMeshesUpdateIsEnabled);
    }

    public navMeshesUpdateIsEnabled() {
      return this._navMeshesUpdateIsEnabled;
    }

    public static navMeshesUpdateIsEnabled(runtimeScene: any) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.navMeshesUpdateIsEnabled();
    }

    public static setAreaBounds(
      runtimeScene: any,
      left: float,
      top: float,
      right: float,
      bottom: float
    ) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      manager.setAreaBounds(left, top, right, bottom);
    }

    public setAreaBounds(left: float, top: float, right: float, bottom: float) {
      this._areaLeftBound = left;
      this._areaTopBound = top;
      this._areaRightBound = right;
      this._areaBottomBound = bottom;
      this.invalidateNavMesh();
      this._navMeshGenerator = null;
    }

    public static setCellSize(runtimeScene: any, cellSize: float) {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      manager.setCellSize(cellSize);
    }

    public setCellSize(cellSize: float) {
      this._cellSize = cellSize;
      this.invalidateNavMesh();
      this._navMeshGenerator = null;
    }

    public static getAreaLeftBound(runtimeScene: any): float {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.getAreaLeftBound();
    }

    public static getAreaToptBound(runtimeScene: any): float {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.getAreaTopBound();
    }

    public static getAreaRightBound(runtimeScene: any): float {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.getAreaRightBound();
    }

    public static getAreaBottomBound(runtimeScene: any): float {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.getAreaBottomBound();
    }

    public static getCellSize(runtimeScene: any): float {
      const manager = NavMeshPathfindingObstaclesManager.getManager(
        runtimeScene
      );
      return manager.getCellSize();
    }

    public getAreaLeftBound(): float {
      return this._areaLeftBound;
    }

    public getAreaTopBound(): float {
      return this._areaTopBound;
    }

    public getAreaRightBound(): float {
      return this._areaRightBound;
    }

    public getAreaBottomBound(): float {
      return this._areaBottomBound;
    }

    public getCellSize(): float {
      return this._cellSize;
    }

    getNavMesh(obstacleCellPadding: integer): gdjs.NavMeshPathfinding.NavMesh {
      let navMesh = this._navMeshes.get(obstacleCellPadding);
      if (!navMesh) {
        if (!this._navMeshGenerator) {
          this._navMeshGenerator = new gdjs.NavMeshPathfinding.NavMeshGenerator(
            this._areaLeftBound,
            this._areaTopBound,
            this._areaRightBound,
            this._areaBottomBound,
            this._cellSize,
            // make cells square in the world
            this._isometricRatio
          );
        }
        const navMeshPolygons = this._navMeshGenerator.buildNavMesh(
          this._getVerticesIterable(this._obstacles),
          obstacleCellPadding
        );
        navMesh = new gdjs.NavMeshPathfinding.NavMesh(navMeshPolygons);
        this._navMeshes.set(obstacleCellPadding, navMesh);
      }
      return navMesh;
    }

    _getVerticesIterable(
      objects: Set<gdjs.RuntimeObject>
    ): Iterable<Iterable<gdjs.NavMeshPathfinding.Point>> {
      this._polygonIterableAdapter.set(objects);
      return this._polygonIterableAdapter;
    }
  }

  /**
   * Iterable that adapts `RuntimeObject` to `Iterable<{x: float y: float}>`.
   *
   * This is an allocation free iterable
   * that can only do one iteration at a time.
   */
  class PolygonIterableAdapter
    implements Iterable<Iterable<gdjs.NavMeshPathfinding.Point>> {
    objects: Iterable<gdjs.RuntimeObject>;
    objectsItr: Iterator<gdjs.RuntimeObject>;
    polygonsItr: IterableIterator<gdjs.Polygon>;
    result: IteratorResult<Iterable<gdjs.NavMeshPathfinding.Point>, any>;
    pointIterableAdapter: PointIterableAdapter;

    constructor() {
      this.objects = [];
      this.objectsItr = this.objects[Symbol.iterator]();
      this.polygonsItr = [][Symbol.iterator]();
      this.pointIterableAdapter = new PointIterableAdapter();
      this.result = {
        value: this.pointIterableAdapter,
        done: false,
      };
    }

    set(objects: Set<gdjs.RuntimeObject>) {
      this.objects = objects;
    }

    [Symbol.iterator]() {
      this.objectsItr = this.objects[Symbol.iterator]();
      this.polygonsItr = [][Symbol.iterator]();
      return this;
    }

    next() {
      let polygonNext = this.polygonsItr.next();
      while (polygonNext.done) {
        const objectNext = this.objectsItr.next();
        if (objectNext.done) {
          // IteratorReturnResult<gdjs.RuntimeObject> require a defined value
          // even though the spec state otherwise.
          // So, this class can't be typed as an iterable.
          this.result.value = undefined;
          this.result.done = true;
          return this.result;
        }
        this.polygonsItr = objectNext.value.getHitBoxes().values();
        polygonNext = this.polygonsItr.next();
      }
      this.pointIterableAdapter.set(polygonNext.value.vertices);
      this.result.value = this.pointIterableAdapter;
      this.result.done = false;
      return this.result;
    }
  }

  /**
   * Iterable that adapts coordinates from `[int, int]` to `{x: int, y: int}`.
   *
   * This is an allocation free iterable
   * that can only do one iteration at a time.
   */
  class PointIterableAdapter
    implements Iterable<gdjs.NavMeshPathfinding.Point> {
    vertices: Iterable<FloatPoint>;
    verticesItr: Iterator<FloatPoint>;
    result: IteratorResult<gdjs.NavMeshPathfinding.Point, any>;

    constructor() {
      this.vertices = [];
      this.verticesItr = this.vertices[Symbol.iterator]();
      this.result = {
        value: { x: 0, y: 0 },
        done: false,
      };
    }

    set(vertices: Iterable<FloatPoint>) {
      this.vertices = vertices;
    }

    [Symbol.iterator]() {
      this.verticesItr = this.vertices[Symbol.iterator]();
      return this;
    }

    next() {
      const next = this.verticesItr.next();
      if (next.done) {
        return next;
      }
      this.result.value.x = next.value[0];
      this.result.value.y = next.value[1];
      return this.result;
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
