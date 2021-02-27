/**
 * Common tests for gdjs game engine.
 * See README.md for more information.
 */

describe('gdjs.RuntimeObject', function() {
	var runtimeScene = new gdjs.RuntimeScene(null);

	it('should compute distances properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.setPosition(15, 20);

		expect(object.getSqDistanceToPosition(-110, 200)).to.be(48025);
	});

	it('should compute angles properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.setPosition(15, 20);

		expect(object.getAngleToPosition(-110, 200)).to.be(124.77783136636388);
	});

	it('should compute AABB properly', function(){
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: []});
		object.getWidth = function() { return 10; };
		object.getHeight = function() { return 20; };

		expect(object.getAABB()).to.eql({
			min: [0,0],
			max: [10,20]
		});

		object.setPosition(15, 20);
		expect(object.getAABB()).to.eql({
			min: [15,20],
			max: [25,40]
		});

		object.setAngle(90);
		expect(object.getAABB()).to.eql({
			min: [10,25],
			max: [30,35]
		});

		object.setAngle(0);
		object.getCenterX = function() { return 0 };
		object.getCenterY = function() { return 0 };
		expect(object.getAABB()).to.eql({
			min: [15,20],
			max: [25,40]
		});

		object.setPosition(15, 20);
		object.setAngle(90);
		expect(object.getAABB()).to.eql({
			min: [-5,20],
			max: [15,30]
		});
	});
});
