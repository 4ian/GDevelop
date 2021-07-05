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
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstaclesRBush.insert(pathfindingObstacleBehavior);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(
      pathfindingObstacleBehavior: NavMeshPathfindingObstacleRuntimeBehavior
    ) {
      this._obstaclesRBush.remove(pathfindingObstacleBehavior);
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
      this._manager = NavMeshPathfindingObstaclesManager.getManager(runtimeScene);

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
