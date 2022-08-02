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
   * (see `gdjs.PathfindingRuntimeBehavior.obstaclesManagers`).
   */
  export class PathfindingObstaclesManager {
    _obstaclesRBush: any;

    /**
     * @param object The object
     */
    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._obstaclesRBush = new rbush();
    }

    /**
     * Get the obstacles manager of a scene.
     */
    static getManager(runtimeScene) {
      if (!runtimeScene.pathfindingObstaclesManager) {
        //Create the shared manager if necessary.
        runtimeScene.pathfindingObstaclesManager = new gdjs.PathfindingObstaclesManager(
          runtimeScene
        );
      }
      return runtimeScene.pathfindingObstaclesManager;
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(
      pathfindingObstacleBehavior: PathfindingObstacleRuntimeBehavior
    ) {
      if (pathfindingObstacleBehavior.currentRBushAABB)
        pathfindingObstacleBehavior.currentRBushAABB.updateAABBFromOwner();
      else
        pathfindingObstacleBehavior.currentRBushAABB = new gdjs.BehaviorRBushAABB(
          pathfindingObstacleBehavior
        );

      this._obstaclesRBush.insert(pathfindingObstacleBehavior.currentRBushAABB);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: PathfindingObstacleRuntimeBehavior
    ) {
      this._obstaclesRBush.remove(pathfindingObstacleBehavior.currentRBushAABB);
    }

    /**
     * Returns all the obstacles around the specified position.
     * @param x X position
     * @param y Y position
     * @param radius The radius of the search
     * @param result If defined, the obstacles near the object will be inserted into result (Using the identifier of their owner object as key).
     * @return If result is not defined, an array with all obstacles near the position. Otherwise, nothing is returned.
     */
    getAllObstaclesAround(
      x: float,
      y: float,
      radius: float,
      result: gdjs.PathfindingObstacleRuntimeBehavior[]
    ): void {
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
      const nearbyObstacles: gdjs.BehaviorRBushAABB<
        gdjs.PathfindingObstacleRuntimeBehavior
      >[] = this._obstaclesRBush.search(searchArea);
      result.length = 0;
      nearbyObstacles.forEach((nearbyObstacle) =>
        result.push(nearbyObstacle.behavior)
      );
    }

    /**
     * Returns all the platforms around the specified AABB.
     * @return An array with all platforms near the AABB.
     */
    getAllObstaclesAroundAABB(
      aabb: AABB,
      result: gdjs.PathfindingObstacleRuntimeBehavior[]
    ): any {
      const searchArea = gdjs.staticObject(
        PathfindingObstaclesManager.prototype.getAllObstaclesAroundAABB
      );
      // @ts-ignore
      searchArea.minX = aabb.min[0];
      // @ts-ignore
      searchArea.minY = aabb.min[1];
      // @ts-ignore
      searchArea.maxX = aabb.max[0];
      // @ts-ignore
      searchArea.maxY = aabb.max[1];
      const nearbyObstacles = this._obstaclesRBush.search(searchArea);
      result.length = 0;
      result.push.apply(result, nearbyObstacles);
    }
  }

  /**
   * PathfindingObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Pathfinding Behavior.
   */
  export class PathfindingObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _impassable: boolean;
    _cost: float;
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: PathfindingObstaclesManager;
    _registeredInManager: boolean = false;
    currentRBushAABB: gdjs.BehaviorRBushAABB<
      PathfindingObstacleRuntimeBehavior
    > | null = null;

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);
      this._impassable = behaviorData.impassable;
      this._cost = behaviorData.cost;
      this._manager = PathfindingObstaclesManager.getManager(runtimeScene);

      //Note that we can't use getX(), getWidth()... of owner here:
      //The owner is not yet fully constructed.
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.impassable !== newBehaviorData.impassable) {
        this.setImpassable(newBehaviorData.impassable);
      }
      if (oldBehaviorData.cost !== newBehaviorData.cost) {
        this.setCost(newBehaviorData.cost);
      }
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
    'PathfindingBehavior::PathfindingObstacleBehavior',
    gdjs.PathfindingObstacleRuntimeBehavior
  );
}
