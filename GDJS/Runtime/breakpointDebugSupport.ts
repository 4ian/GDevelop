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
   * Free function (not a method) so the class carries no debug surface in
   * non-preview builds. Exposes `gdjs.game` and `gdjs.__buildBreakpointDumpJson`
   * for CDP `Runtime.evaluate` from Electron main, and seeds
   * `_debugState.breakpointIndices` from breakpoints injected via
   * `Page.addScriptToEvaluateOnNewDocument` before the first frame runs.
   *
   * Called from the RuntimeGame constructor, gated on `_isPreview`.
   */
  export const installBreakpointDebugSupport = (
    game: gdjs.RuntimeGame
  ): void => {
    gdjs.game = game;

    gdjs.__buildBreakpointDumpJson = (): string => {
      const activeLocalVariables: {
        [namespaceKey: string]: gdjs.VariablesContainer[];
      } = {};
      const namespaceEntries = gdjs as unknown as Record<string, unknown>;
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
          activeLocalVariables['gdjs.' + key] = (entry as ExtensionFunctionFrame)
            .localVariables;
        }
      }

      const sceneArray: gdjs.RuntimeScene[] = game._sceneStack
        ? game._sceneStack._stack
        : [];
      const topScene: gdjs.RuntimeScene | null =
        sceneArray.length > 0 ? sceneArray[sceneArray.length - 1] : null;

      // For custom-object methods the picked objects live in the custom
      // object's `_instances`, not the scene's — hence the override set by
      // `_triggerBreakpoint`. Falls back to the top scene for scene events.
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
          // Tooltip is a quick-peek; full multi-instance view lives in the
          // Debugger panel.
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

      return JSON.stringify(message, function (
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
