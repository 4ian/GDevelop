// @flow

/**
 * What marks a step of an inspector path as an instance of an object, looked
 * up by its runtime identifier: `#42`.
 *
 * Instances used to be addressed by their position in the list of the scene,
 * which moves as soon as one instance is created or destroyed: the inspector
 * then silently showed another instance than the one selected. The identifier
 * of a runtime object never changes while it lives, so it is what the paths
 * carry, and both the editor and the running game resolve it the same way.
 */
export const INSTANCE_PATH_PREFIX = '#';

/** The step of a path addressing this instance. */
export const makeInstancePathStep = (instanceId: number | string): string =>
  `${INSTANCE_PATH_PREFIX}${instanceId}`;

/** The identifier carried by a step, or null when it addresses nothing. */
export const getInstanceIdFromPathStep = (step: string): number | null => {
  if (typeof step !== 'string' || !step.startsWith(INSTANCE_PATH_PREFIX)) {
    return null;
  }
  const instanceId = Number(step.slice(INSTANCE_PATH_PREFIX.length));
  return Number.isNaN(instanceId) ? null : instanceId;
};

/** One step down: an instance by its identifier, or a plain property. */
export const resolveInspectorPathStep = (value: any, step: string): any => {
  if (value === null || value === undefined) return undefined;

  const instanceId = getInstanceIdFromPathStep(step);
  if (instanceId !== null && Array.isArray(value)) {
    return value.find(instance => !!instance && instance.id === instanceId);
  }
  return value[step];
};

/**
 * What is at this path, `null` when the path leads nowhere. `path` can be a
 * single step, as the inspectors describe their own key.
 */
export const getAtInspectorPath = (
  value: any,
  path: string | Array<string>
): any => {
  const steps = Array.isArray(path) ? path : [path];
  let currentValue = value;
  for (const step of steps) {
    currentValue = resolveInspectorPathStep(currentValue, step);
    if (currentValue === undefined) return null;
  }
  return currentValue === undefined ? null : currentValue;
};
