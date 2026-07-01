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
  walkEventsInGeneratorOrder,
} from './BreakpointsSessionStore';
import { extractVariablesFromDump } from '../Debugger/RuntimeVariablesContext';
import { findEventByPath } from '../Utils/EventsValidationScanner';
import { type EventsScope } from '../InstructionOrExpression/EventsScope';

const gd: libGDevelop = global.gd;

const NON_BREAKPOINTABLE_TYPES = [
  'BuiltinCommonInstructions::Comment',
  'BuiltinCommonInstructions::Group',
];

export const isBreakpointableEvent = (event: gdBaseEvent): boolean =>
  event.isExecutable() && !NON_BREAKPOINTABLE_TYPES.includes(event.getType());

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

// Maps flat DFS index (matching the C++ code generator's traversal) back to
// its serialized EventPath (e.g. "0/2/1").
const buildFlatIndexToPathMap = (events: gdEventsList): Map<number, string> => {
  const map = new Map<number, string>();
  walkEventsInGeneratorOrder(events, (_event, idx, path) => {
    map.set(idx, path);
  });
  return map;
};

export type BreakpointHit = {|
  path: string | null,
  eventIndex: number,
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

  // Breakpoints saved earlier this editor session (tab previously opened,
  // debugger previously attached, etc.).
  static getInitialBreakpoints(events: gdEventsList): Set<number> {
    return getSessionBreakpoints(events.ptr);
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
      typeof breakpoint.eventIndex === 'number' &&
      typeof breakpoint.functionId === 'string'
    ) {
      this._applyBreakpointHit(breakpoint.functionId, breakpoint.eventIndex);
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

  // On a breakpoint hit: resolve the flat-index → path. A resolved
  // non-breakpointable event (comment/group) can't hold a pause, so step past
  // it; otherwise hand the hit to the events sheet.
  _applyBreakpointHit(hitFunctionId: string, eventIndex: number) {
    const scope = this._callbacks.getScope();
    if (hitFunctionId !== getFunctionIdFromScope(scope)) return;

    const events = this._callbacks.getEvents();
    const path = buildFlatIndexToPathMap(events).get(eventIndex) || null;

    if (path) {
      const event = findEventByPath(events, path.split('/').map(Number));
      if (event && !isBreakpointableEvent(event)) {
        this.step(eventIndex);
        return;
      }
    }

    this._isPaused = true;
    this._callbacks.onBreakpointHit({ path, eventIndex });
  }

  toggleBreakpointsForEvents(
    previousBreakpoints: Set<number>,
    events: Array<gdBaseEvent>
  ): Set<number> {
    const newBreakpoints = new Set(previousBreakpoints);
    events.forEach(event => {
      if (!isBreakpointableEvent(event)) return;
      const ptr = event.ptr;
      if (newBreakpoints.has(ptr)) {
        newBreakpoints.delete(ptr);
      } else {
        newBreakpoints.add(ptr);
      }
    });
    return newBreakpoints;
  }

  persistBreakpoints(breakpoints: Set<number>) {
    const events = this._callbacks.getEvents();
    updateBreakpointsSessionEntry(
      events.ptr,
      events,
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

  step(eventIndex: number) {
    stepPausedPreview({
      currentEventIndex: eventIndex,
      currentFunctionId: getFunctionIdFromScope(this._callbacks.getScope()),
    });
  }
}
