// @flow
import { mapFor } from '../Utils/MapFor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type CompositeTarget } from '../Utils/History';

/**
 * History targets for an objects container, its object groups and a
 * variables container - extracted from `SceneEditor` so they can be unit
 * tested with real gd.* bindings, independently of the (very large)
 * `SceneEditor` component.
 *
 * These containers can be the ones local to a scene, or the *global* ones
 * (shared by every open scene tab) - `setValue` is written so it never
 * removes-then-recreates an item that stays from before to after a step
 * (whether unchanged or edited): doing so would destroy the underlying
 * C++ object and replace it with a new one, leaving any other consumer
 * (another open scene tab using a global object/group/variable, an
 * effect/behavior editor holding a reference to it) with a dangling
 * reference that crashes on next use.
 */

export const getVariablesContainerHistoryTarget = (
  variablesContainer: gdVariablesContainer
): CompositeTarget => ({
  getValue: () => {
    variablesContainer.ensurePersistentUuids();
    const variables = [];
    mapFor(0, variablesContainer.count(), i => {
      variables.push({
        name: variablesContainer.getNameAt(i),
        serialized: serializeToJSObject(variablesContainer.getAt(i)),
      });
    });
    return { variables };
  },
  setValue: (value: Object) => {
    const targetVariables = value.variables || [];
    const targetNames = new Set(targetVariables.map(item => item.name));

    const currentNames = [];
    mapFor(0, variablesContainer.count(), i =>
      currentNames.push(variablesContainer.getNameAt(i))
    );
    currentNames
      .filter(name => !targetNames.has(name))
      .forEach(name => variablesContainer.remove(name));

    targetVariables.forEach(({ name, serialized }, index) => {
      if (variablesContainer.has(name)) {
        unserializeFromJSObject(variablesContainer.get(name), serialized);
      } else {
        const newVariable = variablesContainer.insertNew(name, index);
        unserializeFromJSObject(newVariable, serialized);
      }
    });
  },
});

export const getObjectsContainerHistoryTarget = (
  objectsContainer: gdObjectsContainer,
  project: gdProject,
  ensurePersistentUuidsOfObject: (object: gdObject) => void
): CompositeTarget => ({
  getValue: () => {
    const objects = [];
    mapFor(0, objectsContainer.getObjectsCount(), i => {
      const object = objectsContainer.getObjectAt(i);
      ensurePersistentUuidsOfObject(object);
      objects.push({
        name: object.getName(),
        type: object.getType(),
        serialized: serializeToJSObject(object),
      });
    });
    return {
      objects,
      folders: serializeToJSObject(objectsContainer, 'serializeFoldersTo'),
    };
  },
  setValue: (value: Object) => {
    const targetObjects = value.objects || [];
    const targetNames = new Set(targetObjects.map(item => item.name));

    const currentNames = [];
    mapFor(0, objectsContainer.getObjectsCount(), i =>
      currentNames.push(objectsContainer.getObjectAt(i).getName())
    );
    currentNames
      .filter(name => !targetNames.has(name))
      .forEach(name => objectsContainer.removeObject(name));

    targetObjects.forEach(({ name, type, serialized }, index) => {
      if (objectsContainer.hasObjectNamed(name)) {
        unserializeFromJSObject(
          objectsContainer.getObject(name),
          serialized,
          'unserializeFrom',
          project
        );
      } else {
        const newObject = objectsContainer.insertNewObject(
          project,
          type,
          name,
          index
        );
        unserializeFromJSObject(
          newObject,
          serialized,
          'unserializeFrom',
          project
        );
      }
    });

    // The folder tree only references objects by name (not by keeping a
    // reference to them across renders), so replacing it wholesale is
    // safe as long as the objects above are already up to date.
    unserializeFromJSObject(
      objectsContainer,
      value.folders,
      'unserializeFoldersFrom',
      project
    );
  },
});

export const getObjectGroupsContainerHistoryTarget = (
  objectGroupsContainer: gdObjectGroupsContainer
): CompositeTarget => ({
  getValue: () => {
    const groups = [];
    mapFor(0, objectGroupsContainer.count(), i => {
      const group = objectGroupsContainer.getAt(i);
      groups.push({
        name: group.getName(),
        serialized: serializeToJSObject(group),
      });
    });
    return { groups };
  },
  setValue: (value: Object) => {
    const targetGroups = value.groups || [];
    const targetNames = new Set(targetGroups.map(item => item.name));

    const currentNames = [];
    mapFor(0, objectGroupsContainer.count(), i =>
      currentNames.push(objectGroupsContainer.getAt(i).getName())
    );
    currentNames
      .filter(name => !targetNames.has(name))
      .forEach(name => objectGroupsContainer.remove(name));

    targetGroups.forEach(({ name, serialized }, index) => {
      if (objectGroupsContainer.has(name)) {
        unserializeFromJSObject(objectGroupsContainer.get(name), serialized);
      } else {
        const newGroup = objectGroupsContainer.insertNew(name, index);
        unserializeFromJSObject(newGroup, serialized);
      }
    });
  },
});
