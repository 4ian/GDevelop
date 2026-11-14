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
import { defineGame, hud } from '@threert/gameplay';
import { installBrowserShims, runAnimationFrames, runTimers, setFlushTimersImmediately, gameViewport } from './browser';
import { installThree } from './three';
import { installAudio } from './audio';
import { installGDJSPatches, installPreGDJS, threertState, getJoltModule } from './gdjs-patches';
import { ThreeRTView } from './view';
import { applyInput } from './input';
import { updateHud } from './hud';
import { getManifest } from './manifest';

declare const gdjs: any;
const g = globalThis as any;

installBrowserShims();
installAudio();
installPreGDJS();
g.__GDJS_THREERT__ = { installThree, installGDJSPatches, getJoltModule };

let game: any = null;
let gameTimeMs = 0;
let isGameLoopRunning = false;
let lastError = '';

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

/** The number of steps run in setup, so that the first scene is created (and its first events run) before frames. */
const STEPS_IN_SETUP = 2;

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
      for (let i = 0; i < STEPS_IN_SETUP; i++) {
        gameTimeMs += 1000 / 60;
        stepGame(1000 / 60);
      }
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
    try {
      applyInput(game, f.input);
    } catch (error) {
      logError('Error while reading the input', error);
    }
    stepGame(elapsedTimeMs);
    runAnimationFrames(gameTimeMs);
    try {
      updateHud(game, hud);
    } catch (error) {
      logError('Error while updating the HUD', error);
    }
  },
} as any);
