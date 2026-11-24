// @flow
import { SafeExtractor } from '../Utils/SafeExtractor';
import {
  serializeToJSObject,
  unserializeFromJSObject,
} from '../Utils/Serializer';
import {
  parseScopeArgument,
  resolveScope,
  type ResolvedScope,
  type ToolScopeType,
} from './Scope';

const gd: libGDevelop = global.gd;

/**
 * `change_scene_properties_layers_effects_groups.move_instances`: move the
 * instances of a scene or an external layout to another scene or external
 * layout, keeping everything (position, layer, z-order, size, rotations,
 * flips, opacity, visibility, locks, per-instance variables and the id).
 * A move, not a copy: the ids from `describe_instances` stay valid.
 *
 * Atomic: everything is validated (the objects and layers of the moved
 * instances must exist in the target) before anything is moved.
 */

/** The containers instances can be moved between: a scene or an external layout. */
export const MOVE_INSTANCES_SCOPE_TYPES: Array<ToolScopeType> = [
  'scene',
  'external_layout',
];

export type MoveInstancesOutputFields = {|
  movedInstancesCount: number,
  movedInstancesCountByObjectName: { [objectName: string]: number },
|};

export type MoveInstancesResult =
  | {| success: false, message: string |}
  | {|
      success: true,
      message: string,
      targetScope: ResolvedScope,
      ...MoveInstancesOutputFields,
    |};

const listQuoted = (names: Array<string>): string =>
  names.map(name => `"${name}"`).join(', ');

const iterateOnInstances = (
  initialInstances: gdInitialInstancesContainer,
  callback: gdInitialInstance => void
) => {
  const instanceGetter = new gd.InitialInstanceJSFunctor();
  // $FlowFixMe[cannot-write]
  instanceGetter.invoke = instancePtr => {
    const instance: gdInitialInstance = gd.wrapPointer(
      // $FlowFixMe[incompatible-type]
      instancePtr,
      gd.InitialInstance
    );
    callback(instance);
  };
  // $FlowFixMe[incompatible-type]
  initialInstances.iterateOverInstances(instanceGetter);
  instanceGetter.delete();
};

/**
 * Read an optional array of non-empty strings (the base layer, named "", is
 * the exception for `filter_by_layer_names`), or null when absent.
 * Throws with a teaching message on anything else.
 */
const extractOptionalStringArray = (
  args: any,
  propertyName: string,
  { allowEmptyStrings }: {| allowEmptyStrings: boolean |}
): Array<string> | null => {
  if (args[propertyName] === undefined || args[propertyName] === null)
    return null;
  const values = SafeExtractor.extractStringArrayProperty(args, propertyName);
  if (!values) {
    throw new Error(
      `\`move_instances.${propertyName}\` must be an array of strings.`
    );
  }
  if (!allowEmptyStrings && values.some(value => value === '')) {
    throw new Error(
      `\`move_instances.${propertyName}\` must not contain empty strings.`
    );
  }
  return values;
};

const getScopeInstancesContainer = (
  resolvedScope: ResolvedScope
): gdInitialInstancesContainer | null =>
  (resolvedScope.layout || resolvedScope.externalLayout) &&
  !resolvedScope.variant
    ? resolvedScope.initialInstances || null
    : null;

const doesTargetHaveObject = (
  targetScope: ResolvedScope,
  objectName: string
): boolean => {
  const { objectsContainer, globalObjectsContainer } = targetScope;
  return (
    (!!objectsContainer && objectsContainer.hasObjectNamed(objectName)) ||
    (!!globalObjectsContainer &&
      globalObjectsContainer.hasObjectNamed(objectName))
  );
};

export const moveInstancesToScope = ({
  project,
  sourceScope,
  moveInstancesArgs,
}: {|
  project: gdProject,
  sourceScope: ResolvedScope,
  moveInstancesArgs: any,
|}): MoveInstancesResult => {
  const sourceInstances = getScopeInstancesContainer(sourceScope);
  if (!sourceInstances) {
    return {
      success: false,
      message: `\`move_instances\` moves the instances of a scene or of an external layout: it is not available on ${
        sourceScope.label
      }.`,
    };
  }

  // The target.
  let targetScope: ResolvedScope;
  try {
    const parsedTargetScope = parseScopeArgument(
      { scope: moveInstancesArgs.to_scope },
      { allowedTypes: MOVE_INSTANCES_SCOPE_TYPES }
    );
    if (!parsedTargetScope) {
      throw new Error(
        '`move_instances.to_scope` is required: { type: "scene", scene_name } or { type: "external_layout", external_layout_name }.'
      );
    }
    const resolvedTargetScope = resolveScope(project, parsedTargetScope);
    if (resolvedTargetScope.success === false) {
      throw new Error(
        `\`move_instances.to_scope\`: ${resolvedTargetScope.message}`
      );
    }
    targetScope = resolvedTargetScope;
  } catch (error) {
    return { success: false, message: error.message };
  }
  const targetInstances = getScopeInstancesContainer(targetScope);
  const targetLayersContainer = targetScope.layersContainer;
  if (!targetInstances || !targetLayersContainer) {
    return {
      success: false,
      message: `\`move_instances.to_scope\`: ${
        targetScope.label
      } cannot hold instances.`,
    };
  }
  if (targetInstances.ptr === sourceInstances.ptr) {
    return {
      success: false,
      message: `\`move_instances.to_scope\` is the same container as \`scope\` (${
        sourceScope.label
      }): nothing to move. To change the layer of instances, use \`put_2d_instances\`/\`put_3d_instances\` with \`existing_instance_ids\`.`,
    };
  }

  // The filters.
  let objectNames: Array<string> | null;
  let layerNames: Array<string> | null;
  let instanceIds: Array<string> | null;
  try {
    objectNames = extractOptionalStringArray(
      moveInstancesArgs,
      'filter_by_object_names',
      { allowEmptyStrings: false }
    );
    layerNames = extractOptionalStringArray(
      moveInstancesArgs,
      'filter_by_layer_names',
      { allowEmptyStrings: true }
    );
    instanceIds = extractOptionalStringArray(
      moveInstancesArgs,
      'instance_ids',
      { allowEmptyStrings: false }
    );
  } catch (error) {
    return { success: false, message: error.message };
  }
  const objectNamesSet = objectNames ? new Set(objectNames) : null;
  const layerNamesSet = layerNames ? new Set(layerNames) : null;
  const notFoundInstanceIds = new Set<string>(instanceIds || []);

  // Select the instances to move.
  const instancesToMove: Array<gdInitialInstance> = [];
  iterateOnInstances(sourceInstances, instance => {
    if (objectNamesSet && !objectNamesSet.has(instance.getObjectName())) return;
    if (layerNamesSet && !layerNamesSet.has(instance.getLayer())) return;
    if (instanceIds) {
      const foundInstanceId = instanceIds.find(id =>
        instance.getPersistentUuid().startsWith(id)
      );
      if (!foundInstanceId) return;
      notFoundInstanceIds.delete(foundInstanceId);
    }
    instancesToMove.push(instance);
  });
  if (notFoundInstanceIds.size > 0) {
    return {
      success: false,
      message: `\`move_instances.instance_ids\` not found in ${
        sourceScope.label
      }${
        objectNamesSet || layerNamesSet ? ' (with the given filters)' : ''
      }: ${listQuoted([
        ...notFoundInstanceIds,
      ])}. Nothing was moved. Get the ids from \`describe_instances\` on this scope.`,
    };
  }

  const filtersLabel = [
    objectNames ? `of object(s) ${listQuoted(objectNames)}` : null,
    layerNames
      ? `on layer(s) ${listQuoted(
          layerNames.map(name => (name === '' ? '(base layer)' : name))
        )}`
      : null,
    instanceIds ? `with the given ids` : null,
  ]
    .filter(Boolean)
    .join(', ');
  if (instancesToMove.length === 0) {
    return {
      success: true,
      message: `No instance ${filtersLabel || ''} to move in ${
        sourceScope.label
      }: nothing was moved.`.replace('  ', ' '),
      targetScope,
      movedInstancesCount: 0,
      movedInstancesCountByObjectName: {},
    };
  }

  // Validate against the target before moving anything.
  const missingObjectNames = new Set<string>();
  const missingLayerNames = new Set<string>();
  instancesToMove.forEach(instance => {
    if (!doesTargetHaveObject(targetScope, instance.getObjectName()))
      missingObjectNames.add(instance.getObjectName());
    if (!targetLayersContainer.hasLayerNamed(instance.getLayer()))
      missingLayerNames.add(instance.getLayer());
  });
  if (missingObjectNames.size > 0 || missingLayerNames.size > 0) {
    return {
      success: false,
      message:
        `Cannot move these instances to ${targetScope.label}: ` +
        [
          missingObjectNames.size > 0
            ? `it has no object named ${listQuoted(
                [...missingObjectNames].sort()
              )}${targetScope.globalObjectsContainer ? ' (nor globally)' : ''}`
            : null,
          missingLayerNames.size > 0
            ? `it has no layer named ${listQuoted(
                [...missingLayerNames].sort()
              )}`
            : null,
        ]
          .filter(Boolean)
          .join(' and ') +
        `. Nothing was moved. Create the missing objects/layers in the target first (or exclude these instances with the filters). An external layout uses the objects and layers of its associated scene.`,
    };
  }

  // Move: serialize, insert in the target (the id is kept), remove from the source.
  const movedInstancesCountByObjectName: { [objectName: string]: number } = {};
  instancesToMove.forEach(instance => {
    const serializedInstance = serializeToJSObject(instance);
    const newInstance = new gd.InitialInstance();
    unserializeFromJSObject(
      newInstance,
      serializedInstance,
      'unserializeFrom',
      project
    );
    targetInstances.insertInitialInstance(newInstance);
    newInstance.delete();

    const objectName = instance.getObjectName();
    movedInstancesCountByObjectName[objectName] =
      (movedInstancesCountByObjectName[objectName] || 0) + 1;
  });
  instancesToMove.forEach(instance => {
    sourceInstances.removeInstance(instance);
  });

  const movedInstancesCount = instancesToMove.length;
  return {
    success: true,
    message: `Moved ${movedInstancesCount} instance(s)${
      filtersLabel ? ` ${filtersLabel}` : ''
    } from ${sourceScope.label} to ${
      targetScope.label
    } (positions, layers and ids unchanged): ${Object.keys(
      movedInstancesCountByObjectName
    )
      .sort()
      .map(
        objectName =>
          `${movedInstancesCountByObjectName[objectName]} ${objectName}`
      )
      .join(', ')}.`,
    targetScope,
    movedInstancesCount,
    movedInstancesCountByObjectName,
  };
};
