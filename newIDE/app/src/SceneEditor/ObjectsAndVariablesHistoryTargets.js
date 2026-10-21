// @flow
import { mapFor } from '../Utils/MapFor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import { type CompositeTarget } from '../Utils/History';

const gd: libGDevelop = global.gd;

export type ApplyVariablesRefactoring = (
  changeset: gdVariablesChangeset,
  originalSerializedVariables: gdSerializerElement
) => void;

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

const collectVariableIdentities = (
  variable: gdVariable,
  name: string,
  identities: Map<string, string>
) => {
  const uuid = variable.getPersistentUuid();
  if (uuid) identities.set(uuid, `${name}:${variable.getType()}`);
  if (variable.getType() === gd.Variable.Structure) {
    variable
      .getAllChildrenNames()
      .toJSArray()
      .forEach(childName =>
        collectVariableIdentities(
          variable.getChild(childName),
          childName,
          identities
        )
      );
  } else if (variable.getType() === gd.Variable.Array) {
    mapFor(0, variable.getChildrenCount(), i =>
      collectVariableIdentities(variable.getAtIndex(i), '', identities)
    );
  }
};

const getVariableIdentities = (
  variablesContainer: gdVariablesContainer
): Map<string, string> => {
  const identities = new Map<string, string>();
  mapFor(0, variablesContainer.count(), i =>
    collectVariableIdentities(
      variablesContainer.getAt(i),
      variablesContainer.getNameAt(i),
      identities
    )
  );
  return identities;
};

const haveVariablesBeenRenamedOrRetyped = (
  identitiesBefore: Map<string, string>,
  identitiesAfter: Map<string, string>
): boolean => {
  for (const [uuid, identity] of identitiesBefore) {
    const identityAfter = identitiesAfter.get(uuid);
    if (identityAfter !== undefined && identityAfter !== identity) return true;
  }
  return false;
};

/**
 * Restore a variables container, then apply to the rest of the project
 * (events, instances...) the same refactoring the editors apply when the
 * variables are edited - so that a variable renamed (or whose type was
 * changed) by an undo/redo is followed in the events using it.
 * The refactoring recreates the variables of the container: it's only
 * applied when a variable was actually renamed or retyped.
 */
const restoreVariablesWithRefactoring = (
  variablesContainer: gdVariablesContainer,
  restore: () => void,
  applyRefactoring: ?ApplyVariablesRefactoring
) => {
  if (!applyRefactoring) {
    restore();
    return;
  }
  variablesContainer.ensurePersistentUuids();
  const identitiesBefore = getVariableIdentities(variablesContainer);
  const originalSerializedVariables = new gd.SerializerElement();
  variablesContainer.serializeTo(originalSerializedVariables);

  restore();

  if (
    haveVariablesBeenRenamedOrRetyped(
      identitiesBefore,
      getVariableIdentities(variablesContainer)
    )
  ) {
    // The uuid of the container itself is not kept when it is restored
    // from a JSON snapshot (an object's variables): the changeset can only
    // be computed between two states of the same container.
    variablesContainer.ensurePersistentUuids();
    originalSerializedVariables.setStringAttribute(
      'persistentUuid',
      variablesContainer.getPersistentUuid()
    );
    const changeset = gd.WholeProjectRefactorer.computeChangesetForVariablesContainer(
      originalSerializedVariables,
      variablesContainer
    );
    applyRefactoring(changeset, originalSerializedVariables);
  }
  originalSerializedVariables.delete();
};

export const getVariablesContainerHistoryTarget = (
  variablesContainer: gdVariablesContainer,
  applyRefactoring: ?ApplyVariablesRefactoring
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
  setValue: (value: Object) =>
    restoreVariablesWithRefactoring(
      variablesContainer,
      () => restoreVariablesContainer(variablesContainer, value),
      applyRefactoring
    ),
});

const restoreVariablesContainer = (
  variablesContainer: gdVariablesContainer,
  value: Object
) => {
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
      const variable = variablesContainer.get(name);
      // Unserializing adds the children to the existing ones: without
      // this, the children of an array would be duplicated (and the
      // removed children of a structure would stay).
      variable.clearChildren();
      unserializeFromJSObject(variable, serialized);
      const currentIndex = variablesContainer.getPosition(name);
      if (currentIndex !== index) variablesContainer.move(currentIndex, index);
    } else {
      const newVariable = variablesContainer.insertNew(name, index);
      unserializeFromJSObject(newVariable, serialized);
    }
  });
};

export const getObjectsContainerHistoryTarget = (
  objectsContainer: gdObjectsContainer,
  project: gdProject,
  ensurePersistentUuidsOfObject: (object: gdObject) => void,
  applyObjectVariablesRefactoring: ?(
    object: gdObject,
    changeset: gdVariablesChangeset,
    originalSerializedVariables: gdSerializerElement
  ) => void
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
        const object = objectsContainer.getObject(name);
        // The behaviors are updated in place (unserializing the whole
        // object would create them again: anything showing or holding a
        // behavior would be reset). Default (capability) behaviors are
        // never serialized: keep them.
        const serializedBehaviors: Array<Object> =
          (serialized && serialized.behaviors) || [];
        const targetBehaviorNames = new Set(
          serializedBehaviors.map(behavior => behavior.name)
        );
        object
          .getAllBehaviorNames()
          .toJSArray()
          .filter(
            behaviorName =>
              !targetBehaviorNames.has(behaviorName) &&
              !object.getBehavior(behaviorName).isDefaultBehavior()
          )
          .forEach(behaviorName => object.removeBehavior(behaviorName));
        restoreVariablesWithRefactoring(
          object.getVariables(),
          () =>
            unserializeFromJSObject(
              object,
              { ...serialized, behaviors: [] },
              'unserializeFrom',
              project
            ),
          applyObjectVariablesRefactoring
            ? (changeset, originalSerializedVariables) =>
                applyObjectVariablesRefactoring(
                  object,
                  changeset,
                  originalSerializedVariables
                )
            : null
        );
        serializedBehaviors.forEach(serializedBehavior => {
          const { name: behaviorName, type: behaviorType } = serializedBehavior;
          if (
            object.hasBehaviorNamed(behaviorName) &&
            object.getBehavior(behaviorName).getTypeName() !== behaviorType
          ) {
            // Not the same behavior anymore: it can't be updated in place.
            object.removeBehavior(behaviorName);
          }
          const behavior = object.hasBehaviorNamed(behaviorName)
            ? object.getBehavior(behaviorName)
            : object.addNewBehavior(project, behaviorType, behaviorName);
          unserializeFromJSObject(behavior, serializedBehavior);
          behavior.setFolded(!!serializedBehavior.isFolded);
        });
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
        const currentIndex = objectGroupsContainer.getPosition(name);
        if (currentIndex !== index)
          objectGroupsContainer.move(currentIndex, index);
      } else {
        const newGroup = objectGroupsContainer.insertNew(name, index);
        unserializeFromJSObject(newGroup, serialized);
      }
    });
  },
});
