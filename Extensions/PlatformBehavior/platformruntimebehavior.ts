/*
GDevelop - Platform Behavior Extension
Copyright (c) 2013-2016 Florian Rival (Florian.Rival@gmail.com)
 */
namespace gdjs {
  declare var rbush: any;
  type SearchArea = { minX: float; minY: float; maxX: float; maxY: float };

  /**
   * Manages the common objects shared by objects having a
   * platform behavior: in particular, the platforms behaviors are required to
   * declare themselves (see PlatformObjectsManager.addPlatform) to the manager
   * of their associated container (see PlatformRuntimeBehavior.getManager).
   */
  export class PlatformObjectsManager {
    private _platformRBush: any;
    private movedPlatforms: Array<gdjs.PlatformRuntimeBehavior>;

    constructor(instanceContainer: gdjs.RuntimeInstanceContainer) {
      this._platformRBush = new rbush();
      this.movedPlatforms = [];
      gdjs.registerRuntimeScenePreEventsCallback(() => this.doStepPreEvents());
    }

    /**
     * Get the platforms manager of an instance container.
     */
    static getManager(instanceContainer: gdjs.RuntimeInstanceContainer) {
      // @ts-ignore
      if (!instanceContainer.platformsObjectsManager) {
        //Create the shared manager if necessary.
        // @ts-ignore
        instanceContainer.platformsObjectsManager =
          new gdjs.PlatformObjectsManager(instanceContainer);
      }
      // @ts-ignore
      return instanceContainer.platformsObjectsManager;
    }

    /**
     * Add a platform to the list of existing platforms.
     */
    addPlatform(platformBehavior: gdjs.PlatformRuntimeBehavior) {
      if (platformBehavior.currentRBushAABB)
        platformBehavior.currentRBushAABB.updateAABBFromOwner();
      else
        platformBehavior.currentRBushAABB = new gdjs.BehaviorRBushAABB(
          platformBehavior
        );
      this._platformRBush.insert(platformBehavior.currentRBushAABB);
    }

    /**
     * Remove a platform from the list of existing platforms. Be sure that the platform was
     * added before.
     */
    removePlatform(platformBehavior: gdjs.PlatformRuntimeBehavior) {
      this._platformRBush.remove(platformBehavior.currentRBushAABB);
    }

    invalidatePlatformHitbox(platformBehavior: gdjs.PlatformRuntimeBehavior) {
      this.movedPlatforms.push(platformBehavior);
    }

    doStepPreEvents() {
      for (const platformBehavior of this.movedPlatforms) {
        this.removePlatform(platformBehavior);
        if (platformBehavior.activated() && platformBehavior.owner.isAlive()) {
          this.addPlatform(platformBehavior);
        }
        platformBehavior.onHitboxUpdatedInTree();
      }
      this.movedPlatforms.length = 0;
    }

    /**
     * Returns all the platforms around the specified object.
     * @param maxMovementLength The maximum distance, in pixels, the object is going to do.
     * @return An array with all platforms near the object.
     */
    getAllPlatformsAround(
      object: gdjs.RuntimeObject,
      maxMovementLength: number,
      result: PlatformRuntimeBehavior[]
    ): any {
      // TODO: This would better be done using the object AABB (getAABB), as (`getCenterX`;`getCenterY`) point
      // is not necessarily in the middle of the object (for sprites for example).
      const ow = object.getWidth();
      const oh = object.getHeight();
      const x = object.getDrawableX() + object.getCenterX();
      const y = object.getDrawableY() + object.getCenterY();
      const searchArea: SearchArea = gdjs.staticObject(
        PlatformObjectsManager.prototype.getAllPlatformsAround
      ) as SearchArea;
      searchArea.minX = x - ow / 2 - maxMovementLength;
      searchArea.minY = y - oh / 2 - maxMovementLength;
      searchArea.maxX = x + ow / 2 + maxMovementLength;
      searchArea.maxY = y + oh / 2 + maxMovementLength;
      const nearbyPlatforms: gdjs.BehaviorRBushAABB<PlatformRuntimeBehavior>[] =
        this._platformRBush.search(searchArea);

      result.length = 0;

      // Extra check on the platform owner AABB
      // TODO: PR https://github.com/4ian/GDevelop/pull/2602 should remove the need
      // for this extra check once merged.
      for (let i = 0; i < nearbyPlatforms.length; i++) {
        const platform = nearbyPlatforms[i].behavior;
        const platformAABB = platform.owner.getAABB();
        const platformIsStillAround =
          platformAABB.min[0] <= searchArea.maxX &&
          platformAABB.min[1] <= searchArea.maxY &&
          platformAABB.max[0] >= searchArea.minX &&
          platformAABB.max[1] >= searchArea.minY;
        // Filter platforms that are not in the searched area anymore.
        // This can happen because platforms are not updated in the RBush before that
        // characters movement are being processed.
        if (platformIsStillAround) {
          result.push(platform);
        }
      }
    }
  }

  /**
   * PlatformRuntimeBehavior represents a behavior allowing objects to be
   * considered as a platform by objects having PlatformerObject Behavior.
   */
  export class PlatformRuntimeBehavior extends gdjs.RuntimeBehavior {
    //Load the platform type
    _platformType: integer;
    _canBeGrabbed: boolean;
    _yGrabOffset: float;

    //Note that we can't use getX(), getWidth()... of owner here: The owner is not fully constructed.
    _oldX: float = 0;
    _oldY: float = 0;
    _oldWidth: float = 0;
    _oldHeight: float = 0;
    _oldAngle: float = 0;
    currentRBushAABB: gdjs.BehaviorRBushAABB<PlatformRuntimeBehavior> | null =
      null;
    _manager: gdjs.PlatformObjectsManager;
    _registeredInManager: boolean = false;
    _isAABBInvalidated = false;

    constructor(
      instanceContainer: gdjs.RuntimeInstanceContainer,
      behaviorData,
      owner: gdjs.RuntimeObject
    ) {
      super(instanceContainer, behaviorData, owner);
      this._platformType = behaviorData.platformType;
      if (behaviorData.platformType === 'Ladder') {
        this._platformType = PlatformRuntimeBehavior.LADDER;
      } else if (behaviorData.platformType === 'Jumpthru') {
        this._platformType = PlatformRuntimeBehavior.JUMPTHRU;
      } else {
        this._platformType = PlatformRuntimeBehavior.NORMALPLATFORM;
      }
      this._canBeGrabbed = behaviorData.canBeGrabbed || false;
      this._yGrabOffset = behaviorData.yGrabOffset || 0;
      this._manager = PlatformObjectsManager.getManager(instanceContainer);
      this.owner.registerHitboxChangedCallback((object) =>
        this.onHitboxChanged()
      );
      this.onHitboxChanged();
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
      this.onHitboxChanged();
    }

    usesLifecycleFunction(): boolean {
      return false;
    }

    doStepPreEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {
      //Scene change is not supported
      /*if ( parentScene != &scene ) //Parent scene has changed
            {
                if ( sceneManager ) //Remove the object from any old scene manager.
                    sceneManager->RemovePlatform(this);
                parentScene = &scene;
                sceneManager = parentScene ? &ScenePlatformObjectsManager::managers[&scene] : NULL;
                registeredInManager = false;
            }*/
    }

    doStepPostEvents(instanceContainer: gdjs.RuntimeInstanceContainer) {}

    onActivate() {
      this.onHitboxChanged();
    }

    onDeActivate() {
      this.onHitboxChanged();
    }

    onHitboxChanged() {
      if (this._isAABBInvalidated) {
        return;
      }
      this._isAABBInvalidated = true;
      this._manager.invalidatePlatformHitbox(this);
    }

    onHitboxUpdatedInTree() {
      this._isAABBInvalidated = false;
    }

    changePlatformType(platformType: string) {
      if (platformType === 'Ladder') {
        this._platformType = PlatformRuntimeBehavior.LADDER;
      } else if (platformType === 'Jumpthru') {
        this._platformType = PlatformRuntimeBehavior.JUMPTHRU;
      } else {
        this._platformType = PlatformRuntimeBehavior.NORMALPLATFORM;
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

    static NORMALPLATFORM = 0;
    /** @deprecated Use NORMALPLATFORM instead. */
    static NORMALPLAFTORM = PlatformRuntimeBehavior.NORMALPLATFORM;
    static JUMPTHRU = 1;
    static LADDER = 2;

    static isOnPlatformTest(
      object1: gdjs.RuntimeObject,
      object2: gdjs.RuntimeObject,
      behaviorName: string
    ): boolean {
      const behavior1 = object1.getBehavior(
        behaviorName
      ) as PlatformerObjectRuntimeBehavior;
      return behavior1.isOnFloorObject(object2);
    }
  }
  gdjs.registerBehavior(
    'PlatformBehavior::PlatformBehavior',
    gdjs.PlatformRuntimeBehavior
  );
}
