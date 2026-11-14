// A GDevelop game (exported for HTML5) as a ThreeRT game.
//
// The bundle made by scripts/build.js is, in order:
//   1. the manifest (`globalThis.__GDJS_THREERT_MANIFEST__`),
//   2. this file and @threert/scene / @threert/gameplay (it installs the browser stand-ins and defines the game),
//   3. three.js as GDJS ships it, then `__GDJS_THREERT__.installThree()` puts @threert/scene in place of it,
//   4. the GDJS runtime, its extensions, the game code and data (the scripts of the export's index.html), Jolt,
//   5. `__GDJS_THREERT__.installGDJSPatches()`.
// ThreeRT then calls `setup`: the game is created, its assets and first scene are loaded within setup (its time
// budget is larger than a frame's), and every frame then runs a step of the GDJS game loop.
import * as S from '@threert/scene';
import { defineGame, hud } from '@threert/gameplay';
import { installBrowserShims, runAnimationFrames, runTimers, setFlushTimersImmediately, gameViewport } from './browser';
import { installThree } from './three';
import { installAudio } from './audio';
import { installWebAssembly, importModule } from './wasm';
import { installGDJSPatches, installPreGDJS, threertState, getJoltModule } from './gdjs-patches';
import { ThreeRTView } from './view';
import { applyInput } from './input';
import { updateHud } from './hud';
import { getManifest } from './manifest';

declare const gdjs: any;
const g = globalThis as any;

installBrowserShims();
installAudio();
installWebAssembly();
installPreGDJS();
g.__GDJS_THREERT__ = { installThree, installGDJSPatches, getJoltModule, importModule };

let game: any = null;
let gameTimeMs = 0;
let isGameLoopRunning = false;
let lastError = '';
/** Time spent in the frame script, logged every 120 frames when the game is built with `--profile`. */
const profile = { frames: 0, step: 0, input: 0, hud: 0, max: 0 };
const isProfiling = !!(getManifest() as any).profile;
const syncProfile = { time: 0, created: 0, updated: 0, removed: 0, structural: 0 };
if (isProfiling) {
  const sync = S.SceneBinding.prototype.sync;
  S.SceneBinding.prototype.sync = function (this: any) {
    const structural = this.changes && this.changes.structure;
    const t = performance.now();
    const stats = sync.call(this);
    syncProfile.time += performance.now() - t;
    syncProfile.created += stats.created;
    syncProfile.updated += stats.updated;
    syncProfile.removed += stats.removed;
    if (structural) syncProfile.structural++;
    return stats;
  };
}

const logError = (context: string, error: any) => {
  const message = context + ': ' + (error && error.message ? error.message : String(error));
  if (message === lastError) return;
  lastError = message;
  console.error('[GDJS ThreeRT] ' + message + (error && error.stack ? '\n' + error.stack : ''));
};

/** One step of the GDJS game loop: events, behaviors, then the scene shown in ThreeRT's. */
const stepGame = (elapsedTimeMs: number) => {
  if (!threertState.gameLoop) return;
  try {
    const keepRunning = threertState.gameLoop(elapsedTimeMs);
    if (keepRunning === false) threertState.gameLoop = null;
  } catch (error) {
    logError('Error in the game loop', error);
  }
};

/**
 * Steps run in setup, where the time budget is larger than a frame's (120 s against 50 ms): the first scene is created,
 * and its first steps (which make the physics bodies, the terrains...) run, until steps are fast enough for frames.
 */
const WARM_UP = { maxSteps: 240, maxTimeMs: 60000, fastStepMs: 15, fastStepsInARow: 8 };

/** With `--profile`: 30 steps measured by GDJS's profiler, logged. */
const logGDJSProfile = () => {
  const scene = game.getSceneStack().getCurrentScene();
  if (!scene || !scene.startProfiler) return;
  scene.startProfiler(() => {});
  for (let i = 0; i < 30; i++) {
    gameTimeMs += 1000 / 60;
    stepGame(1000 / 60);
  }
  const profiler = scene._profiler;
  if (!profiler) return;
  const lines: string[] = [];
  gdjs.Profiler.getProfilerSectionTexts('step', profiler.getFramesAverageMeasures(), lines);
  scene.stopProfiler();
  console.info('[GDJS ThreeRT] GDJS profiler, mean of 30 steps:\n  ' + lines.join('\n  '));
};

const startGame = () => {
  const projectData = g.gdjs && gdjs.projectData;
  if (!projectData) throw new Error('The game data (gdjs.projectData) was not found in the bundle.');
  const resolutionWidth = projectData.properties.windowWidth || 1280;
  const resolutionHeight = projectData.properties.windowHeight || 720;
  gameViewport.width = resolutionWidth;
  gameViewport.height = resolutionHeight;

  game = new gdjs.RuntimeGame(projectData, gdjs.runtimeGameOptions || {});
  game.getRenderer().createStandardCanvas(g.document.body);
  game.getRenderer().bindStandardEvents(game.getInputManager(), g, g.document);
  game.loadAllAssets(() => {
    try {
      game.startGameLoop();
      isGameLoopRunning = true;
      const start = performance.now();
      let fastSteps = 0;
      let steps = 0;
      while (steps < WARM_UP.maxSteps && performance.now() - start < WARM_UP.maxTimeMs && fastSteps < WARM_UP.fastStepsInARow) {
        const stepStart = performance.now();
        gameTimeMs += 1000 / 60;
        stepGame(1000 / 60);
        steps++;
        fastSteps = performance.now() - stepStart < WARM_UP.fastStepMs ? fastSteps + 1 : 0;
      }
      console.info(`[GDJS ThreeRT] Game started: ${steps} steps in setup (${(performance.now() - start).toFixed(0)} ms).`);
      if (isProfiling) logGDJSProfile();
    } catch (error) {
      logError('Error while starting the game', error);
    }
    // From now on, timers run with the frames.
    setFlushTimersImmediately(false);
  });
};

export default defineGame({
  state: {},
  handlers: {},
  pointer: getManifest().pointer || 'free',
  setup() {
    const view = new ThreeRTView();
    threertState.view = view;
    try {
      startGame();
    } catch (error) {
      logError('Error while creating the game', error);
    }
    return { scene: view.scene, camera: view.camera };
  },
  frame(f: any) {
    if (!game) return;
    const elapsedTimeMs = Math.min(Math.max(f.dt * 1000, 0), 100);
    gameTimeMs += elapsedTimeMs;
    runTimers(gameTimeMs);
    if (!isGameLoopRunning || f.dt <= 0) return;
    const t0 = performance.now();
    try {
      applyInput(game, f.input);
    } catch (error) {
      logError('Error while reading the input', error);
    }
    const t1 = performance.now();
    stepGame(elapsedTimeMs);
    runAnimationFrames(gameTimeMs);
    const t2 = performance.now();
    try {
      updateHud(game, hud);
    } catch (error) {
      logError('Error while updating the HUD', error);
    }
    if (isProfiling) {
      const t3 = performance.now();
      profile.frames++;
      profile.input += t1 - t0;
      profile.step += t2 - t1;
      profile.hud += t3 - t2;
      profile.max = Math.max(profile.max, t3 - t0);
      if (profile.frames === 20) {
        const ms = (v: number) => (v / profile.frames).toFixed(1);
        console.info(`[GDJS ThreeRT] frame script, mean over ${profile.frames} frames: step ${ms(profile.step)} ms, input ${ms(profile.input)} ms, HUD ${ms(profile.hud)} ms (max ${profile.max.toFixed(1)} ms)`);
        console.info(`[GDJS ThreeRT] scene sync, mean: ${ms(syncProfile.time)} ms, ${ms(syncProfile.created)} created, ${ms(syncProfile.updated)} updated, ${ms(syncProfile.removed)} removed, ${syncProfile.structural} structural syncs`);
        Object.assign(profile, { frames: 0, step: 0, input: 0, hud: 0, max: 0 });
        Object.assign(syncProfile, { time: 0, created: 0, updated: 0, removed: 0, structural: 0 });
      }
    }
  },
} as any);
