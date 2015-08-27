describe('gdjs.PlatformerObjectRuntimeBehavior', function() {

	it('test', function(){
		var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
		var runtimeScene = new gdjs.RuntimeScene(runtimeGame, null);
		runtimeScene.loadFromScene({
			layers: [{name: "", visibility: true}],
			variables: [],
			behaviorsSharedData: [],
			objects: [],
			instances: []
		});
		runtimeScene.getElapsedTime = function() { return 1 / 60 * 1000; };

		//Put a platformer object in the air.
		var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [{
			type: "PlatformBehavior::PlatformerObjectBehavior",
			name: "auto1",
			gravity: 900,
			maxFallingSpeed: 1500,
			acceleration: 500,
			deceleration: 500,
			maxSpeed: 500,
			jumpSpeed: 1500,
			ignoreDefaultControls: true,
			slopeMaxAngle: 60
		}]});
		runtimeScene.addObject(object);
		object.setPosition(0, -100);

		//Put a platform
		var object2 = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [{type: "PlatformBehavior::PlatformBehavior"}]});
		object2.getWidth = function() { return 60; };
		object2.getHeight = function() { return 32; };
		runtimeScene.addObject(object2);
		object2.setPosition(0, -10);


		for(var i = 0; i<30; ++i) {
			runtimeScene.renderAndStep();
		}

		//Check the platform stopped the platformer object.
		expect(object.getY()).to.be(-11);

		for(var i = 0; i<35; ++i) { //Check that the platformer object can fall.
			object.getBehavior("auto1").simulateRightKey();
			runtimeScene.renderAndStep();
		}
		expect(object.getX()).to.be.within(87.50, 87.51);
		expect(object.getY()).to.be(-5.75);

	});
});
