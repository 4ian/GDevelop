/**
 * Tests for gdjs.SceneStack.
 */
describe('gdjs.SceneStack', function() {
	var runtimeGame = new gdjs.RuntimeGame({
		variables: [],
		properties: {windowWidth: 800, windowHeight: 600},
		layouts: [{
			name: "Scene 1",
			objects: [],
			layers: [],
			instances: [],
			behaviorsSharedData: [],
		}, {
			name: "Scene 2",
			objects: [],
			layers: [],
			instances: [],
			behaviorsSharedData: [],
		}]});
	var sceneStack = new gdjs.SceneStack(runtimeGame);

	it('should support pushing, replacing and popping scenes', function(){
		expect(sceneStack.pop()).to.be(null);
		sceneStack.push("Scene 1");
		var scene2 = sceneStack.push("Scene 2");
		var scene3 = sceneStack.push("Scene 1");
		var scene4 = sceneStack.replace("Scene 1");
		expect(sceneStack.pop()).to.be(scene4);
		expect(sceneStack.pop()).to.be(scene2);

		var scene5 = sceneStack.replace("Scene 2", true);
		expect(sceneStack.pop()).to.be(null);
	});
});
