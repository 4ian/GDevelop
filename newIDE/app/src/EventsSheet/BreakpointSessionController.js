// @flow
import {
  onPreviewDebuggerClosed,
  setPreviewBreakpointsViaCdp,
  isElectronCDPBridgeAvailable,
} from '../Debugger/ElectronCDPBridge';
import {
  subscribeToBreakpointDebuggerSession,
  getBreakpointDebuggerSessionState,
  resumeBreakpointDebugger,
  stepBreakpointDebugger,
  type BreakpointDebuggerSessionState,
} from '../Debugger/BreakpointDebuggerSession';
import {
  getBreakpoints as getSessionBreakpoints,
  updateEntry as updateBreakpointsSessionEntry,
  buildAllBreakpointsPayload,
  markPersistentUuidsAssigned,
} from './BreakpointsSessionStore';
import { type EventsScope } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const NON_BREAKPOINTABLE_TYPES = [
  'BuiltinCommonInstructions::Comment',
  'BuiltinCommonInstructions::Group',
];

export const isBreakpointableEvent = (event: gdBaseEvent): boolean =>
  event.isExecutable() && !NON_BREAKPOINTABLE_TYPES.includes(event.getType());

// Whether a scope's events run as instrumented code the preview debugger can
// pause on. External events (inlined into scenes) and behavior methods (built
// for runtime, uninstrumented) can't; anything else needs a function id.
export const canScopeHoldBreakpoints = (scope: EventsScope): boolean => {
  if (scope.externalEvents) return false;
  if (scope.eventsBasedBehavior) return false;
  return getFunctionIdFromScope(scope) !== '';
};

// Namespace prefix the code generator uses for extension (free-function or
// custom-object method) code, as opposed to top-level scene code. Mirrors
// the runtime's own `DebuggerBreakpointManager._isExtensionScope`.
const EXTENSION_FUNCTION_ID_PREFIX = 'gdjs.evtsExt__';

export const isExtensionFunctionId = (functionId: string): boolean =>
  functionId.startsWith(EXTENSION_FUNCTION_ID_PREFIX);

// Resolves the runtime function/scene namespace for a scope, matching the id
// the code generator stamps into `checkBreakpoint` calls.
const getFunctionIdFromScope = (scope: EventsScope): string => {
  const { eventsFunctionsExtension, eventsFunction } = scope;
  if (eventsFunctionsExtension && eventsFunction) {
    const prefix = gd.MetadataDeclarationHelper.getExtensionCodeNamespacePrefix(
      eventsFunctionsExtension
    );
    // Method of a custom (events-based) object: the runtime uses a fully
    // qualified namespace `<prefix>__<Obj>.<Obj>.prototype.<Func>Context`.
    if (scope.eventsBasedObject) {
      return gd.MetadataDeclarationHelper.getObjectEventsFunctionFullyQualifiedContextName(
        scope.eventsBasedObject,
        eventsFunction,
        prefix
      );
    }
    // Behavior methods are compiled with `compilationForRuntime: true`, so
    // breakpoint instrumentation is not injected — intentionally return an
    // empty id so any incoming `breakpoint.hit` does not falsely match.
    if (scope.eventsBasedBehavior) {
      return '';
    }
    return gd.MetadataDeclarationHelper.getFreeFunctionCodeNamespace(
      eventsFunction,
      prefix
    );
  }
  if (scope.layout) {
    return gd.MetadataDeclarationHelper.getSceneCodeNamespace(
      scope.layout.getName()
    );
  }
  return '';
};

// DFS lookup of the event carrying the given persistent UUID, returning the
// event and its slash-separated EventPath (e.g. "0/2/1"). Uses the same tree
// the IDE renders, so no code-generation traversal has to be replicated here.
const findEventByUuid = (
  events: gdEventsList,
  eventId: string
): {| event: gdBaseEvent, path: string |} | null => {
  const walk = (
    list: gdEventsList,
    pathPrefix: string
  ): {| event: gdBaseEvent, path: string |} | null => {
    for (let i = 0; i < list.getEventsCount(); i++) {
      const event = list.getEventAt(i);
      const path = pathPrefix ? `${pathPrefix}/${i}` : `${i}`;
      if (event.getPersistentUuid() === eventId) return { event, path };
      if (event.canHaveSubEvents()) {
        const found = walk(event.getSubEvents(), path);
        if (found) return found;
      }
    }
    return null;
  };
  return walk(events, '');
};

export type BreakpointHit = {|
  path: string | null,
  eventId: string,
|};

type Callbacks = {|
  getEvents: () => gdEventsList,
  getScope: () => EventsScope,
  onBreakpointHit: (hit: BreakpointHit) => void,
  onResumed: () => void,
  onRuntimeVariables: (variables: any) => void,
  onPreviewClosed: () => void,
|};

/**
 * Owns the breakpoint/CDP session for one events sheet: CDP pause/resume
 * subscriptions, breakpoint persistence + sync to the running preview, and
 * resolution of breakpoint hits to event paths. The events sheet keeps only
 * the render state and reacts through the provided callbacks.
 */
export default class BreakpointSessionController {
  _callbacks: Callbacks;
  _unregisterSessionListener: ?() => void = null;
  _unregisterClosedListener: ?() => void = null;

  constructor(callbacks: Callbacks) {
    this._callbacks = callbacks;
  }

  // Breakpoints (event UUIDs) saved earlier this session for this scope. Scopes
  // that can't hold breakpoints return none, even if their functionId aliases a
  // scene's (e.g. an external events sheet resolves to its layout's namespace).
  getInitialBreakpoints(): Set<string> {
    const scope = this._callbacks.getScope();
    if (!canScopeHoldBreakpoints(scope)) return new Set();
    return getSessionBreakpoints(getFunctionIdFromScope(scope));
  }

  /**
   * Assigns the persistent UUIDs breakpoints are keyed by to every event of the
   * scope, instead of waiting for one to be set. No-op where breakpoints can't
   * run, so projects edited on the web don't grow UUIDs.
   */
  ensureEventsPersistentUuids() {
    if (!isElectronCDPBridgeAvailable()) return;
    const scope = this._callbacks.getScope();
    if (!canScopeHoldBreakpoints(scope)) return;
    const assignedAny = gd.EventsPersistentUuidHelper.ensurePersistentUuids(
      this._callbacks.getEvents()
    );
    // Scene code is generated at every launch, extension code only when asked.
    if (assignedAny && isExtensionFunctionId(getFunctionIdFromScope(scope))) {
      markPersistentUuidsAssigned();
    }
  }

  start() {
    this._unregisterClosedListener = onPreviewDebuggerClosed(() => {
      this._callbacks.onPreviewClosed();
    });
    this._unregisterSessionListener = subscribeToBreakpointDebuggerSession(
      (sessionState: BreakpointDebuggerSessionState) => {
        this._applySessionState(sessionState);
      }
    );
    // The subscription only reports later changes, but an events sheet can be
    // mounted while a pause is already in progress: selecting another extension
    // function remounts it (and so drops its paused state).
    const sessionState = getBreakpointDebuggerSessionState();
    if (sessionState.isPaused) this._applySessionState(sessionState);
    // Sync breakpoints to the runtime in case a preview is already running.
    this.syncBreakpointsToRuntime();
  }

  dispose() {
    if (this._unregisterSessionListener) {
      this._unregisterSessionListener();
      this._unregisterSessionListener = null;
    }
    if (this._unregisterClosedListener) {
      this._unregisterClosedListener();
      this._unregisterClosedListener = null;
    }
  }

  _applySessionState(sessionState: BreakpointDebuggerSessionState) {
    if (!sessionState.isPaused) {
      this._callbacks.onResumed();
      return;
    }
    if (sessionState.hit) {
      this._applyBreakpointHit(
        sessionState.hit.functionId,
        sessionState.hit.eventId
      );
    }
    if (sessionState.runtimeVariables) {
      this._callbacks.onRuntimeVariables(sessionState.runtimeVariables);
    }
  }

  // On a breakpoint hit: resolve the event UUID → path. A resolved
  // non-breakpointable event (comment/group) can't hold a pause, so step past
  // it; otherwise hand the hit to the events sheet.
  _applyBreakpointHit(hitFunctionId: string, eventId: string) {
    const scope = this._callbacks.getScope();
    if (hitFunctionId !== getFunctionIdFromScope(scope)) return;

    const events = this._callbacks.getEvents();
    const found = findEventByUuid(events, eventId);

    if (found && !isBreakpointableEvent(found.event)) {
      // A comment/group can't hold a pause: step past it.
      this.step();
      return;
    }

    this._callbacks.onBreakpointHit({
      path: found ? found.path : null,
      eventId,
    });
  }

  toggleBreakpointsForEvents(
    previousBreakpoints: Set<string>,
    events: Array<gdBaseEvent>
  ): Set<string> {
    const newBreakpoints = new Set(previousBreakpoints);
    events.forEach(event => {
      if (!isBreakpointableEvent(event)) return;
      const eventId = event.getOrCreatePersistentUuid();
      if (newBreakpoints.has(eventId)) {
        newBreakpoints.delete(eventId);
      } else {
        newBreakpoints.add(eventId);
      }
    });
    return newBreakpoints;
  }

  persistBreakpoints(breakpoints: Set<string>) {
    updateBreakpointsSessionEntry(
      getFunctionIdFromScope(this._callbacks.getScope()),
      breakpoints
    );
    this.syncBreakpointsToRuntime();
  }

  // Atomically replaces the runtime's breakpoint set via CDP (works while paused).
  syncBreakpointsToRuntime() {
    setPreviewBreakpointsViaCdp(buildAllBreakpointsPayload());
  }

  // Resume / step always route through the shared session (only available in
  // Electron local preview), which knows the current hit identity itself.
  resume() {
    resumeBreakpointDebugger();
  }

  step() {
    stepBreakpointDebugger();
  }
}
