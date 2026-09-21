// @flow
import { mapFor } from '../Utils/MapFor';

const gd: libGDevelop = global.gd;

// Keep snapshots bounded for expression-heavy behaviors/objects.
const MAX_ENTRIES_PER_TYPE = 40;

/**
 * One readable state entry: `name` is the event-sheet name of a condition or
 * expression ('IsOnFloor', 'CurrentSpeed', 'PropertyHealth'...) and
 * `functionName` the runtime method the gameplay test harness evaluates on
 * the object or behavior instance.
 */
export type GameplayTestStateInspectorEntry = {|
  name: string,
  functionName: string,
  kind: 'boolean' | 'number' | 'string',
|};

/**
 * The state inspectors for the behavior and object types used in a project,
 * derived from the extensions' own declarations (single source of truth:
 * built-in, TS-based and events-based extensions all declare their
 * conditions/expressions the same way). Sent with the gameplay test run
 * payload so snapshots can expose a readable `state`.
 */
export type GameplayTestStateInspectors = {|
  behaviors: { [behaviorType: string]: Array<GameplayTestStateInspectorEntry> },
  objects: { [objectType: string]: Array<GameplayTestStateInspectorEntry> },
|};

const shortName = (fullType: string): string => {
  const separatorIndex = fullType.lastIndexOf('::');
  return separatorIndex === -1
    ? fullType
    : fullType.substring(separatorIndex + 2);
};

/**
 * Whether the instruction/expression can be blindly evaluated on an instance:
 * its only parameters are the implicit ones — the object (and the behavior
 * when `isBehavior`) for built-in declarations, or nothing at all plus the
 * code-only `eventsFunctionContext` for events-based functions (their
 * generated methods tolerate its absence). Anything else (comparison
 * operands, target objects, a code-only scene...) would need arguments we
 * cannot invent.
 */
const hasOnlyImplicitParameters = (
  metadata: gdInstructionMetadata | gdExpressionMetadata,
  isBehavior: boolean
): boolean => {
  let userParameterIndex = 0;
  for (let index = 0; index < metadata.getParametersCount(); index++) {
    const parameter = metadata.getParameter(index);
    if (parameter.isCodeOnly()) {
      if (parameter.getType() !== 'eventsFunctionContext') return false;
      continue;
    }
    if (userParameterIndex === 0) {
      if (!gd.ParameterMetadata.isObject(parameter.getType())) return false;
    } else if (userParameterIndex === 1 && isBehavior) {
      if (parameter.getType() !== 'behavior') return false;
    } else {
      return false;
    }
    userParameterIndex++;
  }
  return isBehavior
    ? userParameterIndex === 2 || userParameterIndex === 0
    : userParameterIndex <= 1;
};

/**
 * Property getters of events-based behaviors/objects are declared hidden and
 * private (they are internal to the extension), but they ARE the state a
 * test wants to inspect ('PropertyHealth', 'SharedPropertyMaxLives'...):
 * they get an exception to the hidden/private filter.
 */
const isPropertyGetterName = (name: string): boolean =>
  name.startsWith('Property') || name.startsWith('SharedProperty');

const pushConditionEntries = (
  entries: Array<GameplayTestStateInspectorEntry>,
  conditions: gdMapStringInstructionMetadata,
  isBehavior: boolean
) => {
  const conditionTypes = conditions.keys();
  for (let i = 0; i < conditionTypes.size(); i++) {
    const metadata = conditions.get(conditionTypes.at(i));
    const name = shortName(conditionTypes.at(i));
    if (
      (metadata.isHidden() || metadata.isPrivate()) &&
      !isPropertyGetterName(name)
    )
      continue;
    if (!hasOnlyImplicitParameters(metadata, isBehavior)) continue;
    const functionName = metadata.getFunctionName();
    if (!functionName) continue;
    if (entries.some(entry => entry.name === name)) continue;
    entries.push({ name, functionName, kind: 'boolean' });
  }
};

const pushExpressionEntries = (
  entries: Array<GameplayTestStateInspectorEntry>,
  expressions: gdMapStringExpressionMetadata,
  isBehavior: boolean,
  kind: 'number' | 'string'
) => {
  const expressionTypes = expressions.keys();
  for (let i = 0; i < expressionTypes.size(); i++) {
    const metadata = expressions.get(expressionTypes.at(i));
    const name = shortName(expressionTypes.at(i));
    if (
      (!metadata.isShown() || metadata.isPrivate()) &&
      !isPropertyGetterName(name)
    )
      continue;
    if (!hasOnlyImplicitParameters(metadata, isBehavior)) continue;
    const functionName = metadata.getFunctionName();
    if (!functionName) continue;
    if (entries.some(entry => entry.name === name)) continue;
    entries.push({ name, functionName, kind });
  }
};

const enumerateForType = (
  type: string,
  isBehavior: boolean
): Array<GameplayTestStateInspectorEntry> => {
  const entries: Array<GameplayTestStateInspectorEntry> = [];
  const allExtensions = gd
    .asPlatform(gd.JsPlatform.get())
    .getAllPlatformExtensions();
  for (let i = 0; i < allExtensions.size(); i++) {
    const extension = allExtensions.at(i);
    pushConditionEntries(
      entries,
      isBehavior
        ? extension.getAllConditionsForBehavior(type)
        : extension.getAllConditionsForObject(type),
      isBehavior
    );
    pushExpressionEntries(
      entries,
      isBehavior
        ? extension.getAllExpressionsForBehavior(type)
        : extension.getAllExpressionsForObject(type),
      isBehavior,
      'number'
    );
    pushExpressionEntries(
      entries,
      isBehavior
        ? extension.getAllStrExpressionsForBehavior(type)
        : extension.getAllStrExpressionsForObject(type),
      isBehavior,
      'string'
    );
  }
  return entries.slice(0, MAX_ENTRIES_PER_TYPE);
};

/**
 * Collect the object types and behavior types used in the project: global
 * objects, every scene's objects, and the child objects of events-based
 * (custom) objects.
 */
const getUsedTypes = (
  project: gdProject
): {| behaviorTypes: Set<string>, objectTypes: Set<string> |} => {
  const behaviorTypes: Set<string> = new Set();
  const objectTypes: Set<string> = new Set();

  const visitObjectsContainer = (objectsContainer: gdObjectsContainer) => {
    mapFor(0, objectsContainer.getObjectsCount(), i => {
      const object = objectsContainer.getObjectAt(i);
      objectTypes.add(object.getType());
      const behaviorNames = object.getAllBehaviorNames();
      mapFor(0, behaviorNames.size(), j => {
        const behavior = object.getBehavior(behaviorNames.at(j));
        behaviorTypes.add(behavior.getTypeName());
      });
    });
  };

  visitObjectsContainer(project.getObjects());
  mapFor(0, project.getLayoutsCount(), i => {
    visitObjectsContainer(project.getLayoutAt(i).getObjects());
  });
  // Child objects of events-based (custom) objects: their snapshots appear
  // as `children` of custom object instances.
  mapFor(0, project.getEventsFunctionsExtensionsCount(), i => {
    const eventsFunctionsExtension = project.getEventsFunctionsExtensionAt(i);
    const eventsBasedObjects = eventsFunctionsExtension.getEventsBasedObjects();
    mapFor(0, eventsBasedObjects.getCount(), j => {
      visitObjectsContainer(eventsBasedObjects.getAt(j).getObjects());
    });
  });

  return { behaviorTypes, objectTypes };
};

/**
 * Derive the state inspectors for every behavior and object type used in the
 * project, from the extensions metadata: the zero-parameter conditions (as
 * booleans) and expressions (as numbers/strings) that the gameplay test
 * harness can evaluate on live instances, under their event-sheet names.
 */
export const enumerateGameplayTestStateInspectors = (
  project: gdProject
): GameplayTestStateInspectors => {
  const { behaviorTypes, objectTypes } = getUsedTypes(project);

  const behaviors: {
    [behaviorType: string]: Array<GameplayTestStateInspectorEntry>,
  } = {};
  for (const behaviorType of behaviorTypes) {
    const entries = enumerateForType(behaviorType, true);
    if (entries.length > 0) behaviors[behaviorType] = entries;
  }
  const objects: {
    [objectType: string]: Array<GameplayTestStateInspectorEntry>,
  } = {};
  for (const objectType of objectTypes) {
    const entries = enumerateForType(objectType, false);
    if (entries.length > 0) objects[objectType] = entries;
  }
  return { behaviors, objects };
};
