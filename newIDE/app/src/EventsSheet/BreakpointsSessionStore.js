// @flow
// Session-scoped breakpoint storage. Lives at module level so breakpoints
// survive EventsSheet remounts (tab close/reopen, scope switch) for the
// lifetime of the editor process.
//
// Breakpoints are keyed by the scope's `functionId` and stored as a set of
// stable event UUIDs. No wasm pointers are retained, so deleting scenes or
// extensions (or undo/redo) can never cause a use-after-free.

// A set of persistent event UUIDs, per events-function id.
const entries: Map<string, Set<string>> = new Map();

export const clearBreakpointsSession = (): void => {
  entries.clear();
};

export const getBreakpoints = (functionId: string): Set<string> => {
  const set = entries.get(functionId);
  return set ? new Set(set) : new Set();
};

// Upsert the entry for a sheet. Deletes it when the breakpoint set is empty to
// keep the map compact (and so an empty sheet is not sent to the runtime).
export const updateEntry = (
  functionId: string,
  breakpoints: Set<string>
): void => {
  if (!functionId || breakpoints.size === 0) {
    entries.delete(functionId);
    return;
  }
  entries.set(functionId, new Set(breakpoints));
};

export type BreakpointsPayloadEntry = {|
  functionId: string,
  eventIds: Array<string>,
|};

// Builds the full setBreakpoints payload across all registered sheets.
export const buildAllBreakpointsPayload = (): Array<BreakpointsPayloadEntry> => {
  const payload: Array<BreakpointsPayloadEntry> = [];
  entries.forEach((eventIds, functionId) => {
    if (eventIds.size === 0) return;
    payload.push({ functionId, eventIds: Array.from(eventIds) });
  });
  return payload;
};
