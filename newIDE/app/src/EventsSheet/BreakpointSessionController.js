// @flow
import {
  onPreviewDebuggerPauseChange,
  onPreviewDebuggerClosed,
  resumePausedPreview,
  stepPausedPreview,
  setPreviewBreakpointsViaCdp,
  type CDPPausePayload,
} from '../Debugger/ElectronCDPBridge';
import {
  getBreakpoints as getSessionBreakpoints,
  updateEntry as updateBreakpointsSessionEntry,
  buildAllBreakpointsPayload,
} from './BreakpointsSessionStore';
import { extractVariablesFromDump } from '../Debugger/RuntimeVariablesContext';
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
  _unregisterPauseListener: ?() => void = null;
  _unregisterClosedListener: ?() => void = null;
  _isPaused: boolean = false;

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

  start() {
    this._unregisterClosedListener = onPreviewDebuggerClosed(() => {
      this._callbacks.onPreviewClosed();
    });
    this._unregisterPauseListener = onPreviewDebuggerPauseChange(
      (isPaused: boolean, payload: ?CDPPausePayload) => {
        if (isPaused) this._handlePaused(payload);
        else this._handleResumed();
      }
    );
    // Sync breakpoints to the runtime in case a preview is already running.
    this.syncBreakpointsToRuntime();
  }

  dispose() {
    if (this._unregisterPauseListener) {
      this._unregisterPauseListener();
      this._unregisterPauseListener = null;
    }
    if (this._unregisterClosedListener) {
      this._unregisterClosedListener();
      this._unregisterClosedListener = null;
    }
  }

  _handlePaused(payload: ?CDPPausePayload) {
    const breakpoint = payload && payload.breakpoint;
    if (
      breakpoint &&
      typeof breakpoint.eventId === 'string' &&
      typeof breakpoint.functionId === 'string'
    ) {
      this._applyBreakpointHit(breakpoint.functionId, breakpoint.eventId);
    }
    const dumpJson = payload && payload.dumpJson;
    if (dumpJson) {
      try {
        const parsed = JSON.parse(dumpJson);
        if (parsed && parsed.command === 'dump') {
          const variables = extractVariablesFromDump(parsed);
          if (variables) this._callbacks.onRuntimeVariables(variables);
        }
      } catch (_) {}
    }
  }

  _handleResumed() {
    if (!this._isPaused) return;
    this._isPaused = false;
    this._callbacks.onResumed();
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
      this.step(eventId);
      return;
    }

    this._isPaused = true;
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

  // Resume / step always route through CDP (only available in Electron local preview).
  resume() {
    resumePausedPreview();
  }

  step(eventId: string) {
    stepPausedPreview({
      currentEventId: eventId,
      currentFunctionId: getFunctionIdFromScope(this._callbacks.getScope()),
    });
  }
}
