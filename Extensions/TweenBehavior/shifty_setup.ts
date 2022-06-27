// Callbacks called to pause/resume Shifty scene when a gdjs.RuntimeScene
// is paused/resumed
namespace gdjs {
  export interface RuntimeScene {
    shiftyJsScene: shifty.Scene;
  }
}

let currentTweenTime: number = 0;

/**
 * Stop and "destroy" all the tweens when a scene is unloaded.
 */
gdjs.registerRuntimeSceneUnloadedCallback(function (runtimeScene) {
  const shiftyJsScene = runtimeScene.shiftyJsScene;
  if (!shiftyJsScene) return;

  // Stop and explicitly remove all tweenables to be sure to drop
  // all references to the tweenables of the scene.
  shiftyJsScene.stop(false);
  shiftyJsScene.empty();
});

/**
 * When a scene is paused, pause all the tweens of this scene.
 */
gdjs.registerRuntimeScenePausedCallback(function (runtimeScene) {
  const shiftyJsScene = runtimeScene.shiftyJsScene;
  if (shiftyJsScene) shiftyJsScene.pause();
});

/**
 * When a scene is paused, resume all the tweens of this scene.
 */
gdjs.registerRuntimeSceneResumedCallback(function (runtimeScene) {
  const shiftyJsScene = runtimeScene.shiftyJsScene;
  if (!shiftyJsScene) return;

  // It is important to set immediately the current Shifty time back to the
  // time of the scene, as the call `resume` will process the tweens.
  // (If not done, tweens will be resumed with the time of the previous
  // scene, that could create weird result/make tweens act as if not paused).
  currentTweenTime = runtimeScene.getTimeManager().getTimeFromStart();

  // Note that per the invariant of shiftyJsScene, shiftyJsScene will only
  // contains tweenables that should be playing (so calling resume is safe).
  shiftyJsScene.resume();
});

// Handle Shifty.js updates (the time and the "tick" of tweens
// is controlled by the behavior)
gdjs.registerRuntimeScenePreEventsCallback(function (runtimeScene) {
  currentTweenTime = runtimeScene.getTimeManager().getTimeFromStart();
  shifty.processTweens();
});

// Set up Shifty.js so that the processing ("tick"/updates) is handled
// by the behavior, once per frame. See above.
shifty.Tweenable.setScheduleFunction(function () {
  /* Do nothing, we'll call processTweens manually. */
});

// Set up Shifty.js so that the time is handled by the behavior.
// It will be set to be the time of the current scene, and should be updated
// before any tween processing (processTweens, resume).
shifty.Tweenable.now = function () {
  return currentTweenTime;
};
