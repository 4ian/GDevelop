// @flow
import InstancesSelection from './InstancesSelection';
const gd: libGDevelop = global.gd;

describe('InstancesSelection', () => {
  it('handles multiselection of instances', () => {
    const instancesSelection = new InstancesSelection();
    const instance1OfObject1 = new gd.InitialInstance();
    instance1OfObject1.setObjectName('Object1');
    const instance2OfObject1 = new gd.InitialInstance();
    instance2OfObject1.setObjectName('Object1');
    const instance3OfObject1 = new gd.InitialInstance();
    instance3OfObject1.setObjectName('Object1');
    const instance1OfObject2 = new gd.InitialInstance();
    instance1OfObject2.setObjectName('Object2');
    const instance2OfObject2 = new gd.InitialInstance();
    instance2OfObject2.setObjectName('Object2');
    const instance3OfObject2 = new gd.InitialInstance();
    instance3OfObject2.setObjectName('Object2');

    expect(instancesSelection.hasSelectedInstances()).toBe(false);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(0);

    // Select instances, with multiselection activated.
    instancesSelection.selectInstance({
      instance: instance1OfObject1,
      multiSelect: true,
      layersVisibility: null,
    });
    instancesSelection.selectInstance({
      instance: instance2OfObject1,
      multiSelect: true,
      layersVisibility: null,
    });
    instancesSelection.selectInstance({
      instance: instance1OfObject2,
      multiSelect: true,
      layersVisibility: null,
    });
    expect(instancesSelection.hasSelectedInstances()).toBe(true);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(3);

    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      false
    );

    // Unselect by selecting an instance again, with multiselection activated.
    instancesSelection.selectInstance({
      instance: instance1OfObject1,
      multiSelect: true,
      layersVisibility: null,
    });
    expect(instancesSelection.hasSelectedInstances()).toBe(true);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(2);
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      false
    );

    instance1OfObject1.delete();
    instance2OfObject1.delete();
    instance3OfObject1.delete();
    instance1OfObject2.delete();
    instance2OfObject2.delete();
    instance3OfObject2.delete();
  });

  it('handles simple selection of instances', () => {
    const instancesSelection = new InstancesSelection();
    const instance1OfObject1 = new gd.InitialInstance();
    instance1OfObject1.setObjectName('Object1');
    const instance2OfObject1 = new gd.InitialInstance();
    instance2OfObject1.setObjectName('Object1');
    const instance3OfObject1 = new gd.InitialInstance();
    instance3OfObject1.setObjectName('Object1');
    const instance1OfObject2 = new gd.InitialInstance();
    instance1OfObject2.setObjectName('Object2');
    const instance2OfObject2 = new gd.InitialInstance();
    instance2OfObject2.setObjectName('Object2');
    const instance3OfObject2 = new gd.InitialInstance();
    instance3OfObject2.setObjectName('Object2');

    // Select instances without multiselection
    instancesSelection.selectInstance({
      instance: instance1OfObject1,
      multiSelect: false,
      layersVisibility: null,
    });
    instancesSelection.selectInstance({
      instance: instance2OfObject1,
      multiSelect: false,
      layersVisibility: null,
    });
    instancesSelection.selectInstance({
      instance: instance1OfObject2,
      multiSelect: false,
      layersVisibility: null,
    });
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      false
    );

    instancesSelection.selectInstances({
      instances: [instance1OfObject1, instance2OfObject1, instance1OfObject2],
      multiSelect: false,
      layersVisibility: null,
    });
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      false
    );

    instance1OfObject1.delete();
    instance2OfObject1.delete();
    instance3OfObject1.delete();
    instance1OfObject2.delete();
    instance2OfObject2.delete();
    instance3OfObject2.delete();
  });

  it('handles deselecting instances explicitely', () => {
    const instancesSelection = new InstancesSelection();
    const instance1OfObject1 = new gd.InitialInstance();
    instance1OfObject1.setObjectName('Object1');
    const instance2OfObject1 = new gd.InitialInstance();
    instance2OfObject1.setObjectName('Object1');
    const instance3OfObject1 = new gd.InitialInstance();
    instance3OfObject1.setObjectName('Object1');
    const instance1OfObject2 = new gd.InitialInstance();
    instance1OfObject2.setObjectName('Object2');
    const instance2OfObject2 = new gd.InitialInstance();
    instance2OfObject2.setObjectName('Object2');
    const instance3OfObject2 = new gd.InitialInstance();
    instance3OfObject2.setObjectName('Object2');

    instancesSelection.selectInstances({
      instances: [
        instance1OfObject1,
        instance2OfObject1,
        instance1OfObject2,
        instance3OfObject2,
      ],
      multiSelect: false,
      layersVisibility: null,
    });
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    instancesSelection.unselectInstance(instance1OfObject2);
    expect(instancesSelection.hasSelectedInstances()).toBe(true);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(3);
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      true
    );

    instancesSelection.unselectInstancesOfObject('Object1');
    expect(instancesSelection.hasSelectedInstances()).toBe(true);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(1);
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      true
    );

    instancesSelection.unselectInstancesOfObject('Object2');
    expect(instancesSelection.hasSelectedInstances()).toBe(false);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(0);

    instance1OfObject1.delete();
    instance2OfObject1.delete();
    instance3OfObject1.delete();
    instance1OfObject2.delete();
    instance2OfObject2.delete();
    instance3OfObject2.delete();
  });

  it('handles deselecting instances of a layer', () => {
    const instancesSelection = new InstancesSelection();
    const instance1OfObject1 = new gd.InitialInstance();
    instance1OfObject1.setObjectName('Object1');
    instance1OfObject1.setLayer('Layer1');
    const instance2OfObject1 = new gd.InitialInstance();
    instance2OfObject1.setObjectName('Object1');
    const instance3OfObject1 = new gd.InitialInstance();
    instance3OfObject1.setObjectName('Object1');
    instance3OfObject1.setLayer('Layer1');
    const instance1OfObject2 = new gd.InitialInstance();
    instance1OfObject2.setObjectName('Object2');
    instance1OfObject2.setLayer('Layer2');
    const instance2OfObject2 = new gd.InitialInstance();
    instance2OfObject2.setObjectName('Object2');
    instance2OfObject2.setLayer('Layer1');
    const instance3OfObject2 = new gd.InitialInstance();
    instance3OfObject2.setObjectName('Object2');

    instancesSelection.selectInstances({
      instances: [
        instance1OfObject1,
        instance2OfObject1,
        instance1OfObject2,
        instance2OfObject2,
      ],
      multiSelect: false,
      layersVisibility: null,
    });

    instancesSelection.unselectInstancesOnLayer('Layer1');
    expect(instancesSelection.hasSelectedInstances()).toBe(true);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(2);
    expect(instancesSelection.isInstanceSelected(instance1OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject1)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject1)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance1OfObject2)).toBe(
      true
    );
    expect(instancesSelection.isInstanceSelected(instance2OfObject2)).toBe(
      false
    );
    expect(instancesSelection.isInstanceSelected(instance3OfObject2)).toBe(
      false
    );

    instancesSelection.unselectInstancesOnLayer('');
    instancesSelection.unselectInstancesOnLayer('Layer2');
    expect(instancesSelection.hasSelectedInstances()).toBe(false);
    expect(instancesSelection.getSelectedInstances()).toHaveLength(0);

    instance1OfObject1.delete();
    instance2OfObject1.delete();
    instance3OfObject1.delete();
    instance1OfObject2.delete();
    instance2OfObject2.delete();
    instance3OfObject2.delete();
  });
});
