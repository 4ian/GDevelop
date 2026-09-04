// @flow

// The scene editor history stores the initial instances as a serialized
// snapshot: an array of plain objects, each with a `persistentUuid`
// (guaranteed: instances get one at creation and it survives serialization).
// Diffing two snapshots tells which instances an undo/redo touched - used
// to reveal the change in the editor when it happened outside of the view.

export type InstancesSnapshotDiff = {|
  // Instances added or modified by the change (they exist after it).
  changedOrAddedPersistentUuids: Array<string>,
  // Snapshots of the instances removed by the change (with their last
  // known position).
  removedInstances: Array<Object>,
|};

export const diffInstancesSnapshots = (
  instancesBeforeChange: ?Array<Object>,
  instancesAfterChange: ?Array<Object>
): InstancesSnapshotDiff => {
  const instancesByUuidBeforeChange = new Map<string, Object>();
  (instancesBeforeChange || []).forEach(instance => {
    if (instance.persistentUuid)
      instancesByUuidBeforeChange.set(instance.persistentUuid, instance);
  });

  const changedOrAddedPersistentUuids = [];
  const uuidsAfterChange = new Set<string>();
  (instancesAfterChange || []).forEach(instance => {
    const persistentUuid = instance.persistentUuid;
    if (!persistentUuid) return;
    uuidsAfterChange.add(persistentUuid);

    const instanceBeforeChange = instancesByUuidBeforeChange.get(
      persistentUuid
    );
    // Both snapshots come from the same serializer, so a same instance
    // always serializes the same way: a JSON comparison is enough.
    if (
      !instanceBeforeChange ||
      JSON.stringify(instanceBeforeChange) !== JSON.stringify(instance)
    ) {
      changedOrAddedPersistentUuids.push(persistentUuid);
    }
  });

  const removedInstances = [];
  instancesByUuidBeforeChange.forEach((instance, persistentUuid) => {
    if (!uuidsAfterChange.has(persistentUuid)) removedInstances.push(instance);
  });

  return { changedOrAddedPersistentUuids, removedInstances };
};
