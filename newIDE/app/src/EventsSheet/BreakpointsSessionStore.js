// @flow
// Session-scoped breakpoint storage. Lives at module level so breakpoints
// survive EventsSheet remounts (tab close/reopen, scope switch) for the
// lifetime of the editor process.
//
// Keyed by the root `gdEventsList` pointer of each events sheet (scene or
// extension function). Values hold a reference to the live `gdEventsList` and
// the scope's `functionId`, so that on preview launch we can rebuild the
// flat-index payload for *every* sheet that has breakpoints — not just the
// currently mounted one.

interface EventsListLike {
  +ptr: number;
  getEventsCount(): number;
  getEventAt(index: number): any;
}

type Entry = {|
  events: EventsListLike,
  functionId: string,
  breakpoints: Set<number>,
|};

const entries: Map<number, Entry> = new Map();

export const getBreakpoints = (eventsListPtr: number): Set<number> => {
  const entry = entries.get(eventsListPtr);
  return entry ? new Set(entry.breakpoints) : new Set();
};

// Upsert the entry: remember the live events list + functionId so the store
// can send breakpoints for sheets that aren't currently mounted. Deletes the
// entry when the breakpoint set is empty to keep the map compact.
export const updateEntry = (
  eventsListPtr: number,
  events: EventsListLike,
  functionId: string,
  breakpoints: Set<number>
): void => {
  if (breakpoints.size === 0) {
    entries.delete(eventsListPtr);
    return;
  }
  entries.set(eventsListPtr, {
    events,
    functionId,
    breakpoints: new Set(breakpoints),
  });
};

// DFS walk matching C++ GenerateEventsListCode order: skips disabled and
// non-executable events, and (transparently) the synthetic AsyncEvent wrappers
// since those don't appear in the user-authored tree. The `path` is the
// slash-separated sequence of sibling indices (e.g. "0/2/1"), matching the
// EventPath format used across EventsSheet.
export const walkEventsInGeneratorOrder = (
  events: EventsListLike,
  visit: (event: any, flatIndex: number, path: string) => void
): void => {
  let index = 0;

  const walk = (list: EventsListLike, pathPrefix: string) => {
    for (let i = 0; i < list.getEventsCount(); i++) {
      const event = list.getEventAt(i);
      const path = pathPrefix ? `${pathPrefix}/${i}` : `${i}`;
      if (event.isDisabled() || !event.isExecutable()) continue;
      visit(event, index, path);
      index++;
      if (event.canHaveSubEvents()) walk(event.getSubEvents(), path);
    }
  };
  walk(events, '');
};

const buildPtrToFlatIndex = (events: EventsListLike): Map<number, number> => {
  const map = new Map<number, number>();
  walkEventsInGeneratorOrder(events, (event, idx) => {
    map.set(event.ptr, idx);
  });
  return map;
};

export type BreakpointsPayloadEntry = {|
  functionId: string,
  eventIndices: Array<number>,
|};

// Builds the full setBreakpoints payload across all registered sheets.
// Entries with no resolvable indices (e.g. events deleted) are skipped.
export const buildAllBreakpointsPayload = (): Array<BreakpointsPayloadEntry> => {
  const payload: Array<BreakpointsPayloadEntry> = [];
  entries.forEach(entry => {
    if (entry.breakpoints.size === 0) return;
    const ptrMap = buildPtrToFlatIndex(entry.events);
    const eventIndices: Array<number> = [];
    entry.breakpoints.forEach(ptr => {
      const idx = ptrMap.get(ptr);
      if (idx !== undefined) eventIndices.push(idx);
    });
    if (eventIndices.length > 0) {
      payload.push({ functionId: entry.functionId, eventIndices });
    }
  });
  return payload;
};
