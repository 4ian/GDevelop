// @ts-check

/**
 * Tests for gdjs.SceneStack.
 */
describe('gdjs.SceneStack', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    // @ts-expect-error ts-migrate(2740) FIXME: Type '{ windowWidth: number; windowHeight: number;... Remove this comment to see the full error message
    properties: { windowWidth: 800, windowHeight: 600 },
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
      },
    ],
    resources: { resources: [] }
  });
  var sceneStack = runtimeGame._sceneStack;

  it('should support pushing, replacing and popping scenes', function() {
    // Set up some global callbacks
    var firstLoadedScene = null;
    var lastLoadedScene = null;
    var lastUnloadedScene = null;
    var lastPausedScene = null;
    var lastResumedScene = null;

    gdjs.registerFirstRuntimeSceneLoadedCallback(function(runtimeScene) {
      firstLoadedScene = runtimeScene;
    });
    gdjs.registerRuntimeSceneLoadedCallback(function(runtimeScene) {
      lastLoadedScene = runtimeScene;
    });
    gdjs.registerRuntimeSceneUnloadedCallback(function(runtimeScene) {
      lastUnloadedScene = runtimeScene;
    });
    gdjs.registerRuntimeScenePausedCallback(function(runtimeScene) {
      lastPausedScene = runtimeScene;
    });
    gdjs.registerRuntimeSceneResumedCallback(function(runtimeScene) {
      lastResumedScene = runtimeScene;
    });

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
    gdjs.clearGlobalCallbacks();
  });
});
