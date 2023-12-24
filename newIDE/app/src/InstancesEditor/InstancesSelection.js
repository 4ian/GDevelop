// @flow
const gd: libGDevelop = global.gd;

/**
 * Represents a list of selected instances.
 */
export default class InstancesSelection {
  selection: Array<gdInitialInstance> = [];

  hasSelectedInstances() {
    return !!this.getSelectedInstances().length;
  }

  getSelectedInstances() {
    return this.selection;
  }

  isInstanceSelected(instance: gdInitialInstance) {
    for (var i = 0; i < this.selection.length; i++) {
      if (gd.compare(this.selection[i], instance)) return true;
    }

    return false;
  }

  clearSelection() {
    this.selection.length = 0;
  }

  selectInstance({
    instance,
    multiSelect,
    layersLocks = null,
    ignoreSeal = false,
  }: {|
    instance: gdInitialInstance,
    multiSelect: boolean,
    layersLocks: ?{ [string]: boolean },
    ignoreSeal?: boolean,
  |}) {
    if (!ignoreSeal && instance.isSealed()) return;
    if (this.isInstanceSelected(instance)) {
      if (multiSelect) this.unselectInstance(instance);

      return;
    }

    if (!multiSelect) this.clearSelection();

    if (!layersLocks || !layersLocks[instance.getLayer()]) {
      this.selection.push(instance);
    }
  }

  selectInstances({
    instances,
    multiSelect,
    layersLocks = null,
    ignoreSeal = false,
  }: {|
    instances: Array<gdInitialInstance>,
    multiSelect: boolean,
    layersLocks: ?{ [string]: boolean },
    ignoreSeal?: boolean,
  |}) {
    if (!multiSelect) this.clearSelection();

    instances.forEach(instance => {
      this.selectInstance({
        instance,
        multiSelect: true,
        layersLocks,
        ignoreSeal,
      });
    });
  }

  unselectInstance(instance: gdInitialInstance) {
    if (this.isInstanceSelected(instance)) {
      var i = this.selection.length - 1;
      while (i >= -1 && this.selection[i].ptr !== instance.ptr) {
        --i;
      }

      this.selection.splice(i, 1);
    }
  }

  unselectInstancesOfObject(objectName: string) {
    for (let i = 0; i < this.selection.length; ) {
      if (this.selection[i].getObjectName() === objectName) {
        this.selection.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  unselectInstancesOnLayer(layerName: string) {
    for (let i = 0; i < this.selection.length; ) {
      if (this.selection[i].getLayer() === layerName) {
        this.selection.splice(i, 1);
      } else {
        i++;
      }
    }
  }

  cleanNonExistingInstances(instancesContainer: gdInitialInstancesContainer) {
    const allExistingInstancePointers = new Set<number>();
    const functor = new gd.InitialInstanceJSFunctor();
    // $FlowFixMe - typing is not correct.
    functor.invoke = (instancePtr: number) => {
      allExistingInstancePointers.add(instancePtr);
    };
    // $FlowFixMe
    instancesContainer.iterateOverInstances(functor);
    functor.delete();

    for (let i = 0; i < this.selection.length; ) {
      const instance = this.selection[i];
      if (!allExistingInstancePointers.has(instance.ptr)) {
        this.selection.splice(i, 1);
      } else {
        i++;
      }
    }
  }
}
