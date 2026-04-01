// @flow
import { type PreviewDebuggerServer } from '../ExportAndShare/PreviewLauncher.flow';
import { type HotReloadSteps } from '../EmbeddedGame/EmbeddedGameFrame';

export type SimObjectState = {|
  x: number,
  y: number,
  z: number,
  angle: number,
  rotationX: number,
  rotationY: number,
  width: number,
  height: number,
  layer: string,
  variables: { [string]: number | string | boolean },
  behaviors: { [string]: { [string]: any } },
|};

export type SimEvent =
  | {| frame: number, event: 'spawned', object: string |}
  | {| frame: number, event: 'removed', object: string |}
  | {|
      frame: number,
      event: 'stuck',
      object: string,
      x: number,
      y: number,
      z: number,
      duration: number,
    |};

export type SimulationResult = {|
  passed: boolean,
  framesExecuted: number,
  errors: Array<string>,
  assertions: Array<{| message: string, passed: boolean |}>,
  objectStates: {| [objectName: string]: Array<SimObjectState> |},
  sceneVariables: {| [name: string]: number | string | boolean |},
  consoleLogs: Array<{| level: string, message: string |}>,
  eventLog: Array<SimEvent>,
|};

// Module-level registry so the simulation runner can be called from anywhere
// without threading it through the entire component prop chain.
// Pattern follows EmbeddedGameFrame.js.
let _globalSimulationRunner:
  | null
  | ((
      project: any,
      sceneName: string,
      scriptBody: string,
      timeoutMs: number
    ) => Promise<SimulationResult>) = null;

export const setGlobalSimulationRunner = (
  runner: (
    project: any,
    sceneName: string,
    scriptBody: string,
    timeoutMs: number
  ) => Promise<SimulationResult>
): void => {
  _globalSimulationRunner = runner;
};

export const clearGlobalSimulationRunner = (): void => {
  _globalSimulationRunner = null;
};

export const getGlobalSimulationRunner = ():
  | null
  | ((
      project: any,
      sceneName: string,
      scriptBody: string,
      timeoutMs: number
    ) => Promise<SimulationResult>) => _globalSimulationRunner;

const noHotReloadSteps: HotReloadSteps = {
  shouldReloadProjectData: false,
  shouldReloadLibraries: false,
  shouldReloadResources: false,
  shouldHardReload: false,
  reasons: [],
};

const mergeHotReloadSteps = (
  a: HotReloadSteps,
  b: HotReloadSteps
): HotReloadSteps => ({
  shouldReloadProjectData:
    a.shouldReloadProjectData || b.shouldReloadProjectData,
  shouldReloadLibraries: a.shouldReloadLibraries || b.shouldReloadLibraries,
  shouldReloadResources: a.shouldReloadResources || b.shouldReloadResources,
  shouldHardReload: a.shouldHardReload || b.shouldHardReload,
  reasons: [...a.reasons, ...b.reasons],
});

const isHotReloadNeeded = (steps: HotReloadSteps): boolean =>
  steps.shouldReloadProjectData ||
  steps.shouldReloadLibraries ||
  steps.shouldReloadResources ||
  steps.shouldHardReload;

/**
 * Manages the lifecycle of the simulation preview runtime.
 * The simulation runtime is a hidden iframe that runs the game using the same
 * export pipeline as the in-game editor, allowing the AI to test game behavior
 * via scripted simulations (stepFrames, setKeyPressed, getObjects, assert, etc.)
 *
 * Usage:
 *  const manager = new SimulationRuntimeManager({ previewDebuggerServer, onLaunchSimulationPreview });
 *  const result = await manager.runSimulation('Level1', `harness.stepFrames(60); harness.assert(...)`, 15000);
 *  manager.destroy();
 */
export class SimulationRuntimeManager {
  _previewDebuggerServer: PreviewDebuggerServer;
  _onLaunchSimulationPreview: (options: {|
    project: any,
    sceneName: string,
    hotReload: boolean,
    shouldHardReload: boolean,
    shouldReloadProjectData: boolean,
    shouldReloadLibraries: boolean,
    shouldReloadResources: boolean,
  |}) => Promise<string>;
  _iframe: HTMLIFrameElement | null = null;
  _overlayDiv: HTMLDivElement | null = null;
  _getShowPreview: () => boolean;
  _isSimulationRunning: boolean = false;
  _isLaunched: boolean = false;
  _isLaunching: boolean = false;
  _hotReloadSteps: HotReloadSteps = noHotReloadSteps;
  _pendingSimulationResolve: ((result: SimulationResult) => void) | null = null;
  _pendingSimulationReject: ((err: Error) => void) | null = null;
  _pendingSimulationTimer: TimeoutID | null = null;
  _pendingHotReloadResolve: (() => void) | null = null;
  _unregisterCallbacks: () => void;

  constructor({
    previewDebuggerServer,
    onLaunchSimulationPreview,
    getShowPreview,
  }: {|
    previewDebuggerServer: PreviewDebuggerServer,
    onLaunchSimulationPreview: (options: {|
      project: any,
      sceneName: string,
      hotReload: boolean,
      shouldHardReload: boolean,
      shouldReloadProjectData: boolean,
      shouldReloadLibraries: boolean,
      shouldReloadResources: boolean,
    |}) => Promise<string>,
    getShowPreview: () => boolean,
  |}) {
    this._previewDebuggerServer = previewDebuggerServer;
    this._onLaunchSimulationPreview = onLaunchSimulationPreview;
    this._getShowPreview = getShowPreview;

    this._unregisterCallbacks = previewDebuggerServer.registerCallbacks({
      onHandleParsedMessage: ({ id, parsedMessage }) => {
        if (id !== 'simulation-frame') return;
        if (
          parsedMessage.command === 'simulationResult' &&
          this._pendingSimulationResolve
        ) {
          const resolve = this._pendingSimulationResolve;
          this._clearPendingSimulation();
          resolve(parsedMessage.payload);
        } else if (parsedMessage.command === 'hotReloader.logs') {
          if (this._pendingHotReloadResolve) {
            const resolve = this._pendingHotReloadResolve;
            this._pendingHotReloadResolve = null;
            resolve();
          }
        }
      },
      onConnectionClosed: ({ id }) => {
        if (id === 'simulation-frame') {
          this._isLaunched = false;
          console.info(
            '[SimulationRuntimeManager] Simulation frame disconnected.'
          );
        }
      },
      onServerStateChanged: () => {},
      onConnectionOpened: () => {},
      onConnectionErrored: () => {},
      onErrorReceived: () => {},
    });
  }

  _applyIframeVisibility(iframe: HTMLIFrameElement): void {
    const showPreview = this._getShowPreview();
    if (showPreview && this._isSimulationRunning) {
      // Simulation is actively running — show the iframe
      iframe.style.cssText =
        'position:fixed;bottom:16px;left:16px;width:320px;height:180px;' +
        'border:2px solid #aaa;border-radius:4px;z-index:9999;background:#000;' +
        'pointer-events:none;'; // Never interactive — just a viewer
      this._applyOverlay(true);
    } else if (showPreview && this._isLaunching) {
      // Still loading — hide the iframe but show the placeholder overlay
      iframe.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:0;left:0;border:none;';
      this._applyOverlay(true);
    } else {
      iframe.style.cssText =
        'position:fixed;width:1px;height:1px;opacity:0;pointer-events:none;top:0;left:0;border:none;';
      this._applyOverlay(false);
    }
  }

  _applyOverlay(show: boolean): void {
    if (!show) {
      if (this._overlayDiv && this._overlayDiv.parentNode) {
        this._overlayDiv.parentNode.removeChild(this._overlayDiv);
        this._overlayDiv = null;
      }
      return;
    }

    if (!this._overlayDiv) {
      const div = document.createElement('div');
      if (document.body) document.body.appendChild(div);
      this._overlayDiv = div;
    }

    const isLoading = this._isLaunching;
    // 320+4=324, 180+4=184: accounts for the 2px border on the iframe
    // so the overlay covers the exact same pixels as the iframe's rendered box.
    this._overlayDiv.style.cssText =
      'position:fixed;bottom:16px;left:16px;width:324px;height:184px;' +
      'border-radius:4px;z-index:10000;display:flex;align-items:center;justify-content:center;' +
      'pointer-events:all;background:transparent;';

    if (isLoading) {
      this._overlayDiv.style.background = 'rgba(0,0,0,0.75)';
      this._overlayDiv.innerHTML =
        '<span style="color:#fff;font-family:sans-serif;font-size:13px;user-select:none;">Loading simulation\u2026</span>';
    } else {
      this._overlayDiv.style.background = 'transparent';
      this._overlayDiv.innerHTML = '';
    }
  }

  /**
   * Notify the manager that the project has changed and a hot-reload is needed.
   * The reload will be applied before the next simulation run.
   */
  setHotReloadNeeded(steps: HotReloadSteps): void {
    this._hotReloadSteps = mergeHotReloadSteps(this._hotReloadSteps, steps);
  }

  /**
   * Cancel any in-progress simulation.
   * Sends a cancelSimulation command to the iframe (so the harness stops stepping frames)
   * and immediately rejects the pending promise on the IDE side.
   */
  cancelSimulation(): void {
    if (!this._isSimulationRunning && !this._pendingSimulationResolve) return;

    // Tell the iframe harness to stop at the next frame check
    this._previewDebuggerServer.sendMessage('simulation-frame', {
      command: 'cancelSimulation',
    });

    // Reject the pending promise on the IDE side immediately
    if (this._pendingSimulationReject) {
      const reject = this._pendingSimulationReject;
      this._clearPendingSimulation();
      reject(new Error('Simulation cancelled by user.'));
    }
  }

  /**
   * Run a simulation in the given scene using the provided script body.
   * The script is executed inside the simulation iframe as:
   *   async (harness) => { <scriptBody> }
   *
   * Returns the simulation result (assertions, object states, errors, etc.)
   * Rejects if the simulation does not complete within `timeoutMs`.
   */
  async runSimulation(
    project: any,
    sceneName: string,
    scriptBody: string,
    timeoutMs: number = 15000
  ): Promise<SimulationResult> {
    if (this._pendingSimulationResolve) {
      throw new Error(
        'A simulation is already in progress. Wait for it to complete before starting another.'
      );
    }

    await this._ensureLaunched(project, sceneName);

    this._isSimulationRunning = true;
    if (this._iframe) this._applyIframeVisibility(this._iframe);

    return new Promise((resolve, reject) => {
      this._pendingSimulationTimer = setTimeout(() => {
        // Tell the harness to stop — without this the script keeps stepping
        // frames in the iframe after the IDE-side promise is settled.
        this._previewDebuggerServer.sendMessage('simulation-frame', {
          command: 'cancelSimulation',
        });
        this._clearPendingSimulation();
        reject(new Error(`Simulation timed out after ${timeoutMs}ms.`));
      }, timeoutMs);

      this._pendingSimulationResolve = resolve;
      this._pendingSimulationReject = reject;

      this._previewDebuggerServer.sendMessage('simulation-frame', {
        command: 'runSimulation',
        payload: { sceneName, scriptBody },
      });
    });
  }

  _clearPendingSimulation(): void {
    if (this._pendingSimulationTimer !== null) {
      clearTimeout(this._pendingSimulationTimer);
      this._pendingSimulationTimer = null;
    }
    this._pendingSimulationResolve = null;
    this._pendingSimulationReject = null;
    this._isSimulationRunning = false;
    if (this._iframe) this._applyIframeVisibility(this._iframe);
  }

  async _ensureLaunched(project: any, sceneName: string): Promise<void> {
    if (this._isLaunching) {
      // Wait for current launch to finish
      await new Promise(resolve => {
        const check = () => {
          if (!this._isLaunching) {
            resolve();
          } else {
            setTimeout(check, 100);
          }
        };
        check();
      });
    }

    const needsHotReload = isHotReloadNeeded(this._hotReloadSteps);
    if (this._isLaunched && !needsHotReload) return;

    this._isLaunching = true;
    const isFirstLaunch = !this._isLaunched;

    // Create iframe on first launch
    if (!this._iframe) {
      const iframe = document.createElement('iframe');
      // Prevent the iframe from ever receiving keyboard focus.
      // pointer-events:none (set in _applyIframeVisibility) blocks mouse-click focus;
      // tabIndex=-1 blocks Tab navigation; the focus listener handles edge cases.
      iframe.tabIndex = -1;
      iframe.addEventListener('focus', () => iframe.blur());
      if (document.body) document.body.appendChild(iframe);
      // Register the window BEFORE setting src so messages are routed correctly
      this._previewDebuggerServer.registerSimulationFrame(
        // $FlowFixMe[incompatible-call]
        iframe.contentWindow
      );
      this._iframe = iframe;
    }

    // Re-read the preference on every run so visibility changes take effect immediately
    this._applyIframeVisibility(this._iframe);

    const hotReloadSteps = this._hotReloadSteps;
    this._hotReloadSteps = noHotReloadSteps;

    try {
      const indexHtmlLocation = await this._onLaunchSimulationPreview({
        project,
        sceneName,
        hotReload: !isFirstLaunch && needsHotReload,
        shouldHardReload: hotReloadSteps.shouldHardReload,
        shouldReloadProjectData: hotReloadSteps.shouldReloadProjectData,
        shouldReloadLibraries: hotReloadSteps.shouldReloadLibraries,
        shouldReloadResources: hotReloadSteps.shouldReloadResources,
      });

      if (isFirstLaunch && this._iframe) {
        // Set iframe src only on first launch; hot-reloads are handled via messages
        this._iframe.src = indexHtmlLocation;

        // Re-register after src change (contentWindow changes after src is set)
        // $FlowFixMe[incompatible-call]
        this._previewDebuggerServer.registerSimulationFrame(
          this._iframe.contentWindow
        );

        // Wait for the game to load (give it up to 30 seconds)
        await this._waitForIframeLoad(30000);
      } else if (!isFirstLaunch && needsHotReload) {
        // Wait for the game to acknowledge the hot reload via hotReloader.logs.
        // The hot reload pipeline (reloadScriptFiles → setProjectData) is async;
        // without this wait, runSimulation can be sent before setProjectData
        // updates the scene, causing stale object positions.
        await new Promise((resolve, reject) => {
          const timer = setTimeout(() => {
            this._pendingHotReloadResolve = null;
            // Proceed anyway – worst case, the sim runs with slightly stale data
            resolve();
          }, 10000);
          this._pendingHotReloadResolve = () => {
            clearTimeout(timer);
            resolve();
          };
        });
      }

      this._isLaunched = true;
    } catch (err) {
      console.error(
        '[SimulationRuntimeManager] Failed to launch simulation preview:',
        err
      );
      throw err;
    } finally {
      this._isLaunching = false;
      if (this._iframe) this._applyIframeVisibility(this._iframe);
    }
  }

  _waitForIframeLoad(timeoutMs: number): Promise<void> {
    return new Promise((resolve, reject) => {
      const iframe = this._iframe;
      if (!iframe) {
        reject(new Error('No simulation iframe'));
        return;
      }
      const timer = setTimeout(() => {
        reject(new Error('Timed out waiting for simulation iframe to load'));
      }, timeoutMs);
      const onLoad = () => {
        clearTimeout(timer);
        // Silence all audio from the simulation iframe.
        try {
          const iframeWindow = iframe.contentWindow;
          if (iframeWindow) {
            const noop = () => Promise.resolve();
            // Patch AudioContext.prototype.resume to a no-op so nothing can
            // unsuspend the context going forward.
            if ((iframeWindow: any).AudioContext) {
              (iframeWindow: any).AudioContext.prototype.resume = noop;
            }
            if ((iframeWindow: any).Howler) {
              // mute(true) sets the master GainNode to 0 (Web Audio path) AND
              // mutes all HTML5 audio nodes, and prevents new sounds from
              // playing — unlike volume(0) which doesn't set the muted flag.
              (iframeWindow: any).Howler.mute(true);
              // Also suspend the AudioContext and patch resume() directly on
              // the instance in case Howler cached a bound reference before
              // our prototype patch.
              if ((iframeWindow: any).Howler.ctx) {
                (iframeWindow: any).Howler.ctx.resume = noop;
                (iframeWindow: any).Howler.ctx.suspend();
              }
            }
          }
        } catch (e) {
          // Ignore – cross-origin
        }
        resolve();
      };
      iframe.addEventListener('load', onLoad, { once: true });
    });
  }

  /**
   * Destroy the simulation runtime, removing the iframe and unregistering callbacks.
   */
  destroy(): void {
    // Cancel any running simulation before unregistering — sendMessage becomes
    // a no-op once unregisterSimulationFrame sets simulationFrameWindow to null.
    this._previewDebuggerServer.sendMessage('simulation-frame', {
      command: 'cancelSimulation',
    });
    this._unregisterCallbacks();
    this._applyOverlay(false);
    const iframe = this._iframe;
    if (iframe) {
      // Fallback: force mute in case the AudioContext muting didn't take effect.
      try {
        const iframeWindow = iframe.contentWindow;
        if (iframeWindow && (iframeWindow: any).Howler) {
          (iframeWindow: any).Howler.mute(true);
        }
      } catch (e) {
        // Ignore – cross-origin
      }
      // $FlowFixMe[incompatible-call]
      this._previewDebuggerServer.unregisterSimulationFrame(
        iframe.contentWindow
      );
      if (iframe.parentNode) {
        iframe.parentNode.removeChild(iframe);
      }
      this._iframe = null;
    }
    this._isLaunched = false;
    if (this._pendingSimulationReject) {
      const reject = this._pendingSimulationReject;
      this._clearPendingSimulation();
      reject(new Error('Simulation cancelled: runtime was destroyed.'));
    }
  }
}

let _globalSimulationManager: SimulationRuntimeManager | null = null;

export const setGlobalSimulationManager = (
  manager: SimulationRuntimeManager | null
): void => {
  _globalSimulationManager = manager;
};

export const cancelGlobalSimulation = (): void => {
  if (_globalSimulationManager) {
    _globalSimulationManager.cancelSimulation();
  }
};
