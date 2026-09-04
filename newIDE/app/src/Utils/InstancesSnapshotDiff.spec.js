// @flow
import { diffInstancesSnapshots } from './InstancesSnapshotDiff';
import { serializeToJSObject } from './Serializer';

const gd: libGDevelop = global.gd;

describe('diffInstancesSnapshots', () => {
  it('finds nothing on identical snapshots', () => {
    const snapshot = [{ persistentUuid: 'aaa', name: 'Player', x: 0, y: 0 }];
    const diff = diffInstancesSnapshots(snapshot, snapshot);
    expect(diff.changedOrAddedPersistentUuids).toEqual([]);
    expect(diff.removedInstances).toEqual([]);
  });

  it('finds added, modified and removed instances', () => {
    const before = [
      { persistentUuid: 'aaa', name: 'Player', x: 0, y: 0 },
      { persistentUuid: 'bbb', name: 'Enemy', x: 10, y: 10 },
    ];
    const after = [
      { persistentUuid: 'aaa', name: 'Player', x: 500, y: 0 }, // Moved.
      { persistentUuid: 'ccc', name: 'Coin', x: 20, y: 20 }, // Added.
      // 'bbb' removed.
    ];

    const diff = diffInstancesSnapshots(before, after);
    expect(diff.changedOrAddedPersistentUuids).toEqual(['aaa', 'ccc']);
    expect(diff.removedInstances).toEqual([
      { persistentUuid: 'bbb', name: 'Enemy', x: 10, y: 10 },
    ]);
  });

  it('handles missing snapshots', () => {
    const snapshot = [{ persistentUuid: 'aaa', name: 'Player', x: 0, y: 0 }];
    expect(diffInstancesSnapshots(null, snapshot)).toEqual({
      changedOrAddedPersistentUuids: ['aaa'],
      removedInstances: [],
    });
    expect(diffInstancesSnapshots(snapshot, null)).toEqual({
      changedOrAddedPersistentUuids: [],
      removedInstances: [snapshot[0]],
    });
  });

  // The diff is used on snapshots of `gd.InitialInstancesContainer` stored in
  // the scene editor history: lock their shape (an array of objects with a
  // `persistentUuid`) with the real serializer.
  it('works on real serialized initial instances', () => {
    const project = gd.ProjectHelper.createNewGDJSProject();
    const layout = project.insertNewLayout('Scene', 0);
    const initialInstances = layout.getInitialInstances();
    const playerInstance = initialInstances.insertNewInitialInstance();
    playerInstance.setObjectName('Player');
    const enemyInstance = initialInstances.insertNewInitialInstance();
    enemyInstance.setObjectName('Enemy');

    const snapshotBeforeChange = serializeToJSObject(initialInstances);
    expect(Array.isArray(snapshotBeforeChange)).toBe(true);
    expect(snapshotBeforeChange.length).toBe(2);
    snapshotBeforeChange.forEach(instance =>
      expect(instance.persistentUuid).toBeTruthy()
    );

    playerInstance.setX(1000);
    const snapshotAfterChange = serializeToJSObject(initialInstances);

    const diff = diffInstancesSnapshots(
      snapshotBeforeChange,
      snapshotAfterChange
    );
    expect(diff.changedOrAddedPersistentUuids).toEqual([
      playerInstance.getPersistentUuid(),
    ]);
    expect(diff.removedInstances).toEqual([]);

    project.delete();
  });
});
