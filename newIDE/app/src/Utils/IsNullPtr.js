// @flow

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
 * Guard against use-after-free on C++/WebIDL wrapper objects.
 *
 * When a C++ object exposed via Emscripten is destroyed (`.delete()`),
 * its JavaScript wrapper remains in memory but with `ptr` set to 0.
 * Any subsequent method call on that wrapper throws a `UseAfterFreeError`.
 *
 * In theory, callers should always set their JS reference to `null`
 * before calling `.delete()`, so stale wrappers should never be
 * reachable.  In practice, React 18's batched / concurrent rendering
 * can allow a stale non-null reference to survive into a render that
 * runs after the C++ side has already been torn down.
 *
 * This helper turns such a dangling wrapper back into `null`, so it
 * can be applied at the point where a value is derived from state,
 * protecting every downstream consumer without per-call-site checks.
 */
export const exceptionallyGuardAgainstNullPtr = <T>(obj: ?T): ?T => {
  // $FlowFixMe[prop-missing] - ptr is an Emscripten internal property present on all WebIDL wrappers.
  if (obj && obj.ptr === 0) return null;
  return obj;
};

const gd: libGDevelop = global.gd;

/**
 * Check if a C++ object from a tracked class has been destroyed on the C++
 * side (e.g. because a parent container removed/deleted it), even though the
 * JavaScript wrapper still exists with a non-zero `ptr`.
 *
 * This relies on the `MemoryTrackedRegistry` that libGD.js maintains for
 * certain classes (EffectsContainer, Layout, etc.).  When such an object is
 * destroyed from C++ (for instance when `LayersContainer.removeLayer` frees a
 * layer and its effects container), the registry marks the pointer as dead.
 *
 * Use this at the top of React render functions that receive a tracked C++
 * object as a prop — if `true`, return early / render nothing so that no
 * method call is attempted on the dead wrapper.
 */
export const isCppObjectDestroyedOnCppSide = (
  obj: any,
  trackedClassName: string
): boolean => {
  if (!obj || !obj.ptr) return true;
  try {
    return gd.MemoryTrackedRegistry.isDead(obj.ptr, trackedClassName);
  } catch {
    // If MemoryTrackedRegistry is not available (e.g. in tests), fall back
    // to assuming the object is alive.
    return false;
  }
};
