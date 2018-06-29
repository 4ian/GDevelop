// @flow
const gd = global.gd;

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

  selectInstance(instance: gdInitialInstance, multiselect: boolean) {
    if (this.isInstanceSelected(instance)) {
      if (multiselect) this.unselectInstance(instance);

      return;
    }

    if (!multiselect) this.clearSelection();
    this.selection.push(instance);
  }

  selectInstances(instances: [gdInitialInstance], multiselect: boolean) {
    if (!multiselect) this.clearSelection();

    instances.forEach(instance => this.selectInstance(instance, true));
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
}
