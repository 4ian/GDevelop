describe('gdjs.PlatformerObjectRuntimeBehavior', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame, null);
	runtimeScene.loadFromScene({
		layers: [{name: "", visibility: true}],
		variables: [],
		behaviorsSharedData: [],
		objects: [],
		instances: []
	});
	runtimeScene._timeManager.getElapsedTime = function() { return 1 / 60 * 1000; };

	//Put a platformer object in the air.
	var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [{
		type: "PlatformBehavior::PlatformerObjectBehavior",
		name: "auto1",
		gravity: 900,
		maxFallingSpeed: 1500,
		acceleration: 500,
		deceleration: 1500,
		maxSpeed: 500,
		jumpSpeed: 1500,
		canGrabPlatforms: true,
		ignoreDefaultControls: true,
		slopeMaxAngle: 60
	}]});
	object.getWidth = function() { return 10; };
	object.getHeight = function() { return 20; };
	runtimeScene.addObject(object);
	object.setPosition(0, -100);

	//Put a platform
	var platform = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [{
		type: "PlatformBehavior::PlatformBehavior",
		canBeGrabbed: true,
	}]});
	platform.getWidth = function() { return 60; };
	platform.getHeight = function() { return 32; };
	runtimeScene.addObject(platform);
	platform.setPosition(0, -10);

	it('can fall when in the air', function() {
		for(var i = 0; i<30; ++i) {
			runtimeScene.renderAndStep();
			if (i < 10) expect(object.getBehavior("auto1").isFalling()).to.be(true);
		}

		//Check the platform stopped the platformer object.
		expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
		expect(object.getBehavior("auto1").isFalling()).to.be(false);
		expect(object.getBehavior("auto1").isMoving()).to.be(false);

		for(var i = 0; i<35; ++i) { //Check that the platformer object can fall.
			object.getBehavior("auto1").simulateRightKey();
			runtimeScene.renderAndStep();
		}
		expect(object.getX()).to.be.within(87.50, 87.51);
		expect(object.getY()).to.be(-24.75);
		expect(object.getBehavior("auto1").isFalling()).to.be(true);

		for(var i = 0; i<100; ++i) { //Let the speed on X axis go back to 0.
			runtimeScene.renderAndStep();
		}
	});

	it('can grab, and release, a platform', function() {
		//Put the object near the right ledge of the platform.
		object.setPosition(platform.getX() + platform.getWidth() + 2, platform.getY() - 10);

		for(var i = 0; i<35; ++i) {
			object.getBehavior("auto1").simulateLeftKey();
			runtimeScene.renderAndStep();
		}

		//Check that the object grabbed the platform
		expect(object.getX()).to.be.within(
			platform.getX() + platform.getWidth() + 1,
			platform.getX() + platform.getWidth() + 2
		);
		expect(object.getY()).to.be(platform.getY());

		object.getBehavior("auto1").simulateReleaseKey();
		for(var i = 0; i<10; ++i) {
			runtimeScene.renderAndStep();
		}

		//Check that the object is falling
		expect(object.getY()).to.be(1.25);
	});

	it('can track object height changes', function() {
		//Put the object near the right ledge of the platform.
		object.setPosition(platform.getX() + 10, platform.getY() - object.getHeight() - 1);

		for(var i = 0; i<15; ++i) {
			runtimeScene.renderAndStep();
		}

		expect(object.getBehavior("auto1").isFalling()).to.be(false);
		expect(object.getX()).to.be(10);
		expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)

		object.getHeight = function() { return 9; }
		runtimeScene.renderAndStep();
		expect(object.getBehavior("auto1").isFalling()).to.be(false);
		expect(object.getY()).to.be(-19); // -19 = -10 (platform y) + -9 (object height)

		for(var i = 0; i<10; ++i) {
			object.getBehavior("auto1").simulateRightKey();
			runtimeScene.renderAndStep();
			expect(object.getBehavior("auto1").isFalling()).to.be(false);
		}
		expect(object.getY()).to.be(-19);
		expect(object.getX()).to.be.within(17.638, 17.639);

		object.getHeight = function() { return 20; }
		runtimeScene.renderAndStep();
		expect(object.getY()).to.be(-30); // -30 = -10 (platform y) + -20 (object height)
	});
});

describe('gdjs.PlatformerObjectRuntimeBehavior, rounded coordinates (moving platforms)', function() {
	var runtimeGame = new gdjs.RuntimeGame({variables: [], properties: {windowWidth: 800, windowHeight: 600}});
	var runtimeScene = new gdjs.RuntimeScene(runtimeGame, null);
	runtimeScene.loadFromScene({
		layers: [{name: "", visibility: true}],
		variables: [],
		behaviorsSharedData: [],
		objects: [],
		instances: []
	});
	runtimeScene._timeManager.getElapsedTime = function() { return 1 / 60 * 1000; };

	//Put a platformer object on a platform.
	var object = new gdjs.RuntimeObject(runtimeScene, {name: "obj1", type: "", behaviors: [{
		type: "PlatformBehavior::PlatformerObjectBehavior",
		name: "auto1",
		roundCoordinates: true,
		gravity: 900,
		maxFallingSpeed: 1500,
		acceleration: 500,
		deceleration: 1500,
		maxSpeed: 500,
		jumpSpeed: 1500,
		canGrabPlatforms: true,
		ignoreDefaultControls: true,
		slopeMaxAngle: 60
	}]});
	object.getWidth = function() { return 10; };
	object.getHeight = function() { return 20; };
	runtimeScene.addObject(object);
	object.setPosition(0, -30);

	//Put a platform
	var platform = new gdjs.RuntimeObject(runtimeScene, {name: "obj2", type: "", behaviors: [{
		type: "PlatformBehavior::PlatformBehavior",
		canBeGrabbed: true,
	}]});
	platform.getWidth = function() { return 60; };
	platform.getHeight = function() { return 32; };
	runtimeScene.addObject(platform);
	platform.setPosition(0, -10);

	it('follows the platform', function() {
		for(var i = 0; i<30; ++i) {
			runtimeScene.renderAndStep();
		}

		// Check the object has not moved.
		expect(object.getY()).to.be(-30);
		expect(object.getX()).to.be(0);
		expect(object.getBehavior("auto1").isOnFloor()).to.be(true);
		expect(object.getBehavior("auto1").isFalling()).to.be(false);
		expect(object.getBehavior("auto1").isMoving()).to.be(false);

		// Check that the object follow the platform, even if the
		// movement is less than one pixel.
		platform.setX(platform.getX()+0.12);
		runtimeScene.renderAndStep();
		platform.setX(platform.getX()+0.12);
		runtimeScene.renderAndStep();
		platform.setX(platform.getX()+0.12);
		runtimeScene.renderAndStep();

		expect(object.getX()).to.be(0.36);
	});
});
