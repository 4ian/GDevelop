/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /**
   * Dump shape consumed by `extractVariablesFromDump`. Field names keep the
   * runtime's underscore-prefixed members so the same extractor also parses the
   * full `sendRuntimeGameDump` output.
   */
  type BreakpointDumpPayload = {
    _variables: gdjs.VariablesContainer;
    _variablesByExtensionName: Map<string, gdjs.VariablesContainer>;
    _sceneStack: {
      _stack: Array<{
        _variables: gdjs.VariablesContainer;
        _variablesByExtensionName: Map<string, gdjs.VariablesContainer>;
        objectVariablesByName: {
          [objectName: string]: gdjs.VariablesContainer;
        };
      }>;
    };
  };

  type BreakpointDumpMessage = {
    command: 'dump';
    payload: BreakpointDumpPayload;
    activeLocalVariables?: {
      [namespaceKey: string]: gdjs.VariablesContainer[];
    };
  };

  /** A breakpoint hit frozen on a `debugger;` statement. */
  export type BreakpointHit = {
    functionId: string;
    eventIndex: number;
    sceneName: string;
  };

  /** Breakpoints set on one events function. */
  export type BreakpointEntry = {
    functionId: string;
    eventIndices: number[];
  };

  /**
   * Owns all breakpoint and stepping state for a preview game and is the API
   * the generated event code calls (`pushBreakpointFunction`,
   * `popBreakpointFunction`, `checkBreakpoint`). One instance per RuntimeGame,
   * created lazily via `getBreakpointManager`. Preview-only: the generated
   * calls (and thus this manager) are absent from exported games.
   */
  export class DebuggerBreakpointManager {
    private _game: gdjs.RuntimeGame;

    /** True when a CDP debugger drives the preview (local Electron preview).
     * Without it the generated `debugger;` is a no-op, so the FSM is skipped. */
    private _cdpAttached: boolean;

    /** Event indices that should pause, keyed by events-function id. */
    private _breakpointIndices: Map<string, Set<number>> | null = null;

    // Stepping FSM, armed via programStepping / schedulePauseAtNextEvent.
    private _stepNextEvent = false;
    private _stepPassedCurrentEvent = false;
    private _stepCurrentEventIndex = -1;
    private _stepCurrentFunctionId = '';
    private _stepStartDepth = -1;

    /** Stack of active events-function ids, used for stepping depth checks. */
    private _functionStack: string[] = [];

    private _lastBreakpoint: gdjs.BreakpointHit | null = null;

    /** Container running when the breakpoint fired (the scene, or a
     * sub-container for custom-object methods) — tells the dump builder where
     * to read object instances. Union because `RuntimeScene` widens
     * `getProfiler()` and isn't assignable to the abstract base. */
    private _lastBpCallingContainer:
      | gdjs.RuntimeInstanceContainer
      | gdjs.RuntimeScene
      | null = null;

    constructor(game: gdjs.RuntimeGame) {
      this._game = game;
      this._cdpAttached = !!game._options.cdpDebuggerEnabled;
    }

    pushBreakpointFunction(functionId: string): void {
      this._functionStack.push(functionId);
    }

    popBreakpointFunction(): void {
      this._functionStack.pop();
    }

    /**
     * Called by generated code before each event.
     * @param container The scene or sub-container running the event.
     * @returns true if the `debugger;` statement should fire.
     */
    checkBreakpoint(
      functionId: string,
      eventIndex: number,
      container: gdjs.RuntimeInstanceContainer
    ): boolean {
      if (!this._cdpAttached) return false;

      if (this._stepNextEvent) {
        const depth = this._functionStack.length;

        if (this._stepStartDepth < 0) {
          if (!this._stepCurrentFunctionId) {
            // Step-over with no pinned event (game was running): stop only at
            // scene-level events, not deep inside extensions.
            if (functionId.startsWith('gdjs.evtsExt__')) return false;
            this._stepStartDepth = depth;
          } else if (functionId === this._stepCurrentFunctionId) {
            this._stepStartDepth = depth;
          } else {
            return false;
          }
        }

        if (depth > this._stepStartDepth) return false;

        // Left the target scope — abandon stepping, resume the game.
        if (depth < this._stepStartDepth) {
          this._stepNextEvent = false;
          return false;
        }

        // Step-over from a fresh pause with no pinned event to step past.
        if (this._stepCurrentEventIndex < 0) {
          this._stepNextEvent = false;
          return this._triggerBreakpoint(functionId, eventIndex, container);
        }

        if (
          functionId === this._stepCurrentFunctionId &&
          eventIndex === this._stepCurrentEventIndex
        ) {
          this._stepPassedCurrentEvent = true;
          return false;
        }
        if (this._stepPassedCurrentEvent) {
          this._stepNextEvent = false;
          this._stepPassedCurrentEvent = false;
          this._stepCurrentEventIndex = -1;
          return this._triggerBreakpoint(functionId, eventIndex, container);
        }
        return false;
      }

      const bpMap = this._breakpointIndices;
      if (bpMap) {
        const fnSet = bpMap.get(functionId);
        if (fnSet && fnSet.has(eventIndex)) {
          return this._triggerBreakpoint(functionId, eventIndex, container);
        }
      }
      return false;
    }

    private _triggerBreakpoint(
      functionId: string,
      eventIndex: number,
      container: gdjs.RuntimeInstanceContainer
    ): boolean {
      // Hit info only; the variable dump is built later by Electron main over
      // CDP, once V8 is paused.
      this._lastBreakpoint = {
        functionId,
        eventIndex,
        sceneName: container.getScene().getName(),
      };
      this._lastBpCallingContainer = container;
      return true;
    }

    /**
     * Called after a scene's events run. If stepping was armed but the target
     * event wasn't reached this frame, reset so stepping wraps to the next one.
     */
    onFrameEnd(): void {
      if (!this._stepNextEvent) return;
      if (this._stepCurrentFunctionId.startsWith('gdjs.evtsExt__')) {
        // Extension scope: stop stepping and let the game resume.
        this._stepNextEvent = false;
      } else {
        // Scene scope: reset to "stop at first event" on the next frame.
        this._stepCurrentEventIndex = -1;
        this._stepStartDepth = -1;
      }
    }

    // --- Commands issued by the IDE over CDP, through gdjs.BreakpointDebugger.* ---

    setBreakpoints(entries: gdjs.BreakpointEntry[]): void {
      const map = new Map<string, Set<number>>();
      for (let i = 0; i < entries.length; i++) {
        const e = entries[i];
        if (e && e.functionId && e.eventIndices && e.eventIndices.length > 0) {
          map.set(e.functionId, new Set(e.eventIndices));
        }
      }
      this._breakpointIndices = map.size > 0 ? map : null;
    }

    /**
     * Applies the breakpoints seeded on `window` by the CDP bootstrap before
     * the runtime loaded (see bootstrapPreviewCdp), then clears them. `window`
     * is the only carrier available that early - the runtime didn't exist yet.
     */
    consumeInitialBreakpoints(): void {
      if (typeof window === 'undefined') return;
      const initial = window.__gdjsInitialBreakpoints;
      if (Array.isArray(initial) && initial.length > 0) {
        this.setBreakpoints(initial);
      }
      try {
        delete window.__gdjsInitialBreakpoints;
      } catch (_) {
        window.__gdjsInitialBreakpoints = undefined;
      }
    }

    /**
     * Arms the stepping FSM so the next event (or the one after the given
     * `eventIndex`) trips a breakpoint.
     * @param preFlipPassed Treat the current event as already passed (V8 pauses
     * on the `debugger;` that sits after `checkBreakpoint`, so the event is
     * "passed" but its body hasn't run yet). For a raw pause pass -1 / false.
     */
    programStepping(
      eventIndex: number,
      functionId: string,
      preFlipPassed: boolean
    ): void {
      this._stepNextEvent = true;
      this._stepPassedCurrentEvent = !!preFlipPassed;
      this._stepCurrentEventIndex = eventIndex;
      this._stepCurrentFunctionId = functionId;
      this._stepStartDepth = -1;
    }

    /** Pauses the running game at the next event. */
    schedulePauseAtNextEvent(): void {
      this._stepNextEvent = true;
      this._stepPassedCurrentEvent = false;
      this._stepCurrentEventIndex = -1;
      this._stepCurrentFunctionId = '';
      this._stepStartDepth = -1;
      // A held Debugger-panel Pause keeps the render loop dormant, so
      // checkBreakpoint would never run — clear it.
      this._game.pause(false);
    }

    getLastBreakpoint(): gdjs.BreakpointHit | null {
      return this._lastBreakpoint;
    }

    getLastBpCallingContainer():
      | gdjs.RuntimeInstanceContainer
      | gdjs.RuntimeScene
      | null {
      return this._lastBpCallingContainer;
    }
  }

  /**
   * Preview-only breakpoint debugger API, callable from the Chrome debugger
   * (CDP) and the generated event code. The Electron CDP snippets are thin
   * wrappers over these methods.
   */
  export namespace BreakpointDebugger {
    /** The current preview RuntimeGame. */
    export let game: gdjs.RuntimeGame | undefined;

    /** Serializes runtime state for the IDE variable tooltip while V8 is paused. */
    export let buildDumpJson: (() => string) | undefined;

    const getManager = (): gdjs.DebuggerBreakpointManager | null =>
      game ? game.getBreakpointManager() : null;

    /** Replaces the active breakpoints. Returns false if the game isn't ready. */
    export const setBreakpoints = (
      entries: gdjs.BreakpointEntry[]
    ): boolean => {
      const manager = getManager();
      if (!manager) return false;
      manager.setBreakpoints(entries);
      return true;
    };

    /** Arms the stepping FSM. Returns false if the game isn't ready. */
    export const programStepping = (
      eventIndex: number,
      functionId: string,
      preFlipPassed: boolean
    ): boolean => {
      const manager = getManager();
      if (!manager) return false;
      manager.programStepping(eventIndex, functionId, preFlipPassed);
      return true;
    };

    /** Pauses the running game at the next event. Returns false if not ready. */
    export const schedulePauseAtNextEvent = (): boolean => {
      const manager = getManager();
      if (!manager) return false;
      manager.schedulePauseAtNextEvent();
      return true;
    };

    /**
     * Reads breakpoint-hit info plus a variable dump while V8 is paused.
     * @returns JSON `{"bp": BreakpointHit | null, "dump": string}`.
     */
    export const readPauseState = (): string => {
      const manager = getManager();
      const bp = manager ? manager.getLastBreakpoint() : null;
      let dump = '';
      try {
        if (buildDumpJson) dump = buildDumpJson();
      } catch (e) {
        // The pause flow must never depend on the dump succeeding.
      }
      return JSON.stringify({ bp: bp, dump: dump });
    };
  }

  /**
   * Free function (not a method) to keep the install logic off the RuntimeGame
   * interface. Called from the constructor, gated on `_isPreview`.
   */
  export const installBreakpointDebugSupport = (
    game: gdjs.RuntimeGame
  ): void => {
    gdjs.BreakpointDebugger.game = game;

    gdjs.BreakpointDebugger.buildDumpJson = (): string => {
      const activeLocalVariables = gdjs.collectActiveLocalVariables();

      const sceneArray: gdjs.RuntimeScene[] = game._sceneStack
        ? game._sceneStack._stack
        : [];
      const topScene: gdjs.RuntimeScene | null =
        sceneArray.length > 0 ? sceneArray[sceneArray.length - 1] : null;

      // Custom-object methods use the sub-container; scene events use the
      // top scene. The override is recorded by the breakpoint manager.
      const manager = game._breakpointManager;
      const callingContainer:
        | gdjs.RuntimeInstanceContainer
        | gdjs.RuntimeScene
        | null = (manager && manager.getLastBpCallingContainer()) || topScene;
      const objectVariablesByName: {
        [objectName: string]: gdjs.VariablesContainer;
      } = {};
      if (callingContainer) {
        const items = callingContainer._instances.items;
        for (const objName in items) {
          if (!Object.prototype.hasOwnProperty.call(items, objName)) continue;
          const list = items[objName];
          if (!list || list.length === 0) continue;
          // First instance only; use the Debugger panel for full inspection.
          const firstInstance = list[0];
          if (firstInstance) {
            objectVariablesByName[objName] = firstInstance.getVariables();
          }
        }
      }

      const payload: BreakpointDumpPayload = {
        _variables: game._variables,
        _variablesByExtensionName: game._variablesByExtensionName,
        _sceneStack: {
          _stack: topScene
            ? [
                {
                  _variables: topScene._variables,
                  _variablesByExtensionName: topScene._variablesByExtensionName,
                  objectVariablesByName,
                },
              ]
            : [],
        },
      };

      const message: BreakpointDumpMessage = { command: 'dump', payload };
      if (Object.keys(activeLocalVariables).length > 0) {
        message.activeLocalVariables = activeLocalVariables;
      }

      return JSON.stringify(
        message,
        function (_key: string, value: unknown): unknown {
          if (value instanceof Map) {
            const obj: { [key: string]: unknown } = {};
            value.forEach((v: unknown, k: unknown) => {
              obj[String(k)] = v;
            });
            return obj;
          }
          return value;
        }
      );
    };

    game.getBreakpointManager().consumeInitialBreakpoints();
  };
}
