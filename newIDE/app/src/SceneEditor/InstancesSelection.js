const gd = global.gd;

export default class InstancesSelection {
  constructor() {
    this.selection = [];
  }

  getSelectedInstances() {
    return this.selection;
  }

  isInstanceSelected(instance) {
    for (var i = 0; i < this.selection.length; i++) {
      if (gd.compare(this.selection[i], instance))
        return true;
    }

    return false;
  }

  clearSelection() {
    this.selection.length = 0;
  }

  selectInstance(instance) {
    if (!this.isInstanceSelected(instance)) {
      this.selection.push(instance);
    }
  }

  unselectInstance(instance) {
    if (this.isInstanceSelected(instance)) {
      var i = this.selection.length - 1;
      while (i >= -1 && this.selection[i].ptr !== instance.ptr) {
          --i;
      }

      this.selection.splice(i, 1);
    }
  }
}
