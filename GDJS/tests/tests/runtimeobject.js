/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.runtimeObject', function() {
	var runtimeScene = new gdjs.RuntimeScene(null, null);

	it('should compute distances properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.setPosition(15, 20);

		expect(object.getSqDistanceTo(-110, 200)).to.be(48025);
	});
});
