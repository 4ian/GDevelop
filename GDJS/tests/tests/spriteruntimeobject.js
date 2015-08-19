/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.SpriteRuntimeObject', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame, null);

	it('should handle scaling properly', function(){
		var object = new gdjs.SpriteRuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});

		expect(object.getScaleX()).to.be(1);
		object.flipX(true);
		expect(object.getScaleX()).to.be(1);
		object.setScaleX(0.42);
		expect(object.getScaleX()).to.be(0.42);
		expect(object.isFlippedX()).to.be(true);
		object.flipX(false);
		expect(object.isFlippedX()).to.be(false);
		expect(object.getScaleX()).to.be(0.42);
	});
});
