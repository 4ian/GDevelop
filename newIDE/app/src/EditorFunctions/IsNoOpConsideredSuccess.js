// @flow

/**
 * Whether a "nothing changed because the requested state is already the current
 * state" outcome must be reported as a SUCCESS.
 *
 * From tools v12 (script-based agents), a no-op IS a success: a script stops at
 * the first failed call, so re-running an idempotent call (e.g. setting a value
 * it already has) must not kill the whole script — the desired state is
 * achieved. Before v12 (individual tool calls), the pedantic failure is kept:
 * it is useful feedback and shipped behavior must not change.
 *
 * Every no-op call site goes through THIS single function (never an inline
 * version check), so the behavior is greppable, testable in one place, and
 * easy to monitor or flip.
 *
 * Parsing mirrors the backend's `isToolsVersionInRange` (numeric compare of the
 * `vN` suffix), but an unknown/missing version is treated as pre-v12 (keep the
 * failure) rather than passing.
 */
export const isNoOpConsideredSuccess = (toolsVersion: ?string): boolean => {
  if (!toolsVersion) return false;
  const versionNumber = parseInt(String(toolsVersion).replace('v', ''), 10);
  if (Number.isNaN(versionNumber)) return false;
  return versionNumber >= 12;
};
