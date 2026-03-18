// @flow

const gd: libGDevelop = global.gd;

/**
 * Check if the Emscripten object is actually a null pointer.
 *
 * You should normally not use this - instead prefer the null/empty object pattern,
 * with a function `IsBadXxx` to check if the object you're manipulating represents
 * an null/empty object.
 */
export const isNullPtr = (
  gd: libGDevelop,
  object: gdEmscriptenObject
): boolean => gd.getPointer(object) === 0;

/**
 * Guard against dead (destroyed) C++/WebIDL wrapper objects.
 *
 * In theory, a dead object should never be accessed, but this can help
 * prevent stale references to objects (deleted by JS: ptr will be 0,
 * or deleted in C++, only for tracked classes).
 * This is used just to add extra protection and should usually not be useful.
 *
 * - If the object is null/undefined, returns null.
 * - If the object is dead (detected via gd.assertObjectAlive), returns null
 *   and logs a warning with the exception.
 * - Otherwise returns the object as-is.
 */
export const exceptionallyGuardAgainstDeadObject = <T>(obj: ?T): ?T => {
  if (!obj) return null;

  try {
    // $FlowFixMe[incompatible-type] - obj is an Emscripten wrapper object.
    gd.assertObjectAlive(obj);
  } catch (exception) {
    if (exception.name && exception.name === 'UseAfterFreeError') {
      console.warn(
        'Detected a dead object being accessed - returning null instead.',
        exception
      );
      return null;
    }

    throw exception;
  }

  return obj;
};
