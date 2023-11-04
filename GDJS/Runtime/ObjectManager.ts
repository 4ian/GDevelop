namespace gdjs {
  declare var rbush: any;
  type SearchArea = { minX: float; minY: float; maxX: float; maxY: float };

  export class ObjectManager {
    private _allInstances: Array<RuntimeObject> = [];
    private _awakeInstances: Array<RuntimeObject> = [];
    private _rbush: any;

    constructor() {
      this._rbush = new rbush();
    }

    search(searchArea: SearchArea) {
      if (this._allInstances.length < 8) {
        return this._allInstances;
      }
      const nearbyObjects: Array<RuntimeObject> = this._rbush.search(
        searchArea
      );
      nearbyObjects.push.apply(nearbyObjects, this._awakeInstances);
      return nearbyObjects;
    }

    private _onWakingUp(object: RuntimeObject): void {
      this._rbush.remove(object);
      this._awakeInstances.push(object);
    }

    updateAwakeObjects(): void {
      gdjs.ObjectSleepState.updateAwakeObjects(
        this._awakeInstances,
        (object: RuntimeObject) => object.getSpatialSearchSleepState(),
        (object: RuntimeObject) => this._rbush.add(object)
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
    addObject(object: gdjs.RuntimeObject) {
      object
        .getSpatialSearchSleepState()
        .registerOnWakingUp((object) => this._onWakingUp(object));
      this._allInstances.push(object);
      this._awakeInstances.push(object);
    }

    /**
     * Must be called whenever an object must be removed from the container.
     * @param object The object to be removed.
     */
    deleteObject(object: gdjs.RuntimeObject) {
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
        this._rbush.remove(object);
      }
      return false;
    }
  }
}
