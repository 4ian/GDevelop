namespace gdjs {
  // TODO Do something like BehaviorRBushAABB
  // TODO Allow to use getVisibilityAABB or getAABB
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
        const aabb = instance.getAABB();
        if (
          aabb.min[0] <= searchArea.maxX &&
          aabb.max[0] >= searchArea.minX &&
          aabb.min[1] <= searchArea.maxY &&
          aabb.max[1] >= searchArea.minY
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

    updateAwakeObjects(): void {
      gdjs.ObjectSleepState.updateAwakeObjects(
        this._awakeInstances,
        (object: RuntimeObject) => object.getSpatialSearchSleepState(),
        (object: RuntimeObject) => {
          const objectAABB = object.getAABB();
          object._rtreeAABB.minX = objectAABB.min[0];
          object._rtreeAABB.minY = objectAABB.min[1];
          object._rtreeAABB.maxX = objectAABB.max[0];
          object._rtreeAABB.maxY = objectAABB.max[1];
          this._rbush.insert(object._rtreeAABB);
        }
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
      object
        .getSpatialSearchSleepState()
        .registerOnWakingUp((object) => this._onWakingUp(object));
      this._allInstances.push(object);
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
