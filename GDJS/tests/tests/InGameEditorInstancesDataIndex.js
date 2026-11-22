// @ts-check

describe('gdjs.InGameEditorInstancesDataIndex', function () {
  /**
   * @param {string} persistentUuid
   * @returns {InstanceData}
   */
  const makeInstanceData = (persistentUuid) => ({
    name: 'Object',
    persistentUuid,
    x: 0,
    y: 0,
    z: 0,
    angle: 0,
    rotationX: 0,
    rotationY: 0,
    layer: '',
    zOrder: 0,
    customSize: false,
    width: 0,
    height: 0,
    depth: 0,
    locked: false,
    sealed: false,
    hidden: false,
    numberProperties: [],
    stringProperties: [],
    initialVariables: [],
  });

  it('can find instances by their persistent UUID', () => {
    const instancesIndex = new gdjs.InGameEditorInstancesDataIndex();
    const first = makeInstanceData('first');
    const second = makeInstanceData('second');
    instancesIndex.addAll([first, second]);

    expect(instancesIndex.getCount()).to.be(2);
    expect(instancesIndex.getByPersistentUuid('first')).to.be(first);
    expect(instancesIndex.getByPersistentUuid('second')).to.be(second);
    expect(instancesIndex.getByPersistentUuid('unknown')).to.be(null);
    expect(instancesIndex.getByPersistentUuid(null)).to.be(null);
    expect(instancesIndex.getAll()).to.eql([first, second]);
  });

  it('uses the given array when all instances are replaced', () => {
    const instancesIndex = new gdjs.InGameEditorInstancesDataIndex();
    instancesIndex.addAll([makeInstanceData('first')]);

    const second = makeInstanceData('second');
    const instancesList = [second];
    instancesIndex.replaceAll(instancesList);

    expect(instancesIndex.getAll()).to.be(instancesList);
    expect(instancesIndex.getCount()).to.be(1);
    expect(instancesIndex.getByPersistentUuid('first')).to.be(null);
    expect(instancesIndex.getByPersistentUuid('second')).to.be(second);
  });

  it('can rebuild the index after the list was modified externally', () => {
    const instancesIndex = new gdjs.InGameEditorInstancesDataIndex();
    const first = makeInstanceData('first');
    instancesIndex.replaceAll([first]);

    // Like a hot reload does: the same array is filled with new objects.
    const newFirst = makeInstanceData('first');
    instancesIndex.getAll().length = 0;
    instancesIndex.getAll().push(newFirst);

    expect(instancesIndex.getByPersistentUuid('first')).to.be(first);
    instancesIndex.rebuildIndex();
    expect(instancesIndex.getByPersistentUuid('first')).to.be(newFirst);
  });

  it('can remove instances by their persistent UUID', () => {
    const instancesIndex = new gdjs.InGameEditorInstancesDataIndex();
    const first = makeInstanceData('first');
    const second = makeInstanceData('second');
    instancesIndex.addAll([first, second]);

    expect(instancesIndex.removeByPersistentUuid('first')).to.be(true);
    expect(instancesIndex.removeByPersistentUuid('first')).to.be(false);
    expect(instancesIndex.removeByPersistentUuid('unknown')).to.be(false);
    expect(instancesIndex.removeByPersistentUuid(null)).to.be(false);
    expect(instancesIndex.getCount()).to.be(1);
    expect(instancesIndex.getAll()).to.eql([second]);
    expect(instancesIndex.getByPersistentUuid('first')).to.be(null);
  });
});
