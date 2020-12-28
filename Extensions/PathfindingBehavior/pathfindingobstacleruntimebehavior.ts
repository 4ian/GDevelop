/**
GDevelop - Pathfinding Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */

namespace gdjs {
  /**
   * PathfindingObstaclesManager manages the common objects shared by objects having a
   * pathfinding behavior: In particular, the obstacles behaviors are required to declare
   * themselves (see `PathfindingObstaclesManager.addObstacle`) to the manager of their associated scene
   * (see `gdjs.PathfindingRuntimeBehavior.obstaclesManagers`).
   */
  export class PathfindingObstaclesManager {
    _obstaclesHSHG: any;
    x: any;
    y: any;
    radius: any;

    constructor(runtimeScene) {
      // @ts-ignore
      this._obstaclesHSHG = new gdjs.HSHG.HSHG();
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
    addObstacle(pathfindingObstacleBehavior) {
      this._obstaclesHSHG.addObject(pathfindingObstacleBehavior);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(pathfindingObstacleBehavior) {
      this._obstaclesHSHG.removeObject(pathfindingObstacleBehavior);
    }

    /**
     * Returns all the obstacles around the specified position.
     * @param x X position
     * @param y Y position
     * @param radius The radius of the search
     * @param result If defined, the obstacles near the object will be inserted into result (Using the identifier of their owner object as key).
     * @return If result is not defined, an array with all obstacles near the position. Otherwise, nothing is returned.
     */
    getAllObstaclesAround(x, y, radius, result): any {
      const vertex = new PathfindingObstaclesManager.Vertex(x, y, radius);
      this._obstaclesHSHG.addObject(vertex);
      this._obstaclesHSHG.queryForCollisionWith(vertex, result);
      this._obstaclesHSHG.removeObject(vertex);
    }
  }

  export namespace PathfindingObstaclesManager {
    /**
     * Tool class which represents a simple point with a radius and a getAABB method.
     */
    export class Vertex {
      x: float;
      y: float;
      radius: float;
      aabb: AABB | null;

      constructor(x: float, y: float, radius: float) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.aabb = null;
      }

      /**
       * Return an axis aligned bouding box for the vertex.
       */
      getAABB(): AABB {
        const rad = this.radius,
          x = this.x,
          y = this.y;
        return (this.aabb = {
          min: [x - rad, y - rad],
          max: [x + rad, y + rad],
        });
      }
    }
  }

  /**
   * PathfindingObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having Pathfinding Behavior.
   *
   * @class PathfindingObstacleRuntimeBehavior
   * @memberof gdjs
   */
  export class PathfindingObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _impassable: boolean;
    _cost: float;
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: any;
    _registeredInManager: boolean = false;

    constructor(runtimeScene, behaviorData, owner) {
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

    doStepPreEvents(runtimeScene) {
      //No need for update as we take care of this below.
      /*if ( this._hshgNeedUpdate ) {
          this._manager._obstaclesHSHG.update();
          this._manager._hshgNeedUpdate = false;
      }*/

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

    doStepPostEvents(runtimeScene) {}

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

    setCost(cost): void {
      this._cost = cost;
    }

    isImpassable(): boolean {
      return this._impassable;
    }

    setImpassable(impassable): void {
      this._impassable = impassable;
    }
  }
  gdjs.registerBehavior(
    'PathfindingBehavior::PathfindingObstacleBehavior',
    gdjs.PathfindingObstacleRuntimeBehavior
  );
}
