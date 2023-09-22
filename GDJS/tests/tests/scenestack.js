// @ts-check

/**
 * Tests for gdjs.SceneStack.
 */
describe('gdjs.SceneStack', function () {
  const runtimeGame = gdjs.getPixiRuntimeGame({
    layouts: [
      {
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene2',
        name: 'Scene 1',
        objects: [],
        layers: [],
        instances: [],
        behaviorsSharedData: [],
        stopSoundsOnStartup: false,
        title: '',
        variables: [],
        usedResources: [],
      },
      {
        r: 0,
        v: 0,
        b: 0,
        mangledName: 'Scene2',
        name: 'Scene 2',
        objects: [],
        layers: [],
        instances: [],
        behaviorsSharedData: [],
        stopSoundsOnStartup: false,
        title: '',
        variables: [],
        usedResources: [],
      },
    ],
  });
  var sceneStack = runtimeGame._sceneStack;
  runtimeGame.loadAllAssets();

  it('should support pushing, replacing and popping scenes', function () {
    // Set up some scene callbacks.
    let firstLoadedScene = null;
    let lastLoadedScene = null;
    let lastUnloadedScene = null;
    let lastPausedScene = null;
    let lastResumedScene = null;

    const onFirstRuntimeSceneLoaded = (runtimeScene) => {
      firstLoadedScene = runtimeScene;
    };
    const onRuntimeSceneLoaded = (runtimeScene) => {
      lastLoadedScene = runtimeScene;
    };
    const onRuntimeSceneUnloaded = (runtimeScene) => {
      lastUnloadedScene = runtimeScene;
    };
    const onRuntimeScenePaused = (runtimeScene) => {
      lastPausedScene = runtimeScene;
    };
    const onRuntimeSceneResumed = (runtimeScene) => {
      lastResumedScene = runtimeScene;
    };

    gdjs.registerFirstRuntimeSceneLoadedCallback(onFirstRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneLoadedCallback(onRuntimeSceneLoaded);
    gdjs.registerRuntimeSceneUnloadedCallback(onRuntimeSceneUnloaded);
    gdjs.registerRuntimeScenePausedCallback(onRuntimeScenePaused);
    gdjs.registerRuntimeSceneResumedCallback(onRuntimeSceneResumed);

    // Test the stack
    expect(sceneStack.pop()).to.be(null);
    expect(lastLoadedScene).to.be(null);
    expect(firstLoadedScene).to.be(null);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(false);

    var scene1 = sceneStack.push('Scene 1');
    expect(lastLoadedScene).to.be(scene1);
    expect(firstLoadedScene).to.be(scene1);
    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);

    var scene2 = sceneStack.push('Scene 2');
    expect(lastPausedScene).to.be(scene1);
    expect(lastLoadedScene).to.be(scene2);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    var scene3 = sceneStack.push('Scene 1');
    expect(lastPausedScene).to.be(scene2);
    expect(lastLoadedScene).to.be(scene3);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    var scene4 = sceneStack.replace('Scene 1');
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastUnloadedScene).to.be(scene3);
    expect(lastLoadedScene).to.be(scene4);
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(scene4);
    expect(lastUnloadedScene).to.be(scene4);
    expect(lastResumedScene).to.be(scene2);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(scene2);
    expect(lastUnloadedScene).to.be(scene2);
    expect(lastResumedScene).to.be(scene1);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    var scene5 = sceneStack.replace('Scene 2', true);
    expect(lastLoadedScene).to.be(scene5);
    expect(lastUnloadedScene).to.be(scene1);
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastResumedScene).to.be(scene1); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.pop()).to.be(null);
    expect(lastLoadedScene).to.be(scene5); // Not changed
    expect(lastUnloadedScene).to.be(scene1); // Not changed
    expect(lastPausedScene).to.be(scene2); // Not changed
    expect(lastResumedScene).to.be(scene1); // Not changed
    expect(firstLoadedScene).to.be(scene1); // Not changed

    expect(sceneStack.wasFirstSceneLoaded()).to.be(true);

    // Remove all the global callbacks
    gdjs._unregisterCallback(onFirstRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneLoaded);
    gdjs._unregisterCallback(onRuntimeSceneUnloaded);
    gdjs._unregisterCallback(onRuntimeScenePaused);
    gdjs._unregisterCallback(onRuntimeSceneResumed);
  });
});
