/**
GDevelop - Top-Down Movement Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  declare var rbush: any;

  /**
   * Manages the common objects shared by objects having a
   * top-down obstacle behavior: in particular, the top-down obstacle behaviors are required to declare
   * themselves (see gdjs.TopDownObstaclesManager.addObstacle) to the manager of their associated scene
   * (see gdjs.TopDownObstaclesManager.getManager).
   */
  export class TopDownObstaclesManager {
    _obstacleRBush: any;
    _runtimeScene: gdjs.RuntimeScene;

    /**
     * @param object The object
     */
    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._obstacleRBush = new rbush(9, [
        '.getHitBoxesAABB().min[0]',
        '.getHitBoxesAABB().min[1]',
        '.getHitBoxesAABB().max[0]',
        '.getHitBoxesAABB().max[1]',
      ]);
      this._runtimeScene = runtimeScene;
    }

    /**
     * Get the obstacles manager of a scene.
     */
    static getManager(
      runtimeScene: gdjs.RuntimeScene
    ): gdjs.TopDownObstaclesManager {
      // @ts-ignore
      if (!runtimeScene.topDownObstaclesManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.topDownObstaclesManager = new gdjs.TopDownObstaclesManager(
          runtimeScene
        );
      }
      // @ts-ignore
      return runtimeScene.topDownObstaclesManager;
    }

    /**
     * Add a obstacle to the list of existing obstacles.
     */
    addObstacle(obstacleBehavior: gdjs.TopDownObstacleRuntimeBehavior) {
      this._obstacleRBush.insert(obstacleBehavior);
    }

    /**
     * Remove a obstacle from the list of existing obstacles. Be sure that the obstacle was
     * added before.
     */
    removeObstacle(obstacleBehavior: gdjs.TopDownObstacleRuntimeBehavior) {
      this._obstacleRBush.remove(obstacleBehavior);
    }

    /**
     * Returns all the obstacles around the specified object.
     * @param object
     * @param maxMovementLength The maximum distance, in pixels, the object is going to do.
     * @return An array with all obstacles near the object.
     */
    getAllObstaclesAround(
      object: gdjs.AABB,
      maxMovementLength: number,
      result: gdjs.TopDownObstacleRuntimeBehavior[]
    ): any {
      const searchArea = gdjs.staticObject(
        gdjs.TopDownObstaclesManager.prototype.getAllObstaclesAround
      );

      // @ts-ignore
      searchArea.minX = object.min[0] - maxMovementLength;
      // @ts-ignore
      searchArea.minY = object.min[1] - maxMovementLength;
      // @ts-ignore
      searchArea.maxX = object.max[0] + maxMovementLength;
      // @ts-ignore
      searchArea.maxY = object.max[1] + maxMovementLength;
      const nearbyObstacles = this._obstacleRBush.search(searchArea);
      result.length = 0;
      result.push.apply(result, nearbyObstacles);
    }

    /**
     * Returns true if there is any obstacle intersecting the area.
     * @param minX
     * @param maxX
     * @param minY
     * @param maxY
     * @param excluded
     */
    anyObstacle(
      minX: number,
      maxX: number,
      minY: number,
      maxY: number,
      excluded: gdjs.RuntimeObject[]
    ): boolean {
      const searchArea = gdjs.staticObject(
        gdjs.TopDownObstaclesManager.prototype.anyObstacle
      );
      // @ts-ignore
      searchArea.minX = minX;
      // @ts-ignore
      searchArea.minY = minY;
      // @ts-ignore
      searchArea.maxX = maxX;
      // @ts-ignore
      searchArea.maxY = maxY;
      var nearbyObstacles = this._obstacleRBush.search(searchArea);

      // Sometimes RBush.search returns several times the player.
      // Could it be a bug?

      // FIXME This is just to ease tests, to be remove
      var debug = '' + excluded.length + '\n';
      for (var i = 0; i < excluded.length; i++) {
        debug += excluded[i].id + '\n';
      }
      for (var i = 0; i < nearbyObstacles.length; i++) {
        const obstacleAABB: gdjs.AABB = nearbyObstacles[i].getHitBoxesAABB();
        const obstacleMinX: number = obstacleAABB.min[0];
        const obstacleMinY: number = obstacleAABB.min[1];
        const obstacleMaxX: number = obstacleAABB.max[0];
        const obstacleMaxY: number = obstacleAABB.max[1];
        debug +=
          nearbyObstacles[i].owner.id +
          ' : ' +
          obstacleMinX +
          ' ' +
          obstacleMinY +
          ' -> ' +
          obstacleMaxX +
          ' ' +
          obstacleMaxY +
          '\n';

        if (excluded.indexOf(nearbyObstacles[i].owner) < 0) {
          // FIXME This is just to ease tests, to be remove
          if (nearbyObstacles[i].owner instanceof gdjs.SpriteRuntimeObject) {
            var alpha = 64 + 128 * Math.random();
            nearbyObstacles[i].owner.setOpacity(alpha);
            this._runtimeScene.getVariables().get('Debug').setString(debug);
          }

          return true;
        }
      }
      //this._runtimeScene.getVariables().get("Debug").setString(debug);

      return false;
    }
  }

  /**
   * TopDownObstacleRuntimeBehavior represents a behavior allowing objects to be
   * considered as a obstacle by objects having TopDownMovement Behavior.
   */
  export class TopDownObstacleRuntimeBehavior extends gdjs.RuntimeBehavior {
    _slidingCornerSize: float;
    _customIsometryAngle: float;

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: gdjs.TopDownObstaclesManager;
    _registeredInManager: boolean = false;

    _hitBoxesAABB: gdjs.AABB = { min: [0, 0], max: [0, 0] };
    _hitBoxesAABBUpToDate: boolean = false;

    // @ts-ignore
    _basisTransformation: BasisTransformation;
    _point: FloatPoint = [0, 0];

    constructor(
      runtimeScene: gdjs.RuntimeScene,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(runtimeScene, behaviorData, owner);

      this._slidingCornerSize = behaviorData.slidingCornerSize || 0;
      this._customIsometryAngle = behaviorData.customIsometryAngle;
      this._manager = gdjs.TopDownObstaclesManager.getManager(runtimeScene);

      this.setViewpoint(
        behaviorData.viewpoint,
        behaviorData.customIsometryAngle
      );
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (
        oldBehaviorData._slidingCornerSize !==
        newBehaviorData._slidingCornerSize
      ) {
        this._slidingCornerSize = newBehaviorData._slidingCornerSize;
      }
      if (
        oldBehaviorData.platformType !== newBehaviorData.platformType ||
        oldBehaviorData.customIsometryAngle !==
          newBehaviorData.customIsometryAngle
      ) {
        this.setViewpoint(
          newBehaviorData.platformType,
          newBehaviorData.customIsometryAngle
        );
      }
      return true;
    }

    setViewpoint(viewpoint: string, customIsometryAngle: number): void {
      this._customIsometryAngle = customIsometryAngle;
      if (viewpoint === 'PixelIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.atan(0.5));
      } else if (viewpoint === 'TrueIsometry') {
        this._basisTransformation = new IsometryTransformation(Math.PI / 6);
      } else if (viewpoint === 'CustomIsometry') {
        this._basisTransformation = new IsometryTransformation(
          this._customIsometryAngle
        );
      } else {
        this._basisTransformation = new IdentityTransformation();
      }
    }

    onDestroy() {
      if (this._manager && this._registeredInManager) {
        this._manager.removeObstacle(this);
      }
    }

    doStepPreEvents(runtimeScene: gdjs.RuntimeScene) {
      //Scene change is not supported
      /*if ( parentScene != &scene ) //Parent scene has changed
            {
                if ( sceneManager ) //Remove the object from any old scene manager.
                    sceneManager->RemoveObstacle(this);
                parentScene = &scene;
                sceneManager = parentScene ? &SceneObstacleObjectsManager::managers[&scene] : NULL;
                registeredInManager = false;
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
        this._hitBoxesAABBUpToDate = false;
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

    getHitBoxesAABB(): gdjs.AABB {
      if (!this._hitBoxesAABBUpToDate) {
        const hitBoxes: gdjs.Polygon[] = this.owner.getHitBoxes();

        let minX: number = Number.MAX_VALUE;
        let minY: number = Number.MAX_VALUE;
        let maxX: number = -Number.MAX_VALUE;
        let maxY: number = -Number.MAX_VALUE;
        for (let h = 0, lenh = hitBoxes.length; h < lenh; ++h) {
          let hitBox: gdjs.Polygon = hitBoxes[h];
          for (let p = 0, lenp = hitBox.vertices.length; p < lenp; ++p) {
            const point = this._point;
            this._basisTransformation.toWorld(hitBox.vertices[p], point);

            minX = Math.min(minX, point[0]);
            maxX = Math.max(maxX, point[0]);
            minY = Math.min(minY, point[1]);
            maxY = Math.max(maxY, point[1]);
          }
        }
        this._hitBoxesAABB.min[0] = minX;
        this._hitBoxesAABB.min[1] = minY;
        this._hitBoxesAABB.max[0] = maxX;
        this._hitBoxesAABB.max[1] = maxY;

        this._hitBoxesAABBUpToDate = true;
      }
      return this._hitBoxesAABB;
    }

    getSlidingCornerSize() {
      return this._slidingCornerSize;
    }
  }

  interface BasisTransformation {
    toScreen(worldPoint: FloatPoint, screenPoint: FloatPoint): void;

    toWorld(screenPoint: FloatPoint, worldPoint: FloatPoint): void;

    toScreen(worldPoint: FloatPoint): void;

    toWorld(screenPoint: FloatPoint): void;
  }

  class IdentityTransformation implements BasisTransformation {
    toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
      if (screenPoint) {
        screenPoint[0] = worldPoint[0];
        screenPoint[1] = worldPoint[1];
      }
    }

    toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
      if (worldPoint) {
        worldPoint[0] = screenPoint[0];
        worldPoint[1] = screenPoint[1];
      }
    }
  }

  class IsometryTransformation implements BasisTransformation {
    _screen: float[][];
    _world: float[][];

    /**
     * @param angle between the x axis and the projected isometric x axis.
     * @throws if the angle is not in ]0; pi/4[. Note that 0 is a front viewpoint and pi/4 a top-down viewpoint.
     */
    constructor(angle: float) {
      if (angle <= 0 || angle >= Math.PI / 4)
        throw new RangeError(
          'An isometry angle must be in ]0; pi/4] but was: ' + angle
        );

      const alpha = Math.asin(Math.tan(angle));
      const sinA = Math.sin(alpha);
      const cosB = Math.cos(Math.PI / 4);
      const sinB = cosB;
      // https://en.wikipedia.org/wiki/Isometric_projection
      //
      //   / 1     0    0 \ / cosB 0 -sinB \ / 1 0  0 \
      //   | 0  cosA sinA | |    0 1     0 | | 0 0 -1 |
      //   \ 0 -sinA cosA / \ sinB 0  cosB / \ 0 1  0 /
      this._screen = [
        [cosB, -sinB],
        [sinA * sinB, sinA * cosB],
      ];
      // invert
      this._world = [
        [cosB, sinB / sinA],
        [-sinB, cosB / sinA],
      ];
    }

    toScreen(worldPoint: FloatPoint, screenPoint?: FloatPoint): void {
      if (!screenPoint) {
        screenPoint = worldPoint;
      }
      const x =
        this._screen[0][0] * worldPoint[0] + this._screen[0][1] * worldPoint[1];
      const y =
        this._screen[1][0] * worldPoint[0] + this._screen[1][1] * worldPoint[1];
      screenPoint[0] = x;
      screenPoint[1] = y;
    }

    toWorld(screenPoint: FloatPoint, worldPoint?: FloatPoint): void {
      if (!worldPoint) {
        worldPoint = screenPoint;
      }
      const x =
        this._world[0][0] * screenPoint[0] + this._world[0][1] * screenPoint[1];
      const y =
        this._world[1][0] * screenPoint[0] + this._world[1][1] * screenPoint[1];
      worldPoint[0] = x;
      worldPoint[1] = y;
    }
  }

  gdjs.registerBehavior(
    'TopDownMovementBehavior::TopDownObstacleBehavior',
    gdjs.TopDownObstacleRuntimeBehavior
  );
}
