// @flow
import newNameGenerator from '../../Utils/NewNameGenerator';
import {
  isLifecycleFunction,
  type FunctionOwner,
} from '../SimplifiedProject/SimplifiedExtensions';

const gd: libGDevelop = global.gd;

export type { FunctionOwner };

/** A value read from the arguments of a call, or the reason it can't be used. */
export type ParsedValue<T> =
  | {| success: true, value: T |}
  | {| success: false, message: string |};

/**
 * The lifecycle functions called by the game engine, per owner. They are the
 * only functions that can be created with these names (and only on the right
 * owner): `gd.MetadataDeclarationHelper` also accepts a few legacy names that
 * are not offered anymore.
 */
const LIFECYCLE_FUNCTION_NAMES: { [FunctionOwner]: Array<string> } = {
  extension: [
    'onFirstSceneLoaded',
    'onSceneLoaded',
    'onScenePreEvents',
    'onScenePostEvents',
    'onScenePaused',
    'onSceneResumed',
    'onSceneUnloading',
  ],
  behavior: [
    'onCreated',
    'onActivate',
    'onDeActivate',
    'doStepPreEvents',
    'doStepPostEvents',
    'onDestroy',
  ],
  object: ['onCreated', 'doStepPostEvents', 'onDestroy', 'onHotReloading'],
};

export const getLifecycleFunctionNames = (
  owner: FunctionOwner
): Array<string> => LIFECYCLE_FUNCTION_NAMES[owner] || [];

export const isLifecycleFunctionName = (
  owner: FunctionOwner,
  functionName: string
): boolean => isLifecycleFunction(gd, owner, functionName);

/**
 * The name to actually use for a new item: the requested one made safe (no
 * space, no special character...) and suffixed until it's free.
 */
export const getSafeUniqueName = (
  requestedName: string,
  isTaken: (name: string) => boolean
): string => newNameGenerator(gd.Project.getSafeName(requestedName), isTaken);

/** Tells the caller the name it asked for was changed, or null when it wasn't. */
export const renamedMessage = (
  requestedName: string,
  finalName: string
): string | null =>
  requestedName === finalName
    ? null
    : `Requested name "${requestedName}" was already taken or not a valid name; use "${finalName}" from now on.`;

/** The values quoted and comma-separated, for messages (`none` when empty). */
export const listQuoted = (values: $ReadOnlyArray<string>): string =>
  values.length > 0 ? values.map(value => `"${value}"`).join(', ') : 'none';

/**
 * The `new_name` of a call, or null when absent, empty or equal to the current
 * name (an empty `new_name` means "no rename", like in the backend checks).
 */
export const getRequestedNewName = (
  args: any,
  currentName: string
): string | null => {
  const newName =
    args && typeof args.new_name === 'string' ? args.new_name.trim() : '';
  return newName && newName !== currentName ? newName : null;
};

// The value as it can be shown in a message: `"blue"`, `12`, `null`...
const describeValue = (value: mixed): string =>
  typeof value === 'string' ? `"${value}"` : String(value);

/** `true`/`false`, as a boolean or as a string. */
export const parseBoolean = (
  value: mixed,
  settingName: string
): ParsedValue<boolean> => {
  if (typeof value === 'boolean') return { success: true, value };
  if (typeof value === 'string') {
    const lowerCasedValue = value.trim().toLowerCase();
    if (lowerCasedValue === 'true') return { success: true, value: true };
    if (lowerCasedValue === 'false') return { success: true, value: false };
  }
  return {
    success: false,
    message: `\`${settingName}\` must be true or false (got ${describeValue(
      value
    )}).`,
  };
};

/** An optional `true`/`false` argument of a call: `null` when not given. */
export const readOptionalBoolean = (
  args: any,
  fieldName: string
): ParsedValue<boolean | null> => {
  const value = args ? args[fieldName] : undefined;
  if (value === undefined || value === null)
    return { success: true, value: null };
  const parsedValue = parseBoolean(value, fieldName);
  return parsedValue.success
    ? { success: true, value: parsedValue.value }
    : parsedValue;
};

/** A number, as a number or as a string like "12.5". */
export const parseNumber = (
  value: mixed,
  settingName: string
): ParsedValue<number> => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return { success: true, value };
  }
  if (typeof value === 'string' && value.trim() !== '') {
    const parsedValue = Number(value);
    if (Number.isFinite(parsedValue)) {
      return { success: true, value: parsedValue };
    }
  }
  return {
    success: false,
    message: `\`${settingName}\` must be a number (got ${describeValue(
      value
    )}).`,
  };
};

/** One of `allowedValues`, or a failure listing them all. */
export const getEnumSettingValue = <T: string>(
  value: mixed,
  allowedValues: Array<T>,
  settingName: string
): ParsedValue<T> => {
  if (typeof value === 'string') {
    const allowedValue = allowedValues.find(
      someValue => someValue === value.trim()
    );
    if (allowedValue !== undefined) {
      return { success: true, value: allowedValue };
    }
  }
  return {
    success: false,
    message: `\`${settingName}\` must be one of ${listQuoted(
      allowedValues
    )} (got ${describeValue(value)}).`,
  };
};
