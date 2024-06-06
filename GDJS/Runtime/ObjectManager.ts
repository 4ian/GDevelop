namespace gdjs {
  /**
   * Allow to do spacial searches on objects as fast as possible.
   *
   * Objects are put in an R-Tree only if they didn't move recently to avoid to
   * update the R-Tree too often.
   */
  export class ObjectManager {
    private _allInstances: Array<RuntimeObject> = [];
    private _awakeInstances: Array<RuntimeObject> = [];
    private _rbush: RBush<RuntimeObject>;

    constructor() {
      this._rbush = new RBush<RuntimeObject>();
    }

    _destroy(): void {
      this._allInstances = [];
      this._awakeInstances = [];
      this._rbush.clear();
    }

    search(
      searchArea: SearchArea,
      results: Array<RuntimeObject>
    ): Array<RuntimeObject> {
      let instances = this._allInstances;
      if (instances.length >= 8) {
        this._rbush.search(searchArea, results);
        instances = this._awakeInstances;
      }
      for (const instance of instances) {
        // TODO Allow to use getAABB to optimize collision conditions
        const aabb = instance.getVisibilityAABB();
        if (
          !aabb ||
          (aabb.min[0] <= searchArea.maxX &&
            aabb.max[0] >= searchArea.minX &&
            aabb.min[1] <= searchArea.maxY &&
            aabb.max[1] >= searchArea.minY)
        ) {
          results.push(instance);
        }
      }
      return results;
    }

    private _onWakingUp(object: RuntimeObject): void {
      this._rbush.remove(object._rtreeAABB);
      this._awakeInstances.push(object);
    }

    private _onFallenAsleep(object: RuntimeObject): void {
      // TODO Allow to use getAABB to optimize collision conditions
      const objectAABB = object.getVisibilityAABB();
      if (!objectAABB) {
        return;
      }
      this._rbush.remove(object._rtreeAABB);
      object._rtreeAABB.minX = objectAABB.min[0];
      object._rtreeAABB.minY = objectAABB.min[1];
      object._rtreeAABB.maxX = objectAABB.max[0];
      object._rtreeAABB.maxY = objectAABB.max[1];
      this._rbush.insert(object._rtreeAABB);
    }

    updateAwakeObjects(): void {
      gdjs.ObjectSleepState.updateAwakeObjects(
        this._awakeInstances,
        (object) => object.getSpatialSearchSleepState(),
        (object) => this._onFallenAsleep(object),
        (object) => this._onWakingUp(object)
      );
    }

    getAllInstances(): Array<RuntimeObject> {
      return this._allInstances;
    }

    getAwakeInstances(): Array<RuntimeObject> {
      return this._awakeInstances;
    }

    /**
     * Add an object to the instances living in the container.
     * @param obj The object to be added.
     */
    addObject(object: gdjs.RuntimeObject): void {
      this._allInstances.push(object);
      this._awakeInstances.push(object);
    }

    /**
     * Must be called whenever an object must be removed from the container.
     * @param object The object to be removed.
     */
    deleteObject(object: gdjs.RuntimeObject): boolean {
      const objId = object.id;
      let isObjectDeleted = false;
      for (let i = 0, len = this._allInstances.length; i < len; ++i) {
        if (this._allInstances[i].id == objId) {
          this._allInstances.splice(i, 1);
          isObjectDeleted = true;
          break;
        }
      }
      // TODO Maybe the state could be used but it would be more prone to errors.
      let isAwake = false;
      for (let i = 0, len = this._awakeInstances.length; i < len; ++i) {
        if (this._awakeInstances[i].id == objId) {
          this._awakeInstances.splice(i, 1);
          isAwake = true;
          break;
        }
      }
      if (!isAwake) {
        this._rbush.remove(object._rtreeAABB);
      }
      return isObjectDeleted;
    }
  }
}
