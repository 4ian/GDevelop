/*
 * GDevelop JS Platform
 * Copyright 2013-2016 Florian Rival (Florian.Rival@gmail.com). All rights reserved.
 * This project is released under the MIT License.
 */
namespace gdjs {
  /** Entry recognized inside the `gdjs` namespace for active extension
   * function frames. Each extension's generated namespace exposes a
   * `localVariables` stack pushed/popped around function invocation. */
  type ExtensionFunctionFrame = {
    localVariables: gdjs.VariablesContainer[];
  };

  /** Dump shape consumed by `extractVariablesFromDump` on the IDE side. */
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

  /**
   * Public debugger API for preview builds. Generated event code calls
   * `pushFunction`, `popFunction`, and `checkBreakpoint`. All fields are
   * `undefined` in exported builds.
   */
  export namespace Debugger {
    /** The current preview RuntimeGame. */
    export let game: gdjs.RuntimeGame | undefined;

    /** Serializes runtime state for the IDE variable tooltip while V8 is paused. */
    export let buildDumpJson: (() => string) | undefined;

    /** Called by generated code when entering an events-function scope. */
    export const pushFunction = (
      functionId: string,
      scene: gdjs.RuntimeScene | null | undefined
    ): void => {
      if (scene) scene.__pushBpFunction(functionId);
    };

    /** Called by generated code when leaving an events-function scope. */
    export const popFunction = (
      scene: gdjs.RuntimeScene | null | undefined
    ): void => {
      if (scene) scene.__popBpFunction();
    };

    /**
     * Called by generated code before each event.
     * Returns `true` if the `debugger;` statement should fire.
     */
    export const checkBreakpoint = (
      functionId: string,
      eventIndex: number,
      container: gdjs.RuntimeInstanceContainer | null | undefined
    ): boolean => {
      if (!container) return false;
      return container.__checkBreakpoint(functionId, eventIndex);
    };
  }

  /**
   * Free function (not a method) so RuntimeGame carries no debug surface in
   * non-preview builds. Called from the constructor, gated on `_isPreview`.
   */
  export const installBreakpointDebugSupport = (
    game: gdjs.RuntimeGame
  ): void => {
    gdjs.Debugger.game = game;

    gdjs.Debugger.buildDumpJson = (): string => {
      const activeLocalVariables: {
        [namespaceKey: string]: gdjs.VariablesContainer[];
      } = {};
      const namespaceEntries = (gdjs as unknown) as Record<string, unknown>;
      for (const key in namespaceEntries) {
        if (!Object.prototype.hasOwnProperty.call(namespaceEntries, key)) {
          continue;
        }
        const entry = namespaceEntries[key];
        if (
          entry !== null &&
          typeof entry === 'object' &&
          Array.isArray(
            (entry as Partial<ExtensionFunctionFrame>).localVariables
          ) &&
          (entry as ExtensionFunctionFrame).localVariables.length > 0
        ) {
          activeLocalVariables[
            'gdjs.' + key
          ] = (entry as ExtensionFunctionFrame).localVariables;
        }
      }

      const sceneArray: gdjs.RuntimeScene[] = game._sceneStack
        ? game._sceneStack._stack
        : [];
      const topScene: gdjs.RuntimeScene | null =
        sceneArray.length > 0 ? sceneArray[sceneArray.length - 1] : null;

      // Custom-object methods use the sub-container; scene events use the
      // top scene. The override is set by RuntimeInstanceContainer.__checkBreakpoint.
      const callingContainer:
        | gdjs.RuntimeInstanceContainer
        | gdjs.RuntimeScene
        | null = game._debugState.lastBpCallingContainer || topScene;
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

      return JSON.stringify(message, function(
        _key: string,
        value: unknown
      ): unknown {
        if (value instanceof Map) {
          const obj: { [key: string]: unknown } = {};
          value.forEach((v: unknown, k: unknown) => {
            obj[String(k)] = v;
          });
          return obj;
        }
        return value;
      });
    };

    if (typeof window === 'undefined') return;

    // Bootstrap set this flag before game code ran; mark CDP as attached now.
    if (window.__gdjsWaitForCdp) {
      gdjs.__cdpAttached = true;
      try {
        delete window.__gdjsWaitForCdp;
      } catch (_) {
        window.__gdjsWaitForCdp = undefined;
      }
    }

    const initial = window.__gdjsInitialBreakpoints;
    if (!Array.isArray(initial) || initial.length === 0) return;
    const map = new Map<string, Set<number>>();
    for (const entry of initial) {
      if (
        entry &&
        typeof entry.functionId === 'string' &&
        Array.isArray(entry.eventIndices) &&
        entry.eventIndices.length > 0
      ) {
        map.set(entry.functionId, new Set(entry.eventIndices));
      }
    }
    if (map.size > 0) {
      game._debugState.breakpointIndices = map;
    }
    try {
      delete window.__gdjsInitialBreakpoints;
    } catch (_) {
      window.__gdjsInitialBreakpoints = undefined;
    }
  };
}
