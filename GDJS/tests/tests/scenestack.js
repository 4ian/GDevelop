/**
 * Tests for gdjs.SceneStack.
 */
describe('gdjs.SceneStack', function() {
  var runtimeGame = new gdjs.RuntimeGame({
    variables: [],
    properties: { windowWidth: 800, windowHeight: 600 },
    layouts: [
      {
        name: 'Scene 1',
        objects: [],
        layers: [],
        instances: [],
        behaviorsSharedData: [],
      },
      {
        name: 'Scene 2',
        objects: [],
        layers: [],
        instances: [],
        behaviorsSharedData: [],
      },
    ],
  });
  var sceneStack = new gdjs.SceneStack(runtimeGame);

  it('should support pushing, replacing and popping scenes', function() {
    // Set up some global callbacks
    var lastLoadedScene = null;
    var lastUnloadedScene = null;
    var lastPausedScene = null;
    var lastResumedScene = null;
    gdjs.callbackAssertions = {
      gdjsCallbackRuntimeSceneLoaded: function(runtimeScene) {
        lastLoadedScene = runtimeScene;
      },
      gdjsCallbackRuntimeSceneUnloaded: function(runtimeScene) {
        lastUnloadedScene = runtimeScene;
      },
      gdjsCallbackRuntimeScenePaused: function(runtimeScene) {
        lastPausedScene = runtimeScene;
      },
      gdjsCallbackRuntimeSceneResumed: function(runtimeScene) {
        lastResumedScene = runtimeScene;
      },
    };
    gdjs.registerGlobalCallbacks();

    // Test the stack
	expect(sceneStack.pop()).to.be(null);

    var scene1 = sceneStack.push('Scene 1');
	expect(lastLoadedScene).to.be(scene1);

	var scene2 = sceneStack.push('Scene 2');
	expect(lastPausedScene).to.be(scene1);
	expect(lastLoadedScene).to.be(scene2);

    var scene3 = sceneStack.push('Scene 1');
	expect(lastPausedScene).to.be(scene2);
	expect(lastLoadedScene).to.be(scene3);

	var scene4 = sceneStack.replace('Scene 1');
	expect(lastPausedScene).to.be(scene2); // Not changed
	expect(lastUnloadedScene).to.be(scene3);
	expect(lastLoadedScene).to.be(scene4);

    expect(sceneStack.pop()).to.be(scene4);
	expect(lastUnloadedScene).to.be(scene4);
	expect(lastResumedScene).to.be(scene2);
	expect(lastPausedScene).to.be(scene2); // Not changed

    expect(sceneStack.pop()).to.be(scene2);
	expect(lastUnloadedScene).to.be(scene2);
	expect(lastResumedScene).to.be(scene1);
	expect(lastPausedScene).to.be(scene2); // Not changed

	var scene5 = sceneStack.replace('Scene 2', true);
	expect(lastLoadedScene).to.be(scene5);
	expect(lastUnloadedScene).to.be(scene1);
	expect(lastPausedScene).to.be(scene2); // Not changed
	expect(lastResumedScene).to.be(scene1); // Not changed

	expect(sceneStack.pop()).to.be(null);
	expect(lastLoadedScene).to.be(scene5); // Not changed
	expect(lastUnloadedScene).to.be(scene1); // Not changed
	expect(lastPausedScene).to.be(scene2); // Not changed
	expect(lastResumedScene).to.be(scene1); // Not changed

    // Remove all the global callbacks
    delete gdjs.callbackAssertions;
    gdjs.registerGlobalCallbacks();
  });
});
