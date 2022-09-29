namespace gdjs {
  declare var rbush: any;

  export class LightObstaclesManager {
    _obstacleRBush: any;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._obstacleRBush = new rbush();
    }

    /**
     * Get the light obstacles manager of an instance container.
     */
    static getManager(
      instanceContainer: gdjs.RuntimeInstanceContainer
    ): gdjs.LightObstaclesManager {
      // @ts-ignore
      if (!instanceContainer._lightObstaclesManager) {
        // Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer._lightObstaclesManager = new gdjs.LightObstaclesManager(
          instanceContainer
        );
      }
      // @ts-ignore
      return instanceContainer._lightObstaclesManager;
    }

    /**
     * Add a light obstacle to the list of existing obstacles.
     */
    addObstacle(obstacle: gdjs.LightObstacleRuntimeBehavior) {
      if (obstacle.currentRBushAABB)
        obstacle.currentRBushAABB.updateAABBFromOwner();
      else obstacle.currentRBushAABB = new gdjs.BehaviorRBushAABB(obstacle);
      this._obstacleRBush.insert(obstacle.currentRBushAABB);
    }

    /**
     * Remove a light obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(obstacle: gdjs.LightObstacleRuntimeBehavior) {
      this._obstacleRBush.remove(obstacle.currentRBushAABB);
    }

    /**
     * Returns all the light obstacles around the specified object.
     * @param object The object
     * @param radius Radius of the area to be searched.
     * @param result An array with all obstacles near the object.
     */
    getAllObstaclesAround(
      object: gdjs.RuntimeObject,
      radius: number,
      result: gdjs.LightObstacleRuntimeBehavior[]
    ): void {
      // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
      // is not necessarily in the middle of the object (for sprites for example).
      const x = object.getX();
      const y = object.getY();
      const searchArea = gdjs.staticObject(
        LightObstaclesManager.prototype.getAllObstaclesAround
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
        gdjs.LightObstacleRuntimeBehavior
      >[] = this._obstacleRBush.search(searchArea);
      result.length = 0;
      nearbyObstacles.forEach((nearbyObstacle) =>
        result.push(nearbyObstacle.behavior)
      );
    }
  }

  export class LightObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    currentRBushAABB: gdjs.BehaviorRBushAABB<
      LightObstacleRuntimeBehavior
    > | null = null;
    _manager: any;
    _registeredInManager: boolean = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._manager = LightObstaclesManager.getManager(instanceContainer);
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // Make sure the obstacle is or is not in the obstacles manager.
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

    onDestroy() {
      if (this._manager && this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
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
  }
  gdjs.registerBehavior(
    'Lighting::LightObstacleBehavior',
    gdjs.LightObstacleRuntimeBehavior
  );
}
