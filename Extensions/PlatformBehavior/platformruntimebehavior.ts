/**
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  declare var rbush: any;

  /**
   * Manages the common objects shared by objects having a
   * platform behavior: in particular, the platforms behaviors are required to declare
   * themselves (see PlatformObjectsManager.addPlatform) to the manager of their associated scene
   * (see PlatformRuntimeBehavior.getManager).
   *
   * @class PlatformObjectsManager
   * @memberof gdjs
   */
  export class PlatformObjectsManager {
    _platformRBush: any;

    /**
     * @param object The object
     */
    constructor(runtimeScene: gdjs.RuntimeScene) {
      this._platformRBush = new rbush(9, [
        '.owner.getAABB().min[0]',
        '.owner.getAABB().min[1]',
        '.owner.getAABB().max[0]',
        '.owner.getAABB().max[1]',
      ]);
    }

    /**
     * Get the platforms manager of a scene.
     */
    static getManager(runtimeScene: gdjs.RuntimeScene) {
      // @ts-ignore
      if (!runtimeScene.platformsObjectsManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        runtimeScene.platformsObjectsManager = new gdjs.PlatformObjectsManager(
          runtimeScene
        );
      }
      // @ts-ignore
      return runtimeScene.platformsObjectsManager;
    }

    /**
     * Add a platform to the list of existing platforms.
     */
    addPlatform(platformBehavior) {
      this._platformRBush.insert(platformBehavior);
    }

    /**
     * Remove a platform from the list of existing platforms. Be sure that the platform was
     * added before.
     */
    removePlatform(platformBehavior) {
      this._platformRBush.remove(platformBehavior);
    }

    /**
     * Returns all the platforms around the specified object.
     * @param maxMovementLength The maximum distance, in pixels, the object is going to do.
     * @return An array with all platforms near the object.
     */
    getAllPlatformsAround(object, maxMovementLength: number, result): any {
      // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
      // is not necessarily in the middle of the object (for sprites for example).
      const ow = object.getWidth();
      const oh = object.getHeight();
      const x = object.getDrawableX() + object.getCenterX();
      const y = object.getDrawableY() + object.getCenterY();
      const searchArea = gdjs.staticObject(
        PlatformObjectsManager.prototype.getAllPlatformsAround
      );
      // @ts-ignore
      searchArea.minX = x - ow / 2 - maxMovementLength;
      // @ts-ignore
      searchArea.minY = y - oh / 2 - maxMovementLength;
      // @ts-ignore
      searchArea.maxX = x + ow / 2 + maxMovementLength;
      // @ts-ignore
      searchArea.maxY = y + oh / 2 + maxMovementLength;
      const nearbyPlatforms = this._platformRBush.search(searchArea);
      result.length = 0;
      result.push.apply(result, nearbyPlatforms);
    }
  }

  /**
   * PlatformRuntimeBehavior represents a behavior allowing objects to be
   * considered as a platform by objects having PlatformerObject Behavior.
   *
   * @class PlatformRuntimeBehavior
   * @memberof gdjs
   */
  export class PlatformRuntimeBehavior extends gdjs.RuntimeBehavior {
    //Load the platform type
    _platformType: any;
    _canBeGrabbed: any;
    _yGrabOffset: any;

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    _oldX: number = 0;
    _oldY: number = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _manager: any;
    _registeredInManager: boolean = false;

    constructor(runtimeScene, behaviorData, owner) {
      super(runtimeScene, behaviorData, owner);
      this._platformType = behaviorData.platformType;
      if (this._platformType == 'Ladder') {
        this._platformType = PlatformRuntimeBehavior.LADDER;
      } else {
        if (this._platformType == 'Jumpthru') {
          this._platformType = PlatformRuntimeBehavior.JUMPTHRU;
        } else {
          this._platformType = PlatformRuntimeBehavior.NORMALPLAFTORM;
        }
      }
      this._canBeGrabbed = behaviorData.canBeGrabbed || false;
      this._yGrabOffset = behaviorData.yGrabOffset || 0;
      this._manager = PlatformObjectsManager.getManager(runtimeScene);
    }

    updateFromBehaviorData(oldBehaviorData, newBehaviorData): boolean {
      if (oldBehaviorData.platformType !== newBehaviorData.platformType) {
        this.changePlatformType(newBehaviorData.platformType);
      }
      if (oldBehaviorData.canBeGrabbed !== newBehaviorData.canBeGrabbed) {
        this._canBeGrabbed = newBehaviorData.canBeGrabbed;
      }
      if (oldBehaviorData.yGrabOffset !== newBehaviorData.yGrabOffset) {
        this._yGrabOffset = newBehaviorData.yGrabOffset;
      }
      return true;
    }

    onDestroy() {
      if (this._manager && this._registeredInManager) {
        this._manager.removePlatform(this);
      }
    }

    doStepPreEvents(runtimeScene) {
      //Scene change is not supported
      /*if ( parentScene != &scene ) //Parent scene has changed
            {
                if ( sceneManager ) //Remove the object from any old scene manager.
                    sceneManager->RemovePlatform(this);
                parentScene = &scene;
                sceneManager = parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
                registeredInManager = false;
            }*/

      //Make sure the platform is or is not in the platforms manager.
      if (!this.activated() && this._registeredInManager) {
        this._manager.removePlatform(this);
        this._registeredInManager = false;
      } else {
        if (this.activated() && !this._registeredInManager) {
          this._manager.addPlatform(this);
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
          this._manager.removePlatform(this);
          this._manager.addPlatform(this);
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
      this._manager.addPlatform(this);
      this._registeredInManager = true;
    }

    onDeActivate() {
      if (!this._registeredInManager) {
        return;
      }
      this._manager.removePlatform(this);
      this._registeredInManager = false;
    }

    changePlatformType(platformType) {
      if (platformType === 'Ladder') {
        this._platformType = PlatformRuntimeBehavior.LADDER;
      } else if (platformType === 'Jumpthru') {
        this._platformType = PlatformRuntimeBehavior.JUMPTHRU;
      } else {
        this._platformType = PlatformRuntimeBehavior.NORMALPLAFTORM;
      }
    }

    getPlatformType() {
      return this._platformType;
    }

    canBeGrabbed() {
      return this._canBeGrabbed;
    }

    getYGrabOffset() {
      return this._yGrabOffset;
    }

    static NORMALPLAFTORM = 0;
    static JUMPTHRU = 1;
    static LADDER = 2;
  }
  gdjs.registerBehavior(
    'PlatformBehavior::PlatformBehavior',
    gdjs.PlatformRuntimeBehavior
  );
}
