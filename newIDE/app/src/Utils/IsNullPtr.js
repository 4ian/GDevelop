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
 * In theory this should never happen: `closeProject` in MainFrame awaits
 * a state update that sets `currentProject` to `null` *before* calling
 * `.delete()`, so every child component should re-render with `null`
 * before the C++ memory is freed.  In practice, React 18's batched /
 * concurrent rendering can allow a stale non-null reference to survive
 * into a render that runs after the C++ side has already been torn down.
 *
 * This helper lets us turn such a dangling wrapper back into `null` at
 * the single point where the value is derived from state, protecting
 * every downstream consumer without requiring per-call-site checks.
 */
export const exceptionallyGuardAgainstNullPtr = <T: { ptr: number }>(
  obj: ?T
): ?T => {
  if (obj && obj.ptr === 0) return null;
  return obj;
};
